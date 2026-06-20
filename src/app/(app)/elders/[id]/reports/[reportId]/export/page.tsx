import Link from "next/link";
import { notFound } from "next/navigation";
import { PrintButton } from "@/components/app/print-button";
import { ReportDocument } from "@/components/app/report-document";
import { getReport } from "@/lib/actions/reports";
import { requireWorkspace } from "@/lib/auth/session";

export const metadata = { title: "Export report" };

export default async function ReportExportPage({
  params,
}: {
  params: Promise<{ id: string; reportId: string }>;
}) {
  const { id, reportId } = await params;
  await requireWorkspace();
  const report = await getReport(reportId);
  if (!report || report.elder_id !== id) notFound();

  return (
    <div className="space-y-6">
      <div className="print:hidden">
        <Link
          href={`/elders/${id}/reports/${reportId}/review`}
          className="text-sm text-muted-foreground hover:underline"
        >
          ← กลับไปตรวจทาน
        </Link>
        <div className="mt-3 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Export PDF</h1>
            <p className="text-sm text-muted-foreground">ใช้ Print / Save as PDF เพื่อบันทึกไฟล์</p>
          </div>
          <PrintButton label="Print / Save PDF" />
        </div>
      </div>

      <div className="rounded-xl bg-card p-6 print:p-0">
        <ReportDocument report={report} />
      </div>
    </div>
  );
}
