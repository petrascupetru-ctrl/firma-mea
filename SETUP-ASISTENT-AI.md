# Configurare Asistent AI

Aplicația are un **Asistent AI** (pagina „Asistent AI" din meniu) care ține evidența
cu tine: îl întrebi în limbaj natural cine îți datorează bani, cine întârzie, îți
face rezumate și îți scrie mesaje de reminder.

Asistentul folosește modelul **Claude** de la Anthropic. Ca să funcționeze, ai
nevoie de o **cheie API** (durează ~5 minute):

## Pasul 1 — Creează o cheie API

1. Intră pe **https://console.anthropic.com** și creează-ți un cont.
2. Adaugă o metodă de plată (Billing). Costul este per utilizare — pentru uz
   personal, câțiva cenți pe conversație.
3. Mergi la **API Keys → Create Key**, dă-i un nume (ex. `debt-manager`) și
   copiază cheia (începe cu `sk-ant-`). Se afișează o singură dată — păstreaz-o.

## Pasul 2 — Adaugă cheia în Vercel

1. În proiectul tău din Vercel: **Settings → Environment Variables**.
2. Adaugă:

| Nume | Valoare |
|---|---|
| `ANTHROPIC_API_KEY` | cheia ta `sk-ant-...` |

3. Apasă **Redeploy** (Deployments → ⋯ → Redeploy).

## Pasul 3 — Gata

Deschide pagina **Asistent AI** — panoul galben de configurare dispare și poți
pune întrebări. Exemple:

- „Cine îmi datorează cei mai mulți bani?"
- „Cine întârzie și de câte zile?"
- „Scrie un mesaj de reminder pentru Bogdan."
- „Cât ar trebui să încasez luna viitoare?"

## Confidențialitate

- Cheia API stă **doar pe server** (Vercel) — nu ajunge niciodată în browser.
- Când pui o întrebare, se trimite către API-ul Anthropic un **rezumat text** al
  datelor (nume, sume, scadențe, plăți). **Nu se trimit** fotografii, documente,
  semnături sau CNP-uri.
- Dacă nu pui întrebări, nu se trimite nimic — asistentul e complet opțional.

## Opțional

- Poți schimba modelul cu variabila `AI_MODEL` (implicit `claude-opus-4-8`).
