import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FormAction, FormField, FormSelect, FormTextarea } from "@/components/app/form-action";
import {
  createMarketplaceRequestAction,
  getScaleDashboardData,
  upsertCaregiverProfileAction,
} from "@/lib/actions/scale";
import { getElders } from "@/lib/actions/elder";
import { requireWorkspace } from "@/lib/auth/session";

export const metadata = { title: "Caregiver marketplace" };

export default async function MarketplacePage() {
  const { workspace } = await requireWorkspace();
  const [data, elders] = await Promise.all([getScaleDashboardData(), getElders(workspace.id)]);
  const profile = data.caregiverProfile;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Caregiver marketplace</h1>
        <p className="text-muted-foreground">MVP marketplace workflow for profile listing and family care requests.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Caregiver profile</CardTitle>
            <CardDescription>Self-reported profile. Verification and payment rails are separate Phase 8 work.</CardDescription>
          </CardHeader>
          <CardContent>
            <FormAction action={upsertCaregiverProfileAction} className="space-y-4">
              <FormField label="Display name" name="displayName" required defaultValue={profile?.display_name ?? ""} />
              <FormField label="Service area" name="serviceArea" defaultValue={profile?.service_area ?? ""} />
              <FormField label="Skills (comma-separated)" name="skills" defaultValue={profile?.skills.join(", ") ?? ""} />
              <FormField
                label="Hourly rate THB"
                name="hourlyRateThb"
                type="number"
                defaultValue={profile?.hourly_rate_thb ? String(profile.hourly_rate_thb) : ""}
              />
              <FormSelect
                label="Listing status"
                name="active"
                defaultValue={profile?.active ? "true" : "false"}
                options={[
                  { value: "false", label: "Draft" },
                  { value: "true", label: "Active listing" },
                ]}
              />
              <FormTextarea label="Bio" name="bio" defaultValue={profile?.bio ?? ""} rows={4} />
              <Button type="submit">บันทึก caregiver profile</Button>
            </FormAction>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Request caregiver support</CardTitle>
            <CardDescription>Submit a coordination request; matching remains manual in this MVP.</CardDescription>
          </CardHeader>
          <CardContent>
            <FormAction action={createMarketplaceRequestAction} className="space-y-4">
              <FormSelect
                label="ผู้สูงวัย"
                name="elderId"
                options={[
                  { value: "", label: "ไม่ระบุ" },
                  ...elders.map((elder) => ({ value: elder.id, label: elder.nickname ?? elder.full_name })),
                ]}
              />
              <FormTextarea label="Care need" name="careNeed" rows={5} required />
              <FormTextarea label="Schedule notes" name="scheduleNotes" rows={3} />
              <FormField label="Preferred area" name="preferredArea" />
              <Button type="submit">ส่ง request</Button>
            </FormAction>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active caregivers</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          {data.caregiverProfiles.length === 0 ? (
            <p className="text-sm text-muted-foreground">ยังไม่มี caregiver listing</p>
          ) : (
            data.caregiverProfiles.map((caregiver) => (
              <div key={caregiver.id} className="rounded-xl border border-border p-4">
                <p className="font-semibold">{caregiver.display_name}</p>
                <p className="text-sm text-muted-foreground">{caregiver.service_area ?? "ไม่ระบุพื้นที่"}</p>
                <p className="mt-2 text-sm">{caregiver.skills.join(", ") || "ยังไม่ระบุทักษะ"}</p>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Requests</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.marketplaceRequests.length === 0 ? (
            <p className="text-sm text-muted-foreground">ยังไม่มี marketplace request</p>
          ) : (
            data.marketplaceRequests.map((request) => (
              <div key={request.id} className="rounded-xl border border-border p-4">
                <p className="font-semibold">{request.status}</p>
                <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{request.care_need}</p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
