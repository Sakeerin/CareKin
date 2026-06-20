import { MarketingPage } from "@/components/marketing/marketing-shell";

export const metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return (
    <MarketingPage>
      <main className="mx-auto max-w-3xl space-y-6 px-6 py-16">
        <h1 className="text-4xl font-bold text-primary">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground">Version: privacy-v1 · Effective: 20 June 2026</p>
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">ข้อมูลที่เราเก็บ</h2>
          <p>
            CareKin เก็บข้อมูลบัญชี, workspace, รายละเอียดผู้สูงวัย, tasks, check-ins, vitals,
            alerts, reports, audit logs และ support tickets เท่าที่จำเป็นต่อการให้บริการ
          </p>
        </section>
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">การใช้ข้อมูล</h2>
          <p>
            ข้อมูลใช้เพื่อประสานงานการดูแล, สร้าง reminder/report, ให้ support,
            ตรวจสอบความปลอดภัย และปรับปรุงผลิตภัณฑ์ในระดับรวมโดยไม่เปิดเผยตัวตนเท่าที่ทำได้
          </p>
        </section>
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">สิทธิ์ของเจ้าของข้อมูล</h2>
          <p>
            ผู้ใช้สามารถติดต่อ support เพื่อขอ export, แก้ไข, ถอน consent หรือขอลบข้อมูล
            ทีมงานจะตรวจสอบสิทธิ์และดำเนินการตามนโยบาย PDPA ที่เกี่ยวข้อง
          </p>
        </section>
      </main>
    </MarketingPage>
  );
}
