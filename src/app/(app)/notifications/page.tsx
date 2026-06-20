import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { requireWorkspace, canManageWorkspace } from "@/lib/auth/session";
import {
  getNotificationLogs,
  getOpenAlerts,
  acknowledgeAlertAction,
} from "@/lib/actions/task-events";
import { AlertBadge } from "@/components/ui/badge";

export const metadata = { title: "การแจ้งเตือน" };

export default async function NotificationsPage() {
  const { workspace, membership } = await requireWorkspace();
  const logs = await getNotificationLogs(workspace.id);
  const alerts = await getOpenAlerts(workspace.id);
  const canAck = canManageWorkspace(membership.role);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">การแจ้งเตือน</h1>

      {alerts.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-semibold">แจ้งเตือนที่เปิดอยู่</h2>
          <div className="space-y-2">
            {alerts.map((alert) => (
              <Card key={alert.id}>
                <CardContent className="flex items-start justify-between gap-3 py-4">
                  <div>
                    <div className="mb-1 flex items-center gap-2">
                      <AlertBadge level={alert.severity === "urgent" ? "urgent" : alert.severity === "family" ? "family" : "info"} />
                      <span className="font-medium">{alert.title}</span>
                    </div>
                    <p className="text-sm">{alert.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(alert.created_at).toLocaleString("th-TH")}
                    </p>
                  </div>
                  {canAck && (
                    <form action={acknowledgeAlertAction.bind(null, alert.id)}>
                      <Button type="submit" size="sm" variant="outline">
                        รับทราบ
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-3 text-lg font-semibold">ประวัติการส่ง</h2>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Notification log
            </CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-border p-0">
            {logs.length === 0 ? (
              <p className="p-5 text-sm text-muted-foreground">ยังไม่มีประวัติ</p>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="px-5 py-3">
                  <p className="text-sm">{log.message}</p>
                  <p className="text-xs text-muted-foreground">
                    {log.channel} · {log.notification_type} ·{" "}
                    {new Date(log.created_at).toLocaleString("th-TH")}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
