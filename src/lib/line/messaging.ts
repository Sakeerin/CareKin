import { createHmac } from "crypto";

const LINE_API = "https://api.line.me/v2/bot";

export function isLineConfigured(): boolean {
  return Boolean(process.env.LINE_CHANNEL_ACCESS_TOKEN);
}

export async function sendLinePushMessage(
  lineUserId: string,
  text: string,
  confirmUrl?: string,
): Promise<void> {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token) {
    console.warn("[LINE] LINE_CHANNEL_ACCESS_TOKEN not set — skipping push");
    return;
  }

  const messages: Array<Record<string, unknown>> = [{ type: "text", text }];

  if (confirmUrl) {
    messages.push({
      type: "template",
      altText: "ยืนยันงาน",
      template: {
        type: "buttons",
        text: "ยืนยันการทำงาน",
        actions: [
          {
            type: "uri",
            label: "✅ ทำแล้ว",
            uri: `${confirmUrl}?action=completed`,
          },
          {
            type: "uri",
            label: "⏳ ยังไม่ได้",
            uri: `${confirmUrl}?action=missed`,
          },
        ],
      },
    });
  }

  const res = await fetch(`${LINE_API}/message/push`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ to: lineUserId, messages }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`LINE push failed: ${res.status} ${body}`);
  }
}

export function verifyLineSignature(
  body: string,
  signature: string | null,
): boolean {
  const secret = process.env.LINE_CHANNEL_SECRET;
  if (!secret || !signature) return false;

  const hash = createHmac("SHA256", secret).update(body).digest("base64");
  return hash === signature;
}
