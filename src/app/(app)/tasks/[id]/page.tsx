import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TaskConfirmPanel } from "@/components/app/task-confirm-panel";
import { getTaskEvent, confirmTaskFromQuery } from "@/lib/actions/task-events";
import { requireUser } from "@/lib/auth/session";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = await getTaskEvent(id);
  return { title: event?.title ?? "ยืนยันงาน" };
}

export default async function TaskConfirmPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ action?: string }>;
}) {
  const { id } = await params;
  const { action } = await searchParams;

  if (action === "completed" || action === "missed" || action === "skipped") {
    await requireUser();
    await confirmTaskFromQuery(id, action);
  }

  const event = await getTaskEvent(id);
  if (!event) notFound();

  const elder = event.elders as { full_name: string; nickname: string | null };

  return (
    <div className="mx-auto max-w-md space-y-6">
      <Link href="/tasks" className="text-sm text-muted-foreground hover:underline">
        ← งานวันนี้
      </Link>

      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-elder-lg">{event.title}</CardTitle>
          <p className="text-muted-foreground">
            {elder?.nickname ?? elder?.full_name}
          </p>
          <p className="text-sm text-muted-foreground">
            กำหนด{" "}
            {new Date(event.due_at).toLocaleTimeString("th-TH", {
              hour: "2-digit",
              minute: "2-digit",
              timeZone: "Asia/Bangkok",
            })}
          </p>
          {event.instruction && (
            <p className="text-sm">{event.instruction}</p>
          )}
        </CardHeader>
        <CardContent>
          <TaskConfirmPanel event={event} />
        </CardContent>
      </Card>
    </div>
  );
}
