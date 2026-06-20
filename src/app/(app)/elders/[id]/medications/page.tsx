import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FormAction, FormField, FormTextarea } from "@/components/app/form-action";
import { requireWorkspace, canManageElders } from "@/lib/auth/session";
import { getElder } from "@/lib/actions/elder";
import { getMedications, deleteMedicationAction } from "@/lib/actions/medications";
import { createMedicationAction } from "@/lib/actions/medications";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const elder = await getElder(id);
  return { title: `ยา — ${elder?.nickname ?? elder?.full_name ?? ""}` };
}

export default async function MedicationsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { membership } = await requireWorkspace();
  const elder = await getElder(id);
  if (!elder) notFound();

  const medications = await getMedications(id);
  const canEdit = canManageElders(membership.role);
  const boundCreate = createMedicationAction.bind(null, id);

  return (
    <div className="space-y-6">
      <div>
        <Link href={`/elders/${id}`} className="text-sm text-muted-foreground hover:underline">
          ← {elder.nickname ?? elder.full_name}
        </Link>
        <h1 className="mt-1 text-2xl font-bold">ยาและตาราง</h1>
      </div>

      {medications.length === 0 && !canEdit ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            ยังไม่มียาในระบบ
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {medications.map((med) => (
            <Card key={med.id}>
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <CardTitle className="text-base">{med.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {med.dosage_text}
                    {med.instruction && ` · ${med.instruction}`}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    เวลา:{" "}
                    {(med.medication_schedules ?? [])
                      .map((s) => s.schedule_time.slice(0, 5))
                      .join(", ")}
                  </p>
                </div>
                {canEdit && (
                  <form action={deleteMedicationAction.bind(null, id, med.id)}>
                    <Button type="submit" variant="ghost" size="sm">
                      ลบ
                    </Button>
                  </form>
                )}
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      {canEdit && (
        <Card>
          <CardHeader>
            <CardTitle>เพิ่มยา</CardTitle>
          </CardHeader>
          <CardContent>
            <FormAction action={boundCreate} className="space-y-4">
              <FormField label="ชื่อยา" name="name" required />
              <FormField label="ขนาด/วิธีกิน" name="dosageText" placeholder="1 เม็ด หลังอาหาร" />
              <FormTextarea label="คำแนะนำ" name="instruction" />
              <FormField label="วันเริ่ม" name="startDate" type="date" required />
              <FormField label="วันสิ้นสุด (ไม่บังคับ)" name="endDate" type="date" />
              <FormField
                label="เวลา (คั่นด้วย comma)"
                name="scheduleTimes"
                required
                placeholder="08:00, 12:00, 18:00"
              />
              <Button type="submit">บันทึกยา</Button>
            </FormAction>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
