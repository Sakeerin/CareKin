"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireUser, requireWorkspace, canManageElders } from "@/lib/auth/session";
import { medicationSchema, parseScheduleTimes } from "@/lib/schemas/care-tasks";
import type { ActionResult } from "@/lib/actions/auth";
import { logAuditEvent } from "@/lib/actions/audit";
import type { Medication } from "@/lib/types/care-tasks";
import { generateTaskEventsForElder } from "@/lib/services/task-events";

export async function createMedicationAction(
  elderId: string,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const user = await requireUser();
  const { workspace, membership } = await requireWorkspace();

  if (!canManageElders(membership.role)) {
    return { error: "ไม่มีสิทธิ์เพิ่มยา" };
  }

  const parsed = medicationSchema.safeParse({
    name: formData.get("name"),
    dosageText: formData.get("dosageText"),
    instruction: formData.get("instruction"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
    scheduleTimes: formData.get("scheduleTimes"),
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
  }

  const times = parseScheduleTimes(parsed.data.scheduleTimes);
  if (times.length === 0) {
    return { error: "กรุณาระบุเวลาอย่างน้อย 1 ครั้ง (คั่นด้วย comma)" };
  }

  const supabase = await createClient();
  const { data: med, error } = await supabase
    .from("medications")
    .insert({
      elder_id: elderId,
      name: parsed.data.name,
      dosage_text: parsed.data.dosageText || null,
      instruction: parsed.data.instruction || null,
      start_date: parsed.data.startDate,
      end_date: parsed.data.endDate || null,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  const schedules = times.map((time) => ({
    medication_id: med.id,
    schedule_time: time.length === 5 ? `${time}:00` : time,
  }));

  const { error: schedError } = await supabase
    .from("medication_schedules")
    .insert(schedules);

  if (schedError) return { error: schedError.message };

  await generateTaskEventsForElder(supabase, elderId);

  await logAuditEvent({
    workspaceId: workspace.id,
    action: "medication.created",
    resourceType: "medication",
    resourceId: med.id,
    metadata: { name: parsed.data.name, times },
  });

  revalidatePath(`/elders/${elderId}/medications`);
  revalidatePath("/dashboard");
  redirect(`/elders/${elderId}/medications`);
}

export async function deleteMedicationAction(
  elderId: string,
  medicationId: string,
): Promise<void> {
  const { workspace, membership } = await requireWorkspace();
  if (!canManageElders(membership.role)) {
    throw new Error("ไม่มีสิทธิ์ลบยา");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("medications")
    .delete()
    .eq("id", medicationId)
    .eq("elder_id", elderId);

  if (error) throw new Error(error.message);

  await logAuditEvent({
    workspaceId: workspace.id,
    action: "medication.deleted",
    resourceType: "medication",
    resourceId: medicationId,
  });

  revalidatePath(`/elders/${elderId}/medications`);
  revalidatePath("/dashboard");
}

export async function getMedications(elderId: string): Promise<Medication[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("medications")
    .select("*, medication_schedules(*)")
    .eq("elder_id", elderId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as Medication[];
}
