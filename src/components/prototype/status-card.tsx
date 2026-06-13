import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { TaskStatus } from "@/lib/mock-data";

interface StatusCardProps {
  title: string;
  value: string;
  subtitle?: string;
  status?: TaskStatus;
  icon?: React.ReactNode;
  className?: string;
}

export function StatusCard({
  title,
  value,
  subtitle,
  status,
  icon,
  className,
}: StatusCardProps) {
  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          {icon && <span className="text-xl">{icon}</span>}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{value}</p>
        {subtitle && (
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        )}
        {status && (
          <div className="mt-2">
            <StatusBadge status={status} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface TaskCardProps {
  title: string;
  subtitle: string;
  status: TaskStatus;
  onClick?: () => void;
  elder?: boolean;
}

export function TaskCard({ title, subtitle, status, onClick, elder }: TaskCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full rounded-xl border-2 border-border bg-card p-5 text-left transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        elder && "p-6",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className={cn("font-semibold", elder ? "text-elder-lg" : "text-lg")}>
            {title}
          </p>
          <p className={cn("mt-1 text-muted-foreground", elder ? "text-elder" : "text-sm")}>
            {subtitle}
          </p>
        </div>
        <StatusBadge status={status} />
      </div>
    </button>
  );
}
