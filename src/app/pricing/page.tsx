import Link from "next/link";
import { MarketingPage } from "@/components/marketing/marketing-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BILLING_PLANS } from "@/lib/plans";

export const metadata = { title: "Pricing" };

export default function PricingPage() {
  return (
    <MarketingPage>
      <main className="mx-auto max-w-6xl px-6 py-16">
        <div className="max-w-3xl">
          <h1 className="text-4xl font-bold text-primary">Pricing สำหรับ controlled launch</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            เริ่มจากแผนที่เรียบง่ายสำหรับครอบครัว และมีแผน provider สำหรับองค์กรที่ต้องการ onboarding และ support เพิ่มเติม
          </p>
        </div>
        <div className="mt-10 grid gap-5 lg:grid-cols-4">
          {BILLING_PLANS.map((plan) => (
            <Card key={plan.id} className={plan.id === "family_plus" ? "border-primary" : undefined}>
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <p className="text-3xl font-bold text-primary">{plan.priceText}</p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {plan.features.map((feature) => (
                    <li key={feature}>• {feature}</li>
                  ))}
                </ul>
                <div className="rounded-lg bg-muted p-3 text-sm">
                  ผู้สูงวัย {plan.limits.elders} คน · สมาชิก {plan.limits.familyMembers} คน · รายงาน {plan.limits.monthlyReports}/เดือน
                </div>
                <Link
                  href={plan.id === "premium" ? "/sales" : "/signup"}
                  className="touch-standard inline-flex w-full items-center justify-center rounded-xl bg-primary px-4 py-2 font-semibold text-primary-foreground hover:opacity-90"
                >
                  {plan.id === "premium" ? "ติดต่อทีมขาย" : "เลือกแผนนี้"}
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
        <p className="mt-8 text-sm text-muted-foreground">
          ราคาเป็น launch hypothesis และอาจเปลี่ยนตาม feedback จากลูกค้ารุ่นแรก รายงานและ AI summary ไม่ใช่การวินิจฉัยหรือคำแนะนำทางการแพทย์
        </p>
      </main>
    </MarketingPage>
  );
}
