import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FormAction, FormField, FormSelect, FormTextarea } from "@/components/app/form-action";
import { canManageWorkspace, requireWorkspace } from "@/lib/auth/session";
import {
  createOperationalDrillAction,
  createReleaseReadinessAction,
  getProductionDashboardData,
  upsertProductionCheckAction,
} from "@/lib/actions/production";
import { PRODUCTION_CHECK_CATEGORY_LABELS, type ProductionCheckCategory } from "@/lib/types/production";

export const metadata = { title: "Production readiness" };

const categoryKeys = Object.keys(PRODUCTION_CHECK_CATEGORY_LABELS) as ProductionCheckCategory[];

export default async function ProductionOpsPage() {
  const { workspace, membership } = await requireWorkspace();

  if (!canManageWorkspace(membership.role)) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          เฉพาะ owner / family admin เท่านั้นที่ดู Production ops ได้
        </CardContent>
      </Card>
    );
  }

  const data = await getProductionDashboardData();
  const summary = data.summary;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Production readiness</h1>
        <p className="text-muted-foreground">{workspace.name} · Phase 9 hardening and validation</p>
      </div>

      <section className="grid gap-3 sm:grid-cols-4">
        <MetricCard label="Checks" value={`${summary.passedChecks}/${summary.totalChecks}`} detail="passed / total" />
        <MetricCard label="Failed" value={String(summary.failedChecks)} detail="must be 0 before release" />
        <MetricCard label="Critical gaps" value={String(summary.openCriticalCategories.length)} detail="required categories missing passed evidence" />
        <MetricCard label="Latest release" value={summary.latestRelease?.status ?? "none"} detail={summary.latestRelease?.release_name ?? "no release review"} />
      </section>

      {summary.openCriticalCategories.length > 0 && (
        <Card className="border-warning">
          <CardContent className="p-4 text-sm">
            <p className="font-semibold">Critical categories still need passed evidence:</p>
            <p className="mt-1 text-muted-foreground">
              {summary.openCriticalCategories.map((category) => PRODUCTION_CHECK_CATEGORY_LABELS[category]).join(", ")}
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Record readiness check</CardTitle>
            <CardDescription>Track evidence for migrations, RLS, E2E, billing, monitoring, backup and release checks.</CardDescription>
          </CardHeader>
          <CardContent>
            <FormAction action={upsertProductionCheckAction} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormSelect
                  label="Category"
                  name="category"
                  options={categoryKeys.map((category) => ({
                    value: category,
                    label: PRODUCTION_CHECK_CATEGORY_LABELS[category],
                  }))}
                />
                <FormSelect
                  label="Status"
                  name="status"
                  defaultValue="in_progress"
                  options={[
                    { value: "not_started", label: "Not started" },
                    { value: "in_progress", label: "In progress" },
                    { value: "passed", label: "Passed" },
                    { value: "failed", label: "Failed" },
                    { value: "waived", label: "Waived" },
                  ]}
                />
              </div>
              <FormField label="Title" name="title" required placeholder="เช่น Apply Phase 2-9 migrations on production" />
              <FormField label="Evidence URL" name="evidenceUrl" placeholder="https://..." />
              <FormField label="Due date" name="dueAt" type="date" />
              <FormTextarea label="Notes" name="notes" rows={4} />
              <Button type="submit">บันทึก check</Button>
            </FormAction>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Release readiness review</CardTitle>
            <CardDescription>Create a release approval record before production deploy.</CardDescription>
          </CardHeader>
          <CardContent>
            <FormAction action={createReleaseReadinessAction} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Release name" name="releaseName" required placeholder="Phase 9 production hardening" />
                <FormField label="Environment" name="targetEnvironment" defaultValue="production" />
                <FormSelect
                  label="Status"
                  name="status"
                  defaultValue="draft"
                  options={[
                    { value: "draft", label: "Draft" },
                    { value: "ready", label: "Ready" },
                    { value: "released", label: "Released" },
                    { value: "rolled_back", label: "Rolled back" },
                  ]}
                />
                <FormField label="Commit SHA" name="commitSha" />
                <FormField label="Migration version" name="migrationVersion" placeholder="20260619000000" />
                <FormField label="Health check URL" name="healthCheckUrl" placeholder="/api/health" />
              </div>
              <ChecklistBox />
              <FormTextarea label="Rollback plan" name="rollbackPlan" rows={4} />
              <Button type="submit">บันทึก release review</Button>
            </FormAction>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Operational drill</CardTitle>
          <CardDescription>Record backup restore, incident response, rollback, and security drills.</CardDescription>
        </CardHeader>
        <CardContent>
          <FormAction action={createOperationalDrillAction} className="grid gap-4 lg:grid-cols-[180px_160px_160px_1fr_auto]">
            <FormSelect
              label="Type"
              name="drillType"
              options={[
                { value: "backup_restore", label: "Backup restore" },
                { value: "incident_response", label: "Incident response" },
                { value: "rollback", label: "Rollback" },
                { value: "security_review", label: "Security review" },
              ]}
            />
            <FormSelect
              label="Status"
              name="status"
              defaultValue="scheduled"
              options={[
                { value: "scheduled", label: "Scheduled" },
                { value: "completed", label: "Completed" },
                { value: "failed", label: "Failed" },
                { value: "cancelled", label: "Cancelled" },
              ]}
            />
            <FormField label="Scheduled for" name="scheduledFor" type="date" />
            <FormField label="Owner" name="ownerName" />
            <Button type="submit" className="self-end">บันทึก drill</Button>
            <div className="lg:col-span-5 grid gap-4 sm:grid-cols-2">
              <FormTextarea label="Findings" name="findings" rows={3} />
              <FormTextarea label="Follow-up actions" name="followUpActions" rows={3} />
            </div>
          </FormAction>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <HistoryCard title="Recent checks" empty="ยังไม่มี readiness check">
          {data.checks.slice(0, 8).map((check) => (
            <HistoryItem
              key={check.id}
              title={check.title}
              meta={`${PRODUCTION_CHECK_CATEGORY_LABELS[check.category]} · ${check.status}`}
              body={check.notes}
            />
          ))}
        </HistoryCard>
        <HistoryCard title="Drills" empty="ยังไม่มี drill">
          {data.drills.slice(0, 8).map((drill) => (
            <HistoryItem
              key={drill.id}
              title={drill.drill_type}
              meta={`${drill.status}${drill.scheduled_for ? ` · ${drill.scheduled_for}` : ""}`}
              body={drill.follow_up_actions}
            />
          ))}
        </HistoryCard>
        <HistoryCard title="Release reviews" empty="ยังไม่มี release review">
          {data.releases.slice(0, 8).map((release) => (
            <HistoryItem
              key={release.id}
              title={release.release_name}
              meta={`${release.target_environment} · ${release.status}`}
              body={release.rollback_plan}
            />
          ))}
        </HistoryCard>
      </div>
    </div>
  );
}

function MetricCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-2xl font-bold text-primary">{value}</p>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{detail}</p>
      </CardContent>
    </Card>
  );
}

function ChecklistBox() {
  const items = [
    ["migrationsApplied", "Migrations applied"],
    ["buildPassed", "Build passed"],
    ["rlsPassed", "RLS regression passed"],
    ["backupVerified", "Backup/restore verified"],
    ["monitoringReady", "Monitoring ready"],
  ];

  return (
    <div className="grid gap-2 rounded-xl border border-border p-4 sm:grid-cols-2">
      {items.map(([name, label]) => (
        <label key={name} className="flex items-center gap-2 text-sm">
          <input type="checkbox" name={name} className="h-4 w-4" />
          {label}
        </label>
      ))}
    </div>
  );
}

function HistoryCard({
  title,
  empty,
  children,
}: {
  title: string;
  empty: string;
  children: React.ReactNode;
}) {
  const items = Array.isArray(children) ? children.filter(Boolean) : children;
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {Array.isArray(items) && items.length === 0 ? (
          <p className="text-sm text-muted-foreground">{empty}</p>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}

function HistoryItem({
  title,
  meta,
  body,
}: {
  title: string;
  meta: string;
  body?: string | null;
}) {
  return (
    <div className="rounded-xl border border-border p-4">
      <p className="font-semibold">{title}</p>
      <p className="text-xs text-muted-foreground">{meta}</p>
      {body && <p className="mt-2 text-sm text-muted-foreground">{body}</p>}
    </div>
  );
}
