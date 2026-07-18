import { daysUntil, formatMoney, loanRemaining, loanStatus, personFullName } from "./calc";
import type { Loan, Payment, Person } from "./types";

export function notificationsSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!notificationsSupported()) return "denied";
  try {
    return await Notification.requestPermission();
  } catch {
    return "denied";
  }
}

async function show(title: string, body: string, tag: string, url: string) {
  // Prefer the service worker (works when installed); fall back to page Notification.
  try {
    const reg = await navigator.serviceWorker?.ready;
    if (reg?.active) {
      reg.active.postMessage({ type: "notify", title, body, tag, url });
      return;
    }
  } catch {
    /* ignore */
  }
  try {
    new Notification(title, { body, tag, icon: "/icon-192.png" });
  } catch {
    /* ignore */
  }
}

// Fire reminders for due/overdue loans, at most once per loan per day.
export async function runDueReminders(
  loans: Loan[],
  payments: Payment[],
  people: Person[],
) {
  if (!notificationsSupported() || Notification.permission !== "granted") return;
  const today = new Date().toISOString().slice(0, 10);
  let sent: Record<string, string> = {};
  try {
    sent = JSON.parse(localStorage.getItem("debt-manager-pro:notified") || "{}");
  } catch {
    sent = {};
  }
  let changed = false;

  for (const loan of loans) {
    if (loanStatus(loan, payments) === "achitat") continue;
    const d = daysUntil(loan.dueDate);
    let msg: string | null = null;
    if (d === 1) msg = "Mâine expiră termenul";
    else if (d === 0) msg = "Astăzi expiră termenul";
    else if (d < 0) {
      const late = -d;
      if ([3, 7, 30].includes(late) || late === 1) msg = `Întârziere ${late} zile`;
    }
    if (!msg) continue;
    if (sent[loan.id] === today) continue; // already notified today

    const person = people.find((p) => p.id === loan.personId);
    const name = person ? personFullName(person) : "Necunoscut";
    const rem = formatMoney(loanRemaining(loan, payments), loan.currency);
    await show(msg, `${name} — ${rem}`, "due-" + loan.id, `/imprumuturi/${loan.id}`);
    sent[loan.id] = today;
    changed = true;
  }

  if (changed) {
    try {
      localStorage.setItem("debt-manager-pro:notified", JSON.stringify(sent));
    } catch {
      /* ignore */
    }
  }
}
