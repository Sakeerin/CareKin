import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const requiredEnv = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "NEXT_PUBLIC_APP_URL",
  ];
  const optionalEnv = [
    "SUPABASE_SERVICE_ROLE_KEY",
    "CRON_SECRET",
    "LINE_CHANNEL_ACCESS_TOKEN",
    "LINE_CHANNEL_SECRET",
  ];

  const missingRequired = requiredEnv.filter((key) => !process.env[key]);
  const configuredOptional = optionalEnv.filter((key) => Boolean(process.env[key]));
  const status = missingRequired.length === 0 ? "ok" : "degraded";

  return NextResponse.json(
    {
      status,
      service: "carekin",
      timestamp: new Date().toISOString(),
      checks: {
        requiredEnv: {
          ok: missingRequired.length === 0,
          missing: missingRequired,
        },
        optionalEnv: {
          configured: configuredOptional,
        },
      },
    },
    { status: status === "ok" ? 200 : 503 },
  );
}
