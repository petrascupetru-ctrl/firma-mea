"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { PaymentForm } from "../components/forms";
import { IconCash, IconPlus } from "../components/Icons";
import { ConfirmButton, EmptyState, Modal } from "../components/ui";
import {
  convert,
  formatDate,
  formatMoney,
  loanRemaining,
  personFullName,
} from "../lib/calc";
import { useStore } from "../lib/store";
import { PAYMENT_METHODS } from "../lib/types";

export default function PaymentsPage() {
  const store = useStore();
  const [addOpen, setAddOpen] = useState(false);
  const [loanId, setLoanId] = useState("");

  const rows = useMemo(
    () =>
      store.payments
        .map((p) => {
          const loan = store.loans.find((l) => l.id === p.loanId);
          const person = loan ? store.people.find((x) => x.id === loan.personId) : undefined;
          return { p, loan, person };
        })
        .sort((a, b) => (a.p.date < b.p.date ? 1 : -1)),
    [store.payments, store.loans, store.people],
  );

  const totalReceived = useMemo(() => {
    return store.payments.reduce((s, p) => {
      const loan = store.loans.find((l) => l.id === p.loanId);
      if (!loan) return s;
      return s + convert(p.amount, loan.currency, store.settings.baseCurrency, store.settings.rates);
    }, 0);
  }, [store.payments, store.loans, store.settings]);

  const activeLoans = store.loans.filter((l) => loanRemaining(l, store.payments) > 0);
  const selectedLoan = store.loans.find((l) => l.id === loanId);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold">Plăți</h1>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            Total încasat: <b style={{ color: "var(--ok)" }}>{formatMoney(totalReceived, store.settings.baseCurrency)}</b>
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            setLoanId(activeLoans[0]?.id ?? "");
            setAddOpen(true);
          }}
          disabled={activeLoans.length === 0}
        >
          <IconPlus width={16} height={16} /> Înregistrează plată
        </button>
      </div>

      {rows.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={<IconCash width={28} height={28} />}
            title="Nicio plată încă"
            subtitle="Înregistrează prima plată primită de la un datornic."
          />
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="tbl">
            <thead>
              <tr>
                <th>Data</th>
                <th>Persoană</th>
                <th>Sumă</th>
                <th>Metodă</th>
                <th>Notă</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ p, loan, person }) => (
                <tr key={p.id}>
                  <td>{formatDate(p.date)}</td>
                  <td>
                    {person ? (
                      <Link href={`/persoane/${person.id}`} className="link">{personFullName(person)}</Link>
                    ) : "—"}
                  </td>
                  <td className="font-semibold" style={{ color: "var(--ok)" }}>
                    + {formatMoney(p.amount, loan?.currency ?? store.settings.baseCurrency)}
                  </td>
                  <td>{PAYMENT_METHODS.find((m) => m.value === p.method)?.label}</td>
                  <td style={{ color: "var(--muted)" }}>{p.note || "—"}</td>
                  <td>
                    <ConfirmButton message="Ștergi această plată?" onConfirm={() => store.deletePayment(p.id)}>
                      Șterge
                    </ConfirmButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Înregistrează plată">
        <div className="space-y-4">
          <div>
            <label className="label">Împrumut</label>
            <select className="select" value={loanId} onChange={(e) => setLoanId(e.target.value)}>
              {activeLoans.map((l) => {
                const person = store.people.find((p) => p.id === l.personId);
                return (
                  <option key={l.id} value={l.id}>
                    {person ? personFullName(person) : "—"} · rest {formatMoney(loanRemaining(l, store.payments), l.currency)}
                  </option>
                );
              })}
            </select>
          </div>
          {selectedLoan && (
            <PaymentForm
              key={selectedLoan.id}
              loanId={selectedLoan.id}
              currency={selectedLoan.currency}
              suggested={loanRemaining(selectedLoan, store.payments)}
              onDone={() => setAddOpen(false)}
            />
          )}
        </div>
      </Modal>
    </div>
  );
}
