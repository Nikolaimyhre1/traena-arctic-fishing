# Slik publiserer du nettsiden — steg for steg

En enkel oppskrift du kan følge i ro og mak. Du trenger **ingen koding**. Sett av
ca. **1–1,5 time** (pluss litt venting på at domenet skal «slå inn»).

Rekkefølge: **0) Sjekk to ting → 1) Domene → 2) Legg siden på nett → 3) Koble domenet →
4) Sikre kontoene → 5) Bli synlig på Google → 6) Test til slutt.**

> 💡 Har du dårlig tid: Steg 2 alene gir deg en levende nettside (en `.vercel.app`-adresse)
> du kan dele med en gang. Domene (steg 1 + 3) kan du gjøre etterpå.

---

## 0) Bekreftet og klart

To opplysninger er nå bekreftet og lagt inn (du avklarte dem):

1. **Telefon:** `+47 908 46 461` — campens nummer. ✅
2. **Selskap:** Campen «Træna Arctic Fishing» drives av **Helgeland Adventure AS,
   org.nr 989 945 262** (vises på personvern-siden, som loven krever). Bruk dette
   selskapet når du registrerer domenet i steg 1. ✅

Resten er klart til bruk.

---

## 1) Registrer domenene (.com + .no)

**Hovedadresse:** `traenaarcticfishing.com` — campen har flest utenlandske gjester,
og `.com` er det de fleste forventer.
**I tillegg:** `traenaarcticfishing.no` — som videresender til `.com` (fanger opp
norske gjester og beskytter navnet). Du kan greit nøye deg med kun `.com` hvis du
vil, men begge anbefales.

**.com — ingen norske krav:**
- Hvem som helst kan registrere et `.com`. Registrer det gjerne på **Helgeland
  Adventure AS**. Koster ca. **100–150 kr/år**.

**.no — egne regler:**
- **På selskapet (anbefalt):** registrer på **Helgeland Adventure AS
  (org.nr 989 945 262)** — domenet eies da av bedriften.
- **Som privatperson** går det også: du må være 18+ og bosatt i Norge, og lager
  først en gratis «Personlig ID» (PID) på <https://pid.norid.no>.

**Slik gjør du:**
1. Gå til en domeneforhandler — **Domeneshop** (<https://domene.shop>) tar både
   `.com` og `.no`, så du har alt på ett sted. (Alt.: One.com, Namecheap, Cloudflare.)
2. Søk opp `traenaarcticfishing.com` **og** `traenaarcticfishing.no` og se at de er ledige.
3. Legg begge i handlekurven og fullfør (`.com` ~100–150 kr/år, `.no` ~kr 99 første
   år så kr 199/år).
   - `.no` med org.nr: oppgi organisasjonsnummeret. Som privat: oppgi PID-en.
4. **Slå på DNSSEC** hvis du ser valget (ett klikk — ekstra beskyttelse mot kapring).

Domenene er som regel klare i løpet av **minutter til noen timer**.

---

## 2) Legg nettsiden på nett (Vercel — gratis)

Siden ligger allerede klar i GitHub-repoet
`Nikolaimyhre1/traena-arctic-fishing`, og er ferdig satt opp for **Vercel**
(filen `vercel.json` tar seg av sikkerhet og «pene» adresser). Derfor er Vercel
raskest:

1. Gå til <https://vercel.com> → **Sign Up** → velg **«Continue with GitHub»**
   (logg inn med den GitHub-kontoen som eier repoet).
2. Trykk **Add New… → Project**.
3. Finn `traena-arctic-fishing` i lista → **Import**.
4. La alt stå som standard (det er en ren statisk side, ingen «build» trengs) →
   trykk **Deploy**.
5. Etter ~1 minutt får du en adresse som `traena-arctic-fishing.vercel.app`.
   **Åpne den og sjekk at siden ser riktig ut.** 🎉 Den er nå live.

> Heretter publiseres endringer automatisk: hver gang noe oppdateres i GitHub,
> bygger Vercel siden på nytt av seg selv.

---

## 3) Koble domenene til siden

Vi kobler **begge** domenene på samme Vercel-prosjekt, og setter `.com` som hoved
(`.no` videresender dit).

**I Vercel:**
1. Åpne prosjektet → **Settings → Domains**.
2. Skriv inn `traenaarcticfishing.com` → **Add**. Gjenta med `traenaarcticfishing.no`.
3. For hvert domene viser Vercel **nøyaktig hvilke DNS-oppføringer** du skal lage.
   **Bruk dem som står der** (de kan avvike litt fra under). Typisk:
   - **A-record** for `@` (selve domenet) → IP **`76.76.21.21`**
   - **CNAME** for `www` → **`cname.vercel-dns.com`**
4. Sett **`traenaarcticfishing.com` som «Primary Domain»** i Vercel. Da videresender
   `.no` automatisk til `.com`. (Følg også Vercels forslag om www → uten-www e.l.)

**Hos domeneforhandleren (DNS-innstillinger):**
1. Logg inn → velg domenet → **DNS**.
2. Legg inn oppføringene Vercel viste. **Husk: gjør dette for begge domenene**
   (`.com` og `.no`) — hvert domene har sine egne DNS-innstillinger.
3. Lagre.

**Vent.** DNS bruker vanligvis **minutter–noen timer** (opptil 48t i verste fall).
Når det er klart, ordner Vercel **gratis HTTPS (hengelås)** for begge domenene
helt automatisk — du trenger ikke gjøre noe.

> ℹ️ Siden er allerede satt opp med `traenaarcticfishing.com` som hovedadresse
> (i `robots.txt`, `sitemap.xml` og `.well-known/security.txt`). Lander du på et
> **annet** navn enn dette, gi beskjed — så bytter jeg adressen i de tre filene
> (2-minutters jobb).

---

## 4) Sikre kontoene (det viktigste mot «hacking»)

Selve nettsiden er en ren statisk side uten innlogging, database eller server —
det er **nesten ingenting å hacke** der. Den virkelige risikoen er at noen tar over
**kontoene** rundt siden. Bruk 10 minutter på dette:

- ✅ **Slå på tofaktor (2FA)** på alle fire: **Gmail**, **GitHub**, **Vercel**,
  **Domeneshop**. Bruk helst en autentiserings-app eller passkey, ikke SMS.
- ✅ **Gmail er hovednøkkelen** (alle passord kan tilbakestilles via e-post) — gi den
  den sterkeste beskyttelsen.
- ✅ **Sterke, unike passord** på hver konto. Bruk en passordbehandler (Bitwarden
  eller 1Password).
- ✅ **Domenelås**: slå på «transfer lock» / registrarlås hos Domeneshop, så domenet
  ikke kan flyttes uten din bekreftelse.
- ✅ **DNSSEC** (hvis ikke gjort i steg 1).
- ➕ *Valgfritt:* legg inn en **CAA-oppføring** i DNS: `0 issue "letsencrypt.org"`
  (begrenser hvem som kan lage SSL-sertifikat for domenet).

Sikkerhets-«headere» (CSP, HSTS m.m.) er **allerede satt opp** i `vercel.json` —
du trenger ikke gjøre noe der.

---

## 5) Bli synlig på Google

Å være «live» betyr **ikke** automatisk at du dukker opp når folk googler. Du må be
Google om å finne siden:

1. Gå til **Google Search Console**: <https://search.google.com/search-console>.
2. Legg til **hoveddomenet** `traenaarcticfishing.com` (velg «Domain»-typen).
   (Du kan legge til `.no` i tillegg, men det er `.com` som skal rangere.)
3. Google ber deg verifisere ved å legge inn en **TXT-oppføring** i DNS hos
   forhandleren — kopier verdien de gir deg, lim inn som TXT-record, lagre, og trykk
   verifiser.
4. Inne i Search Console: **Sitemaps → legg til `sitemap.xml`** (den ligger allerede
   klar på siden).

Så er det bare å vente. Det tar typisk **noen dager til et par uker** før siden
dukker opp i søk. Et eget domene (`.no`) hjelper rangeringen.

---

## 6) Test til slutt (5 min)

På mobil **og** PC, gå gjennom:

- [ ] Forsiden, Fasiliteter, Fiske, Book og Personvern åpner seg.
- [ ] Språkbytte **NO / EN / DE** øverst til høyre virker.
- [ ] Valuta **NOK / EUR** virker.
- [ ] **«Book på DinTur»**-knappene åpner riktig DinTur-side (test alle tre språk —
      de går til ulike adresser).
- [ ] **Forespørselsskjemaet**: fyll ut og trykk «Send» → e-postprogrammet ditt
      skal åpne seg med en ferdig e-post til `traenaarctic@gmail.com`.
- [ ] **Personvern**-lenken nederst åpner personvernerklæringen.
- [ ] Hengelåsen (HTTPS) vises i adressefeltet.
- [ ] *Karakterbok for sikkerhet:* lim inn adressen på
      <https://securityheaders.com> — du bør få **A / A+**.

Ferdig! 🎣

---

## Alternativ vert for ekstra robusthet (valgfritt)

Vil du ha enda sterkere beskyttelse mot trafikk-angrep (DDoS), er **Cloudflare
Pages** et godt alternativ til Vercel: ubegrenset båndbredde og innebygd
DDoS-skjold, gratis. Siden har allerede en `_headers`-fil som gir samme
sikkerhets-headere der. Men: Vercel er enklest når alt allerede er satt opp, og er
helt trygt for en slik side. **Du trenger bare velge én.**

## Endre tekst eller bilder senere

All tekst ligger i HTML-filene med tre språk (`data-no`, `data-en`, `data-de`).
Bilder ligger i `images/`. Det enkleste er å be Claude/meg gjøre endringen — så
publiseres den automatisk via GitHub + Vercel. Se også `README.md`.
