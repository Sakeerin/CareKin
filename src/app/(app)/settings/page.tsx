import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormAction, FormField, FormSelect } from "@/components/app/form-action";
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
import {
  createReferralCodeAction,
  getReferralCodes,
  getWorkspaceSubscription,
  selectBillingPlanAction,
} from "@/lib/actions/commercial";
import { BILLING_PLANS, getPlan } from "@/lib/plans";

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

  const [auditLogs, subscription, referralCodes] = await Promise.all([
    getAuditLogs(workspace.id, 20),
    getWorkspaceSubscription(),
    getReferralCodes(),
  ]);
  const canEditWorkspace = canManageWorkspace(membership.role);
  const currentPlan = getPlan(subscription?.plan ?? workspace.plan);

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

      {canEditWorkspace && (
        <Card>
          <CardHeader>
            <CardTitle>Billing / Launch plan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted p-4 text-sm">
              <p className="font-medium">แผนปัจจุบัน: {currentPlan.name}</p>
              <p className="text-muted-foreground">
                {currentPlan.priceText} · สถานะ billing: {subscription?.status ?? "not started"}
              </p>
            </div>
            <FormAction action={selectBillingPlanAction} className="space-y-4">
              <FormSelect
                label="เลือกแผนสำหรับ launch"
                name="plan"
                defaultValue={currentPlan.id}
                options={BILLING_PLANS.map((plan) => ({
                  value: plan.id,
                  label: `${plan.name} — ${plan.priceText}`,
                }))}
              />
              <p className="text-sm text-muted-foreground">
                Phase 7 บันทึก plan intent และ subscription record สำหรับ manual invoice/Stripe integration ภายหลัง
              </p>
              <Button type="submit">บันทึกแผน</Button>
            </FormAction>
          </CardContent>
        </Card>
      )}

      {canEditWorkspace && (
        <Card>
          <CardHeader>
            <CardTitle>Referral program</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormAction action={createReferralCodeAction} className="space-y-4">
              <FormField label="Referral code (เว้นว่างเพื่อสุ่ม)" name="code" />
              <Button type="submit">สร้าง referral code</Button>
            </FormAction>
            <div className="space-y-2">
              {referralCodes.length === 0 ? (
                <p className="text-sm text-muted-foreground">ยังไม่มี referral code</p>
              ) : (
                referralCodes.map((referral) => (
                  <div key={referral.id} className="rounded-lg border border-border px-4 py-3 text-sm">
                    <p className="font-semibold">{referral.code}</p>
                    <p className="text-muted-foreground">
                      แชร์ลิงก์: /?ref={referral.code} · {referral.active ? "active" : "inactive"}
                    </p>
                  </div>
                ))
              )}
            </div>
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
