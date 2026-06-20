import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FormAction, FormSelect } from "@/components/app/form-action";
import { getElder } from "@/lib/actions/elder";
import { createReportAction, getReportsForElder } from "@/lib/actions/reports";
import { requireWorkspace } from "@/lib/auth/session";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const elder = await getElder(id);
  return { title: `รายงาน — ${elder?.nickname ?? elder?.full_name ?? ""}` };
}

export default async function ReportsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireWorkspace();
  const elder = await getElder(id);
  if (!elder) notFound();

  const reports = await getReportsForElder(id);
  const boundCreate = createReportAction.bind(null, id);

  return (
    <div className="space-y-6">
      <div>
        <Link href={`/elders/${id}`} className="text-sm text-muted-foreground hover:underline">
          ← {elder.nickname ?? elder.full_name}
        </Link>
        <h1 className="mt-1 text-2xl font-bold">รายงานและ AI summary</h1>
        <p className="text-muted-foreground">สร้างรายงานสำหรับครอบครัวหรือไปพบแพทย์</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>สร้างรายงานใหม่</CardTitle>
        </CardHeader>
        <CardContent>
          <FormAction action={boundCreate} className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
            <FormSelect
              label="ช่วงเวลา"
              name="periodDays"
              defaultValue="7"
              options={[
                { value: "7", label: "7 วัน" },
                { value: "14", label: "14 วัน" },
                { value: "30", label: "30 วัน" },
              ]}
            />
            <FormSelect
              label="ประเภทรายงาน"
              name="reportType"
              defaultValue="weekly"
              options={[
                { value: "weekly", label: "รายงานประจำสัปดาห์" },
                { value: "doctor_visit", label: "รายงานพบแพทย์" },
              ]}
            />
            <Button type="submit">สร้าง AI draft</Button>
          </FormAction>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>รายงานที่ผ่านมา</CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-border p-0">
          {reports.length === 0 ? (
            <p className="p-5 text-sm text-muted-foreground">ยังไม่มีรายงาน</p>
          ) : (
            reports.map((report) => (
              <div
                key={report.id}
                className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium">
                    {report.period_days} วัน · {report.report_type === "doctor_visit" ? "พบแพทย์" : "รายสัปดาห์"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(report.period_start).toLocaleDateString("th-TH")} -{" "}
                    {new Date(report.period_end).toLocaleDateString("th-TH")} · {report.status}
                  </p>
                </div>
                <Link href={`/elders/${id}/reports/${report.id}/review`}>
                  <Button size="sm" variant="outline">
                    เปิดรายงาน
                  </Button>
                </Link>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
