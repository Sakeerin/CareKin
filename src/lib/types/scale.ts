export type FeatureGateStatus = "pending_review" | "approved" | "blocked" | "retired";
export type MarketplaceRequestStatus =
  | "requested"
  | "reviewing"
  | "matched"
  | "declined"
  | "completed"
  | "cancelled";
export type TelecareSessionStatus = "requested" | "scheduled" | "ready" | "completed" | "cancelled";
export type DeviceIntegrationStatus = "requested" | "pending_consent" | "connected" | "paused" | "revoked";
export type ClinicalReferralStatus = "draft" | "sent" | "accepted" | "declined" | "completed" | "cancelled";
export type WellnessEnrollmentStatus = "interested" | "enrolled" | "active" | "paused" | "completed" | "cancelled";
export type ScaleIncidentSeverity = "low" | "medium" | "high" | "critical";
export type ScaleIncidentStatus = "open" | "triaged" | "mitigated" | "closed";
export type Locale = "th" | "en";

export type Phase8FeatureKey =
  | "caregiver_marketplace"
  | "facility_dashboard"
  | "telecare_sessions"
  | "medical_device_integration"
  | "fall_detection"
  | "ai_voice_checkin"
  | "dementia_friendly_ux"
  | "clinic_referrals"
  | "insurance_wellness"
  | "multilingual";

export const PHASE8_FEATURE_LABELS: Record<Phase8FeatureKey, string> = {
  caregiver_marketplace: "Caregiver marketplace",
  facility_dashboard: "Facility dashboard",
  telecare_sessions: "Telecare sessions",
  medical_device_integration: "Medical device integration",
  fall_detection: "Fall detection",
  ai_voice_checkin: "AI voice check-in",
  dementia_friendly_ux: "Dementia-friendly UX",
  clinic_referrals: "Clinic referral workflow",
  insurance_wellness: "Insurance wellness package",
  multilingual: "Multilingual support",
};

export const CLINICAL_ADJACENT_FEATURES: Phase8FeatureKey[] = [
  "telecare_sessions",
  "medical_device_integration",
  "fall_detection",
  "ai_voice_checkin",
  "clinic_referrals",
];

export interface FeatureGate {
  id: string;
  workspace_id: string | null;
  feature_key: Phase8FeatureKey;
  status: FeatureGateStatus;
  review_notes: string | null;
  approved_by: string | null;
  approved_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Facility {
  id: string;
  workspace_id: string;
  name: string;
  facility_type: string;
  capacity: number | null;
  address: string | null;
  contact_name: string | null;
  contact_phone: string | null;
  notes: string | null;
}

export interface CaregiverProfile {
  id: string;
  user_id: string;
  display_name: string;
  service_area: string | null;
  skills: string[];
  verification_status: string;
  bio: string | null;
  hourly_rate_thb: number | null;
  active: boolean;
}

export interface MarketplaceRequest {
  id: string;
  workspace_id: string;
  elder_id: string | null;
  status: MarketplaceRequestStatus;
  care_need: string;
  schedule_notes: string | null;
  preferred_area: string | null;
  matched_caregiver_profile_id: string | null;
  internal_notes: string | null;
  created_at: string;
}

export interface TelecareSession {
  id: string;
  workspace_id: string;
  elder_id: string | null;
  clinician_name: string | null;
  scheduled_at: string | null;
  status: TelecareSessionStatus;
  provider: string | null;
  room_reference: string | null;
  consent_confirmed: boolean;
  agenda: string | null;
  outcome_notes: string | null;
  created_at: string;
}

export interface DeviceIntegration {
  id: string;
  workspace_id: string;
  elder_id: string | null;
  vendor: string;
  device_type: string;
  status: DeviceIntegrationStatus;
  consent_confirmed: boolean;
  external_reference: string | null;
  notes: string | null;
  created_at: string;
}

export interface ClinicalReferral {
  id: string;
  workspace_id: string;
  elder_id: string | null;
  report_id: string | null;
  clinic_name: string;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  reason: string;
  status: ClinicalReferralStatus;
  created_at: string;
}

export interface WellnessProgram {
  id: string;
  workspace_id: string | null;
  name: string;
  partner_name: string | null;
  program_type: string;
  description: string | null;
  active: boolean;
}

export interface WellnessEnrollment {
  id: string;
  program_id: string;
  workspace_id: string;
  elder_id: string | null;
  status: WellnessEnrollmentStatus;
  goals: string | null;
  created_at: string;
  wellness_programs?: WellnessProgram;
}

export interface ScaleIncident {
  id: string;
  workspace_id: string | null;
  feature_key: Phase8FeatureKey;
  severity: ScaleIncidentSeverity;
  status: ScaleIncidentStatus;
  title: string;
  description: string;
  mitigation_notes: string | null;
  created_at: string;
}
