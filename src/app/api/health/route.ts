import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const requiredEnv = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "NEXT_PUBLIC_APP_URL",
  ];
  const missingRequired = requiredEnv.filter((key) => !process.env[key]);
  const status = missingRequired.length === 0 ? "ok" : "degraded";

  return NextResponse.json(
    {
      status,
      service: "carekin",
      timestamp: new Date().toISOString(),
    },
    { status: status === "ok" ? 200 : 503 },
  );
}
