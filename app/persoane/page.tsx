"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { PersonForm } from "../components/forms";
import { IconArchive, IconPlus, IconUsers } from "../components/Icons";
import { Avatar, EmptyState, Modal } from "../components/ui";
import {
  convert,
  formatMoney,
  loanRemaining,
  personFullName,
} from "../lib/calc";
import { useStore } from "../lib/store";

export default function PeoplePage() {
  const store = useStore();
  const [showAdd, setShowAdd] = useState(false);
  const [q, setQ] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [labelFilter, setLabelFilter] = useState<string>("");

  const allLabels = useMemo(() => {
    const set = new Set<string>();
    store.people.forEach((p) => p.labels.forEach((l) => set.add(l)));
    return Array.from(set);
  }, [store.people]);

  const people = useMemo(() => {
    const term = q.trim().toLowerCase();
    return store.people
      .filter((p) => p.archived === showArchived)
      .filter((p) => (labelFilter ? p.labels.includes(labelFilter) : true))
      .filter((p) =>
        term
          ? personFullName(p).toLowerCase().includes(term) ||
            (p.phone ?? "").includes(term) ||
            (p.email ?? "").toLowerCase().includes(term)
          : true,
      );
  }, [store.people, q, showArchived, labelFilter]);

  const personOutstanding = (personId: string) => {
    const loans = store.loans.filter((l) => l.personId === personId);
    return loans.reduce(
      (s, l) =>
        s +
        convert(
          loanRemaining(l, store.payments),
          l.currency,
          store.settings.baseCurrency,
          store.settings.rates,
        ),
      0,
    );
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold">Persoane</h1>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            {store.people.filter((p) => !p.archived).length} active ·{" "}
            {store.people.filter((p) => p.archived).length} arhivate
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
          <IconPlus width={16} height={16} /> Adaugă persoană
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <input
          className="input max-w-xs"
          placeholder="Caută după nume, telefon, email…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select className="select max-w-[180px]" value={labelFilter} onChange={(e) => setLabelFilter(e.target.value)}>
          <option value="">Toate etichetele</option>
          {allLabels.map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
        <button
          className={`btn btn-sm ${showArchived ? "btn-primary" : "btn-ghost"}`}
          onClick={() => setShowArchived((v) => !v)}
        >
          <IconArchive width={15} height={15} /> {showArchived ? "Arhivate" : "Active"}
        </button>
      </div>

      {people.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={<IconUsers width={28} height={28} />}
            title={showArchived ? "Nicio persoană arhivată" : "Nicio persoană"}
            subtitle="Adaugă prima persoană căreia i-ai împrumutat bani."
            action={
              !showArchived ? (
                <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
                  <IconPlus width={16} height={16} /> Adaugă persoană
                </button>
              ) : undefined
            }
          />
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {people.map((p) => {
            const outstanding = personOutstanding(p.id);
            const loanCount = store.loans.filter((l) => l.personId === p.id).length;
            return (
              <Link key={p.id} href={`/persoane/${p.id}`} className="card p-4 hover:border-[var(--brand)] transition-colors animate-in">
                <div className="flex items-center gap-3">
                  <Avatar person={p} size={48} />
                  <div className="min-w-0 flex-1">
                    <p className="font-bold truncate">{personFullName(p)}</p>
                    <p className="text-sm truncate" style={{ color: "var(--muted)" }}>
                      {p.phone || p.email || "—"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <div>
                    <p style={{ fontSize: "0.68rem", color: "var(--muted)" }}>De recuperat</p>
                    <p className="font-bold" style={{ color: outstanding > 0 ? "var(--danger)" : "var(--ok)" }}>
                      {formatMoney(outstanding, store.settings.baseCurrency)}
                    </p>
                  </div>
                  <span className="chip">{loanCount} împrumut{loanCount === 1 ? "" : "uri"}</span>
                </div>
                {p.labels.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {p.labels.map((l) => (
                      <span key={l} className="chip">{l}</span>
                    ))}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Adaugă persoană">
        <PersonForm onDone={() => setShowAdd(false)} />
      </Modal>
    </div>
  );
}
