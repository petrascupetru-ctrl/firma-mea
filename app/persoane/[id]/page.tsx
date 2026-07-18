"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { LoanForm, PaymentForm, PersonForm } from "../../components/forms";
import {
  IconArchive,
  IconArrowLeft,
  IconCash,
  IconEdit,
  IconMail,
  IconPhone,
  IconPlus,
  IconTrash,
  IconWhatsApp,
} from "../../components/Icons";
import {
  Avatar,
  ConfirmButton,
  Modal,
  StatusBadge,
} from "../../components/ui";
import {
  convert,
  formatDateLong,
  formatMoney,
  loanPaid,
  loanRemaining,
  loanTotal,
  personFullName,
} from "../../lib/calc";
import { useStore } from "../../lib/store";
import type { Loan, Payment } from "../../lib/types";

type TimelineItem =
  | { kind: "loan"; date: string; loan: Loan }
  | { kind: "payment"; date: string; payment: Payment; loan?: Loan };

export default function PersonDetail() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const store = useStore();
  const person = store.people.find((p) => p.id === params.id);

  const [editOpen, setEditOpen] = useState(false);
  const [loanOpen, setLoanOpen] = useState(false);
  const [payFor, setPayFor] = useState<Loan | null>(null);

  const loans = useMemo(
    () => store.loans.filter((l) => l.personId === params.id),
    [store.loans, params.id],
  );

  const timeline = useMemo<TimelineItem[]>(() => {
    const items: TimelineItem[] = [];
    for (const loan of loans) {
      items.push({ kind: "loan", date: loan.date, loan });
      for (const pay of store.payments.filter((p) => p.loanId === loan.id)) {
        items.push({ kind: "payment", date: pay.date, payment: pay, loan });
      }
    }
    return items.sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [loans, store.payments]);

  const totals = useMemo(() => {
    const base = store.settings.baseCurrency;
    let lent = 0, paid = 0, outstanding = 0;
    for (const l of loans) {
      lent += convert(loanTotal(l), l.currency, base, store.settings.rates);
      paid += convert(loanPaid(l, store.payments), l.currency, base, store.settings.rates);
      outstanding += convert(loanRemaining(l, store.payments), l.currency, base, store.settings.rates);
    }
    return { lent, paid, outstanding };
  }, [loans, store.payments, store.settings]);

  if (!person) {
    return (
      <div className="card p-10 text-center">
        <p className="font-bold">Persoana nu a fost găsită.</p>
        <Link href="/persoane" className="link mt-3 inline-block">← Înapoi la persoane</Link>
      </div>
    );
  }

  const outstandingLoan = loans.find((l) => loanRemaining(l, store.payments) > 0);
  const reminderText = outstandingLoan
    ? `Bună! Îți reamintesc că ai de achitat suma de ${formatMoney(loanRemaining(outstandingLoan, store.payments), outstandingLoan.currency)} până la data de ${formatDateLong(outstandingLoan.dueDate)}. Mulțumesc!`
    : `Bună ${person.firstName}! Îți mulțumesc, totul este achitat.`;

  const phoneClean = (person.phone ?? "").replace(/[^\d+]/g, "");
  const waLink = `https://wa.me/${phoneClean.replace(/^\+/, "")}?text=${encodeURIComponent(reminderText)}`;
  const smsLink = `sms:${phoneClean}?body=${encodeURIComponent(reminderText)}`;
  const mailLink = `mailto:${person.email ?? ""}?subject=${encodeURIComponent("Reamintire plată")}&body=${encodeURIComponent(reminderText)}`;

  return (
    <div className="space-y-5">
      <Link href="/persoane" className="inline-flex items-center gap-1.5 text-sm" style={{ color: "var(--muted)" }}>
        <IconArrowLeft width={15} height={15} /> Persoane
      </Link>

      {/* Header */}
      <div className="card p-5">
        <div className="flex flex-wrap items-start gap-4">
          <Avatar person={person} size={72} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-extrabold">{personFullName(person)}</h1>
              {person.archived && <span className="badge badge-neutral">Arhivat</span>}
              {person.labels.map((l) => (
                <span key={l} className="chip">{l}</span>
              ))}
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-1 mt-2 text-sm" style={{ color: "var(--muted)" }}>
              {person.phone && <span className="flex items-center gap-1.5"><IconPhone width={14} height={14} /> {person.phone}</span>}
              {person.email && <span className="flex items-center gap-1.5"><IconMail width={14} height={14} /> {person.email}</span>}
              {person.address && <span>{person.address}</span>}
            </div>
            {person.notes && <p className="text-sm mt-2">{person.notes}</p>}
          </div>
          <div className="flex flex-wrap gap-2">
            <button className="btn btn-ghost btn-sm" onClick={() => setEditOpen(true)}>
              <IconEdit width={15} height={15} /> Editează
            </button>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => store.archivePerson(person.id, !person.archived)}
            >
              <IconArchive width={15} height={15} /> {person.archived ? "Restaurează" : "Arhivează"}
            </button>
            <ConfirmButton
              message="Ștergi această persoană și toate împrumuturile ei?"
              onConfirm={() => {
                store.deletePerson(person.id);
                router.push("/persoane");
              }}
            >
              <IconTrash width={15} height={15} />
            </ConfirmButton>
          </div>
        </div>

        {/* Contact actions */}
        <div className="flex flex-wrap gap-2 mt-4 pt-4" style={{ borderTop: "1px solid var(--border)" }}>
          {phoneClean && (
            <>
              <a href={waLink} target="_blank" rel="noopener noreferrer" className="btn btn-sm" style={{ background: "#25D366", color: "#fff" }}>
                <IconWhatsApp width={16} height={16} /> WhatsApp
              </a>
              <a href={smsLink} className="btn btn-ghost btn-sm">
                <IconPhone width={15} height={15} /> SMS reminder
              </a>
            </>
          )}
          {person.email && (
            <a href={mailLink} className="btn btn-ghost btn-sm">
              <IconMail width={15} height={15} /> Email
            </a>
          )}
        </div>
      </div>

      {/* Totals */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="panel p-4">
          <p className="text-xs" style={{ color: "var(--muted)" }}>Total împrumutat</p>
          <p className="stat-value mt-1" style={{ fontSize: "1.3rem" }}>{formatMoney(totals.lent, store.settings.baseCurrency)}</p>
        </div>
        <div className="panel p-4">
          <p className="text-xs" style={{ color: "var(--muted)" }}>Total încasat</p>
          <p className="stat-value mt-1" style={{ fontSize: "1.3rem", color: "var(--ok)" }}>{formatMoney(totals.paid, store.settings.baseCurrency)}</p>
        </div>
        <div className="panel p-4">
          <p className="text-xs" style={{ color: "var(--muted)" }}>Rest de recuperat</p>
          <p className="stat-value mt-1" style={{ fontSize: "1.3rem", color: totals.outstanding > 0 ? "var(--danger)" : "var(--ok)" }}>
            {formatMoney(totals.outstanding, store.settings.baseCurrency)}
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Loans */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold">Împrumuturi</h2>
            <button className="btn btn-primary btn-sm" onClick={() => setLoanOpen(true)}>
              <IconPlus width={15} height={15} /> Nou
            </button>
          </div>
          {loans.length === 0 ? (
            <p className="text-sm" style={{ color: "var(--muted)" }}>Niciun împrumut încă.</p>
          ) : (
            <div className="space-y-2">
              {loans.map((loan) => {
                const rem = loanRemaining(loan, store.payments);
                return (
                  <div key={loan.id} className="panel p-3">
                    <div className="flex items-center justify-between">
                      <Link href={`/imprumuturi/${loan.id}`} className="font-semibold hover:underline">
                        {formatMoney(loan.amount, loan.currency)}
                        {loan.interestRate > 0 && (
                          <span className="text-xs" style={{ color: "var(--muted)" }}> +{loan.interestRate}%</span>
                        )}
                      </Link>
                      <StatusBadge loan={loan} payments={store.payments} />
                    </div>
                    <div className="flex items-center justify-between mt-1.5 text-sm">
                      <span style={{ color: "var(--muted)" }}>{loan.reason || "Împrumut"}</span>
                      <span>Rest: <b>{formatMoney(rem, loan.currency)}</b></span>
                    </div>
                    {rem > 0 && (
                      <button className="btn btn-ghost btn-sm mt-2 w-full" onClick={() => setPayFor(loan)}>
                        <IconCash width={14} height={14} /> Înregistrează plată
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Timeline */}
        <div className="card p-5">
          <h2 className="font-bold mb-4">Cronologie</h2>
          {timeline.length === 0 ? (
            <p className="text-sm" style={{ color: "var(--muted)" }}>Nicio activitate.</p>
          ) : (
            <div className="relative pl-7">
              <div className="timeline-line" />
              <div className="space-y-4">
                {timeline.map((item, i) => (
                  <div key={i} className="relative">
                    <span
                      className="absolute rounded-full"
                      style={{
                        left: -23,
                        top: 3,
                        width: 12,
                        height: 12,
                        background: item.kind === "loan" ? "var(--brand)" : "var(--ok)",
                        border: "2px solid var(--surface)",
                      }}
                    />
                    <p style={{ fontSize: "0.7rem", color: "var(--muted)" }}>{formatDateLong(item.date)}</p>
                    {item.kind === "loan" ? (
                      <p className="text-sm font-semibold">
                        Împrumut {formatMoney(item.loan.amount, item.loan.currency)}
                        {item.loan.reason ? ` · ${item.loan.reason}` : ""}
                      </p>
                    ) : (
                      <p className="text-sm font-semibold" style={{ color: "var(--ok)" }}>
                        A plătit {formatMoney(item.payment.amount, item.loan?.currency ?? store.settings.baseCurrency)}
                        {item.payment.note ? ` · ${item.payment.note}` : ""}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Editează persoană">
        <PersonForm person={person} onDone={() => setEditOpen(false)} />
      </Modal>
      <Modal open={loanOpen} onClose={() => setLoanOpen(false)} title="Împrumut nou" wide>
        <LoanForm presetPersonId={person.id} onDone={() => setLoanOpen(false)} />
      </Modal>
      <Modal open={!!payFor} onClose={() => setPayFor(null)} title="Înregistrează plată">
        {payFor && (
          <PaymentForm
            loanId={payFor.id}
            currency={payFor.currency}
            suggested={loanRemaining(payFor, store.payments)}
            onDone={() => setPayFor(null)}
          />
        )}
      </Modal>
    </div>
  );
}
