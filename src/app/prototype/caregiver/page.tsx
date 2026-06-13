"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PrototypeShell } from "@/components/prototype/prototype-shell";
import { MoodPicker, YesNoPicker } from "@/components/prototype/mood-picker";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { copy } from "@/lib/copy";
import { elderProfile } from "@/lib/mock-data";
import {
  checkInSchema,
  defaultCheckInValues,
  type CheckInFormData,
} from "@/lib/schemas/check-in";
import { addCheckIn } from "@/lib/prototype-store";

export default function CaregiverPage() {
  const router = useRouter();
  const [startTime] = useState(Date.now());
  const [elapsed, setElapsed] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const {
    watch,
    setValue,
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<CheckInFormData>({
    resolver: zodResolver(checkInSchema),
    defaultValues: defaultCheckInValues,
  });

  const mood = watch("mood");
  const hasSymptoms = watch("hasSymptoms");
  const hadFall = watch("hadFall");
  const appetiteNormal = watch("appetiteNormal");
  const sleep = watch("sleep");

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  function onSubmit(data: CheckInFormData) {
    addCheckIn(data);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <PrototypeShell currentPath="/prototype/caregiver">
        <div className="mx-auto max-w-lg space-y-6 text-center">
          <p className="text-4xl">✅</p>
          <h1 className="text-xl font-bold">{copy.caregiver.success}</h1>
          <p className="text-muted-foreground">
            ใช้เวลา {elapsed} วินาที
          </p>
          <Button onClick={() => router.push("/prototype/family")}>
            {copy.caregiver.viewDashboard}
          </Button>
        </div>
      </PrototypeShell>
    );
  }

  return (
    <PrototypeShell currentPath="/prototype/caregiver">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mx-auto max-w-lg space-y-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">{copy.caregiver.title}</h1>
            <p className="text-sm text-muted-foreground">{copy.caregiver.subtitle}</p>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-sm font-medium ${
              elapsed <= 60
                ? "bg-success/15 text-success"
                : "bg-warning/15 text-warning-foreground"
            }`}
          >
            {elapsed}s
          </span>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{copy.caregiver.elderLabel}</CardTitle>
            <CardDescription>
              {elderProfile.nickname} — อายุ {elderProfile.age} ปี
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardContent className="space-y-5 pt-5">
            <MoodPicker
              label={copy.elder.questions.mood}
              options={[
                { value: "good", label: copy.elder.moodOptions.good },
                { value: "okay", label: copy.elder.moodOptions.okay },
                { value: "bad", label: copy.elder.moodOptions.bad },
              ]}
              value={mood}
              onChange={(v) => setValue("mood", v as CheckInFormData["mood"])}
            />
            <YesNoPicker
              label={copy.elder.questions.symptoms}
              value={hasSymptoms}
              onChange={(v) => setValue("hasSymptoms", v)}
            />
            <YesNoPicker
              label={copy.elder.questions.fall}
              value={hadFall}
              onChange={(v) => setValue("hadFall", v)}
            />
            <YesNoPicker
              label={copy.elder.questions.appetite}
              value={appetiteNormal}
              onChange={(v) => setValue("appetiteNormal", v)}
            />
            <MoodPicker
              label={copy.elder.questions.sleep}
              options={[
                { value: "good", label: copy.elder.sleepOptions.good },
                { value: "okay", label: copy.elder.sleepOptions.okay },
                { value: "bad", label: copy.elder.sleepOptions.bad },
              ]}
              value={sleep}
              onChange={(v) => setValue("sleep", v as CheckInFormData["sleep"])}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{copy.caregiver.vitalsTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <VitalField label="SYS" {...register("systolic")} />
              <VitalField label="DIA" {...register("diastolic")} />
              <VitalField label="ชีพจร" {...register("pulse")} />
              <VitalField label="น้ำตาล" {...register("bloodSugar")} />
            </div>
          </CardContent>
        </Card>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium">{copy.caregiver.noteLabel}</span>
          <textarea
            className="input-field min-h-[80px] resize-none"
            {...register("note")}
            placeholder="หมายเหตุ (ไม่บังคับ)"
          />
        </label>

        {errors.mood && (
          <p className="text-sm text-destructive">{errors.mood.message}</p>
        )}

        <Button type="submit" className="w-full" size="lg">
          {copy.caregiver.submit}
        </Button>
      </form>
    </PrototypeShell>
  );
}

function VitalField({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block space-y-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <input type="number" className="input-field" placeholder="—" {...props} />
    </label>
  );
}
