export type TaskEventStatus = "pending" | "completed" | "missed" | "skipped";
export type TaskSourceType = "medication_schedule" | "care_task";
export type ReminderChannel = "web" | "line" | "both";
export type QueueStatus = "queued" | "sent" | "failed" | "cancelled";
export type CareAlertSeverity = "info" | "family" | "urgent";
export type CareAlertStatus = "open" | "acknowledged" | "resolved";

export interface Medication {
  id: string;
  elder_id: string;
  name: string;
  dosage_text: string | null;
  instruction: string | null;
  start_date: string;
  end_date: string | null;
  active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  medication_schedules?: MedicationSchedule[];
}

export interface MedicationSchedule {
  id: string;
  medication_id: string;
  schedule_time: string;
  timezone: string;
  label: string | null;
  active: boolean;
  created_at: string;
}

export interface CareTask {
  id: string;
  elder_id: string;
  task_type: string;
  title: string;
  instruction: string | null;
  schedule_time: string;
  timezone: string;
  active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface TaskEvent {
  id: string;
  elder_id: string;
  source_type: TaskSourceType;
  source_id: string;
  title: string;
  instruction: string | null;
  due_at: string;
  status: TaskEventStatus;
  completed_by: string | null;
  completed_at: string | null;
  missed_at: string | null;
  skip_reason: string | null;
  note: string | null;
  event_date: string;
  created_at: string;
  updated_at: string;
  elders?: { full_name: string; nickname: string | null; workspace_id: string };
}

export interface ReminderQueueItem {
  id: string;
  task_event_id: string;
  channel: ReminderChannel;
  status: QueueStatus;
  scheduled_at: string;
  sent_at: string | null;
  attempts: number;
  last_error: string | null;
  task_events?: TaskEvent;
}

export interface NotificationLog {
  id: string;
  workspace_id: string;
  elder_id: string;
  task_event_id: string | null;
  care_alert_id?: string | null;
  channel: ReminderChannel;
  notification_type: string;
  status: string;
  recipient: string | null;
  message: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface CareAlert {
  id: string;
  workspace_id: string;
  elder_id: string;
  task_event_id: string | null;
  source_type?: string | null;
  source_id?: string | null;
  alert_type: string;
  severity: CareAlertSeverity;
  title: string;
  message: string;
  status: CareAlertStatus;
  acknowledged_by: string | null;
  acknowledged_at: string | null;
  resolved_at?: string | null;
  created_at: string;
  elders?: { full_name: string; nickname: string | null };
}

export interface TodayStatusSummary {
  total: number;
  completed: number;
  pending: number;
  missed: number;
  skipped: number;
}

export const ROUTINE_TASK_TYPES = [
  { value: "routine", label: "กิจวัตรทั่วไป" },
  { value: "vitals", label: "วัดค่าสุขภาพ" },
  { value: "appointment", label: "นัดหมาย" },
  { value: "other", label: "อื่น ๆ" },
] as const;

export const REMINDER_CHANNELS = [
  { value: "web", label: "แจ้งในแอป" },
  { value: "line", label: "LINE" },
  { value: "both", label: "แอป + LINE" },
] as const;
