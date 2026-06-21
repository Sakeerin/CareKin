"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { canManageWorkspace, requireUser, requireWorkspace } from "@/lib/auth/session";
import type { ActionResult } from "@/lib/actions/auth";
import { logAuditEvent } from "@/lib/actions/audit";
import {
  caregiverProfileSchema,
  clinicalReferralSchema,
  deviceIntegrationSchema,
  facilitySchema,
  featureGateSchema,
  localeSchema,
  marketplaceRequestSchema,
  parseCommaList,
  scaleIncidentSchema,
  telecareSessionSchema,
  wellnessEnrollmentSchema,
  wellnessProgramSchema,
} from "@/lib/schemas/scale";
import { getFeatureGateError, getFeatureGates } from "@/lib/services/feature-gates";
import type {
  CaregiverProfile,
  ClinicalReferral,
  DeviceIntegration,
  Facility,
  FeatureGate,
  MarketplaceRequest,
  ScaleIncident,
  TelecareSession,
  WellnessEnrollment,
  WellnessProgram,
} from "@/lib/types/scale";

function nullable(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function optionalNumber(value: number | "" | undefined): number | null {
  return typeof value === "number" ? value : null;
}

async function validateElderInWorkspace(
  supabase: Awaited<ReturnType<typeof createClient>>,
  workspaceId: string,
  elderId: string | null,
): Promise<string | null> {
  if (!elderId) return null;
  const { data, error } = await supabase
    .from("elders")
    .select("id")
    .eq("id", elderId)
    .eq("workspace_id", workspaceId)
    .maybeSingle();
  if (error || !data) return "ผู้สูงวัยไม่อยู่ใน workspace นี้";
  return null;
}

async function validateReportInWorkspace(
  supabase: Awaited<ReturnType<typeof createClient>>,
  workspaceId: string,
  reportId: string | null,
): Promise<string | null> {
  if (!reportId) return null;
  const { data, error } = await supabase
    .from("reports")
    .select("id")
    .eq("id", reportId)
    .eq("workspace_id", workspaceId)
    .maybeSingle();
  if (error || !data) return "รายงานไม่อยู่ใน workspace นี้";
  return null;
}

async function validateWellnessProgramInWorkspace(
  supabase: Awaited<ReturnType<typeof createClient>>,
  workspaceId: string,
  programId: string,
): Promise<string | null> {
  const { data, error } = await supabase
    .from("wellness_programs")
    .select("id")
    .eq("id", programId)
    .or(`workspace_id.eq.${workspaceId},workspace_id.is.null`)
    .maybeSingle();
  if (error || !data) return "Wellness program ไม่อยู่ใน workspace นี้";
  return null;
}

async function requireScaleAdmin(): Promise<
  | { ok: true; userId: string; workspaceId: string }
  | { ok: false; result: ActionResult }
> {
  const user = await requireUser();
  const { workspace, membership } = await requireWorkspace();
  if (!canManageWorkspace(membership.role)) {
    return { ok: false, result: { error: "เฉพาะ owner / family admin เท่านั้นที่จัดการ Phase 8 ได้" } };
  }
  return { ok: true, userId: user.id, workspaceId: workspace.id };
}

export async function setPreferredLocaleAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = localeSchema.safeParse(formData.get("locale"));
  if (!parsed.success) return { error: "ภาษาไม่ถูกต้อง" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ preferred_locale: parsed.data })
    .eq("id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/settings");
  return { success: true };
}

export async function upsertFeatureGateAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const admin = await requireScaleAdmin();
  if (!admin.ok) return admin.result;

  const parsed = featureGateSchema.safeParse({
    featureKey: formData.get("featureKey"),
    status: formData.get("status"),
    reviewNotes: formData.get("reviewNotes"),
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
  }

  const approvedAt = parsed.data.status === "approved" ? new Date().toISOString() : null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("feature_gates")
    .upsert(
      {
        workspace_id: admin.workspaceId,
        feature_key: parsed.data.featureKey,
        status: parsed.data.status,
        review_notes: parsed.data.reviewNotes || null,
        approved_by: parsed.data.status === "approved" ? admin.userId : null,
        approved_at: approvedAt,
        created_by: admin.userId,
      },
      { onConflict: "workspace_id,feature_key" },
    )
    .select("id")
    .single();

  if (error || !data) return { error: error?.message ?? "บันทึก feature gate ไม่สำเร็จ" };

  await logAuditEvent({
    workspaceId: admin.workspaceId,
    action: "scale.feature_gate_upserted",
    resourceType: "feature_gate",
    resourceId: data.id,
    metadata: { featureKey: parsed.data.featureKey, status: parsed.data.status },
  });

  revalidatePath("/scale");
  revalidatePath("/compliance");
  return { success: true };
}

export async function upsertFacilityAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const admin = await requireScaleAdmin();
  if (!admin.ok) return admin.result;

  const gateError = await getFeatureGateError(admin.workspaceId, "facility_dashboard");
  if (gateError) return { error: gateError };

  const parsed = facilitySchema.safeParse({
    name: formData.get("name"),
    facilityType: formData.get("facilityType") || "care_home",
    capacity: formData.get("capacity") || undefined,
    address: formData.get("address"),
    contactName: formData.get("contactName"),
    contactPhone: formData.get("contactPhone"),
    notes: formData.get("notes"),
  });

  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };

  const supabase = await createClient();
  const { error } = await supabase.from("facilities").upsert(
    {
      workspace_id: admin.workspaceId,
      name: parsed.data.name,
      facility_type: parsed.data.facilityType,
      capacity: optionalNumber(parsed.data.capacity),
      address: nullable(parsed.data.address),
      contact_name: nullable(parsed.data.contactName),
      contact_phone: nullable(parsed.data.contactPhone),
      notes: nullable(parsed.data.notes),
      created_by: admin.userId,
    },
    { onConflict: "workspace_id" },
  );

  if (error) return { error: error.message };
  await logAuditEvent({
    workspaceId: admin.workspaceId,
    action: "scale.facility_upserted",
    resourceType: "facility",
  });
  revalidatePath("/facility");
  revalidatePath("/scale");
  return { success: true };
}

export async function upsertCaregiverProfileAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const user = await requireUser();
  const { workspace } = await requireWorkspace();
  const gateError = await getFeatureGateError(workspace.id, "caregiver_marketplace");
  if (gateError) return { error: gateError };

  const parsed = caregiverProfileSchema.safeParse({
    displayName: formData.get("displayName"),
    serviceArea: formData.get("serviceArea"),
    skills: formData.get("skills"),
    bio: formData.get("bio"),
    hourlyRateThb: formData.get("hourlyRateThb") || undefined,
    active: formData.get("active") === "true",
  });

  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };

  const supabase = await createClient();
  const { error } = await supabase.from("caregiver_profiles").upsert(
    {
      user_id: user.id,
      display_name: parsed.data.displayName,
      service_area: nullable(parsed.data.serviceArea),
      skills: parseCommaList(parsed.data.skills || ""),
      bio: nullable(parsed.data.bio),
      hourly_rate_thb: optionalNumber(parsed.data.hourlyRateThb),
      active: parsed.data.active,
    },
    { onConflict: "user_id" },
  );

  if (error) return { error: error.message };
  revalidatePath("/marketplace");
  return { success: true };
}

export async function createMarketplaceRequestAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const user = await requireUser();
  const { workspace } = await requireWorkspace();
  const gateError = await getFeatureGateError(workspace.id, "caregiver_marketplace");
  if (gateError) return { error: gateError };

  const parsed = marketplaceRequestSchema.safeParse({
    elderId: formData.get("elderId"),
    careNeed: formData.get("careNeed"),
    scheduleNotes: formData.get("scheduleNotes"),
    preferredArea: formData.get("preferredArea"),
  });

  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };

  const supabase = await createClient();
  const elderScopeError = await validateElderInWorkspace(
    supabase,
    workspace.id,
    nullable(parsed.data.elderId),
  );
  if (elderScopeError) return { error: elderScopeError };

  const { data, error } = await supabase
    .from("marketplace_requests")
    .insert({
      workspace_id: workspace.id,
      elder_id: nullable(parsed.data.elderId),
      requested_by: user.id,
      care_need: parsed.data.careNeed,
      schedule_notes: nullable(parsed.data.scheduleNotes),
      preferred_area: nullable(parsed.data.preferredArea),
    })
    .select("id")
    .single();

  if (error || !data) return { error: error?.message ?? "สร้าง marketplace request ไม่สำเร็จ" };
  await logAuditEvent({
    workspaceId: workspace.id,
    action: "scale.marketplace_request_created",
    resourceType: "marketplace_request",
    resourceId: data.id,
  });
  revalidatePath("/marketplace");
  return { success: true };
}

export async function requestTelecareSessionAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const admin = await requireScaleAdmin();
  if (!admin.ok) return admin.result;
  const gateError = await getFeatureGateError(admin.workspaceId, "telecare_sessions");
  if (gateError) return { error: gateError };

  const parsed = telecareSessionSchema.safeParse({
    elderId: formData.get("elderId"),
    clinicianName: formData.get("clinicianName"),
    scheduledAt: formData.get("scheduledAt"),
    provider: formData.get("provider"),
    agenda: formData.get("agenda"),
    consentConfirmed: formData.get("consentConfirmed") === "on",
  });

  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
  if (!parsed.data.consentConfirmed) return { error: "ต้องยืนยัน consent ก่อนขอ telecare session" };

  const supabase = await createClient();
  const elderScopeError = await validateElderInWorkspace(
    supabase,
    admin.workspaceId,
    nullable(parsed.data.elderId),
  );
  if (elderScopeError) return { error: elderScopeError };

  const { data, error } = await supabase
    .from("telecare_sessions")
    .insert({
      workspace_id: admin.workspaceId,
      elder_id: nullable(parsed.data.elderId),
      requested_by: admin.userId,
      clinician_name: nullable(parsed.data.clinicianName),
      scheduled_at: parsed.data.scheduledAt ? new Date(parsed.data.scheduledAt).toISOString() : null,
      provider: nullable(parsed.data.provider),
      agenda: parsed.data.agenda,
      consent_confirmed: true,
    })
    .select("id")
    .single();

  if (error || !data) return { error: error?.message ?? "สร้าง telecare session ไม่สำเร็จ" };
  await logAuditEvent({
    workspaceId: admin.workspaceId,
    action: "scale.telecare_requested",
    resourceType: "telecare_session",
    resourceId: data.id,
  });
  revalidatePath("/integrations");
  return { success: true };
}

export async function requestDeviceIntegrationAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const admin = await requireScaleAdmin();
  if (!admin.ok) return admin.result;
  const parsed = deviceIntegrationSchema.safeParse({
    elderId: formData.get("elderId"),
    vendor: formData.get("vendor"),
    deviceType: formData.get("deviceType"),
    externalReference: formData.get("externalReference"),
    consentConfirmed: formData.get("consentConfirmed") === "on",
    notes: formData.get("notes"),
  });

  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };

  const featureKey =
    parsed.data.deviceType.toLowerCase().includes("fall") ? "fall_detection" : "medical_device_integration";
  const gateError = await getFeatureGateError(admin.workspaceId, featureKey);
  if (gateError) return { error: gateError };
  if (!parsed.data.consentConfirmed) return { error: "ต้องยืนยัน consent ก่อนเชื่อม device" };

  const supabase = await createClient();
  const elderScopeError = await validateElderInWorkspace(
    supabase,
    admin.workspaceId,
    nullable(parsed.data.elderId),
  );
  if (elderScopeError) return { error: elderScopeError };

  const { data, error } = await supabase
    .from("device_integrations")
    .insert({
      workspace_id: admin.workspaceId,
      elder_id: nullable(parsed.data.elderId),
      vendor: parsed.data.vendor,
      device_type: parsed.data.deviceType,
      external_reference: nullable(parsed.data.externalReference),
      consent_confirmed: true,
      status: "requested",
      notes: nullable(parsed.data.notes),
      created_by: admin.userId,
    })
    .select("id")
    .single();

  if (error || !data) return { error: error?.message ?? "สร้าง device integration ไม่สำเร็จ" };
  await logAuditEvent({
    workspaceId: admin.workspaceId,
    action: "scale.device_integration_requested",
    resourceType: "device_integration",
    resourceId: data.id,
    metadata: { vendor: parsed.data.vendor, deviceType: parsed.data.deviceType },
  });
  revalidatePath("/integrations");
  return { success: true };
}

export async function createClinicalReferralAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const admin = await requireScaleAdmin();
  if (!admin.ok) return admin.result;
  const gateError = await getFeatureGateError(admin.workspaceId, "clinic_referrals");
  if (gateError) return { error: gateError };

  const parsed = clinicalReferralSchema.safeParse({
    elderId: formData.get("elderId"),
    reportId: formData.get("reportId"),
    clinicName: formData.get("clinicName"),
    contactName: formData.get("contactName"),
    contactEmail: formData.get("contactEmail"),
    contactPhone: formData.get("contactPhone"),
    reason: formData.get("reason"),
  });

  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };

  const supabase = await createClient();
  const elderScopeError = await validateElderInWorkspace(
    supabase,
    admin.workspaceId,
    nullable(parsed.data.elderId),
  );
  if (elderScopeError) return { error: elderScopeError };

  const reportScopeError = await validateReportInWorkspace(
    supabase,
    admin.workspaceId,
    nullable(parsed.data.reportId),
  );
  if (reportScopeError) return { error: reportScopeError };

  const { data, error } = await supabase
    .from("clinical_referrals")
    .insert({
      workspace_id: admin.workspaceId,
      elder_id: nullable(parsed.data.elderId),
      report_id: nullable(parsed.data.reportId),
      clinic_name: parsed.data.clinicName,
      contact_name: nullable(parsed.data.contactName),
      contact_email: nullable(parsed.data.contactEmail),
      contact_phone: nullable(parsed.data.contactPhone),
      reason: parsed.data.reason,
      created_by: admin.userId,
    })
    .select("id")
    .single();

  if (error || !data) return { error: error?.message ?? "สร้าง referral ไม่สำเร็จ" };
  await logAuditEvent({
    workspaceId: admin.workspaceId,
    action: "scale.clinical_referral_created",
    resourceType: "clinical_referral",
    resourceId: data.id,
  });
  revalidatePath("/referrals");
  return { success: true };
}

export async function createWellnessProgramAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const admin = await requireScaleAdmin();
  if (!admin.ok) return admin.result;
  const gateError = await getFeatureGateError(admin.workspaceId, "insurance_wellness");
  if (gateError) return { error: gateError };

  const parsed = wellnessProgramSchema.safeParse({
    name: formData.get("name"),
    partnerName: formData.get("partnerName"),
    programType: formData.get("programType") || "wellness",
    description: formData.get("description"),
  });

  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };

  const supabase = await createClient();
  const { error } = await supabase.from("wellness_programs").insert({
    workspace_id: admin.workspaceId,
    name: parsed.data.name,
    partner_name: nullable(parsed.data.partnerName),
    program_type: parsed.data.programType || "wellness",
    description: nullable(parsed.data.description),
  });

  if (error) return { error: error.message };
  revalidatePath("/wellness");
  return { success: true };
}

export async function createWellnessEnrollmentAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const admin = await requireScaleAdmin();
  if (!admin.ok) return admin.result;
  const gateError = await getFeatureGateError(admin.workspaceId, "insurance_wellness");
  if (gateError) return { error: gateError };

  const parsed = wellnessEnrollmentSchema.safeParse({
    programId: formData.get("programId"),
    elderId: formData.get("elderId"),
    status: formData.get("status") || "interested",
    goals: formData.get("goals"),
  });

  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };

  const supabase = await createClient();
  const [programScopeError, elderScopeError] = await Promise.all([
    validateWellnessProgramInWorkspace(supabase, admin.workspaceId, parsed.data.programId),
    validateElderInWorkspace(supabase, admin.workspaceId, nullable(parsed.data.elderId)),
  ]);
  if (programScopeError) return { error: programScopeError };
  if (elderScopeError) return { error: elderScopeError };

  const { error } = await supabase.from("wellness_enrollments").insert({
    program_id: parsed.data.programId,
    workspace_id: admin.workspaceId,
    elder_id: nullable(parsed.data.elderId),
    status: parsed.data.status,
    goals: nullable(parsed.data.goals),
    enrolled_by: admin.userId,
    enrolled_at: new Date().toISOString(),
  });

  if (error) return { error: error.message };
  revalidatePath("/wellness");
  return { success: true };
}

export async function createScaleIncidentAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const user = await requireUser();
  const { workspace } = await requireWorkspace();
  const parsed = scaleIncidentSchema.safeParse({
    featureKey: formData.get("featureKey"),
    severity: formData.get("severity"),
    title: formData.get("title"),
    description: formData.get("description"),
  });

  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };

  const supabase = await createClient();
  const { error } = await supabase.from("scale_incidents").insert({
    workspace_id: workspace.id,
    feature_key: parsed.data.featureKey,
    severity: parsed.data.severity,
    title: parsed.data.title,
    description: parsed.data.description,
    reported_by: user.id,
  });

  if (error) return { error: error.message };
  revalidatePath("/compliance");
  return { success: true };
}

export async function getScaleDashboardData(): Promise<{
  gates: FeatureGate[];
  facility: Facility | null;
  caregiverProfile: CaregiverProfile | null;
  caregiverProfiles: CaregiverProfile[];
  marketplaceRequests: MarketplaceRequest[];
  telecareSessions: TelecareSession[];
  deviceIntegrations: DeviceIntegration[];
  clinicalReferrals: ClinicalReferral[];
  wellnessPrograms: WellnessProgram[];
  wellnessEnrollments: WellnessEnrollment[];
  incidents: ScaleIncident[];
}> {
  const user = await requireUser();
  const { workspace } = await requireWorkspace();
  const supabase = await createClient();

  const [
    gates,
    facilityResult,
    caregiverProfileResult,
    caregiverProfilesResult,
    marketplaceRequestsResult,
    telecareSessionsResult,
    deviceIntegrationsResult,
    clinicalReferralsResult,
    wellnessProgramsResult,
    wellnessEnrollmentsResult,
    incidentsResult,
  ] = await Promise.all([
    getFeatureGates(workspace.id),
    supabase.from("facilities").select("*").eq("workspace_id", workspace.id).maybeSingle(),
    supabase.from("caregiver_profiles").select("*").eq("user_id", user.id).maybeSingle(),
    supabase.from("caregiver_profiles").select("*").eq("active", true).order("created_at", { ascending: false }),
    supabase.from("marketplace_requests").select("*").eq("workspace_id", workspace.id).order("created_at", { ascending: false }),
    supabase.from("telecare_sessions").select("*").eq("workspace_id", workspace.id).order("created_at", { ascending: false }),
    supabase.from("device_integrations").select("*").eq("workspace_id", workspace.id).order("created_at", { ascending: false }),
    supabase.from("clinical_referrals").select("*").eq("workspace_id", workspace.id).order("created_at", { ascending: false }),
    supabase.from("wellness_programs").select("*").or(`workspace_id.eq.${workspace.id},workspace_id.is.null`).order("created_at", { ascending: false }),
    supabase
      .from("wellness_enrollments")
      .select("*, wellness_programs(*)")
      .eq("workspace_id", workspace.id)
      .order("created_at", { ascending: false }),
    supabase.from("scale_incidents").select("*").eq("workspace_id", workspace.id).order("created_at", { ascending: false }),
  ]);

  return {
    gates,
    facility: (facilityResult.data as Facility | null) ?? null,
    caregiverProfile: (caregiverProfileResult.data as CaregiverProfile | null) ?? null,
    caregiverProfiles: (caregiverProfilesResult.data ?? []) as CaregiverProfile[],
    marketplaceRequests: (marketplaceRequestsResult.data ?? []) as MarketplaceRequest[],
    telecareSessions: (telecareSessionsResult.data ?? []) as TelecareSession[],
    deviceIntegrations: (deviceIntegrationsResult.data ?? []) as DeviceIntegration[],
    clinicalReferrals: (clinicalReferralsResult.data ?? []) as ClinicalReferral[],
    wellnessPrograms: (wellnessProgramsResult.data ?? []) as WellnessProgram[],
    wellnessEnrollments: (wellnessEnrollmentsResult.data ?? []) as WellnessEnrollment[],
    incidents: (incidentsResult.data ?? []) as ScaleIncident[],
  };
}
