import Link from "next/link";
import { MarketingPage } from "@/components/marketing/marketing-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = { title: "Demo" };

export default function DemoPage() {
  return (
    <MarketingPage>
      <main className="mx-auto max-w-5xl space-y-8 px-6 py-16">
        <div>
          <h1 className="text-4xl font-bold text-primary">Demo video storyboard</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Phase 7 MVP includes a launch demo page that links to prototype flows until the recorded video is published.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            ["1. Setup", "Create workspace, elder profile, consent, emergency contacts"],
            ["2. Daily care", "LINE reminders, task confirmation, check-in, vitals and alerts"],
            ["3. Family report", "Generate, review, export and share a weekly report"],
          ].map(([title, body]) => (
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
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-xl font-semibold">Try the interactive prototype</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            ใช้ prototype เป็น script สำหรับ recording และ sales walkthrough โดยไม่ต้องใช้ข้อมูล production
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/prototype/onboarding" className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
              Onboarding prototype
            </Link>
            <Link href="/prototype/report" className="rounded-xl border border-border px-4 py-2 text-sm font-semibold">
              Report prototype
            </Link>
            <Link href="/prototype/line" className="rounded-xl border border-border px-4 py-2 text-sm font-semibold">
              LINE prototype
            </Link>
          </div>
        </div>
      </main>
    </MarketingPage>
  );
}
