import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("อีเมลไม่ถูกต้อง"),
  password: z.string().min(6, "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"),
});

export const signupSchema = z.object({
  email: z.string().email("อีเมลไม่ถูกต้อง"),
  password: z.string().min(6, "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"),
  displayName: z.string().min(1, "กรุณากรอกชื่อ"),
  inviteCode: z.string().max(40).optional().or(z.literal("")),
  acceptedTerms: z.boolean().refine((value) => value, {
    message: "กรุณายอมรับ Terms และ Privacy Policy",
  }),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
