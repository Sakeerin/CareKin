import Link from "next/link";
import { PrototypeShell } from "@/components/prototype/prototype-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { copy } from "@/lib/copy";

const flows = [
  {
    href: "/prototype/onboarding",
    ...copy.hub.onboarding,
    icon: "🚀",
    criteria: "เป้าหมาย: onboarding ≤ 10 นาที",
  },
  {
    href: "/prototype/family",
    ...copy.hub.family,
    icon: "👨‍👩‍👧",
    criteria: "เป้าหมาย: เข้าใจ dashboard โดยไม่ต้องอธิบาย",
  },
  {
    href: "/prototype/elder",
    ...copy.hub.elder,
    icon: "👴",
    criteria: "เป้าหมาย: ปุ่มใหญ่ ใช้งานง่าย",
  },
  {
    href: "/prototype/caregiver",
    ...copy.hub.caregiver,
    icon: "🩺",
    criteria: "เป้าหมาย: บันทึก check-in ≤ 60 วินาที",
  },
  {
    href: "/prototype/report",
    ...copy.hub.report,
    icon: "📋",
    criteria: "ดูตัวอย่างรายงานและสรุป AI",
  },
  {
    href: "/prototype/line",
    ...copy.hub.line,
    icon: "💬",
    criteria: "ตัวอย่างข้อความ LINE reminder",
  },
];

export default function PrototypeHubPage() {
  return (
    <PrototypeShell currentPath="/prototype">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">{copy.hub.title}</h1>
          <p className="mt-2 text-muted-foreground">{copy.hub.subtitle}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {flows.map((flow) => (
            <Link key={flow.href} href={flow.href} className="group">
              <Card className="h-full transition-shadow group-hover:shadow-md">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{flow.icon}</span>
                    <CardTitle>{flow.title}</CardTitle>
                  </div>
                  <CardDescription>{flow.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">{flow.criteria}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </PrototypeShell>
  );
}
