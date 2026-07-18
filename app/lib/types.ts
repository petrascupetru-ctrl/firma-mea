// Core domain types for Debt Manager Pro

export type Currency = "RON" | "EUR" | "USD" | "GBP" | "CHF";

export const CURRENCIES: Currency[] = ["RON", "EUR", "USD", "GBP", "CHF"];

export type PaymentMethod =
  | "numerar"
  | "transfer"
  | "revolut"
  | "card"
  | "altceva";

export const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "numerar", label: "Numerar" },
  { value: "transfer", label: "Transfer bancar" },
  { value: "revolut", label: "Revolut" },
  { value: "card", label: "Card" },
  { value: "altceva", label: "Altceva" },
];

export type LoanStatus = "achitat" | "aproape" | "restanta" | "activ";

export interface Person {
  id: string;
  photo?: string; // data URL
  firstName: string;
  lastName: string;
  nickname?: string;
  phone?: string;
  email?: string;
  address?: string;
  cnp?: string;
  notes?: string;
  labels: string[];
  archived: boolean;
  createdAt: string;
}

export interface Attachment {
  id: string;
  name: string;
  type: string; // mime
  dataUrl: string;
  addedAt: string;
}

export interface Loan {
  id: string;
  personId: string;
  amount: number;
  currency: Currency;
  date: string; // ISO date of loan
  dueDate: string; // ISO date of due
  interestRate: number; // percent, flat over the loan
  reason?: string;
  method: PaymentMethod;
  contractPhoto?: string; // data URL
  documents: Attachment[];
  signature?: string; // data URL (canvas signature)
  location?: string;
  notes?: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  loanId: string;
  amount: number;
  date: string; // ISO date
  method: PaymentMethod;
  note?: string;
  createdAt: string;
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  action: "create" | "update" | "delete" | "payment" | "archive" | "restore";
  entity: "person" | "loan" | "payment" | "settings";
  description: string;
}

export interface Settings {
  theme: "dark" | "light";
  baseCurrency: Currency;
  // exchange rates: units of currency per 1 base unit is complex;
  // we store value of 1 unit of currency in base currency (RON default anchor).
  rates: Record<Currency, number>; // value of 1 unit in RON
}

export interface AppState {
  people: Person[];
  loans: Loan[];
  payments: Payment[];
  audit: AuditEntry[];
  settings: Settings;
}
