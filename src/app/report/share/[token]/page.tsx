import { notFound } from "next/navigation";
import { ReportDocument } from "@/components/app/report-document";
import { Card, CardContent } from "@/components/ui/card";
import { getSharedReport } from "@/lib/actions/reports";

export const metadata = { title: "CareKin shared report" };

export default async function SharedReportPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const share = await getSharedReport(token);
  const report = share?.reports;

  if (!share || !report) notFound();

  return (
    <main className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <Card>
          <CardContent className="py-4">
            <p className="text-sm text-muted-foreground">
              Shared CareKin report · หมดอายุ {new Date(share.expires_at).toLocaleString("th-TH")}
            </p>
          </CardContent>
        </Card>
        <ReportDocument report={report} />
      </div>
    </main>
  );
}
