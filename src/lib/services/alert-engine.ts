import type { SupabaseClient } from "@supabase/supabase-js";
import type { CareAlertSeverity } from "@/lib/types/care-tasks";
import {
  DEFAULT_VITAL_RULES,
  VITAL_METRIC_LABELS,
  VITAL_METRIC_UNITS,
  type AlertRule,
  type DailyCheckIn,
  type VitalLog,
  type VitalMetric,
} from "@/lib/types/health";
import { DEFAULT_TIMEZONE, getDateInTimezone } from "@/lib/services/task-events";

type ElderSummary = {
  id: string;
  workspace_id: string;
  full_name: string;
  nickname: string | null;
};

type AlertParams = {
  workspaceId: string;
  elderId: string;
  sourceType: string;
  sourceId?: string | null;
  alertType: string;
  severity: CareAlertSeverity;
  title: string;
  message: string;
  metadata?: Record<string, unknown>;
};

export async function evaluateCheckInAlerts(
  supabase: SupabaseClient,
  checkInId: string,
): Promise<number> {
  const { data } = await supabase
    .from("daily_checkins")
    .select("*, elders(id, workspace_id, full_name, nickname)")
    .eq("id", checkInId)
    .single();

  if (!data) return 0;

  const checkIn = data as DailyCheckIn & { elders: ElderSummary };
  const elderName = checkIn.elders.nickname ?? checkIn.elders.full_name;
  const alerts: AlertParams[] = [];

  if (checkIn.had_fall) {
    alerts.push({
      workspaceId: checkIn.elders.workspace_id,
      elderId: checkIn.elder_id,
      sourceType: "daily_checkin",
      sourceId: checkIn.id,
      alertType: "fall_reported",
      severity: "urgent",
      title: "มีการหกล้ม",
      message: `${elderName} มีรายงานว่าหกล้มในการ check-in วันนี้`,
    });
  }

  if (checkIn.has_symptoms || !checkIn.appetite_normal || checkIn.mood === "bad" || checkIn.sleep === "bad") {
    const issues = [
      checkIn.has_symptoms ? "มีอาการผิดปกติ" : null,
      !checkIn.appetite_normal ? "เบื่ออาหาร/กินได้น้อย" : null,
      checkIn.mood === "bad" ? "อารมณ์ไม่ดี" : null,
      checkIn.sleep === "bad" ? "นอนหลับไม่ดี" : null,
    ].filter(Boolean);

    alerts.push({
      workspaceId: checkIn.elders.workspace_id,
      elderId: checkIn.elder_id,
      sourceType: "daily_checkin",
      sourceId: checkIn.id,
      alertType: "check_in_concern",
      severity: "family",
      title: "Check-in มีประเด็นที่ควรติดตาม",
      message: `${elderName}: ${issues.join(", ")}`,
      metadata: { issues },
    });
  }

  let created = 0;
  for (const alert of alerts) {
    if (await createCareAlert(supabase, alert)) created++;
  }
  return created;
}

export async function evaluateVitalLogAlerts(
  supabase: SupabaseClient,
  vitalLogId: string,
): Promise<number> {
  const { data } = await supabase
    .from("vital_logs")
    .select("*, elders(id, workspace_id, full_name, nickname)")
    .eq("id", vitalLogId)
    .single();

  if (!data) return 0;

  const vitalLog = data as VitalLog & { elders: ElderSummary };
  const elderName = vitalLog.elders.nickname ?? vitalLog.elders.full_name;
  const rules = await getRulesForElder(supabase, vitalLog.elder_id);
  let created = 0;

  for (const metric of Object.keys(VITAL_METRIC_LABELS) as VitalMetric[]) {
    const value = vitalLog[metric];
    if (value === null || value === undefined) continue;

    const metricRules = rules.filter((rule) => rule.metric === metric);
    const activeRules = metricRules.length > 0 ? metricRules : [defaultRule(metric)];

    for (const rule of activeRules) {
      if (!ruleHasBounds(rule)) continue;
      const violation = getViolation(Number(value), rule);
      if (!violation) continue;

      const label = VITAL_METRIC_LABELS[metric];
      const unit = VITAL_METRIC_UNITS[metric];
      const message = `${elderName}: ${label} ${value}${unit ? ` ${unit}` : ""} ${violation}`;

      if (
        await createCareAlert(supabase, {
          workspaceId: vitalLog.elders.workspace_id,
          elderId: vitalLog.elder_id,
          sourceType: "vital_log",
          sourceId: vitalLog.id,
          alertType: `vital_${metric}`,
          severity: rule.severity,
          title: `${label}ผิดปกติ`,
          message,
          metadata: { metric, value, min: rule.min_value, max: rule.max_value },
        })
      ) {
        created++;
      }
    }
  }

  return created;
}

export async function processMissedDailyCheckIns(
  supabase: SupabaseClient,
  workspaceId: string,
  now = new Date(),
): Promise<number> {
  const bangkokHour = Number(
    new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      hour12: false,
      timeZone: DEFAULT_TIMEZONE,
    }).format(now),
  );

  if (bangkokHour < 20) return 0;

  const today = getDateInTimezone(now, DEFAULT_TIMEZONE);
  const { data: elders } = await supabase
    .from("elders")
    .select("id, workspace_id, full_name, nickname")
    .eq("workspace_id", workspaceId);

  let created = 0;
  for (const elder of (elders ?? []) as ElderSummary[]) {
    const { data: checkIn } = await supabase
      .from("daily_checkins")
      .select("id")
      .eq("elder_id", elder.id)
      .eq("check_in_date", today)
      .maybeSingle();

    if (checkIn) continue;

    const elderName = elder.nickname ?? elder.full_name;
    if (
      await createCareAlert(supabase, {
        workspaceId,
        elderId: elder.id,
        sourceType: `daily_checkin:${today}`,
        sourceId: null,
        alertType: "missed_check_in",
        severity: "family",
        title: "ยังไม่ได้ Check-in วันนี้",
        message: `${elderName} ยังไม่มีการบันทึก check-in ของวันนี้`,
        metadata: { checkInDate: today },
      })
    ) {
      created++;
    }
  }

  return created;
}

async function getRulesForElder(
  supabase: SupabaseClient,
  elderId: string,
): Promise<AlertRule[]> {
  const { data } = await supabase
    .from("alert_rules")
    .select("*")
    .eq("elder_id", elderId)
    .eq("enabled", true);

  return (data ?? []) as AlertRule[];
}

function defaultRule(metric: VitalMetric): AlertRule {
  const rule = DEFAULT_VITAL_RULES[metric];
  return {
    id: `default:${metric}`,
    elder_id: "",
    metric,
    min_value: rule.minValue ?? null,
    max_value: rule.maxValue ?? null,
    severity: rule.severity,
    enabled: true,
    created_by: null,
    created_at: "",
    updated_at: "",
  };
}

function ruleHasBounds(rule: AlertRule): boolean {
  return rule.min_value !== null || rule.max_value !== null;
}

function getViolation(value: number, rule: AlertRule): string | null {
  if (rule.min_value !== null && value < rule.min_value) {
    return `ต่ำกว่าเกณฑ์ ${rule.min_value}`;
  }
  if (rule.max_value !== null && value > rule.max_value) {
    return `สูงกว่าเกณฑ์ ${rule.max_value}`;
  }
  return null;
}

async function createCareAlert(
  supabase: SupabaseClient,
  params: AlertParams,
): Promise<boolean> {
  let query = supabase
    .from("care_alerts")
    .select("id")
    .eq("elder_id", params.elderId)
    .eq("source_type", params.sourceType)
    .eq("alert_type", params.alertType)
    .eq("status", "open");

  query = params.sourceId
    ? query.eq("source_id", params.sourceId)
    : query.is("source_id", null);

  const { data: existing } = await query.maybeSingle();
  if (existing) return false;

  const { data: alert, error } = await supabase
    .from("care_alerts")
    .insert({
      workspace_id: params.workspaceId,
      elder_id: params.elderId,
      source_type: params.sourceType,
      source_id: params.sourceId,
      alert_type: params.alertType,
      severity: params.severity,
      title: params.title,
      message: params.message,
      status: "open",
    })
    .select("id")
    .single();

  if (error || !alert) return false;

  await logNotification(supabase, {
    workspaceId: params.workspaceId,
    elderId: params.elderId,
    careAlertId: alert.id,
    type: params.alertType,
    recipient: null,
    message: params.message,
    metadata: params.metadata,
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
    if (!email) continue;

    await logNotification(supabase, {
      workspaceId: params.workspaceId,
      elderId: params.elderId,
      careAlertId: alert.id,
      type: "family_alert",
      recipient: email,
      message: params.message,
      metadata: params.metadata,
    });
  }

  return true;
}

async function logNotification(
  supabase: SupabaseClient,
  params: {
    workspaceId: string;
    elderId: string;
    careAlertId: string;
    type: string;
    recipient: string | null;
    message: string;
    metadata?: Record<string, unknown>;
  },
) {
  await supabase.from("notification_logs").insert({
    workspace_id: params.workspaceId,
    elder_id: params.elderId,
    care_alert_id: params.careAlertId,
    channel: "web",
    notification_type: params.type,
    status: "sent",
    recipient: params.recipient,
    message: params.message,
    metadata: params.metadata ?? {},
  });
}
