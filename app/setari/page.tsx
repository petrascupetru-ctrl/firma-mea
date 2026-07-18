"use client";

import { useRef, useState } from "react";
import { IconDownload, IconMoon, IconSun } from "../components/Icons";
import { ConfirmButton } from "../components/ui";
import { useStore } from "../lib/store";
import { CURRENCIES, type Currency } from "../lib/types";

const PIN_KEY = "debt-manager-pro:pin";

function download(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function SettingsPage() {
  const store = useStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const [pin, setPin] = useState("");
  const [importMsg, setImportMsg] = useState<string | null>(null);
  const hasPin =
    typeof window !== "undefined" && !!localStorage.getItem(PIN_KEY);

  const setRate = (c: Currency, v: string) => {
    store.updateSettings({
      rates: { ...store.settings.rates, [c]: parseFloat(v) || 0 },
    });
  };

  const doImport = async (file: File) => {
    const text = await file.text();
    if (store.importState(text)) setImportMsg("✓ Date restaurate cu succes.");
    else setImportMsg("✗ Fișier invalid.");
  };

  return (
    <div className="space-y-5 max-w-3xl">
      <div>
        <h1 className="text-2xl font-extrabold">Setări</h1>
        <p className="text-sm" style={{ color: "var(--muted)" }}>Personalizare, valute, securitate și backup.</p>
      </div>

      {/* Appearance */}
      <div className="card p-5">
        <h2 className="font-bold mb-3">Aspect</h2>
        <div className="flex gap-2">
          <button
            className={`btn ${store.settings.theme === "dark" ? "btn-primary" : "btn-ghost"}`}
            onClick={() => store.updateSettings({ theme: "dark" })}
          >
            <IconMoon width={16} height={16} /> Dark Mode
          </button>
          <button
            className={`btn ${store.settings.theme === "light" ? "btn-primary" : "btn-ghost"}`}
            onClick={() => store.updateSettings({ theme: "light" })}
          >
            <IconSun width={16} height={16} /> Light Mode
          </button>
        </div>
      </div>

      {/* Currency */}
      <div className="card p-5">
        <h2 className="font-bold mb-3">Valute</h2>
        <div className="max-w-xs mb-4">
          <label className="label">Monedă de bază</label>
          <select
            className="select"
            value={store.settings.baseCurrency}
            onChange={(e) => store.updateSettings({ baseCurrency: e.target.value as Currency })}
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <p className="label">Curs de schimb (valoarea unei unități în RON)</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {CURRENCIES.map((c) => (
            <div key={c}>
              <label className="label">{c}</label>
              <input
                className="input"
                type="number"
                step="0.01"
                value={store.settings.rates[c]}
                disabled={c === "RON"}
                onChange={(e) => setRate(c, e.target.value)}
              />
            </div>
          ))}
        </div>
        <p className="text-xs mt-2" style={{ color: "var(--muted)" }}>
          Conversia sumelor în rapoarte folosește aceste cursuri.
        </p>
      </div>

      {/* Security */}
      <div className="card p-5">
        <h2 className="font-bold mb-3">Securitate</h2>
        <p className="text-sm mb-3" style={{ color: "var(--muted)" }}>
          Setează un cod PIN pentru a bloca accesul la aplicație pe acest dispozitiv.
        </p>
        {hasPin ? (
          <ConfirmButton
            className="btn btn-danger"
            message="Elimini codul PIN?"
            onConfirm={() => {
              localStorage.removeItem(PIN_KEY);
              location.reload();
            }}
          >
            Elimină PIN-ul
          </ConfirmButton>
        ) : (
          <div className="flex gap-2 items-end max-w-xs">
            <div className="flex-1">
              <label className="label">Cod PIN (min. 4 cifre)</label>
              <input
                className="input"
                type="password"
                inputMode="numeric"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="••••"
              />
            </div>
            <button
              className="btn btn-primary"
              disabled={pin.length < 4}
              onClick={() => {
                localStorage.setItem(PIN_KEY, pin);
                setPin("");
                alert("PIN setat. Va fi cerut la următoarea deschidere.");
              }}
            >
              Salvează
            </button>
          </div>
        )}
      </div>

      {/* Backup */}
      <div className="card p-5">
        <h2 className="font-bold mb-3">Backup & Restaurare</h2>
        <div className="flex flex-wrap gap-2">
          <button className="btn btn-ghost" onClick={() => download("debt-manager-backup.json", store.exportState(), "application/json")}>
            <IconDownload width={16} height={16} /> Descarcă backup
          </button>
          <button className="btn btn-ghost" onClick={() => fileRef.current?.click()}>
            Restaurează din fișier
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) doImport(f);
            }}
          />
        </div>
        {importMsg && <p className="text-sm mt-2">{importMsg}</p>}
        <div className="hairline my-4" />
        <div className="flex flex-wrap gap-2">
          <ConfirmButton className="btn btn-ghost" message="Încarci datele demonstrative? Datele curente se pierd." onConfirm={store.resetDemo}>
            Reîncarcă datele demo
          </ConfirmButton>
          <ConfirmButton className="btn btn-danger" message="Ștergi TOATE datele? Această acțiune nu poate fi anulată." onConfirm={store.clearAll}>
            Șterge toate datele
          </ConfirmButton>
        </div>
      </div>

      {/* Audit log */}
      <div className="card p-5">
        <h2 className="font-bold mb-3">Istoric modificări (audit log)</h2>
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {store.audit.slice(0, 40).map((a) => (
            <div key={a.id} className="flex items-start justify-between text-sm py-1.5" style={{ borderBottom: "1px solid var(--border)" }}>
              <span>{a.description}</span>
              <span className="flex-shrink-0 ml-3" style={{ fontSize: "0.7rem", color: "var(--muted)" }}>
                {new Date(a.timestamp).toLocaleString("ro-RO")}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
