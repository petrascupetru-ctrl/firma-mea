import { NextResponse } from "next/server";
import { kvConfigured, kvDel, kvGet, kvSet } from "../../../lib/kv";
import { endpointKey, type StoredSub } from "../../../lib/pushServer";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!kvConfigured()) {
    return NextResponse.json({ error: "storage-not-configured" }, { status: 503 });
  }
  try {
    const { subscription, items } = (await req.json()) as {
      subscription: StoredSub["subscription"] & { endpoint?: string };
      items: StoredSub["items"];
    };
    if (!subscription?.endpoint) {
      return NextResponse.json({ error: "bad-subscription" }, { status: 400 });
    }
    const key = endpointKey(subscription.endpoint);
    const existing = await kvGet<StoredSub>(key);
    const record: StoredSub = {
      subscription,
      items: Array.isArray(items) ? items : [],
      sent: existing?.sent ?? {},
    };
    await kvSet(key, record);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "server" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  if (!kvConfigured()) {
    return NextResponse.json({ error: "storage-not-configured" }, { status: 503 });
  }
  try {
    const { endpoint } = (await req.json()) as { endpoint: string };
    if (endpoint) await kvDel(endpointKey(endpoint));
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "server" }, { status: 500 });
  }
}
