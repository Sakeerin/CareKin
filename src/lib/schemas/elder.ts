import { z } from "zod";

export const elderSchema = z.object({
  fullName: z.string().min(1, "กรุณากรอกชื่อ-นามสกุล"),
  nickname: z.string().optional().or(z.literal("")),
  dateOfBirth: z.string().optional().or(z.literal("")),
  gender: z.string().optional().or(z.literal("")),
  livingArrangement: z.string().optional().or(z.literal("")),
  allergies: z.string().optional().or(z.literal("")),
  chronicConditions: z.string().optional().or(z.literal("")),
  mobilityNotes: z.string().optional().or(z.literal("")),
  preferredHospital: z.string().optional().or(z.literal("")),
  doctorContact: z.string().optional().or(z.literal("")),
  careInstructions: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
  consentGiven: z.boolean().refine((v) => v, "ต้องยินยอมการเก็บข้อมูลสุขภาพ"),
});

export const emergencyContactSchema = z.object({
  name: z.string().min(1, "กรุณากรอกชื่อ"),
  relationship: z.string().min(1, "กรุณากรอกความสัมพันธ์"),
  phone: z.string().min(9, "กรุณากรอกเบอร์โทร"),
  lineUserId: z.string().optional().or(z.literal("")),
  priority: z.coerce.number().min(1).max(10).default(1),
});

export type ElderInput = z.infer<typeof elderSchema>;
export type EmergencyContactInput = z.infer<typeof emergencyContactSchema>;
