"use client";

import { useEffect, useRef, useState } from "react";
import { IconBell, IconDownload, IconMoon, IconSun } from "../components/Icons";
import { ConfirmButton } from "../components/ui";
import {
  biometricEnabled,
  platformAuthenticatorAvailable,
} from "../lib/biometric";
import { cryptoSupported } from "../lib/crypto";
import {
  notificationsSupported,
  requestNotificationPermission,
  runDueReminders,
} from "../lib/notify";
import {
  disablePush,
  enablePush,
  pushEnabledLocally,
  pushSupported,
  sendTestPush,
} from "../lib/push";
import { fetchLiveRates } from "../lib/rates";
import { useStore } from "../lib/store";
import { exportXlsx } from "../lib/xlsx";
import { CURRENCIES, type Currency } from "../lib/types";

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
  const [rateMsg, setRateMsg] = useState<string | null>(null);
  const [ratesBusy, setRatesBusy] = useState(false);
  const [notifPerm, setNotifPerm] = useState<string>("default");
  const [bioAvailable, setBioAvailable] = useState(false);
  const [bioOn, setBioOn] = useState(false);
  const [pushStatus, setPushStatus] = useState<{
    ready: boolean;
    storage: boolean;
    vapid: boolean;
  } | null>(null);
  const [pushOn, setPushOn] = useState(false);
  const [pushBusy, setPushBusy] = useState(false);
  const [pushMsg, setPushMsg] = useState<string | null>(null);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (notificationsSupported()) setNotifPerm(Notification.permission);
    platformAuthenticatorAvailable().then(setBioAvailable);
    setBioOn(biometricEnabled());
    setPushOn(pushEnabledLocally());
    fetch("/api/push/status")
      .then((r) => r.json())
      .then(setPushStatus)
      .catch(() => setPushStatus(null));
  }, [store.encryptionEnabled]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const doEnablePush = async () => {
    setPushBusy(true);
    setPushMsg(null);
    const res = await enablePush(store.loans, store.payments, store.people);
    setPushBusy(false);
    if (res.ok) {
      setPushOn(true);
      setPushMsg("✓ Notificări push activate. Apasă „Trimite test” pentru verificare.");
    } else if (res.reason === "denied") {
      setPushMsg("✗ Permisiunea a fost refuzată din browser.");
    } else if (res.reason === "unsupported") {
      setPushMsg("✗ Acest browser nu suportă push. Pe iPhone: adaugă aplicația pe ecranul principal.");
    } else {
      setPushMsg("✗ Serverul de notificări nu este configurat încă (vezi mai jos).");
    }
  };

  const setRate = (c: Currency, v: string) => {
    store.updateSettings({
      rates: { ...store.settings.rates, [c]: parseFloat(v) || 0 },
    });
  };

  const refreshRates = async () => {
    setRatesBusy(true);
    setRateMsg(null);
    const live = await fetchLiveRates();
    setRatesBusy(false);
    if (live) {
      store.updateSettings({ rates: live });
      setRateMsg("✓ Cursuri actualizate de la BCE (frankfurter.app).");
    } else {
      setRateMsg("✗ Nu am putut prelua cursurile (verifică internetul).");
    }
  };

  const doImport = async (file: File) => {
    const text = await file.text();
    if (store.importState(text)) setImportMsg("✓ Date restaurate cu succes.");
    else setImportMsg("✗ Fișier invalid.");
  };

  const enableNotif = async () => {
    const perm = await requestNotificationPermission();
    setNotifPerm(perm);
    if (perm === "granted") await runDueReminders(store.loans, store.payments, store.people);
  };

  return (
    <div className="space-y-5 max-w-3xl">
      <div>
        <h1 className="text-2xl font-extrabold">Setări</h1>
        <p className="text-sm" style={{ color: "var(--muted)" }}>
          Personalizare, valute, notificări, securitate și backup.
        </p>
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
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold">Valute</h2>
          <button className="btn btn-ghost btn-sm" onClick={refreshRates} disabled={ratesBusy}>
            <IconDownload width={15} height={15} />
            {ratesBusy ? "Se actualizează…" : "Actualizează cursurile live"}
          </button>
        </div>
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
        {rateMsg && <p className="text-sm mt-2">{rateMsg}</p>}
        <p className="text-xs mt-2" style={{ color: "var(--muted)" }}>
          Conversia sumelor în rapoarte folosește aceste cursuri.
        </p>
      </div>

      {/* Notifications */}
      <div className="card p-5">
        <h2 className="font-bold mb-2">Notificări</h2>
        {!notificationsSupported() ? (
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            Browserul nu suportă notificări.
          </p>
        ) : notifPerm === "granted" ? (
          <p className="text-sm" style={{ color: "var(--ok)" }}>
            ✓ Notificările sunt activate. Vei fi anunțat despre scadențe și întârzieri.
          </p>
        ) : (
          <div>
            <p className="text-sm mb-3" style={{ color: "var(--muted)" }}>
              Primește alerte pentru scadențe (mâine / azi) și întârzieri (3 / 7 / 30 zile).
            </p>
            <button className="btn btn-primary" onClick={enableNotif}>
              <IconBell width={16} height={16} /> Activează notificările
            </button>
            {notifPerm === "denied" && (
              <p className="text-xs mt-2" style={{ color: "var(--danger)" }}>
                Notificările sunt blocate din setările browserului.
              </p>
            )}
          </div>
        )}

        {/* Real push notifications (work when the app is closed) */}
        <div className="hairline my-4" />
        <h3 className="font-bold text-sm mb-2">Push pe telefon (când aplicația e închisă)</h3>
        {!pushSupported() ? (
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            Browserul nu suportă push. Pe iPhone, adaugă aplicația pe ecranul principal
            (Share → „Adaugă pe ecranul principal”) și redeschide-o de acolo.
          </p>
        ) : pushStatus && !pushStatus.ready ? (
          <div className="panel p-3" style={{ background: "var(--warn-soft)", border: "none" }}>
            <p className="text-sm font-semibold" style={{ color: "var(--warn)" }}>
              Serverul de notificări nu e configurat complet.
            </p>
            <ul className="text-xs mt-2 space-y-1" style={{ color: "var(--fg-2)" }}>
              <li>{pushStatus.storage ? "✓" : "✗"} Stocare (Vercel KV / Upstash)</li>
              <li>{pushStatus.vapid ? "✓" : "✗"} Chei VAPID (VAPID_PRIVATE_KEY)</li>
            </ul>
            <p className="text-xs mt-2" style={{ color: "var(--muted)" }}>
              Vezi pașii din <code>SETUP-NOTIFICARI.md</code> din proiect.
            </p>
          </div>
        ) : pushOn ? (
          <div className="space-y-2">
            <p className="text-sm" style={{ color: "var(--ok)" }}>
              ✓ Push activat pe acest dispozitiv.
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                className="btn btn-ghost btn-sm"
                disabled={pushBusy}
                onClick={async () => {
                  setPushBusy(true);
                  const ok = await sendTestPush();
                  setPushBusy(false);
                  setPushMsg(ok ? "✓ Test trimis. Ar trebui să primești o notificare." : "✗ Testul a eșuat.");
                }}
              >
                Trimite test
              </button>
              <button
                className="btn btn-danger btn-sm"
                disabled={pushBusy}
                onClick={async () => {
                  setPushBusy(true);
                  await disablePush();
                  setPushBusy(false);
                  setPushOn(false);
                  setPushMsg(null);
                }}
              >
                Dezactivează push
              </button>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-sm mb-3" style={{ color: "var(--muted)" }}>
              Primește notificări pe telefon chiar și când aplicația e închisă.
            </p>
            <button className="btn btn-primary" disabled={pushBusy} onClick={doEnablePush}>
              <IconBell width={16} height={16} />
              {pushBusy ? "Se activează…" : "Activează push pe telefon"}
            </button>
          </div>
        )}
        {pushMsg && <p className="text-sm mt-2">{pushMsg}</p>}
      </div>

      {/* Security */}
      <div className="card p-5">
        <h2 className="font-bold mb-2">Securitate</h2>
        {!cryptoSupported() ? (
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            Criptarea nu este disponibilă în acest context (necesită HTTPS).
          </p>
        ) : store.encryptionEnabled ? (
          <div className="space-y-3">
            <p className="text-sm" style={{ color: "var(--ok)" }}>
              🔒 Datele sunt criptate și blocate cu PIN.
            </p>
            {bioAvailable && (
              <div className="flex items-center gap-2">
                {bioOn ? (
                  <span className="badge badge-ok">Biometrie activă</span>
                ) : (
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={async () => {
                      const ok = await store.enableBiometric();
                      setBioOn(ok);
                      if (!ok) alert("Nu am putut activa biometria pe acest dispozitiv.");
                    }}
                  >
                    Activează Face ID / Touch ID
                  </button>
                )}
              </div>
            )}
            <ConfirmButton
              className="btn btn-danger"
              message="Dezactivezi criptarea și PIN-ul? Datele redevin necriptate."
              onConfirm={async () => {
                await store.disableEncryption();
                setBioOn(false);
              }}
            >
              Dezactivează PIN & criptare
            </ConfirmButton>
          </div>
        ) : (
          <div>
            <p className="text-sm mb-3" style={{ color: "var(--muted)" }}>
              Setează un cod PIN. Datele vor fi <b>criptate</b> pe dispozitiv (AES-256) și
              vor cere PIN la fiecare deschidere.
            </p>
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
                onClick={async () => {
                  const ok = await store.enableEncryption(pin);
                  setPin("");
                  if (!ok) alert("Nu am putut activa criptarea.");
                }}
              >
                Activează
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Backup */}
      <div className="card p-5">
        <h2 className="font-bold mb-3">Backup & Export</h2>
        <div className="flex flex-wrap gap-2">
          <button className="btn btn-ghost" onClick={() => download("debt-manager-backup.json", store.exportState(), "application/json")}>
            <IconDownload width={16} height={16} /> Backup JSON
          </button>
          <button
            className="btn btn-ghost"
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
            <IconDownload width={16} height={16} /> Export Excel (.xlsx)
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
