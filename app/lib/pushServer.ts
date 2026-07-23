// Server-only Web Push helpers. Configures VAPID and computes reminder text.
import "server-only";
import crypto from "node:crypto";
import webpush from "web-push";
import { VAPID_PUBLIC_KEY } from "./push";

let configured = false;

export function pushServerReady(): boolean {
  return (
    !!(process.env.VAPID_PRIVATE_KEY || "") &&
    !!(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || VAPID_PUBLIC_KEY)
  );
}

function ensureConfigured() {
  if (configured) return;
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY || "";
  const subject = process.env.VAPID_SUBJECT || "mailto:owner@example.com";
  webpush.setVapidDetails(subject, publicKey, privateKey);
  configured = true;
}

export function endpointKey(endpoint: string): string {
  return "sub:" + crypto.createHash("sha256").update(endpoint).digest("hex").slice(0, 24);
}

export interface StoredSub {
  subscription: webpush.PushSubscription;
  items: {
    loanId: string;
    dueDate: string;
    remaining: number;
    currency: string;
    name: string;
  }[];
  sent: Record<string, string>; // "loanId:type" -> YYYY-MM-DD
}

const CURRENCY_LABEL: Record<string, string> = {
  RON: "lei",
  EUR: "€",
  USD: "$",
  GBP: "£",
  CHF: "CHF",
};

function money(amount: number, currency: string): string {
  const n = new Intl.NumberFormat("ro-RO", { maximumFractionDigits: 2 }).format(amount);
  const sym = CURRENCY_LABEL[currency] || currency;
  return currency === "RON" || currency === "CHF" ? `${n} ${sym}` : `${sym}${n}`;
}

function daysUntil(dateISO: string, now: Date): number {
  const d = new Date(dateISO);
  const a = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
  const b = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((a - b) / 86400000);
}

// Decide whether a reminder should fire today; returns message + a dedupe type.
export function dueMessage(
  item: StoredSub["items"][number],
  now: Date,
): { type: string; title: string; body: string } | null {
  const d = daysUntil(item.dueDate, now);
  let type: string | null = null;
  let title = "";
  if (d === 1) {
    type = "d1";
    title = "Mâine expiră termenul";
  } else if (d === 0) {
    type = "d0";
    title = "Astăzi expiră termenul";
  } else if (d < 0) {
    const late = -d;
    if (late === 30) (type = "l30"), (title = "Întârziere 30 de zile");
    else if (late === 7) (type = "l7"), (title = "Întârziere 7 zile");
    else if (late === 3) (type = "l3"), (title = "Întârziere 3 zile");
    else if (late === 1) (type = "l1"), (title = "Întârziere 1 zi");
  }
  if (!type) return null;
  return { type, title, body: `${item.name} — ${money(item.remaining, item.currency)}` };
}

export async function sendPush(
  subscription: webpush.PushSubscription,
  payload: { title: string; body: string; url?: string; tag?: string },
): Promise<{ ok: boolean; gone: boolean }> {
  ensureConfigured();
  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload));
    return { ok: true, gone: false };
  } catch (e: unknown) {
    const status = (e as { statusCode?: number }).statusCode;
    // 404/410 -> subscription no longer valid and should be removed.
    return { ok: false, gone: status === 404 || status === 410 };
  }
}
