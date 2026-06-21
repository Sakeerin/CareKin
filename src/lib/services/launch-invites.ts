import { createAdminClient, hasAdminClient } from "@/lib/supabase/admin";

export async function validateLaunchInviteForSignup(
  code: string | null,
  email: string,
): Promise<{ ok: true; inviteId: string } | { ok: false; error: string }> {
  if (process.env.LAUNCH_INVITE_REQUIRED !== "true") {
    return { ok: true, inviteId: "" };
  }

  if (!code?.trim()) {
    return { ok: false, error: "ช่วง controlled launch ต้องใช้ invite code" };
  }

  if (!hasAdminClient()) {
    return { ok: false, error: "Launch invite validation ยังไม่ได้ตั้งค่า service role key" };
  }

  const supabase = createAdminClient();
  const normalized = code.trim().toUpperCase();
  const { data, error } = await supabase
    .from("launch_invites")
    .select("id, email, status, expires_at")
    .eq("code", normalized)
    .eq("status", "available")
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();

  if (error || !data) {
    return { ok: false, error: "Invite code ไม่ถูกต้องหรือหมดอายุ" };
  }

  if (data.email && data.email.toLowerCase() !== email.toLowerCase()) {
    return { ok: false, error: "Invite code นี้ผูกกับอีเมลอื่น" };
  }

  return { ok: true, inviteId: data.id as string };
}

export async function claimLaunchInvite(inviteId: string, userId: string): Promise<void> {
  if (!inviteId) return;
  if (!hasAdminClient()) {
    throw new Error("Missing service role key for launch invite claim");
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("launch_invites")
    .update({
      status: "claimed",
      claimed_by: userId,
      claimed_at: new Date().toISOString(),
    })
    .eq("id", inviteId)
    .eq("status", "available");

  if (error) throw error;
}

export async function attachClaimedLaunchInviteWorkspace(
  userId: string,
  workspaceId: string,
): Promise<void> {
  if (!hasAdminClient()) return;
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("launch_invites")
    .update({ claimed_workspace_id: workspaceId })
    .eq("claimed_by", userId)
    .is("claimed_workspace_id", null);

  if (error) throw error;
}
