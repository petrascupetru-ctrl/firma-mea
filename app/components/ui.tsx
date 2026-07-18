"use client";

import { useEffect } from "react";
import { loanStatus, personInitials, STATUS_META } from "../lib/calc";
import type { Loan, LoanStatus, Payment, Person } from "../lib/types";
import { IconX } from "./Icons";

export function Modal({
  open,
  onClose,
  title,
  children,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div
        className="modal"
        style={wide ? { maxWidth: 760 } : undefined}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h3 className="text-lg font-bold">{title}</h3>
          <button
            className="btn btn-ghost btn-sm"
            onClick={onClose}
            aria-label="Închide"
          >
            <IconX width={16} height={16} />
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
      </div>
    </div>
  );
}

export function Avatar({
  person,
  size = 40,
}: {
  person: Person;
  size?: number;
}) {
  const style: React.CSSProperties = {
    width: size,
    height: size,
    fontSize: size * 0.38,
  };
  if (person.photo) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={person.photo}
        alt={person.firstName}
        className="avatar"
        style={{ ...style, objectFit: "cover" }}
      />
    );
  }
  return (
    <span className="avatar" style={style}>
      {personInitials(person)}
    </span>
  );
}

export function StatusBadge({
  loan,
  payments,
}: {
  loan: Loan;
  payments: Payment[];
}) {
  const status = loanStatus(loan, payments);
  const meta = STATUS_META[status];
  return (
    <span className={`badge ${meta.badge}`}>
      <span>{meta.dot}</span>
      {meta.label}
    </span>
  );
}

export function StatusDot({ status }: { status: LoanStatus }) {
  const meta = STATUS_META[status];
  return (
    <span
      className="inline-block rounded-full"
      style={{ width: 10, height: 10, background: meta.color }}
      title={meta.label}
    />
  );
}

export function EmptyState({
  icon,
  title,
  subtitle,
  action,
}: {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4">
      {icon && (
        <div
          className="mb-4 flex items-center justify-center rounded-2xl"
          style={{
            width: 64,
            height: 64,
            background: "var(--brand-soft)",
            color: "var(--brand-2)",
          }}
        >
          {icon}
        </div>
      )}
      <p className="text-lg font-bold">{title}</p>
      {subtitle && (
        <p className="text-sm mt-1 max-w-sm" style={{ color: "var(--muted)" }}>
          {subtitle}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ConfirmButton({
  onConfirm,
  label,
  message,
  className = "btn btn-danger btn-sm",
  children,
}: {
  onConfirm: () => void;
  label?: string;
  message?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      className={className}
      title={label}
      onClick={() => {
        if (window.confirm(message ?? "Sigur continui?")) onConfirm();
      }}
    >
      {children}
    </button>
  );
}
