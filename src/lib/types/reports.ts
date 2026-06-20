import type { AiReportOutput } from "@/lib/schemas/report";
import type { CareAlert } from "@/lib/types/care-tasks";
import type { DailyCheckIn, VitalLog } from "@/lib/types/health";

export type ReportStatus = "draft" | "reviewed" | "exported";
export type ReportType = "weekly" | "doctor_visit";
export type ReportPeriodDays = 7 | 14 | 30;

export interface ReportAggregate {
  elder: {
    id: string;
    fullName: string;
    nickname: string | null;
    chronicConditions: string[];
  };
  period: {
    days: ReportPeriodDays;
    startDate: string;
    endDate: string;
  };
  medicationAdherence: {
    total: number;
    completed: number;
    missed: number;
    skipped: number;
    percent: number;
  };
  checkIns: {
    completed: number;
    expected: number;
    concerning: number;
    items: DailyCheckIn[];
  };
  vitals: {
    count: number;
    latest: VitalLog[];
    averages: {
      systolic: number | null;
      diastolic: number | null;
      pulse: number | null;
      bloodSugar: number | null;
    };
  };
  alerts: {
    total: number;
    urgent: number;
    family: number;
    acknowledged: number;
    items: CareAlert[];
  };
  caregiverNotes: string[];
  missedRoutines: string[];
  outOfRangeValues: string[];
}

export interface CareReport {
  id: string;
  workspace_id: string;
  elder_id: string;
  report_type: ReportType;
  period_days: ReportPeriodDays;
  period_start: string;
  period_end: string;
  status: ReportStatus;
  aggregate_json: ReportAggregate;
  ai_output: AiReportOutput;
  reviewed_output: AiReportOutput | null;
  summary_text: string | null;
  ai_model: string | null;
  prompt_version: string;
  pdf_url: string | null;
  created_by: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  exported_at: string | null;
  created_at: string;
  updated_at: string;
  elders?: { full_name: string; nickname: string | null };
}

export interface ReportShare {
  id: string;
  report_id: string;
  token: string;
  expires_at: string;
  revoked_at: string | null;
  created_by: string | null;
  created_at: string;
  reports?: CareReport;
}
