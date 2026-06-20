import type { SupabaseClient } from "@supabase/supabase-js";

const DEFAULT_TIMEZONE = "Asia/Bangkok";
const MISSED_GRACE_MINUTES = 60;

function getDateInTimezone(date: Date, timezone: string): string {
  return date.toLocaleDateString("en-CA", { timeZone: timezone });
}

function combineDateAndTime(dateStr: string, timeStr: string, timezone: string): Date {
  const [hours, minutes] = timeStr.split(":").map(Number);
  const base = new Date(`${dateStr}T00:00:00`);
  const utc = new Date(
    base.toLocaleString("en-US", { timeZone: timezone }),
  );
  utc.setHours(hours, minutes ?? 0, 0, 0);
  const offset =
    base.getTime() -
    new Date(base.toLocaleString("en-US", { timeZone: timezone })).getTime();
  return new Date(utc.getTime() - offset);
}

export async function generateTaskEventsForWorkspace(
  supabase: SupabaseClient,
  workspaceId: string,
  targetDate: Date = new Date(),
): Promise<{ created: number; errors: string[] }> {
  const errors: string[] = [];
  let created = 0;

  const { data: elders, error: eldersError } = await supabase
    .from("elders")
    .select("id")
    .eq("workspace_id", workspaceId);

  if (eldersError) {
    return { created: 0, errors: [eldersError.message] };
  }

  for (const elder of elders ?? []) {
    const result = await generateTaskEventsForElder(supabase, elder.id, targetDate);
    created += result.created;
    errors.push(...result.errors);
  }

  return { created, errors };
}

export async function generateTaskEventsForElder(
  supabase: SupabaseClient,
  elderId: string,
  targetDate: Date = new Date(),
): Promise<{ created: number; errors: string[] }> {
  const errors: string[] = [];
  let created = 0;
  const dateStr = getDateInTimezone(targetDate, DEFAULT_TIMEZONE);

  const { data: medications } = await supabase
    .from("medications")
    .select("*, medication_schedules(*)")
    .eq("elder_id", elderId)
    .eq("active", true)
    .lte("start_date", dateStr)
    .or(`end_date.is.null,end_date.gte.${dateStr}`);

  for (const med of medications ?? []) {
    for (const schedule of med.medication_schedules ?? []) {
      if (!schedule.active) continue;

      const dueAt = combineDateAndTime(
        dateStr,
        schedule.schedule_time.slice(0, 5),
        schedule.timezone ?? DEFAULT_TIMEZONE,
      );

      const title = med.name;
      const instruction = [med.dosage_text, med.instruction].filter(Boolean).join(" — ");

      const { error } = await supabase.from("task_events").upsert(
        {
          elder_id: elderId,
          source_type: "medication_schedule",
          source_id: schedule.id,
          title,
          instruction: instruction || null,
          due_at: dueAt.toISOString(),
          event_date: dateStr,
          status: "pending",
        },
        { onConflict: "elder_id,source_type,source_id,event_date", ignoreDuplicates: true },
      );

      if (error) errors.push(error.message);
      else created += 1;
    }
  }

  const { data: careTasks } = await supabase
    .from("care_tasks")
    .select("*")
    .eq("elder_id", elderId)
    .eq("active", true);

  for (const task of careTasks ?? []) {
    const dueAt = combineDateAndTime(
      dateStr,
      task.schedule_time.slice(0, 5),
      task.timezone ?? DEFAULT_TIMEZONE,
    );

    const { error } = await supabase.from("task_events").upsert(
      {
        elder_id: elderId,
        source_type: "care_task",
        source_id: task.id,
        title: task.title,
        instruction: task.instruction,
        due_at: dueAt.toISOString(),
        event_date: dateStr,
        status: "pending",
      },
      { onConflict: "elder_id,source_type,source_id,event_date", ignoreDuplicates: true },
    );

    if (error) errors.push(error.message);
    else created += 1;
  }

  return { created, errors };
}

export async function enqueueRemindersForPendingEvents(
  supabase: SupabaseClient,
  workspaceId: string,
): Promise<number> {
  let enqueued = 0;

  const { data: elders } = await supabase
    .from("elders")
    .select("id, reminder_channel")
    .eq("workspace_id", workspaceId);

  for (const elder of elders ?? []) {
    const { data: events } = await supabase
      .from("task_events")
      .select("id, due_at")
      .eq("elder_id", elder.id)
      .eq("status", "pending")
      .lte("due_at", new Date().toISOString());

    for (const event of events ?? []) {
      const channels =
        elder.reminder_channel === "both"
          ? (["web", "line"] as const)
          : ([elder.reminder_channel] as const);

      for (const channel of channels) {
        const { error } = await supabase.from("reminder_queue").upsert(
          {
            task_event_id: event.id,
            channel,
            status: "queued",
            scheduled_at: event.due_at,
          },
          { onConflict: "task_event_id,channel", ignoreDuplicates: true },
        );
        if (!error) enqueued += 1;
      }
    }
  }

  return enqueued;
}

export { MISSED_GRACE_MINUTES, DEFAULT_TIMEZONE, getDateInTimezone };
