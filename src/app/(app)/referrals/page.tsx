import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FormAction, FormField, FormSelect, FormTextarea } from "@/components/app/form-action";
import { createClinicalReferralAction, getScaleDashboardData } from "@/lib/actions/scale";
import { getElders } from "@/lib/actions/elder";
import { requireWorkspace } from "@/lib/auth/session";

export const metadata = { title: "Clinic referrals" };

export default async function ReferralsPage() {
  const { workspace } = await requireWorkspace();
  const [data, elders] = await Promise.all([getScaleDashboardData(), getElders(workspace.id)]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Clinic referrals</h1>
        <p className="text-muted-foreground">
          Coordination workflow for clinic handoff. This is not diagnosis, treatment, or emergency routing.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create referral draft</CardTitle>
          <CardDescription>Requires `clinic_referrals` gate approval before use.</CardDescription>
        </CardHeader>
        <CardContent>
          <FormAction action={createClinicalReferralAction} className="space-y-4">
            <FormSelect
              label="ผู้สูงวัย"
              name="elderId"
              options={[
                { value: "", label: "ไม่ระบุ" },
                ...elders.map((elder) => ({ value: elder.id, label: elder.nickname ?? elder.full_name })),
              ]}
            />
            <FormField label="Report ID (optional)" name="reportId" />
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Clinic name" name="clinicName" required />
              <FormField label="Contact name" name="contactName" />
              <FormField label="Contact email" name="contactEmail" type="email" />
              <FormField label="Contact phone" name="contactPhone" />
            </div>
            <FormTextarea label="Reason for referral" name="reason" rows={5} />
            <Button type="submit">สร้าง referral</Button>
          </FormAction>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Referral queue</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.clinicalReferrals.length === 0 ? (
            <p className="text-sm text-muted-foreground">ยังไม่มี clinic referral</p>
          ) : (
            data.clinicalReferrals.map((referral) => (
              <div key={referral.id} className="rounded-xl border border-border p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="font-semibold">{referral.clinic_name}</p>
                  <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium">{referral.status}</span>
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{referral.reason}</p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
