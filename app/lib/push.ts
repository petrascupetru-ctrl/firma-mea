// Client-side Web Push helpers (subscribe + sync reminders to the backend).
import { loanRemaining, loanStatus, personFullName } from "./calc";
import type { Loan, Payment, Person } from "./types";

// Public VAPID key. Safe to embed (public). Can be overridden via env at build.
export const VAPID_PUBLIC_KEY =
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
  "BMEXA84NwhBKX6W-bD2e0r9r0OZRjwWS8G6rBwK7dCC-gGd6C7rBpdCpCH4FjkyHmWfTulF_cfB9MXScW4WAV10";

const SUB_FLAG = "debt-manager-pro:push";

export function pushSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

export function pushEnabledLocally(): boolean {
  return typeof localStorage !== "undefined" && !!localStorage.getItem(SUB_FLAG);
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

// A compact, low-detail reminder item synced to the server so the daily cron
// can decide when to notify (only what a reminder message needs).
export interface PushItem {
  loanId: string;
  dueDate: string;
  remaining: number;
  currency: string;
  name: string;
}

export function buildItems(
  loans: Loan[],
  payments: Payment[],
  people: Person[],
): PushItem[] {
  const items: PushItem[] = [];
  for (const loan of loans) {
    if (loanStatus(loan, payments) === "achitat") continue;
    const person = people.find((p) => p.id === loan.personId);
    items.push({
      loanId: loan.id,
      dueDate: loan.dueDate,
      remaining: loanRemaining(loan, payments),
      currency: loan.currency,
      name: person ? personFullName(person) : "Necunoscut",
    });
  }
  return items;
}

async function postSubscription(subscription: PushSubscription, items: PushItem[]) {
  const res = await fetch("/api/push/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ subscription, items }),
  });
  return res.ok;
}

// Ask permission, subscribe to push, and register reminders. Returns a status.
export async function enablePush(
  loans: Loan[],
  payments: Payment[],
  people: Person[],
): Promise<{ ok: boolean; reason?: string }> {
  if (!pushSupported()) return { ok: false, reason: "unsupported" };
  try {
    const perm = await Notification.requestPermission();
    if (perm !== "granted") return { ok: false, reason: "denied" };

    const reg = await navigator.serviceWorker.ready;
    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as BufferSource,
      });
    }
    const ok = await postSubscription(sub, buildItems(loans, payments, people));
    if (!ok) return { ok: false, reason: "server" };
    localStorage.setItem(SUB_FLAG, "1");
    return { ok: true };
  } catch {
    return { ok: false, reason: "error" };
  }
}

// Keep the server's reminder list in sync with current data (best effort).
export async function syncPush(
  loans: Loan[],
  payments: Payment[],
  people: Person[],
): Promise<void> {
  if (!pushEnabledLocally() || !pushSupported()) return;
  try {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (sub) await postSubscription(sub, buildItems(loans, payments, people));
  } catch {
    /* ignore */
  }
}

export async function disablePush(): Promise<void> {
  try {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (sub) {
      await fetch("/api/push/subscribe", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint: sub.endpoint }),
      });
      await sub.unsubscribe();
    }
  } catch {
    /* ignore */
  }
  localStorage.removeItem(SUB_FLAG);
}

// Send a test push immediately (via the backend) to verify the setup.
export async function sendTestPush(): Promise<boolean> {
  try {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (!sub) return false;
    const res = await fetch("/api/push/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ endpoint: sub.endpoint }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
