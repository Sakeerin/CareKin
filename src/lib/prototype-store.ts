"use client";

import type { CheckInFormData } from "@/lib/schemas/check-in";
import type { TaskStatus } from "@/lib/mock-data";

const STORAGE_KEY = "carekin-prototype-v1";
const STORAGE_VERSION = 1;

export interface StoredCheckIn extends CheckInFormData {
  id: string;
  timestamp: string;
}

export interface StoredTaskConfirm {
  taskId: string;
  status: TaskStatus;
  timestamp: string;
}

export interface PrototypeState {
  version: number;
  checkIns: StoredCheckIn[];
  taskConfirms: StoredTaskConfirm[];
  onboardingComplete: boolean;
}

const defaultState: PrototypeState = {
  version: STORAGE_VERSION,
  checkIns: [],
  taskConfirms: [],
  onboardingComplete: false,
};

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function loadPrototypeState(): PrototypeState {
  if (!isBrowser()) return defaultState;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;

    const parsed = JSON.parse(raw) as PrototypeState;
    if (parsed.version !== STORAGE_VERSION) return defaultState;
    return parsed;
  } catch {
    return defaultState;
  }
}

export function savePrototypeState(state: PrototypeState): void {
  if (!isBrowser()) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function addCheckIn(data: CheckInFormData): StoredCheckIn {
  const state = loadPrototypeState();
  const entry: StoredCheckIn = {
    ...data,
    id: `checkin-${Date.now()}`,
    timestamp: new Date().toISOString(),
  };
  state.checkIns.unshift(entry);
  savePrototypeState(state);
  return entry;
}

export function confirmTask(taskId: string, status: TaskStatus): void {
  const state = loadPrototypeState();
  const existing = state.taskConfirms.findIndex((t) => t.taskId === taskId);
  const entry: StoredTaskConfirm = {
    taskId,
    status,
    timestamp: new Date().toISOString(),
  };
  if (existing >= 0) {
    state.taskConfirms[existing] = entry;
  } else {
    state.taskConfirms.push(entry);
  }
  savePrototypeState(state);
}

export function getTaskStatus(taskId: string, defaultStatus: TaskStatus): TaskStatus {
  const state = loadPrototypeState();
  const found = state.taskConfirms.find((t) => t.taskId === taskId);
  return found?.status ?? defaultStatus;
}

export function hasTodayCheckIn(): boolean {
  const state = loadPrototypeState();
  const today = new Date().toDateString();
  return state.checkIns.some(
    (c) => new Date(c.timestamp).toDateString() === today,
  );
}

export function getTodayCheckIn(): StoredCheckIn | undefined {
  const state = loadPrototypeState();
  const today = new Date().toDateString();
  return state.checkIns.find(
    (c) => new Date(c.timestamp).toDateString() === today,
  );
}

export function setOnboardingComplete(complete: boolean): void {
  const state = loadPrototypeState();
  state.onboardingComplete = complete;
  savePrototypeState(state);
}

export function getMergedActivityLogs(): Array<{
  id: string;
  message: string;
  timestamp: string;
  type: string;
}> {
  const state = loadPrototypeState();
  const userLogs = [
    ...state.checkIns.map((c) => ({
      id: c.id,
      message: `Check-in — รู้สึก${c.mood === "good" ? "ดี" : c.mood === "okay" ? "ปานกลาง" : "ไม่ค่อยดี"}`,
      timestamp: c.timestamp,
      type: "check-in",
    })),
    ...state.taskConfirms.map((t) => ({
      id: `task-${t.taskId}`,
      message: `ยืนยันงาน — ${t.status === "done" ? "ทำแล้ว" : "ยังไม่ได้"}`,
      timestamp: t.timestamp,
      type: "task",
    })),
  ];
  return userLogs.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );
}

export function resetPrototypeState(): void {
  if (!isBrowser()) return;
  localStorage.removeItem(STORAGE_KEY);
}
