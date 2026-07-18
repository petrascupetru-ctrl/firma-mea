"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { IconArrowLeft } from "../components/Icons";
import { StatusDot } from "../components/ui";
import {
  formatMoney,
  loanRemaining,
  loanStatus,
  personFullName,
} from "../lib/calc";
import { useStore } from "../lib/store";

const MONTHS_RO = [
  "Ianuarie", "Februarie", "Martie", "Aprilie", "Mai", "Iunie",
  "Iulie", "August", "Septembrie", "Octombrie", "Noiembrie", "Decembrie",
];
const DAYS_RO = ["Lun", "Mar", "Mie", "Joi", "Vin", "Sâm", "Dum"];

export default function CalendarPage() {
  const store = useStore();
  const [cursor, setCursor] = useState(() => {
    const n = new Date();
    return { y: n.getFullYear(), m: n.getMonth() };
  });
  const [selected, setSelected] = useState<string | null>(null);

  const dueByDay = useMemo(() => {
    const map = new Map<string, typeof store.loans>();
    for (const loan of store.loans) {
      if (loanRemaining(loan, store.payments) <= 0) continue;
      const key = loan.dueDate;
      const arr = map.get(key) ?? [];
      arr.push(loan);
      map.set(key, arr);
    }
    return map;
  }, [store.loans, store.payments]);

  const grid = useMemo(() => {
    const first = new Date(cursor.y, cursor.m, 1);
    const startDow = (first.getDay() + 6) % 7; // Monday-first
    const daysInMonth = new Date(cursor.y, cursor.m + 1, 0).getDate();
    const cells: (string | null)[] = [];
    for (let i = 0; i < startDow; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      const iso = `${cursor.y}-${String(cursor.m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      cells.push(iso);
    }
    return cells;
  }, [cursor]);

  const todayIso = new Date().toISOString().slice(0, 10);
  const selectedLoans = selected ? dueByDay.get(selected) ?? [] : [];

  const move = (delta: number) => {
    setCursor((c) => {
      const nm = c.m + delta;
      return { y: c.y + Math.floor(nm / 12), m: ((nm % 12) + 12) % 12 };
    });
    setSelected(null);
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold">Calendar scadențe</h1>
        <p className="text-sm" style={{ color: "var(--muted)" }}>Toate termenele de plată într-un singur loc.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <button className="btn btn-ghost btn-sm" onClick={() => move(-1)}>
              <IconArrowLeft width={16} height={16} />
            </button>
            <h2 className="font-bold text-lg">{MONTHS_RO[cursor.m]} {cursor.y}</h2>
            <button className="btn btn-ghost btn-sm" onClick={() => move(1)}>
              <IconArrowLeft width={16} height={16} style={{ transform: "rotate(180deg)" }} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-1">
            {DAYS_RO.map((d) => (
              <div key={d} className="text-center text-xs font-semibold py-1" style={{ color: "var(--muted)" }}>{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {grid.map((iso, i) => {
              if (!iso) return <div key={i} />;
              const day = parseInt(iso.slice(-2), 10);
              const loans = dueByDay.get(iso) ?? [];
              const isToday = iso === todayIso;
              const isSelected = iso === selected;
              return (
                <button
                  key={iso}
                  onClick={() => setSelected(iso)}
                  className="rounded-lg p-1.5 text-left transition-colors"
                  style={{
                    minHeight: 56,
                    border: isSelected ? "1px solid var(--brand)" : "1px solid var(--border)",
                    background: isToday ? "var(--brand-soft)" : loans.length ? "var(--surface-2)" : "transparent",
                  }}
                >
                  <span className="text-xs font-semibold" style={{ color: isToday ? "var(--brand-2)" : "var(--fg)" }}>{day}</span>
                  <div className="flex flex-wrap gap-0.5 mt-1">
                    {loans.slice(0, 4).map((l) => (
                      <StatusDot key={l.id} status={loanStatus(l, store.payments)} />
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="card p-5">
          <h2 className="font-bold mb-3">
            {selected ? new Date(selected).toLocaleDateString("ro-RO", { day: "numeric", month: "long" }) : "Selectează o zi"}
          </h2>
          {selected && selectedLoans.length === 0 && (
            <p className="text-sm" style={{ color: "var(--muted)" }}>Nicio scadență în această zi.</p>
          )}
          <div className="space-y-2">
            {selectedLoans.map((loan) => {
              const person = store.people.find((p) => p.id === loan.personId);
              return (
                <Link key={loan.id} href={`/imprumuturi/${loan.id}`} className="panel p-3 flex items-center justify-between hover:border-[var(--brand)]">
                  <div>
                    <p className="font-semibold text-sm">{person ? personFullName(person) : "—"}</p>
                    <p style={{ fontSize: "0.7rem", color: "var(--muted)" }}>{loan.reason || "Împrumut"}</p>
                  </div>
                  <span className="badge badge-warn">{formatMoney(loanRemaining(loan, store.payments), loan.currency)}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
