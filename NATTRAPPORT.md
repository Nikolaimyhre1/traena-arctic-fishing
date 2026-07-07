# Nattrapport — 7. juli 2026

Alle tre oppgavene er levert, testet og deployet til traena-arctic-fishing.com
(PR #8, merget til main). Slik henger det sammen:

## Hva som ble bygget

### 1) Ny bestillingsordre / tilbud (à la Vaskeladden, i TAF-drakt)
- Ny side: **`/tilbud`** — en ordentlig tilbudsside med samme oppbygging som
  Vaskeladden-tilbudet: topplinje «TILBUD · TAF-XXXX · dato», hilsen med kundens
  navn, **klistret sammendragskort** til venstre (gjest, periode, antall,
  leiligheter, båter og **totalpris i gull**), valgte enheter med bilde og pris,
  «Hva som inngår» med haker, «Verdt å vite» (betaling, båtførerbevis, ferge,
  pakkeliste), signatur — og en **«Godta tilbudet»-knapp** i bunnlinja
  (åpner ferdig aksept-e-post til TAF).
- Siden finnes på **norsk, engelsk og tysk** (følger språket kunden brukte).
- **Utskrift/PDF**: egen print-stil gjør siden lys og blekkvennlig — klar til å
  lagres som PDF og sendes.
- Siden er `noindex` (dukker ikke opp i Google) og ligger ikke i sitemap.

### 2) Automatisk DinTur-mail (+ hele e-postflyten)
Når en kunde sender forespørsel fra Book-siden skjer dette:
1. Kundens e-postprogram åpner en **ryddig, strukturert forespørsel** til
   `traenaarctic@gmail.com`: navn, periode, antall, valgte leiligheter/båter med
   priser, prisoverslag — og en **lenke til tilbudssiden** for akkurat denne
   bestillingen.
2. TAF åpner lenken. Nederst på tilbudssiden ligger **«For vertskapet»** med tre
   knapper (vises aldri på utskrift):
   - **«Åpne e-post til kunden»** → ferdig e-post med tilbudet/lenken, på kundens språk.
   - **«Åpne e-post til DinTur»** → ferdig e-post til `office@dintur.no`:

     > Hei,
     >
     > I perioden 11.07.2026–18.07.2026 har vi leid ut til egne gjester og har
     > derfor ikke kapasitet på disse datoene. Det gjelder: Grønnrevet, Båt 2.
     > Vi ber dere blokkere dette i deres kalender. Ta gjerne kontakt om noe er
     > uklart.
     >
     > Med vennlig hilsen
     > Yngve Myhre
     > Træna Arctic Fishing

     (Datoer og enheter fylles inn automatisk fra kundens bestilling.)
   - **«Skriv ut / lagre PDF»**.

### 3) Book-siden: velg så mange leiligheter og båter du vil
- **Trykk på bildet** av en leilighet/båt → legges i bestillingen (gullring +
  hake). **Trykk igjen** → fjernes. Fungerer også med tastatur.
- **«Din bestilling»**-panel over skjemaet viser valgene med priser,
  fjern-knapper og **løpende prisoverslag** (fra-pris × antall uker) som følger
  valuta- (NOK/EUR) og språkvalget.
- **Kapasitet fra DinTur** lagt inn overalt: Grønnrevet/Nargtind/Svanen/
  Sandflæsa **inntil 6 personer**, Selværgutt **inntil 8**, Vegardbryggen
  **inntil 3**, båtene **maks 4 pers**. (Også oppdatert på Fasiliteter-siden.)
- Båtkortene har nå **bilder** (delte båtbilder — se usikkerhet 2).
- Datoer er nå **påkrevd** i skjemaet (trengs for pris og DinTur-mail).

## Testet (uten deg, med headless Chrome + node)
- Klikk på/av, fjern-knapp, kort-synk, aria-tilstander — alle bestått.
- Prisregning håndregnet og verifisert: 1 uke Selværgutt+Båt 2 = kr 28 947 ✓;
  maks-bestilling (alt i 2 uker) = kr 374 120 ✓.
- Tilbudssiden rendret og skjermdumpet på norsk og tysk; print-PDF generert og
  inspisert.
- URL-roundtrip (bestilling → lenke → tilbud) verifisert.
- UTF-8/æøå sjekket i alle filer. Live-verifisert etter deploy.

---

# Usikkerheter — rangert fra MEST til MINST usikker

## 🔴 1. Prisoverslag for perioder som ikke er hele uker
DinTur priser per uke. Når kunden velger f.eks. 10 netter regner jeg
**fra-pris × (netter/7)** og merker det tydelig som «Prisoverslag (fra-priser)»
med forbehold om at endelig pris bekreftes av dere. Jeg vet ikke om dere i det
hele tatt leier ut kortere/lengre enn hele uker, eller hvordan dere priser det.
**Gjort i stedet for å spørre:** brøkdels-uker med tydelig forbehold — aldri
presentert som endelig pris. Si fra hvis dere heller vil runde opp til hel uke,
eller kun tillate hele uker i datovelgeren.

## 🔴 2. Bildene på båtkortene
Det finnes bare tre båtbilder i bildemappa (`bat.jpg`, `boat-action.jpg`,
`boat-fleet.jpg`) — ingen bilder per båt. Du ba om at man skal kunne trykke på
*bildene* av båtene, så jeg ga alle åtte båtkort bilder ved å rullere de tre.
Båt 1, 4 og 7 deler altså bilde, osv. **Gjort i stedet for å spørre:** rullering
av eksisterende bilder. Send meg gjerne ett bilde per båt, så bytter jeg på 5 min.

## 🟠 3. «To mailer» — jeg la DinTur-mailen bak en lenke, ikke i kundens e-post
Teknisk viktig: skjemaet åpner e-post **fra kundens egen konto** — kunden ser
alt som står der. Hadde jeg lagt DinTur-teksten («vi har ikke kapasitet…») rett
i forespørselen, ville **kunden lest den** — forvirrende og uprofesjonelt.
**Gjort i stedet:** forespørselen inneholder tilbudslenken; på tilbudssiden
ligger begge de ferdige e-postene (kunde + DinTur) som ett-klikks-knapper for
dere. Samme resultat — to automatisk genererte mailer — men kunden slipper å se
DinTur-meldingen. Kunden *kan* se «For vertskapet»-boksen hvis de åpner lenken
og blar helt ned; den er diskret og inneholder ikke noe hemmelig.

## 🟠 4. DinTur-mailens innhold
Jeg antok at DinTur trenger å vite **hvilke enheter** det gjelder (ikke bare
datoene) for å kunne blokkere riktig — så enhetene står med i mailen. Mottaker
satt til `office@dintur.no` (bekreftet fra dintur.no/kontakt). Ordlyden er på
4 setninger med «Hei» og «Med vennlig hilsen Yngve Myhre», som bestilt.

## 🟡 5. Innholdet i «Hva som inngår» på tilbudet
Jeg gjenbrukte inkludert-lista fra Fasiliteter-siden (sengetøy, håndklær,
sluttrengjøring, strøm/vann, Wi-Fi, kjøkken m/ovn og oppvaskmaskin, fryser 200 l,
sløyerom, flytebrygge, ekkolodd/kartplotter/stangholdere, parkering) og
presiserte at drivstoff/forsikring ikke inngår og at båtførerbevis kreves.
«Verdt å vite»-svarene (betaling i NOK avtales med dere, ferge fra
Sandnessjøen/Stokkvågen, bil på ferja unntatt lørdag) er basert på det som
allerede står på nettsiden — les gjerne korrektur.

## 🟡 6. Datoer er nå påkrevd på Book-skjemaet
Uten datoer kan jeg verken regne pris eller generere DinTur-mail, så «Fra dato»
og «Til dato» er obligatoriske på Book-siden. Skjemaet på forsiden er urørt og
funker som før (uten krav). Si fra hvis du vil ha det valgfritt igjen.

## 🟢 7. Lange bestillinger gir lang e-postlenke
En maks-bestilling (alt + lang melding) gir en mailto-lenke på ~2 750 tegn.
Moderne e-postprogrammer (Apple Mail, Gmail, Outlook) takler dette fint; svært
gamle klienter kan kutte. Typiske bestillinger er ~1 200 tegn — uproblematisk.

## 🟢 8. Tilbuds-ID-format
Fant på formatet «TAF-XXXXXX» (genereres automatisk, unikt nok i praksis).
Ren kosmetikk — si fra om dere vil ha noe annet.

---

**Filer:** `tilbud.html`, `tilbud.js`, `booking.js`, `order-core.js` (ny delt
logikk), `booking.html` (ombygd), `facilities.html` (kapasitet), `styles.css`
(kort-valg + tilbud + print). Test-tilbud du kan åpne:
`https://traena-arctic-fishing.com/tilbud?id=TAF-DEMO01&d=2026-07-07&n=Ola%20Nordmann&e=ola%40example.com&fra=2026-07-11&til=2026-07-18&p=6&u=1,5&b=2&lang=no`
