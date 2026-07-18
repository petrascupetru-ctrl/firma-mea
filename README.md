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
- **Notificări** — scadențe mâine / azi / întârzieri 3/7/30 zile.
- **Remindere** — SMS, WhatsApp și Email cu mesaj generat automat.
- **PDF** — generare contract de împrumut și chitanță (print / salvare ca PDF).
- **Calculator** — rest de plată, dobândă, penalități de întârziere.
- **Calendar** cu toate scadențele.
- **Valute** — RON, EUR, USD, GBP, CHF cu conversie automată.
- **Rapoarte** — sinteză lunară / anuală, top datornici, total recuperat / restant.
- **Export** — CSV, JSON (backup), PDF.
- **Backup & restaurare** dintr-un singur buton.
- **Securitate** — blocare cu cod PIN pe dispozitiv.
- **Audit log** — istoricul modificărilor.
- **Temă** — Dark Mode / Light Mode, design premium, animații fluide, responsive.

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
