"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PrototypeShell } from "@/components/prototype/prototype-shell";
import { StatusCard } from "@/components/prototype/status-card";
import { AlertBadge, StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { copy } from "@/lib/copy";
import {
  elderProfile,
  medications,
  routines,
  activityLogs,
  alerts,
  weeklyTrend,
  vitalReadings,
} from "@/lib/mock-data";
import {
  hasTodayCheckIn,
  getMergedActivityLogs,
} from "@/lib/prototype-store";
import { formatThaiDate } from "@/lib/utils";

export default function FamilyDashboardPage() {
  const [checkInDone, setCheckInDone] = useState(false);
  const [userLogs, setUserLogs] = useState<
    Array<{ id: string; message: string; timestamp: string; type: string }>
  >([]);

  useEffect(() => {
    setCheckInDone(hasTodayCheckIn());
    setUserLogs(getMergedActivityLogs());
  }, []);

  const medsDone = medications.filter((m) => m.status === "done").length;
  const medsTotal = medications.length;
  const missedItems: Array<{ id: string; name: string; time: string; status: "pending" | "missed" }> = [
    ...medications
      .filter((m) => m.status !== "done")
      .map((m) => ({ id: m.id, name: m.name, time: m.time, status: m.status as "pending" | "missed" })),
    ...routines
      .filter((r) => r.status === "missed")
      .map((r) => ({ id: r.id, name: r.name, time: r.time, status: "missed" as const })),
  ];
  const lastVital = vitalReadings[0];
  const allLogs = [
    ...userLogs,
    ...activityLogs.map((l) => ({
      id: l.id,
      message: l.message,
      timestamp: l.timestamp,
      type: l.type,
    })),
  ]
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    )
    .slice(0, 6);

  return (
    <PrototypeShell currentPath="/prototype/family">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">{copy.family.title}</h1>
            <p className="text-muted-foreground">
              {elderProfile.nickname} — {formatThaiDate()}
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/prototype/report">
              <Button variant="outline">{copy.family.viewReport}</Button>
            </Link>
          </div>
        </div>

        <section>
          <h2 className="mb-3 text-lg font-semibold">{copy.family.todayStatus}</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            <StatusCard
              title={copy.family.checkIn}
              value={checkInDone ? "เสร็จแล้ว" : "ยังไม่บันทึก"}
              status={checkInDone ? "done" : "pending"}
              icon="📝"
            />
            <StatusCard
              title={copy.family.medications}
              value={`${medsDone}/${medsTotal}`}
              subtitle="ยืนยันแล้ววันนี้"
              status={medsDone === medsTotal ? "done" : "pending"}
              icon="💊"
            />
            <StatusCard
              title={copy.family.lastVital}
              value={`${lastVital.systolic}/${lastVital.diastolic}`}
              subtitle={`ชีพจร ${lastVital.pulse} — วันนี้`}
              icon="❤️"
            />
          </div>
        </section>

        {missedItems.length > 0 && (
          <section>
            <h2 className="mb-3 text-lg font-semibold">{copy.family.missedReminders}</h2>
            <div className="space-y-2">
              {missedItems.map((item) => (
                <Card key={item.id}>
                  <CardContent className="flex items-center justify-between py-4">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">เวลา {item.time}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={item.status} />
                      <Button variant="outline" size="sm">
                        {copy.family.remindAgain}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 className="mb-3 text-lg font-semibold">{copy.family.recentActivity}</h2>
          <Card>
            <CardContent className="divide-y divide-border p-0">
              {allLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-3 px-5 py-3">
                  <span className="mt-0.5 text-lg">
                    {log.type === "check-in"
                      ? "📝"
                      : log.type === "medication"
                        ? "💊"
                        : log.type === "vital"
                          ? "❤️"
                          : log.type === "task"
                            ? "✅"
                            : "⚠️"}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm">{log.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(log.timestamp).toLocaleString("th-TH")}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold">{copy.family.alerts}</h2>
          <div className="space-y-2">
            {alerts.map((alert) => (
              <Card key={alert.id}>
                <CardContent className="flex items-center gap-3 py-4">
                  <AlertBadge level={alert.level} />
                  <div className="flex-1">
                    <p className="text-sm">{alert.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(alert.timestamp).toLocaleString("th-TH")}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold">{copy.family.trend}</h2>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Check-in และการกินยา
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2 h-32">
                {weeklyTrend.map((day) => {
                  const height = (day.medsCompleted / day.medsTotal) * 100;
                  return (
                    <div key={day.date} className="flex flex-1 flex-col items-center gap-1">
                      <div className="relative flex w-full flex-1 items-end">
                        <div
                          className="w-full rounded-t-md bg-primary/80"
                          style={{ height: `${height}%` }}
                        />
                        {day.checkInDone && (
                          <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-xs">
                            ✓
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(day.date).toLocaleDateString("th-TH", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </PrototypeShell>
  );
}
