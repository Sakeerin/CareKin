import { z } from "zod";

const optionalNumber = z
  .union([z.coerce.number(), z.literal(""), z.null()])
  .optional()
  .transform((value) => (value === "" || value === null ? undefined : value));

const formBoolean = z
  .union([z.boolean(), z.enum(["true", "false", "on", ""])])
  .transform((value) => value === true || value === "true" || value === "on");

export const checkInSchema = z.object({
  elderId: z.string().min(1),
  mood: z.enum(["good", "okay", "bad"]),
  hasSymptoms: z.boolean(),
  hadFall: z.boolean(),
  appetiteNormal: z.boolean(),
  sleep: z.enum(["good", "okay", "bad"]),
  systolic: z.coerce.number().min(0).max(300).optional().or(z.literal("")),
  diastolic: z.coerce.number().min(0).max(200).optional().or(z.literal("")),
  pulse: z.coerce.number().min(0).max(250).optional().or(z.literal("")),
  bloodSugar: z.coerce.number().min(0).max(600).optional().or(z.literal("")),
  note: z.string().max(500).optional(),
});

export type CheckInFormData = z.infer<typeof checkInSchema>;

export const dailyCheckInActionSchema = z.object({
  mood: z.enum(["good", "okay", "bad"]),
  hasSymptoms: formBoolean,
  hadFall: formBoolean,
  appetiteNormal: formBoolean,
  sleep: z.enum(["good", "okay", "bad"]),
  note: z.string().max(500).optional().or(z.literal("")),
  systolic: optionalNumber,
  diastolic: optionalNumber,
  pulse: optionalNumber,
  bloodSugar: optionalNumber,
});

export const vitalLogSchema = z.object({
  measuredAt: z.string().optional().or(z.literal("")),
  systolic: optionalNumber,
  diastolic: optionalNumber,
  pulse: optionalNumber,
  bloodSugar: optionalNumber,
  temperature: optionalNumber,
  spo2: optionalNumber,
  weight: optionalNumber,
  note: z.string().max(500).optional().or(z.literal("")),
});

export const alertRuleSchema = z
  .object({
    metric: z.enum([
      "systolic",
      "diastolic",
      "pulse",
      "blood_sugar",
      "temperature",
      "spo2",
      "weight",
    ]),
    minValue: optionalNumber,
    maxValue: optionalNumber,
    severity: z.enum(["info", "family", "urgent"]),
  })
  .refine((data) => data.minValue !== undefined || data.maxValue !== undefined, {
    message: "กรุณาระบุค่าต่ำสุดหรือค่าสูงสุด",
    path: ["minValue"],
  });

export type DailyCheckInActionData = z.infer<typeof dailyCheckInActionSchema>;
export type VitalLogData = z.infer<typeof vitalLogSchema>;
export type AlertRuleData = z.infer<typeof alertRuleSchema>;

export const onboardingSchema = z.object({
  workspaceName: z.string().min(1, "กรุณากรอกชื่อครอบครัว"),
  elderName: z.string().min(1, "กรุณากรอกชื่อผู้สูงวัย"),
  elderAge: z.coerce.number().min(50).max(120),
  conditions: z.string().optional(),
  channel: z.enum(["line", "caregiver"]),
  medicationName: z.string().min(1, "กรุณากรอกชื่อยา"),
  medicationTime: z.string().min(1),
  medicationDosage: z.string().min(1),
  routineName: z.string().min(1, "กรุณากรอกชื่อ routine"),
  routineTime: z.string().min(1),
  inviteEmail: z.string().email("อีเมลไม่ถูกต้อง").optional().or(z.literal("")),
  emergencyName: z.string().min(1, "กรุณากรอกชื่อผู้ติดต่อ"),
  emergencyPhone: z.string().min(9, "กรุณากรอกเบอร์โทร"),
  checkInEnabled: z.boolean(),
});

export type OnboardingFormData = z.infer<typeof onboardingSchema>;

export const defaultOnboardingValues: OnboardingFormData = {
  workspaceName: "",
  elderName: "สมศรี ใจดี",
  elderAge: 78,
  conditions: "ความดัน, เบาหวาน",
  channel: "caregiver",
  medicationName: "ยาความดัน (AMLODIPINE)",
  medicationTime: "08:00",
  medicationDosage: "1 เม็ด หลังอาหาร",
  routineName: "วัดความดัน",
  routineTime: "07:30",
  inviteEmail: "",
  emergencyName: "สมชาย ใจดี",
  emergencyPhone: "081-234-5678",
  checkInEnabled: true,
};

export const defaultCheckInValues: CheckInFormData = {
  elderId: "elder-1",
  mood: "good",
  hasSymptoms: false,
  hadFall: false,
  appetiteNormal: true,
  sleep: "good",
  systolic: "",
  diastolic: "",
  pulse: "",
  bloodSugar: "",
  note: "",
};
