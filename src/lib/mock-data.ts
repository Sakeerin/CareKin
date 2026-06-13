export type TaskStatus = "done" | "pending" | "missed";

export type AlertLevel = "info" | "family" | "urgent";

export interface ElderProfile {
  id: string;
  name: string;
  nickname: string;
  age: number;
  conditions: string[];
  emergencyContact: {
    name: string;
    relation: string;
    phone: string;
  };
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  time: string;
  status: TaskStatus;
}

export interface Routine {
  id: string;
  name: string;
  time: string;
  status: TaskStatus;
}

export interface ActivityLog {
  id: string;
  type: "check-in" | "medication" | "vital" | "alert";
  message: string;
  timestamp: string;
  status?: TaskStatus;
}

export interface Alert {
  id: string;
  level: AlertLevel;
  message: string;
  timestamp: string;
}

export interface VitalReading {
  date: string;
  systolic: number;
  diastolic: number;
  pulse: number;
  bloodSugar?: number;
}

export interface DailyTrend {
  date: string;
  checkInDone: boolean;
  medsCompleted: number;
  medsTotal: number;
}

export interface MockAiReport {
  summary: string;
  key_observations: string[];
  missed_routines: string[];
  values_outside_user_configured_ranges: string[];
  questions_for_doctor: string[];
  caregiver_notes_summary: string[];
  safety_disclaimer: string;
}

export const elderProfile: ElderProfile = {
  id: "elder-1",
  name: "สมศรี ใจดี",
  nickname: "คุณสมศรี",
  age: 78,
  conditions: ["ความดันโลหิตสูง", "เบาหวาน"],
  emergencyContact: {
    name: "สมชาย ใจดี",
    relation: "ลูกชาย",
    phone: "081-234-5678",
  },
};

export const medications: Medication[] = [
  {
    id: "med-1",
    name: "ยาความดัน (AMLODIPINE)",
    dosage: "1 เม็ด หลังอาหาร",
    time: "08:00",
    status: "done",
  },
  {
    id: "med-2",
    name: "ยาเบาหวาน (METFORMIN)",
    dosage: "1 เม็ด ก่อนอาหาร",
    time: "12:00",
    status: "done",
  },
  {
    id: "med-3",
    name: "ยาความดัน (เย็น)",
    dosage: "1 เม็ด หลังอาหาร",
    time: "18:00",
    status: "pending",
  },
];

export const routines: Routine[] = [
  {
    id: "routine-1",
    name: "วัดความดัน",
    time: "07:30",
    status: "done",
  },
  {
    id: "routine-2",
    name: "วัดน้ำตาล",
    time: "07:45",
    status: "missed",
  },
];

export const activityLogs: ActivityLog[] = [
  {
    id: "log-1",
    type: "medication",
    message: "กินยาความดัน (เช้า) — ทำแล้ว",
    timestamp: "2026-06-12T08:15:00",
    status: "done",
  },
  {
    id: "log-2",
    type: "vital",
    message: "วัดความดัน 132/82 mmHg ชีพจร 72",
    timestamp: "2026-06-12T07:35:00",
  },
  {
    id: "log-3",
    type: "check-in",
    message: "Check-in เมื่อวาน — รู้สึกดี ไม่มีอาการผิดปกติ",
    timestamp: "2026-06-11T19:00:00",
    status: "done",
  },
  {
    id: "log-4",
    type: "alert",
    message: "พลาดวัดน้ำตาลเช้า — แจ้งเตือนแล้ว",
    timestamp: "2026-06-12T08:00:00",
    status: "missed",
  },
];

export const alerts: Alert[] = [
  {
    id: "alert-1",
    level: "family",
    message: "ยังไม่ได้วัดน้ำตาลเช้าวันนี้",
    timestamp: "2026-06-12T08:00:00",
  },
  {
    id: "alert-2",
    level: "info",
    message: "Check-in เมื่อวานเสร็จสมบูรณ์",
    timestamp: "2026-06-11T19:00:00",
  },
];

export const vitalReadings: VitalReading[] = [
  { date: "2026-06-12", systolic: 132, diastolic: 82, pulse: 72, bloodSugar: 118 },
  { date: "2026-06-11", systolic: 128, diastolic: 80, pulse: 70, bloodSugar: 125 },
  { date: "2026-06-10", systolic: 135, diastolic: 85, pulse: 74, bloodSugar: 130 },
  { date: "2026-06-09", systolic: 130, diastolic: 78, pulse: 68 },
  { date: "2026-06-08", systolic: 127, diastolic: 79, pulse: 71, bloodSugar: 122 },
  { date: "2026-06-07", systolic: 133, diastolic: 81, pulse: 73, bloodSugar: 128 },
  { date: "2026-06-06", systolic: 129, diastolic: 77, pulse: 69, bloodSugar: 120 },
];

export const weeklyTrend: DailyTrend[] = [
  { date: "2026-06-06", checkInDone: true, medsCompleted: 3, medsTotal: 3 },
  { date: "2026-06-07", checkInDone: true, medsCompleted: 3, medsTotal: 3 },
  { date: "2026-06-08", checkInDone: true, medsCompleted: 2, medsTotal: 3 },
  { date: "2026-06-09", checkInDone: false, medsCompleted: 3, medsTotal: 3 },
  { date: "2026-06-10", checkInDone: true, medsCompleted: 3, medsTotal: 3 },
  { date: "2026-06-11", checkInDone: true, medsCompleted: 3, medsTotal: 3 },
  { date: "2026-06-12", checkInDone: false, medsCompleted: 2, medsTotal: 3 },
];

export const mockAiReport: MockAiReport = {
  summary:
    "จากข้อมูลที่บันทึกในช่วง 7 วันที่ผ่านมา คุณสมศรีมีการกินยาตามเวลาเป็นส่วนใหญ่ (86%) และ check-in ครบ 5 จาก 7 วัน มีการพลาดวัดน้ำตาลเช้า 1 ครั้ง",
  key_observations: [
    "ความดันโดยเฉลี่ยอยู่ในช่วง 127-135/77-85 mmHg",
    "Check-in ส่วนใหญ่รายงานว่ารู้สึกดี ไม่มีอาการผิดปกติ",
    "มีการพลาดวัดน้ำตาลเช้า 1 ครั้งในวันที่ 12 มิ.ย.",
  ],
  missed_routines: ["วัดน้ำตาลเช้า — 12 มิ.ย. 2026"],
  values_outside_user_configured_ranges: [
    "น้ำตาล 130 mg/dL วันที่ 10 มิ.ย. — อยู่นอกช่วงที่ตั้งไว้ (70-125)",
  ],
  questions_for_doctor: [
    "ควรถามแพทย์เกี่ยวกับการพลาดวัดน้ำตาลเช้าเป็นประจำหรือไม่",
    "ควรถามแพทย์เกี่ยวกับค่าน้ำตาล 130 mg/dL ที่บันทึกเมื่อ 10 มิ.ย.",
  ],
  caregiver_notes_summary: [
    "ผู้ดูแลบันทึกว่าคุณสมศรีกินอาหารได้ดีและนอนหลับพอใช้",
  ],
  safety_disclaimer:
    "สรุปนี้มาจากข้อมูลที่บันทึกในระบบเท่านั้น ไม่ใช่การวินิจฉัย กรุณาปรึกษาแพทย์หากมีข้อสงสัย",
};

export const elderTasks = [
  {
    id: "task-med-morning",
    title: "กินยาเช้า",
    subtitle: "ยาความดัน 1 เม็ด",
    type: "medication" as const,
    status: "done" as TaskStatus,
  },
  {
    id: "task-bp",
    title: "วัดความดัน",
    subtitle: "ทุกเช้า 07:30",
    type: "routine" as const,
    status: "done" as TaskStatus,
  },
  {
    id: "task-checkin",
    title: "บันทึกวันนี้",
    subtitle: "Check-in รายวัน",
    type: "check-in" as const,
    status: "pending" as TaskStatus,
  },
];

export function getMedicationAdherencePercent(): number {
  const total = weeklyTrend.reduce((sum, d) => sum + d.medsTotal, 0);
  const completed = weeklyTrend.reduce((sum, d) => sum + d.medsCompleted, 0);
  return Math.round((completed / total) * 100);
}

export function getCheckInCompletionCount(): { done: number; total: number } {
  const done = weeklyTrend.filter((d) => d.checkInDone).length;
  return { done, total: weeklyTrend.length };
}
