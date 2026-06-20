"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  canManageWorkspace,
  requireUser,
  requireWorkspace,
} from "@/lib/auth/session";
import { logAuditEvent } from "@/lib/actions/audit";
import type { ActionResult } from "@/lib/actions/auth";
import {
  aiReportSchema,
  reportGenerateSchema,
  reportReviewSchema,
  shareReportSchema,
} from "@/lib/schemas/report";
import { generateAiDraftSummary } from "@/lib/services/ai-summary";
import { buildReportAggregate } from "@/lib/services/report-aggregation";
import type { AiReportOutput } from "@/lib/schemas/report";
import type { CareReport, ReportPeriodDays, ReportShare } from "@/lib/types/reports";

export async function createReportAction(
  elderId: string,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const user = await requireUser();
  const { workspace } = await requireWorkspace();

  const parsed = reportGenerateSchema.safeParse({
    periodDays: formData.get("periodDays"),
    reportType: formData.get("reportType") || "weekly",
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
  }

  const periodDays = parsed.data.periodDays as ReportPeriodDays;
  const supabase = await createClient();
  const aggregate = await buildReportAggregate(supabase, elderId, periodDays);

  if (!aggregate) return { error: "ไม่พบข้อมูลผู้สูงวัย" };

  const aiOutput = generateAiDraftSummary(aggregate);
  const { data: report, error } = await supabase
    .from("reports")
    .insert({
      workspace_id: workspace.id,
      elder_id: elderId,
      report_type: parsed.data.reportType,
      period_days: periodDays,
      period_start: aggregate.period.startDate,
      period_end: aggregate.period.endDate,
      status: "draft",
      aggregate_json: aggregate,
      ai_output: aiOutput,
      summary_text: aiOutput.summary,
      ai_model: "carekin-deterministic-summary-v1",
      created_by: user.id,
    })
    .select("id")
    .single();

  if (error || !report) return { error: error?.message ?? "สร้างรายงานไม่สำเร็จ" };

  await logAuditEvent({
    workspaceId: workspace.id,
    action: "report.created",
    resourceType: "report",
    resourceId: report.id,
    metadata: { elderId, periodDays },
  });

  revalidatePath(`/elders/${elderId}/reports`);
  redirect(`/elders/${elderId}/reports/${report.id}/review`);
}

export async function updateReportReviewAction(
  elderId: string,
  reportId: string,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const user = await requireUser();
  const { workspace, membership } = await requireWorkspace();

  if (!canManageWorkspace(membership.role)) {
    return { error: "ไม่มีสิทธิ์ตรวจทานรายงาน" };
  }

  const parsed = reportReviewSchema.safeParse({
    summary: formData.get("summary"),
    key_observations: parseTextareaList(formData.get("key_observations")),
    missed_routines: parseTextareaList(formData.get("missed_routines")),
    values_outside_user_configured_ranges: parseTextareaList(
      formData.get("values_outside_user_configured_ranges"),
    ),
    questions_for_doctor: parseTextareaList(formData.get("questions_for_doctor")),
    caregiver_notes_summary: parseTextareaList(formData.get("caregiver_notes_summary")),
    safety_disclaimer: formData.get("safety_disclaimer"),
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("reports")
    .update({
      status: "reviewed",
      reviewed_output: parsed.data,
      summary_text: parsed.data.summary,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", reportId)
    .eq("elder_id", elderId)
    .eq("workspace_id", workspace.id);

  if (error) return { error: error.message };

  await logAuditEvent({
    workspaceId: workspace.id,
    action: "report.reviewed",
    resourceType: "report",
    resourceId: reportId,
    metadata: { elderId },
  });

  revalidatePath(`/elders/${elderId}/reports/${reportId}/review`);
  revalidatePath(`/elders/${elderId}/reports`);
  return { success: true };
}

export async function markReportExportedAction(
  elderId: string,
  reportId: string,
): Promise<void> {
  const { workspace, membership } = await requireWorkspace();
  if (!canManageWorkspace(membership.role)) {
    throw new Error("ไม่มีสิทธิ์ export รายงาน");
  }

  const supabase = await createClient();
  const pdfUrl = `/elders/${elderId}/reports/${reportId}/export`;
  const { data: report, error } = await supabase
    .from("reports")
    .update({
      status: "exported",
      pdf_url: pdfUrl,
      exported_at: new Date().toISOString(),
    })
    .eq("id", reportId)
    .eq("elder_id", elderId)
    .eq("workspace_id", workspace.id)
    .in("status", ["reviewed", "exported"])
    .select("id")
    .single();

  if (error || !report) throw new Error("กรุณาตรวจทานรายงานก่อน export");

  await logAuditEvent({
    workspaceId: workspace.id,
    action: "report.exported",
    resourceType: "report",
    resourceId: reportId,
    metadata: { elderId },
  });

  revalidatePath(`/elders/${elderId}/reports/${reportId}/review`);
  redirect(pdfUrl);
}

export async function createReportShareAction(
  elderId: string,
  reportId: string,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const user = await requireUser();
  const { workspace, membership } = await requireWorkspace();

  if (!canManageWorkspace(membership.role)) {
    return { error: "ไม่มีสิทธิ์สร้างลิงก์แชร์" };
  }

  const parsed = shareReportSchema.safeParse({
    expiresInDays: formData.get("expiresInDays") || 7,
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
  }

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + parsed.data.expiresInDays);

  const supabase = await createClient();
  const { data: share, error } = await supabase
    .from("report_shares")
    .insert({
      report_id: reportId,
      expires_at: expiresAt.toISOString(),
      created_by: user.id,
    })
    .select("token")
    .single();

  if (error || !share) return { error: error?.message ?? "สร้างลิงก์แชร์ไม่สำเร็จ" };

  await logAuditEvent({
    workspaceId: workspace.id,
    action: "report.shared",
    resourceType: "report",
    resourceId: reportId,
    metadata: { elderId, expiresInDays: parsed.data.expiresInDays },
  });

  revalidatePath(`/elders/${elderId}/reports/${reportId}/review`);
  redirect(`/elders/${elderId}/reports/${reportId}/review?share=${share.token}`);
}

export async function getReportsForElder(elderId: string): Promise<CareReport[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reports")
    .select("*")
    .eq("elder_id", elderId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(parseReport);
}

export async function getReport(reportId: string): Promise<CareReport | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reports")
    .select("*, elders(full_name, nickname)")
    .eq("id", reportId)
    .single();

  if (error || !data) return null;
  return parseReport(data);
}

export async function getLatestReportShares(reportId: string): Promise<ReportShare[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("report_shares")
    .select("*")
    .eq("report_id", reportId)
    .is("revoked_at", null)
    .order("created_at", { ascending: false })
    .limit(5);

  if (error) throw error;
  return (data ?? []) as ReportShare[];
}

export async function getSharedReport(token: string): Promise<ReportShare | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("report_shares")
    .select("*, reports(*, elders(full_name, nickname))")
    .eq("token", token)
    .is("revoked_at", null)
    .gt("expires_at", new Date().toISOString())
    .single();

  if (error || !data) return null;
  return {
    ...(data as ReportShare),
    reports: parseReport((data as ReportShare).reports),
  };
}

function parseReport(raw: unknown): CareReport {
  const report = raw as CareReport;
  return {
    ...report,
    ai_output: aiReportSchema.parse(report.ai_output),
    reviewed_output: report.reviewed_output
      ? aiReportSchema.parse(report.reviewed_output)
      : null,
  };
}

function parseTextareaList(value: FormDataEntryValue | null): string[] {
  if (typeof value !== "string") return [];
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}
