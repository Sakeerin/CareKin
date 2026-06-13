import Link from "next/link";
import { PrototypeBanner } from "@/components/prototype/prototype-banner";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/prototype", label: "หน้าหลัก", exact: true },
  { href: "/prototype/onboarding", label: "Onboarding" },
  { href: "/prototype/elder", label: "ผู้สูงวัย" },
  { href: "/prototype/caregiver", label: "ผู้ดูแล" },
  { href: "/prototype/family", label: "Dashboard" },
  { href: "/prototype/report", label: "รายงาน" },
  { href: "/prototype/line", label: "LINE" },
];

export function PrototypeNav({ currentPath }: { currentPath?: string }) {
  return (
    <nav className="border-b border-border bg-card px-4 py-2">
      <div className="mx-auto flex max-w-5xl gap-1 overflow-x-auto">
        {navItems.map((item) => {
          const isActive =
            item.exact
              ? currentPath === item.href
              : currentPath?.startsWith(item.href) && item.href !== "/prototype";
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function PrototypeShell({
  children,
  currentPath,
}: {
  children: React.ReactNode;
  currentPath?: string;
}) {
  return (
    <div className="min-h-screen bg-background">
      <PrototypeBanner />
      <PrototypeNav currentPath={currentPath} />
      <div className="mx-auto max-w-5xl px-4 py-6">{children}</div>
    </div>
  );
}
