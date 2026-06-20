"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { canManageWorkspace, requireUser, requireWorkspace } from "@/lib/auth/session";
import type { ActionResult } from "@/lib/actions/auth";
import { logAuditEvent } from "@/lib/actions/audit";
import type { WorkspaceRole } from "@/lib/types/database";
import {
  parseCommaList,
  pilotBaselineSchema,
  pilotCohortSchema,
  pilotFeedbackSchema,
  pilotFeedbackStatusSchema,
  pilotInterviewSchema,
  pilotPricingSignalSchema,
} from "@/lib/schemas/pilot";
import { getPilotMetricSummary } from "@/lib/services/pilot-metrics";
import type {
  PilotBaseline,
  PilotCohort,
  PilotDashboardData,
  PilotFeedback,
  PilotInterview,
  PilotPricingSignal,
} from "@/lib/types/pilot";

function requirePilotAdmin(role: WorkspaceRole): ActionResult | null {
  if (!canManageWorkspace(role)) {
    return { error: "ไม่มีสิทธิ์จัดการ pilot" };
  }
  return null;
}

export async function upsertPilotCohortAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const user = await requireUser();
  const { workspace, membership } = await requireWorkspace();
  const unauthorized = requirePilotAdmin(membership.role);
  if (unauthorized) return unauthorized;

  const parsed = pilotCohortSchema.safeParse({
    status: formData.get("status"),
    pilotStartedAt: formData.get("pilotStartedAt"),
    pilotEndsAt: formData.get("pilotEndsAt"),
    onboardingCallAt: formData.get("onboardingCallAt"),
    setupCompleted: formData.get("setupCompleted"),
    targetFamilyCount: formData.get("targetFamilyCount") || 1,
    notes: formData.get("notes"),
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("pilot_cohorts")
    .upsert(
      {
        workspace_id: workspace.id,
        status: parsed.data.status,
        pilot_started_at: parsed.data.pilotStartedAt,
        pilot_ends_at: parsed.data.pilotEndsAt || null,
        onboarding_call_at: parsed.data.onboardingCallAt
          ? new Date(parsed.data.onboardingCallAt).toISOString()
          : null,
        setup_completed_at: parsed.data.setupCompleted ? new Date().toISOString() : null,
        target_family_count: parsed.data.targetFamilyCount,
        notes: parsed.data.notes || null,
        created_by: user.id,
      },
      { onConflict: "workspace_id" },
    )
    .select("id")
    .single();

  if (error || !data) return { error: error?.message ?? "บันทึก cohort ไม่สำเร็จ" };

  await logAuditEvent({
    workspaceId: workspace.id,
    action: "pilot.cohort_upserted",
    resourceType: "pilot_cohort",
    resourceId: data.id,
  });

  revalidatePath("/ops/pilot");
  return { success: true };
}

export async function upsertPilotBaselineAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const user = await requireUser();
  const { workspace, membership } = await requireWorkspace();
  const unauthorized = requirePilotAdmin(membership.role);
  if (unauthorized) return unauthorized;

  const parsed = pilotBaselineSchema.safeParse({
    currentTools: formData.get("currentTools"),
    careTasksPerDay: formData.get("careTasksPerDay"),
    primaryPain: formData.get("primaryPain"),
    baselineConfidenceScore: formData.get("baselineConfidenceScore"),
    workflowNotes: formData.get("workflowNotes"),
    willingnessToPayInitial: formData.get("willingnessToPayInitial"),
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("pilot_baselines").upsert(
    {
      workspace_id: workspace.id,
      current_tools: parseCommaList(parsed.data.currentTools || ""),
      care_tasks_per_day: parsed.data.careTasksPerDay ?? null,
      primary_pain: parsed.data.primaryPain || null,
      baseline_confidence_score: parsed.data.baselineConfidenceScore ?? null,
      workflow_notes: parsed.data.workflowNotes || null,
      willingness_to_pay_initial: parsed.data.willingnessToPayInitial ?? null,
      recorded_by: user.id,
      recorded_at: new Date().toISOString(),
    },
    { onConflict: "workspace_id" },
  );

  if (error) return { error: error.message };

  await logAuditEvent({
    workspaceId: workspace.id,
    action: "pilot.baseline_saved",
    resourceType: "pilot_baseline",
  });

  revalidatePath("/ops/pilot");
  return { success: true };
}

export async function createPilotInterviewAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const user = await requireUser();
  const { workspace, membership } = await requireWorkspace();
  const unauthorized = requirePilotAdmin(membership.role);
  if (unauthorized) return unauthorized;

  const parsed = pilotInterviewSchema.safeParse({
    interviewWeek: formData.get("interviewWeek"),
    interviewDate: formData.get("interviewDate"),
    npsScore: formData.get("npsScore"),
    retentionSignal: formData.get("retentionSignal"),
    notes: formData.get("notes"),
    actionItems: formData.get("actionItems"),
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("pilot_interviews").insert({
    workspace_id: workspace.id,
    interview_week: parsed.data.interviewWeek,
    interview_date: parsed.data.interviewDate,
    nps_score: parsed.data.npsScore ?? null,
    retention_signal: parsed.data.retentionSignal,
    notes: parsed.data.notes,
    action_items: parsed.data.actionItems || null,
    recorded_by: user.id,
  });

  if (error) return { error: error.message };

  await logAuditEvent({
    workspaceId: workspace.id,
    action: "pilot.interview_created",
    resourceType: "pilot_interview",
  });

  revalidatePath("/ops/pilot");
  return { success: true };
}

export async function createPilotFeedbackAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const user = await requireUser();
  const { workspace } = await requireWorkspace();

  const parsed = pilotFeedbackSchema.safeParse({
    feedbackType: formData.get("feedbackType"),
    severity: formData.get("severity"),
    title: formData.get("title"),
    description: formData.get("description"),
    pageUrl: formData.get("pageUrl"),
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("pilot_feedback")
    .insert({
      workspace_id: workspace.id,
      submitted_by: user.id,
      feedback_type: parsed.data.feedbackType,
      severity: parsed.data.severity,
      title: parsed.data.title,
      description: parsed.data.description,
      page_url: parsed.data.pageUrl || null,
    })
    .select("id")
    .single();

  if (error || !data) return { error: error?.message ?? "ส่ง feedback ไม่สำเร็จ" };

  await logAuditEvent({
    workspaceId: workspace.id,
    action: "pilot.feedback_created",
    resourceType: "pilot_feedback",
    resourceId: data.id,
    metadata: { severity: parsed.data.severity },
  });

  revalidatePath("/ops/pilot");
  revalidatePath("/feedback");
  return { success: true };
}

export async function updatePilotFeedbackStatusAction(
  feedbackId: string,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const { workspace, membership } = await requireWorkspace();
  const unauthorized = requirePilotAdmin(membership.role);
  if (unauthorized) return unauthorized;

  const parsed = pilotFeedbackStatusSchema.safeParse({
    status: formData.get("status"),
    resolutionNotes: formData.get("resolutionNotes"),
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("pilot_feedback")
    .update({
      status: parsed.data.status,
      resolution_notes: parsed.data.resolutionNotes || null,
      resolved_at:
        parsed.data.status === "resolved" || parsed.data.status === "wont_fix"
          ? new Date().toISOString()
          : null,
    })
    .eq("id", feedbackId)
    .eq("workspace_id", workspace.id);

  if (error) return { error: error.message };

  await logAuditEvent({
    workspaceId: workspace.id,
    action: "pilot.feedback_status_updated",
    resourceType: "pilot_feedback",
    resourceId: feedbackId,
    metadata: { status: parsed.data.status },
  });

  revalidatePath("/ops/pilot");
  return { success: true };
}

export async function createPilotPricingSignalAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const user = await requireUser();
  const { workspace, membership } = await requireWorkspace();
  const unauthorized = requirePilotAdmin(membership.role);
  if (unauthorized) return unauthorized;

  const parsed = pilotPricingSignalSchema.safeParse({
    willingnessToPay: formData.get("willingnessToPay"),
    priceBand: formData.get("priceBand"),
    valuedFeatures: formData.get("valuedFeatures"),
    objections: formData.get("objections"),
    notes: formData.get("notes"),
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("pilot_pricing_signals").insert({
    workspace_id: workspace.id,
    willingness_to_pay: parsed.data.willingnessToPay ?? false,
    price_band: parsed.data.priceBand || null,
    valued_features: parsed.data.valuedFeatures || null,
    objections: parsed.data.objections || null,
    notes: parsed.data.notes || null,
    recorded_by: user.id,
  });

  if (error) return { error: error.message };

  await logAuditEvent({
    workspaceId: workspace.id,
    action: "pilot.pricing_signal_created",
    resourceType: "pilot_pricing_signal",
  });

  revalidatePath("/ops/pilot");
  return { success: true };
}

export async function getPilotDashboardData(): Promise<PilotDashboardData> {
  const { workspace } = await requireWorkspace();
  const supabase = await createClient();
  const [cohort, baseline, interviews, feedback, pricingSignals, metrics] =
    await Promise.all([
      getPilotCohort(workspace.id),
      getPilotBaseline(workspace.id),
      getPilotInterviews(workspace.id),
      getPilotFeedback(workspace.id),
      getPilotPricingSignals(workspace.id),
      getPilotMetricSummary(supabase, workspace.id, 7),
    ]);

  return {
    cohort,
    baseline,
    interviews,
    feedback,
    pricingSignals,
    metrics,
  };
}

async function getPilotCohort(workspaceId: string): Promise<PilotCohort | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("pilot_cohorts")
    .select("*")
    .eq("workspace_id", workspaceId)
    .maybeSingle();
  return (data as PilotCohort | null) ?? null;
}

async function getPilotBaseline(workspaceId: string): Promise<PilotBaseline | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("pilot_baselines")
    .select("*")
    .eq("workspace_id", workspaceId)
    .maybeSingle();
  return (data as PilotBaseline | null) ?? null;
}

async function getPilotInterviews(workspaceId: string): Promise<PilotInterview[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("pilot_interviews")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("interview_week", { ascending: false });
  if (error) throw error;
  return (data ?? []) as PilotInterview[];
}

async function getPilotFeedback(workspaceId: string): Promise<PilotFeedback[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("pilot_feedback")
    .select("*, profiles(display_name, email)")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as PilotFeedback[];
}

async function getPilotPricingSignals(workspaceId: string): Promise<PilotPricingSignal[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("pilot_pricing_signals")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("recorded_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as PilotPricingSignal[];
}
