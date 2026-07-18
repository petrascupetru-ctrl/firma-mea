"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { BarChart, Donut, LineChart, type Point } from "./components/Charts";
import { LoanForm } from "./components/forms";
import {
  IconArchive,
  IconCash,
  IconPlus,
  IconTrend,
  IconUsers,
  IconWallet,
} from "./components/Icons";
import { Avatar, Modal, StatusBadge } from "./components/ui";
import {
  convert,
  daysUntil,
  DUE_SOON_DAYS,
  formatDate,
  formatMoney,
  loanRemaining,
  loanStatus,
  outstandingInBase,
  personFullName,
} from "./lib/calc";
import { useStore } from "./lib/store";

const MONTHS_RO = ["Ian", "Feb", "Mar", "Apr", "Mai", "Iun", "Iul", "Aug", "Sep", "Oct", "Noi", "Dec"];

function StatCard({
  label,
  value,
  icon,
  tone = "brand",
  hint,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  tone?: "brand" | "ok" | "warn" | "danger";
  hint?: string;
}) {
  const bg = `var(--${tone === "brand" ? "brand" : tone}-soft)`;
  const fg = `var(--${tone === "brand" ? "brand-2" : tone})`;
  return (
    <div className="card p-5 animate-in">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium" style={{ color: "var(--muted)" }}>{label}</p>
          <p className="stat-value mt-2">{value}</p>
          {hint && <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>{hint}</p>}
        </div>
        <div className="flex items-center justify-center rounded-xl" style={{ width: 44, height: 44, background: bg, color: fg }}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const store = useStore();
  const { settings } = store;
  const [showLoan, setShowLoan] = useState(false);

  const stats = useMemo(() => {
    const now = new Date();
    const base = settings.baseCurrency;
    const activeLoans = store.loans;

    const totalOutstanding = outstandingInBase(activeLoans, store.payments, settings);

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    let receivedThisMonth = 0;
    let receivedTotal = 0;
    for (const pay of store.payments) {
      const loan = store.loans.find((l) => l.id === pay.loanId);
      if (!loan) continue;
      const inBase = convert(pay.amount, loan.currency, base, settings.rates);
      receivedTotal += inBase;
      if (new Date(pay.date) >= monthStart) receivedThisMonth += inBase;
    }

    let overdue = 0;
    let overdueCount = 0;
    let dueSoon: typeof store.loans = [];
    for (const loan of activeLoans) {
      const status = loanStatus(loan, store.payments, now);
      const rem = loanRemaining(loan, store.payments);
      if (status === "restanta") {
        overdue += convert(rem, loan.currency, base, settings.rates);
        overdueCount++;
      }
      const d = daysUntil(loan.dueDate, now);
      if (status !== "achitat" && d >= 0 && d <= DUE_SOON_DAYS) dueSoon.push(loan);
    }
    dueSoon = dueSoon.sort((a, b) => daysUntil(a.dueDate) - daysUntil(b.dueDate));

    const activePeople = store.people.filter((p) => !p.archived).length;

    return {
      totalOutstanding,
      receivedThisMonth,
      receivedTotal,
      overdue,
      overdueCount,
      dueSoon,
      activePeople,
    };
  }, [store.loans, store.payments, store.people, settings]);

  const topDebts = useMemo(() => {
    return store.loans
      .map((l) => ({ loan: l, rem: loanRemaining(l, store.payments) }))
      .filter((x) => x.rem > 0)
      .sort(
        (a, b) =>
          convert(b.rem, b.loan.currency, settings.baseCurrency, settings.rates) -
          convert(a.rem, a.loan.currency, settings.baseCurrency, settings.rates),
      )
      .slice(0, 5);
  }, [store.loans, store.payments, settings]);

  const series = useMemo(() => {
    const now = new Date();
    const loansSeries: Point[] = [];
    const receivedSeries: Point[] = [];
    const cumulativeSeries: Point[] = [];
    let cumulative = 0;
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const next = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const label = MONTHS_RO[d.getMonth()];
      let loaned = 0;
      for (const loan of store.loans) {
        const ld = new Date(loan.date);
        if (ld >= d && ld < next)
          loaned += convert(loan.amount, loan.currency, settings.baseCurrency, settings.rates);
      }
      let received = 0;
      for (const pay of store.payments) {
        const pd = new Date(pay.date);
        if (pd >= d && pd < next) {
          const loan = store.loans.find((l) => l.id === pay.loanId);
          if (loan) received += convert(pay.amount, loan.currency, settings.baseCurrency, settings.rates);
        }
      }
      cumulative += received;
      loansSeries.push({ label, value: Math.round(loaned) });
      receivedSeries.push({ label, value: Math.round(received) });
      cumulativeSeries.push({ label, value: Math.round(cumulative) });
    }
    return { loansSeries, receivedSeries, cumulativeSeries };
  }, [store.loans, store.payments, settings]);

  const statusCounts = useMemo(() => {
    let ok = 0, warn = 0, danger = 0, activ = 0;
    for (const l of store.loans) {
      const s = loanStatus(l, store.payments);
      if (s === "achitat") ok++;
      else if (s === "aproape") warn++;
      else if (s === "restanta") danger++;
      else activ++;
    }
    return { ok, warn, danger, activ };
  }, [store.loans, store.payments]);

  const recent = store.audit.slice(0, 8);
  const base = settings.baseCurrency;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold">Dashboard</h1>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            Privire de ansamblu asupra banilor împrumutați.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowLoan(true)}>
          <IconPlus width={16} height={16} /> Împrumut nou
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total de recuperat" value={formatMoney(stats.totalOutstanding, base)} icon={<IconWallet />} tone="brand" />
        <StatCard label="Persoane" value={String(stats.activePeople)} icon={<IconUsers />} tone="ok" hint={`${store.loans.length} împrumuturi`} />
        <StatCard label="Încasat luna aceasta" value={formatMoney(stats.receivedThisMonth, base)} icon={<IconCash />} tone="ok" />
        <StatCard label="Total restanțe" value={formatMoney(stats.overdue, base)} icon={<IconArchive />} tone="danger" hint={`${stats.overdueCount} împrumuturi întârziate`} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold">Împrumuturi vs. Recuperări (6 luni)</h2>
            <div className="flex items-center gap-4 text-xs" style={{ color: "var(--muted)" }}>
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-3 h-3 rounded" style={{ background: "var(--brand)" }} /> Împrumutat
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-3 h-3 rounded" style={{ background: "var(--ok)" }} /> Recuperat
              </span>
            </div>
          </div>
          <BarChart data={series.loansSeries} secondary={series.receivedSeries} height={220} />
        </div>
        <div className="card p-5">
          <h2 className="font-bold mb-4">Status datorii</h2>
          <Donut
            segments={[
              { value: statusCounts.ok, color: "var(--ok)", label: "Achitat" },
              { value: statusCounts.warn, color: "var(--warn)", label: "Aproape" },
              { value: statusCounts.danger, color: "var(--danger)", label: "Restanță" },
              { value: statusCounts.activ, color: "var(--muted)", label: "Activ" },
            ]}
          />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <IconTrend width={18} height={18} />
            <h2 className="font-bold">Evoluția încasărilor (cumulat)</h2>
          </div>
          <LineChart data={series.cumulativeSeries} color="var(--ok)" height={200} />
        </div>
        <div className="card p-5">
          <h2 className="font-bold mb-3">Scadențe în 7 zile</h2>
          {stats.dueSoon.length === 0 ? (
            <p className="text-sm" style={{ color: "var(--muted)" }}>Nicio scadență apropiată.</p>
          ) : (
            <div className="space-y-2">
              {stats.dueSoon.slice(0, 6).map((loan) => {
                const person = store.people.find((p) => p.id === loan.personId);
                const d = daysUntil(loan.dueDate);
                return (
                  <Link key={loan.id} href={`/imprumuturi/${loan.id}`} className="flex items-center justify-between rounded-xl px-3 py-2 hover:bg-[var(--surface-2)]">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{person ? personFullName(person) : "—"}</p>
                      <p style={{ fontSize: "0.72rem", color: "var(--muted)" }}>{d === 0 ? "Scadent azi" : `În ${d} zile`}</p>
                    </div>
                    <span className="badge badge-warn">{formatMoney(loanRemaining(loan, store.payments), loan.currency)}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold">Cele mai mari datorii</h2>
            <Link href="/imprumuturi" className="link text-sm">Vezi toate</Link>
          </div>
          {topDebts.length === 0 ? (
            <p className="text-sm" style={{ color: "var(--muted)" }}>Nicio datorie activă.</p>
          ) : (
            <div className="space-y-2">
              {topDebts.map(({ loan, rem }) => {
                const person = store.people.find((p) => p.id === loan.personId);
                return (
                  <Link key={loan.id} href={`/imprumuturi/${loan.id}`} className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-[var(--surface-2)]">
                    {person && <Avatar person={person} size={38} />}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold truncate">{person ? personFullName(person) : "—"}</p>
                      <p style={{ fontSize: "0.72rem", color: "var(--muted)" }}>{loan.reason || "Împrumut"} · scadent {formatDate(loan.dueDate)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm">{formatMoney(rem, loan.currency)}</p>
                      <StatusBadge loan={loan} payments={store.payments} />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        <div className="card p-5">
          <h2 className="font-bold mb-3">Ultimele activități</h2>
          <div className="space-y-3">
            {recent.map((a) => (
              <div key={a.id} className="flex gap-3">
                <span className="mt-1.5 inline-block rounded-full flex-shrink-0" style={{ width: 8, height: 8, background: "var(--brand)" }} />
                <div>
                  <p className="text-sm">{a.description}</p>
                  <p style={{ fontSize: "0.68rem", color: "var(--muted)" }}>{new Date(a.timestamp).toLocaleString("ro-RO")}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Modal open={showLoan} onClose={() => setShowLoan(false)} title="Împrumut nou">
        <LoanForm onDone={() => setShowLoan(false)} />
      </Modal>
    </div>
  );
}
