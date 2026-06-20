import { z } from "zod";

export const waitlistSchema = z.object({
  name: z.string().min(1, "กรุณากรอกชื่อ").max(100),
  email: z.string().email("อีเมลไม่ถูกต้อง"),
  audience: z.enum(["family", "care_provider", "clinic", "other"]),
  organization: z.string().max(120).optional().or(z.literal("")),
  phone: z.string().max(30).optional().or(z.literal("")),
  careContext: z.string().max(1200).optional().or(z.literal("")),
  referralCode: z.string().max(40).optional().or(z.literal("")),
});

export const supportTicketSchema = z.object({
  ticketType: z.enum(["bug", "billing", "privacy", "support", "feature", "other"]),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  subject: z.string().min(1, "กรุณากรอกหัวข้อ").max(200),
  description: z.string().min(1, "กรุณากรอกรายละเอียด").max(3000),
  pageUrl: z.string().max(500).optional().or(z.literal("")),
});

export const supportTicketStatusSchema = z.object({
  status: z.enum(["open", "in_progress", "waiting_customer", "resolved", "closed"]),
  resolutionNotes: z.string().max(2000).optional().or(z.literal("")),
});

export const billingPlanSchema = z.object({
  plan: z.enum(["free", "family_basic", "family_plus", "premium"]),
});

export const referralCodeSchema = z.object({
  code: z
    .string()
    .min(4, "Referral code สั้นเกินไป")
    .max(24)
    .regex(/^[A-Za-z0-9_-]+$/, "ใช้ได้เฉพาะตัวอักษร ตัวเลข _ และ -")
    .optional()
    .or(z.literal("")),
});
