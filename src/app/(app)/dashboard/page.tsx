import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { requireWorkspace, canManageElders } from "@/lib/auth/session";
import { getElders } from "@/lib/actions/elder";
import { getAuditLogs } from "@/lib/actions/audit";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const { workspace, membership } = await requireWorkspace();
  const elders = await getElders(workspace.id);
  const auditLogs = await getAuditLogs(workspace.id, 10);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">{workspace.name}</p>
        </div>
        {canManageElders(membership.role) && (
          <Link href="/elders/new">
            <Button>เพิ่มผู้สูงวัย</Button>
          </Link>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>ผู้สูงวัย</CardDescription>
            <CardTitle className="text-3xl">{elders.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>บทบาทของคุณ</CardDescription>
            <CardTitle className="text-lg capitalize">{membership.role.replace("_", " ")}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>แผน</CardDescription>
            <CardTitle className="text-lg">{workspace.plan}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <section>
        <h2 className="mb-3 text-lg font-semibold">ผู้สูงวัยใน workspace</h2>
        {elders.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              <p>ยังไม่มีผู้สูงวัย — เพิ่มคนแรกเพื่อเริ่มดูแล</p>
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
              <Link key={elder.id} href={`/elders/${elder.id}`}>
                <Card className="transition-shadow hover:shadow-md">
                  <CardHeader>
                    <CardTitle>{elder.nickname ?? elder.full_name}</CardTitle>
                    <CardDescription>{elder.full_name}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">กิจกรรมล่าสุด (Audit log)</h2>
        <Card>
          <CardContent className="divide-y divide-border p-0">
            {auditLogs.length === 0 ? (
              <p className="p-5 text-sm text-muted-foreground">ยังไม่มีกิจกรรม</p>
            ) : (
              auditLogs.map((log) => (
                <div key={log.id} className="px-5 py-3">
                  <p className="text-sm font-medium">{log.action}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(log.created_at).toLocaleString("th-TH")}
                    {log.profiles?.display_name && ` · ${log.profiles.display_name}`}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </section>

      <p className="text-sm text-muted-foreground">
        ต้นแบบ Phase 1 ยังใช้ได้ที่{" "}
        <Link href="/prototype" className="text-primary hover:underline">
          /prototype
        </Link>
      </p>
    </div>
  );
}
