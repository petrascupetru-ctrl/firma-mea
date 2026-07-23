# Debt Manager Pro

Aplicație premium pentru administrarea banilor împrumutați altor persoane.
Știi în orice moment cui ai împrumutat, cât ai de recuperat, cine întârzie și
cât ai încasat până acum.

Construită cu **Next.js 16** (App Router) + **React 19** + **Tailwind CSS v4**.
Datele sunt salvate local în browser (localStorage), deci aplicația
funcționează complet **offline**.

## Funcționalități

- **Dashboard** — total de recuperat, persoane, încasări luna curentă, restanțe,
  scadențe în 7 zile, cele mai mari datorii, ultimele activități, plus grafice
  (împrumuturi vs. recuperări, evoluția încasărilor, status datorii).
- **Persoane** — fotografie, nume, prenume, poreclă, telefon, email, adresă, CNP,
  observații, etichete (Prieteni / Familie / Clienți / Angajați), arhivare.
- **Împrumuturi** — sumă, monedă, dată, scadență, dobândă, motiv, metodă de plată,
  fotografie contract, documente atașate, semnătură pe ecran, locație.
- **Plăți** — plată integrală sau parțială, istoric complet, rest de plată.
- **Cronologie** — istoricul fiecărei persoane (împrumuturi + plăți).
- **Status colorat** — 🟢 Achitat · 🟡 Aproape de scadență · 🔴 Restanță.
- **Căutare** rapidă (nume, telefon, sumă, dată, observații) și **filtre**
  (restante, achitate, luna/anul curent, peste 1000, după persoană).
- **Asistent AI** — chat în română care ține evidența cu tine: cine datorează,
  cine întârzie, rezumate, prognoze și mesaje de reminder generate automat
  (Claude / Anthropic; necesită `ANTHROPIC_API_KEY` — vezi `SETUP-ASISTENT-AI.md`).
- **Notificări** — alerte în browser (scadențe mâine / azi, întârzieri 3/7/30 zile),
  plus centrul de notificări din aplicație.
- **Remindere** — WhatsApp și Email cu mesaj generat automat.
- **OCR** — scanare bon/chitanță pentru completarea automată a sumei (Tesseract.js).
- **PDF** — generare contract de împrumut și chitanță (print / salvare ca PDF).
- **Calculator** — rest de plată, dobândă, penalități de întârziere.
- **Calendar** cu toate scadențele.
- **Valute** — RON, EUR, USD, GBP, CHF cu conversie și **cursuri live** (BCE / frankfurter.app).
- **Rapoarte** — sinteză lunară / anuală, top datornici, total recuperat / restant.
- **Export** — CSV, **Excel (.xlsx)**, JSON (backup), PDF.
- **Backup & restaurare** dintr-un singur buton.
- **Securitate** — blocare cu cod PIN și **criptarea datelor (AES-256)** pe dispozitiv,
  deblocare cu **Face ID / Touch ID** (WebAuthn).
- **PWA** — instalabilă pe telefon (iconiță pe ecran) și funcționează **offline**.
- **Audit log** — istoricul modificărilor.
- **Temă** — Dark Mode / Light Mode, design premium, animații fluide, responsive.

> Datele se salvează local pe dispozitiv (localStorage). Sincronizarea automată între
> dispozitive, backup-ul automat în cloud și notificările push când aplicația e închisă
> necesită un backend (ex. Firebase) și nu sunt incluse în această versiune.

## Dezvoltare

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # build de producție
npm start        # rulează build-ul
npm run lint
```

Datele demonstrative se încarcă automat la prima pornire. Din **Setări** poți
reîncărca datele demo, șterge tot, exporta/importa un backup sau seta un cod PIN.
