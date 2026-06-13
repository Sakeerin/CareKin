import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Workspace, WorkspaceMember, WorkspaceRole } from "@/lib/types/database";

export async function getSessionUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function requireUser() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return user;
}

export async function getUserWorkspaces(): Promise<
  (WorkspaceMember & { workspaces: Workspace })[]
> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("workspace_members")
    .select("*, workspaces(*)")
    .eq("status", "active");

  if (error) throw error;
  return (data ?? []) as (WorkspaceMember & { workspaces: Workspace })[];
}

export async function getActiveWorkspace(): Promise<{
  workspace: Workspace;
  membership: WorkspaceMember;
} | null> {
  const memberships = await getUserWorkspaces();
  if (memberships.length === 0) return null;

  const first = memberships[0];
  return {
    workspace: first.workspaces,
    membership: first,
  };
}

export async function requireWorkspace() {
  const ctx = await getActiveWorkspace();
  if (!ctx) redirect("/workspace/new");
  return ctx;
}

export function canManageWorkspace(role: WorkspaceRole): boolean {
  return role === "owner" || role === "family_admin";
}

export function canManageMembers(role: WorkspaceRole): boolean {
  return role === "owner";
}

export function canManageElders(role: WorkspaceRole): boolean {
  return role === "owner" || role === "family_admin";
}
