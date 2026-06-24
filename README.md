# Træna Arctic Fishing — nettside

Tre-språklig (norsk/engelsk/tysk) statisk nettside for fiskecampen på Selvær i Træna.

Ingen rammeverk, ingen byggesteg. Det gjør den billig å hoste og lett å vedlikeholde.

```
index.html        — forsiden
facilities.html   — leilighetene (interiør, fasiliteter)
fiske.html        — fangstgalleri + sløyerommet
booking.html      — 6 leiligheter m/pris + 8 båter, DinTur-knapp + forespørselsskjema
personvern.html   — personvernerklæring (NO/EN/DE)
styles.css        — designet + selv-hostede skrifttyper (@font-face øverst)
script.js         — språkbytte (NO/EN/DE), valuta, meny, skjema
fonts/            — Fraunces + Inter (lastet ned fra Google, servert lokalt = GDPR-rent)
images/           — bildene som vises på siden
vercel.json       — sikkerhets-headere + pene adresser (Vercel)
_headers          — samme sikkerhets-headere for Cloudflare Pages / Netlify
```

**Booking:** Siden selger ingenting selv. Gjester booker via **DinTur**-knappen
eller sender en **forespørsel-e-post** (mailto, ingen server). Ingen betaling,
ingen admin, ingen backend.

**Publisering:** se **`PUBLISER.md`** (steg-for-steg) og **`NOTES-usikkerheter.md`**
(ting som bør bekreftes før live).

Språkvelgeren (NO/EN/DE oppe til høyre) bytter all tekst. Hvert flerspråklige element har tre attributter: `data-no`, `data-en`, `data-de`.

## Se siden lokalt

Åpne `index.html` rett i nettleseren, eller kjør en liten server for at alt skal oppføre seg som på nett:

```bash
cd ~/traena-arctic-fishing
python3 -m http.server 8000
# åpne http://localhost:8000
```

## Slik bytter du tekst

All tekst ligger i `index.html`. Hvert element som finnes på to språk har to attributter:

```html
<h2 data-no="Bo rett ved båten" data-en="Sleep steps from the boat">Bo rett ved båten</h2>
```

Rediger `data-no` (norsk) og `data-en` (engelsk). Teksten mellom taggene vises før JavaScript laster, så hold den lik `data-no`.

## Slik legger du inn bilder

1. Legg bildefilene i `images/` (f.eks. `leiligheter.jpg`, `bat.jpg`, `selvar.jpg`).
2. Finn bildefeltene i `index.html` — de er merket med `data-img="..."`:
   - `data-img="leiligheter"` → leilighetene
   - `data-img="bat"` → båten
   - `data-img="selvar"` → Selvær (stort bilde)
3. For hvert felt, bytt ut plassholderen ved å sette bildet som bakgrunn. Enten i `index.html`:

   ```html
   <figure class="split__media" data-img="leiligheter"
           style="background-image:url('images/leiligheter.jpg')">
   ```

   ...eller samlet i `styles.css`:

   ```css
   [data-img="leiligheter"] { background-image: url("images/leiligheter.jpg"); }
   [data-img="bat"]         { background-image: url("images/bat.jpg"); }
   [data-img="selvar"]      { background-image: url("images/selvar.jpg"); }
   ```

   Når et bilde er på plass kan du slette `<span class="ph">…</span>`-plassholderen inni feltet.

4. **Hero-bildet** (toppen): i `styles.css`, finn `.hero__media` og legg til et bilde over gradienten:

   ```css
   .hero__media {
     background:
       linear-gradient(180deg, rgba(7,23,31,.35), rgba(7,23,31,.7)),
       url("images/hero.jpg") center/cover;
   }
   ```

## Ting som bør bekreftes (se NOTES-usikkerheter.md)

- **E-post:** `traenaarctic@gmail.com` (bekreftet offentlig — Visit Helgeland/Visit
  Norway). Ligger i alle footere og i `script.js` (`MAIL_TO`).
- **Telefon:** `+47 908 46 461` (bekreftet — campens nummer). 916-nummeret i
  offentlige kilder er et privat nummer som ikke skal brukes.
- **Org.nr:** Drives av **Helgeland Adventure AS, org.nr 989 945 262** (bekreftet i
  Brønnøysundregistrene, samme adresse). Vises på `personvern.html` (lovpålagt).

## Kontaktskjema

Skjemaet åpner gjestens eget e-postprogram med forespørselen ferdig utfylt (`mailto:`). Det krever ingen server og virker overalt.

Vil dere heller få forespørslene rett i innboksen uten at gjesten må ha e-postprogram satt opp, kan en gratis skjematjeneste kobles på senere (f.eks. [Formspree](https://formspree.io)). Da må CSP-en i `vercel.json`/`_headers` utvides med tjenestens domene under `form-action`/`connect-src`.

## Legg siden på nett

Se **`PUBLISER.md`** for full steg-for-steg. Kort: koble GitHub-repoet til
**Vercel** (allerede satt opp via `vercel.json`), koble på domenet
`traenaarcticfishing.no`, slå på 2FA på alle kontoer, og meld siden inn til Google
Search Console.

## Personvern & sikkerhet

- Ingen sporing/analyse → **ingen cookie-banner nødvendig**. Personvernerklæring
  ligger i `personvern.html` (NO/EN/DE).
- Skrifttyper er **selv-hostet** (`fonts/`) så ingen IP deles med Google.
- Sikkerhets-headere (CSP, HSTS, m.m.) i `vercel.json` (+ `_headers` for andre verter).
