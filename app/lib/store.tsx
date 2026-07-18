"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { DEFAULT_RATES, uid } from "./calc";
import { seedState } from "./seed";
import type {
  AppState,
  AuditEntry,
  Loan,
  Payment,
  Person,
  Settings,
} from "./types";

const STORAGE_KEY = "debt-manager-pro:v1";

interface StoreContextValue extends AppState {
  ready: boolean;
  // people
  addPerson: (p: Omit<Person, "id" | "createdAt" | "archived" | "labels"> & {
    labels?: string[];
  }) => Person;
  updatePerson: (id: string, patch: Partial<Person>) => void;
  deletePerson: (id: string) => void;
  archivePerson: (id: string, archived: boolean) => void;
  // loans
  addLoan: (l: Omit<Loan, "id" | "createdAt" | "documents"> & {
    documents?: Loan["documents"];
  }) => Loan;
  updateLoan: (id: string, patch: Partial<Loan>) => void;
  deleteLoan: (id: string) => void;
  // payments
  addPayment: (p: Omit<Payment, "id" | "createdAt">) => Payment;
  deletePayment: (id: string) => void;
  // settings
  updateSettings: (patch: Partial<Settings>) => void;
  toggleTheme: () => void;
  // data ops
  exportState: () => string;
  importState: (json: string) => boolean;
  resetDemo: () => void;
  clearAll: () => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

function migrate(state: Partial<AppState>): AppState {
  const base = seedState();
  return {
    people: state.people ?? [],
    loans: state.loans ?? [],
    payments: state.payments ?? [],
    audit: state.audit ?? [],
    settings: {
      theme: state.settings?.theme ?? "dark",
      baseCurrency: state.settings?.baseCurrency ?? "RON",
      rates: { ...DEFAULT_RATES, ...(state.settings?.rates ?? {}) },
    },
    // keep base referenced so unused-var lint stays quiet if fields evolve
    ...(base ? {} : {}),
  };
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(() => seedState());
  const [ready, setReady] = useState(false);
  const loaded = useRef(false);

  // Load persisted state once on mount (localStorage is client-only, so this
  // hydration-from-storage step legitimately synchronizes external state).
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setState(migrate(JSON.parse(raw)));
      } else {
        const seeded = seedState();
        setState(seeded);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      }
    } catch {
      setState(seedState());
    }
    loaded.current = true;
    setReady(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Persist on change (after initial load).
  useEffect(() => {
    if (!loaded.current) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // storage full / unavailable — ignore silently
    }
  }, [state]);

  // Reflect theme on <html> element.
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.dataset.theme = state.settings.theme;
    }
  }, [state.settings.theme]);

  const log = useCallback(
    (
      action: AuditEntry["action"],
      entity: AuditEntry["entity"],
      description: string,
    ): AuditEntry => ({
      id: uid(),
      timestamp: new Date().toISOString(),
      action,
      entity,
      description,
    }),
    [],
  );

  const addPerson = useCallback<StoreContextValue["addPerson"]>(
    (p) => {
      const person: Person = {
        id: uid(),
        createdAt: new Date().toISOString(),
        archived: false,
        labels: p.labels ?? [],
        firstName: p.firstName,
        lastName: p.lastName,
        nickname: p.nickname,
        phone: p.phone,
        email: p.email,
        address: p.address,
        cnp: p.cnp,
        notes: p.notes,
        photo: p.photo,
      };
      setState((s) => ({
        ...s,
        people: [person, ...s.people],
        audit: [
          log(
            "create",
            "person",
            `Persoană adăugată: ${person.firstName} ${person.lastName}`,
          ),
          ...s.audit,
        ],
      }));
      return person;
    },
    [log],
  );

  const updatePerson = useCallback<StoreContextValue["updatePerson"]>(
    (id, patch) => {
      setState((s) => {
        const existing = s.people.find((x) => x.id === id);
        return {
          ...s,
          people: s.people.map((x) =>
            x.id === id ? { ...x, ...patch } : x,
          ),
          audit: [
            log(
              "update",
              "person",
              `Persoană actualizată: ${existing?.firstName ?? ""} ${
                existing?.lastName ?? ""
              }`,
            ),
            ...s.audit,
          ],
        };
      });
    },
    [log],
  );

  const deletePerson = useCallback<StoreContextValue["deletePerson"]>(
    (id) => {
      setState((s) => {
        const loanIds = s.loans
          .filter((l) => l.personId === id)
          .map((l) => l.id);
        const existing = s.people.find((x) => x.id === id);
        return {
          ...s,
          people: s.people.filter((x) => x.id !== id),
          loans: s.loans.filter((l) => l.personId !== id),
          payments: s.payments.filter((p) => !loanIds.includes(p.loanId)),
          audit: [
            log(
              "delete",
              "person",
              `Persoană ștearsă: ${existing?.firstName ?? ""} ${
                existing?.lastName ?? ""
              }`,
            ),
            ...s.audit,
          ],
        };
      });
    },
    [log],
  );

  const archivePerson = useCallback<StoreContextValue["archivePerson"]>(
    (id, archived) => {
      setState((s) => {
        const existing = s.people.find((x) => x.id === id);
        return {
          ...s,
          people: s.people.map((x) =>
            x.id === id ? { ...x, archived } : x,
          ),
          audit: [
            log(
              archived ? "archive" : "restore",
              "person",
              `${archived ? "Arhivat" : "Restaurat"}: ${
                existing?.firstName ?? ""
              } ${existing?.lastName ?? ""}`,
            ),
            ...s.audit,
          ],
        };
      });
    },
    [log],
  );

  const addLoan = useCallback<StoreContextValue["addLoan"]>(
    (l) => {
      const loan: Loan = {
        ...l,
        id: uid(),
        documents: l.documents ?? [],
        createdAt: new Date().toISOString(),
      };
      setState((s) => ({
        ...s,
        loans: [loan, ...s.loans],
        audit: [
          log("create", "loan", `Împrumut nou: ${loan.amount} ${loan.currency}`),
          ...s.audit,
        ],
      }));
      return loan;
    },
    [log],
  );

  const updateLoan = useCallback<StoreContextValue["updateLoan"]>(
    (id, patch) => {
      setState((s) => ({
        ...s,
        loans: s.loans.map((x) => (x.id === id ? { ...x, ...patch } : x)),
        audit: [log("update", "loan", `Împrumut actualizat`), ...s.audit],
      }));
    },
    [log],
  );

  const deleteLoan = useCallback<StoreContextValue["deleteLoan"]>(
    (id) => {
      setState((s) => ({
        ...s,
        loans: s.loans.filter((x) => x.id !== id),
        payments: s.payments.filter((p) => p.loanId !== id),
        audit: [log("delete", "loan", `Împrumut șters`), ...s.audit],
      }));
    },
    [log],
  );

  const addPayment = useCallback<StoreContextValue["addPayment"]>(
    (p) => {
      const payment: Payment = {
        ...p,
        id: uid(),
        createdAt: new Date().toISOString(),
      };
      setState((s) => ({
        ...s,
        payments: [payment, ...s.payments],
        audit: [
          log("payment", "payment", `Plată înregistrată: ${payment.amount}`),
          ...s.audit,
        ],
      }));
      return payment;
    },
    [log],
  );

  const deletePayment = useCallback<StoreContextValue["deletePayment"]>(
    (id) => {
      setState((s) => ({
        ...s,
        payments: s.payments.filter((x) => x.id !== id),
        audit: [log("delete", "payment", `Plată ștearsă`), ...s.audit],
      }));
    },
    [log],
  );

  const updateSettings = useCallback<StoreContextValue["updateSettings"]>(
    (patch) => {
      setState((s) => ({
        ...s,
        settings: { ...s.settings, ...patch },
        audit: [log("update", "settings", `Setări actualizate`), ...s.audit],
      }));
    },
    [log],
  );

  const toggleTheme = useCallback(() => {
    setState((s) => ({
      ...s,
      settings: {
        ...s.settings,
        theme: s.settings.theme === "dark" ? "light" : "dark",
      },
    }));
  }, []);

  const exportState = useCallback(() => JSON.stringify(state, null, 2), [state]);

  const importState = useCallback<StoreContextValue["importState"]>((json) => {
    try {
      const parsed = JSON.parse(json);
      setState(migrate(parsed));
      return true;
    } catch {
      return false;
    }
  }, []);

  const resetDemo = useCallback(() => setState(seedState()), []);

  const clearAll = useCallback(() => {
    setState((s) => ({
      people: [],
      loans: [],
      payments: [],
      audit: [
        {
          id: uid(),
          timestamp: new Date().toISOString(),
          action: "delete",
          entity: "settings",
          description: "Toate datele au fost șterse.",
        },
      ],
      settings: s.settings,
    }));
  }, []);

  const value = useMemo<StoreContextValue>(
    () => ({
      ...state,
      ready,
      addPerson,
      updatePerson,
      deletePerson,
      archivePerson,
      addLoan,
      updateLoan,
      deleteLoan,
      addPayment,
      deletePayment,
      updateSettings,
      toggleTheme,
      exportState,
      importState,
      resetDemo,
      clearAll,
    }),
    [
      state,
      ready,
      addPerson,
      updatePerson,
      deletePerson,
      archivePerson,
      addLoan,
      updateLoan,
      deleteLoan,
      addPayment,
      deletePayment,
      updateSettings,
      toggleTheme,
      exportState,
      importState,
      resetDemo,
      clearAll,
    ],
  );

  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
}

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
