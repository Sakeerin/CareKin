import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireWorkspace } from "@/lib/auth/session";

export const metadata = { title: "Onboarding Guide" };

const steps = [
  ["1. Workspace", "ตั้งชื่อครอบครัว/องค์กร และตรวจสอบบทบาท owner", "/settings"],
  ["2. Elder profile", "เพิ่มข้อมูลผู้สูงวัย พร้อม consent และ emergency contacts", "/elders/new"],
  ["3. Care tasks", "เพิ่มยาและกิจวัตรที่ต้องยืนยันในแต่ละวัน", "/elders"],
  ["4. Reminders", "ตั้งค่า LINE/Web reminder และ cron ให้ทำงานทุก 5 นาที", "/notifications"],
  ["5. Check-in & vitals", "เริ่มบันทึก mood, sleep, symptoms และ vital signs สำคัญ", "/elders"],
  ["6. Alerts", "ตรวจ threshold และ workflow การ acknowledge alerts", "/dashboard"],
  ["7. Reports", "สร้างรายงาน ทดลอง review AI draft และทดสอบ expiring share link", "/elders"],
  ["8. Family members", "เชิญสมาชิกครอบครัวและกำหนดบทบาทที่เหมาะสม", "/members"],
  ["9. Billing", "เลือก launch plan และบันทึก billing intent", "/settings"],
  ["10. Support", "เปิด support ticket ถ้าพบ bug, billing หรือ privacy/data request", "/support"],
];

export default async function OnboardingPage() {
  await requireWorkspace();

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <Link href="/dashboard" className="text-sm text-muted-foreground hover:underline">
          ← Dashboard
        </Link>
        <h1 className="mt-1 text-2xl font-bold">Launch onboarding guide</h1>
        <p className="text-muted-foreground">
          Checklist สำหรับ workspace ที่เข้าร่วม controlled launch เพื่อให้ setup, support และ billing พร้อมก่อนใช้งานจริง
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {steps.map(([title, body, href]) => (
          <Card key={title}>
            <CardHeader>
              <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{body}</p>
              <Link href={href} className="mt-3 inline-flex text-sm font-medium text-primary hover:underline">
                ไปที่ขั้นตอนนี้
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
