import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FormAction, FormField, FormTextarea } from "@/components/app/form-action";
import { getElder } from "@/lib/actions/elder";
import { createVitalLogAction, getVitalLogs } from "@/lib/actions/health";
import { requireWorkspace } from "@/lib/auth/session";
import {
  VITAL_METRIC_LABELS,
  VITAL_METRIC_UNITS,
  type VitalLog,
  type VitalMetric,
} from "@/lib/types/health";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const elder = await getElder(id);
  return { title: `ค่าสุขภาพ — ${elder?.nickname ?? elder?.full_name ?? ""}` };
}

export default async function VitalsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireWorkspace();
  const elder = await getElder(id);
  if (!elder) notFound();

  const logs = await getVitalLogs(id);
  const boundCreate = createVitalLogAction.bind(null, id);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link href={`/elders/${id}`} className="text-sm text-muted-foreground hover:underline">
            ← {elder.nickname ?? elder.full_name}
          </Link>
          <h1 className="mt-1 text-2xl font-bold">ค่าสุขภาพและแนวโน้ม</h1>
          <p className="text-muted-foreground">บันทึกความดัน ชีพจร น้ำตาล และดูแนวโน้มล่าสุด</p>
        </div>
        <Link href={`/elders/${id}/thresholds`}>
          <Button variant="outline">ตั้งค่าเกณฑ์แจ้งเตือน</Button>
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
        <Card>
          <CardHeader>
            <CardTitle>บันทึกค่าสุขภาพ</CardTitle>
            <CardDescription>ระบบจะตรวจเกณฑ์และสร้าง alert อัตโนมัติ</CardDescription>
          </CardHeader>
          <CardContent>
            <FormAction action={boundCreate} className="space-y-4">
              <FormField label="เวลาที่วัด" name="measuredAt" type="datetime-local" />
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="ความดัน SYS" name="systolic" type="number" placeholder="120" />
                <FormField label="ความดัน DIA" name="diastolic" type="number" placeholder="80" />
                <FormField label="ชีพจร" name="pulse" type="number" placeholder="72" />
                <FormField label="น้ำตาล" name="bloodSugar" type="number" placeholder="110" />
                <FormField label="อุณหภูมิ" name="temperature" type="number" placeholder="36.8" />
                <FormField label="ออกซิเจน (%)" name="spo2" type="number" placeholder="97" />
                <FormField label="น้ำหนัก" name="weight" type="number" placeholder="62" />
              </div>
              <FormTextarea label="หมายเหตุ" name="note" />
              <Button type="submit">บันทึกค่าสุขภาพ</Button>
            </FormAction>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Trend ล่าสุด</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <MiniTrend logs={logs} metric="systolic" />
            <MiniTrend logs={logs} metric="pulse" />
            <MiniTrend logs={logs} metric="blood_sugar" />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>ประวัติการวัด</CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-border p-0">
          {logs.length === 0 ? (
            <p className="p-5 text-sm text-muted-foreground">ยังไม่มีค่าสุขภาพ</p>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="px-5 py-3">
                <p className="font-medium">
                  {new Date(log.measured_at).toLocaleString("th-TH", {
                    timeZone: "Asia/Bangkok",
                  })}
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatVitalSummary(log)}
                </p>
                {log.note && <p className="mt-1 text-sm">{log.note}</p>}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function MiniTrend({ logs, metric }: { logs: VitalLog[]; metric: VitalMetric }) {
  const points = [...logs]
    .reverse()
    .map((log, index) => ({ value: log[metric], index }))
    .filter((point): point is { value: number; index: number } => point.value !== null)
    .slice(-10);

  if (points.length < 2) {
    return (
      <div>
        <p className="mb-2 text-sm font-medium">{VITAL_METRIC_LABELS[metric]}</p>
        <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
          ต้องมีข้อมูลอย่างน้อย 2 จุด
        </div>
      </div>
    );
  }

  const values = points.map((point) => point.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const width = 320;
  const height = 90;
  const step = width / (points.length - 1);
  const path = points
    .map((point, index) => {
      const x = index * step;
      const y = height - ((point.value - min) / range) * height;
      return `${index === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");

  const latest = values[values.length - 1];

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <p className="font-medium">{VITAL_METRIC_LABELS[metric]}</p>
        <p className="text-muted-foreground">
          ล่าสุด {latest} {VITAL_METRIC_UNITS[metric]}
        </p>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-24 w-full overflow-visible">
        <path d={path} fill="none" stroke="currentColor" strokeWidth="4" className="text-primary" />
        {points.map((point, index) => {
          const x = index * step;
          const y = height - ((point.value - min) / range) * height;
          return <circle key={`${metric}-${index}`} cx={x} cy={y} r="4" className="fill-primary" />;
        })}
      </svg>
    </div>
  );
}

function formatVitalSummary(log: VitalLog): string {
  const parts = [
    log.systolic && `SYS ${log.systolic}`,
    log.diastolic && `DIA ${log.diastolic}`,
    log.pulse && `ชีพจร ${log.pulse}`,
    log.blood_sugar && `น้ำตาล ${log.blood_sugar}`,
    log.temperature && `อุณหภูมิ ${log.temperature}`,
    log.spo2 && `SpO2 ${log.spo2}%`,
    log.weight && `น้ำหนัก ${log.weight}`,
  ].filter(Boolean);

  return parts.join(" · ") || "ไม่มีค่า";
}
