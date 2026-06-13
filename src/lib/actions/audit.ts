"use server";

import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/session";
import type { AuditLog } from "@/lib/types/database";

interface LogAuditParams {
  workspaceId: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
}

export async function logAuditEvent(params: LogAuditParams) {
  const user = await requireUser();
  const supabase = await createClient();

  await supabase.from("audit_logs").insert({
    workspace_id: params.workspaceId,
    actor_user_id: user.id,
    action: params.action,
    resource_type: params.resourceType,
    resource_id: params.resourceId ?? null,
    metadata: params.metadata ?? {},
  });
}

export async function getAuditLogs(
  workspaceId: string,
  limit = 50,
): Promise<AuditLog[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("audit_logs")
    .select("*, profiles(display_name, email)")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as AuditLog[];
}
