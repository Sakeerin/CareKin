import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FormAction, FormField, FormSelect, FormTextarea } from "@/components/app/form-action";
import {
  createSupportTicketAction,
  getSupportTickets,
  updateSupportTicketStatusAction,
} from "@/lib/actions/commercial";
import { canManageWorkspace, requireWorkspace } from "@/lib/auth/session";

export const metadata = { title: "Support" };

const statusLabels: Record<string, string> = {
  open: "Open",
  in_progress: "In progress",
  waiting_customer: "Waiting customer",
  resolved: "Resolved",
  closed: "Closed",
};

export default async function SupportPage() {
  const { membership } = await requireWorkspace();
  const tickets = await getSupportTickets();
  const canUpdate = canManageWorkspace(membership.role);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <Link href="/dashboard" className="text-sm text-muted-foreground hover:underline">
          ← Dashboard
        </Link>
        <h1 className="mt-1 text-2xl font-bold">Support</h1>
        <p className="text-muted-foreground">เปิด ticket สำหรับ bug, billing, privacy/data request หรือคำถามช่วง launch</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>สร้าง support ticket</CardTitle>
          <CardDescription>SLA launch: ตอบกลับภายใน 1 วันทำการ, urgent ภายในวันเดียวกัน</CardDescription>
        </CardHeader>
        <CardContent>
          <FormAction action={createSupportTicketAction} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormSelect
                label="ประเภท"
                name="ticketType"
                defaultValue="support"
                options={[
                  { value: "support", label: "Support" },
                  { value: "bug", label: "Bug" },
                  { value: "billing", label: "Billing" },
                  { value: "privacy", label: "Privacy / data request" },
                  { value: "feature", label: "Feature request" },
                  { value: "other", label: "Other" },
                ]}
              />
              <FormSelect
                label="Priority"
                name="priority"
                defaultValue="medium"
                options={[
                  { value: "low", label: "Low" },
                  { value: "medium", label: "Medium" },
                  { value: "high", label: "High" },
                  { value: "urgent", label: "Urgent" },
                ]}
              />
            </div>
            <FormField label="หัวข้อ" name="subject" required />
            <FormTextarea label="รายละเอียด" name="description" rows={6} required />
            <FormField label="URL หน้าเว็บ (ถ้ามี)" name="pageUrl" />
            <Button type="submit">ส่ง ticket</Button>
          </FormAction>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tickets ล่าสุด</CardTitle>
          <CardDescription>ติดตามสถานะ support ของ workspace นี้</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {tickets.length === 0 ? (
            <p className="text-sm text-muted-foreground">ยังไม่มี support ticket</p>
          ) : (
            tickets.map((ticket) => (
              <div key={ticket.id} className="rounded-xl border border-border p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{ticket.subject}</p>
                    <p className="text-xs text-muted-foreground">
                      {ticket.ticket_type} · {ticket.priority} · {statusLabels[ticket.status]} ·{" "}
                      {new Date(ticket.created_at).toLocaleString("th-TH")}
                    </p>
                  </div>
                  <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium">
                    {statusLabels[ticket.status]}
                  </span>
                </div>
                <p className="mt-3 whitespace-pre-wrap text-sm text-muted-foreground">{ticket.description}</p>
                {ticket.resolution_notes && (
                  <p className="mt-3 rounded-lg bg-success/10 p-3 text-sm text-success">
                    {ticket.resolution_notes}
                  </p>
                )}
                {canUpdate && (
                  <FormAction
                    action={updateSupportTicketStatusAction.bind(null, ticket.id)}
                    className="mt-4 grid gap-3 sm:grid-cols-[180px_1fr_auto]"
                  >
                    <FormSelect
                      label="Status"
                      name="status"
                      defaultValue={ticket.status}
                      options={[
                        { value: "open", label: "Open" },
                        { value: "in_progress", label: "In progress" },
                        { value: "waiting_customer", label: "Waiting customer" },
                        { value: "resolved", label: "Resolved" },
                        { value: "closed", label: "Closed" },
                      ]}
                    />
                    <FormField
                      label="Resolution notes"
                      name="resolutionNotes"
                      defaultValue={ticket.resolution_notes ?? ""}
                    />
                    <Button type="submit" className="self-end">
                      อัปเดต
                    </Button>
                  </FormAction>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
