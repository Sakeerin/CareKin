import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ElderForm } from "@/components/app/elder-form";
import { FormAction, FormField } from "@/components/app/form-action";
import {
  getElder,
  updateElderAction,
  deleteElderFormAction,
  addEmergencyContactAction,
  deleteEmergencyContactAction,
} from "@/lib/actions/elder";
import { updateElderReminderSettingsAction } from "@/lib/actions/care-tasks";
import { FormSelect } from "@/components/app/form-action";
import { REMINDER_CHANNELS } from "@/lib/types/care-tasks";
import { requireWorkspace, canManageElders } from "@/lib/auth/session";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const elder = await getElder(id);
  return { title: elder?.nickname ?? elder?.full_name ?? "ผู้สูงวัย" };
}

export default async function ElderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { membership } = await requireWorkspace();
  const elder = await getElder(id);

  if (!elder) notFound();

  const canEdit = canManageElders(membership.role);
  const contacts = elder.emergency_contacts ?? [];

  const boundUpdate = updateElderAction.bind(null, id);
  const boundAddContact = addEmergencyContactAction.bind(null, id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/elders" className="text-sm text-muted-foreground hover:underline">
            ← กลับ
          </Link>
          <h1 className="mt-1 text-2xl font-bold">
            {elder.nickname ?? elder.full_name}
          </h1>
          <p className="text-muted-foreground">{elder.full_name}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/elders/${id}/check-in`}>
            <Button variant="outline" size="sm">Check-in</Button>
          </Link>
          <Link href={`/elders/${id}/vitals`}>
            <Button variant="outline" size="sm">Vitals</Button>
          </Link>
          <Link href={`/elders/${id}/medications`}>
            <Button variant="outline" size="sm">ยา</Button>
          </Link>
          <Link href={`/elders/${id}/routines`}>
            <Button variant="outline" size="sm">Routine</Button>
          </Link>
        </div>
      </div>

      {canEdit && (
        <Card>
          <CardHeader>
            <CardTitle>การแจ้งเตือน</CardTitle>
          </CardHeader>
          <CardContent>
            <ReminderSettings elderId={id} elder={elder} />
          </CardContent>
        </Card>
      )}

      {canEdit ? (
        <Card>
          <CardHeader>
            <CardTitle>แก้ไขข้อมูล</CardTitle>
          </CardHeader>
          <CardContent>
            <ElderForm action={boundUpdate} elder={elder} submitLabel="บันทึกการเปลี่ยนแปลง" />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>ข้อมูลผู้สูงวัย</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <InfoRow label="โรคประจำตัว" value={elder.chronic_conditions?.join(", ")} />
            <InfoRow label="แพ้" value={elder.allergies} />
            <InfoRow label="การอยู่อาศัย" value={elder.living_arrangement} />
            <InfoRow label="คำแนะนำการดูแล" value={elder.care_instructions} />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>ผู้ติดต่อฉุกเฉิน</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {contacts.length === 0 ? (
            <p className="text-sm text-muted-foreground">ยังไม่มีผู้ติดต่อฉุกเฉิน</p>
          ) : (
            contacts.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between rounded-lg border border-border p-3"
              >
                <div>
                  <p className="font-medium">{c.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {c.relationship} · {c.phone}
                  </p>
                </div>
                {canEdit && (
                  <form action={deleteEmergencyContactAction.bind(null, id, c.id)}>
                    <Button type="submit" variant="ghost" size="sm">
                      ลบ
                    </Button>
                  </form>
                )}
              </div>
            ))
          )}

          {canEdit && (
            <FormAction action={boundAddContact} className="space-y-3 border-t border-border pt-4">
              <p className="text-sm font-medium">เพิ่มผู้ติดต่อ</p>
              <FormField label="ชื่อ" name="name" required />
              <FormField label="ความสัมพันธ์" name="relationship" required />
              <FormField label="เบอร์โทร" name="phone" type="tel" required />
              <FormField label="LINE User ID (ไม่บังคับ)" name="lineUserId" />
              <Button type="submit" size="sm">
                เพิ่มผู้ติดต่อ
              </Button>
            </FormAction>
          )}
        </CardContent>
      </Card>

      {canEdit && (
        <form action={deleteElderFormAction.bind(null, id)}>
          <Button type="submit" variant="destructive">
            ลบ profile ผู้สูงวัย
          </Button>
        </form>
      )}
    </div>
  );
}

function ReminderSettings({
  elderId,
  elder,
}: {
  elderId: string;
  elder: { line_user_id?: string | null; reminder_channel?: string };
}) {
  const bound = updateElderReminderSettingsAction.bind(null, elderId);
  return (
    <FormAction action={bound} className="space-y-4">
      <FormSelect
        label="ช่องทางแจ้งเตือน"
        name="reminderChannel"
        defaultValue={elder.reminder_channel ?? "web"}
        options={REMINDER_CHANNELS.map((c) => ({ value: c.value, label: c.label }))}
      />
      <FormField
        label="LINE User ID"
        name="lineUserId"
        defaultValue={elder.line_user_id ?? ""}
        placeholder="Uxxxxxxxx"
      />
      <Button type="submit" size="sm">
        บันทึกการแจ้งเตือน
      </Button>
    </FormAction>
  );
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <p>
      <span className="font-medium">{label}: </span>
      {value}
    </p>
  );
}
