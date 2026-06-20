export type PilotStatus = "active" | "completed" | "churned" | "paused";
export type PilotFeedbackType = "bug" | "ux" | "support" | "feature" | "other";
export type PilotFeedbackSeverity = "low" | "medium" | "high" | "critical";
export type PilotFeedbackStatus = "open" | "triaged" | "resolved" | "wont_fix";
export type PilotRetentionSignal = "positive" | "neutral" | "at_risk" | "churned";

export interface PilotCohort {
  id: string;
  workspace_id: string;
  status: PilotStatus;
  pilot_started_at: string;
  pilot_ends_at: string | null;
  onboarding_call_at: string | null;
  setup_completed_at: string | null;
  target_family_count: number;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface PilotBaseline {
  id: string;
  workspace_id: string;
  current_tools: string[];
  care_tasks_per_day: number | null;
  primary_pain: string | null;
  baseline_confidence_score: number | null;
  workflow_notes: string | null;
  willingness_to_pay_initial: boolean | null;
  recorded_by: string | null;
  recorded_at: string;
  created_at: string;
  updated_at: string;
}

export interface PilotInterview {
  id: string;
  workspace_id: string;
  interview_week: number;
  interview_date: string;
  nps_score: number | null;
  retention_signal: PilotRetentionSignal;
  notes: string;
  action_items: string | null;
  recorded_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface PilotFeedback {
  id: string;
  workspace_id: string;
  submitted_by: string | null;
  feedback_type: PilotFeedbackType;
  severity: PilotFeedbackSeverity;
  status: PilotFeedbackStatus;
  title: string;
  description: string;
  page_url: string | null;
  resolution_notes: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
  profiles?: { display_name: string | null; email: string };
}

export interface PilotPricingSignal {
  id: string;
  workspace_id: string;
  willingness_to_pay: boolean;
  price_band: string | null;
  valued_features: string | null;
  objections: string | null;
  notes: string | null;
  recorded_by: string | null;
  recorded_at: string;
  created_at: string;
}

export interface PilotMetricSummary {
  periodStart: string;
  periodEnd: string;
  reminderCompletionPercent: number;
  taskEventsTotal: number;
  taskEventsCompleted: number;
  weeklyActiveFamilyAdmins: number;
  familyAdminCount: number;
  reportGenerated: boolean;
  reportCount: number;
  checkInDays: number;
  feedbackOpen: number;
  criticalBugsOpen: number;
  willingnessToPayCount: number;
  success: {
    reminderCompletion: boolean;
    weeklyActiveFamilyAdmin: boolean;
    reportUsage: boolean;
    pricingEvidence: boolean;
  };
}

export interface PilotDashboardData {
  cohort: PilotCohort | null;
  baseline: PilotBaseline | null;
  interviews: PilotInterview[];
  feedback: PilotFeedback[];
  pricingSignals: PilotPricingSignal[];
  metrics: PilotMetricSummary;
}

export const PILOT_STATUS_LABELS: Record<PilotStatus, string> = {
  active: "Active",
  completed: "Completed",
  churned: "Churned",
  paused: "Paused",
};

export const PILOT_FEEDBACK_STATUS_LABELS: Record<PilotFeedbackStatus, string> = {
  open: "Open",
  triaged: "Triaged",
  resolved: "Resolved",
  wont_fix: "Won't fix",
};
