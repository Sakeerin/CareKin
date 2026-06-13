import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 px-6 py-12">
      <div className="max-w-lg text-center">
        <h1 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">
          CareKin
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          แพลตฟอร์มช่วยครอบครัวดูแลผู้สูงวัย — บันทึก แจ้งเตือน และสรุปข้อมูลการดูแล
        </p>
      </div>
      <Link
        href="/prototype"
        className="touch-standard inline-flex items-center justify-center rounded-xl bg-primary px-8 py-3 text-base font-semibold text-primary-foreground transition-colors hover:opacity-90"
      >
        เปิดต้นแบบ Phase 1
      </Link>
    </main>
  );
}
