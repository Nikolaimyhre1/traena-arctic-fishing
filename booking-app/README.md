# Træna Arctic Fishing — booking-backend (prototype)

Et lite, avhengighetsfritt bookingsystem: ren Python (ingen `pip install`).
Lagrer bookinger i SQLite, hindrer dobbeltbooking, og har en passordbeskyttet
admin-side. Nettsidens `bestilling.html` snakker med dette.

## Kjøre lokalt
```bash
cd booking-app
python3 app.py
# → http://localhost:8787   (admin: http://localhost:8787/admin)
```
Admin-innlogging (endre før ekte bruk, se under): bruker `camp`, passord `traena`.

Test hele flyten: kjør også nettsiden lokalt (`python3 -m http.server 8000` i
rotmappa) og åpne `http://localhost:8000/bestilling.html`. Booker du der, dukker
det opp i admin.

## Hva som er bygget
- Ledig-sjekk per enhet (6 leiligheter + 7 båter) med dobbeltbooking-sperre.
- Booking lagres som `pending`.
- Admin-side: liste over bookinger + knapp som åpner en **ferdig, sannferdig**
  e-post til DinTur («disse datoene er nå opptatt, vennligst sperr dem»).
  Ingenting sendes til DinTur automatisk — campen har kontrollen.

## Hva som MÅ på plass før det går live (krever deres egne kontoer)
Dette er en fungerende prototype. For å ta imot ekte gjester og penger:

1. **Hosting av backend.** GitHub Pages kan ikke kjøre dette (det er bare en
   server for statiske filer). Backend-en må ligge et sted som kjører Python
   døgnet rundt — f.eks. Render, Railway, Fly.io eller en liten VPS. Liten
   månedskostnad. Når den er hostet: bytt `REPLACE-WITH-YOUR-BACKEND.example`
   i `bestilling.html` til den offentlige adressen, og lenk siden i menyen.
2. **Betaling (Stripe eller Vipps).** Krever en konto på **campens org.nr** med
   bankkonto — det må dere opprette selv. Når kontoen finnes kobles betalingen
   inn i booking-flyten (gjesten betaler, bookingen settes `confirmed`).
3. **E-postutsending.** For å sende bekreftelse til gjest/camp automatisk trengs
   en e-posttjeneste (f.eks. Postmark, Resend, SendGrid) — en konto + verifisert
   avsenderdomene.
4. **Sikkerhet:** sett `ADMIN_PASS` (og gjerne `ADMIN_USER`) som miljøvariabler,
   ikke standardverdien. Kjør bak HTTPS. Backend-en lagrer persondata —
   personvern (GDPR) og backup må være på plass.
5. **DinTur:** hold DinTur som «fasit» eller forlat den ryddig. Når dere tar en
   booking her, sperr datoene på DinTur (admin-knappen lager e-posten).

## Miljøvariabler
| Variabel | Standard | Hva |
|----------|----------|-----|
| `PORT` | 8787 | Port |
| `ADMIN_USER` | camp | Admin-brukernavn |
| `ADMIN_PASS` | traena | Admin-passord — **bytt!** |
| `DINTUR_EMAIL` | post@dintur.no | Mottaker for «sperr datoer»-e-posten |
