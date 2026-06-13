import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FormAction, FormField } from "@/components/app/form-action";
import { Button } from "@/components/ui/button";
import { SafetyDisclaimer } from "@/components/prototype/prototype-banner";
import { createWorkspaceAction } from "@/lib/actions/workspace";
import { requireUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { getUserWorkspaces } from "@/lib/auth/session";

export const metadata = { title: "สร้าง workspace" };

export default async function NewWorkspacePage() {
  await requireUser();
  const workspaces = await getUserWorkspaces();
  if (workspaces.length > 0) redirect("/dashboard");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">ยินดีต้อนรับสู่ CareKin</h1>
          <p className="mt-2 text-muted-foreground">สร้าง workspace ครอบครัวของคุณ</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>ตั้งชื่อครอบครัว</CardTitle>
            <CardDescription>เช่น ครอบครัวใจดี</CardDescription>
          </CardHeader>
          <CardContent>
            <FormAction action={createWorkspaceAction} className="space-y-4">
              <FormField
                label="ชื่อ workspace"
                name="name"
                required
                placeholder="ครอบครัวใจดี"
              />
              <SafetyDisclaimer />
              <Button type="submit" className="w-full">
                สร้าง workspace
              </Button>
            </FormAction>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
