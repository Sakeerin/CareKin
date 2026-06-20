import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FormAction, FormField, FormSelect, FormTextarea } from "@/components/app/form-action";
import { createPilotFeedbackAction } from "@/lib/actions/pilot";
import { requireWorkspace } from "@/lib/auth/session";

export const metadata = { title: "รายงานปัญหา" };

export default async function FeedbackPage() {
  await requireWorkspace();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link href="/dashboard" className="text-sm text-muted-foreground hover:underline">
          ← Dashboard
        </Link>
        <h1 className="mt-1 text-2xl font-bold">รายงานปัญหา / Feedback</h1>
        <p className="text-muted-foreground">ช่วยทีม CareKin แก้ bug และปรับ UX ในช่วง pilot</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>ส่ง feedback</CardTitle>
          <CardDescription>ถ้าเป็นปัญหาเร่งด่วน ให้เลือก severity high หรือ critical</CardDescription>
        </CardHeader>
        <CardContent>
          <FormAction action={createPilotFeedbackAction} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormSelect
                label="ประเภท"
                name="feedbackType"
                defaultValue="bug"
                options={[
                  { value: "bug", label: "Bug" },
                  { value: "ux", label: "UX" },
                  { value: "support", label: "Support" },
                  { value: "feature", label: "Feature request" },
                  { value: "other", label: "Other" },
                ]}
              />
              <FormSelect
                label="Severity"
                name="severity"
                defaultValue="medium"
                options={[
                  { value: "low", label: "Low" },
                  { value: "medium", label: "Medium" },
                  { value: "high", label: "High" },
                  { value: "critical", label: "Critical" },
                ]}
              />
            </div>
            <FormField label="หัวข้อ" name="title" required placeholder="เช่น กดบันทึก check-in แล้ว error" />
            <FormTextarea label="รายละเอียด" name="description" rows={6} placeholder="เกิดอะไรขึ้น, ทำซ้ำอย่างไร, คาดหวังอะไร" />
            <FormField label="URL หน้าเว็บ (ไม่บังคับ)" name="pageUrl" placeholder="/elders/..." />
            <Button type="submit">ส่ง feedback</Button>
          </FormAction>
        </CardContent>
      </Card>
    </div>
  );
}
