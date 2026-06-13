import { copy } from "@/lib/copy";
import { cn } from "@/lib/utils";

export function PrototypeBanner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "border-b border-warning/30 bg-warning/10 px-4 py-2 text-center text-sm font-medium text-warning-foreground",
        className,
      )}
    >
      {copy.prototypeBanner}
    </div>
  );
}

export function SafetyDisclaimer({ className }: { className?: string }) {
  return (
    <p className={cn("text-xs leading-relaxed text-muted-foreground", className)}>
      {copy.safetyDisclaimer}
    </p>
  );
}
