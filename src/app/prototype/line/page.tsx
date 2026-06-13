import { PrototypeShell } from "@/components/prototype/prototype-shell";
import { copy } from "@/lib/copy";
import { elderProfile } from "@/lib/mock-data";

export default function LinePreviewPage() {
  return (
    <PrototypeShell currentPath="/prototype/line">
      <div className="mx-auto max-w-md space-y-6">
        <div>
          <h1 className="text-2xl font-bold">{copy.line.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{copy.line.note}</p>
        </div>

        <LineChat>
          <LineBubble incoming>
            <p className="font-medium text-sm">CareKin</p>
            <p className="mt-1">
              สวัสดีค่ะ {elderProfile.nickname} 🌿
            </p>
            <p className="mt-2">{copy.line.medReminder}</p>
            <p className="mt-1 text-sm opacity-80">
              ยาความดัน (AMLODIPINE) — 1 เม็ด หลังอาหาร
            </p>
            <p className="mt-1 text-xs opacity-60">08:00 น.</p>
          </LineBubble>

          <LineFlexButtons
            buttons={[
              { label: "✅ ทำแล้ว", primary: true },
              { label: "⏳ ยังไม่ได้", primary: false },
            ]}
          />
        </LineChat>

        <LineChat>
          <LineBubble incoming>
            <p className="font-medium text-sm">CareKin</p>
            <p className="mt-2">{copy.line.escalation}</p>
            <p className="mt-1 text-sm opacity-80">
              {elderProfile.nickname} — ยาเย็น (18:00) ยังไม่ได้ยืนยัน
            </p>
            <p className="mt-1 text-xs opacity-60">18:45 น.</p>
          </LineBubble>
        </LineChat>

        <LineChat label="ข้อความถึง Family Admin">
          <LineBubble incoming variant="admin">
            <p className="font-medium text-sm">CareKin Alert</p>
            <p className="mt-2">
              ⚠️ {elderProfile.nickname} ยังไม่ได้ยืนยันกินยาเย็น
            </p>
            <p className="mt-2 text-sm opacity-80">
              กรุณาติดต่อหรือแจ้งเตือนซ้ำผ่านแอป
            </p>
          </LineBubble>
        </LineChat>
      </div>
    </PrototypeShell>
  );
}

function LineChat({
  children,
  label,
}: {
  children: React.ReactNode;
  label?: string;
}) {
  return (
    <div className="space-y-2">
      {label && (
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
      )}
      <div className="rounded-2xl bg-line-bg p-4 space-y-3">{children}</div>
    </div>
  );
}

function LineBubble({
  children,
  incoming = false,
  variant = "default",
}: {
  children: React.ReactNode;
  incoming?: boolean;
  variant?: "default" | "admin";
}) {
  return (
    <div className={`flex ${incoming ? "justify-start" : "justify-end"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 ${
          incoming
            ? variant === "admin"
              ? "bg-warning/20 text-foreground rounded-tl-sm"
              : "bg-white text-foreground rounded-tl-sm shadow-sm"
            : "bg-line-green text-white rounded-tr-sm"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

function LineFlexButtons({
  buttons,
}: {
  buttons: Array<{ label: string; primary: boolean }>;
}) {
  return (
    <div className="flex gap-2 pl-2">
      {buttons.map((btn) => (
        <button
          key={btn.label}
          type="button"
          className={`flex-1 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
            btn.primary
              ? "bg-line-green text-white"
              : "bg-white text-foreground shadow-sm"
          }`}
        >
          {btn.label}
        </button>
      ))}
    </div>
  );
}
