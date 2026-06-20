import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FormAction, FormField, FormSelect, FormTextarea } from "@/components/app/form-action";
import { getElder } from "@/lib/actions/elder";
import { createDailyCheckInAction, getDailyCheckIns } from "@/lib/actions/health";
import { requireWorkspace } from "@/lib/auth/session";
import { MOOD_LABELS, SLEEP_LABELS } from "@/lib/types/health";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const elder = await getElder(id);
  return { title: `Check-in — ${elder?.nickname ?? elder?.full_name ?? ""}` };
}

export default async function CheckInPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireWorkspace();
  const elder = await getElder(id);
  if (!elder) notFound();

  const checkIns = await getDailyCheckIns(id);
  const boundCreate = createDailyCheckInAction.bind(null, id);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link href={`/elders/${id}`} className="text-sm text-muted-foreground hover:underline">
            ← {elder.nickname ?? elder.full_name}
          </Link>
          <h1 className="mt-1 text-2xl font-bold">Daily check-in</h1>
          <p className="text-muted-foreground">บันทึกอาการประจำวันและค่าสุขภาพแบบเร็ว</p>
        </div>
        <Link href={`/elders/${id}/check-in/elder`}>
          <Button variant="outline">โหมดผู้สูงวัย</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>แบบฟอร์มผู้ดูแล</CardTitle>
          <CardDescription>กรอกได้ภายใน 1 นาที ถ้ามีค่าชีพจร/ความดันให้ใส่พร้อมกันได้</CardDescription>
        </CardHeader>
        <CardContent>
          <FormAction action={boundCreate} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormSelect
                label="อารมณ์"
                name="mood"
                defaultValue="good"
                options={[
                  { value: "good", label: MOOD_LABELS.good },
                  { value: "okay", label: MOOD_LABELS.okay },
                  { value: "bad", label: MOOD_LABELS.bad },
                ]}
              />
              <FormSelect
                label="การนอน"
                name="sleep"
                defaultValue="good"
                options={[
                  { value: "good", label: SLEEP_LABELS.good },
                  { value: "okay", label: SLEEP_LABELS.okay },
                  { value: "bad", label: SLEEP_LABELS.bad },
                ]}
              />
              <FormSelect
                label="มีอาการผิดปกติ"
                name="hasSymptoms"
                defaultValue="false"
                options={[
                  { value: "false", label: "ไม่มี" },
                  { value: "true", label: "มี" },
                ]}
              />
              <FormSelect
                label="หกล้ม"
                name="hadFall"
                defaultValue="false"
                options={[
                  { value: "false", label: "ไม่หกล้ม" },
                  { value: "true", label: "หกล้ม" },
                ]}
              />
              <FormSelect
                label="การกินอาหาร"
                name="appetiteNormal"
                defaultValue="true"
                options={[
                  { value: "true", label: "กินได้ปกติ" },
                  { value: "false", label: "กินได้น้อย" },
                ]}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-4">
              <FormField label="SYS" name="systolic" type="number" placeholder="120" />
              <FormField label="DIA" name="diastolic" type="number" placeholder="80" />
              <FormField label="ชีพจร" name="pulse" type="number" placeholder="72" />
              <FormField label="น้ำตาล" name="bloodSugar" type="number" placeholder="110" />
            </div>

            <FormTextarea label="หมายเหตุ" name="note" placeholder="อาการเพิ่มเติม หรือสิ่งที่ครอบครัวควรรู้" />
            <Button type="submit">บันทึก Check-in</Button>
          </FormAction>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>ประวัติ check-in ล่าสุด</CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-border p-0">
          {checkIns.length === 0 ? (
            <p className="p-5 text-sm text-muted-foreground">ยังไม่มี check-in</p>
          ) : (
            checkIns.map((item) => (
              <div key={item.id} className="px-5 py-3">
                <p className="font-medium">
                  {new Date(item.check_in_date).toLocaleDateString("th-TH")} · {MOOD_LABELS[item.mood]}
                </p>
                <p className="text-sm text-muted-foreground">
                  นอน: {SLEEP_LABELS[item.sleep]} · อาการ: {item.has_symptoms ? "มี" : "ไม่มี"} · หกล้ม:{" "}
                  {item.had_fall ? "ใช่" : "ไม่"}
                </p>
                {item.note && <p className="mt-1 text-sm">{item.note}</p>}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
