"use client";

import { cn } from "@/lib/utils";

interface Option {
  value: string;
  label: string;
}

interface MoodPickerProps {
  label: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  elder?: boolean;
  className?: string;
}

export function MoodPicker({
  label,
  options,
  value,
  onChange,
  elder = false,
  className,
}: MoodPickerProps) {
  return (
    <fieldset className={cn("space-y-3", className)}>
      <legend className={cn("font-medium", elder ? "text-elder-lg" : "text-base")}>
        {label}
      </legend>
      <div className={cn("flex flex-wrap gap-2", elder && "flex-col")}>
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              "rounded-xl border-2 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              elder
                ? "touch-elder flex-1 px-6 py-4 text-elder-lg"
                : "touch-standard px-4 py-2 text-base",
              value === opt.value
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card hover:bg-muted",
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

interface YesNoPickerProps {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  yesLabel?: string;
  noLabel?: string;
  elder?: boolean;
  className?: string;
}

export function YesNoPicker({
  label,
  value,
  onChange,
  yesLabel = "ใช่",
  noLabel = "ไม่",
  elder = false,
  className,
}: YesNoPickerProps) {
  return (
    <MoodPicker
      label={label}
      options={[
        { value: "yes", label: yesLabel },
        { value: "no", label: noLabel },
      ]}
      value={value ? "yes" : "no"}
      onChange={(v) => onChange(v === "yes")}
      elder={elder}
      className={className}
    />
  );
}
