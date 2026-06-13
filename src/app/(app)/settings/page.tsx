import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormAction, FormField } from "@/components/app/form-action";
import { Button } from "@/components/ui/button";
import {
  requireUser,
  requireWorkspace,
  canManageWorkspace,
} from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { updateProfileAction, updateWorkspaceAction } from "@/lib/actions/workspace";
import { getAuditLogs } from "@/lib/actions/audit";
import { WORKSPACE_ROLE_LABELS } from "@/lib/types/database";

export const metadata = { title: "ตั้งค่า" };

export default async function SettingsPage() {
  const user = await requireUser();
  const { workspace, membership } = await requireWorkspace();
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const auditLogs = await getAuditLogs(workspace.id, 20);
  const canEditWorkspace = canManageWorkspace(membership.role);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">ตั้งค่า</h1>

      <Card>
        <CardHeader>
          <CardTitle>โปรไฟล์</CardTitle>
        </CardHeader>
        <CardContent>
          <FormAction action={updateProfileAction} className="space-y-4">
            <FormField
              label="ชื่อที่แสดง"
              name="displayName"
              required
              defaultValue={profile?.display_name ?? ""}
            />
            <FormField
              label="เบอร์โทร"
              name="phone"
              defaultValue={profile?.phone ?? ""}
            />
            <p className="text-sm text-muted-foreground">อีเมล: {profile?.email}</p>
            <Button type="submit">บันทึกโปรไฟล์</Button>
          </FormAction>
        </CardContent>
      </Card>

      {canEditWorkspace && (
        <Card>
          <CardHeader>
            <CardTitle>Workspace</CardTitle>
          </CardHeader>
          <CardContent>
            <FormAction action={updateWorkspaceAction} className="space-y-4">
              <FormField
                label="ชื่อครอบครัว"
                name="name"
                required
                defaultValue={workspace.name}
              />
              <Button type="submit">บันทึก workspace</Button>
            </FormAction>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>บทบาทของคุณ</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">
            {WORKSPACE_ROLE_LABELS[membership.role]} — {workspace.name}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Audit log</CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-border p-0">
          {auditLogs.map((log) => (
            <div key={log.id} className="px-5 py-3">
              <p className="text-sm">{log.action}</p>
              <p className="text-xs text-muted-foreground">
                {log.resource_type}
                {log.resource_id && ` · ${log.resource_id.slice(0, 8)}...`}
                {" · "}
                {new Date(log.created_at).toLocaleString("th-TH")}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
