import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ElderCheckInPanel } from "@/components/app/elder-check-in-panel";
import { getElder } from "@/lib/actions/elder";
import { createDailyCheckInAction } from "@/lib/actions/health";
import { requireWorkspace } from "@/lib/auth/session";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const elder = await getElder(id);
  return { title: `โหมดผู้สูงวัย — ${elder?.nickname ?? elder?.full_name ?? ""}` };
}

export default async function ElderModeCheckInPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireWorkspace();
  const elder = await getElder(id);
  if (!elder) notFound();

  const boundCreate = createDailyCheckInAction.bind(null, id);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link href={`/elders/${id}/check-in`} className="text-sm text-muted-foreground hover:underline">
          ← กลับไปหน้า check-in
        </Link>
        <h1 className="mt-2 text-3xl font-bold">สวัสดี {elder.nickname ?? elder.full_name}</h1>
        <p className="mt-1 text-lg text-muted-foreground">แตะคำตอบใหญ่ ๆ เพื่อบอกอาการวันนี้</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Check-in วันนี้</CardTitle>
        </CardHeader>
        <CardContent>
          <ElderCheckInPanel action={boundCreate} />
        </CardContent>
      </Card>
    </div>
  );
}
