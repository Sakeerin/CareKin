import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FormAction, FormField, FormTextarea, FormSelect } from "@/components/app/form-action";
import { requireWorkspace, canManageElders } from "@/lib/auth/session";
import { getElder } from "@/lib/actions/elder";
import { getCareTasks, deleteCareTaskAction, createCareTaskAction } from "@/lib/actions/care-tasks";
import { ROUTINE_TASK_TYPES } from "@/lib/types/care-tasks";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const elder = await getElder(id);
  return { title: `Routine — ${elder?.nickname ?? elder?.full_name ?? ""}` };
}

export default async function RoutinesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { membership } = await requireWorkspace();
  const elder = await getElder(id);
  if (!elder) notFound();

  const tasks = await getCareTasks(id);
  const canEdit = canManageElders(membership.role);
  const boundCreate = createCareTaskAction.bind(null, id);

  return (
    <div className="space-y-6">
      <div>
        <Link href={`/elders/${id}`} className="text-sm text-muted-foreground hover:underline">
          ← {elder.nickname ?? elder.full_name}
        </Link>
        <h1 className="mt-1 text-2xl font-bold">Routine / งานดูแล</h1>
      </div>

      <div className="space-y-3">
        {tasks.map((task) => (
          <Card key={task.id}>
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle className="text-base">{task.title}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {task.task_type} · {task.schedule_time.slice(0, 5)} น.
                </p>
                {task.instruction && (
                  <p className="text-sm">{task.instruction}</p>
                )}
              </div>
              {canEdit && (
                <form action={deleteCareTaskAction.bind(null, id, task.id)}>
                  <Button type="submit" variant="ghost" size="sm">
                    ลบ
                  </Button>
                </form>
              )}
            </CardHeader>
          </Card>
        ))}
      </div>

      {canEdit && (
        <Card>
          <CardHeader>
            <CardTitle>เพิ่ม routine</CardTitle>
          </CardHeader>
          <CardContent>
            <FormAction action={boundCreate} className="space-y-4">
              <FormField label="ชื่องาน" name="title" required placeholder="วัดความดัน" />
              <FormSelect
                label="ประเภท"
                name="taskType"
                options={ROUTINE_TASK_TYPES.map((t) => ({
                  value: t.value,
                  label: t.label,
                }))}
              />
              <FormField label="เวลา" name="scheduleTime" type="time" required />
              <FormTextarea label="คำแนะนำ" name="instruction" />
              <Button type="submit">บันทึก routine</Button>
            </FormAction>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
