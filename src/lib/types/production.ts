export type ProductionCheckStatus = "not_started" | "in_progress" | "passed" | "failed" | "waived";
export type ProductionCheckCategory =
  | "migration"
  | "rls"
  | "e2e"
  | "billing"
  | "monitoring"
  | "backup"
  | "security"
  | "performance"
  | "accessibility"
  | "release";
export type OperationalDrillType = "backup_restore" | "incident_response" | "rollback" | "security_review";
export type OperationalDrillStatus = "scheduled" | "completed" | "failed" | "cancelled";
export type ReleaseReadinessStatus = "draft" | "ready" | "released" | "rolled_back";

export const PRODUCTION_CHECK_CATEGORY_LABELS: Record<ProductionCheckCategory, string> = {
  migration: "Migrations",
  rls: "RLS / data access",
  e2e: "E2E core flows",
  billing: "Billing",
  monitoring: "Monitoring",
  backup: "Backup / restore",
  security: "Security",
  performance: "Performance",
  accessibility: "Accessibility",
  release: "Release",
};

export interface ProductionReadinessCheck {
  id: string;
  workspace_id: string | null;
  category: ProductionCheckCategory;
  title: string;
  status: ProductionCheckStatus;
  evidence_url: string | null;
  notes: string | null;
  due_at: string | null;
  completed_at: string | null;
  recorded_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface OperationalDrill {
  id: string;
  workspace_id: string | null;
  drill_type: OperationalDrillType;
  status: OperationalDrillStatus;
  scheduled_for: string | null;
  completed_at: string | null;
  owner_name: string | null;
  findings: string | null;
  follow_up_actions: string | null;
  recorded_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReleaseReadinessReview {
  id: string;
  workspace_id: string | null;
  release_name: string;
  target_environment: string;
  status: ReleaseReadinessStatus;
  commit_sha: string | null;
  migration_version: string | null;
  health_check_url: string | null;
  rollback_plan: string | null;
  checklist: Record<string, unknown>;
  approved_by: string | null;
  approved_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductionReadinessSummary {
  totalChecks: number;
  passedChecks: number;
  failedChecks: number;
  openCriticalCategories: ProductionCheckCategory[];
  latestRelease: ReleaseReadinessReview | null;
}
