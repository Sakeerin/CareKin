import Link from "next/link";
import { logoutAction } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import type { WorkspaceRole } from "@/lib/types/database";
import { WORKSPACE_ROLE_LABELS } from "@/lib/types/database";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/elders", label: "ผู้สูงวัย" },
  { href: "/members", label: "สมาชิก" },
  { href: "/settings", label: "ตั้งค่า" },
];

export function AppShell({
  children,
  workspaceName,
  userRole,
}: {
  children: React.ReactNode;
  workspaceName?: string;
  userRole?: WorkspaceRole;
}) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="text-lg font-bold text-primary">
              CareKin
            </Link>
            <nav className="hidden gap-1 sm:flex">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            {workspaceName && (
              <span className="hidden text-sm text-muted-foreground sm:inline">
                {workspaceName}
                {userRole && ` · ${WORKSPACE_ROLE_LABELS[userRole]}`}
              </span>
            )}
            <form action={logoutAction}>
              <Button type="submit" variant="ghost" size="sm">
                ออกจากระบบ
              </Button>
            </form>
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto border-t border-border px-4 py-2 sm:hidden">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
    </div>
  );
}
