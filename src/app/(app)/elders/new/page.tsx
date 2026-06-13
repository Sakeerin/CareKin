import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ElderForm } from "@/components/app/elder-form";
import { createElderAction } from "@/lib/actions/elder";
import { requireWorkspace, canManageElders } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export const metadata = { title: "เพิ่มผู้สูงวัย" };

export default async function NewElderPage() {
  const { membership } = await requireWorkspace();
  if (!canManageElders(membership.role)) redirect("/elders");

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-2xl font-bold">เพิ่มผู้สูงวัย</h1>
      <Card>
        <CardHeader>
          <CardTitle>ข้อมูลพื้นฐาน</CardTitle>
        </CardHeader>
        <CardContent>
          <ElderForm
            action={createElderAction}
            showConsent
            submitLabel="สร้าง profile"
          />
        </CardContent>
      </Card>
    </div>
  );
}
