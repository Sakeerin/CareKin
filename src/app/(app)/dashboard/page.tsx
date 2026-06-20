import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge, AlertBadge } from "@/components/ui/badge";
import { requireWorkspace, canManageElders } from "@/lib/auth/session";
import { getElders } from "@/lib/actions/elder";
import {
  getTodayTaskEvents,
  getTodayStatusSummary,
  getOpenAlerts,
  syncTodayTasksForWorkspace,
} from "@/lib/actions/task-events";
import { getHealthDashboardSummary } from "@/lib/actions/health";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const { workspace, membership } = await requireWorkspace();
  await syncTodayTasksForWorkspace();

  const [elders, todayEvents, summary, alerts, health] = await Promise.all([
    getElders(workspace.id),
    getTodayTaskEvents(workspace.id),
    getTodayStatusSummary(workspace.id),
    getOpenAlerts(workspace.id),
    getHealthDashboardSummary(workspace.id),
  ]);

  const pendingEvents = todayEvents.filter((e) => e.status === "pending");
  const missedEvents = todayEvents.filter((e) => e.status === "missed");

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">{workspace.name}</p>
        </div>
        <div className="flex gap-2">
          <Link href="/tasks">
            <Button variant="outline">งานวันนี้</Button>
          </Link>
          {canManageElders(membership.role) && (
            <Link href="/elders/new">
              <Button>เพิ่มผู้สูงวัย</Button>
            </Link>
          )}
        </div>
      </div>

      <section>
        <h2 className="mb-3 text-lg font-semibold">สถานะวันนี้</h2>
        <div className="grid gap-3 sm:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>งานทั้งหมด</CardDescription>
              <CardTitle className="text-3xl">{summary.total}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>ทำแล้ว</CardDescription>
              <CardTitle className="text-3xl text-success">{summary.completed}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>รอดำเนินการ</CardDescription>
              <CardTitle className="text-3xl text-warning-foreground">{summary.pending}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>พลาด</CardDescription>
              <CardTitle className="text-3xl text-destructive">{summary.missed}</CardTitle>
            </CardHeader>
          </Card>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">สุขภาพวันนี้</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Check-in แล้ว</CardDescription>
              <CardTitle className="text-3xl">
                {health.checkedInToday}/{health.totalElders}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Vital alerts เปิดอยู่</CardDescription>
              <CardTitle className="text-3xl text-warning-foreground">
                {health.abnormalVitalsToday}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>บันทึกค่าสุขภาพล่าสุด</CardDescription>
              <CardTitle className="text-3xl">{health.latestVitals.length}</CardTitle>
            </CardHeader>
          </Card>
        </div>
      </section>

      {alerts.length > 0 && (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">การแจ้งเตือน</h2>
            <Link href="/notifications" className="text-sm text-primary hover:underline">
              ดูทั้งหมด
            </Link>
          </div>
          <div className="space-y-2">
            {alerts.slice(0, 3).map((alert) => (
              <Card key={alert.id} className="border-warning/30">
                <CardContent className="flex items-center gap-3 py-4">
                  <AlertBadge level="family" />
                  <p className="text-sm">{alert.message}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {(pendingEvents.length > 0 || missedEvents.length > 0) && (
        <section>
          <h2 className="mb-3 text-lg font-semibold">งานที่ต้องดูแล</h2>
          <div className="space-y-2">
            {[...pendingEvents, ...missedEvents].slice(0, 8).map((event) => (
              <Link key={event.id} href={`/tasks/${event.id}`}>
                <Card className="transition-shadow hover:shadow-md">
                  <CardContent className="flex items-center justify-between py-4">
                    <div>
                      <p className="font-medium">{event.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {(event.elders as { nickname?: string; full_name: string })?.nickname ??
                          (event.elders as { full_name: string })?.full_name}
                        {" · "}
                        {new Date(event.due_at).toLocaleTimeString("th-TH", {
                          hour: "2-digit",
                          minute: "2-digit",
                          timeZone: "Asia/Bangkok",
                        })}
                      </p>
                    </div>
                    <StatusBadge
                      status={event.status === "missed" ? "missed" : "pending"}
                    />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-3 text-lg font-semibold">ผู้สูงวัย</h2>
        {elders.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              <p>ยังไม่มีผู้สูงวัย — เพิ่มคนแรกแล้วตั้งยา/routine</p>
              {canManageElders(membership.role) && (
                <Link href="/elders/new" className="mt-4 inline-block">
                  <Button>เพิ่มผู้สูงวัย</Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {elders.map((elder) => (
              <Card key={elder.id}>
                <CardHeader>
                  <Link href={`/elders/${elder.id}`} className="hover:underline">
                    <CardTitle>{elder.nickname ?? elder.full_name}</CardTitle>
                  </Link>
                  <CardDescription>{elder.full_name}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  <Link href={`/elders/${elder.id}/check-in`}>
                    <Button size="sm" variant="outline">
                      Check-in
                    </Button>
                  </Link>
                  <Link href={`/elders/${elder.id}/vitals`}>
                    <Button size="sm" variant="outline">
                      Vitals
                    </Button>
                  </Link>
                  <Link href={`/elders/${elder.id}/reports`}>
                    <Button size="sm" variant="outline">
                      Reports
                    </Button>
                  </Link>
                  <Link href={`/elders/${elder.id}/medications`}>
                    <Button size="sm" variant="outline">
                      ยา
                    </Button>
                  </Link>
                  <Link href={`/elders/${elder.id}/routines`}>
                    <Button size="sm" variant="outline">
                      Routine
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
