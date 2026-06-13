import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormAction, FormField, FormSelect } from "@/components/app/form-action";
import { Button } from "@/components/ui/button";
import { requireWorkspace, canManageMembers, canManageWorkspace } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { inviteMemberAction } from "@/lib/actions/workspace";
import { INVITABLE_ROLES, WORKSPACE_ROLE_LABELS } from "@/lib/types/database";
import { redirect } from "next/navigation";

export const metadata = { title: "สมาชิก" };

export default async function MembersPage() {
  const { workspace, membership } = await requireWorkspace();

  if (!canManageWorkspace(membership.role) && membership.role !== "family_admin") {
    redirect("/dashboard");
  }

  const supabase = await createClient();

  const { data: members } = await supabase
    .from("workspace_members")
    .select("*, profiles(display_name, email)")
    .eq("workspace_id", workspace.id)
    .order("created_at");

  const { data: invites } = await supabase
    .from("workspace_invites")
    .select("*")
    .eq("workspace_id", workspace.id)
    .is("accepted_at", null)
    .gt("expires_at", new Date().toISOString());

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">สมาชิก workspace</h1>

      <Card>
        <CardHeader>
          <CardTitle>สมาชิกปัจจุบัน</CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-border p-0">
          {(members ?? []).map((m) => (
            <div key={m.id} className="flex items-center justify-between px-5 py-3">
              <div>
                <p className="font-medium">
                  {m.profiles?.display_name ?? m.profiles?.email}
                </p>
                <p className="text-sm text-muted-foreground">{m.profiles?.email}</p>
              </div>
              <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium">
                {WORKSPACE_ROLE_LABELS[m.role as keyof typeof WORKSPACE_ROLE_LABELS]}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>

      {canManageMembers(membership.role) && (
        <Card>
          <CardHeader>
            <CardTitle>เชิญสมาชิก</CardTitle>
          </CardHeader>
          <CardContent>
            <FormAction action={inviteMemberAction} className="space-y-4">
              <FormField label="อีเมล" name="email" type="email" required />
              <FormSelect
                label="บทบาท"
                name="role"
                options={INVITABLE_ROLES.map((r) => ({
                  value: r,
                  label: WORKSPACE_ROLE_LABELS[r],
                }))}
              />
              <Button type="submit">ส่งคำเชิญ</Button>
            </FormAction>
          </CardContent>
        </Card>
      )}

      {(invites ?? []).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>คำเชิญที่รอดำเนินการ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {invites!.map((inv) => (
              <div key={inv.id} className="rounded-lg border border-border p-3">
                <p className="text-sm font-medium">{inv.email}</p>
                <p className="text-xs text-muted-foreground">
                  {WORKSPACE_ROLE_LABELS[inv.role as keyof typeof WORKSPACE_ROLE_LABELS]}
                </p>
                <p className="mt-2 break-all text-xs text-primary">
                  {baseUrl}/invite/accept?token={inv.token}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
