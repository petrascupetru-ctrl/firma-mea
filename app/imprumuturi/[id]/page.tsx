"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { LoanForm, PaymentForm } from "../../components/forms";
import {
  IconArrowLeft,
  IconCash,
  IconDoc,
  IconDownload,
  IconEdit,
  IconTrash,
} from "../../components/Icons";
import { ConfirmButton, Modal, StatusBadge } from "../../components/ui";
import {
  daysUntil,
  formatDate,
  formatDateLong,
  formatMoney,
  loanInterest,
  loanPaid,
  loanRemaining,
  loanStatus,
  loanTotal,
  personFullName,
} from "../../lib/calc";
import { useStore } from "../../lib/store";
import { PAYMENT_METHODS } from "../../lib/types";

export default function LoanDetail() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const store = useStore();
  const loan = store.loans.find((l) => l.id === params.id);

  const [payOpen, setPayOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [penaltyRate, setPenaltyRate] = useState("0.1"); // % per day late
  const [printMode, setPrintMode] = useState<"contract" | "receipt" | null>(null);

  const payments = useMemo(
    () =>
      loan
        ? store.payments
            .filter((p) => p.loanId === loan.id)
            .sort((a, b) => (a.date < b.date ? 1 : -1))
        : [],
    [store.payments, loan],
  );

  const person = loan ? store.people.find((p) => p.id === loan.personId) : undefined;

  if (!loan) {
    return (
      <div className="card p-10 text-center">
        <p className="font-bold">Împrumutul nu a fost găsit.</p>
        <Link href="/imprumuturi" className="link mt-3 inline-block">← Înapoi</Link>
      </div>
    );
  }

  const total = loanTotal(loan);
  const paid = loanPaid(loan, store.payments);
  const remaining = loanRemaining(loan, store.payments);
  const interest = loanInterest(loan);
  const status = loanStatus(loan, store.payments);
  const daysLate = Math.max(0, -daysUntil(loan.dueDate));
  const penalty =
    status === "restanta"
      ? (remaining * (parseFloat(penaltyRate) || 0) * daysLate) / 100
      : 0;
  const progress = total > 0 ? Math.min(100, (paid / total) * 100) : 0;
  const lastPayment = payments[0];

  const method = PAYMENT_METHODS.find((m) => m.value === loan.method)?.label ?? loan.method;

  const doPrint = (mode: "contract" | "receipt") => {
    setPrintMode(mode);
    setTimeout(() => {
      window.print();
    }, 100);
  };

  return (
    <div className="space-y-5">
      <div className="no-print space-y-5">
        <Link href="/imprumuturi" className="inline-flex items-center gap-1.5 text-sm" style={{ color: "var(--muted)" }}>
          <IconArrowLeft width={15} height={15} /> Împrumuturi
        </Link>

        {/* Header */}
        <div className="card p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-extrabold">{formatMoney(loan.amount, loan.currency)}</h1>
                <StatusBadge loan={loan} payments={store.payments} />
              </div>
              <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
                {loan.reason || "Împrumut"} · {person ? (
                  <Link href={`/persoane/${person.id}`} className="link">{personFullName(person)}</Link>
                ) : "—"}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {remaining > 0 && (
                <button className="btn btn-primary btn-sm" onClick={() => setPayOpen(true)}>
                  <IconCash width={15} height={15} /> Plată
                </button>
              )}
              <button className="btn btn-ghost btn-sm" onClick={() => setEditOpen(true)}>
                <IconEdit width={15} height={15} /> Editează
              </button>
              <ConfirmButton
                message="Ștergi acest împrumut și plățile aferente?"
                onConfirm={() => {
                  store.deleteLoan(loan.id);
                  router.push("/imprumuturi");
                }}
              >
                <IconTrash width={15} height={15} />
              </ConfirmButton>
            </div>
          </div>

          {/* Progress */}
          <div className="mt-5">
            <div className="flex justify-between text-sm mb-1.5">
              <span style={{ color: "var(--muted)" }}>Progres plată</span>
              <span className="font-semibold">{Math.round(progress)}%</span>
            </div>
            <div className="rounded-full overflow-hidden" style={{ height: 10, background: "var(--surface-2)" }}>
              <div style={{ width: `${progress}%`, height: "100%", background: "linear-gradient(90deg,var(--brand),var(--ok))", transition: "width .4s ease" }} />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
            <Field label="Împrumut" value={formatMoney(loan.amount, loan.currency)} />
            <Field label="Dobândă" value={interest > 0 ? formatMoney(interest, loan.currency) : "—"} sub={loan.interestRate > 0 ? `${loan.interestRate}%` : undefined} />
            <Field label="Total de plată" value={formatMoney(total, loan.currency)} />
            <Field label="Achitat" value={formatMoney(paid, loan.currency)} tone="ok" />
            <Field label="Rest de plată" value={formatMoney(remaining, loan.currency)} tone={remaining > 0 ? "danger" : "ok"} />
            <Field label="Data împrumutului" value={formatDate(loan.date)} />
            <Field label="Scadență" value={formatDate(loan.dueDate)} />
            <Field label="Metodă" value={method} />
          </div>

          {loan.location && (
            <p className="text-sm mt-3" style={{ color: "var(--muted)" }}>📍 {loan.location}</p>
          )}
          {loan.notes && <p className="text-sm mt-2">{loan.notes}</p>}
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {/* Payment history */}
          <div className="card p-5 lg:col-span-2">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold">Istoric plăți</h2>
              {remaining > 0 && (
                <button className="btn btn-ghost btn-sm" onClick={() => setPayOpen(true)}>
                  <IconCash width={14} height={14} /> Adaugă
                </button>
              )}
            </div>
            {payments.length === 0 ? (
              <p className="text-sm" style={{ color: "var(--muted)" }}>Nicio plată înregistrată.</p>
            ) : (
              <div className="space-y-2">
                {payments.map((p) => (
                  <div key={p.id} className="flex items-center justify-between panel p-3">
                    <div>
                      <p className="font-semibold" style={{ color: "var(--ok)" }}>+ {formatMoney(p.amount, loan.currency)}</p>
                      <p style={{ fontSize: "0.72rem", color: "var(--muted)" }}>
                        {formatDate(p.date)} · {PAYMENT_METHODS.find((m) => m.value === p.method)?.label}
                        {p.note ? ` · ${p.note}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="btn btn-ghost btn-sm" onClick={() => doPrint("receipt")} title="Chitanță">
                        <IconDoc width={14} height={14} />
                      </button>
                      <ConfirmButton message="Ștergi această plată?" onConfirm={() => store.deletePayment(p.id)}>
                        <IconTrash width={13} height={13} />
                      </ConfirmButton>
                    </div>
                  </div>
                ))}
                <div className="flex justify-between pt-2 text-sm font-semibold" style={{ borderTop: "1px solid var(--border)" }}>
                  <span>Rest de plată</span>
                  <span style={{ color: remaining > 0 ? "var(--danger)" : "var(--ok)" }}>{formatMoney(remaining, loan.currency)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Calculator + documents */}
          <div className="space-y-4">
            <div className="card p-5">
              <h2 className="font-bold mb-3">Calculator</h2>
              <div className="space-y-2 text-sm">
                <Row label="Rest de plată" value={formatMoney(remaining, loan.currency)} />
                <Row label="Dobândă" value={formatMoney(interest, loan.currency)} />
                <Row label="Zile întârziere" value={String(daysLate)} />
                <div>
                  <label className="label">Penalitate (%/zi)</label>
                  <input className="input" type="number" step="0.01" value={penaltyRate} onChange={(e) => setPenaltyRate(e.target.value)} />
                </div>
                <Row label="Penalități estimate" value={formatMoney(penalty, loan.currency)} tone="danger" />
                <div className="flex justify-between pt-2 font-bold" style={{ borderTop: "1px solid var(--border)" }}>
                  <span>Total cu penalități</span>
                  <span>{formatMoney(remaining + penalty, loan.currency)}</span>
                </div>
              </div>
            </div>

            <div className="card p-5">
              <h2 className="font-bold mb-3">Documente & PDF</h2>
              <div className="space-y-2">
                <button className="btn btn-ghost btn-sm w-full" onClick={() => doPrint("contract")}>
                  <IconDownload width={15} height={15} /> Generează contract PDF
                </button>
                <button className="btn btn-ghost btn-sm w-full" onClick={() => doPrint("receipt")} disabled={payments.length === 0}>
                  <IconDownload width={15} height={15} /> Generează chitanță PDF
                </button>
              </div>
              {loan.contractPhoto && (
                <div className="mt-3">
                  <p className="label">Poză contract</p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={loan.contractPhoto} alt="contract" style={{ borderRadius: 10, width: "100%" }} />
                </div>
              )}
              {loan.signature && (
                <div className="mt-3">
                  <p className="label">Semnătură</p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={loan.signature} alt="semnătură" style={{ borderRadius: 8, background: "#fff", padding: 4, maxHeight: 80 }} />
                </div>
              )}
              {loan.documents.length > 0 && (
                <div className="mt-3 space-y-1.5">
                  <p className="label">Fișiere atașate</p>
                  {loan.documents.map((d) => (
                    <a key={d.id} href={d.dataUrl} download={d.name} className="flex items-center gap-2 text-sm link">
                      <IconDoc width={14} height={14} /> {d.name}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Printable contract / receipt */}
      {printMode && (
        <div className="printable" style={{ color: "#111", background: "#fff", padding: 40 }}>
          {printMode === "contract" ? (
            <ContractDoc
              creditor="__________________"
              debtor={person ? personFullName(person) : "—"}
              amount={formatMoney(loan.amount, loan.currency)}
              date={formatDateLong(loan.date)}
              due={formatDateLong(loan.dueDate)}
              interest={loan.interestRate}
              reason={loan.reason}
              signature={loan.signature}
            />
          ) : (
            <ReceiptDoc
              debtor={person ? personFullName(person) : "—"}
              amount={formatMoney(lastPayment?.amount ?? 0, loan.currency)}
              date={lastPayment ? formatDateLong(lastPayment.date) : formatDateLong(new Date().toISOString())}
              remaining={formatMoney(remaining, loan.currency)}
              reason={loan.reason}
            />
          )}
          <div className="no-print mt-6 flex gap-2">
            <button className="btn btn-primary" onClick={() => window.print()}>Printează / Salvează PDF</button>
            <button className="btn btn-ghost" onClick={() => setPrintMode(null)}>Închide</button>
          </div>
        </div>
      )}

      <Modal open={payOpen} onClose={() => setPayOpen(false)} title="Înregistrează plată">
        <PaymentForm loanId={loan.id} currency={loan.currency} suggested={remaining} onDone={() => setPayOpen(false)} />
      </Modal>
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Editează împrumut" wide>
        <LoanForm loan={loan} onDone={() => setEditOpen(false)} />
      </Modal>
    </div>
  );
}

function Field({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone?: "ok" | "danger" }) {
  return (
    <div>
      <p style={{ fontSize: "0.68rem", color: "var(--muted)" }}>{label}</p>
      <p className="font-bold mt-0.5" style={{ color: tone ? `var(--${tone})` : undefined }}>{value}</p>
      {sub && <p style={{ fontSize: "0.66rem", color: "var(--muted)" }}>{sub}</p>}
    </div>
  );
}

function Row({ label, value, tone }: { label: string; value: string; tone?: "danger" }) {
  return (
    <div className="flex justify-between">
      <span style={{ color: "var(--muted)" }}>{label}</span>
      <span className="font-semibold" style={{ color: tone ? `var(--${tone})` : undefined }}>{value}</span>
    </div>
  );
}

function ContractDoc({ creditor, debtor, amount, date, due, interest, reason, signature }: {
  creditor: string; debtor: string; amount: string; date: string; due: string; interest: number; reason?: string; signature?: string;
}) {
  return (
    <div style={{ maxWidth: 700, margin: "0 auto", fontFamily: "Georgia, serif", lineHeight: 1.7 }}>
      <h1 style={{ textAlign: "center", fontSize: 22, marginBottom: 4 }}>CONTRACT DE ÎMPRUMUT</h1>
      <p style={{ textAlign: "center", color: "#666", marginBottom: 24 }}>încheiat astăzi, {date}</p>
      <p><b>Între:</b></p>
      <p>Împrumutător (creditor): {creditor}</p>
      <p>Împrumutat (debitor): <b>{debtor}</b></p>
      <p style={{ marginTop: 16 }}><b>Art. 1 — Obiectul contractului</b></p>
      <p>Împrumutătorul acordă debitorului suma de <b>{amount}</b>{reason ? `, având ca scop: ${reason}` : ""}.</p>
      <p style={{ marginTop: 12 }}><b>Art. 2 — Termen de restituire</b></p>
      <p>Suma va fi restituită integral până la data de <b>{due}</b>.</p>
      {interest > 0 && (
        <>
          <p style={{ marginTop: 12 }}><b>Art. 3 — Dobândă</b></p>
          <p>Împrumutul este purtător de o dobândă de <b>{interest}%</b>.</p>
        </>
      )}
      <p style={{ marginTop: 12 }}><b>Art. {interest > 0 ? 4 : 3} — Dispoziții finale</b></p>
      <p>Prezentul contract a fost încheiat în două exemplare, câte unul pentru fiecare parte.</p>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 48 }}>
        <div style={{ textAlign: "center" }}>
          <p>Împrumutător</p>
          <p style={{ marginTop: 40, borderTop: "1px solid #333", paddingTop: 4 }}>Semnătură</p>
        </div>
        <div style={{ textAlign: "center" }}>
          <p>Împrumutat</p>
          {signature ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={signature} alt="semnătură" style={{ height: 50, display: "block", margin: "0 auto" }} />
          ) : (
            <p style={{ marginTop: 40 }} />
          )}
          <p style={{ borderTop: "1px solid #333", paddingTop: 4, marginTop: signature ? 0 : 40 }}>Semnătură</p>
        </div>
      </div>
    </div>
  );
}

function ReceiptDoc({ debtor, amount, date, remaining, reason }: {
  debtor: string; amount: string; date: string; remaining: string; reason?: string;
}) {
  return (
    <div style={{ maxWidth: 560, margin: "0 auto", fontFamily: "Georgia, serif", lineHeight: 1.8 }}>
      <h1 style={{ textAlign: "center", fontSize: 22 }}>CHITANȚĂ</h1>
      <p style={{ textAlign: "center", color: "#666", marginBottom: 24 }}>emisă la data de {date}</p>
      <p>Am primit de la <b>{debtor}</b> suma de <b>{amount}</b>{reason ? `, reprezentând plată pentru: ${reason}` : ", reprezentând rambursare împrumut"}.</p>
      <p style={{ marginTop: 12 }}>Rest de plată rămas: <b>{remaining}</b>.</p>
      <div style={{ marginTop: 48, textAlign: "right" }}>
        <p>Am primit,</p>
        <p style={{ marginTop: 40, borderTop: "1px solid #333", paddingTop: 4, display: "inline-block", minWidth: 200 }}>Semnătură</p>
      </div>
    </div>
  );
}
