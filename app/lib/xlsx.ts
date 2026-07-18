import * as XLSX from "xlsx";
import {
  formatDate,
  loanPaid,
  loanRemaining,
  loanStatus,
  personFullName,
  STATUS_META,
} from "./calc";
import type { AppState } from "./types";
import { PAYMENT_METHODS } from "./types";

// Build and download a multi-sheet .xlsx workbook from the app state.
export function exportXlsx(state: AppState) {
  const method = (m: string) => PAYMENT_METHODS.find((x) => x.value === m)?.label ?? m;

  const people = state.people.map((p) => ({
    Nume: personFullName(p),
    Telefon: p.phone ?? "",
    Email: p.email ?? "",
    Adresă: p.address ?? "",
    Etichete: p.labels.join(", "),
    Arhivat: p.archived ? "Da" : "Nu",
  }));

  const loans = state.loans.map((l) => {
    const person = state.people.find((p) => p.id === l.personId);
    return {
      Persoană: person ? personFullName(person) : "",
      Sumă: l.amount,
      Monedă: l.currency,
      Data: formatDate(l.date),
      Scadență: formatDate(l.dueDate),
      "Dobândă%": l.interestRate,
      Achitat: loanPaid(l, state.payments),
      Rest: loanRemaining(l, state.payments),
      Status: STATUS_META[loanStatus(l, state.payments)].label,
      Metodă: method(l.method),
      Motiv: l.reason ?? "",
    };
  });

  const payments = state.payments.map((pay) => {
    const loan = state.loans.find((l) => l.id === pay.loanId);
    const person = loan ? state.people.find((p) => p.id === loan.personId) : undefined;
    return {
      Data: formatDate(pay.date),
      Persoană: person ? personFullName(person) : "",
      Sumă: pay.amount,
      Monedă: loan?.currency ?? "",
      Metodă: method(pay.method),
      Notă: pay.note ?? "",
    };
  });

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(people), "Persoane");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(loans), "Împrumuturi");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(payments), "Plăți");
  XLSX.writeFile(wb, "debt-manager-pro.xlsx");
}
