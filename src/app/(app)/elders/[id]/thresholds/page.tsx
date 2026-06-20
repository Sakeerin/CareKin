import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FormAction, FormField, FormSelect } from "@/components/app/form-action";
import { AlertBadge } from "@/components/ui/badge";
import { getElder } from "@/lib/actions/elder";
import {
  createAlertRuleAction,
  deleteAlertRuleAction,
  getAlertRules,
} from "@/lib/actions/health";
import { canManageElders, requireWorkspace } from "@/lib/auth/session";
import {
  DEFAULT_VITAL_RULES,
  VITAL_METRIC_LABELS,
  VITAL_METRICS,
  type VitalMetric,
} from "@/lib/types/health";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const elder = await getElder(id);
  return { title: `เกณฑ์แจ้งเตือน — ${elder?.nickname ?? elder?.full_name ?? ""}` };
}

export default async function ThresholdsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { membership } = await requireWorkspace();
  const elder = await getElder(id);
  if (!elder) notFound();

  const canEdit = canManageElders(membership.role);
  const rules = await getAlertRules(id);
  const boundCreate = createAlertRuleAction.bind(null, id);

  return (
    <div className="space-y-6">
      <div>
        <Link href={`/elders/${id}/vitals`} className="text-sm text-muted-foreground hover:underline">
          ← กลับค่าสุขภาพ
        </Link>
        <h1 className="mt-1 text-2xl font-bold">เกณฑ์แจ้งเตือน</h1>
        <p className="text-muted-foreground">ตั้งค่า threshold สำหรับ vital signs และ alert severity</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>ค่าเริ่มต้น</CardTitle>
          <CardDescription>ใช้เมื่อยังไม่มี rule แบบ custom สำหรับ metric นั้น</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          {VITAL_METRICS.map((metric) => (
            <div key={metric} className="rounded-lg border border-border p-3">
              <p className="font-medium">{VITAL_METRIC_LABELS[metric]}</p>
              <p className="text-sm text-muted-foreground">{formatDefaultRule(metric)}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Custom rules</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {rules.length === 0 ? (
            <p className="text-sm text-muted-foreground">ยังไม่มี custom rule</p>
          ) : (
            rules.map((rule) => (
              <div
                key={rule.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-border p-3"
              >
                <div>
                  <div className="mb-1 flex items-center gap-2">
                    <p className="font-medium">{VITAL_METRIC_LABELS[rule.metric]}</p>
                    <AlertBadge level={rule.severity} />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    min {rule.min_value ?? "—"} · max {rule.max_value ?? "—"}
                  </p>
                </div>
                {canEdit && (
                  <form action={deleteAlertRuleAction.bind(null, id, rule.id)}>
                    <Button type="submit" variant="ghost" size="sm">
                      ลบ
                    </Button>
                  </form>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {canEdit && (
        <Card>
          <CardHeader>
            <CardTitle>เพิ่ม custom rule</CardTitle>
          </CardHeader>
          <CardContent>
            <FormAction action={boundCreate} className="space-y-4">
              <FormSelect
                label="Metric"
                name="metric"
                options={VITAL_METRICS.map((metric) => ({
                  value: metric,
                  label: VITAL_METRIC_LABELS[metric],
                }))}
              />
              <div className="grid gap-4 sm:grid-cols-3">
                <FormField label="ค่าต่ำสุด" name="minValue" type="number" />
                <FormField label="ค่าสูงสุด" name="maxValue" type="number" />
                <FormSelect
                  label="ระดับแจ้งเตือน"
                  name="severity"
                  defaultValue="family"
                  options={[
                    { value: "info", label: "ข้อมูล" },
                    { value: "family", label: "แจ้งครอบครัว" },
                    { value: "urgent", label: "เร่งด่วน" },
                  ]}
                />
              </div>
              <Button type="submit">เพิ่ม rule</Button>
            </FormAction>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function formatDefaultRule(metric: VitalMetric): string {
  const rule = DEFAULT_VITAL_RULES[metric];
  if (!rule.minValue && !rule.maxValue) return "ไม่มีเกณฑ์เริ่มต้น";
  return `min ${rule.minValue ?? "—"} · max ${rule.maxValue ?? "—"} · ${rule.severity}`;
}
