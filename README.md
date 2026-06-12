# Træna Arctic Fishing — nettside

Tre-språklig (norsk/engelsk/tysk) statisk nettside for fiskecampen på Selvær i Træna.

Ingen rammeverk, ingen byggesteg. Det gjør den billig å hoste og lett å vedlikeholde.

```
index.html        — forsiden
facilities.html   — leilighetene (interiør, fasiliteter)
fiske.html        — fangstgalleri + sløyerommet
booking.html      — 6 leiligheter m/pris + 8 båter, og forespørselsskjema
styles.css        — designet (farger, layout)
script.js         — språkbytte (NO/EN/DE), meny, skjema
images/           — bildene som vises på siden
```

Språkvelgeren (NO/EN/DE oppe til høyre) bytter all tekst. Hvert flerspråklige element har tre attributter: `data-no`, `data-en`, `data-de`.

**Mangler bilde:** `fiske.html` har en plassholder for sløyerommet («Bilde kommer») — legg `images/sloyerom.jpg` inn og bytt plassholderen når dere har et bilde.

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

## Ting som må fylles inn (placeholders)

Søk i koden etter `TODO` og disse:

- **E-post (viktigst):** `post@traenaarcticfishing.no` står i `index.html` (footer) og i `script.js` (`MAIL_TO`). Jeg fant ikke campens egen e-post, så denne er en gjetning — bekreft eller bytt til riktig adresse, ellers forsvinner forespørslene fra skjemaet.
- **Telefon:** ikke lagt inn (fant ikke et nummer). Vil dere ha telefon i footeren, legg til en `<a href="tel:+47…">`-lenke ved siden av e-posten i `index.html`.
- **Adresse/postnummer:** sjekk «Selvær, 8770 Træna» i footeren.

## Kontaktskjema

Skjemaet åpner gjestens eget e-postprogram med forespørselen ferdig utfylt (`mailto:`). Det krever ingen server og virker overalt.

Vil dere heller få forespørslene rett i innboksen uten at gjesten må ha e-postprogram satt opp, bytt til en gratis skjematjeneste:

- [Formspree](https://formspree.io) eller [Netlify Forms](https://docs.netlify.com/forms/setup/) — lim inn et endepunkt, ferdig.

## Legg siden på nett (gratis)

Alle tre fungerer med ren statisk side:

- **Netlify:** dra mappa inn på <https://app.netlify.com/drop> — live på sekunder.
- **Vercel:** `vercel` i mappa, eller koble et GitHub-repo.
- **GitHub Pages:** push til et repo, slå på Pages.

Eget domene (f.eks. `traenaarcticfishing.no`) kobles på under «Domains» hos den du velger.

## Senere: ekte booking

Nå er booking forespørselsbasert. Vil dere ha kalender med ledige uker og betaling, kobler vi på et bookingsystem (Beds24, Lodgify, eller lenker til Airbnb/Booking.com). Det er et eget steg — si fra når dere er klare.
