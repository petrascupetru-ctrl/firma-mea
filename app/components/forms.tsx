"use client";

import { useEffect, useRef, useState } from "react";
import { personFullName, todayISO } from "../lib/calc";
import { useStore } from "../lib/store";
import {
  CURRENCIES,
  PAYMENT_METHODS,
  type Attachment,
  type Currency,
  type Loan,
  type PaymentMethod,
  type Person,
} from "../lib/types";
import { IconEdit } from "./Icons";

// Read a File into a (optionally downscaled) data URL.
export function fileToDataUrl(file: File, maxDim = 1000): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      if (!file.type.startsWith("image/")) return resolve(result);
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve(result);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      img.onerror = () => resolve(result);
      img.src = result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const LABEL_PRESETS = ["Prieteni", "Familie", "Clienți", "Angajați", "Alții"];

export function PersonForm({
  person,
  onDone,
}: {
  person?: Person;
  onDone: () => void;
}) {
  const store = useStore();
  const [firstName, setFirstName] = useState(person?.firstName ?? "");
  const [lastName, setLastName] = useState(person?.lastName ?? "");
  const [nickname, setNickname] = useState(person?.nickname ?? "");
  const [phone, setPhone] = useState(person?.phone ?? "");
  const [email, setEmail] = useState(person?.email ?? "");
  const [address, setAddress] = useState(person?.address ?? "");
  const [cnp, setCnp] = useState(person?.cnp ?? "");
  const [notes, setNotes] = useState(person?.notes ?? "");
  const [labels, setLabels] = useState<string[]>(person?.labels ?? []);
  const [photo, setPhoto] = useState<string | undefined>(person?.photo);

  const toggleLabel = (l: string) =>
    setLabels((cur) => (cur.includes(l) ? cur.filter((x) => x !== l) : [...cur, l]));

  const submit = () => {
    if (!firstName.trim() && !lastName.trim()) {
      alert("Introdu cel puțin numele sau prenumele.");
      return;
    }
    const payload = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      nickname: nickname.trim(),
      phone: phone.trim(),
      email: email.trim(),
      address: address.trim(),
      cnp: cnp.trim(),
      notes: notes.trim(),
      labels,
      photo,
    };
    if (person) store.updatePerson(person.id, payload);
    else store.addPerson(payload);
    onDone();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <label className="cursor-pointer">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (f) setPhoto(await fileToDataUrl(f, 500));
            }}
          />
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photo}
              alt="foto"
              className="avatar"
              style={{ width: 64, height: 64, objectFit: "cover" }}
            />
          ) : (
            <span
              className="avatar"
              style={{ width: 64, height: 64, fontSize: 22 }}
            >
              +
            </span>
          )}
        </label>
        <div className="text-sm" style={{ color: "var(--muted)" }}>
          Apasă pe cerc pentru a adăuga o fotografie.
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Nume</label>
          <input className="input" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Andrei" />
        </div>
        <div>
          <label className="label">Prenume</label>
          <input className="input" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Popescu" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Poreclă</label>
          <input className="input" value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="opțional" />
        </div>
        <div>
          <label className="label">Telefon</label>
          <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="07xx xxx xxx" />
        </div>
      </div>

      <div>
        <label className="label">Email</label>
        <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="opțional" />
      </div>

      <div>
        <label className="label">Adresă</label>
        <input className="input" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="opțional" />
      </div>

      <div>
        <label className="label">CNP (opțional)</label>
        <input className="input" value={cnp} onChange={(e) => setCnp(e.target.value)} placeholder="opțional" />
      </div>

      <div>
        <label className="label">Etichete</label>
        <div className="flex flex-wrap gap-2">
          {LABEL_PRESETS.map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => toggleLabel(l)}
              className={`chip ${labels.includes(l) ? "badge-brand" : ""}`}
              style={labels.includes(l) ? { borderColor: "transparent" } : undefined}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="label">Observații</label>
        <textarea className="textarea" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button className="btn btn-ghost" onClick={onDone}>Anulează</button>
        <button className="btn btn-primary" onClick={submit}>
          {person ? "Salvează" : "Adaugă persoană"}
        </button>
      </div>
    </div>
  );
}

export function LoanForm({
  loan,
  presetPersonId,
  onDone,
}: {
  loan?: Loan;
  presetPersonId?: string;
  onDone: () => void;
}) {
  const store = useStore();
  const [personId, setPersonId] = useState(loan?.personId ?? presetPersonId ?? store.people[0]?.id ?? "");
  const [amount, setAmount] = useState(loan ? String(loan.amount) : "");
  const [currency, setCurrency] = useState<Currency>(loan?.currency ?? store.settings.baseCurrency);
  const [date, setDate] = useState(loan?.date ?? todayISO());
  const [dueDate, setDueDate] = useState(loan?.dueDate ?? todayISO());
  const [interestRate, setInterestRate] = useState(loan ? String(loan.interestRate) : "0");
  const [reason, setReason] = useState(loan?.reason ?? "");
  const [method, setMethod] = useState<PaymentMethod>(loan?.method ?? "numerar");
  const [contractPhoto, setContractPhoto] = useState<string | undefined>(loan?.contractPhoto);
  const [documents, setDocuments] = useState<Attachment[]>(loan?.documents ?? []);
  const [notes, setNotes] = useState(loan?.notes ?? "");
  const [location, setLocation] = useState(loan?.location ?? "");
  const [signature, setSignature] = useState<string | undefined>(loan?.signature);

  const submit = () => {
    const amt = parseFloat(amount);
    if (!personId) return alert("Alege o persoană.");
    if (!amt || amt <= 0) return alert("Introdu o sumă validă.");
    const payload = {
      personId,
      amount: amt,
      currency,
      date,
      dueDate,
      interestRate: parseFloat(interestRate) || 0,
      reason: reason.trim(),
      method,
      contractPhoto,
      documents,
      notes: notes.trim(),
      location: location.trim(),
      signature,
    };
    if (loan) store.updateLoan(loan.id, payload);
    else store.addLoan(payload);
    onDone();
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="label">Persoana</label>
        <select className="select" value={personId} onChange={(e) => setPersonId(e.target.value)}>
          {store.people.length === 0 && <option value="">— nicio persoană —</option>}
          {store.people.map((p) => (
            <option key={p.id} value={p.id}>{personFullName(p)}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2">
          <label className="label">Sumă</label>
          <input className="input" type="number" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="1000" />
        </div>
        <div>
          <label className="label">Monedă</label>
          <select className="select" value={currency} onChange={(e) => setCurrency(e.target.value as Currency)}>
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Data împrumutului</label>
          <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div>
          <label className="label">Data scadenței</label>
          <input className="input" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Dobândă (%)</label>
          <input className="input" type="number" inputMode="decimal" value={interestRate} onChange={(e) => setInterestRate(e.target.value)} placeholder="0" />
        </div>
        <div>
          <label className="label">Metodă plată</label>
          <select className="select" value={method} onChange={(e) => setMethod(e.target.value as PaymentMethod)}>
            {PAYMENT_METHODS.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="label">Motiv</label>
        <input className="input" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="ex. reparație mașină" />
      </div>

      <div>
        <label className="label">Locație (opțional)</label>
        <input className="input" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="ex. Alba Iulia" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Fotografie contract</label>
          <label className="btn btn-ghost btn-sm w-full cursor-pointer">
            {contractPhoto ? "Schimbă poza" : "Încarcă poză"}
            <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
              const f = e.target.files?.[0];
              if (f) setContractPhoto(await fileToDataUrl(f));
            }} />
          </label>
        </div>
        <div>
          <label className="label">Documente</label>
          <label className="btn btn-ghost btn-sm w-full cursor-pointer">
            Adaugă fișiere ({documents.length})
            <input type="file" accept="image/*,application/pdf" multiple className="hidden" onChange={async (e) => {
              const files = Array.from(e.target.files ?? []);
              const atts: Attachment[] = [];
              for (const f of files) {
                atts.push({
                  id: Math.random().toString(36).slice(2),
                  name: f.name,
                  type: f.type,
                  dataUrl: await fileToDataUrl(f),
                  addedAt: new Date().toISOString(),
                });
              }
              setDocuments((d) => [...d, ...atts]);
            }} />
          </label>
        </div>
      </div>

      {contractPhoto && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={contractPhoto} alt="contract" style={{ maxHeight: 120, borderRadius: 10 }} />
      )}

      <div>
        <label className="label">Semnătură la acordare</label>
        <SignaturePad value={signature} onChange={setSignature} />
      </div>

      <div>
        <label className="label">Observații</label>
        <textarea className="textarea" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button className="btn btn-ghost" onClick={onDone}>Anulează</button>
        <button className="btn btn-primary" onClick={submit}>
          {loan ? "Salvează" : "Adaugă împrumut"}
        </button>
      </div>
    </div>
  );
}

export function PaymentForm({
  loanId,
  suggested,
  currency,
  onDone,
}: {
  loanId: string;
  suggested?: number;
  currency: Currency;
  onDone: () => void;
}) {
  const store = useStore();
  const [amount, setAmount] = useState(suggested ? String(suggested) : "");
  const [date, setDate] = useState(todayISO());
  const [method, setMethod] = useState<PaymentMethod>("numerar");
  const [note, setNote] = useState("");

  const submit = () => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return alert("Introdu o sumă validă.");
    store.addPayment({ loanId, amount: amt, date, method, note: note.trim() });
    onDone();
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button
          className="btn btn-ghost btn-sm flex-1"
          onClick={() => setAmount(suggested ? String(suggested) : "")}
        >
          Plată integrală ({suggested ?? 0} {currency})
        </button>
        <button className="btn btn-ghost btn-sm flex-1" onClick={() => setAmount("")}>
          Plată parțială
        </button>
      </div>
      <div>
        <label className="label">Sumă ({currency})</label>
        <input className="input" type="number" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} autoFocus />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Data</label>
          <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div>
          <label className="label">Metodă</label>
          <select className="select" value={method} onChange={(e) => setMethod(e.target.value as PaymentMethod)}>
            {PAYMENT_METHODS.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="label">Notă</label>
        <input className="input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="opțional" />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button className="btn btn-ghost" onClick={onDone}>Anulează</button>
        <button className="btn btn-primary" onClick={submit}>Înregistrează plata</button>
      </div>
    </div>
  );
}

export function SignaturePad({
  value,
  onChange,
}: {
  value?: string;
  onChange: (v: string | undefined) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);

  // Preload an existing signature (e.g. when editing a loan).
  useEffect(() => {
    if (!value || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;
    const img = new Image();
    img.onload = () => ctx.drawImage(img, 0, 0, canvasRef.current!.width, canvasRef.current!.height);
    img.src = value;
    // Only run once on mount for the initial value.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pos = (e: React.PointerEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * canvas.width,
      y: ((e.clientY - rect.top) / rect.height) * canvas.height,
    };
  };

  const start = (e: React.PointerEvent) => {
    drawing.current = true;
    const ctx = canvasRef.current!.getContext("2d")!;
    ctx.strokeStyle = "#7c6cff";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    const { x, y } = pos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };
  const move = (e: React.PointerEvent) => {
    if (!drawing.current) return;
    const ctx = canvasRef.current!.getContext("2d")!;
    const { x, y } = pos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };
  const end = () => {
    if (!drawing.current) return;
    drawing.current = false;
    onChange(canvasRef.current!.toDataURL("image/png"));
  };
  const clear = () => {
    const canvas = canvasRef.current!;
    canvas.getContext("2d")!.clearRect(0, 0, canvas.width, canvas.height);
    onChange(undefined);
  };

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={520}
        height={140}
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={end}
        onPointerLeave={end}
        style={{
          width: "100%",
          height: 120,
          borderRadius: 12,
          border: "1px dashed var(--border-strong)",
          background: "var(--surface-2)",
          touchAction: "none",
          cursor: "crosshair",
        }}
      />
      <div className="flex items-center justify-between mt-1">
        <span style={{ fontSize: "0.7rem", color: "var(--muted)" }}>
          Semnează cu mouse-ul sau degetul.
        </span>
        <button type="button" className="btn btn-ghost btn-sm" onClick={clear}>
          <IconEdit width={13} height={13} /> Șterge
        </button>
      </div>
    </div>
  );
}
