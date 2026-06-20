import type { SupabaseClient } from "@supabase/supabase-js";
import { sendLinePushMessage, isLineConfigured } from "@/lib/line/messaging";
import { MISSED_GRACE_MINUTES } from "@/lib/services/task-events";

export async function processReminderQueue(
  supabase: SupabaseClient,
): Promise<{ sent: number; failed: number; missed: number; escalated: number }> {
  let sent = 0;
  let failed = 0;
  let missed = 0;
  let escalated = 0;

  const now = new Date();

  const { data: queueItems } = await supabase
    .from("reminder_queue")
    .select(
      "*, task_events(*, elders(full_name, nickname, line_user_id, workspace_id, reminder_channel))",
    )
    .eq("status", "queued")
    .lte("scheduled_at", now.toISOString())
    .limit(50);

  for (const item of queueItems ?? []) {
    const event = item.task_events as {
      id: string;
      title: string;
      instruction: string | null;
      due_at: string;
      status: string;
      elders: {
        full_name: string;
        nickname: string | null;
        line_user_id: string | null;
        workspace_id: string;
        reminder_channel: string;
      };
    } | null;

    if (!event || event.status !== "pending") {
      await supabase
        .from("reminder_queue")
        .update({ status: "cancelled" })
        .eq("id", item.id);
      continue;
    }

    const elder = event.elders;
    const elderId = (item.task_events as { elder_id: string }).elder_id;
    const message = buildReminderMessage(event.title, event.instruction, event.due_at);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const confirmUrl = `${appUrl}/tasks/${event.id}`;

    try {
      if (item.channel === "line" && elder.line_user_id && isLineConfigured()) {
        await sendLinePushMessage(elder.line_user_id, message, confirmUrl);
        await logNotification(supabase, {
          workspaceId: elder.workspace_id,
          elderId,
          taskEventId: event.id,
          channel: "line",
          type: "reminder",
          recipient: elder.line_user_id,
          message,
        });
      } else if (item.channel === "web") {
        await logNotification(supabase, {
          workspaceId: elder.workspace_id,
          elderId,
          taskEventId: event.id,
          channel: "web",
          type: "reminder",
          recipient: null,
          message,
        });
      }

      await supabase
        .from("reminder_queue")
        .update({ status: "sent", sent_at: now.toISOString(), attempts: item.attempts + 1 })
        .eq("id", item.id);
      sent += 1;
    } catch (err) {
      await supabase
        .from("reminder_queue")
        .update({
          status: "failed",
          attempts: item.attempts + 1,
          last_error: err instanceof Error ? err.message : "Unknown error",
        })
        .eq("id", item.id);
      failed += 1;
    }
  }

  const missedCutoff = new Date(now.getTime() - MISSED_GRACE_MINUTES * 60 * 1000);

  const { data: overdueEvents } = await supabase
    .from("task_events")
    .select("*, elders(full_name, nickname, workspace_id)")
    .eq("status", "pending")
    .lt("due_at", missedCutoff.toISOString());

  for (const event of overdueEvents ?? []) {
    const { error } = await supabase
      .from("task_events")
      .update({ status: "missed", missed_at: now.toISOString() })
      .eq("id", event.id)
      .eq("status", "pending");

    if (!error) {
      missed += 1;
      const elder = event.elders as {
        full_name: string;
        nickname: string | null;
        workspace_id: string;
      };

      const didEscalate = await escalateMissedTask(supabase, {
        workspaceId: elder.workspace_id,
        elderId: event.elder_id,
        taskEventId: event.id,
        elderName: elder.nickname ?? elder.full_name,
        taskTitle: event.title,
      });
      if (didEscalate) escalated += 1;
    }
  }

  return { sent, failed, missed, escalated };
}

async function escalateMissedTask(
  supabase: SupabaseClient,
  params: {
    workspaceId: string;
    elderId: string;
    taskEventId: string;
    elderName: string;
    taskTitle: string;
  },
): Promise<boolean> {
  const { data: existing } = await supabase
    .from("care_alerts")
    .select("id")
    .eq("task_event_id", params.taskEventId)
    .eq("alert_type", "missed_task")
    .maybeSingle();

  if (existing) return false;

  const message = `${params.elderName} ยังไม่ได้ยืนยัน: ${params.taskTitle}`;

  const { error } = await supabase.from("care_alerts").insert({
    workspace_id: params.workspaceId,
    elder_id: params.elderId,
    task_event_id: params.taskEventId,
    alert_type: "missed_task",
    severity: "family",
    title: "งานที่พลาด",
    message,
    status: "open",
  });

  if (error) return false;

  await logNotification(supabase, {
    workspaceId: params.workspaceId,
    elderId: params.elderId,
    taskEventId: params.taskEventId,
    channel: "web",
    type: "escalation",
    recipient: null,
    message,
  });

  const { data: admins } = await supabase
    .from("workspace_members")
    .select("profiles(email)")
    .eq("workspace_id", params.workspaceId)
    .in("role", ["owner", "family_admin"])
    .eq("status", "active");

  for (const admin of admins ?? []) {
    const profile = Array.isArray(admin.profiles)
      ? admin.profiles[0]
      : admin.profiles;
    const email = profile?.email as string | undefined;
    if (email) {
      await logNotification(supabase, {
        workspaceId: params.workspaceId,
        elderId: params.elderId,
        taskEventId: params.taskEventId,
        channel: "web",
        type: "family_alert",
        recipient: email,
        message,
      });
    }
  }

  return true;
}

async function logNotification(
  supabase: SupabaseClient,
  params: {
    workspaceId: string;
    elderId: string;
    taskEventId: string;
    channel: "web" | "line" | "both";
    type: string;
    recipient: string | null;
    message: string;
  },
) {
  await supabase.from("notification_logs").insert({
    workspace_id: params.workspaceId,
    elder_id: params.elderId,
    task_event_id: params.taskEventId,
    channel: params.channel,
    notification_type: params.type,
    status: "sent",
    recipient: params.recipient,
    message: params.message,
  });
}

function buildReminderMessage(
  title: string,
  instruction: string | null,
  dueAt: string,
): string {
  const time = new Date(dueAt).toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Bangkok",
  });
  const parts = [`⏰ ถึงเวลา: ${title}`, `เวลา ${time}`];
  if (instruction) parts.push(instruction);
  parts.push("กรุณากดยืนยันเมื่อทำแล้ว");
  return parts.join("\n");
}
