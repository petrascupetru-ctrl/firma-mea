import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MODEL = process.env.AI_MODEL || "claude-opus-4-8";
const MAX_TURNS = 24; // cap history sent to the model

const SYSTEM_PROMPT = `Ești „Asistentul AI" din aplicația Debt Manager Pro — o aplicație personală în care utilizatorul ține evidența banilor împrumutați altor persoane.

Primești în fiecare cerere un instantaneu JSON cu datele curente ale utilizatorului (persoane, împrumuturi, plăți). Datele sunt reale și private — tratează-le cu grijă.

Rolul tău:
- Răspunzi la întrebări despre datorii: cine datorează, cât, de când, cine întârzie.
- Faci analize: top datornici, riscuri (întârzieri repetate), sume pe luni, prognoza încasărilor pe baza scadențelor.
- Compui mesaje de reminder (WhatsApp/SMS/email) politicoase în română, gata de copiat.
- Dai sfaturi practice de urmărire a datoriilor.

Reguli:
- Răspunde în română, concis și la obiect. Folosește sumele și numele exacte din date.
- Datele au valori în mai multe monede — nu le aduna între ele decât dacă convertești cu ratele incluse (rates = valoarea unei unități în RON).
- Dacă datele nu conțin răspunsul, spune sincer că nu ai informația.
- Nu inventa persoane, sume sau date. Azi este {TODAY}.
- Formatează cu Markdown simplu (liste, bold) când ajută.`;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function GET() {
  // Self-diagnostics for the UI.
  return NextResponse.json({
    ready: !!process.env.ANTHROPIC_API_KEY,
    model: MODEL,
  });
}

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "not-configured" }, { status: 503 });
  }
  try {
    const { messages, data } = (await req.json()) as {
      messages: ChatMessage[];
      data: unknown;
    };
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "no-messages" }, { status: 400 });
    }

    const history: Anthropic.MessageParam[] = messages
      .slice(-MAX_TURNS)
      .filter((m) => m && typeof m.content === "string" && m.content.trim())
      .map((m) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content.slice(0, 8000),
      }));

    const client = new Anthropic();
    const today = new Date().toISOString().slice(0, 10);

    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 4096,
      thinking: { type: "adaptive" },
      system: [
        { type: "text", text: SYSTEM_PROMPT.replace("{TODAY}", today) },
        {
          type: "text",
          text: `Datele curente ale utilizatorului (JSON):\n${JSON.stringify(data ?? {})}`,
        },
      ],
      messages: history,
    });

    if (response.stop_reason === "refusal") {
      return NextResponse.json({
        reply: "Nu pot răspunde la această cerere. Încearcă să reformulezi.",
      });
    }

    const reply = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();

    return NextResponse.json({ reply: reply || "Nu am găsit un răspuns." });
  } catch (e) {
    if (e instanceof Anthropic.AuthenticationError) {
      return NextResponse.json({ error: "bad-key" }, { status: 503 });
    }
    if (e instanceof Anthropic.RateLimitError) {
      return NextResponse.json({ error: "rate-limited" }, { status: 429 });
    }
    if (e instanceof Anthropic.APIError) {
      return NextResponse.json({ error: "api-error" }, { status: 502 });
    }
    return NextResponse.json({ error: "server" }, { status: 500 });
  }
}
