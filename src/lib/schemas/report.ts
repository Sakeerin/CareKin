import { z } from "zod";

export const REPORT_PERIODS = [7, 14, 30] as const;

export const reportGenerateSchema = z.object({
  periodDays: z.coerce.number().refine((value) => REPORT_PERIODS.includes(value as 7 | 14 | 30), {
    message: "เลือกระยะเวลารายงานไม่ถูกต้อง",
  }),
  reportType: z.enum(["weekly", "doctor_visit"]),
});

export const aiReportSchema = z.object({
  summary: z.string().min(1).max(1200),
  key_observations: z.array(z.string().min(1).max(300)).max(8),
  missed_routines: z.array(z.string().min(1).max(300)).max(8),
  values_outside_user_configured_ranges: z.array(z.string().min(1).max(300)).max(8),
  questions_for_doctor: z.array(z.string().min(1).max(300)).max(8),
  caregiver_notes_summary: z.array(z.string().min(1).max(300)).max(8),
  safety_disclaimer: z.string().min(1).max(500),
});

export const reportReviewSchema = aiReportSchema.extend({
  summary: z.string().min(1, "กรุณากรอกสรุป").max(1200),
});

export const shareReportSchema = z.object({
  expiresInDays: z.coerce.number().int().min(1).max(30).default(7),
});

export type AiReportOutput = z.infer<typeof aiReportSchema>;
export type ReportReviewData = z.infer<typeof reportReviewSchema>;
