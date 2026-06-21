"use server";

import { revalidatePath } from "next/cache";
import { canManageWorkspace, requireUser, requireWorkspace } from "@/lib/auth/session";
import type { ActionResult } from "@/lib/actions/auth";
import { logAuditEvent } from "@/lib/actions/audit";
import { createClient } from "@/lib/supabase/server";
import {
  operationalDrillSchema,
  productionCheckSchema,
  releaseReadinessSchema,
} from "@/lib/schemas/production";
import type {
  OperationalDrill,
  ProductionCheckCategory,
  ProductionReadinessCheck,
  ProductionReadinessSummary,
  ReleaseReadinessReview,
} from "@/lib/types/production";

function nullable(value: string | undefined): string | null {
  return value?.trim() ? value.trim() : null;
}

async function requireProductionAdmin(): Promise<
  | { ok: true; userId: string; workspaceId: string }
  | { ok: false; result: ActionResult }
> {
  const user = await requireUser();
  const { workspace, membership } = await requireWorkspace();
  if (!canManageWorkspace(membership.role)) {
    return { ok: false, result: { error: "เฉพาะ owner / family admin เท่านั้นที่จัดการ production readiness ได้" } };
  }
  return { ok: true, userId: user.id, workspaceId: workspace.id };
}

export async function upsertProductionCheckAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const admin = await requireProductionAdmin();
  if (!admin.ok) return admin.result;

  const parsed = productionCheckSchema.safeParse({
    category: formData.get("category"),
    title: formData.get("title"),
    status: formData.get("status"),
    evidenceUrl: formData.get("evidenceUrl"),
    notes: formData.get("notes"),
    dueAt: formData.get("dueAt"),
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
  }

  const completedAt = ["passed", "failed", "waived"].includes(parsed.data.status)
    ? new Date().toISOString()
    : null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("production_readiness_checks")
    .insert({
      workspace_id: admin.workspaceId,
      category: parsed.data.category,
      title: parsed.data.title,
      status: parsed.data.status,
      evidence_url: nullable(parsed.data.evidenceUrl),
      notes: nullable(parsed.data.notes),
      due_at: nullable(parsed.data.dueAt),
      completed_at: completedAt,
      recorded_by: admin.userId,
    })
    .select("id")
    .single();

  if (error || !data) return { error: error?.message ?? "บันทึก readiness check ไม่สำเร็จ" };

  await logAuditEvent({
    workspaceId: admin.workspaceId,
    action: "production.check_recorded",
    resourceType: "production_readiness_check",
    resourceId: data.id,
    metadata: { category: parsed.data.category, status: parsed.data.status },
  });

  revalidatePath("/ops/production");
  return { success: true };
}

export async function createOperationalDrillAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const admin = await requireProductionAdmin();
  if (!admin.ok) return admin.result;

  const parsed = operationalDrillSchema.safeParse({
    drillType: formData.get("drillType"),
    status: formData.get("status"),
    scheduledFor: formData.get("scheduledFor"),
    ownerName: formData.get("ownerName"),
    findings: formData.get("findings"),
    followUpActions: formData.get("followUpActions"),
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
  }

  const completedAt = ["completed", "failed"].includes(parsed.data.status)
    ? new Date().toISOString()
    : null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("operational_drills")
    .insert({
      workspace_id: admin.workspaceId,
      drill_type: parsed.data.drillType,
      status: parsed.data.status,
      scheduled_for: nullable(parsed.data.scheduledFor),
      completed_at: completedAt,
      owner_name: nullable(parsed.data.ownerName),
      findings: nullable(parsed.data.findings),
      follow_up_actions: nullable(parsed.data.followUpActions),
      recorded_by: admin.userId,
    })
    .select("id")
    .single();

  if (error || !data) return { error: error?.message ?? "บันทึก drill ไม่สำเร็จ" };

  await logAuditEvent({
    workspaceId: admin.workspaceId,
    action: "production.drill_recorded",
    resourceType: "operational_drill",
    resourceId: data.id,
    metadata: { drillType: parsed.data.drillType, status: parsed.data.status },
  });

  revalidatePath("/ops/production");
  return { success: true };
}

export async function createReleaseReadinessAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const admin = await requireProductionAdmin();
  if (!admin.ok) return admin.result;

  const parsed = releaseReadinessSchema.safeParse({
    releaseName: formData.get("releaseName"),
    targetEnvironment: formData.get("targetEnvironment") || "production",
    status: formData.get("status"),
    commitSha: formData.get("commitSha"),
    migrationVersion: formData.get("migrationVersion"),
    healthCheckUrl: formData.get("healthCheckUrl"),
    rollbackPlan: formData.get("rollbackPlan"),
    migrationsApplied: formData.get("migrationsApplied") === "on",
    buildPassed: formData.get("buildPassed") === "on",
    rlsPassed: formData.get("rlsPassed") === "on",
    backupVerified: formData.get("backupVerified") === "on",
    monitoringReady: formData.get("monitoringReady") === "on",
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
  }

  const approvedAt = ["ready", "released"].includes(parsed.data.status)
    ? new Date().toISOString()
    : null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("release_readiness_reviews")
    .insert({
      workspace_id: admin.workspaceId,
      release_name: parsed.data.releaseName,
      target_environment: parsed.data.targetEnvironment,
      status: parsed.data.status,
      commit_sha: nullable(parsed.data.commitSha),
      migration_version: nullable(parsed.data.migrationVersion),
      health_check_url: nullable(parsed.data.healthCheckUrl),
      rollback_plan: nullable(parsed.data.rollbackPlan),
      checklist: {
        migrationsApplied: parsed.data.migrationsApplied,
        buildPassed: parsed.data.buildPassed,
        rlsPassed: parsed.data.rlsPassed,
        backupVerified: parsed.data.backupVerified,
        monitoringReady: parsed.data.monitoringReady,
      },
      approved_by: approvedAt ? admin.userId : null,
      approved_at: approvedAt,
      created_by: admin.userId,
    })
    .select("id")
    .single();

  if (error || !data) return { error: error?.message ?? "บันทึก release review ไม่สำเร็จ" };

  await logAuditEvent({
    workspaceId: admin.workspaceId,
    action: "production.release_review_created",
    resourceType: "release_readiness_review",
    resourceId: data.id,
    metadata: { releaseName: parsed.data.releaseName, status: parsed.data.status },
  });

  revalidatePath("/ops/production");
  return { success: true };
}

export async function getProductionDashboardData(): Promise<{
  checks: ProductionReadinessCheck[];
  drills: OperationalDrill[];
  releases: ReleaseReadinessReview[];
  summary: ProductionReadinessSummary;
}> {
  const { workspace } = await requireWorkspace();
  const supabase = await createClient();

  const [checksResult, drillsResult, releasesResult] = await Promise.all([
    supabase
      .from("production_readiness_checks")
      .select("*")
      .eq("workspace_id", workspace.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("operational_drills")
      .select("*")
      .eq("workspace_id", workspace.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("release_readiness_reviews")
      .select("*")
      .eq("workspace_id", workspace.id)
      .order("created_at", { ascending: false }),
  ]);

  if (checksResult.error) throw checksResult.error;
  if (drillsResult.error) throw drillsResult.error;
  if (releasesResult.error) throw releasesResult.error;

  const checks = (checksResult.data ?? []) as ProductionReadinessCheck[];
  const releases = (releasesResult.data ?? []) as ReleaseReadinessReview[];
  const criticalCategories: ProductionCheckCategory[] = [
    "migration",
    "rls",
    "billing",
    "monitoring",
    "backup",
    "security",
    "release",
  ];
  const passedCategories = new Set(
    checks.filter((check) => check.status === "passed").map((check) => check.category),
  );

  return {
    checks,
    drills: (drillsResult.data ?? []) as OperationalDrill[],
    releases,
    summary: {
      totalChecks: checks.length,
      passedChecks: checks.filter((check) => check.status === "passed").length,
      failedChecks: checks.filter((check) => check.status === "failed").length,
      openCriticalCategories: criticalCategories.filter((category) => !passedCategories.has(category)),
      latestRelease: releases[0] ?? null,
    },
  };
}
