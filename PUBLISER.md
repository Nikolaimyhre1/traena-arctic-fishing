# Slik publiserer du nettsiden — steg for steg

En enkel oppskrift du kan følge i ro og mak. Du trenger **ingen koding**. Sett av
ca. **1–1,5 time** (pluss litt venting på at domenet skal «slå inn»).

Rekkefølge: **0) Sjekk to ting → 1) Domene → 2) Legg siden på nett → 3) Koble domenet →
4) Sikre kontoene → 5) Bli synlig på Google → 6) Test til slutt.**

> 💡 Har du dårlig tid: Steg 2 alene gir deg en levende nettside (en `.vercel.app`-adresse)
> du kan dele med en gang. Domene (steg 1 + 3) kan du gjøre etterpå.

---

## 0) Sjekk to ting før du starter (5 min) — VIKTIG

Jeg fant to opplysninger jeg ikke kunne bekrefte 100 %. Se `NOTES-usikkerheter.md`
for detaljer. Kort versjon:

1. **Telefonnummeret.** Siden viser **+47 908 46 461**, men alle offentlige
   oppføringer (Visit Helgeland, Visit Norway, DinTur) viser **+47 916 30 174**.
   → **Bekreft hvilket som er riktig.** Skal det endres, si fra, eller bytt det selv:
   det står i bunnteksten på alle sidene (søk etter `90846461`).
2. **Organisasjonsnummer.** «Træna Arctic Fishing» er et merkenavn, ikke et eget
   selskap. Jeg har lagt inn **Træna Rorbuferie AS, org.nr 928 965 953** på
   personvern-siden (loven krever at org.nr vises på nettsiden). Det stemmer
   sannsynligvis, men **bekreft at det er riktig selskap** før du går live.
   Org.nr bestemmer også hvordan du registrerer domenet (steg 1).

Resten er klart til bruk.

---

## 1) Registrer domenet (.no)

**Anbefalt navn:** `traenaarcticfishing.no`

**Hvem kan registrere et .no-domene?**
- **Har bedriften organisasjonsnummer** (f.eks. Træna Rorbuferie AS): registrer
  domenet **på selskapet** med org.nr. Dette er det ryddigste — domenet eies da av
  bedriften, ikke en privatperson.
- **Som privatperson** går det også: du må være 18+ og bosatt i Norge, og du lager
  først en gratis «Personlig ID» (PID) på <https://pid.norid.no>. Da slipper du å
  gi fødselsnummeret ditt til domeneselskapet.

**Slik gjør du:**
1. Gå til en norsk domeneforhandler. **Anbefalt: Domeneshop** (<https://domene.shop>).
   Alternativer: One.com, Domene.no.
2. Søk opp `traenaarcticfishing.no` og se at det er ledig.
3. Legg det i handlekurven og fullfør (ca. **kr 99 første år, kr 199/år** etterpå).
   - Velger du org.nr-registrering: oppgi organisasjonsnummeret.
   - Velger du privat: oppgi PID-en fra pid.norid.no.
4. **Slå på DNSSEC** hvis du ser valget (ett klikk — gir ekstra beskyttelse mot
   at domenet kapres). Kan også gjøres senere.

Domenet er som regel klart i løpet av **minutter til noen timer**.

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

## 3) Koble domenet til siden

Nå peker vi `traenaarcticfishing.no` til Vercel.

**I Vercel:**
1. Åpne prosjektet → **Settings → Domains**.
2. Skriv inn `traenaarcticfishing.no` → **Add**.
3. Vercel viser nå **nøyaktig hvilke DNS-oppføringer** du skal lage. **Bruk dem som
   står der** (de kan avvike litt fra under). Typisk:
   - **A-record** for `@` (selve domenet) → IP **`76.76.21.21`**
   - **CNAME** for `www` → **`cname.vercel-dns.com`**
4. Vercel foreslår gjerne å la `traenaarcticfishing.no` videresende til
   `www.traenaarcticfishing.no` (eller motsatt) — bare følg forslaget.

**Hos Domeneshop (DNS-innstillinger for domenet):**
1. Logg inn → velg domenet → **DNS**.
2. Legg inn de samme oppføringene som Vercel viste (A-record og CNAME over).
3. Lagre.

**Vent.** DNS bruker vanligvis **minutter–noen timer** (opptil 48t i verste fall).
Når det er klart, ordner Vercel **gratis HTTPS (hengelås)** helt automatisk —
du trenger ikke gjøre noe.

> ⚠️ Hvis du valgte et **annet domenenavn** enn `traenaarcticfishing.no`: gi beskjed,
> så endrer jeg adressen i tre småfiler (`robots.txt`, `sitemap.xml`,
> `.well-known/security.txt`) som har domenet skrevet inn. Det er en
> 2-minutters jobb.

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
2. Legg til **domenet** `traenaarcticfishing.no` (velg «Domain»-typen).
3. Google ber deg verifisere ved å legge inn en **TXT-oppføring** i DNS hos
   Domeneshop — kopier verdien de gir deg, lim inn som TXT-record, lagre, og trykk
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
