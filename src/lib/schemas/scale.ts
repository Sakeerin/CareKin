import { z } from "zod";
import { CLINICAL_ADJACENT_FEATURES } from "@/lib/types/scale";

export const phase8FeatureSchema = z.enum([
  "caregiver_marketplace",
  "facility_dashboard",
  "telecare_sessions",
  "medical_device_integration",
  "fall_detection",
  "ai_voice_checkin",
  "dementia_friendly_ux",
  "clinic_referrals",
  "insurance_wellness",
  "multilingual",
]);

export const localeSchema = z.enum(["th", "en"]);

export const featureGateSchema = z.object({
  featureKey: phase8FeatureSchema,
  status: z.enum(["pending_review", "approved", "blocked", "retired"]),
  reviewNotes: z.string().max(2000).optional().or(z.literal("")),
});

export const facilitySchema = z.object({
  name: z.string().min(1, "กรุณากรอกชื่อ facility").max(160),
  facilityType: z.string().min(1).max(80),
  capacity: z.coerce.number().int().positive().optional().or(z.literal("")),
  address: z.string().max(500).optional().or(z.literal("")),
  contactName: z.string().max(120).optional().or(z.literal("")),
  contactPhone: z.string().max(40).optional().or(z.literal("")),
  notes: z.string().max(2000).optional().or(z.literal("")),
});

export const caregiverProfileSchema = z.object({
  displayName: z.string().min(1, "กรุณากรอกชื่อ").max(120),
  serviceArea: z.string().max(160).optional().or(z.literal("")),
  skills: z.string().max(500).optional().or(z.literal("")),
  bio: z.string().max(1500).optional().or(z.literal("")),
  hourlyRateThb: z.coerce.number().int().positive().optional().or(z.literal("")),
  active: z.boolean(),
});

export const marketplaceRequestSchema = z.object({
  elderId: z.string().uuid().optional().or(z.literal("")),
  careNeed: z.string().min(1, "กรุณาระบุ care need").max(1500),
  scheduleNotes: z.string().max(1000).optional().or(z.literal("")),
  preferredArea: z.string().max(160).optional().or(z.literal("")),
});

export const telecareSessionSchema = z.object({
  elderId: z.string().uuid().optional().or(z.literal("")),
  clinicianName: z.string().max(160).optional().or(z.literal("")),
  scheduledAt: z.string().optional().or(z.literal("")),
  provider: z.string().max(80).optional().or(z.literal("")),
  agenda: z.string().min(1, "กรุณาระบุ agenda").max(1500),
  consentConfirmed: z.boolean(),
});

export const deviceIntegrationSchema = z.object({
  elderId: z.string().uuid().optional().or(z.literal("")),
  vendor: z.string().min(1, "กรุณาระบุ vendor").max(120),
  deviceType: z.string().min(1, "กรุณาระบุ device type").max(120),
  externalReference: z.string().max(200).optional().or(z.literal("")),
  consentConfirmed: z.boolean(),
  notes: z.string().max(1500).optional().or(z.literal("")),
});

export const clinicalReferralSchema = z.object({
  elderId: z.string().uuid().optional().or(z.literal("")),
  reportId: z.string().uuid().optional().or(z.literal("")),
  clinicName: z.string().min(1, "กรุณาระบุ clinic").max(180),
  contactName: z.string().max(120).optional().or(z.literal("")),
  contactEmail: z.string().email("อีเมลไม่ถูกต้อง").optional().or(z.literal("")),
  contactPhone: z.string().max(40).optional().or(z.literal("")),
  reason: z.string().min(1, "กรุณาระบุเหตุผลการส่งต่อ").max(2000),
});

export const wellnessProgramSchema = z.object({
  name: z.string().min(1, "กรุณาระบุชื่อ program").max(180),
  partnerName: z.string().max(180).optional().or(z.literal("")),
  programType: z.string().max(80).optional().or(z.literal("")),
  description: z.string().max(1500).optional().or(z.literal("")),
});

export const wellnessEnrollmentSchema = z.object({
  programId: z.string().uuid(),
  elderId: z.string().uuid().optional().or(z.literal("")),
  status: z.enum(["interested", "enrolled", "active", "paused", "completed", "cancelled"]),
  goals: z.string().max(1500).optional().or(z.literal("")),
});

export const scaleIncidentSchema = z.object({
  featureKey: phase8FeatureSchema,
  severity: z.enum(["low", "medium", "high", "critical"]),
  title: z.string().min(1, "กรุณาระบุหัวข้อ").max(200),
  description: z.string().min(1, "กรุณาระบุรายละเอียด").max(3000),
});

export const clinicalFeatureKeys = new Set<string>(CLINICAL_ADJACENT_FEATURES);

export function parseCommaList(value: string | null | undefined): string[] {
  return (value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}
