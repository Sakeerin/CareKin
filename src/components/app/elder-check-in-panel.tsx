"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import type { ActionResult } from "@/lib/actions/auth";
import type { CheckInMood, CheckInSleep } from "@/lib/types/health";
import { MOOD_LABELS, SLEEP_LABELS } from "@/lib/types/health";

const initialState: ActionResult = {};

type CheckInAction = (
  prev: ActionResult,
  formData: FormData,
) => Promise<ActionResult>;

export function ElderCheckInPanel({ action }: { action: CheckInAction }) {
  const [mood, setMood] = useState<CheckInMood>("good");
  const [sleep, setSleep] = useState<CheckInSleep>("good");
  const [hasSymptoms, setHasSymptoms] = useState(false);
  const [hadFall, setHadFall] = useState(false);
  const [appetiteNormal, setAppetiteNormal] = useState(true);
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-6">
      {state.error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {state.error}
        </div>
      )}
      {state.success && (
        <div className="rounded-xl border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
          บันทึกเรียบร้อย ขอบคุณที่ check-in วันนี้
        </div>
      )}

      <input type="hidden" name="mood" value={mood} />
      <input type="hidden" name="sleep" value={sleep} />
      <input type="hidden" name="hasSymptoms" value={String(hasSymptoms)} />
      <input type="hidden" name="hadFall" value={String(hadFall)} />
      <input type="hidden" name="appetiteNormal" value={String(appetiteNormal)} />

      <LargeChoiceGroup
        title="วันนี้รู้สึกอย่างไร?"
        value={mood}
        options={[
          { value: "good", label: MOOD_LABELS.good },
          { value: "okay", label: MOOD_LABELS.okay },
          { value: "bad", label: MOOD_LABELS.bad },
        ]}
        onChange={(value) => setMood(value as CheckInMood)}
      />

      <LargeChoiceGroup
        title="เมื่อคืนหลับเป็นอย่างไร?"
        value={sleep}
        options={[
          { value: "good", label: SLEEP_LABELS.good },
          { value: "okay", label: SLEEP_LABELS.okay },
          { value: "bad", label: SLEEP_LABELS.bad },
        ]}
        onChange={(value) => setSleep(value as CheckInSleep)}
      />

      <YesNoQuestion
        label="มีอาการผิดปกติไหม?"
        value={hasSymptoms}
        onChange={setHasSymptoms}
      />
      <YesNoQuestion label="วันนี้หกล้มหรือไม่?" value={hadFall} onChange={setHadFall} />
      <YesNoQuestion
        label="กินอาหารได้ตามปกติไหม?"
        value={appetiteNormal}
        yesLabel="กินได้"
        noLabel="กินได้น้อย"
        onChange={setAppetiteNormal}
      />

      <label className="block space-y-2">
        <span className="text-lg font-medium">บันทึกเพิ่มเติม</span>
        <textarea
          name="note"
          className="input-field min-h-24 resize-none text-lg"
          placeholder="ไม่บังคับ"
        />
      </label>

      <Button type="submit" size="lg" className="min-h-16 w-full text-xl" disabled={pending}>
        {pending ? "กำลังบันทึก..." : "บันทึก Check-in"}
      </Button>
    </form>
  );
}

function LargeChoiceGroup({
  title,
  value,
  options,
  onChange,
}: {
  title: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="grid gap-3 sm:grid-cols-3">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`min-h-20 rounded-2xl border px-4 text-xl font-semibold transition-colors ${
              value === option.value
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-foreground"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </section>
  );
}

function YesNoQuestion({
  label,
  value,
  yesLabel = "ใช่",
  noLabel = "ไม่ใช่",
  onChange,
}: {
  label: string;
  value: boolean;
  yesLabel?: string;
  noLabel?: string;
  onChange: (value: boolean) => void;
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">{label}</h2>
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onChange(true)}
          className={`min-h-16 rounded-2xl border px-4 text-xl font-semibold ${
            value ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card"
          }`}
        >
          {yesLabel}
        </button>
        <button
          type="button"
          onClick={() => onChange(false)}
          className={`min-h-16 rounded-2xl border px-4 text-xl font-semibold ${
            !value ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card"
          }`}
        >
          {noLabel}
        </button>
      </div>
    </section>
  );
}
