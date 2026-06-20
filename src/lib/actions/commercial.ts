"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { canManageWorkspace, requireUser, requireWorkspace } from "@/lib/auth/session";
import type { ActionResult } from "@/lib/actions/auth";
import { logAuditEvent } from "@/lib/actions/audit";
import {
  billingPlanSchema,
  referralCodeSchema,
  supportTicketSchema,
  supportTicketStatusSchema,
  waitlistSchema,
} from "@/lib/schemas/commercial";
import type { ReferralCode, Subscription, SupportTicket } from "@/lib/types/commercial";

export async function joinWaitlistAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = waitlistSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    audience: formData.get("audience"),
    organization: formData.get("organization"),
    phone: formData.get("phone"),
    careContext: formData.get("careContext"),
    referralCode: formData.get("referralCode"),
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("launch_waitlist").upsert(
    {
      email: parsed.data.email,
      name: parsed.data.name,
      audience: parsed.data.audience,
      organization: parsed.data.organization || null,
      phone: parsed.data.phone || null,
      care_context: parsed.data.careContext || null,
      referral_code: parsed.data.referralCode || null,
      status: "new",
    },
    { onConflict: "email" },
  );

  if (error) return { error: error.message };
  return { success: true };
}

export async function createSupportTicketAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const user = await requireUser();
  const { workspace } = await requireWorkspace();
  const parsed = supportTicketSchema.safeParse({
    ticketType: formData.get("ticketType"),
    priority: formData.get("priority"),
    subject: formData.get("subject"),
    description: formData.get("description"),
    pageUrl: formData.get("pageUrl"),
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("support_tickets")
    .insert({
      workspace_id: workspace.id,
      submitted_by: user.id,
      ticket_type: parsed.data.ticketType,
      priority: parsed.data.priority,
      subject: parsed.data.subject,
      description: parsed.data.description,
      page_url: parsed.data.pageUrl || null,
    })
    .select("id")
    .single();

  if (error || !data) return { error: error?.message ?? "ส่ง ticket ไม่สำเร็จ" };

  await logAuditEvent({
    workspaceId: workspace.id,
    action: "support.ticket_created",
    resourceType: "support_ticket",
    resourceId: data.id,
    metadata: { priority: parsed.data.priority, type: parsed.data.ticketType },
  });

  revalidatePath("/support");
  return { success: true };
}

export async function updateSupportTicketStatusAction(
  ticketId: string,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const { workspace, membership } = await requireWorkspace();
  if (!canManageWorkspace(membership.role)) {
    return { error: "ไม่มีสิทธิ์อัปเดต support ticket" };
  }

  const parsed = supportTicketStatusSchema.safeParse({
    status: formData.get("status"),
    resolutionNotes: formData.get("resolutionNotes"),
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
  }

  const now = new Date().toISOString();
  const updateData: Record<string, string | null> = {
    status: parsed.data.status,
    resolution_notes: parsed.data.resolutionNotes || null,
  };

  if (parsed.data.status === "in_progress" || parsed.data.status === "waiting_customer") {
    updateData.first_response_at = now;
  }

  if (parsed.data.status === "resolved" || parsed.data.status === "closed") {
    updateData.resolved_at = now;
  } else {
    updateData.resolved_at = null;
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("support_tickets")
    .update(updateData)
    .eq("id", ticketId)
    .eq("workspace_id", workspace.id);

  if (error) return { error: error.message };

  await logAuditEvent({
    workspaceId: workspace.id,
    action: "support.ticket_updated",
    resourceType: "support_ticket",
    resourceId: ticketId,
    metadata: { status: parsed.data.status },
  });

  revalidatePath("/support");
  return { success: true };
}

export async function selectBillingPlanAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const { workspace, membership } = await requireWorkspace();
  if (!canManageWorkspace(membership.role)) {
    return { error: "เฉพาะ owner/family admin เท่านั้นที่เปลี่ยนแผนได้" };
  }

  const parsed = billingPlanSchema.safeParse({ plan: formData.get("plan") });
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
  }

  const supabase = await createClient();
  const { error: subError } = await supabase.from("subscriptions").upsert(
    {
      workspace_id: workspace.id,
      plan: parsed.data.plan,
      status: parsed.data.plan === "free" ? "active" : "incomplete",
      provider: "manual_launch",
    },
    { onConflict: "workspace_id" },
  );

  if (subError) return { error: subError.message };

  const { error: wsError } = await supabase
    .from("workspaces")
    .update({ plan: parsed.data.plan })
    .eq("id", workspace.id);

  if (wsError) return { error: wsError.message };

  await supabase.from("billing_events").insert({
    workspace_id: workspace.id,
    event_type: "plan_selected",
    provider: "manual_launch",
    payload: { plan: parsed.data.plan },
  });

  await logAuditEvent({
    workspaceId: workspace.id,
    action: "billing.plan_selected",
    resourceType: "subscription",
    resourceId: workspace.id,
    metadata: { plan: parsed.data.plan },
  });

  revalidatePath("/settings");
  return { success: true };
}

export async function createReferralCodeAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const user = await requireUser();
  const { workspace, membership } = await requireWorkspace();
  if (!canManageWorkspace(membership.role)) {
    return { error: "ไม่มีสิทธิ์สร้าง referral code" };
  }

  const parsed = referralCodeSchema.safeParse({ code: formData.get("code") });
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
  }

  const code = parsed.data.code || undefined;
  const supabase = await createClient();
  const { error } = await supabase.from("referral_codes").insert({
    code: code?.toUpperCase(),
    owner_user_id: user.id,
    workspace_id: workspace.id,
  });

  if (error) return { error: error.message };
  revalidatePath("/settings");
  return { success: true };
}

export async function getSupportTickets(): Promise<SupportTicket[]> {
  const { workspace } = await requireWorkspace();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("support_tickets")
    .select("*")
    .eq("workspace_id", workspace.id)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as SupportTicket[];
}

export async function getWorkspaceSubscription(): Promise<Subscription | null> {
  const { workspace } = await requireWorkspace();
  const supabase = await createClient();
  const { data } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("workspace_id", workspace.id)
    .maybeSingle();
  return (data as Subscription | null) ?? null;
}

export async function getReferralCodes(): Promise<ReferralCode[]> {
  const { workspace } = await requireWorkspace();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("referral_codes")
    .select("*")
    .eq("workspace_id", workspace.id)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as ReferralCode[];
}

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

  const supabase = await createClient();
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
  const supabase = await createClient();
  await supabase
    .from("launch_invites")
    .update({
      status: "claimed",
      claimed_by: userId,
      claimed_at: new Date().toISOString(),
    })
    .eq("id", inviteId);
}
