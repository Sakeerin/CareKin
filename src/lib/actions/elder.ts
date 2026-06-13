"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  requireUser,
  requireWorkspace,
  canManageElders,
} from "@/lib/auth/session";
import { elderSchema, emergencyContactSchema } from "@/lib/schemas/elder";
import type { ActionResult } from "@/lib/actions/auth";
import { logAuditEvent } from "@/lib/actions/audit";
import type { Elder, EmergencyContact } from "@/lib/types/database";

function parseConditions(raw: string | undefined): string[] {
  if (!raw?.trim()) return [];
  return raw.split(",").map((s) => s.trim()).filter(Boolean);
}

export async function createElderAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const user = await requireUser();
  const { workspace, membership } = await requireWorkspace();

  if (!canManageElders(membership.role)) {
    return { error: "ไม่มีสิทธิ์เพิ่มผู้สูงวัย" };
  }

  const parsed = elderSchema.safeParse({
    fullName: formData.get("fullName"),
    nickname: formData.get("nickname"),
    dateOfBirth: formData.get("dateOfBirth"),
    gender: formData.get("gender"),
    livingArrangement: formData.get("livingArrangement"),
    allergies: formData.get("allergies"),
    chronicConditions: formData.get("chronicConditions"),
    mobilityNotes: formData.get("mobilityNotes"),
    preferredHospital: formData.get("preferredHospital"),
    doctorContact: formData.get("doctorContact"),
    careInstructions: formData.get("careInstructions"),
    notes: formData.get("notes"),
    consentGiven: formData.get("consentGiven") === "on",
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
  }

  const supabase = await createClient();
  const { data: elder, error } = await supabase
    .from("elders")
    .insert({
      workspace_id: workspace.id,
      full_name: parsed.data.fullName,
      nickname: parsed.data.nickname || null,
      date_of_birth: parsed.data.dateOfBirth || null,
      gender: parsed.data.gender || null,
      living_arrangement: parsed.data.livingArrangement || null,
      allergies: parsed.data.allergies || null,
      chronic_conditions: parseConditions(parsed.data.chronicConditions),
      mobility_notes: parsed.data.mobilityNotes || null,
      preferred_hospital: parsed.data.preferredHospital || null,
      doctor_contact: parsed.data.doctorContact || null,
      care_instructions: parsed.data.careInstructions || null,
      notes: parsed.data.notes || null,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  await supabase.from("elder_consents").insert({
    elder_id: elder.id,
    consent_type: "health_data_collection",
    consent_given_by: user.id,
    consent_status: "given",
    consent_text_version: "1.0",
  });

  await logAuditEvent({
    workspaceId: workspace.id,
    action: "elder.created",
    resourceType: "elder",
    resourceId: elder.id,
    metadata: { full_name: parsed.data.fullName },
  });

  revalidatePath("/elders");
  redirect(`/elders/${elder.id}`);
}

export async function updateElderAction(
  elderId: string,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const { workspace, membership } = await requireWorkspace();

  if (!canManageElders(membership.role)) {
    return { error: "ไม่มีสิทธิ์แก้ไขข้อมูลผู้สูงวัย" };
  }

  const parsed = elderSchema.safeParse({
    fullName: formData.get("fullName"),
    nickname: formData.get("nickname"),
    dateOfBirth: formData.get("dateOfBirth"),
    gender: formData.get("gender"),
    livingArrangement: formData.get("livingArrangement"),
    allergies: formData.get("allergies"),
    chronicConditions: formData.get("chronicConditions"),
    mobilityNotes: formData.get("mobilityNotes"),
    preferredHospital: formData.get("preferredHospital"),
    doctorContact: formData.get("doctorContact"),
    careInstructions: formData.get("careInstructions"),
    notes: formData.get("notes"),
    consentGiven: true,
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("elders")
    .update({
      full_name: parsed.data.fullName,
      nickname: parsed.data.nickname || null,
      date_of_birth: parsed.data.dateOfBirth || null,
      gender: parsed.data.gender || null,
      living_arrangement: parsed.data.livingArrangement || null,
      allergies: parsed.data.allergies || null,
      chronic_conditions: parseConditions(parsed.data.chronicConditions),
      mobility_notes: parsed.data.mobilityNotes || null,
      preferred_hospital: parsed.data.preferredHospital || null,
      doctor_contact: parsed.data.doctorContact || null,
      care_instructions: parsed.data.careInstructions || null,
      notes: parsed.data.notes || null,
    })
    .eq("id", elderId)
    .eq("workspace_id", workspace.id);

  if (error) return { error: error.message };

  await logAuditEvent({
    workspaceId: workspace.id,
    action: "elder.updated",
    resourceType: "elder",
    resourceId: elderId,
  });

  revalidatePath(`/elders/${elderId}`);
  revalidatePath("/elders");
  return { success: true };
}

export async function deleteEmergencyContactAction(
  elderId: string,
  contactId: string,
): Promise<void> {
  await requireWorkspace();
  const supabase = await createClient();

  const { error } = await supabase
    .from("emergency_contacts")
    .delete()
    .eq("id", contactId)
    .eq("elder_id", elderId);

  if (error) throw new Error(error.message);

  revalidatePath(`/elders/${elderId}`);
}

export async function deleteElderFormAction(elderId: string): Promise<void> {
  const { workspace, membership } = await requireWorkspace();

  if (!canManageElders(membership.role)) {
    throw new Error("ไม่มีสิทธิ์ลบข้อมูลผู้สูงวัย");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("elders")
    .delete()
    .eq("id", elderId)
    .eq("workspace_id", workspace.id);

  if (error) throw new Error(error.message);

  await logAuditEvent({
    workspaceId: workspace.id,
    action: "elder.deleted",
    resourceType: "elder",
    resourceId: elderId,
  });

  revalidatePath("/elders");
  redirect("/elders");
}

export async function addEmergencyContactAction(
  elderId: string,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  await requireWorkspace();

  const parsed = emergencyContactSchema.safeParse({
    name: formData.get("name"),
    relationship: formData.get("relationship"),
    phone: formData.get("phone"),
    lineUserId: formData.get("lineUserId"),
    priority: formData.get("priority") || 1,
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("emergency_contacts").insert({
    elder_id: elderId,
    name: parsed.data.name,
    relationship: parsed.data.relationship,
    phone: parsed.data.phone,
    line_user_id: parsed.data.lineUserId || null,
    priority: parsed.data.priority,
  });

  if (error) return { error: error.message };

  revalidatePath(`/elders/${elderId}`);
  return { success: true };
}

export async function getElders(workspaceId: string): Promise<Elder[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("elders")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as Elder[];
}

export async function getElder(elderId: string): Promise<Elder | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("elders")
    .select("*, emergency_contacts(*)")
    .eq("id", elderId)
    .single();

  if (error) return null;
  return data as Elder;
}

export async function getEmergencyContacts(
  elderId: string,
): Promise<EmergencyContact[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("emergency_contacts")
    .select("*")
    .eq("elder_id", elderId)
    .order("priority", { ascending: true });

  if (error) throw error;
  return (data ?? []) as EmergencyContact[];
}
