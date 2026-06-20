import type { SupabaseClient } from "@supabase/supabase-js";
import { DEFAULT_TIMEZONE, getDateInTimezone } from "@/lib/services/task-events";
import type { PilotMetricSummary } from "@/lib/types/pilot";

export async function getPilotMetricSummary(
  supabase: SupabaseClient,
  workspaceId: string,
  days = 7,
): Promise<PilotMetricSummary> {
  const end = new Date();
  const start = new Date(end);
  start.setDate(start.getDate() - (days - 1));

  const periodStart = getDateInTimezone(start, DEFAULT_TIMEZONE);
  const periodEnd = getDateInTimezone(end, DEFAULT_TIMEZONE);

  const { data: elders } = await supabase
    .from("elders")
    .select("id")
    .eq("workspace_id", workspaceId);

  const elderIds = (elders ?? []).map((elder) => elder.id as string);

  if (elderIds.length === 0) {
    return emptyMetrics(periodStart, periodEnd);
  }

  const [
    taskEventsResult,
    reportsResult,
    checkInsResult,
    feedbackResult,
    pricingResult,
    adminsResult,
  ] = await Promise.all([
    supabase
      .from("task_events")
      .select("status")
      .in("elder_id", elderIds)
      .gte("event_date", periodStart)
      .lte("event_date", periodEnd),
    supabase
      .from("reports")
      .select("id")
      .eq("workspace_id", workspaceId)
      .gte("created_at", `${periodStart}T00:00:00+07:00`)
      .lte("created_at", `${periodEnd}T23:59:59+07:00`),
    supabase
      .from("daily_checkins")
      .select("check_in_date")
      .in("elder_id", elderIds)
      .gte("check_in_date", periodStart)
      .lte("check_in_date", periodEnd),
    supabase
      .from("pilot_feedback")
      .select("status, severity")
      .eq("workspace_id", workspaceId),
    supabase
      .from("pilot_pricing_signals")
      .select("willingness_to_pay")
      .eq("workspace_id", workspaceId),
    supabase
      .from("workspace_members")
      .select("user_id")
      .eq("workspace_id", workspaceId)
      .eq("status", "active")
      .in("role", ["owner", "family_admin"]),
  ]);

  const taskEvents = taskEventsResult.data ?? [];
  const completed = taskEvents.filter((event) => event.status === "completed").length;
  const denominator = taskEvents.filter((event) =>
    ["completed", "missed", "skipped"].includes(event.status as string),
  ).length;
  const reminderCompletionPercent =
    denominator === 0 ? 0 : Math.round((completed / denominator) * 100);

  const familyAdminIds = (adminsResult.data ?? []).map((item) => item.user_id as string);
  const weeklyActiveFamilyAdmins =
    familyAdminIds.length === 0
      ? 0
      : await countActiveFamilyAdmins(supabase, workspaceId, familyAdminIds, periodStart, periodEnd);

  const reportCount = reportsResult.data?.length ?? 0;
  const feedback = feedbackResult.data ?? [];
  const openFeedback = feedback.filter((item) => item.status !== "resolved" && item.status !== "wont_fix");
  const willingnessToPayCount = (pricingResult.data ?? []).filter(
    (item) => item.willingness_to_pay,
  ).length;

  return {
    periodStart,
    periodEnd,
    reminderCompletionPercent,
    taskEventsTotal: denominator,
    taskEventsCompleted: completed,
    weeklyActiveFamilyAdmins,
    familyAdminCount: familyAdminIds.length,
    reportGenerated: reportCount > 0,
    reportCount,
    checkInDays: new Set((checkInsResult.data ?? []).map((item) => item.check_in_date)).size,
    feedbackOpen: openFeedback.length,
    criticalBugsOpen: openFeedback.filter((item) => item.severity === "critical").length,
    willingnessToPayCount,
    success: {
      reminderCompletion: reminderCompletionPercent >= 70,
      weeklyActiveFamilyAdmin:
        familyAdminIds.length > 0
          ? weeklyActiveFamilyAdmins / familyAdminIds.length >= 0.6
          : false,
      reportUsage: reportCount > 0,
      pricingEvidence: willingnessToPayCount >= 1,
    },
  };
}

async function countActiveFamilyAdmins(
  supabase: SupabaseClient,
  workspaceId: string,
  familyAdminIds: string[],
  periodStart: string,
  periodEnd: string,
): Promise<number> {
  const { data } = await supabase
    .from("audit_logs")
    .select("actor_user_id")
    .eq("workspace_id", workspaceId)
    .in("actor_user_id", familyAdminIds)
    .gte("created_at", `${periodStart}T00:00:00+07:00`)
    .lte("created_at", `${periodEnd}T23:59:59+07:00`);

  return new Set((data ?? []).map((item) => item.actor_user_id)).size;
}

function emptyMetrics(periodStart: string, periodEnd: string): PilotMetricSummary {
  return {
    periodStart,
    periodEnd,
    reminderCompletionPercent: 0,
    taskEventsTotal: 0,
    taskEventsCompleted: 0,
    weeklyActiveFamilyAdmins: 0,
    familyAdminCount: 0,
    reportGenerated: false,
    reportCount: 0,
    checkInDays: 0,
    feedbackOpen: 0,
    criticalBugsOpen: 0,
    willingnessToPayCount: 0,
    success: {
      reminderCompletion: false,
      weeklyActiveFamilyAdmin: false,
      reportUsage: false,
      pricingEvidence: false,
    },
  };
}
