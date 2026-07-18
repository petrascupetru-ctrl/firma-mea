"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  daysUntil,
  formatMoney,
  loanRemaining,
  loanStatus,
  personFullName,
} from "../lib/calc";
import { runDueReminders } from "../lib/notify";
import { useStore } from "../lib/store";
import { PinLock } from "./PinLock";
import { Avatar } from "./ui";
import {
  IconBell,
  IconCalc,
  IconCalendar,
  IconChart,
  IconDashboard,
  IconMenu,
  IconMoon,
  IconSearch,
  IconSettings,
  IconSun,
  IconUsers,
  IconWallet,
  IconX,
} from "./Icons";

const NAV = [
  { href: "/", label: "Dashboard", icon: IconDashboard },
  { href: "/persoane", label: "Persoane", icon: IconUsers },
  { href: "/imprumuturi", label: "Împrumuturi", icon: IconWallet },
  { href: "/plati", label: "Plăți", icon: IconCalc },
  { href: "/calendar", label: "Calendar", icon: IconCalendar },
  { href: "/rapoarte", label: "Rapoarte", icon: IconChart },
  { href: "/setari", label: "Setări", icon: IconSettings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const store = useStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [searchFocus, setSearchFocus] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  // Data lives in localStorage (client-only), so render page content after
  // mount to avoid server/client hydration mismatches on dynamic values.
  const [hydrated, setHydrated] = useState(false);
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => setHydrated(true), []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const activePeople = store.people;

  // Fire browser reminders for due/overdue loans once the app is unlocked.
  useEffect(() => {
    if (store.locked || !store.ready) return;
    void runDueReminders(store.loans, store.payments, store.people);
  }, [store.locked, store.ready, store.loans, store.payments, store.people]);

  // ---- Global search results ----
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return { people: [], loans: [] };
    const people = store.people
      .filter((p) => {
        return (
          personFullName(p).toLowerCase().includes(q) ||
          (p.phone ?? "").toLowerCase().includes(q) ||
          (p.email ?? "").toLowerCase().includes(q) ||
          (p.notes ?? "").toLowerCase().includes(q) ||
          p.labels.some((l) => l.toLowerCase().includes(q))
        );
      })
      .slice(0, 5);
    const loans = store.loans
      .filter((l) => {
        const person = store.people.find((p) => p.id === l.personId);
        return (
          String(l.amount).includes(q) ||
          (l.reason ?? "").toLowerCase().includes(q) ||
          (l.date ?? "").includes(q) ||
          (person ? personFullName(person).toLowerCase().includes(q) : false)
        );
      })
      .slice(0, 5);
    return { people, loans };
  }, [query, store.people, store.loans]);

  // ---- Notifications (upcoming & overdue) ----
  const notifications = useMemo(() => {
    const items: {
      id: string;
      text: string;
      tone: "warn" | "danger" | "brand";
      loanId: string;
    }[] = [];
    for (const loan of store.loans) {
      const status = loanStatus(loan, store.payments);
      if (status === "achitat") continue;
      const d = daysUntil(loan.dueDate);
      const person = store.people.find((p) => p.id === loan.personId);
      const name = person ? personFullName(person) : "Necunoscut";
      const rem = formatMoney(loanRemaining(loan, store.payments), loan.currency);
      if (d === 1)
        items.push({ id: loan.id + "t", loanId: loan.id, tone: "warn", text: `Mâine expiră termenul: ${name} — ${rem}` });
      else if (d === 0)
        items.push({ id: loan.id + "0", loanId: loan.id, tone: "warn", text: `Astăzi expiră termenul: ${name} — ${rem}` });
      else if (d < 0) {
        const late = -d;
        const bucket = late >= 30 ? 30 : late >= 7 ? 7 : late >= 3 ? 3 : 1;
        items.push({
          id: loan.id + "l",
          loanId: loan.id,
          tone: "danger",
          text: `Întârziere ${late} ${late === 1 ? "zi" : "zile"}${
            bucket >= 3 ? ` (peste ${bucket})` : ""
          }: ${name} — ${rem}`,
        });
      }
    }
    return items;
  }, [store.loans, store.payments, store.people]);

  const showResults = searchFocus && query.trim().length > 0;

  return (
    <PinLock>
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ background: "rgba(0,0,0,0.5)" }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full z-50 flex flex-col transition-transform lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          width: 256,
          background: "var(--surface)",
          borderRight: "1px solid var(--border)",
        }}
      >
        <div className="px-5 py-5 flex items-center gap-3">
          <div
            className="flex items-center justify-center rounded-xl"
            style={{
              width: 40,
              height: 40,
              background: "linear-gradient(135deg,var(--brand),var(--accent))",
              color: "#fff",
            }}
          >
            <IconWallet width={22} height={22} />
          </div>
          <div>
            <p className="font-extrabold leading-tight">Debt Manager</p>
            <p style={{ fontSize: "0.7rem", color: "var(--muted)" }}>PRO v1.0</p>
          </div>
          <button
            className="btn btn-ghost btn-sm ml-auto lg:hidden"
            onClick={() => setMobileOpen(false)}
            aria-label="Închide meniul"
          >
            <IconX width={16} height={16} />
          </button>
        </div>

        <nav className="px-3 py-2 flex-1 space-y-1 overflow-y-auto">
          {NAV.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-item ${active ? "active" : ""}`}
                onClick={() => setMobileOpen(false)}
              >
                <Icon width={19} height={19} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-4 py-4" style={{ borderTop: "1px solid var(--border)" }}>
          <div
            className="panel px-3 py-3"
            style={{ background: "var(--brand-soft)", border: "none" }}
          >
            <p className="text-xs font-semibold" style={{ color: "var(--brand-2)" }}>
              {activePeople.length} persoane · {store.loans.length} împrumuturi
            </p>
            <p style={{ fontSize: "0.68rem", color: "var(--muted)", marginTop: 2 }}>
              Datele sunt salvate local pe acest dispozitiv.
            </p>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="lg:pl-64">
        {/* Topbar */}
        <header
          className="sticky top-0 z-30 flex items-center gap-3 px-4 lg:px-6"
          style={{
            height: 64,
            background: "color-mix(in srgb, var(--bg) 82%, transparent)",
            backdropFilter: "blur(10px)",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <button
            className="btn btn-ghost btn-sm lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Deschide meniul"
          >
            <IconMenu width={18} height={18} />
          </button>

          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <div className="relative">
              <span
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: "var(--muted)" }}
              >
                <IconSearch width={16} height={16} />
              </span>
              <input
                className="input"
                style={{ paddingLeft: 36 }}
                placeholder="Caută nume, telefon, sumă, dată…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setSearchFocus(true)}
                onBlur={() => setTimeout(() => setSearchFocus(false), 150)}
              />
            </div>
            {showResults && (
              <div
                className="absolute mt-2 w-full panel overflow-hidden z-40"
                style={{ boxShadow: "var(--shadow)" }}
              >
                {results.people.length === 0 && results.loans.length === 0 ? (
                  <p className="px-4 py-4 text-sm" style={{ color: "var(--muted)" }}>
                    Niciun rezultat pentru „{query}”.
                  </p>
                ) : (
                  <div className="max-h-80 overflow-y-auto py-1">
                    {results.people.map((p) => (
                      <button
                        key={p.id}
                        className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-[var(--surface-2)]"
                        onMouseDown={() => {
                          router.push(`/persoane/${p.id}`);
                          setQuery("");
                        }}
                      >
                        <Avatar person={p} size={30} />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold truncate">
                            {personFullName(p)}
                          </p>
                          <p style={{ fontSize: "0.7rem", color: "var(--muted)" }}>
                            {p.phone || "Persoană"}
                          </p>
                        </div>
                      </button>
                    ))}
                    {results.loans.map((l) => {
                      const person = store.people.find((p) => p.id === l.personId);
                      return (
                        <button
                          key={l.id}
                          className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-[var(--surface-2)]"
                          onMouseDown={() => {
                            router.push(`/imprumuturi/${l.id}`);
                            setQuery("");
                          }}
                        >
                          <span style={{ color: "var(--brand-2)" }}>
                            <IconWallet width={18} height={18} />
                          </span>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold truncate">
                              {formatMoney(l.amount, l.currency)} ·{" "}
                              {person ? personFullName(person) : "—"}
                            </p>
                            <p style={{ fontSize: "0.7rem", color: "var(--muted)" }}>
                              {l.reason || "Împrumut"}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="ml-auto flex items-center gap-2">
            {/* Notifications */}
            <div className="relative">
              <button
                className="btn btn-ghost btn-sm relative"
                onClick={() => setNotifOpen((o) => !o)}
                aria-label="Notificări"
              >
                <IconBell width={18} height={18} />
                {notifications.length > 0 && (
                  <span
                    className="absolute -top-1 -right-1 flex items-center justify-center rounded-full"
                    style={{
                      minWidth: 16,
                      height: 16,
                      padding: "0 4px",
                      background: "var(--danger)",
                      color: "#fff",
                      fontSize: "0.62rem",
                      fontWeight: 700,
                    }}
                  >
                    {notifications.length}
                  </span>
                )}
              </button>
              {notifOpen && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setNotifOpen(false)}
                  />
                  <div
                    className="absolute right-0 mt-2 panel z-40 overflow-hidden"
                    style={{ width: 320, boxShadow: "var(--shadow)" }}
                  >
                    <div className="px-4 py-3 border-b flex items-center justify-between">
                      <p className="font-bold text-sm">Notificări</p>
                      <span className="badge badge-brand">{notifications.length}</span>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="px-4 py-6 text-sm text-center" style={{ color: "var(--muted)" }}>
                          Nicio scadență apropiată. 🎉
                        </p>
                      ) : (
                        notifications.map((n) => (
                          <button
                            key={n.id}
                            className="w-full text-left px-4 py-3 border-b hover:bg-[var(--surface-2)] flex gap-3"
                            onClick={() => {
                              router.push(`/imprumuturi/${n.loanId}`);
                              setNotifOpen(false);
                            }}
                          >
                            <span
                              className="mt-1 inline-block rounded-full flex-shrink-0"
                              style={{
                                width: 8,
                                height: 8,
                                background:
                                  n.tone === "danger"
                                    ? "var(--danger)"
                                    : "var(--warn)",
                              }}
                            />
                            <span className="text-sm">{n.text}</span>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Theme */}
            <button
              className="btn btn-ghost btn-sm"
              onClick={store.toggleTheme}
              aria-label="Comută tema"
            >
              {store.settings.theme === "dark" ? (
                <IconSun width={18} height={18} />
              ) : (
                <IconMoon width={18} height={18} />
              )}
            </button>
          </div>
        </header>

        <main className="px-4 lg:px-6 py-6 max-w-[1200px] mx-auto">
          {hydrated ? (
            children
          ) : (
            <div className="flex items-center justify-center" style={{ minHeight: "60vh" }}>
              <div
                className="rounded-full animate-spin"
                style={{
                  width: 32,
                  height: 32,
                  border: "3px solid var(--border)",
                  borderTopColor: "var(--brand)",
                }}
              />
            </div>
          )}
        </main>
      </div>
    </div>
    </PinLock>
  );
}
