import { z } from "zod";

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
