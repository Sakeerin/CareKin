"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireUser, requireWorkspace, canManageElders } from "@/lib/auth/session";
import { careTaskSchema } from "@/lib/schemas/care-tasks";
import type { ActionResult } from "@/lib/actions/auth";
import { logAuditEvent } from "@/lib/actions/audit";
import type { CareTask } from "@/lib/types/care-tasks";
import { generateTaskEventsForElder } from "@/lib/services/task-events";

export async function createCareTaskAction(
  elderId: string,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const user = await requireUser();
  const { workspace, membership } = await requireWorkspace();

  if (!canManageElders(membership.role)) {
    return { error: "ไม่มีสิทธิ์เพิ่มงาน" };
  }

  const parsed = careTaskSchema.safeParse({
    title: formData.get("title"),
    taskType: formData.get("taskType"),
    instruction: formData.get("instruction"),
    scheduleTime: formData.get("scheduleTime"),
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
  }

  const time = parsed.data.scheduleTime;
  const supabase = await createClient();

  const { data: task, error } = await supabase
    .from("care_tasks")
    .insert({
      elder_id: elderId,
      task_type: parsed.data.taskType,
      title: parsed.data.title,
      instruction: parsed.data.instruction || null,
      schedule_time: time.length === 5 ? `${time}:00` : time,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  await generateTaskEventsForElder(supabase, elderId);

  await logAuditEvent({
    workspaceId: workspace.id,
    action: "care_task.created",
    resourceType: "care_task",
    resourceId: task.id,
    metadata: { title: parsed.data.title },
  });

  revalidatePath(`/elders/${elderId}/routines`);
  revalidatePath("/dashboard");
  redirect(`/elders/${elderId}/routines`);
}

export async function deleteCareTaskAction(
  elderId: string,
  taskId: string,
): Promise<void> {
  const { workspace, membership } = await requireWorkspace();
  if (!canManageElders(membership.role)) {
    throw new Error("ไม่มีสิทธิ์ลบงาน");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("care_tasks")
    .delete()
    .eq("id", taskId)
    .eq("elder_id", elderId);

  if (error) throw new Error(error.message);

  await logAuditEvent({
    workspaceId: workspace.id,
    action: "care_task.deleted",
    resourceType: "care_task",
    resourceId: taskId,
  });

  revalidatePath(`/elders/${elderId}/routines`);
  revalidatePath("/dashboard");
}

export async function getCareTasks(elderId: string): Promise<CareTask[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("care_tasks")
    .select("*")
    .eq("elder_id", elderId)
    .order("schedule_time");

  if (error) throw error;
  return (data ?? []) as CareTask[];
}

export async function updateElderReminderSettingsAction(
  elderId: string,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const { membership } = await requireWorkspace();
  if (!canManageElders(membership.role)) {
    return { error: "ไม่มีสิทธิ์แก้ไขการแจ้งเตือน" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("elders")
    .update({
      line_user_id: (formData.get("lineUserId") as string) || null,
      reminder_channel: formData.get("reminderChannel") as "web" | "line" | "both",
    })
    .eq("id", elderId);

  if (error) return { error: error.message };

  revalidatePath(`/elders/${elderId}`);
  return { success: true };
}
