"use client";

import { useActionState } from "react";
import { ElderButton, Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import type { TaskEvent } from "@/lib/types/care-tasks";
import type { ActionResult } from "@/lib/actions/auth";
import { confirmTaskEventAction } from "@/lib/actions/task-events";

const initialState: ActionResult = {};

export function TaskConfirmPanel({ event }: { event: TaskEvent }) {
  const boundAction = confirmTaskEventAction.bind(null, event.id);
  const [state, formAction, pending] = useActionState(boundAction, initialState);

  if (event.status !== "pending") {
    return (
      <div className="text-center space-y-3">
        <StatusBadge status={event.status === "completed" ? "done" : event.status === "missed" ? "missed" : "pending"} />
        <p className="text-muted-foreground">งานนี้ถูกยืนยันแล้ว</p>
      </div>
    );
  }

  if (state.success) {
    return (
      <div className="text-center space-y-3">
        <p className="text-4xl">✅</p>
        <p className="text-elder-lg font-semibold">บันทึกเรียบร้อย</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      {state.error && (
        <p className="rounded-lg bg-destructive/10 px-4 py-2 text-sm text-destructive">
          {state.error}
        </p>
      )}
      <input type="hidden" name="action" value="completed" id="action-field" />
      <ElderButton
        type="submit"
        variant="success"
        disabled={pending}
        onClick={() => {
          const field = document.getElementById("action-field") as HTMLInputElement;
          if (field) field.value = "completed";
        }}
      >
        ทำแล้ว
      </ElderButton>
      <ElderButton
        type="submit"
        variant="outline"
        disabled={pending}
        onClick={() => {
          const field = document.getElementById("action-field") as HTMLInputElement;
          if (field) field.value = "skipped";
        }}
      >
        ข้าม (มีเหตุผล)
      </ElderButton>
      <label className="block space-y-1.5">
        <span className="text-sm text-muted-foreground">เหตุผลที่ข้าม (ถ้ามี)</span>
        <input name="skipReason" className="input-field" placeholder="ไม่บังคับ" />
      </label>
      <Button type="submit" variant="ghost" className="w-full" disabled={pending}
        onClick={() => {
          const field = document.getElementById("action-field") as HTMLInputElement;
          if (field) field.value = "missed";
        }}
      >
        ยังไม่ได้ทำ
      </Button>
    </form>
  );
}
