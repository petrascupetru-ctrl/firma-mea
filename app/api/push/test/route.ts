import { NextResponse } from "next/server";
import { kvConfigured, kvGet } from "../../../lib/kv";
import { endpointKey, pushServerReady, sendPush, type StoredSub } from "../../../lib/pushServer";

export const runtime = "nodejs";

// Sends a single test notification to the caller's own subscription.
export async function POST(req: Request) {
  if (!kvConfigured() || !pushServerReady()) {
    return NextResponse.json({ error: "not-configured" }, { status: 503 });
  }
  try {
    const { endpoint } = (await req.json()) as { endpoint: string };
    if (!endpoint) return NextResponse.json({ error: "no-endpoint" }, { status: 400 });
    const rec = await kvGet<StoredSub>(endpointKey(endpoint));
    if (!rec) return NextResponse.json({ error: "not-subscribed" }, { status: 404 });
    const result = await sendPush(rec.subscription, {
      title: "Debt Manager Pro",
      body: "✅ Notificările push funcționează!",
      url: "/",
      tag: "test",
    });
    return NextResponse.json({ ok: result.ok });
  } catch {
    return NextResponse.json({ error: "server" }, { status: 500 });
  }
}
