import Link from "next/link";
import { MarketingPage } from "@/components/marketing/marketing-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = { title: "B2B Sales" };

const sections = [
  ["Problem", "ครอบครัวและ care provider ใช้หลายช่องทาง ทำให้ reminders, vitals และ reports กระจัดกระจาย"],
  ["CareKin workflow", "รวมงานดูแล, check-ins, alerts, family notifications และ human-reviewed reports"],
  ["Launch offer", "Provider plan พร้อม onboarding, pilot metrics และ support SLA สำหรับ cohort แรก"],
  ["Safety boundary", "CareKin ช่วย coordination ไม่ใช่ diagnosis, treatment หรือ emergency response system"],
];

export default function SalesPage() {
  return (
    <MarketingPage>
      <main className="mx-auto max-w-6xl px-6 py-16">
        <div className="max-w-3xl">
          <h1 className="text-4xl font-bold text-primary">B2B sales deck outline</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            สำหรับ care provider, clinic, elder-care community และ partner ที่ต้องการเริ่ม cohort รุ่นแรกกับ CareKin
          </p>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {sections.map(([title, body]) => (
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
        <div className="mt-8 rounded-xl border border-border bg-card p-6">
          <h2 className="text-xl font-semibold">Sales assets</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Phase 7 tracks the deck, one-pager, demo video, privacy/security one-pager and launch proposal in repo docs.
          </p>
          <Link href="/#waitlist" className="mt-4 inline-flex rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
            Request provider launch call
          </Link>
        </div>
      </main>
    </MarketingPage>
  );
}
