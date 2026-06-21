import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FormAction, FormSelect, FormTextarea } from "@/components/app/form-action";
import { getScaleDashboardData, upsertFeatureGateAction } from "@/lib/actions/scale";
import { canManageWorkspace, requireWorkspace } from "@/lib/auth/session";
import { PHASE8_FEATURE_LABELS, type Phase8FeatureKey } from "@/lib/types/scale";

export const metadata = { title: "Scale" };

const featureKeys = Object.keys(PHASE8_FEATURE_LABELS) as Phase8FeatureKey[];

const scaleLinks = [
  { href: "/facility", title: "Facility dashboard", body: "B2B census, open alerts, and facility profile readiness" },
  { href: "/marketplace", title: "Caregiver marketplace", body: "Caregiver profiles and family care request workflow" },
  { href: "/integrations", title: "Telecare & devices", body: "Consent-gated telecare and device integration requests" },
  { href: "/referrals", title: "Clinic referrals", body: "Coordination workflow for doctor visit and clinic handoff" },
  { href: "/wellness", title: "Wellness packages", body: "Insurance/provider wellness program enrollment tracking" },
  { href: "/compliance", title: "Compliance & incidents", body: "Clinical safety review gates and incident logging" },
];

export default async function ScalePage() {
  const { workspace, membership } = await requireWorkspace();
  const canManage = canManageWorkspace(membership.role);
  const data = await getScaleDashboardData();
  const gateByKey = new Map(data.gates.map((gate) => [gate.feature_key, gate]));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Phase 8 Scale</h1>
        <p className="text-muted-foreground">
          {workspace.name} · Advanced features are request/ops workflows until safety and regulatory gates are approved.
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        {scaleLinks.map((link) => (
          <Link key={link.href} href={link.href}>
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardHeader>
                <CardTitle>{link.title}</CardTitle>
                <CardDescription>{link.body}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Feature gates</CardTitle>
          <CardDescription>
            Clinical-adjacent features stay blocked until reviewed by the team and approved here.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            {featureKeys.map((featureKey) => {
              const gate = gateByKey.get(featureKey);
              return (
                <div key={featureKey} className="rounded-xl border border-border p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{PHASE8_FEATURE_LABELS[featureKey]}</p>
                      <p className="text-xs text-muted-foreground">
                        {gate?.status ?? "pending_review"}
                        {gate?.approved_at && ` · approved ${new Date(gate.approved_at).toLocaleDateString("th-TH")}`}
                      </p>
                    </div>
                    <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium">
                      {gate?.status ?? "pending"}
                    </span>
                  </div>
                  {gate?.review_notes && (
                    <p className="mt-3 text-sm text-muted-foreground">{gate.review_notes}</p>
                  )}
                </div>
              );
            })}
          </div>

          {canManage && (
            <FormAction action={upsertFeatureGateAction} className="grid gap-4 rounded-xl border border-border p-4 md:grid-cols-[220px_180px_1fr_auto]">
              <FormSelect
                label="Feature"
                name="featureKey"
                options={featureKeys.map((key) => ({ value: key, label: PHASE8_FEATURE_LABELS[key] }))}
              />
              <FormSelect
                label="Status"
                name="status"
                defaultValue="pending_review"
                options={[
                  { value: "pending_review", label: "Pending review" },
                  { value: "approved", label: "Approved" },
                  { value: "blocked", label: "Blocked" },
                  { value: "retired", label: "Retired" },
                ]}
              />
              <FormTextarea label="Review notes" name="reviewNotes" rows={2} />
              <Button type="submit" className="self-end">
                บันทึก gate
              </Button>
            </FormAction>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
