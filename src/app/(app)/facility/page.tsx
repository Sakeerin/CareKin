import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FormAction, FormField, FormTextarea } from "@/components/app/form-action";
import { getScaleDashboardData, upsertFacilityAction } from "@/lib/actions/scale";
import { canManageWorkspace, requireWorkspace } from "@/lib/auth/session";

export const metadata = { title: "Facility dashboard" };

export default async function FacilityPage() {
  const { membership } = await requireWorkspace();
  const data = await getScaleDashboardData();
  const facility = data.facility;
  const canManage = canManageWorkspace(membership.role);

  const openCounts = {
    marketplace: data.marketplaceRequests.filter((item) => ["requested", "reviewing"].includes(item.status)).length,
    telecare: data.telecareSessions.filter((item) => ["requested", "scheduled", "ready"].includes(item.status)).length,
    devices: data.deviceIntegrations.filter((item) => ["requested", "pending_consent"].includes(item.status)).length,
    referrals: data.clinicalReferrals.filter((item) => ["draft", "sent", "accepted"].includes(item.status)).length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Facility dashboard</h1>
        <p className="text-muted-foreground">B2B readiness view for facility or provider cohorts.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        <MetricCard label="Marketplace requests" value={openCounts.marketplace} />
        <MetricCard label="Telecare sessions" value={openCounts.telecare} />
        <MetricCard label="Device requests" value={openCounts.devices} />
        <MetricCard label="Clinic referrals" value={openCounts.referrals} />
      </div>

      {canManage && (
        <Card>
          <CardHeader>
            <CardTitle>Facility profile</CardTitle>
            <CardDescription>Use this to prepare a provider workspace without changing the family-care model.</CardDescription>
          </CardHeader>
          <CardContent>
            <FormAction action={upsertFacilityAction} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Facility name" name="name" required defaultValue={facility?.name ?? ""} />
                <FormField label="Facility type" name="facilityType" defaultValue={facility?.facility_type ?? "care_home"} />
                <FormField label="Capacity" name="capacity" type="number" defaultValue={facility?.capacity ? String(facility.capacity) : ""} />
                <FormField label="Contact name" name="contactName" defaultValue={facility?.contact_name ?? ""} />
                <FormField label="Contact phone" name="contactPhone" defaultValue={facility?.contact_phone ?? ""} />
              </div>
              <FormTextarea label="Address" name="address" defaultValue={facility?.address ?? ""} />
              <FormTextarea label="Notes" name="notes" defaultValue={facility?.notes ?? ""} rows={4} />
              <Button type="submit">บันทึก facility</Button>
            </FormAction>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-2xl font-bold text-primary">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}
