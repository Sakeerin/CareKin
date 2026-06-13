import { AppShell } from "@/components/app/app-shell";
import { requireWorkspace } from "@/lib/auth/session";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const ctx = await requireWorkspace();

  return (
    <AppShell
      workspaceName={ctx.workspace.name}
      userRole={ctx.membership.role}
    >
      {children}
    </AppShell>
  );
}
