import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    if (process.env.NODE_ENV === "production") {
      return new NextResponse("Supabase environment is not configured", {
        status: 503,
      });
    }
    return NextResponse.next();
  }
  return updateSession(request);
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/elders/:path*",
    "/settings/:path*",
    "/members/:path*",
    "/workspace/:path*",
    "/tasks/:path*",
    "/notifications/:path*",
    "/alerts/:path*",
    "/feedback/:path*",
    "/support/:path*",
    "/onboarding/:path*",
    "/scale/:path*",
    "/facility/:path*",
    "/marketplace/:path*",
    "/integrations/:path*",
    "/referrals/:path*",
    "/wellness/:path*",
    "/compliance/:path*",
    "/ops/:path*",
    "/invite/:path*",
    "/login",
    "/signup",
  ],
};
