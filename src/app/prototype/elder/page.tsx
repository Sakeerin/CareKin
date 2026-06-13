"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PrototypeShell } from "@/components/prototype/prototype-shell";
import { TaskCard } from "@/components/prototype/status-card";
import { ElderButton } from "@/components/ui/button";
import { MoodPicker, YesNoPicker } from "@/components/prototype/mood-picker";
import { copy } from "@/lib/copy";
import { elderTasks } from "@/lib/mock-data";
import {
  confirmTask,
  getTaskStatus,
  addCheckIn,
  hasTodayCheckIn,
} from "@/lib/prototype-store";
import type { CheckInFormData } from "@/lib/schemas/check-in";

type ElderView = "home" | "task" | "checkin" | "success";

export default function ElderPage() {
  const router = useRouter();
  const [view, setView] = useState<ElderView>("home");
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [tasks, setTasks] = useState(elderTasks);
  const [checkIn, setCheckIn] = useState<Partial<CheckInFormData>>({
    elderId: "elder-1",
    mood: "good",
    hasSymptoms: false,
    hadFall: false,
    appetiteNormal: true,
    sleep: "good",
  });

  useEffect(() => {
    setTasks(
      elderTasks.map((t) => ({
        ...t,
        status: getTaskStatus(t.id, t.status),
      })),
    );
    if (hasTodayCheckIn()) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === "task-checkin" ? { ...t, status: "done" as const } : t,
        ),
      );
    }
  }, []);

  function handleTaskClick(taskId: string) {
    if (taskId === "task-checkin") {
      setView("checkin");
      return;
    }
    setActiveTaskId(taskId);
    setView("task");
  }

  function handleTaskConfirm(done: boolean) {
    if (!activeTaskId) return;
    const status = done ? "done" : "pending";
    confirmTask(activeTaskId, status);
    setTasks((prev) =>
      prev.map((t) => (t.id === activeTaskId ? { ...t, status } : t)),
    );
    setView("home");
    setActiveTaskId(null);
  }

  function handleCheckInSubmit() {
    addCheckIn(checkIn as CheckInFormData);
    setTasks((prev) =>
      prev.map((t) =>
        t.id === "task-checkin" ? { ...t, status: "done" as const } : t,
      ),
    );
    setView("success");
  }

  const activeTask = tasks.find((t) => t.id === activeTaskId);

  return (
    <PrototypeShell currentPath="/prototype/elder">
      <div className="mx-auto max-w-md space-y-6">
        {view === "home" && (
          <>
            <div>
              <h1 className="text-elder-lg font-bold">{copy.elder.todayTitle}</h1>
              <p className="mt-1 text-elder text-muted-foreground">
                สวัสดีค่ะ คุณสมศรี
              </p>
            </div>
            <div className="space-y-3">
              <h2 className="text-elder font-semibold">{copy.elder.tasksTitle}</h2>
              {tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  title={task.title}
                  subtitle={task.subtitle}
                  status={task.status}
                  elder
                  onClick={() => handleTaskClick(task.id)}
                />
              ))}
            </div>
          </>
        )}

        {view === "task" && activeTask && (
          <div className="space-y-6 text-center">
            <h1 className="text-elder-lg font-bold">{activeTask.title}</h1>
            <p className="text-elder text-muted-foreground">{activeTask.subtitle}</p>
            <div className="space-y-3">
              <ElderButton variant="success" onClick={() => handleTaskConfirm(true)}>
                {copy.elder.done}
              </ElderButton>
              <ElderButton variant="outline" onClick={() => handleTaskConfirm(false)}>
                {copy.elder.notYet}
              </ElderButton>
            </div>
            <ElderButton variant="ghost" onClick={() => setView("home")}>
              กลับ
            </ElderButton>
          </div>
        )}

        {view === "checkin" && (
          <div className="space-y-6">
            <h1 className="text-elder-lg font-bold">{copy.elder.checkInTitle}</h1>
            <MoodPicker
              label={copy.elder.questions.mood}
              options={[
                { value: "good", label: copy.elder.moodOptions.good },
                { value: "okay", label: copy.elder.moodOptions.okay },
                { value: "bad", label: copy.elder.moodOptions.bad },
              ]}
              value={checkIn.mood ?? "good"}
              onChange={(v) =>
                setCheckIn((p) => ({ ...p, mood: v as CheckInFormData["mood"] }))
              }
              elder
            />
            <YesNoPicker
              label={copy.elder.questions.symptoms}
              value={checkIn.hasSymptoms ?? false}
              onChange={(v) => setCheckIn((p) => ({ ...p, hasSymptoms: v }))}
              yesLabel={copy.elder.yesNo.yes}
              noLabel={copy.elder.yesNo.no}
              elder
            />
            <YesNoPicker
              label={copy.elder.questions.fall}
              value={checkIn.hadFall ?? false}
              onChange={(v) => setCheckIn((p) => ({ ...p, hadFall: v }))}
              yesLabel={copy.elder.yesNo.yes}
              noLabel={copy.elder.yesNo.no}
              elder
            />
            <YesNoPicker
              label={copy.elder.questions.appetite}
              value={checkIn.appetiteNormal ?? true}
              onChange={(v) => setCheckIn((p) => ({ ...p, appetiteNormal: v }))}
              yesLabel={copy.elder.yesNo.yes}
              noLabel={copy.elder.yesNo.no}
              elder
            />
            <MoodPicker
              label={copy.elder.questions.sleep}
              options={[
                { value: "good", label: copy.elder.sleepOptions.good },
                { value: "okay", label: copy.elder.sleepOptions.okay },
                { value: "bad", label: copy.elder.sleepOptions.bad },
              ]}
              value={checkIn.sleep ?? "good"}
              onChange={(v) =>
                setCheckIn((p) => ({ ...p, sleep: v as CheckInFormData["sleep"] }))
              }
              elder
            />
            <ElderButton onClick={handleCheckInSubmit}>บันทึก</ElderButton>
            <ElderButton variant="ghost" onClick={() => setView("home")}>
              กลับ
            </ElderButton>
          </div>
        )}

        {view === "success" && (
          <div className="space-y-6 text-center">
            <p className="text-5xl">✅</p>
            <h1 className="text-elder-lg font-bold">{copy.elder.successTitle}</h1>
            <p className="text-elder text-muted-foreground">{copy.elder.successMessage}</p>
            <ElderButton onClick={() => router.push("/prototype/family")}>
              ดู Dashboard
            </ElderButton>
            <ElderButton variant="ghost" onClick={() => setView("home")}>
              กลับหน้าหลัก
            </ElderButton>
          </div>
        )}
      </div>
    </PrototypeShell>
  );
}
