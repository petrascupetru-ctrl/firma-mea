"use client";

import { useMemo, useState } from "react";
import { LoanForm } from "../components/forms";
import { IconPlus, IconWallet } from "../components/Icons";
import { Avatar, EmptyState, Modal, StatusBadge } from "../components/ui";
import {
  convert,
  formatDate,
  formatMoney,
  loanRemaining,
  loanStatus,
  personFullName,
} from "../lib/calc";
import { useStore } from "../lib/store";
import type { LoanStatus } from "../lib/types";

type Filter =
  | "toate"
  | "restante"
  | "achitate"
  | "luna"
  | "an"
  | "peste1000";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "toate", label: "Toate" },
  { value: "restante", label: "Restante" },
  { value: "achitate", label: "Achitate" },
  { value: "luna", label: "Luna aceasta" },
  { value: "an", label: "Anul acesta" },
  { value: "peste1000", label: "Peste 1000" },
];

export default function LoansPage() {
  const store = useStore();
  const [showAdd, setShowAdd] = useState(false);
  const [filter, setFilter] = useState<Filter>("toate");
  const [personFilter, setPersonFilter] = useState("");
  const [q, setQ] = useState("");

  const loans = useMemo(() => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const yearStart = new Date(now.getFullYear(), 0, 1);
    const term = q.trim().toLowerCase();

    return store.loans
      .filter((l) => (personFilter ? l.personId === personFilter : true))
      .filter((l) => {
        const status: LoanStatus = loanStatus(l, store.payments);
        switch (filter) {
          case "restante":
            return status === "restanta";
          case "achitate":
            return status === "achitat";
          case "luna":
            return new Date(l.date) >= monthStart;
          case "an":
            return new Date(l.date) >= yearStart;
          case "peste1000":
            return (
              convert(l.amount, l.currency, store.settings.baseCurrency, store.settings.rates) >
              1000
            );
          default:
            return true;
        }
      })
      .filter((l) => {
        if (!term) return true;
        const person = store.people.find((p) => p.id === l.personId);
        return (
          String(l.amount).includes(term) ||
          (l.reason ?? "").toLowerCase().includes(term) ||
          (person ? personFullName(person).toLowerCase().includes(term) : false)
        );
      })
      .sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [store.loans, store.payments, store.people, filter, personFilter, q, store.settings]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold">Împrumuturi</h1>
          <p className="text-sm" style={{ color: "var(--muted)" }}>{loans.length} rezultate</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
          <IconPlus width={16} height={16} /> Împrumut nou
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            className={`btn btn-sm ${filter === f.value ? "btn-primary" : "btn-ghost"}`}
            onClick={() => setFilter(f.value)}
          >
            {f.label}
          </button>
        ))}
        <select className="select max-w-[200px]" value={personFilter} onChange={(e) => setPersonFilter(e.target.value)}>
          <option value="">După persoană</option>
          {store.people.map((p) => (
            <option key={p.id} value={p.id}>{personFullName(p)}</option>
          ))}
        </select>
        <input className="input max-w-[200px]" placeholder="Caută…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      {loans.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={<IconWallet width={28} height={28} />}
            title="Niciun împrumut"
            subtitle="Adaugă un împrumut nou sau ajustează filtrele."
            action={
              <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
                <IconPlus width={16} height={16} /> Împrumut nou
              </button>
            }
          />
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="tbl">
            <thead>
              <tr>
                <th>Persoană</th>
                <th>Sumă</th>
                <th>Rest</th>
                <th>Scadență</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loans.map((loan) => {
                const person = store.people.find((p) => p.id === loan.personId);
                return (
                  <tr
                    key={loan.id}
                    className="cursor-pointer"
                    onClick={() => (window.location.href = `/imprumuturi/${loan.id}`)}
                  >
                    <td>
                      <div className="flex items-center gap-2.5">
                        {person && <Avatar person={person} size={32} />}
                        <div className="min-w-0">
                          <p className="font-semibold truncate">{person ? personFullName(person) : "—"}</p>
                          <p style={{ fontSize: "0.7rem", color: "var(--muted)" }}>{loan.reason || "Împrumut"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="font-semibold">{formatMoney(loan.amount, loan.currency)}</td>
                    <td>{formatMoney(loanRemaining(loan, store.payments), loan.currency)}</td>
                    <td>{formatDate(loan.dueDate)}</td>
                    <td><StatusBadge loan={loan} payments={store.payments} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Împrumut nou" wide>
        <LoanForm onDone={() => setShowAdd(false)} />
      </Modal>
    </div>
  );
}
