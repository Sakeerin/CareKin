import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FormAction, FormSelect } from "@/components/app/form-action";
import { ReportDocument } from "@/components/app/report-document";
import {
  createReportShareAction,
  getLatestReportShares,
  getReport,
  markReportExportedAction,
  updateReportReviewAction,
} from "@/lib/actions/reports";
import { canManageWorkspace, requireWorkspace } from "@/lib/auth/session";
import { getReviewedReportOutput } from "@/lib/services/ai-summary";

export const metadata = { title: "ตรวจทานรายงาน" };

export default async function ReportReviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; reportId: string }>;
  searchParams: Promise<{ share?: string }>;
}) {
  const { id, reportId } = await params;
  const { share } = await searchParams;
  const { membership } = await requireWorkspace();
  const report = await getReport(reportId);
  if (!report || report.elder_id !== id) notFound();

  const canReview = canManageWorkspace(membership.role);
  const output = getReviewedReportOutput(report.ai_output, report.reviewed_output);
  const reviewAction = updateReportReviewAction.bind(null, id, reportId);
  const shareAction = createReportShareAction.bind(null, id, reportId);
  const shares = await getLatestReportShares(reportId);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const createdShareUrl = share ? `${appUrl}/report/share/${share}` : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link href={`/elders/${id}/reports`} className="text-sm text-muted-foreground hover:underline">
            ← กลับรายงาน
          </Link>
          <h1 className="mt-1 text-2xl font-bold">ตรวจทานรายงานก่อนส่ง</h1>
          <p className="text-muted-foreground">แก้ไขข้อความ AI draft ก่อน export หรือแชร์</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <form action={markReportExportedAction.bind(null, id, reportId)}>
            <Button type="submit" variant="outline" disabled={!canReview || report.status === "draft"}>
              Export PDF
            </Button>
          </form>
          <Link href={`/elders/${id}/reports/${reportId}/export`}>
            <Button variant="outline">Preview print</Button>
          </Link>
        </div>
      </div>

      {createdShareUrl && (
        <Card className="border-success/30 bg-success/10">
          <CardContent className="py-4">
            <p className="text-sm font-medium text-success">สร้างลิงก์แชร์แล้ว</p>
            <p className="break-all text-sm">{createdShareUrl}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>แก้ไข structured summary</CardTitle>
        </CardHeader>
        <CardContent>
          {canReview ? (
            <FormAction action={reviewAction} className="space-y-4">
              <TextAreaBlock label="สรุป" name="summary" defaultValue={output.summary} rows={4} />
              <TextAreaBlock
                label="ประเด็นสำคัญ (1 บรรทัดต่อ 1 ข้อ)"
                name="key_observations"
                defaultValue={output.key_observations.join("\n")}
              />
              <TextAreaBlock
                label="Routine ที่พลาด"
                name="missed_routines"
                defaultValue={output.missed_routines.join("\n")}
              />
              <TextAreaBlock
                label="ค่านอกช่วงที่ตั้งไว้"
                name="values_outside_user_configured_ranges"
                defaultValue={output.values_outside_user_configured_ranges.join("\n")}
              />
              <TextAreaBlock
                label="คำถามสำหรับแพทย์"
                name="questions_for_doctor"
                defaultValue={output.questions_for_doctor.join("\n")}
              />
              <TextAreaBlock
                label="หมายเหตุจากผู้ดูแล"
                name="caregiver_notes_summary"
                defaultValue={output.caregiver_notes_summary.join("\n")}
              />
              <TextAreaBlock
                label="Safety disclaimer"
                name="safety_disclaimer"
                defaultValue={output.safety_disclaimer}
                rows={3}
              />
              <Button type="submit">บันทึกการตรวจทาน</Button>
            </FormAction>
          ) : (
            <p className="text-sm text-muted-foreground">เฉพาะ family admin/owner เท่านั้นที่แก้ไขรายงานได้</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>แชร์รายงาน</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {canReview && (
            <FormAction action={shareAction} className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <FormSelect
                label="หมดอายุใน"
                name="expiresInDays"
                defaultValue="7"
                options={[
                  { value: "1", label: "1 วัน" },
                  { value: "7", label: "7 วัน" },
                  { value: "14", label: "14 วัน" },
                  { value: "30", label: "30 วัน" },
                ]}
              />
              <Button type="submit" variant="outline">
                สร้างลิงก์แชร์
              </Button>
            </FormAction>
          )}
          {shares.length > 0 && (
            <div className="space-y-2 text-sm">
              {shares.map((item) => (
                <p key={item.id} className="break-all text-muted-foreground">
                  {appUrl}/report/share/{item.token} · หมดอายุ{" "}
                  {new Date(item.expires_at).toLocaleString("th-TH")}
                </p>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <ReportDocument report={report} />
    </div>
  );
}

function TextAreaBlock({
  label,
  name,
  defaultValue,
  rows = 5,
}: {
  label: string;
  name: string;
  defaultValue: string;
  rows?: number;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium">{label}</span>
      <textarea
        name={name}
        defaultValue={defaultValue}
        rows={rows}
        className="input-field resize-y"
      />
    </label>
  );
}
