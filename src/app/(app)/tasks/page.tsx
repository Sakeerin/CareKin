import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { requireWorkspace } from "@/lib/auth/session";
import {
  getTodayTaskEvents,
  syncTodayTasksForWorkspace,
} from "@/lib/actions/task-events";

export const metadata = { title: "งานวันนี้" };

export default async function TasksPage() {
  const { workspace } = await requireWorkspace();
  await syncTodayTasksForWorkspace();
  const events = await getTodayTaskEvents(workspace.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">งานวันนี้</h1>
        <Link href="/dashboard">
          <Button variant="outline">Dashboard</Button>
        </Link>
      </div>

      {events.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            ยังไม่มีงานวันนี้ — เพิ่มยาหรือ routine ใน profile ผู้สูงวัย
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {events.map((event) => (
            <Link key={event.id} href={`/tasks/${event.id}`}>
              <Card className="transition-shadow hover:shadow-md">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div>
                    <CardTitle className="text-base">{event.title}</CardTitle>
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
                    status={
                      event.status === "completed"
                        ? "done"
                        : event.status === "missed"
                          ? "missed"
                          : "pending"
                    }
                  />
                </CardHeader>
                {event.instruction && (
                  <CardContent className="pt-0 text-sm text-muted-foreground">
                    {event.instruction}
                  </CardContent>
                )}
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
