import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertBadge } from "@/components/ui/badge";
import { acknowledgeAlertAction } from "@/lib/actions/task-events";
import { getCareAlert } from "@/lib/actions/health";
import { canManageWorkspace, requireWorkspace } from "@/lib/auth/session";
import type { CareAlert } from "@/lib/types/care-tasks";

export const metadata = { title: "รายละเอียดแจ้งเตือน" };

export default async function AlertDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { membership } = await requireWorkspace();
  const alert = (await getCareAlert(id)) as CareAlert | null;
  if (!alert) notFound();

  const canAck = canManageWorkspace(membership.role);
  const elder = alert.elders;

  return (
    <div className="space-y-6">
      <div>
        <Link href="/notifications" className="text-sm text-muted-foreground hover:underline">
          ← กลับการแจ้งเตือน
        </Link>
        <h1 className="mt-1 text-2xl font-bold">รายละเอียดแจ้งเตือน</h1>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <AlertBadge level={alert.severity} />
                <span className="text-sm text-muted-foreground">{alert.alert_type}</span>
              </div>
              <CardTitle>{alert.title}</CardTitle>
            </div>
            {canAck && alert.status === "open" && (
              <form action={acknowledgeAlertAction.bind(null, alert.id)}>
                <Button type="submit" variant="outline">
                  รับทราบ
                </Button>
              </form>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>{alert.message}</p>
          <div className="grid gap-3 text-sm sm:grid-cols-2">
            <Info label="ผู้สูงวัย" value={elder?.nickname ?? elder?.full_name} />
            <Info label="สถานะ" value={alert.status} />
            <Info label="สร้างเมื่อ" value={new Date(alert.created_at).toLocaleString("th-TH")} />
            <Info
              label="รับทราบเมื่อ"
              value={alert.acknowledged_at ? new Date(alert.acknowledged_at).toLocaleString("th-TH") : null}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Info({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <p>
      <span className="font-medium">{label}: </span>
      {value}
    </p>
  );
}
