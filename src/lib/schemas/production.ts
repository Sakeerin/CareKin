import { z } from "zod";

const urlOrPathSchema = z
  .string()
  .refine((value) => value === "" || value.startsWith("/") || z.string().url().safeParse(value).success, {
    message: "ต้องเป็น URL หรือ path ที่ขึ้นต้นด้วย /",
  });

export const productionCheckSchema = z.object({
  category: z.enum([
    "migration",
    "rls",
    "e2e",
    "billing",
    "monitoring",
    "backup",
    "security",
    "performance",
    "accessibility",
    "release",
  ]),
  title: z.string().min(1, "กรุณาระบุ check").max(200),
  status: z.enum(["not_started", "in_progress", "passed", "failed", "waived"]),
  evidenceUrl: z.string().url("URL ไม่ถูกต้อง").optional().or(z.literal("")),
  notes: z.string().max(2000).optional().or(z.literal("")),
  dueAt: z.string().optional().or(z.literal("")),
});

export const operationalDrillSchema = z.object({
  drillType: z.enum(["backup_restore", "incident_response", "rollback", "security_review"]),
  status: z.enum(["scheduled", "completed", "failed", "cancelled"]),
  scheduledFor: z.string().optional().or(z.literal("")),
  ownerName: z.string().max(120).optional().or(z.literal("")),
  findings: z.string().max(2500).optional().or(z.literal("")),
  followUpActions: z.string().max(2500).optional().or(z.literal("")),
});

export const releaseReadinessSchema = z.object({
  releaseName: z.string().min(1, "กรุณาระบุ release").max(160),
  targetEnvironment: z.string().min(1).max(80),
  status: z.enum(["draft", "ready", "released", "rolled_back"]),
  commitSha: z.string().max(80).optional().or(z.literal("")),
  migrationVersion: z.string().max(120).optional().or(z.literal("")),
  healthCheckUrl: urlOrPathSchema.optional().or(z.literal("")),
  rollbackPlan: z.string().max(2500).optional().or(z.literal("")),
  migrationsApplied: z.boolean(),
  buildPassed: z.boolean(),
  rlsPassed: z.boolean(),
  backupVerified: z.boolean(),
  monitoringReady: z.boolean(),
});
