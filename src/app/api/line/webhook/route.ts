import { NextResponse } from "next/server";
import { verifyLineSignature } from "@/lib/line/messaging";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("x-line-signature");

  if (!verifyLineSignature(body, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const events = JSON.parse(body).events ?? [];

  for (const event of events) {
    if (event.type === "message" && event.message?.type === "text") {
      console.log("[LINE webhook]", event.replyToken, event.message.text);
    }
  }

  return NextResponse.json({ ok: true });
}

export async function GET() {
  return NextResponse.json({ status: "LINE webhook ready" });
}
