import Link from "next/link";

const navLinks = [
  { href: "/pricing", label: "Pricing" },
  { href: "/help", label: "Help" },
  { href: "/demo", label: "Demo" },
  { href: "/sales", label: "B2B" },
];

export function MarketingHeader() {
  return (
    <header className="border-b border-border bg-card/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-bold text-primary">
          CareKin
        </Link>
        <nav className="hidden items-center gap-5 text-sm font-medium text-muted-foreground sm:flex">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-foreground">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            เข้าสู่ระบบ
          </Link>
          <Link
            href="/signup"
            className="touch-standard inline-flex items-center rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            เริ่มใช้งาน
          </Link>
        </div>
      </div>
    </header>
  );
}

export function MarketingFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} CareKin. Built for family care coordination.</p>
        <nav className="flex flex-wrap gap-4">
          <Link href="/terms" className="hover:text-foreground">
            Terms
          </Link>
          <Link href="/privacy" className="hover:text-foreground">
            Privacy
          </Link>
          <Link href="/consent" className="hover:text-foreground">
            Consent
          </Link>
          <Link href="/support" className="hover:text-foreground">
            Support
          </Link>
        </nav>
      </div>
    </footer>
  );
}

export function MarketingPage({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <MarketingHeader />
      {children}
      <MarketingFooter />
    </div>
  );
}
