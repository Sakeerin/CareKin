"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireUser, requireWorkspace } from "@/lib/auth/session";
import { confirmTaskSchema } from "@/lib/schemas/care-tasks";
import type { ActionResult } from "@/lib/actions/auth";
import { logAuditEvent } from "@/lib/actions/audit";
import type {
  TaskEvent,
  TodayStatusSummary,
  CareAlert,
  NotificationLog,
} from "@/lib/types/care-tasks";
import {
  generateTaskEventsForWorkspace,
  getDateInTimezone,
  DEFAULT_TIMEZONE,
  enqueueRemindersForPendingEvents,
} from "@/lib/services/task-events";

export async function confirmTaskEventAction(
  taskEventId: string,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const user = await requireUser();
  const { workspace } = await requireWorkspace();

  const parsed = confirmTaskSchema.safeParse({
    action: formData.get("action"),
    skipReason: formData.get("skipReason"),
    note: formData.get("note"),
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
  }

  const supabase = await createClient();
  const now = new Date().toISOString();

  const updates: Record<string, unknown> = {
    completed_by: user.id,
    note: parsed.data.note || null,
  };

  if (parsed.data.action === "completed") {
    updates.status = "completed";
    updates.completed_at = now;
  } else if (parsed.data.action === "skipped") {
    updates.status = "skipped";
    updates.skip_reason = parsed.data.skipReason || "ไม่ระบุ";
    updates.completed_at = now;
  } else {
    updates.status = "missed";
    updates.missed_at = now;
  }

  const { data: event, error } = await supabase
    .from("task_events")
    .update(updates)
    .eq("id", taskEventId)
    .eq("status", "pending")
    .select("elder_id, title")
    .single();

  if (error || !event) {
    return { error: "ไม่พบงานหรืองานถูกยืนยันแล้ว" };
  }

  await supabase
    .from("reminder_queue")
    .update({ status: "cancelled" })
    .eq("task_event_id", taskEventId);

  await logAuditEvent({
    workspaceId: workspace.id,
    action: `task_event.${parsed.data.action}`,
    resourceType: "task_event",
    resourceId: taskEventId,
    metadata: { title: event.title },
  });

  revalidatePath("/dashboard");
  revalidatePath("/tasks");
  revalidatePath(`/tasks/${taskEventId}`);
  return { success: true };
}

export async function confirmTaskFromQuery(
  taskEventId: string,
  action: "completed" | "missed" | "skipped",
): Promise<void> {
  const user = await requireUser();
  const { workspace } = await requireWorkspace();
  const supabase = await createClient();
  const now = new Date().toISOString();

  const updates: Record<string, unknown> = {
    completed_by: user.id,
    status: action,
  };

  if (action === "completed") updates.completed_at = now;
  if (action === "missed") updates.missed_at = now;
  if (action === "skipped") {
    updates.completed_at = now;
    updates.skip_reason = "จาก LINE";
  }

  await supabase
    .from("task_events")
    .update(updates)
    .eq("id", taskEventId)
    .eq("status", "pending");

  await supabase
    .from("reminder_queue")
    .update({ status: "cancelled" })
    .eq("task_event_id", taskEventId);

  await logAuditEvent({
    workspaceId: workspace.id,
    action: `task_event.${action}`,
    resourceType: "task_event",
    resourceId: taskEventId,
  });

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function getTodayTaskEvents(
  workspaceId: string,
): Promise<TaskEvent[]> {
  const supabase = await createClient();
  const today = getDateInTimezone(new Date(), DEFAULT_TIMEZONE);

  const { data: elders } = await supabase
    .from("elders")
    .select("id")
    .eq("workspace_id", workspaceId);

  const elderIds = (elders ?? []).map((e) => e.id);
  if (elderIds.length === 0) return [];

  const { data, error } = await supabase
    .from("task_events")
    .select("*, elders(full_name, nickname, workspace_id)")
    .in("elder_id", elderIds)
    .eq("event_date", today)
    .order("due_at");

  if (error) throw error;
  return (data ?? []) as TaskEvent[];
}

export async function getTaskEvent(taskEventId: string): Promise<TaskEvent | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("task_events")
    .select("*, elders(full_name, nickname, workspace_id)")
    .eq("id", taskEventId)
    .single();

  if (error) return null;
  return data as TaskEvent;
}

export async function getTodayStatusSummary(
  workspaceId: string,
): Promise<TodayStatusSummary> {
  const events = await getTodayTaskEvents(workspaceId);
  return {
    total: events.length,
    completed: events.filter((e) => e.status === "completed").length,
    pending: events.filter((e) => e.status === "pending").length,
    missed: events.filter((e) => e.status === "missed").length,
    skipped: events.filter((e) => e.status === "skipped").length,
  };
}

export async function getOpenAlerts(workspaceId: string): Promise<CareAlert[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("care_alerts")
    .select("*, elders(full_name, nickname)")
    .eq("workspace_id", workspaceId)
    .eq("status", "open")
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) throw error;
  return (data ?? []) as CareAlert[];
}

export async function acknowledgeAlertAction(alertId: string): Promise<void> {
  const user = await requireUser();
  const { workspace } = await requireWorkspace();
  const supabase = await createClient();

  await supabase
    .from("care_alerts")
    .update({
      status: "acknowledged",
      acknowledged_by: user.id,
      acknowledged_at: new Date().toISOString(),
    })
    .eq("id", alertId)
    .eq("workspace_id", workspace.id);

  revalidatePath("/dashboard");
  revalidatePath("/notifications");
}

export async function getNotificationLogs(
  workspaceId: string,
  limit = 50,
): Promise<NotificationLog[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("notification_logs")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as NotificationLog[];
}

export async function syncTodayTasksForWorkspace(): Promise<void> {
  const { workspace } = await requireWorkspace();
  const supabase = await createClient();
  await generateTaskEventsForWorkspace(supabase, workspace.id);
  await enqueueRemindersForPendingEvents(supabase, workspace.id);
  revalidatePath("/dashboard");
}
