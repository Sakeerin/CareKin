import { AlertBadge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getReviewedReportOutput } from "@/lib/services/ai-summary";
import type { CareReport } from "@/lib/types/reports";

export function ReportDocument({ report }: { report: CareReport }) {
  const output = getReviewedReportOutput(report.ai_output, report.reviewed_output);
  const aggregate = report.aggregate_json;
  const elderName = aggregate.elder.nickname ?? aggregate.elder.fullName;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">CareKin Report</p>
        <h1 className="text-2xl font-bold">{elderName}</h1>
        <p className="text-sm text-muted-foreground">
          {formatDate(report.period_start)} - {formatDate(report.period_end)} · {report.period_days} วัน
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        <MetricCard
          label="การกินยา"
          value={`${aggregate.medicationAdherence.percent}%`}
          detail={`${aggregate.medicationAdherence.completed}/${aggregate.medicationAdherence.total} ครั้ง`}
        />
        <MetricCard
          label="Check-in"
          value={`${aggregate.checkIns.completed}/${aggregate.checkIns.expected}`}
          detail={`${aggregate.checkIns.concerning} วันที่ควรติดตาม`}
        />
        <MetricCard
          label="Vitals"
          value={`${aggregate.vitals.count}`}
          detail="รายการที่บันทึก"
        />
        <MetricCard
          label="Alerts"
          value={`${aggregate.alerts.total}`}
          detail={`${aggregate.alerts.urgent} เร่งด่วน`}
        />
      </div>

      <Card className="border-primary/30 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-base">สรุปที่ตรวจทานแล้ว</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm leading-relaxed">{output.summary}</p>
          <ReportSection title="ประเด็นสำคัญ" items={output.key_observations} />
          <ReportSection title="Routine ที่พลาด" items={output.missed_routines} />
          <ReportSection
            title="ค่านอกช่วงที่ตั้งไว้"
            items={output.values_outside_user_configured_ranges}
          />
          <ReportSection title="คำถามสำหรับแพทย์" items={output.questions_for_doctor} />
          <ReportSection
            title="หมายเหตุจากผู้ดูแล"
            items={output.caregiver_notes_summary}
          />
          <p className="rounded-lg border border-warning/30 bg-warning/10 p-3 text-xs text-muted-foreground">
            {output.safety_disclaimer}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">ค่าสุขภาพล่าสุด</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="pb-2 pr-4">วันที่</th>
                  <th className="pb-2 pr-4">ความดัน</th>
                  <th className="pb-2 pr-4">ชีพจร</th>
                  <th className="pb-2">น้ำตาล</th>
                </tr>
              </thead>
              <tbody>
                {aggregate.vitals.latest.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-3 text-muted-foreground">
                      ไม่มีข้อมูล
                    </td>
                  </tr>
                ) : (
                  aggregate.vitals.latest.map((vital) => (
                    <tr key={vital.id} className="border-b border-border/50">
                      <td className="py-2 pr-4">{formatDate(vital.measured_at)}</td>
                      <td className="py-2 pr-4">
                        {vital.systolic ?? "—"}/{vital.diastolic ?? "—"}
                      </td>
                      <td className="py-2 pr-4">{vital.pulse ?? "—"}</td>
                      <td className="py-2">{vital.blood_sugar ?? "—"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Alerts ในช่วงรายงาน</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {aggregate.alerts.items.length === 0 ? (
            <p className="text-sm text-muted-foreground">ไม่มี alert</p>
          ) : (
            aggregate.alerts.items.map((alert) => (
              <div key={alert.id} className="flex items-start gap-3">
                <AlertBadge level={alert.severity} />
                <div>
                  <p className="text-sm font-medium">{alert.title}</p>
                  <p className="text-sm text-muted-foreground">{alert.message}</p>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function MetricCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <p className="text-sm text-muted-foreground">{label}</p>
        <CardTitle className="text-3xl">{value}</CardTitle>
        <p className="text-xs text-muted-foreground">{detail}</p>
      </CardHeader>
    </Card>
  );
}

function ReportSection({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div>
      <h3 className="mb-1 text-sm font-semibold">{title}</h3>
      <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("th-TH", { timeZone: "Asia/Bangkok" });
}
