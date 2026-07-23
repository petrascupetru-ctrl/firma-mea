// Builds the compact JSON snapshot sent to the AI assistant.
// Deliberately excludes photos, documents, signatures and CNP — only the
// text/number fields the assistant needs to answer questions.
import { loanPaid, loanRemaining, loanStatus } from "./calc";
import type { Loan, Payment, Person, Settings } from "./types";

export function buildAiSnapshot(
  people: Person[],
  loans: Loan[],
  payments: Payment[],
  settings: Settings,
) {
  return {
    baseCurrency: settings.baseCurrency,
    rates: settings.rates,
    people: people.map((p) => ({
      id: p.id,
      nume: `${p.firstName} ${p.lastName}`.trim(),
      porecla: p.nickname || undefined,
      telefon: p.phone || undefined,
      email: p.email || undefined,
      etichete: p.labels.length ? p.labels : undefined,
      observatii: p.notes || undefined,
      arhivat: p.archived || undefined,
    })),
    imprumuturi: loans.map((l) => ({
      id: l.id,
      personId: l.personId,
      suma: l.amount,
      moneda: l.currency,
      data: l.date,
      scadenta: l.dueDate,
      dobandaProcent: l.interestRate || undefined,
      motiv: l.reason || undefined,
      achitat: loanPaid(l, payments),
      rest: loanRemaining(l, payments),
      status: loanStatus(l, payments),
    })),
    plati: payments.map((p) => ({
      loanId: p.loanId,
      suma: p.amount,
      data: p.date,
      nota: p.note || undefined,
    })),
  };
}
