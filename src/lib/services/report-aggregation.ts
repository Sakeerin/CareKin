import type { SupabaseClient } from "@supabase/supabase-js";
import type { CareAlert, TaskEvent } from "@/lib/types/care-tasks";
import type { DailyCheckIn, VitalLog } from "@/lib/types/health";
import type { ReportAggregate, ReportPeriodDays } from "@/lib/types/reports";
import { DEFAULT_TIMEZONE, getDateInTimezone } from "@/lib/services/task-events";

type ElderForReport = {
  id: string;
  workspace_id: string;
  full_name: string;
  nickname: string | null;
  chronic_conditions: string[] | null;
};

export async function buildReportAggregate(
  supabase: SupabaseClient,
  elderId: string,
  periodDays: ReportPeriodDays,
): Promise<ReportAggregate | null> {
  const { data: elder } = await supabase
    .from("elders")
    .select("id, workspace_id, full_name, nickname, chronic_conditions")
    .eq("id", elderId)
    .single();

  if (!elder) return null;

  const period = getReportPeriod(periodDays);
  const elderData = elder as ElderForReport;

  const [taskEventsResult, checkInsResult, vitalsResult, alertsResult] =
    await Promise.all([
      supabase
        .from("task_events")
        .select("*")
        .eq("elder_id", elderId)
        .gte("event_date", period.startDate)
        .lte("event_date", period.endDate),
      supabase
        .from("daily_checkins")
        .select("*")
        .eq("elder_id", elderId)
        .gte("check_in_date", period.startDate)
        .lte("check_in_date", period.endDate)
        .order("check_in_date", { ascending: false }),
      supabase
        .from("vital_logs")
        .select("*")
        .eq("elder_id", elderId)
        .gte("measured_at", `${period.startDate}T00:00:00+07:00`)
        .lte("measured_at", `${period.endDate}T23:59:59+07:00`)
        .order("measured_at", { ascending: false }),
      supabase
        .from("care_alerts")
        .select("*")
        .eq("elder_id", elderId)
        .gte("created_at", `${period.startDate}T00:00:00+07:00`)
        .lte("created_at", `${period.endDate}T23:59:59+07:00`)
        .order("created_at", { ascending: false }),
    ]);

  const taskEvents = (taskEventsResult.data ?? []) as TaskEvent[];
  const checkIns = (checkInsResult.data ?? []) as DailyCheckIn[];
  const vitals = (vitalsResult.data ?? []) as VitalLog[];
  const alerts = (alertsResult.data ?? []) as CareAlert[];
  const medicationEvents = taskEvents.filter(
    (event) => event.source_type === "medication_schedule",
  );

  const completedMeds = medicationEvents.filter(
    (event) => event.status === "completed",
  ).length;
  const missedMeds = medicationEvents.filter((event) => event.status === "missed").length;
  const skippedMeds = medicationEvents.filter((event) => event.status === "skipped").length;
  const medTotal = medicationEvents.length;
  const percent = medTotal === 0 ? 0 : Math.round((completedMeds / medTotal) * 100);

  const concerningCheckIns = checkIns.filter(
    (item) =>
      item.mood === "bad" ||
      item.sleep === "bad" ||
      item.has_symptoms ||
      item.had_fall ||
      !item.appetite_normal,
  ).length;

  const missedRoutines = taskEvents
    .filter(
      (event) =>
        event.source_type === "care_task" &&
        (event.status === "missed" || event.status === "skipped"),
    )
    .map((event) => `${event.title} — ${formatDate(event.event_date)}`);

  const caregiverNotes = [
    ...checkIns.flatMap((item) =>
      item.note ? [`${formatDate(item.check_in_date)}: ${item.note}`] : [],
    ),
    ...vitals.flatMap((item) =>
      item.note ? [`${formatDate(item.measured_at)}: ${item.note}`] : [],
    ),
    ...taskEvents.flatMap((item) =>
      item.note ? [`${formatDate(item.event_date)}: ${item.note}`] : [],
    ),
  ].slice(0, 12);

  const outOfRangeValues = alerts
    .filter((alert) => alert.alert_type.startsWith("vital_"))
    .map((alert) => `${alert.title}: ${alert.message}`)
    .slice(0, 12);

  return {
    elder: {
      id: elderData.id,
      fullName: elderData.full_name,
      nickname: elderData.nickname,
      chronicConditions: elderData.chronic_conditions ?? [],
    },
    period,
    medicationAdherence: {
      total: medTotal,
      completed: completedMeds,
      missed: missedMeds,
      skipped: skippedMeds,
      percent,
    },
    checkIns: {
      completed: checkIns.length,
      expected: periodDays,
      concerning: concerningCheckIns,
      items: checkIns,
    },
    vitals: {
      count: vitals.length,
      latest: vitals.slice(0, 10),
      averages: {
        systolic: average(vitals.map((item) => item.systolic)),
        diastolic: average(vitals.map((item) => item.diastolic)),
        pulse: average(vitals.map((item) => item.pulse)),
        bloodSugar: average(vitals.map((item) => item.blood_sugar)),
      },
    },
    alerts: {
      total: alerts.length,
      urgent: alerts.filter((alert) => alert.severity === "urgent").length,
      family: alerts.filter((alert) => alert.severity === "family").length,
      acknowledged: alerts.filter((alert) => alert.status === "acknowledged").length,
      items: alerts.slice(0, 12),
    },
    caregiverNotes,
    missedRoutines,
    outOfRangeValues,
  };
}

function getReportPeriod(days: ReportPeriodDays) {
  const end = new Date();
  const start = new Date(end);
  start.setDate(start.getDate() - (days - 1));

  return {
    days,
    startDate: getDateInTimezone(start, DEFAULT_TIMEZONE),
    endDate: getDateInTimezone(end, DEFAULT_TIMEZONE),
  };
}

function average(values: (number | null)[]): number | null {
  const nums = values.filter((value): value is number => value !== null);
  if (nums.length === 0) return null;
  return Math.round((nums.reduce((sum, value) => sum + value, 0) / nums.length) * 10) / 10;
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("th-TH", { timeZone: DEFAULT_TIMEZONE });
}
