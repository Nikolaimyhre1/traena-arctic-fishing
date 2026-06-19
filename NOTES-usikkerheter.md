# Avgjørelser jeg tok på egen hånd — rangert etter usikkerhet

Du var ikke tilgjengelig, så jeg brukte beste skjønn og noterte alt her.
Rangert **mest usikker øverst**. Punkt 1 og 2 bør du sjekke før du går helt live;
resten er trygt, men greit å vite om.

---

## 🔴 1. Telefonnummeret (mest usikker — sjekk dette)

- **Hva siden viser:** `+47 908 46 461` (lå der fra før, i bunnteksten på alle sider).
- **Hva research fant:** ALLE offentlige oppføringer (Visit Helgeland, Visit Norway,
  DinTur, 180.no for Yngve Myhre) viser **+47 916 30 174**. Nummeret 908 46 461
  finnes ikke i noen offentlig kilde.
- **Hva jeg gjorde:** Jeg **beholdt nummeret som allerede sto på siden** (908 46 461),
  fordi det kan være et nyere/privat nummer du selv la inn — jeg ville ikke overstyre
  uten å vite.
- **Du gjør:** Bekreft hvilket som er riktig. Skal det byttes, finnes det to steder
  per side: visningsteksten og `tel:`-lenken (`tel:+4790846461`). Søk etter `90846461`
  i alle `.html`-filene. Si fra, så fikser jeg det på sekunder.
- **Hvorfor det er øverst:** Feil telefonnummer = tapte henvendelser/bookinger.

## 🔴 2. Organisasjonsnummer / juridisk selskap

- **Funn:** «Træna Arctic Fishing» er et **merkenavn**, ikke et registrert selskap.
  Mest sannsynlige driftsselskap: **Træna Rorbuferie AS, org.nr 928 965 953**
  (Yngve Myhre er styreleder; bransjekode 55.200 «ferieleiligheter»; stiftet 2022).
- **Hva jeg gjorde:** La inn dette på **personvern-siden** (norsk lov,
  foretaksregisterloven §10-2, krever at org.nr + foretaksnavn vises på nettsiden).
  Det er markert med en `TODO VERIFY`-kommentar i `personvern.html`.
- **Du gjør:** Bekreft at Træna Rorbuferie AS / 928 965 953 er riktig selskap. Er det
  feil, gi meg riktig navn + org.nr. Dette **bestemmer også** om du registrerer
  domenet på selskapet eller som privatperson (se PUBLISER.md steg 1).
- **Hvorfor høyt:** Det er en juridisk opplysning som vises offentlig.

## 🟠 3. Domenenavn = `traenaarcticfishing.no`

- **Antakelse:** Jeg gikk ut fra dette navnet og skrev det inn i tre tekniske filer
  (`robots.txt`, `sitemap.xml`, `.well-known/security.txt`) som trenger den endelige
  adressen for at Google-synlighet skal virke optimalt.
- **Du gjør:** Velger du et annet domene, si fra — jeg endrer adressen i de tre filene
  (2 min). Siden virker uansett; dette gjelder kun søkemotor-delen.

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
1. Bekreft **telefonnummer** (punkt 1).
2. Bekreft **selskap/org.nr** (punkt 2).
3. Følg **PUBLISER.md**.

Alt annet er klart til å gå live.
