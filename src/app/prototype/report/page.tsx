"use client";

import { useState } from "react";
import { PrototypeShell } from "@/components/prototype/prototype-shell";
import { SafetyDisclaimer } from "@/components/prototype/prototype-banner";
import { AlertBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { copy } from "@/lib/copy";
import {
  elderProfile,
  mockAiReport,
  vitalReadings,
  alerts,
  weeklyTrend,
  getMedicationAdherencePercent,
  getCheckInCompletionCount,
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";

type Period = 7 | 14 | 30;

export default function ReportPage() {
  const [period, setPeriod] = useState<Period>(7);
  const [showPdfModal, setShowPdfModal] = useState(false);

  const adherence = getMedicationAdherencePercent();
  const checkInStats = getCheckInCompletionCount();

  return (
    <PrototypeShell currentPath="/prototype/report">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">{copy.report.title}</h1>
          <p className="text-muted-foreground">
            {elderProfile.nickname} — รายงานสรุปการดูแล
          </p>
        </div>

        <div className="flex gap-2">
          {([7, 14, 30] as Period[]).map((days) => (
            <button
              key={days}
              type="button"
              onClick={() => setPeriod(days)}
              className={cn(
                "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                period === days
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground",
              )}
            >
              {days === 7
                ? copy.report.days7
                : days === 14
                  ? copy.report.days14
                  : copy.report.days30}
            </button>
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{copy.report.medicationAdherence}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary">{adherence}%</p>
              <p className="text-sm text-muted-foreground">
                จาก {weeklyTrend.length} วันล่าสุด
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{copy.report.checkInSummary}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary">
                {checkInStats.done}/{checkInStats.total}
              </p>
              <p className="text-sm text-muted-foreground">วันที่บันทึก check-in</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{copy.report.vitalsTable}</CardTitle>
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
                  {vitalReadings.slice(0, period <= 7 ? 7 : period).map((v) => (
                    <tr key={v.date} className="border-b border-border/50">
                      <td className="py-2 pr-4">
                        {new Date(v.date).toLocaleDateString("th-TH")}
                      </td>
                      <td className="py-2 pr-4">
                        {v.systolic}/{v.diastolic}
                      </td>
                      <td className="py-2 pr-4">{v.pulse}</td>
                      <td className="py-2">{v.bloodSugar ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{copy.report.alertsLog}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {alerts.map((alert) => (
              <div key={alert.id} className="flex items-center gap-3">
                <AlertBadge level={alert.level} />
                <span className="text-sm">{alert.message}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-primary/30 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-base">{copy.report.aiSummary}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm leading-relaxed">{mockAiReport.summary}</p>

            <ReportSection title="ประเด็นสำคัญ" items={mockAiReport.key_observations} />
            <ReportSection title="Routine ที่พลาด" items={mockAiReport.missed_routines} />
            <ReportSection
              title="ค่านอกช่วงที่ตั้งไว้"
              items={mockAiReport.values_outside_user_configured_ranges}
            />
            <ReportSection
              title="ควรถามแพทย์เกี่ยวกับ"
              items={mockAiReport.questions_for_doctor}
            />
            <ReportSection
              title="หมายเหตุจากผู้ดูแล"
              items={mockAiReport.caregiver_notes_summary}
            />

            <SafetyDisclaimer />
          </CardContent>
        </Card>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button variant="outline" disabled>
            {copy.report.reviewBeforeSend}
          </Button>
          <Button onClick={() => setShowPdfModal(true)}>
            {copy.report.exportPdf}
          </Button>
        </div>

        {showPdfModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <Card className="max-w-sm">
              <CardContent className="space-y-4 pt-6 text-center">
                <p className="text-4xl">📄</p>
                <p className="font-medium">{copy.report.pdfComingSoon}</p>
                <Button onClick={() => setShowPdfModal(false)} className="w-full">
                  ปิด
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </PrototypeShell>
  );
}

function ReportSection({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div>
      <h4 className="mb-1 text-sm font-semibold">{title}</h4>
      <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
