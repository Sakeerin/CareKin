"use client";

import { useActionState } from "react";
import type { ActionResult } from "@/lib/actions/auth";

const initialState: ActionResult = {};

interface FormActionProps {
  action: (
    prev: ActionResult,
    formData: FormData,
  ) => Promise<ActionResult>;
  children: React.ReactNode;
  className?: string;
}

export function FormAction({ action, children, className }: FormActionProps) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className={className}>
      {state.error && (
        <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {state.error}
        </div>
      )}
      {state.success && (
        <div className="mb-4 rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
          บันทึกเรียบร้อย
        </div>
      )}
      {children}
      {pending && (
        <p className="mt-2 text-sm text-muted-foreground">กำลังดำเนินการ...</p>
      )}
    </form>
  );
}

export function FormField({
  label,
  name,
  type = "text",
  required,
  placeholder,
  defaultValue,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  defaultValue?: string;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium">{label}</span>
      <input
        type={type}
        name={name}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue}
        className="input-field"
      />
    </label>
  );
}

export function FormTextarea({
  label,
  name,
  placeholder,
  defaultValue,
  rows = 3,
}: {
  label: string;
  name: string;
  placeholder?: string;
  defaultValue?: string;
  rows?: number;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium">{label}</span>
      <textarea
        name={name}
        placeholder={placeholder}
        defaultValue={defaultValue}
        rows={rows}
        className="input-field resize-none"
      />
    </label>
  );
}

export function FormSelect({
  label,
  name,
  options,
  defaultValue,
}: {
  label: string;
  name: string;
  options: { value: string; label: string }[];
  defaultValue?: string;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium">{label}</span>
      <select name={name} defaultValue={defaultValue} className="input-field">
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}
