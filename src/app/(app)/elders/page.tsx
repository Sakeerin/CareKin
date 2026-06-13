import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { requireWorkspace, canManageElders } from "@/lib/auth/session";
import { getElders } from "@/lib/actions/elder";

export const metadata = { title: "ผู้สูงวัย" };

export default async function EldersPage() {
  const { workspace, membership } = await requireWorkspace();
  const elders = await getElders(workspace.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">ผู้สูงวัย</h1>
        {canManageElders(membership.role) && (
          <Link href="/elders/new">
            <Button>เพิ่มผู้สูงวัย</Button>
          </Link>
        )}
      </div>

      {elders.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            ยังไม่มีผู้สูงวัยใน workspace นี้
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {elders.map((elder) => (
            <Link key={elder.id} href={`/elders/${elder.id}`}>
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardHeader>
                  <CardTitle>{elder.nickname ?? elder.full_name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{elder.full_name}</p>
                  {elder.chronic_conditions?.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {elder.chronic_conditions.join(", ")}
                    </p>
                  )}
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
