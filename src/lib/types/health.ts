import type { CareAlertSeverity } from "@/lib/types/care-tasks";

export type CheckInMood = "good" | "okay" | "bad";
export type CheckInSleep = "good" | "okay" | "bad";
export type VitalMetric =
  | "systolic"
  | "diastolic"
  | "pulse"
  | "blood_sugar"
  | "temperature"
  | "spo2"
  | "weight";

export interface DailyCheckIn {
  id: string;
  elder_id: string;
  check_in_date: string;
  mood: CheckInMood;
  has_symptoms: boolean;
  had_fall: boolean;
  appetite_normal: boolean;
  sleep: CheckInSleep;
  note: string | null;
  recorded_by: string | null;
  recorded_at: string;
  created_at: string;
  updated_at: string;
}

export interface VitalLog {
  id: string;
  elder_id: string;
  measured_at: string;
  systolic: number | null;
  diastolic: number | null;
  pulse: number | null;
  blood_sugar: number | null;
  temperature: number | null;
  spo2: number | null;
  weight: number | null;
  note: string | null;
  recorded_by: string | null;
  created_at: string;
}

export interface AlertRule {
  id: string;
  elder_id: string;
  metric: VitalMetric;
  min_value: number | null;
  max_value: number | null;
  severity: CareAlertSeverity;
  enabled: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface HealthDashboardSummary {
  totalElders: number;
  checkedInToday: number;
  abnormalVitalsToday: number;
  latestCheckIns: (DailyCheckIn & {
    elders?: { full_name: string; nickname: string | null };
  })[];
  latestVitals: (VitalLog & {
    elders?: { full_name: string; nickname: string | null };
  })[];
}

export const MOOD_LABELS: Record<CheckInMood, string> = {
  good: "ดี",
  okay: "ปกติ",
  bad: "ไม่ดี",
};

export const SLEEP_LABELS: Record<CheckInSleep, string> = {
  good: "หลับดี",
  okay: "พอใช้",
  bad: "หลับไม่ดี",
};

export const VITAL_METRIC_LABELS: Record<VitalMetric, string> = {
  systolic: "ความดัน SYS",
  diastolic: "ความดัน DIA",
  pulse: "ชีพจร",
  blood_sugar: "น้ำตาล",
  temperature: "อุณหภูมิ",
  spo2: "ออกซิเจน",
  weight: "น้ำหนัก",
};

export const VITAL_METRIC_UNITS: Record<VitalMetric, string> = {
  systolic: "mmHg",
  diastolic: "mmHg",
  pulse: "bpm",
  blood_sugar: "mg/dL",
  temperature: "°C",
  spo2: "%",
  weight: "kg",
};

export const DEFAULT_VITAL_RULES: Record<
  VitalMetric,
  { minValue?: number; maxValue?: number; severity: CareAlertSeverity }
> = {
  systolic: { minValue: 90, maxValue: 160, severity: "family" },
  diastolic: { minValue: 50, maxValue: 100, severity: "family" },
  pulse: { minValue: 50, maxValue: 110, severity: "family" },
  blood_sugar: { minValue: 70, maxValue: 250, severity: "family" },
  temperature: { minValue: 35, maxValue: 38, severity: "family" },
  spo2: { minValue: 92, severity: "urgent" },
  weight: { severity: "info" },
};

export const VITAL_METRICS = Object.keys(VITAL_METRIC_LABELS) as VitalMetric[];
