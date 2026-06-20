import { MarketingPage } from "@/components/marketing/marketing-shell";

export const metadata = { title: "Consent" };

export default function ConsentPage() {
  return (
    <MarketingPage>
      <main className="mx-auto max-w-3xl space-y-6 px-6 py-16">
        <h1 className="text-4xl font-bold text-primary">Health Data Consent</h1>
        <p className="text-sm text-muted-foreground">Version: consent-v1 · ใช้กับการสร้าง elder profile และ report share</p>
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">ข้อมูลสุขภาพต้องได้รับความยินยอม</h2>
          <p>
            ก่อนบันทึกข้อมูลผู้สูงวัย ผู้ใช้ต้องยืนยันว่ามีสิทธิ์และได้รับความยินยอมที่เหมาะสม
            ระบบจะบันทึก consent record พร้อมเวอร์ชันข้อความเพื่อ audit ได้ภายหลัง
          </p>
        </section>
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">การแชร์รายงาน</h2>
          <p>
            รายงานที่แชร์ภายนอกใช้ token แบบหมดอายุ และควรแชร์เฉพาะกับผู้ที่เกี่ยวข้องกับการดูแลเท่านั้น
            AI summary ต้องผ่าน human review ก่อนใช้ในบริบทสำคัญ
          </p>
        </section>
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">การถอน consent</h2>
          <p>
            หากต้องการถอน consent หรือขอลบข้อมูล ให้เปิด support ticket ประเภท Privacy/Data request
            จากในแอปหรือส่งคำขอผ่านช่องทาง support
          </p>
        </section>
      </main>
    </MarketingPage>
  );
}
