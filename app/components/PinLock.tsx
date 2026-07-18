"use client";

import { useEffect, useState } from "react";
import { biometricEnabled } from "../lib/biometric";
import { useStore } from "../lib/store";
import { IconWallet } from "./Icons";

export function PinLock({ children }: { children: React.ReactNode }) {
  const store = useStore();
  const [entry, setEntry] = useState("");
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);
  const [hasBio, setHasBio] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setHasBio(biometricEnabled());
  }, [store.locked]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Auto-prompt biometrics when locked and available.
  useEffect(() => {
    if (store.locked && biometricEnabled()) {
      void tryBiometric();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.locked]);

  if (!store.locked) return <>{children}</>;

  const submit = async () => {
    setBusy(true);
    const ok = await store.unlock(entry);
    setBusy(false);
    if (!ok) {
      setError(true);
      setEntry("");
      setTimeout(() => setError(false), 700);
    }
  };

  async function tryBiometric() {
    setBusy(true);
    const ok = await store.unlockWithBiometric();
    setBusy(false);
    if (!ok) {
      setError(true);
      setTimeout(() => setError(false), 700);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center px-4"
      style={{ background: "var(--bg)" }}
    >
      <div
        className="flex items-center justify-center rounded-2xl mb-6"
        style={{
          width: 64,
          height: 64,
          background: "linear-gradient(135deg,var(--brand),var(--accent))",
          color: "#fff",
        }}
      >
        <IconWallet width={30} height={30} />
      </div>
      <h1 className="text-xl font-extrabold">Debt Manager Pro</h1>
      <p className="text-sm mb-5" style={{ color: "var(--muted)" }}>
        Introdu codul PIN pentru a debloca datele criptate.
      </p>
      <div
        className="panel p-5 w-full max-w-xs"
        style={error ? { borderColor: "var(--danger)" } : undefined}
      >
        <input
          className="input text-center"
          style={{ letterSpacing: "0.5em", fontSize: "1.2rem" }}
          type="password"
          inputMode="numeric"
          value={entry}
          autoFocus
          disabled={busy}
          onChange={(e) => setEntry(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="••••"
        />
        {error && (
          <p className="text-sm mt-2 text-center" style={{ color: "var(--danger)" }}>
            Cod incorect
          </p>
        )}
        <button className="btn btn-primary w-full mt-3" onClick={submit} disabled={busy || entry.length < 4}>
          {busy ? "Se verifică…" : "Deblochează"}
        </button>
        {hasBio && (
          <button className="btn btn-ghost w-full mt-2" onClick={tryBiometric} disabled={busy}>
            Deblochează cu biometrie
          </button>
        )}
      </div>
    </div>
  );
}
