import { z } from "zod";

const optionalInt = z
  .union([z.coerce.number().int(), z.literal(""), z.null()])
  .optional()
  .transform((value) => (value === "" || value === null ? undefined : value));

const optionalBool = z
  .union([z.boolean(), z.enum(["true", "false", "on", ""])])
  .optional()
  .transform((value) => value === true || value === "true" || value === "on");

export const pilotCohortSchema = z.object({
  status: z.enum(["active", "completed", "churned", "paused"]),
  pilotStartedAt: z.string().min(1, "กรุณาระบุวันเริ่ม pilot"),
  pilotEndsAt: z.string().optional().or(z.literal("")),
  onboardingCallAt: z.string().optional().or(z.literal("")),
  setupCompleted: optionalBool,
  targetFamilyCount: z.coerce.number().int().min(1).max(100),
  notes: z.string().max(2000).optional().or(z.literal("")),
});

export const pilotBaselineSchema = z.object({
  currentTools: z.string().max(500).optional().or(z.literal("")),
  careTasksPerDay: optionalInt,
  primaryPain: z.string().max(1000).optional().or(z.literal("")),
  baselineConfidenceScore: optionalInt,
  workflowNotes: z.string().max(3000).optional().or(z.literal("")),
  willingnessToPayInitial: optionalBool,
});

export const pilotInterviewSchema = z.object({
  interviewWeek: z.coerce.number().int().min(1).max(52),
  interviewDate: z.string().min(1, "กรุณาระบุวันที่สัมภาษณ์"),
  npsScore: optionalInt,
  retentionSignal: z.enum(["positive", "neutral", "at_risk", "churned"]),
  notes: z.string().min(1, "กรุณากรอก notes").max(5000),
  actionItems: z.string().max(3000).optional().or(z.literal("")),
});

export const pilotFeedbackSchema = z.object({
  feedbackType: z.enum(["bug", "ux", "support", "feature", "other"]),
  severity: z.enum(["low", "medium", "high", "critical"]),
  title: z.string().min(1, "กรุณากรอกหัวข้อ").max(200),
  description: z.string().min(1, "กรุณากรอกรายละเอียด").max(3000),
  pageUrl: z.string().max(500).optional().or(z.literal("")),
});

export const pilotFeedbackStatusSchema = z.object({
  status: z.enum(["open", "triaged", "resolved", "wont_fix"]),
  resolutionNotes: z.string().max(2000).optional().or(z.literal("")),
});

export const pilotPricingSignalSchema = z.object({
  willingnessToPay: optionalBool,
  priceBand: z.string().max(100).optional().or(z.literal("")),
  valuedFeatures: z.string().max(2000).optional().or(z.literal("")),
  objections: z.string().max(2000).optional().or(z.literal("")),
  notes: z.string().max(3000).optional().or(z.literal("")),
});

export function parseCommaList(value?: string): string[] {
  if (!value?.trim()) return [];
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}
