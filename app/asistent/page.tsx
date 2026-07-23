"use client";

import { useEffect, useRef, useState } from "react";
import { IconWallet } from "../components/Icons";
import { buildAiSnapshot } from "../lib/aiData";
import { useStore } from "../lib/store";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "Cine îmi datorează cei mai mulți bani?",
  "Cine întârzie cu plata și de câte zile?",
  "Fă-mi un rezumat al situației datoriilor.",
  "Scrie un mesaj de reminder politicos pentru cei cu restanțe.",
  "Cât ar trebui să încasez luna viitoare?",
];

// Minimal, safe Markdown rendering (bold + line breaks + list bullets).
function renderMd(text: string): React.ReactNode {
  return text.split("\n").map((line, i) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/g).map((seg, j) =>
      seg.startsWith("**") && seg.endsWith("**") ? (
        <b key={j}>{seg.slice(2, -2)}</b>
      ) : (
        seg
      ),
    );
    return (
      <span key={i}>
        {parts}
        {i < text.split("\n").length - 1 && <br />}
      </span>
    );
  });
}

export default function AssistantPage() {
  const store = useStore();
  const [status, setStatus] = useState<{ ready: boolean } | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/ai")
      .then((r) => r.json())
      .then(setStatus)
      .catch(() => setStatus({ ready: false }));
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, busy]);

  const send = async (text: string) => {
    const q = text.trim();
    if (!q || busy) return;
    setError(null);
    const next: ChatMessage[] = [...messages, { role: "user", content: q }];
    setMessages(next);
    setInput("");
    setBusy(true);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: next,
          data: buildAiSnapshot(store.people, store.loans, store.payments, store.settings),
        }),
      });
      if (!res.ok) {
        const { error: code } = await res.json().catch(() => ({ error: "server" }));
        setError(
          code === "not-configured" || code === "bad-key"
            ? "Cheia API nu este configurată sau este invalidă (vezi panoul de mai sus)."
            : code === "rate-limited"
              ? "Prea multe cereri. Așteaptă puțin și încearcă din nou."
              : "A apărut o eroare. Încearcă din nou.",
        );
        setMessages(messages); // roll back the optimistic user message
        setInput(q);
        return;
      }
      const { reply } = (await res.json()) as { reply: string };
      setMessages([...next, { role: "assistant", content: reply }]);
    } catch {
      setError("Nu am putut contacta serverul. Verifică internetul.");
      setMessages(messages);
      setInput(q);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4" style={{ maxWidth: 820 }}>
      <div>
        <h1 className="text-2xl font-extrabold">Asistent AI</h1>
        <p className="text-sm" style={{ color: "var(--muted)" }}>
          Întreabă orice despre datoriile tale — analize, rezumate, mesaje de reminder.
        </p>
      </div>

      {status && !status.ready && (
        <div className="panel p-4" style={{ background: "var(--warn-soft)", border: "none" }}>
          <p className="text-sm font-semibold" style={{ color: "var(--warn)" }}>
            Asistentul AI nu este configurat încă.
          </p>
          <p className="text-xs mt-1" style={{ color: "var(--fg-2)" }}>
            Adaugă variabila <code>ANTHROPIC_API_KEY</code> în Vercel (Settings → Environment
            Variables) cu o cheie de la <b>console.anthropic.com</b>, apoi Redeploy. Pașii
            compleți sunt în <code>SETUP-ASISTENT-AI.md</code> din proiect.
          </p>
        </div>
      )}

      {/* Chat area */}
      <div className="card p-4 flex flex-col" style={{ minHeight: "50vh" }}>
        <div className="flex-1 space-y-3 overflow-y-auto" style={{ maxHeight: "55vh" }}>
          {messages.length === 0 && (
            <div className="text-center py-8">
              <div
                className="mx-auto mb-3 flex items-center justify-center rounded-2xl"
                style={{ width: 52, height: 52, background: "var(--brand-soft)", color: "var(--brand-2)" }}
              >
                <IconWallet width={26} height={26} />
              </div>
              <p className="text-sm mb-4" style={{ color: "var(--muted)" }}>
                Încearcă una dintre întrebările de mai jos:
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {SUGGESTIONS.map((s) => (
                  <button key={s} className="chip" style={{ cursor: "pointer" }} onClick={() => send(s)}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className="rounded-2xl px-4 py-2.5 text-sm"
                style={{
                  maxWidth: "85%",
                  background: m.role === "user" ? "var(--brand)" : "var(--surface-2)",
                  color: m.role === "user" ? "#fff" : "var(--fg)",
                  whiteSpace: "pre-wrap",
                }}
              >
                {m.role === "assistant" ? renderMd(m.content) : m.content}
              </div>
            </div>
          ))}
          {busy && (
            <div className="flex justify-start">
              <div className="rounded-2xl px-4 py-2.5 text-sm" style={{ background: "var(--surface-2)", color: "var(--muted)" }}>
                Se gândește…
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {error && (
          <p className="text-sm mt-2" style={{ color: "var(--danger)" }}>
            {error}
          </p>
        )}

        <div className="flex gap-2 mt-3 pt-3" style={{ borderTop: "1px solid var(--border)" }}>
          <input
            className="input"
            placeholder="Întreabă asistentul…"
            value={input}
            disabled={busy}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send(input)}
          />
          <button className="btn btn-primary" disabled={busy || !input.trim()} onClick={() => send(input)}>
            Trimite
          </button>
        </div>
        <p className="mt-2" style={{ fontSize: "0.68rem", color: "var(--muted)" }}>
          Când pui o întrebare, un rezumat al datelor (nume, sume, scadențe — fără poze,
          documente sau CNP) este trimis către Claude (Anthropic) pentru a genera răspunsul.
        </p>
      </div>
    </div>
  );
}
