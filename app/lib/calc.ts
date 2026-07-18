import type {
  Currency,
  Loan,
  LoanStatus,
  Payment,
  Person,
  Settings,
} from "./types";

// Default anchor rates: value of 1 unit expressed in RON.
export const DEFAULT_RATES: Record<Currency, number> = {
  RON: 1,
  EUR: 4.97,
  USD: 4.55,
  GBP: 5.85,
  CHF: 5.3,
};

const CURRENCY_SYMBOL: Record<Currency, string> = {
  RON: "lei",
  EUR: "€",
  USD: "$",
  GBP: "£",
  CHF: "CHF",
};

export function formatMoney(amount: number, currency: Currency): string {
  const rounded = Math.round(amount * 100) / 100;
  const num = new Intl.NumberFormat("ro-RO", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(rounded);
  const sym = CURRENCY_SYMBOL[currency];
  return currency === "RON" || currency === "CHF"
    ? `${num} ${sym}`
    : `${sym}${num}`;
}

// Convert an amount from one currency to another using anchor rates (in RON).
export function convert(
  amount: number,
  from: Currency,
  to: Currency,
  rates: Record<Currency, number>,
): number {
  const inRon = amount * (rates[from] ?? 1);
  return inRon / (rates[to] ?? 1);
}

export function loanInterest(loan: Loan): number {
  return (loan.amount * (loan.interestRate || 0)) / 100;
}

export function loanTotal(loan: Loan): number {
  return loan.amount + loanInterest(loan);
}

export function loanPaid(loan: Loan, payments: Payment[]): number {
  return payments
    .filter((p) => p.loanId === loan.id)
    .reduce((s, p) => s + p.amount, 0);
}

export function loanRemaining(loan: Loan, payments: Payment[]): number {
  const rem = loanTotal(loan) - loanPaid(loan, payments);
  return Math.max(0, Math.round(rem * 100) / 100);
}

export function daysUntil(dateISO: string, now = new Date()): number {
  const d = new Date(dateISO);
  const a = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
  const b = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((a - b) / 86400000);
}

export const DUE_SOON_DAYS = 7;

export function loanStatus(
  loan: Loan,
  payments: Payment[],
  now = new Date(),
): LoanStatus {
  const remaining = loanRemaining(loan, payments);
  if (remaining <= 0) return "achitat";
  const d = daysUntil(loan.dueDate, now);
  if (d < 0) return "restanta";
  if (d <= DUE_SOON_DAYS) return "aproape";
  return "activ";
}

export const STATUS_META: Record<
  LoanStatus,
  { label: string; color: string; dot: string; badge: string }
> = {
  achitat: {
    label: "Achitat",
    color: "var(--ok)",
    dot: "🟢",
    badge: "badge-ok",
  },
  aproape: {
    label: "Aproape de scadență",
    color: "var(--warn)",
    dot: "🟡",
    badge: "badge-warn",
  },
  restanta: {
    label: "Restanță",
    color: "var(--danger)",
    dot: "🔴",
    badge: "badge-danger",
  },
  activ: {
    label: "Activ",
    color: "var(--muted)",
    dot: "⚪",
    badge: "badge-neutral",
  },
};

export function personFullName(p: Person): string {
  const base = `${p.firstName} ${p.lastName}`.trim();
  return p.nickname ? `${base} „${p.nickname}”` : base;
}

export function personInitials(p: Person): string {
  return `${p.firstName?.[0] ?? ""}${p.lastName?.[0] ?? ""}`.toUpperCase();
}

// Aggregate outstanding for a set of loans, converted to base currency.
export function outstandingInBase(
  loans: Loan[],
  payments: Payment[],
  settings: Settings,
): number {
  return loans.reduce((sum, loan) => {
    const rem = loanRemaining(loan, payments);
    return (
      sum + convert(rem, loan.currency, settings.baseCurrency, settings.rates)
    );
  }, 0);
}

export function formatDate(dateISO: string): string {
  if (!dateISO) return "—";
  const d = new Date(dateISO);
  return new Intl.DateTimeFormat("ro-RO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}

export function formatDateLong(dateISO: string): string {
  if (!dateISO) return "—";
  const d = new Date(dateISO);
  return new Intl.DateTimeFormat("ro-RO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function uid(): string {
  return (
    Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
  );
}
