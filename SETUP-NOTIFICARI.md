# Configurare notificări push (reale, pe telefon)

Aplicația poate trimite notificări **chiar și când e închisă** (scadențe mâine/azi,
întârzieri 3/7/30 zile). Pentru asta are nevoie de:

1. o **stocare** (Vercel KV — gratuit) pentru abonamentele la notificări;
2. **chei VAPID** (semnătura mesajelor push);
3. un **cron** zilnic (deja configurat în `vercel.json`).

Durează ~10 minute, o singură dată. În aplicație, la **Setări → Notificări → Push pe
telefon**, vei vedea un panou care îți spune exact ce mai lipsește.

---

## Pasul 1 — Stocare (Vercel KV)

1. Intră pe proiectul tău în [vercel.com](https://vercel.com) → tab **Storage**.
2. **Create Database** → alege **KV** (Upstash Redis) → **Continue**.
3. Dă-i un nume (ex. `debt-manager`) → **Create**, apoi **Connect** la proiect.

Vercel adaugă automat variabilele `KV_REST_API_URL` și `KV_REST_API_TOKEN`. Gata.

## Pasul 2 — Chei VAPID

Ai două variante:

**A) Folosește cheile deja generate** (rapid):

```
VAPID_PUBLIC_KEY  = BMEXA84NwhBKX6W-bD2e0r9r0OZRjwWS8G6rBwK7dCC-gGd6C7rBpdCpCH4FjkyHmWfTulF_cfB9MXScW4WAV10
VAPID_PRIVATE_KEY = coCK94QEyJ85eD7msNqMEzG8AUJvQEhTdUpqstGtEMk
```

**B) Generează-ți propriile chei** (recomandat pentru securitate):

```bash
npx web-push generate-vapid-keys
```

## Pasul 3 — Variabile de mediu

În Vercel → proiect → **Settings → Environment Variables**, adaugă:

| Nume | Valoare |
|---|---|
| `VAPID_PRIVATE_KEY` | cheia privată de mai sus |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | cheia publică de mai sus |
| `VAPID_SUBJECT` | `mailto:emailul_tau@exemplu.ro` |
| `CRON_SECRET` | un text aleatoriu (ex. generat cu un parolier) |

> Cheia publică e deja inclusă în cod ca valoare implicită, dar dacă îți generezi
> propriile chei (varianta B), setează neapărat și `NEXT_PUBLIC_VAPID_PUBLIC_KEY`.

## Pasul 4 — Redeploy

După ce ai adăugat variabilele, apasă **Redeploy** (Deployments → ⋯ → Redeploy).
Cron-ul zilnic (ora 08:00 UTC) e deja definit în `vercel.json` și pornește automat.

## Pasul 5 — Activează pe telefon

1. Deschide aplicația pe telefon.
2. **iPhone:** Share → **Adaugă pe ecranul principal**, apoi deschide-o de acolo
   (push-ul pe iOS merge doar din aplicația instalată, iOS 16.4+).
   **Android:** meniul Chrome → **Instalează aplicația**.
3. **Setări → Notificări → Push pe telefon → Activează push**.
4. Apasă **Trimite test** — ar trebui să primești o notificare.

Gata! De acum vei primi remindere zilnice pentru scadențe și întârzieri.

---

### Cum funcționează (pe scurt)

- Telefonul se abonează la push și trimite către server o listă **minimă** de
  remindere (nume, sumă rămasă, scadență) — nu întreaga bază de date.
- În fiecare zi, cron-ul verifică ce e scadent/întârziat și trimite notificarea.
- Restul datelor rămân criptate/local pe telefon.

### Limite

- Pe **iPhone** push-ul merge doar dacă aplicația e adăugată pe ecranul principal.
- Cron-ul pe planul gratuit Vercel rulează **o dată pe zi** (suficient pentru
  remindere de scadență).
