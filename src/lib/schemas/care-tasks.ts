import { z } from "zod";

export const medicationSchema = z.object({
  name: z.string().min(1, "กรุณากรอกชื่อยา"),
  dosageText: z.string().optional().or(z.literal("")),
  instruction: z.string().optional().or(z.literal("")),
  startDate: z.string().min(1, "กรุณาระบุวันเริ่ม"),
  endDate: z.string().optional().or(z.literal("")),
  scheduleTimes: z
    .string()
    .min(1, "กรุณาระบุเวลาอย่างน้อย 1 ครั้ง"),
});

export const careTaskSchema = z.object({
  title: z.string().min(1, "กรุณากรอกชื่องาน"),
  taskType: z.string().min(1),
  instruction: z.string().optional().or(z.literal("")),
  scheduleTime: z.string().min(1, "กรุณาระบุเวลา"),
});

export const confirmTaskSchema = z.object({
  action: z.enum(["completed", "skipped", "missed"]),
  skipReason: z.string().optional().or(z.literal("")),
  note: z.string().optional().or(z.literal("")),
});

export const elderReminderSchema = z.object({
  lineUserId: z.string().optional().or(z.literal("")),
  reminderChannel: z.enum(["web", "line", "both"]),
});

export type MedicationInput = z.infer<typeof medicationSchema>;
export type CareTaskInput = z.infer<typeof careTaskSchema>;
export type ConfirmTaskInput = z.infer<typeof confirmTaskSchema>;

export function parseScheduleTimes(raw: string): string[] {
  return raw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}
