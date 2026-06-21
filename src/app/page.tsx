import Link from "next/link";
import { FormAction, FormField, FormSelect, FormTextarea } from "@/components/app/form-action";
import { MarketingPage } from "@/components/marketing/marketing-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { joinWaitlistAction } from "@/lib/actions/commercial";

export default async function HomePage({
  searchParams,
}: {
  searchParams?: Promise<{ ref?: string }>;
}) {
  const params = searchParams ? await searchParams : {};
  const referralCode = typeof params.ref === "string" ? params.ref.slice(0, 40) : "";

  return (
    <MarketingPage>
      <main>
        <section className="mx-auto grid max-w-6xl gap-10 px-6 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-6">
            <p className="inline-flex rounded-full bg-accent px-4 py-2 text-sm font-medium text-accent-foreground">
              Controlled launch สำหรับครอบครัวและ care provider รุ่นแรก
            </p>
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl">
                ดูแลผู้สูงวัยด้วยข้อมูลเดียวกันทั้งครอบครัว
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
                CareKin รวม reminder, check-in, vitals, alerts และ weekly reports
                ไว้ใน workflow เดียว เพื่อให้ครอบครัวเห็นภาพการดูแลโดยไม่แทนที่คำแนะนำแพทย์
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/signup"
                className="touch-standard inline-flex items-center justify-center rounded-xl bg-primary px-8 py-3 text-base font-semibold text-primary-foreground transition-colors hover:opacity-90"
              >
                เริ่มใช้งาน
              </Link>
              <Link
                href="#waitlist"
                className="touch-standard inline-flex items-center justify-center rounded-xl border-2 border-border px-8 py-3 text-base font-semibold transition-colors hover:bg-muted"
              >
                ขอ invite
              </Link>
              <Link
                href="/prototype"
                className="touch-standard inline-flex items-center justify-center rounded-xl px-8 py-3 text-base font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                ดู prototype
              </Link>
            </div>
          </div>

          <Card className="bg-card/90">
            <CardHeader>
              <CardTitle>Launch-ready care workflow</CardTitle>
              <CardDescription>จาก pilot สู่การเปิดขายแบบจำกัดจำนวน</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                ["LINE reminders", "แจ้งเตือนยาและกิจวัตร พร้อม escalations เมื่อพลาด"],
                ["Daily check-in", "บันทึก mood, sleep, symptoms, falls และ vitals"],
                ["AI report draft", "สรุปรายสัปดาห์แบบต้องมี human review ก่อนแชร์"],
                ["Support SLA", "ช่องทาง support และ priority สำหรับช่วง launch"],
              ].map(([title, body]) => (
                <div key={title} className="rounded-xl border border-border p-4">
                  <h2 className="font-semibold">{title}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{body}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <section className="bg-card">
          <div className="mx-auto grid max-w-6xl gap-4 px-6 py-12 sm:grid-cols-3">
            {[
              ["50-100", "เป้าหมาย paying family accounts รุ่นแรก"],
              ["3-5", "เป้าหมาย B2B care partners รุ่นแรก"],
              ["<24h", "SLA ตอบกลับ support ในช่วง launch"],
            ].map(([metric, label]) => (
              <div key={metric} className="rounded-xl border border-border p-5">
                <p className="text-3xl font-bold text-primary">{metric}</p>
                <p className="mt-2 text-sm text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="waitlist" className="mx-auto grid max-w-6xl gap-8 px-6 py-16 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl font-bold">เข้าร่วม launch batch แรก</h2>
            <p className="mt-3 text-muted-foreground">
              ทีม CareKin จะทยอยเปิด invite เพื่อให้ onboarding, billing และ support
              พร้อมก่อนขยายจำนวนลูกค้า
            </p>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>ขอ invite / ติดต่อทีมขาย</CardTitle>
              <CardDescription>เหมาะสำหรับครอบครัว, care provider, clinic หรือ B2B partner</CardDescription>
            </CardHeader>
            <CardContent>
              <FormAction action={joinWaitlistAction} className="space-y-4">
                <FormField label="ชื่อ" name="name" required />
                <FormField label="อีเมล" name="email" type="email" required />
                <FormSelect
                  label="ประเภทผู้สนใจ"
                  name="audience"
                  defaultValue="family"
                  options={[
                    { value: "family", label: "ครอบครัว" },
                    { value: "care_provider", label: "Care provider" },
                    { value: "clinic", label: "Clinic / hospital partner" },
                    { value: "other", label: "อื่น ๆ" },
                  ]}
                />
                <FormField label="องค์กร (ถ้ามี)" name="organization" />
                <FormField label="เบอร์โทร (ถ้ามี)" name="phone" />
                <FormField label="Referral code (ถ้ามี)" name="referralCode" defaultValue={referralCode} />
                <FormTextarea label="บริบทการดูแล" name="careContext" rows={4} />
                <Button type="submit">ส่งคำขอ invite</Button>
              </FormAction>
            </CardContent>
          </Card>
        </section>
      </main>
    </MarketingPage>
  );
}
