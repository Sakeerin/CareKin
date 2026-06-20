import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FormAction, FormField, FormSelect, FormTextarea } from "@/components/app/form-action";
import { canManageWorkspace, requireWorkspace } from "@/lib/auth/session";
import {
  createPilotInterviewAction,
  createPilotPricingSignalAction,
  getPilotDashboardData,
  updatePilotFeedbackStatusAction,
  upsertPilotBaselineAction,
  upsertPilotCohortAction,
} from "@/lib/actions/pilot";
import {
  PILOT_FEEDBACK_STATUS_LABELS,
  PILOT_STATUS_LABELS,
  type PilotFeedbackSeverity,
} from "@/lib/types/pilot";

export const metadata = { title: "Pilot ops" };

export default async function PilotOpsPage() {
  const { workspace, membership } = await requireWorkspace();

  if (!canManageWorkspace(membership.role)) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          เฉพาะ owner / family admin เท่านั้นที่ดู Pilot ops ได้
        </CardContent>
      </Card>
    );
  }

  const data = await getPilotDashboardData();
  const cohort = data.cohort;
  const baseline = data.baseline;
  const metrics = data.metrics;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Pilot ops</h1>
        <p className="text-muted-foreground">{workspace.name} · Phase 6 tracking</p>
      </div>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Success metrics (7 วันล่าสุด)</h2>
        <div className="grid gap-3 sm:grid-cols-4">
          <MetricCard
            label="Reminder completion"
            value={`${metrics.reminderCompletionPercent}%`}
            ok={metrics.success.reminderCompletion}
            detail={`${metrics.taskEventsCompleted}/${metrics.taskEventsTotal} events`}
          />
          <MetricCard
            label="Weekly active admins"
            value={`${metrics.weeklyActiveFamilyAdmins}/${metrics.familyAdminCount}`}
            ok={metrics.success.weeklyActiveFamilyAdmin}
            detail="target 60%+"
          />
          <MetricCard
            label="Report usage"
            value={`${metrics.reportCount}`}
            ok={metrics.success.reportUsage}
            detail="target 50%+ pilot users"
          />
          <MetricCard
            label="Willing to pay"
            value={`${metrics.willingnessToPayCount}`}
            ok={metrics.success.pricingEvidence}
            detail="target 5+ across pilot"
          />
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Pilot cohort</CardTitle>
            <CardDescription>Onboarding call, setup status, and pilot window</CardDescription>
          </CardHeader>
          <CardContent>
            <FormAction action={upsertPilotCohortAction} className="space-y-4">
              <FormSelect
                label="Status"
                name="status"
                defaultValue={cohort?.status ?? "active"}
                options={Object.entries(PILOT_STATUS_LABELS).map(([value, label]) => ({
                  value,
                  label,
                }))}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  label="Pilot start"
                  name="pilotStartedAt"
                  type="date"
                  required
                  defaultValue={cohort?.pilot_started_at ?? new Date().toISOString().slice(0, 10)}
                />
                <FormField
                  label="Pilot end"
                  name="pilotEndsAt"
                  type="date"
                  defaultValue={cohort?.pilot_ends_at ?? ""}
                />
                <FormField
                  label="Onboarding call"
                  name="onboardingCallAt"
                  type="datetime-local"
                  defaultValue={toLocalDatetime(cohort?.onboarding_call_at)}
                />
                <FormField
                  label="Target family count"
                  name="targetFamilyCount"
                  type="number"
                  defaultValue={String(cohort?.target_family_count ?? 1)}
                />
              </div>
              <FormSelect
                label="Setup completed"
                name="setupCompleted"
                defaultValue={cohort?.setup_completed_at ? "true" : "false"}
                options={[
                  { value: "false", label: "ยังไม่ครบ" },
                  { value: "true", label: "ครบแล้ว" },
                ]}
              />
              <FormTextarea label="Notes" name="notes" defaultValue={cohort?.notes ?? ""} rows={4} />
              <Button type="submit">บันทึก cohort</Button>
            </FormAction>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Baseline workflow</CardTitle>
            <CardDescription>Workflow ก่อนใช้ CareKin และ pain points</CardDescription>
          </CardHeader>
          <CardContent>
            <FormAction action={upsertPilotBaselineAction} className="space-y-4">
              <FormField
                label="เครื่องมือเดิม (คั่นด้วย comma)"
                name="currentTools"
                placeholder="LINE, Excel, สมุดจด"
                defaultValue={baseline?.current_tools.join(", ") ?? ""}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  label="Care tasks/day"
                  name="careTasksPerDay"
                  type="number"
                  defaultValue={baseline?.care_tasks_per_day ? String(baseline.care_tasks_per_day) : ""}
                />
                <FormSelect
                  label="Confidence before CareKin"
                  name="baselineConfidenceScore"
                  defaultValue={baseline?.baseline_confidence_score ? String(baseline.baseline_confidence_score) : ""}
                  options={[
                    { value: "", label: "ไม่ระบุ" },
                    { value: "1", label: "1 - กังวลมาก" },
                    { value: "2", label: "2" },
                    { value: "3", label: "3" },
                    { value: "4", label: "4" },
                    { value: "5", label: "5 - มั่นใจ" },
                  ]}
                />
              </div>
              <FormTextarea label="Primary pain" name="primaryPain" defaultValue={baseline?.primary_pain ?? ""} />
              <FormTextarea label="Workflow notes" name="workflowNotes" defaultValue={baseline?.workflow_notes ?? ""} rows={5} />
              <FormSelect
                label="Initial willingness to pay"
                name="willingnessToPayInitial"
                defaultValue={baseline?.willingness_to_pay_initial ? "true" : "false"}
                options={[
                  { value: "false", label: "ยังไม่ชัด" },
                  { value: "true", label: "มีแนวโน้มจ่าย" },
                ]}
              />
              <Button type="submit">บันทึก baseline</Button>
            </FormAction>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Weekly interview</CardTitle>
          </CardHeader>
          <CardContent>
            <FormAction action={createPilotInterviewAction} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <FormField label="Week" name="interviewWeek" type="number" required defaultValue="1" />
                <FormField label="Date" name="interviewDate" type="date" required defaultValue={new Date().toISOString().slice(0, 10)} />
                <FormField label="NPS" name="npsScore" type="number" placeholder="0-10" />
              </div>
              <FormSelect
                label="Retention signal"
                name="retentionSignal"
                defaultValue="neutral"
                options={[
                  { value: "positive", label: "Positive" },
                  { value: "neutral", label: "Neutral" },
                  { value: "at_risk", label: "At risk" },
                  { value: "churned", label: "Churned" },
                ]}
              />
              <FormTextarea label="Notes" name="notes" rows={5} />
              <FormTextarea label="Action items" name="actionItems" rows={3} />
              <Button type="submit">บันทึก interview</Button>
            </FormAction>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pricing signal</CardTitle>
          </CardHeader>
          <CardContent>
            <FormAction action={createPilotPricingSignalAction} className="space-y-4">
              <FormSelect
                label="Willing to pay"
                name="willingnessToPay"
                defaultValue="false"
                options={[
                  { value: "false", label: "ยังไม่จ่าย" },
                  { value: "true", label: "ยินดีจ่าย" },
                ]}
              />
              <FormField label="Price band" name="priceBand" placeholder="199-399 THB/month" />
              <FormTextarea label="Valued features" name="valuedFeatures" />
              <FormTextarea label="Objections" name="objections" />
              <FormTextarea label="Notes" name="notes" />
              <Button type="submit">บันทึก pricing signal</Button>
            </FormAction>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Feedback / bug queue</CardTitle>
          <CardDescription>
            Open: {metrics.feedbackOpen} · Critical open: {metrics.criticalBugsOpen}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.feedback.length === 0 ? (
            <p className="text-sm text-muted-foreground">ยังไม่มี feedback</p>
          ) : (
            data.feedback.map((item) => (
              <div key={item.id} className="rounded-lg border border-border p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.feedback_type} · {item.severity} · {item.status} ·{" "}
                      {new Date(item.created_at).toLocaleString("th-TH")}
                    </p>
                    <p className="mt-2 text-sm">{item.description}</p>
                    {item.page_url && <p className="mt-1 text-xs text-muted-foreground">{item.page_url}</p>}
                  </div>
                  <SeverityPill severity={item.severity} />
                </div>
                <FormAction
                  action={updatePilotFeedbackStatusAction.bind(null, item.id)}
                  className="mt-4 grid gap-3 sm:grid-cols-[200px_1fr_auto] sm:items-end"
                >
                  <FormSelect
                    label="Status"
                    name="status"
                    defaultValue={item.status}
                    options={Object.entries(PILOT_FEEDBACK_STATUS_LABELS).map(([value, label]) => ({
                      value,
                      label,
                    }))}
                  />
                  <FormField
                    label="Resolution notes"
                    name="resolutionNotes"
                    defaultValue={item.resolution_notes ?? ""}
                  />
                  <Button type="submit" variant="outline" size="sm">
                    อัปเดต
                  </Button>
                </FormAction>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent interviews & pricing evidence</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-3">
            {data.interviews.slice(0, 5).map((item) => (
              <div key={item.id} className="rounded-lg border border-border p-3">
                <p className="font-medium">Week {item.interview_week} · {item.retention_signal}</p>
                <p className="text-sm text-muted-foreground">NPS {item.nps_score ?? "—"} · {new Date(item.interview_date).toLocaleDateString("th-TH")}</p>
                <p className="mt-1 text-sm">{item.notes}</p>
              </div>
            ))}
          </div>
          <div className="space-y-3">
            {data.pricingSignals.slice(0, 5).map((item) => (
              <div key={item.id} className="rounded-lg border border-border p-3">
                <p className="font-medium">{item.willingness_to_pay ? "Willing to pay" : "Not yet"}</p>
                <p className="text-sm text-muted-foreground">{item.price_band ?? "No price band"}</p>
                {item.objections && <p className="mt-1 text-sm">Objection: {item.objections}</p>}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function MetricCard({
  label,
  value,
  detail,
  ok,
}: {
  label: string;
  value: string;
  detail: string;
  ok: boolean;
}) {
  return (
    <Card className={ok ? "border-success/30" : "border-warning/30"}>
      <CardHeader className="pb-2">
        <CardDescription>{label}</CardDescription>
        <CardTitle className={ok ? "text-3xl text-success" : "text-3xl text-warning-foreground"}>
          {value}
        </CardTitle>
        <p className="text-xs text-muted-foreground">{detail}</p>
      </CardHeader>
    </Card>
  );
}

function SeverityPill({ severity }: { severity: PilotFeedbackSeverity }) {
  const className =
    severity === "critical"
      ? "bg-destructive/15 text-destructive border-destructive/30"
      : severity === "high"
        ? "bg-warning/15 text-warning-foreground border-warning/30"
        : "bg-muted text-muted-foreground border-border";

  return (
    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${className}`}>
      {severity}
    </span>
  );
}

function toLocalDatetime(value?: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  const offsetMs = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}
