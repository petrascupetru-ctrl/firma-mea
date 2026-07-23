import { NextResponse } from "next/server";
import { kvConfigured, kvDel, kvGet, kvKeys, kvSet } from "../../../lib/kv";
import {
  dueMessage,
  pushServerReady,
  sendPush,
  type StoredSub,
} from "../../../lib/pushServer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Triggered daily by Vercel Cron. Sends due/overdue reminders to all subscribers.
export async function GET(req: Request) {
  // Protect the endpoint. Vercel Cron sends the CRON_SECRET as a Bearer token.
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }
  if (!kvConfigured() || !pushServerReady()) {
    return NextResponse.json({ error: "not-configured" }, { status: 503 });
  }

  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  let sent = 0;
  let pruned = 0;

  const keys = await kvKeys("sub:*");
  for (const key of keys) {
    const rec = await kvGet<StoredSub>(key);
    if (!rec) continue;
    let changed = false;
    let gone = false;

    for (const item of rec.items) {
      const msg = dueMessage(item, now);
      if (!msg) continue;
      const dedupe = `${item.loanId}:${msg.type}`;
      if (rec.sent[dedupe] === today) continue;

      const result = await sendPush(rec.subscription, {
        title: msg.title,
        body: msg.body,
        url: `/imprumuturi/${item.loanId}`,
        tag: dedupe,
      });
      if (result.gone) {
        gone = true;
        break;
      }
      if (result.ok) {
        rec.sent[dedupe] = today;
        changed = true;
        sent++;
      }
    }

    if (gone) {
      await kvDel(key);
      pruned++;
    } else if (changed) {
      await kvSet(key, rec);
    }
  }

  return NextResponse.json({ ok: true, sent, pruned, subscribers: keys.length });
}
