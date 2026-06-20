"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireUser, requireWorkspace, canManageMembers } from "@/lib/auth/session";
import {
  workspaceSchema,
  inviteSchema,
  profileSettingsSchema,
} from "@/lib/schemas/workspace";
import type { ActionResult } from "@/lib/actions/auth";
import { logAuditEvent } from "@/lib/actions/audit";

export async function createWorkspaceAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const user = await requireUser();

  const parsed = workspaceSchema.safeParse({
    name: formData.get("name"),
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("create_workspace_with_owner", {
    ws_name: parsed.data.name,
  });

  if (error) {
    return { error: error.message };
  }

  const { data: ownedWorkspace } = await supabase
    .from("workspaces")
    .select("id")
    .eq("owner_user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (ownedWorkspace) {
    await supabase
      .from("launch_invites")
      .update({ claimed_workspace_id: ownedWorkspace.id })
      .eq("claimed_by", user.id)
      .is("claimed_workspace_id", null);
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function updateWorkspaceAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const { workspace, membership } = await requireWorkspace();

  if (!canManageMembers(membership.role) && membership.role !== "family_admin") {
    return { error: "ไม่มีสิทธิ์แก้ไข workspace" };
  }

  const parsed = workspaceSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("workspaces")
    .update({ name: parsed.data.name })
    .eq("id", workspace.id);

  if (error) return { error: error.message };

  await logAuditEvent({
    workspaceId: workspace.id,
    action: "workspace.updated",
    resourceType: "workspace",
    resourceId: workspace.id,
    metadata: { name: parsed.data.name },
  });

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateProfileAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const user = await requireUser();

  const parsed = profileSettingsSchema.safeParse({
    displayName: formData.get("displayName"),
    phone: formData.get("phone"),
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: parsed.data.displayName,
      phone: parsed.data.phone || null,
    })
    .eq("id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/settings");
  return { success: true };
}

export async function inviteMemberAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const user = await requireUser();
  const { workspace, membership } = await requireWorkspace();

  if (!canManageMembers(membership.role) && membership.role !== "family_admin") {
    return { error: "ไม่มีสิทธิ์เชิญสมาชิก" };
  }

  const parsed = inviteSchema.safeParse({
    email: formData.get("email"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("workspace_invites")
    .insert({
      workspace_id: workspace.id,
      email: parsed.data.email,
      role: parsed.data.role,
      invited_by: user.id,
    })
    .select("token")
    .single();

  if (error) return { error: error.message };

  await logAuditEvent({
    workspaceId: workspace.id,
    action: "member.invited",
    resourceType: "workspace_invite",
    metadata: { email: parsed.data.email, role: parsed.data.role },
  });

  revalidatePath("/members");
  return { success: true };
}

export async function acceptInviteAction(token: string): Promise<void> {
  await requireUser();
  const supabase = await createClient();

  const { error } = await supabase.rpc("accept_workspace_invite", {
    invite_token: token,
  });

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function acceptInviteFormAction(formData: FormData): Promise<void> {
  const token = formData.get("token") as string;
  if (!token) throw new Error("ไม่พบ token");
  await acceptInviteAction(token);
}
