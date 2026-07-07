// ============================================================
// Træna Arctic Fishing — tilbudssiden
// Leser bestillingen fra URL-parametre og tegner et ferdig
// tilbud/ordrebekreftelse i TAF-stil (NO/EN/DE via ?lang=).
// Avhenger av order-core.js (window.TAF).
// ============================================================

(function () {
  "use strict";
  if (!window.TAF) return;
  var TAF = window.TAF;

  var params = new URLSearchParams(window.location.search);
  var order = TAF.orderFromParams(function (k) { return params.get(k); }, window.location.pathname);
  var lang = order.lang;
  document.documentElement.lang = lang;

  // ---- Tekster ----
  var T = {
    no: {
      docTitle: "Tilbud — Træna Arctic Fishing",
      meta: "TILBUD", kick: "Havfiske — Selvær, Træna",
      title: "Deres opphold ved storhavet",
      leadNamed: "Hei {name} — takk for forespørselen! Her er en samlet oversikt over bestillingen deres: hva som er valgt, hva som er inkludert, og hva oppholdet koster. Ser alt riktig ut, godtar dere tilbudet nederst på siden.",
      leadAnon: "Her er en samlet oversikt over bestillingen: hva som er valgt, hva som er inkludert, og hva oppholdet koster.",
      summary: "Sammendrag", guest: "Gjest", period: "Periode", guests: "Antall personer",
      units: "Leiligheter", boats: "Båter", nonePicked: "Etter avtale — vi foreslår",
      nights: "netter", week: "uke", weeks: "uker",
      total: "Totalt (overslag)", totalSub: "Basert på fra-priser per uke. Endelig pris bekreftes av oss. Drivstoff og forsikring på båt kommer i tillegg.",
      itemsHead: "Dette er med i bestillingen",
      itemsNote: "Prisene er fra-priser per uke.",
      itemsEmpty: "Ingen leilighet eller båt er valgt ennå — vi setter opp et forslag som passer antall personer og datoene deres.",
      aptWord: "Leilighet", sleeps: "inntil {n} personer", boatCap: "maks 4 personer", perWeek: "/uke",
      inclHead: "Hva som inngår",
      incl: ["Sengetøy og håndklær", "Sluttrengjøring", "Strøm, vann og elektrisk oppvarming", "Wi-Fi og smart-TV",
             "Fullt utstyrt kjøkken med ovn og oppvaskmaskin", "Fryser på 200 liter til fangsten",
             "Sløyerom ved kaia med rennende vann", "Flytebrygge rett utenfor — 0 meter til båten",
             "Ekkolodd, kartplotter og stangholdere i båtene", "Parkering rett ved døra"],
      inclNote: "Drivstoff og forsikring på båt er ikke inkludert. Båtførerbevis kreves for å føre båtene.",
      faqHead: "Verdt å vite",
      faq: [
        ["Hvordan bekrefter vi bestillingen?", "Trykk «Godta tilbudet» nederst, eller svar på e-posten dere fikk fra oss. Da bekrefter vi tilgjengelighet og avtaler betaling."],
        ["Hvordan betaler vi?", "Betaling avtales direkte med oss og skjer i norske kroner (NOK). Euro-priser er kun veiledende."],
        ["Hvordan kommer vi oss til Selvær?", "Ferje eller hurtigbåt fra Sandnessjøen/Stokkvågen til Selvær. Bil kan tas med på ferja alle dager unntatt lørdag."],
        ["Hva må vi ha med?", "Fiskeutstyr og klær etter vær. Sengetøy, håndklær og fullt utstyrt kjøkken står klart. Husk båtførerbevis."]
      ],
      sign: "Hilsen", signSub: "Træna Arctic Fishing",
      accept: "Godta tilbudet",
      acceptSubj: "Aksept av tilbud {id} — Træna Arctic Fishing",
      acceptBody: "Hei,\n\nVi godtar tilbudet {id} for perioden {period}.\n\n{name}",
      hostSummary: "For vertskapet (Træna Arctic Fishing)",
      hostCustomer: "Åpne e-post til kunden", hostDinTur: "Åpne e-post til DinTur", hostPrint: "Skriv ut / lagre PDF",
      hostHint: "«E-post til kunden» åpner et ferdig utkast med tilbudslenken til {email}. «E-post til DinTur» åpner et ferdig utkast til office@dintur.no om at datoene er opptatt. Denne boksen vises ikke på utskrift.",
      hostHintNoEmail: "«E-post til kunden» åpner et ferdig utkast med tilbudslenken — lim inn kundens e-postadresse i Til-feltet (den står i forespørselen dere fikk). «E-post til DinTur» åpner et ferdig utkast til office@dintur.no om at datoene er opptatt. Denne boksen vises ikke på utskrift."
    },
    en: {
      docTitle: "Offer — Træna Arctic Fishing",
      meta: "OFFER", kick: "Sea fishing — Selvær, Træna",
      title: "Your stay by the open sea",
      leadNamed: "Hi {name} — thank you for your enquiry! Here is a full overview of your order: what you selected, what's included, and what the stay costs. If everything looks right, accept the offer at the bottom of the page.",
      leadAnon: "Here is a full overview of the order: what was selected, what's included, and what the stay costs.",
      summary: "Summary", guest: "Guest", period: "Period", guests: "Guests",
      units: "Apartments", boats: "Boats", nonePicked: "To be agreed — we'll suggest",
      nights: "nights", week: "week", weeks: "weeks",
      total: "Total (estimate)", totalSub: "Based on from-prices per week. The final price is confirmed by us. Boat fuel and insurance are extra.",
      itemsHead: "What's in your order",
      itemsNote: "Prices are from-prices per week.",
      itemsEmpty: "No apartment or boat selected yet — we'll put together a suggestion that fits your group and dates.",
      aptWord: "Apartment", sleeps: "sleeps up to {n}", boatCap: "max 4 persons", perWeek: "/week",
      inclHead: "What's included",
      incl: ["Bedding and towels", "Final cleaning", "Electricity, water and electric heating", "Wi-Fi and smart TV",
             "Fully equipped kitchen with oven and dishwasher", "200-litre freezer for your catch",
             "Cleaning room on the quay with running water", "Floating dock right outside — 0 m to the boat",
             "Echo sounder, chart plotter and rod holders in the boats", "Parking right by the door"],
      inclNote: "Boat fuel and insurance are not included. A boating licence is required to operate the boats.",
      faqHead: "Good to know",
      faq: [
        ["How do we confirm the booking?", "Press “Accept the offer” below, or simply reply to the email you received from us. We'll confirm availability and arrange payment."],
        ["How do we pay?", "Payment is arranged directly with us, in Norwegian kroner (NOK). Euro prices are indicative only."],
        ["How do we get to Selvær?", "Ferry or express boat from Sandnessjøen/Stokkvågen to Selvær. Cars can go on the ferry every day except Saturday."],
        ["What should we bring?", "Fishing gear and clothes for the weather. Bedding, towels and a fully equipped kitchen are ready. Remember your boating licence."]
      ],
      sign: "Best regards", signSub: "Træna Arctic Fishing",
      accept: "Accept the offer",
      acceptSubj: "Acceptance of offer {id} — Træna Arctic Fishing",
      acceptBody: "Hi,\n\nWe accept offer {id} for the period {period}.\n\n{name}",
      hostSummary: "For the hosts (Træna Arctic Fishing)",
      hostCustomer: "Open email to the guest", hostDinTur: "Open email to DinTur", hostPrint: "Print / save as PDF",
      hostHint: "“Email to the guest” opens a ready draft with the offer link to {email}. “Email to DinTur” opens a ready draft to office@dintur.no saying the dates are taken. This box is hidden when printing.",
      hostHintNoEmail: "“Email to the guest” opens a ready draft with the offer link — paste the guest's email address in the To field (it's in the enquiry you received). “Email to DinTur” opens a ready draft to office@dintur.no saying the dates are taken. This box is hidden when printing."
    },
    de: {
      docTitle: "Angebot — Træna Arctic Fishing",
      meta: "ANGEBOT", kick: "Hochseeangeln — Selvær, Træna",
      title: "Ihr Aufenthalt am offenen Meer",
      leadNamed: "Hallo {name} — vielen Dank für Ihre Anfrage! Hier ist die vollständige Übersicht Ihrer Bestellung: Ihre Auswahl, die enthaltenen Leistungen und die Kosten. Wenn alles passt, nehmen Sie das Angebot unten auf der Seite an.",
      leadAnon: "Hier ist die vollständige Übersicht der Bestellung: Auswahl, enthaltene Leistungen und Kosten.",
      summary: "Zusammenfassung", guest: "Gast", period: "Zeitraum", guests: "Personen",
      units: "Wohnungen", boats: "Boote", nonePicked: "Nach Absprache — wir schlagen vor",
      nights: "Nächte", week: "Woche", weeks: "Wochen",
      total: "Gesamt (Schätzung)", totalSub: "Basierend auf Ab-Preisen pro Woche. Der Endpreis wird von uns bestätigt. Treibstoff und Bootsversicherung sind extra.",
      itemsHead: "Das ist in Ihrer Bestellung",
      itemsNote: "Die Preise sind Ab-Preise pro Woche.",
      itemsEmpty: "Noch keine Wohnung oder kein Boot gewählt — wir stellen einen passenden Vorschlag für Ihre Gruppe und Ihre Daten zusammen.",
      aptWord: "Wohnung", sleeps: "bis zu {n} Personen", boatCap: "max. 4 Personen", perWeek: "/Woche",
      inclHead: "Was enthalten ist",
      incl: ["Bettwäsche und Handtücher", "Endreinigung", "Strom, Wasser und Elektroheizung", "WLAN und Smart-TV",
             "Voll ausgestattete Küche mit Backofen und Geschirrspüler", "200-Liter-Gefrierschrank für den Fang",
             "Schlachtraum am Kai mit fließendem Wasser", "Schwimmsteg direkt davor — 0 m zum Boot",
             "Echolot, Kartenplotter und Rutenhalter in den Booten", "Parkplatz direkt an der Tür"],
      inclNote: "Treibstoff und Bootsversicherung sind nicht enthalten. Zum Führen der Boote ist ein Bootsführerschein erforderlich.",
      faqHead: "Gut zu wissen",
      faq: [
        ["Wie bestätigen wir die Buchung?", "Klicken Sie unten auf „Angebot annehmen“ oder antworten Sie einfach auf unsere E-Mail. Wir bestätigen die Verfügbarkeit und vereinbaren die Zahlung."],
        ["Wie bezahlen wir?", "Die Zahlung wird direkt mit uns vereinbart und erfolgt in norwegischen Kronen (NOK). Euro-Preise sind nur Richtwerte."],
        ["Wie kommen wir nach Selvær?", "Fähre oder Schnellboot ab Sandnessjøen/Stokkvågen nach Selvær. Autos können täglich außer samstags auf die Fähre."],
        ["Was sollten wir mitbringen?", "Angelausrüstung und wetterfeste Kleidung. Bettwäsche, Handtücher und eine voll ausgestattete Küche stehen bereit. Bootsführerschein nicht vergessen."]
      ],
      sign: "Mit freundlichen Grüßen", signSub: "Træna Arctic Fishing",
      accept: "Angebot annehmen",
      acceptSubj: "Annahme des Angebots {id} — Træna Arctic Fishing",
      acceptBody: "Hallo,\n\nwir nehmen das Angebot {id} für den Zeitraum {period} an.\n\n{name}",
      hostSummary: "Für die Gastgeber (Træna Arctic Fishing)",
      hostCustomer: "E-Mail an den Gast öffnen", hostDinTur: "E-Mail an DinTur öffnen", hostPrint: "Drucken / als PDF speichern",
      hostHint: "„E-Mail an den Gast“ öffnet einen fertigen Entwurf mit dem Angebotslink an {email}. „E-Mail an DinTur“ öffnet einen fertigen Entwurf an office@dintur.no, dass die Termine belegt sind. Diese Box wird beim Drucken ausgeblendet.",
      hostHintNoEmail: "„E-Mail an den Gast“ öffnet einen fertigen Entwurf mit dem Angebotslink — fügen Sie die E-Mail-Adresse des Gastes in das An-Feld ein (sie steht in der erhaltenen Anfrage). „E-Mail an DinTur“ öffnet einen fertigen Entwurf an office@dintur.no, dass die Termine belegt sind. Diese Box wird beim Drucken ausgeblendet."
    }
  };
  var t = T[lang] || T.no;

  function el(id) { return document.getElementById(id); }
  function fill(s, vars) {
    return s.replace(/\{(\w+)\}/g, function (_, k) { return vars[k] !== undefined ? vars[k] : ""; });
  }

  var period = TAF.fmtDate(order.fra) + " – " + TAF.fmtDate(order.til);
  var units = order.units.map(TAF.unitById).filter(Boolean);
  var boats = order.boats.map(TAF.boatById).filter(Boolean);

  // ---- Topp + hero ----
  document.title = t.docTitle;
  el("tMeta").textContent = t.meta + " · " + order.id + (order.created ? " · " + TAF.fmtDate(order.created) : "");
  el("tKick").textContent = t.kick;
  el("tTitle").textContent = t.title;
  el("tLead").textContent = order.name ? fill(t.leadNamed, { name: order.name }) : t.leadAnon;

  // ---- Sammendragskort ----
  el("tSummaryLbl").textContent = t.summary;
  el("tCardImg").style.backgroundImage =
    "url('" + (units[0] ? units[0].img : (boats[0] ? boats[0].img : "/images/hero.jpg")) + "')";
  var dl = el("tSummary");
  function row(label, value) {
    if (!value) return;
    var dt = document.createElement("dt"); dt.textContent = label;
    var dd = document.createElement("dd"); dd.textContent = value;
    dl.appendChild(dt); dl.appendChild(dd);
  }
  row(t.guest, order.name);
  var est = TAF.estimate(order);
  var periodTxt = period;
  if (est && est.nights > 0) periodTxt += " (" + est.nights + " " + t.nights + ")";
  row(t.period, periodTxt);
  row(t.guests, order.guests);
  row(t.units, units.length ? units.map(function (u) { return u.name; }).join(", ") : t.nonePicked);
  row(t.boats, boats.length ? boats.map(function (b) { return b.name; }).join(", ") : t.nonePicked);

  el("tTotalLbl").textContent = t.total;
  el("tBarLbl").textContent = t.total;
  if (est) {
    var sum = TAF.fmtNOK(est.nok) + (lang === "no" ? "" : "  (≈ " + TAF.fmtEUR(est.eur) + ")");
    el("tTotalSum").textContent = sum;
    el("tBarSum").textContent = TAF.fmtNOK(est.nok);
  } else {
    el("tTotalSum").textContent = "—";
    el("tBarSum").textContent = "—";
  }
  el("tTotalSub").textContent = t.totalSub;

  // ---- Valgte enheter/båter ----
  el("tItemsHead").textContent = t.itemsHead;
  var itemsBox = el("tItems");
  function addItem(img, name, meta, nok) {
    var d = document.createElement("div"); d.className = "t-item";
    var i = document.createElement("div"); i.className = "t-item__img";
    i.style.backgroundImage = "url('" + img + "')";
    var b = document.createElement("div"); b.className = "t-item__b";
    var h = document.createElement("h3"); h.textContent = name;
    var p = document.createElement("p"); p.textContent = meta;
    b.appendChild(h); b.appendChild(p);
    var pr = document.createElement("div"); pr.className = "t-item__p";
    pr.innerHTML = "";
    var strong = document.createElement("span"); strong.textContent = TAF.fmtNOK(nok);
    var per = document.createElement("span"); per.className = "per"; per.textContent = " " + t.perWeek;
    pr.appendChild(strong); pr.appendChild(per);
    d.appendChild(i); d.appendChild(b); d.appendChild(pr);
    itemsBox.appendChild(d);
  }
  units.forEach(function (u) {
    addItem(u.img, u.name, t.aptWord + " · " + u.br + " " + (lang === "de" ? "SZ" : lang === "en" ? "BR" : "sov") + " · " + u.m2 + " m² · " + fill(t.sleeps, { n: u.cap }), u.nok);
  });
  boats.forEach(function (b) {
    addItem(b.img, b.name, b.spec + " · " + t.boatCap, b.nok);
  });
  el("tItemsNote").textContent = (units.length || boats.length) ? t.itemsNote : t.itemsEmpty;

  // ---- Inkludert ----
  el("tInclHead").textContent = t.inclHead;
  var ul = el("tIncl");
  t.incl.forEach(function (s) {
    var li = document.createElement("li"); li.textContent = s; ul.appendChild(li);
  });
  el("tInclNote").textContent = t.inclNote;

  // ---- Verdt å vite ----
  el("tFaqHead").textContent = t.faqHead;
  var faqBox = el("tFaq");
  t.faq.forEach(function (qa) {
    var d = document.createElement("div");
    var h = document.createElement("h3"); h.textContent = qa[0];
    var p = document.createElement("p"); p.textContent = qa[1];
    d.appendChild(h); d.appendChild(p);
    faqBox.appendChild(d);
  });

  el("tSignScript").textContent = t.sign;

  // ---- Godta ----
  var acceptMail = {
    to: TAF.MAIL_TAF,
    subject: fill(t.acceptSubj, { id: order.id }),
    body: fill(t.acceptBody, { id: order.id, period: period, name: order.name })
  };
  el("tAccept").textContent = t.accept;
  el("tAccept").href = TAF.mailtoHref(acceptMail);

  // ---- Vertskapsverktøy ----
  el("tHostSummary").textContent = t.hostSummary;
  el("tHostCustomer").textContent = t.hostCustomer;
  el("tHostCustomer").href = TAF.mailtoHref(TAF.customerMail(order, window.location.origin));
  el("tHostDinTur").textContent = t.hostDinTur;
  el("tHostDinTur").href = TAF.mailtoHref(TAF.dinTurMail(order));
  el("tHostPrint").textContent = t.hostPrint;
  el("tHostPrint").addEventListener("click", function () { window.print(); });
  el("tHostHint").textContent = order.email
    ? fill(t.hostHint, { email: order.email })
    : (t.hostHintNoEmail || t.hostHint);
})();
