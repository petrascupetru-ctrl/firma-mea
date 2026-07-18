"use client";

import { useEffect, useState } from "react";
import { IconWallet } from "./Icons";

const PIN_KEY = "debt-manager-pro:pin";

export function PinLock({ children }: { children: React.ReactNode }) {
  const [locked, setLocked] = useState(false);
  const [ready, setReady] = useState(false);
  const [entry, setEntry] = useState("");
  const [error, setError] = useState(false);

  // Read the persisted PIN once on mount (localStorage is client-only).
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setLocked(!!localStorage.getItem(PIN_KEY));
    setReady(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  if (!ready) return null;
  if (!locked) return <>{children}</>;

  const submit = () => {
    if (entry === localStorage.getItem(PIN_KEY)) {
      setLocked(false);
    } else {
      setError(true);
      setEntry("");
      setTimeout(() => setError(false), 600);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center px-4"
      style={{ background: "var(--bg)" }}
    >
      <div
        className="flex items-center justify-center rounded-2xl mb-6"
        style={{ width: 64, height: 64, background: "linear-gradient(135deg,var(--brand),var(--accent))", color: "#fff" }}
      >
        <IconWallet width={30} height={30} />
      </div>
      <h1 className="text-xl font-extrabold">Debt Manager Pro</h1>
      <p className="text-sm mb-5" style={{ color: "var(--muted)" }}>Introdu codul PIN pentru a continua.</p>
      <div
        className="panel p-5 w-full max-w-xs"
        style={error ? { animation: "scaleIn .2s", borderColor: "var(--danger)" } : undefined}
      >
        <input
          className="input text-center"
          style={{ letterSpacing: "0.5em", fontSize: "1.2rem" }}
          type="password"
          inputMode="numeric"
          value={entry}
          autoFocus
          onChange={(e) => setEntry(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="••••"
        />
        {error && <p className="text-sm mt-2 text-center" style={{ color: "var(--danger)" }}>Cod incorect</p>}
        <button className="btn btn-primary w-full mt-3" onClick={submit}>Deblochează</button>
      </div>
    </div>
  );
}
