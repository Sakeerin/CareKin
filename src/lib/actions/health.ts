"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  canManageElders,
  requireUser,
  requireWorkspace,
} from "@/lib/auth/session";
import { logAuditEvent } from "@/lib/actions/audit";
import type { ActionResult } from "@/lib/actions/auth";
import {
  alertRuleSchema,
  dailyCheckInActionSchema,
  vitalLogSchema,
} from "@/lib/schemas/check-in";
import {
  evaluateCheckInAlerts,
  evaluateVitalLogAlerts,
} from "@/lib/services/alert-engine";
import { DEFAULT_TIMEZONE, getDateInTimezone } from "@/lib/services/task-events";
import type { WorkspaceRole } from "@/lib/types/database";
import type {
  AlertRule,
  DailyCheckIn,
  HealthDashboardSummary,
  VitalLog,
} from "@/lib/types/health";

function canRecordHealth(role: WorkspaceRole): boolean {
  return role === "owner" || role === "family_admin" || role === "caregiver" || role === "elder";
}

function hasAnyVital(data: Record<string, unknown>): boolean {
  return [
    "systolic",
    "diastolic",
    "pulse",
    "bloodSugar",
    "temperature",
    "spo2",
    "weight",
  ].some((key) => data[key] !== undefined);
}

export async function createDailyCheckInAction(
  elderId: string,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const user = await requireUser();
  const { workspace, membership } = await requireWorkspace();

  if (!canRecordHealth(membership.role)) {
    return { error: "ไม่มีสิทธิ์บันทึก check-in" };
  }

  const parsed = dailyCheckInActionSchema.safeParse({
    mood: formData.get("mood"),
    hasSymptoms: formData.get("hasSymptoms"),
    hadFall: formData.get("hadFall"),
    appetiteNormal: formData.get("appetiteNormal"),
    sleep: formData.get("sleep"),
    note: formData.get("note"),
    systolic: formData.get("systolic"),
    diastolic: formData.get("diastolic"),
    pulse: formData.get("pulse"),
    bloodSugar: formData.get("bloodSugar"),
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
  }

  const supabase = await createClient();
  const today = getDateInTimezone(new Date(), DEFAULT_TIMEZONE);
  const { data: checkIn, error } = await supabase
    .from("daily_checkins")
    .upsert(
      {
        elder_id: elderId,
        check_in_date: today,
        mood: parsed.data.mood,
        has_symptoms: parsed.data.hasSymptoms,
        had_fall: parsed.data.hadFall,
        appetite_normal: parsed.data.appetiteNormal,
        sleep: parsed.data.sleep,
        note: parsed.data.note || null,
        recorded_by: user.id,
        recorded_at: new Date().toISOString(),
      },
      { onConflict: "elder_id,check_in_date" },
    )
    .select("id")
    .single();

  if (error || !checkIn) return { error: error?.message ?? "บันทึก check-in ไม่สำเร็จ" };

  await evaluateCheckInAlerts(supabase, checkIn.id);

  if (hasAnyVital(parsed.data)) {
    const { data: vital, error: vitalError } = await supabase
      .from("vital_logs")
      .insert({
        elder_id: elderId,
        measured_at: new Date().toISOString(),
        systolic: parsed.data.systolic ?? null,
        diastolic: parsed.data.diastolic ?? null,
        pulse: parsed.data.pulse ?? null,
        blood_sugar: parsed.data.bloodSugar ?? null,
        recorded_by: user.id,
        note: parsed.data.note || null,
      })
      .select("id")
      .single();

    if (vitalError) return { error: vitalError.message };
    await evaluateVitalLogAlerts(supabase, vital.id);
  }

  await logAuditEvent({
    workspaceId: workspace.id,
    action: "daily_checkin.created",
    resourceType: "daily_checkin",
    resourceId: checkIn.id,
    metadata: { elderId },
  });

  revalidatePath(`/elders/${elderId}/check-in`);
  revalidatePath(`/elders/${elderId}/vitals`);
  revalidatePath("/dashboard");
  revalidatePath("/notifications");
  return { success: true };
}

export async function createVitalLogAction(
  elderId: string,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const user = await requireUser();
  const { workspace, membership } = await requireWorkspace();

  if (!canRecordHealth(membership.role)) {
    return { error: "ไม่มีสิทธิ์บันทึกค่าสุขภาพ" };
  }

  const parsed = vitalLogSchema.safeParse({
    measuredAt: formData.get("measuredAt"),
    systolic: formData.get("systolic"),
    diastolic: formData.get("diastolic"),
    pulse: formData.get("pulse"),
    bloodSugar: formData.get("bloodSugar"),
    temperature: formData.get("temperature"),
    spo2: formData.get("spo2"),
    weight: formData.get("weight"),
    note: formData.get("note"),
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
  }

  if (!hasAnyVital(parsed.data)) {
    return { error: "กรุณาระบุค่าสุขภาพอย่างน้อย 1 ค่า" };
  }

  const supabase = await createClient();
  const { data: vital, error } = await supabase
    .from("vital_logs")
    .insert({
      elder_id: elderId,
      measured_at: parsed.data.measuredAt
        ? new Date(parsed.data.measuredAt).toISOString()
        : new Date().toISOString(),
      systolic: parsed.data.systolic ?? null,
      diastolic: parsed.data.diastolic ?? null,
      pulse: parsed.data.pulse ?? null,
      blood_sugar: parsed.data.bloodSugar ?? null,
      temperature: parsed.data.temperature ?? null,
      spo2: parsed.data.spo2 ?? null,
      weight: parsed.data.weight ?? null,
      note: parsed.data.note || null,
      recorded_by: user.id,
    })
    .select("id")
    .single();

  if (error || !vital) return { error: error?.message ?? "บันทึกค่าสุขภาพไม่สำเร็จ" };

  await evaluateVitalLogAlerts(supabase, vital.id);
  await logAuditEvent({
    workspaceId: workspace.id,
    action: "vital_log.created",
    resourceType: "vital_log",
    resourceId: vital.id,
    metadata: { elderId },
  });

  revalidatePath(`/elders/${elderId}/vitals`);
  revalidatePath("/dashboard");
  revalidatePath("/notifications");
  return { success: true };
}

export async function createAlertRuleAction(
  elderId: string,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const user = await requireUser();
  const { workspace, membership } = await requireWorkspace();

  if (!canManageElders(membership.role)) {
    return { error: "ไม่มีสิทธิ์ตั้งค่าเกณฑ์แจ้งเตือน" };
  }

  const parsed = alertRuleSchema.safeParse({
    metric: formData.get("metric"),
    minValue: formData.get("minValue"),
    maxValue: formData.get("maxValue"),
    severity: formData.get("severity"),
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
  }

  const supabase = await createClient();
  const { data: rule, error } = await supabase
    .from("alert_rules")
    .insert({
      elder_id: elderId,
      metric: parsed.data.metric,
      min_value: parsed.data.minValue ?? null,
      max_value: parsed.data.maxValue ?? null,
      severity: parsed.data.severity,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (error || !rule) return { error: error?.message ?? "บันทึกเกณฑ์ไม่สำเร็จ" };

  await logAuditEvent({
    workspaceId: workspace.id,
    action: "alert_rule.created",
    resourceType: "alert_rule",
    resourceId: rule.id,
    metadata: { elderId, metric: parsed.data.metric },
  });

  revalidatePath(`/elders/${elderId}/thresholds`);
  return { success: true };
}

export async function deleteAlertRuleAction(
  elderId: string,
  ruleId: string,
): Promise<void> {
  const { workspace, membership } = await requireWorkspace();
  if (!canManageElders(membership.role)) {
    throw new Error("ไม่มีสิทธิ์ลบเกณฑ์แจ้งเตือน");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("alert_rules")
    .delete()
    .eq("id", ruleId)
    .eq("elder_id", elderId);

  if (error) throw new Error(error.message);

  await logAuditEvent({
    workspaceId: workspace.id,
    action: "alert_rule.deleted",
    resourceType: "alert_rule",
    resourceId: ruleId,
    metadata: { elderId },
  });

  revalidatePath(`/elders/${elderId}/thresholds`);
}

export async function getDailyCheckIns(
  elderId: string,
  limit = 14,
): Promise<DailyCheckIn[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("daily_checkins")
    .select("*")
    .eq("elder_id", elderId)
    .order("check_in_date", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as DailyCheckIn[];
}

export async function getVitalLogs(elderId: string, limit = 30): Promise<VitalLog[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("vital_logs")
    .select("*")
    .eq("elder_id", elderId)
    .order("measured_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as VitalLog[];
}

export async function getAlertRules(elderId: string): Promise<AlertRule[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("alert_rules")
    .select("*")
    .eq("elder_id", elderId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as AlertRule[];
}

export async function getCareAlert(alertId: string) {
  const { workspace } = await requireWorkspace();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("care_alerts")
    .select("*, elders(full_name, nickname)")
    .eq("id", alertId)
    .eq("workspace_id", workspace.id)
    .single();

  if (error) return null;
  return data;
}

export async function getHealthDashboardSummary(
  workspaceId: string,
): Promise<HealthDashboardSummary> {
  const supabase = await createClient();
  const today = getDateInTimezone(new Date(), DEFAULT_TIMEZONE);
  const { data: elders } = await supabase
    .from("elders")
    .select("id")
    .eq("workspace_id", workspaceId);

  const elderIds = (elders ?? []).map((elder) => elder.id);
  if (elderIds.length === 0) {
    return {
      totalElders: 0,
      checkedInToday: 0,
      abnormalVitalsToday: 0,
      latestCheckIns: [],
      latestVitals: [],
    };
  }

  const [checkInsResult, latestCheckInsResult, latestVitalsResult, alertsResult] =
    await Promise.all([
      supabase
        .from("daily_checkins")
        .select("id")
        .in("elder_id", elderIds)
        .eq("check_in_date", today),
      supabase
        .from("daily_checkins")
        .select("*, elders(full_name, nickname)")
        .in("elder_id", elderIds)
        .order("recorded_at", { ascending: false })
        .limit(5),
      supabase
        .from("vital_logs")
        .select("*, elders(full_name, nickname)")
        .in("elder_id", elderIds)
        .order("measured_at", { ascending: false })
        .limit(5),
      supabase
        .from("care_alerts")
        .select("id")
        .eq("workspace_id", workspaceId)
        .eq("status", "open")
        .like("alert_type", "vital_%"),
    ]);

  return {
    totalElders: elderIds.length,
    checkedInToday: checkInsResult.data?.length ?? 0,
    abnormalVitalsToday: alertsResult.data?.length ?? 0,
    latestCheckIns: (latestCheckInsResult.data ?? []) as HealthDashboardSummary["latestCheckIns"],
    latestVitals: (latestVitalsResult.data ?? []) as HealthDashboardSummary["latestVitals"],
  };
}
