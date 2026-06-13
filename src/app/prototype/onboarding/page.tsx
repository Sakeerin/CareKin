"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PrototypeShell } from "@/components/prototype/prototype-shell";
import { SafetyDisclaimer } from "@/components/prototype/prototype-banner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressSteps } from "@/components/ui/progress";
import { copy } from "@/lib/copy";
import {
  defaultOnboardingValues,
  type OnboardingFormData,
} from "@/lib/schemas/check-in";
import { setOnboardingComplete } from "@/lib/prototype-store";

const TOTAL_STEPS = 10;

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<OnboardingFormData>(defaultOnboardingValues);

  function updateField<K extends keyof OnboardingFormData>(
    key: K,
    value: OnboardingFormData[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function next() {
    if (step < TOTAL_STEPS) setStep(step + 1);
  }

  function back() {
    if (step > 1) setStep(step - 1);
  }

  function finish() {
    setOnboardingComplete(true);
    router.push("/prototype/family");
  }

  const stepInfo = copy.onboarding.steps[step - 1];

  return (
    <PrototypeShell currentPath="/prototype/onboarding">
      <div className="mx-auto max-w-lg space-y-6">
        <ProgressSteps current={step} total={TOTAL_STEPS} />

        <Card>
          <CardHeader>
            <CardTitle>{stepInfo.title}</CardTitle>
            <CardDescription>{stepInfo.subtitle}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {step === 1 && (
              <>
                <p className="text-muted-foreground">{copy.onboarding.welcome}</p>
                <SafetyDisclaimer />
              </>
            )}

            {step === 2 && (
              <Field label="ชื่อครอบครัว / workspace">
                <input
                  className="input-field"
                  value={form.workspaceName}
                  onChange={(e) => updateField("workspaceName", e.target.value)}
                  placeholder="เช่น ครอบครัวใจดี"
                />
              </Field>
            )}

            {step === 3 && (
              <>
                <Field label="ชื่อผู้สูงวัย">
                  <input
                    className="input-field"
                    value={form.elderName}
                    onChange={(e) => updateField("elderName", e.target.value)}
                  />
                </Field>
                <Field label="อายุ">
                  <input
                    className="input-field"
                    type="number"
                    value={form.elderAge}
                    onChange={(e) => updateField("elderAge", Number(e.target.value))}
                  />
                </Field>
                <Field label="โรคประจำตัว">
                  <input
                    className="input-field"
                    value={form.conditions}
                    onChange={(e) => updateField("conditions", e.target.value)}
                    placeholder="เช่น ความดัน, เบาหวาน"
                  />
                </Field>
              </>
            )}

            {step === 4 && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  ผู้สูงวัยจะใช้งานเองผ่าน LINE หรือให้ caregiver ช่วยบันทึก?
                </p>
                <ChannelOption
                  selected={form.channel === "line"}
                  onClick={() => updateField("channel", "line")}
                  title="ใช้ LINE เอง"
                  description="ส่ง reminder และยืนยันผ่าน LINE"
                />
                <ChannelOption
                  selected={form.channel === "caregiver"}
                  onClick={() => updateField("channel", "caregiver")}
                  title="Caregiver ช่วยบันทึก"
                  description="ผู้ดูแลบันทึกแทนผ่านแอป"
                />
              </div>
            )}

            {step === 5 && (
              <>
                <Field label="ชื่อยา">
                  <input
                    className="input-field"
                    value={form.medicationName}
                    onChange={(e) => updateField("medicationName", e.target.value)}
                  />
                </Field>
                <Field label="เวลา">
                  <input
                    className="input-field"
                    type="time"
                    value={form.medicationTime}
                    onChange={(e) => updateField("medicationTime", e.target.value)}
                  />
                </Field>
                <Field label="ขนาด / วิธีกิน">
                  <input
                    className="input-field"
                    value={form.medicationDosage}
                    onChange={(e) => updateField("medicationDosage", e.target.value)}
                  />
                </Field>
              </>
            )}

            {step === 6 && (
              <>
                <Field label="ชื่อ routine">
                  <input
                    className="input-field"
                    value={form.routineName}
                    onChange={(e) => updateField("routineName", e.target.value)}
                  />
                </Field>
                <Field label="เวลา">
                  <input
                    className="input-field"
                    type="time"
                    value={form.routineTime}
                    onChange={(e) => updateField("routineTime", e.target.value)}
                  />
                </Field>
              </>
            )}

            {step === 7 && (
              <>
                <Field label="อีเมลสมาชิกครอบครัว (ไม่บังคับ)">
                  <input
                    className="input-field"
                    type="email"
                    value={form.inviteEmail}
                    onChange={(e) => updateField("inviteEmail", e.target.value)}
                    placeholder="email@example.com"
                  />
                </Field>
                <p className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
                  ลิงก์เชิญจำลอง: carekin.app/invite/abc123
                </p>
              </>
            )}

            {step === 8 && (
              <>
                <Field label="ชื่อผู้ติดต่อฉุกเฉิน">
                  <input
                    className="input-field"
                    value={form.emergencyName}
                    onChange={(e) => updateField("emergencyName", e.target.value)}
                  />
                </Field>
                <Field label="เบอร์โทร">
                  <input
                    className="input-field"
                    type="tel"
                    value={form.emergencyPhone}
                    onChange={(e) => updateField("emergencyPhone", e.target.value)}
                  />
                </Field>
              </>
            )}

            {step === 9 && (
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-border p-4">
                <input
                  type="checkbox"
                  checked={form.checkInEnabled}
                  onChange={(e) => updateField("checkInEnabled", e.target.checked)}
                  className="h-5 w-5"
                />
                <div>
                  <p className="font-medium">เปิด daily check-in</p>
                  <p className="text-sm text-muted-foreground">
                    บันทึกอารมณ์และอาการทุกวัน
                  </p>
                </div>
              </label>
            )}

            {step === 10 && (
              <div className="space-y-3 text-center">
                <p className="text-4xl">✅</p>
                <p className="font-medium">พร้อมใช้งานแล้ว!</p>
                <p className="text-sm text-muted-foreground">
                  ครอบครัว {form.workspaceName || "ใจดี"} — {form.elderName}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
          <div className="flex gap-2">
            {step > 1 && step < TOTAL_STEPS && (
              <Button variant="outline" onClick={back}>
                {copy.onboarding.back}
              </Button>
            )}
            <Link href="/prototype">
              <Button variant="ghost">{copy.onboarding.skip}</Button>
            </Link>
          </div>
          {step < TOTAL_STEPS ? (
            <Button onClick={next}>{copy.onboarding.next}</Button>
          ) : (
            <Button onClick={finish}>{copy.onboarding.finish}</Button>
          )}
        </div>
      </div>

    </PrototypeShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}

function ChannelOption({
  selected,
  onClick,
  title,
  description,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  description: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-xl border-2 p-4 text-left transition-colors ${
        selected
          ? "border-primary bg-primary/5"
          : "border-border hover:bg-muted"
      }`}
    >
      <p className="font-medium">{title}</p>
      <p className="text-sm text-muted-foreground">{description}</p>
    </button>
  );
}
