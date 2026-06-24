# Avgjørelser — status

Begge de to viktige usikkerhetene er nå **avklart av deg** (✅). Resten er småvalg
jeg tok med beste skjønn, greit å vite om.

---

## ✅ 1. Telefonnummeret — AVKLART

- **Riktig:** `+47 908 46 461` — campens nummer. Står på siden, ingen endring nødvendig.
- 916-nummeret som dukket opp i offentlige kilder er et **privat nummer (din far)** og
  skal **ikke** brukes. Lar det være som det er.

## ✅ 2. Organisasjonsnummer / selskap — AVKLART

- **Riktig:** Campen «Træna Arctic Fishing» drives av **Helgeland Adventure AS,
  org.nr 989 945 262** (bekreftet i Brønnøysundregistrene — samme adresse,
  Stongveien 68, 8742 Selvær, bransjekode 55.200 ferieleiligheter, aktiv).
- «Træna Rorbuferie AS» (min tidligere gjetning) var **feil** — det er en annen
  fiskecamp på naboøya. Nå rettet.
- Lagt inn på `personvern.html` (lovpålagt, foretaksregisterloven §10-2).
- For domeneregistrering (PUBLISER.md steg 1): registrer gjerne `.no`-domenet på
  **Helgeland Adventure AS / 989 945 262**.

## ✅ 3. Domene — AVKLART: `.com` som hoved, `.no` videresender

- Campen har flest **utenlandske gjester**, så **`traenaarcticfishing.com`** er valgt
  som hovedadresse, med **`traenaarcticfishing.no`** som videresender dit.
- `.com` er skrevet inn i de tre tekniske filene (`robots.txt`, `sitemap.xml`,
  `.well-known/security.txt`). Begge domenene kobles på samme Vercel-prosjekt
  (se PUBLISER.md steg 1 + 3).
- Lander du på et annet navn enn `traenaarcticfishing.com`, si fra — 2 min å bytte.

## 🟡 4. Fjernet betaling, admin og backend (som bestilt)

- Slettet `booking-app/` (Python-backend + admin) og `bestilling.html`
  (Stripe/Vipps-betalingsprototype). De var allerede holdt utenfor den
  publiserte siden, men nå er de borte helt — i tråd med ønsket ditt.
- **Booking skjer nå kun via:** «Book på DinTur»-knappen + forespørsels-e-post til
  `traenaarctic@gmail.com`. Ingen betaling eller innlogging på siden.

## 🟡 5. E-postadresse beholdt: `traenaarctic@gmail.com`

- Du nevnte `yngve.myhre@gmail.com` som mulig fallback. Men jeg **fant en bekreftet
  offentlig e-post**: `traenaarctic@gmail.com` (Visit Helgeland + Visit Norway +
  lå allerede i koden). `yngve.myhre@gmail.com` finnes ikke offentlig noe sted.
- **Derfor beholdt jeg `traenaarctic@gmail.com`.** Vil du heller bruke en annen
  adresse, si fra — det er ett søk-og-erstatt.

## 🟢 6. Personvern: ingen «cookie-banner»

- Siden har **ingen sporing, analyse eller reklame**. Den eneste lagringen er
  språk/valuta-valget i din egen nettleser, som er «strengt nødvendig» og dermed
  unntatt samtykkekrav (ekomloven §3-15). **Konklusjon: ingen cookie-banner trengs.**
- Lagde i stedet en ærlig **personvernerklæring** (`personvern.html`, på NO/EN/DE)
  som forklarer hva vi får (kun det du sender via skjemaet), at vi **ikke selger
  data**, dine rettigheter, og klagerett til Datatilsynet.

## 🟢 7. Selv-hostet skrifttypene (Google Fonts)

- Siden lastet før skrifttyper fra Google, som sender besøkendes IP til Google
  (en kjent personvern-snublestein, jf. tysk dom 2022). Jeg **lastet ned
  skriftene og serverer dem fra siden selv** — da deles ingen IP med Google, og det
  trengs ikke samtykke. Bonus: siden laster litt raskere.

## 🟢 8. Rettet DinTur-lenkene (EN/DE var døde)

- De engelske og tyske «Book»-knappene pekte på adresser som ga **404**. Rettet til
  riktige adresser (`/en/holidayhome/...` og `/de/ferienhaus/...`). Alle tre språk
  er testet og gir nå status 200.

## 🟢 9. Småvalg (svært lav usikkerhet)

- **Lagringstid** i personvern satt til «normalt innen 12 måneder» — et fornuftig
  standardvalg; juster gjerne.
- **Sikkerhets-headere** lagt til (CSP, Permissions-Policy m.m.) i `vercel.json`
  + en `_headers`-fil så siden er trygg uansett vert. `style-src` tillater
  inline-stiler (siden bruker bakgrunnsbilder via `style=`-attributter) — `script-src`
  er holdt strengt, som er det som betyr noe mot angrep.
- **HSTS med `preload`** beholdt (forplikter domenet til alltid HTTPS — helt greit
  for en ny side).
- **Favicon** lagt til (lite midnattssol-over-bølger-ikon) så fanen ser ferdig ut.
- **Adresse** på personvern-siden: brukte den fulle, offentlig bekreftede
  «Stongveien 68, 8742 Selvær». Bunnteksten viser fortsatt kun «8742 Selvær, Træna».

---

### Kort oppsummert hva du må gjøre
Begge fakta er avklart og lagt inn. **Følg `PUBLISER.md`** for å gå live —
registrer domenet på Helgeland Adventure AS (989 945 262).
