"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { loginSchema, signupSchema } from "@/lib/schemas/auth";
import {
  claimLaunchInvite,
  validateLaunchInviteForSignup,
} from "@/lib/actions/commercial";

export type ActionResult = { error?: string; success?: boolean };

export async function loginAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" };
  }

  redirect("/dashboard");
}

export async function signupAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = signupSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    displayName: formData.get("displayName"),
    inviteCode: formData.get("inviteCode"),
    acceptedTerms: formData.get("acceptedTerms") === "on",
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
  }

  const invite = await validateLaunchInviteForSignup(
    parsed.data.inviteCode || null,
    parsed.data.email,
  );
  if (!invite.ok) {
    return { error: invite.error };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        display_name: parsed.data.displayName,
        accepted_terms_version: "terms-v1",
        accepted_privacy_version: "privacy-v1",
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (data.user) {
    await claimLaunchInvite(invite.inviteId, data.user.id);
  }

  redirect("/workspace/new");
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
