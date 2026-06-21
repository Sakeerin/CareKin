import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FormAction, FormField, FormSelect, FormTextarea } from "@/components/app/form-action";
import {
  createWellnessEnrollmentAction,
  createWellnessProgramAction,
  getScaleDashboardData,
} from "@/lib/actions/scale";
import { getElders } from "@/lib/actions/elder";
import { canManageWorkspace, requireWorkspace } from "@/lib/auth/session";

export const metadata = { title: "Wellness programs" };

export default async function WellnessPage() {
  const { workspace, membership } = await requireWorkspace();
  const [data, elders] = await Promise.all([getScaleDashboardData(), getElders(workspace.id)]);
  const canManage = canManageWorkspace(membership.role);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Insurance wellness packages</h1>
        <p className="text-muted-foreground">
          Track wellness enrollments and partner programs without making clinical claims.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {canManage && (
          <Card>
            <CardHeader>
              <CardTitle>Create wellness program</CardTitle>
              <CardDescription>Workspace-scoped program for launch partners or insurer pilots.</CardDescription>
            </CardHeader>
            <CardContent>
              <FormAction action={createWellnessProgramAction} className="space-y-4">
                <FormField label="Program name" name="name" required />
                <FormField label="Partner name" name="partnerName" />
                <FormField label="Program type" name="programType" defaultValue="wellness" />
                <FormTextarea label="Description" name="description" rows={4} />
                <Button type="submit">สร้าง program</Button>
              </FormAction>
            </CardContent>
          </Card>
        )}

        {canManage ? (
          <Card>
            <CardHeader>
              <CardTitle>Enroll elder</CardTitle>
            </CardHeader>
            <CardContent>
              {data.wellnessPrograms.length === 0 ? (
                <p className="text-sm text-muted-foreground">สร้าง wellness program ก่อนจึงจะ enroll ผู้สูงวัยได้</p>
              ) : (
                <FormAction action={createWellnessEnrollmentAction} className="space-y-4">
                  <FormSelect
                    label="Program"
                    name="programId"
                    options={data.wellnessPrograms.map((program) => ({
                      value: program.id,
                      label: program.partner_name ? `${program.name} · ${program.partner_name}` : program.name,
                    }))}
                  />
                  <FormSelect
                    label="ผู้สูงวัย"
                    name="elderId"
                    options={[
                      { value: "", label: "ไม่ระบุ" },
                      ...elders.map((elder) => ({ value: elder.id, label: elder.nickname ?? elder.full_name })),
                    ]}
                  />
                  <FormSelect
                    label="Status"
                    name="status"
                    defaultValue="interested"
                    options={[
                      { value: "interested", label: "Interested" },
                      { value: "enrolled", label: "Enrolled" },
                      { value: "active", label: "Active" },
                      { value: "paused", label: "Paused" },
                      { value: "completed", label: "Completed" },
                      { value: "cancelled", label: "Cancelled" },
                    ]}
                  />
                  <FormTextarea label="Goals" name="goals" rows={4} />
                  <Button type="submit">บันทึก enrollment</Button>
                </FormAction>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              เฉพาะ owner / family admin เท่านั้นที่ enroll wellness program ได้
            </CardContent>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Enrollments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.wellnessEnrollments.length === 0 ? (
            <p className="text-sm text-muted-foreground">ยังไม่มี wellness enrollment</p>
          ) : (
            data.wellnessEnrollments.map((enrollment) => (
              <div key={enrollment.id} className="rounded-xl border border-border p-4">
                <p className="font-semibold">
                  {enrollment.wellness_programs?.name ?? "Wellness program"} · {enrollment.status}
                </p>
                {enrollment.goals && <p className="mt-2 text-sm text-muted-foreground">{enrollment.goals}</p>}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
