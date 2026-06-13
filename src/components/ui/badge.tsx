import { cn } from "@/lib/utils";
import type { TaskStatus, AlertLevel } from "@/lib/mock-data";

const statusStyles: Record<TaskStatus, string> = {
  done: "bg-success/15 text-success border-success/30",
  pending: "bg-warning/15 text-warning-foreground border-warning/30",
  missed: "bg-destructive/15 text-destructive border-destructive/30",
};

const statusLabels: Record<TaskStatus, string> = {
  done: "เสร็จแล้ว",
  pending: "รอดำเนินการ",
  missed: "พลาด",
};

export function StatusBadge({
  status,
  className,
}: {
  status: TaskStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        statusStyles[status],
        className,
      )}
    >
      {statusLabels[status]}
    </span>
  );
}

const alertStyles: Record<AlertLevel, string> = {
  info: "bg-accent text-accent-foreground border-border",
  family: "bg-warning/15 text-warning-foreground border-warning/30",
  urgent: "bg-destructive/15 text-destructive border-destructive/30",
};

const alertLabels: Record<AlertLevel, string> = {
  info: "ข้อมูล",
  family: "แจ้งครอบครัว",
  urgent: "เร่งด่วน",
};

export function AlertBadge({
  level,
  className,
}: {
  level: AlertLevel;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        alertStyles[level],
        className,
      )}
    >
      {alertLabels[level]}
    </span>
  );
}
