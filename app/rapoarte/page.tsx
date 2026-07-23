"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { BarChart, type Point } from "../components/Charts";
import { IconDownload } from "../components/Icons";
import { Avatar } from "../components/ui";
import {
  convert,
  formatMoney,
  loanPaid,
  loanRemaining,
  loanTotal,
  personFullName,
} from "../lib/calc";
import { useStore } from "../lib/store";
import { exportXlsx } from "../lib/xlsx";

const MONTHS_RO = ["Ian", "Feb", "Mar", "Apr", "Mai", "Iun", "Iul", "Aug", "Sep", "Oct", "Noi", "Dec"];

function download(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ReportsPage() {
  const store = useStore();
  const base = store.settings.baseCurrency;
  const [year, setYear] = useState(new Date().getFullYear());

  const years = useMemo(() => {
    const set = new Set<number>();
    store.loans.forEach((l) => set.add(new Date(l.date).getFullYear()));
    store.payments.forEach((p) => set.add(new Date(p.date).getFullYear()));
    set.add(new Date().getFullYear());
    return Array.from(set).sort((a, b) => b - a);
  }, [store.loans, store.payments]);

  const totals = useMemo(() => {
    let lent = 0, recovered = 0, outstanding = 0;
    for (const l of store.loans) {
      lent += convert(loanTotal(l), l.currency, base, store.settings.rates);
      recovered += convert(loanPaid(l, store.payments), l.currency, base, store.settings.rates);
      outstanding += convert(loanRemaining(l, store.payments), l.currency, base, store.settings.rates);
    }
    return { lent, recovered, outstanding };
  }, [store.loans, store.payments, base, store.settings.rates]);

  // monthly recovered for selected year
  const monthly = useMemo<{ loaned: Point[]; recovered: Point[] }>(() => {
    const loaned: Point[] = [];
    const recovered: Point[] = [];
    for (let m = 0; m < 12; m++) {
      let lo = 0, re = 0;
      for (const l of store.loans) {
        const d = new Date(l.date);
        if (d.getFullYear() === year && d.getMonth() === m)
          lo += convert(l.amount, l.currency, base, store.settings.rates);
      }
      for (const p of store.payments) {
        const d = new Date(p.date);
        if (d.getFullYear() === year && d.getMonth() === m) {
          const loan = store.loans.find((l) => l.id === p.loanId);
          if (loan) re += convert(p.amount, loan.currency, base, store.settings.rates);
        }
      }
      loaned.push({ label: MONTHS_RO[m], value: Math.round(lo) });
      recovered.push({ label: MONTHS_RO[m], value: Math.round(re) });
    }
    return { loaned, recovered };
  }, [store.loans, store.payments, year, base, store.settings.rates]);

  const topDebtors = useMemo(() => {
    const map = new Map<string, number>();
    for (const l of store.loans) {
      const rem = convert(loanRemaining(l, store.payments), l.currency, base, store.settings.rates);
      if (rem <= 0) continue;
      map.set(l.personId, (map.get(l.personId) ?? 0) + rem);
    }
    return Array.from(map.entries())
      .map(([personId, amount]) => ({ person: store.people.find((p) => p.id === personId), amount }))
      .filter((x) => x.person)
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 8);
  }, [store.loans, store.payments, store.people, base, store.settings.rates]);

  const exportCSV = () => {
    const header = ["Persoana", "Suma", "Moneda", "Data", "Scadenta", "Dobanda%", "Achitat", "Rest", "Motiv"];
    const lines = store.loans.map((l) => {
      const person = store.people.find((p) => p.id === l.personId);
      return [
        person ? personFullName(person) : "",
        l.amount,
        l.currency,
        l.date,
        l.dueDate,
        l.interestRate,
        loanPaid(l, store.payments),
        loanRemaining(l, store.payments),
        (l.reason ?? "").replace(/[,\n]/g, " "),
      ].join(",");
    });
    download("imprumuturi.csv", [header.join(","), ...lines].join("\n"), "text/csv");
  };

  const exportJSON = () => {
    download("debt-manager-backup.json", store.exportState(), "application/json");
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold">Rapoarte</h1>
          <p className="text-sm" style={{ color: "var(--muted)" }}>Sinteză lunară și anuală.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="btn btn-ghost btn-sm" onClick={exportCSV}><IconDownload width={15} height={15} /> CSV</button>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() =>
              exportXlsx({
                people: store.people,
                loans: store.loans,
                payments: store.payments,
                audit: store.audit,
                settings: store.settings,
              })
            }
          >
            <IconDownload width={15} height={15} /> Excel
          </button>
          <button className="btn btn-ghost btn-sm" onClick={exportJSON}><IconDownload width={15} height={15} /> JSON</button>
          <button className="btn btn-ghost btn-sm" onClick={() => window.print()}><IconDownload width={15} height={15} /> PDF</button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card p-5">
          <p className="text-sm" style={{ color: "var(--muted)" }}>Total împrumutat</p>
          <p className="stat-value mt-2">{formatMoney(totals.lent, base)}</p>
        </div>
        <div className="card p-5">
          <p className="text-sm" style={{ color: "var(--muted)" }}>Total recuperat</p>
          <p className="stat-value mt-2" style={{ color: "var(--ok)" }}>{formatMoney(totals.recovered, base)}</p>
        </div>
        <div className="card p-5">
          <p className="text-sm" style={{ color: "var(--muted)" }}>Total restant</p>
          <p className="stat-value mt-2" style={{ color: "var(--danger)" }}>{formatMoney(totals.outstanding, base)}</p>
        </div>
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold">Raport anual {year}</h2>
          <select className="select max-w-[120px]" value={year} onChange={(e) => setYear(parseInt(e.target.value))}>
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-4 text-xs mb-3" style={{ color: "var(--muted)" }}>
          <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-3 rounded" style={{ background: "var(--brand)" }} /> Împrumutat</span>
          <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-3 rounded" style={{ background: "var(--ok)" }} /> Recuperat</span>
        </div>
        <BarChart data={monthly.loaned} secondary={monthly.recovered} height={240} />
      </div>

      <div className="card p-5">
        <h2 className="font-bold mb-3">Top datornici</h2>
        {topDebtors.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--muted)" }}>Niciun datornic activ. 🎉</p>
        ) : (
          <div className="space-y-2">
            {topDebtors.map(({ person, amount }, i) => (
              <Link key={person!.id} href={`/persoane/${person!.id}`} className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-[var(--surface-2)]">
                <span className="font-bold" style={{ width: 20, color: "var(--muted)" }}>{i + 1}</span>
                <Avatar person={person!} size={36} />
                <span className="flex-1 font-semibold truncate">{personFullName(person!)}</span>
                <span className="font-bold" style={{ color: "var(--danger)" }}>{formatMoney(amount, base)}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
