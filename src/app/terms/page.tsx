import { MarketingPage } from "@/components/marketing/marketing-shell";

export const metadata = { title: "Terms" };

export default function TermsPage() {
  return (
    <MarketingPage>
      <main className="mx-auto max-w-3xl space-y-6 px-6 py-16">
        <h1 className="text-4xl font-bold text-primary">Terms of Service</h1>
        <p className="text-sm text-muted-foreground">Version: terms-v1 · Effective: 20 June 2026</p>
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">ขอบเขตบริการ</h2>
          <p>
            CareKin เป็นเครื่องมือช่วยครอบครัวประสานงานการดูแลผู้สูงวัย เช่น reminder, check-in, vitals,
            alert และ report ไม่ใช่อุปกรณ์ทางการแพทย์ และไม่ใช้แทนแพทย์หรือผู้เชี่ยวชาญสุขภาพ
          </p>
        </section>
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">หน้าที่ของผู้ใช้</h2>
          <p>
            ผู้ใช้ต้องได้รับความยินยอมจากผู้สูงวัยหรือผู้มีอำนาจตามกฎหมายก่อนบันทึกข้อมูลสุขภาพ
            และต้องตรวจสอบข้อมูลสำคัญก่อนนำไปใช้ตัดสินใจด้านการดูแล
          </p>
        </section>
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Billing และ controlled launch</h2>
          <p>
            ในช่วง launch แผนแบบชำระเงินอาจเปิดใช้งานแบบ manual invoice หรือ provider ภายนอก
            ทีม CareKin จะแจ้งราคา เงื่อนไข และรอบชำระเงินก่อนเริ่มเก็บเงิน
          </p>
        </section>
      </main>
    </MarketingPage>
  );
}
