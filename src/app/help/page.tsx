import Link from "next/link";
import { MarketingPage } from "@/components/marketing/marketing-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = { title: "Help Center" };

const guides = [
  ["เริ่มต้นใช้งาน", "สร้าง workspace, เพิ่มผู้สูงวัย, ตั้งค่า emergency contact และเชิญสมาชิก"],
  ["ตั้งค่า reminders", "เพิ่มยา กิจวัตร และตรวจสอบงานที่ต้องยืนยันในแต่ละวัน"],
  ["Daily check-in และ vitals", "บันทึก mood, sleep, symptoms, falls และ vital signs ที่ครอบครัวควรเห็น"],
  ["Reports และ sharing", "สร้างรายงานรายสัปดาห์ ตรวจทาน AI draft และแชร์ด้วย expiring link"],
  ["Billing และ plan", "เลือกแผน launch, ขอ invoice หรือคุยกับทีมขายสำหรับ provider plan"],
  ["Privacy/Data request", "ขอ export, แก้ไข, ถอน consent หรือขอลบข้อมูลผ่าน support ticket"],
];

export default function HelpPage() {
  return (
    <MarketingPage>
      <main className="mx-auto max-w-6xl px-6 py-16">
        <div className="max-w-3xl">
          <h1 className="text-4xl font-bold text-primary">Help Center</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            คู่มือสั้นสำหรับลูกค้า launch batch แรก และช่องทางติดต่อทีม CareKin
          </p>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {guides.map(([title, body]) => (
            <Card key={title}>
              <CardHeader>
                <CardTitle>{title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="mt-8 rounded-xl border border-border bg-card p-5">
          <h2 className="font-semibold">ต้องการความช่วยเหลือ?</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            ลูกค้าที่มีบัญชีแล้วสามารถเปิด support ticket ในแอปได้ ทีม launch ตั้ง SLA ตอบกลับภายใน 1 วันทำการ
          </p>
          <Link href="/support" className="mt-4 inline-flex text-sm font-medium text-primary hover:underline">
            เปิด support workflow
          </Link>
        </div>
      </main>
    </MarketingPage>
  );
}
