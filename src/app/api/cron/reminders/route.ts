import { NextResponse } from "next/server";
import { createAdminClient, hasAdminClient } from "@/lib/supabase/admin";
import { generateTaskEventsForWorkspace } from "@/lib/services/task-events";
import { enqueueRemindersForPendingEvents } from "@/lib/services/task-events";
import { processReminderQueue } from "@/lib/services/reminder-processor";
import { processMissedDailyCheckIns } from "@/lib/services/alert-engine";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!hasAdminClient()) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY not configured" },
      { status: 500 },
    );
  }

  const supabase = createAdminClient();

  const { data: workspaces } = await supabase.from("workspaces").select("id");

  let totalGenerated = 0;
  let totalEnqueued = 0;
  let totalCheckInAlerts = 0;

  for (const ws of workspaces ?? []) {
    const gen = await generateTaskEventsForWorkspace(supabase, ws.id);
    totalGenerated += gen.created;
    totalEnqueued += await enqueueRemindersForPendingEvents(supabase, ws.id);
    totalCheckInAlerts += await processMissedDailyCheckIns(supabase, ws.id);
  }

  const processed = await processReminderQueue(supabase);

  return NextResponse.json({
    ok: true,
    generated: totalGenerated,
    enqueued: totalEnqueued,
    checkInAlerts: totalCheckInAlerts,
    ...processed,
  });
}
