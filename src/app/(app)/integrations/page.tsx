import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FormAction, FormField, FormSelect, FormTextarea } from "@/components/app/form-action";
import {
  getScaleDashboardData,
  requestDeviceIntegrationAction,
  requestTelecareSessionAction,
} from "@/lib/actions/scale";
import { getElders } from "@/lib/actions/elder";
import { requireWorkspace } from "@/lib/auth/session";

export const metadata = { title: "Telecare & devices" };

export default async function IntegrationsPage() {
  const { workspace } = await requireWorkspace();
  const [data, elders] = await Promise.all([getScaleDashboardData(), getElders(workspace.id)]);
  const elderOptions = [
    { value: "", label: "ไม่ระบุ" },
    ...elders.map((elder) => ({ value: elder.id, label: elder.nickname ?? elder.full_name })),
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Telecare & device readiness</h1>
        <p className="text-muted-foreground">
          These workflows collect requests only. Provider tokens, device ingestion and fall alerts require approved gates.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Request telecare session</CardTitle>
            <CardDescription>Requires `telecare_sessions` gate approval and explicit consent confirmation.</CardDescription>
          </CardHeader>
          <CardContent>
            <FormAction action={requestTelecareSessionAction} className="space-y-4">
              <FormSelect label="ผู้สูงวัย" name="elderId" options={elderOptions} />
              <FormField label="Clinician name" name="clinicianName" />
              <FormField label="Scheduled at" name="scheduledAt" type="datetime-local" />
              <FormField label="Provider" name="provider" placeholder="Daily, LiveKit, Twilio..." />
              <FormTextarea label="Agenda" name="agenda" rows={4} />
              <label className="flex items-start gap-3 text-sm text-muted-foreground">
                <input type="checkbox" name="consentConfirmed" className="mt-1 h-4 w-4" />
                <span>ยืนยันว่ามี consent สำหรับ telecare session และการแชร์ข้อมูลที่เกี่ยวข้อง</span>
              </label>
              <Button type="submit">ขอ telecare session</Button>
            </FormAction>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Request device integration</CardTitle>
            <CardDescription>Medical/fall device connections are consent-gated and do not create diagnosis.</CardDescription>
          </CardHeader>
          <CardContent>
            <FormAction action={requestDeviceIntegrationAction} className="space-y-4">
              <FormSelect label="ผู้สูงวัย" name="elderId" options={elderOptions} />
              <FormField label="Vendor" name="vendor" required placeholder="เช่น Omron, Apple, Garmin" />
              <FormField label="Device type" name="deviceType" required placeholder="blood_pressure, wearable, fall_sensor" />
              <FormField label="External reference" name="externalReference" />
              <FormTextarea label="Notes" name="notes" rows={4} />
              <label className="flex items-start gap-3 text-sm text-muted-foreground">
                <input type="checkbox" name="consentConfirmed" className="mt-1 h-4 w-4" />
                <span>ยืนยัน consent สำหรับ device data sharing</span>
              </label>
              <Button type="submit">ขอเชื่อม device</Button>
            </FormAction>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ListCard
          title="Telecare sessions"
          empty="ยังไม่มี telecare session"
          items={data.telecareSessions.map((item) => ({
            id: item.id,
            title: item.status,
            body: `${item.clinician_name ?? "ไม่ระบุ clinician"} · ${item.scheduled_at ? new Date(item.scheduled_at).toLocaleString("th-TH") : "ยังไม่กำหนดเวลา"}`,
          }))}
        />
        <ListCard
          title="Device integrations"
          empty="ยังไม่มี device integration"
          items={data.deviceIntegrations.map((item) => ({
            id: item.id,
            title: `${item.vendor} · ${item.device_type}`,
            body: `${item.status} · consent ${item.consent_confirmed ? "confirmed" : "missing"}`,
          }))}
        />
      </div>
    </div>
  );
}

function ListCard({
  title,
  empty,
  items,
}: {
  title: string;
  empty: string;
  items: { id: string; title: string; body: string }[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">{empty}</p>
        ) : (
          items.map((item) => (
            <div key={item.id} className="rounded-xl border border-border p-4">
              <p className="font-semibold">{item.title}</p>
              <p className="text-sm text-muted-foreground">{item.body}</p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
