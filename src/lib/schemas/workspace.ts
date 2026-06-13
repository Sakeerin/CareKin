import { z } from "zod";

export const workspaceSchema = z.object({
  name: z.string().min(1, "กรุณากรอกชื่อครอบครัว").max(100),
});

export const inviteSchema = z.object({
  email: z.string().email("อีเมลไม่ถูกต้อง"),
  role: z.enum([
    "family_admin",
    "family_viewer",
    "caregiver",
    "elder",
    "clinician_viewer",
  ]),
});

export const profileSettingsSchema = z.object({
  displayName: z.string().min(1, "กรุณากรอกชื่อ").max(100),
  phone: z.string().max(20).optional().or(z.literal("")),
});

export type WorkspaceInput = z.infer<typeof workspaceSchema>;
export type InviteInput = z.infer<typeof inviteSchema>;
export type ProfileSettingsInput = z.infer<typeof profileSettingsSchema>;
