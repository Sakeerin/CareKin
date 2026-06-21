import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FormAction, FormSelect, FormTextarea, FormField } from "@/components/app/form-action";
import { createScaleIncidentAction, getScaleDashboardData } from "@/lib/actions/scale";
import { PHASE8_FEATURE_LABELS, type Phase8FeatureKey } from "@/lib/types/scale";

export const metadata = { title: "Compliance" };

const featureKeys = Object.keys(PHASE8_FEATURE_LABELS) as Phase8FeatureKey[];

export default async function CompliancePage() {
  const data = await getScaleDashboardData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Compliance & incidents</h1>
        <p className="text-muted-foreground">
          Phase 8 safety case, feature gates, and incident logging for advanced workflows.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Regulatory safety gates</CardTitle>
          <CardDescription>
            Before clinical-adjacent features, complete boundary memo, clinical safety case, advisor review, risk process and incident workflow.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          {[
            "Regulatory classification review",
            "Clinical safety case",
            "Medical advisor review",
            "Risk management process",
            "Model validation if AI involved",
            "Incident reporting workflow",
          ].map((item) => (
            <div key={item} className="rounded-xl border border-border p-4 text-sm">
              {item}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Report scale incident</CardTitle>
          <CardDescription>Use for safety, privacy, support, or advanced feature issues.</CardDescription>
        </CardHeader>
        <CardContent>
          <FormAction action={createScaleIncidentAction} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormSelect
                label="Feature"
                name="featureKey"
                options={featureKeys.map((key) => ({ value: key, label: PHASE8_FEATURE_LABELS[key] }))}
              />
              <FormSelect
                label="Severity"
                name="severity"
                defaultValue="medium"
                options={[
                  { value: "low", label: "Low" },
                  { value: "medium", label: "Medium" },
                  { value: "high", label: "High" },
                  { value: "critical", label: "Critical" },
                ]}
              />
            </div>
            <FormField label="Title" name="title" required />
            <FormTextarea label="Description" name="description" rows={5} />
            <Button type="submit">บันทึก incident</Button>
          </FormAction>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Incident log</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.incidents.length === 0 ? (
            <p className="text-sm text-muted-foreground">ยังไม่มี incident</p>
          ) : (
            data.incidents.map((incident) => (
              <div key={incident.id} className="rounded-xl border border-border p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="font-semibold">{incident.title}</p>
                  <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium">
                    {incident.severity} · {incident.status}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {PHASE8_FEATURE_LABELS[incident.feature_key]} · {new Date(incident.created_at).toLocaleString("th-TH")}
                </p>
                <p className="mt-3 whitespace-pre-wrap text-sm text-muted-foreground">{incident.description}</p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
