// ============================================================
// Træna Arctic Fishing — order core
// Delt data + rene funksjoner for bestilling/tilbud.
// Brukes av booking.js (Book-siden) og tilbud.js (tilbudssiden).
// Ingen DOM her — kan kjøres i node for testing.
// ============================================================

(function (root) {
  "use strict";

  var SITE = "https://traena-arctic-fishing.com";
  var MAIL_TAF = "traenaarctic@gmail.com";
  var MAIL_DINTUR = "office@dintur.no";
  var PHONE_TAF = "+47 908 46 461";

  // ---- Enheter (kapasitet fra dintur.no/no/feriehus/traena-arctic-fishing) ----
  var UNITS = [
    { id: "1", name: "Grønnrevet",    nok: 18122, eur: 1580, cap: 6, br: 3, m2: 75, img: "/images/apt-gronnrevet.jpg" },
    { id: "2", name: "Nargtind",      nok: 18122, eur: 1580, cap: 6, br: 3, m2: 75, img: "/images/apt-nargtind.jpg" },
    { id: "3", name: "Svanen",        nok: 18122, eur: 1580, cap: 6, br: 3, m2: 75, img: "/images/apt-svanen.jpg" },
    { id: "4", name: "Sandflæsa",     nok: 18122, eur: 1580, cap: 6, br: 3, m2: 75, img: "/images/apt-sandflaesa.jpg" },
    { id: "5", name: "Selværgutt",    nok: 18959, eur: 1650, cap: 8, br: 3, m2: 85, img: "/images/apt-selvaergutt.jpg" },
    { id: "6", name: "Vegardbryggen", nok: 14306, eur: 1250, cap: 3, br: 1, m2: 38, img: "/images/apt-vegardbryggen.jpg" }
  ];

  var BOATS = [
    { id: "1", name: "Båt 1", spec: "Kværnø 24 ft · 150 hk",    nok: 10548, eur: 920, cap: 4, img: "/images/bat.jpg" },
    { id: "2", name: "Båt 2", spec: "Aluboat 22 ft · 115 hk",   nok: 9988,  eur: 870, cap: 4, img: "/images/boat-action.jpg" },
    { id: "3", name: "Båt 3", spec: "Kværnø 22 ft · 140 hk",    nok: 9988,  eur: 870, cap: 4, img: "/images/boat-fleet.jpg" },
    { id: "4", name: "Båt 4", spec: "Aluboat 22 ft · 115 hk",   nok: 9988,  eur: 870, cap: 4, img: "/images/bat.jpg" },
    { id: "5", name: "Båt 5", spec: "Aluboat 22 ft · 115 hk",   nok: 9988,  eur: 870, cap: 4, img: "/images/boat-action.jpg" },
    { id: "6", name: "Båt 6", spec: "Aluboat 22 ft · 150 hk",   nok: 9988,  eur: 870, cap: 4, img: "/images/boat-fleet.jpg" },
    { id: "7", name: "Båt 7", spec: "Aluboat 24,5 ft · 150 hk", nok: 10831, eur: 945, cap: 4, img: "/images/bat.jpg" },
    { id: "8", name: "Båt 8", spec: "Aluboat 22 ft · 115 hk",   nok: 9988,  eur: 870, cap: 4, img: "/images/boat-action.jpg" }
  ];

  function unitById(id) { return UNITS.filter(function (u) { return u.id === String(id); })[0] || null; }
  function boatById(id) { return BOATS.filter(function (b) { return b.id === String(id); })[0] || null; }

  // ---- Formatering ----
  function fmtNOK(n) {
    var s = String(Math.round(n));
    return "kr " + s.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  }
  function fmtEUR(n) {
    var s = String(Math.round(n));
    return "€" + s.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  }
  // "2026-07-11" -> "11.07.2026" (uten Date-objekt, unngår tidssone-krøll)
  function fmtDate(iso) {
    if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso || "";
    var p = iso.split("-");
    return p[2] + "." + p[1] + "." + p[0];
  }
  function nightsBetween(fraIso, tilIso) {
    if (!fraIso || !tilIso) return 0;
    var a = Date.parse(fraIso + "T12:00:00Z"), b = Date.parse(tilIso + "T12:00:00Z");
    if (isNaN(a) || isNaN(b)) return 0;
    return Math.round((b - a) / 86400000);
  }

  // ---- Prisoverslag (fra-priser per uke) ----
  function weeklySum(order) {
    var nok = 0, eur = 0;
    (order.units || []).forEach(function (id) { var u = unitById(id); if (u) { nok += u.nok; eur += u.eur; } });
    (order.boats || []).forEach(function (id) { var b = boatById(id); if (b) { nok += b.nok; eur += b.eur; } });
    return { nok: nok, eur: eur };
  }
  // Returnerer null uten datoer/valg; ellers { nok, eur, nights, weeks, exact }
  function estimate(order) {
    var w = weeklySum(order);
    if (w.nok === 0) return null;
    var nights = nightsBetween(order.fra, order.til);
    if (nights <= 0) return { nok: w.nok, eur: w.eur, nights: 0, weeks: 1, exact: false, perWeekOnly: true };
    var weeks = nights / 7;
    return {
      nok: Math.round(w.nok * weeks),
      eur: Math.round(w.eur * weeks),
      nights: nights,
      weeks: Math.round(weeks * 100) / 100,
      exact: nights % 7 === 0,
      perWeekOnly: false
    };
  }

  // ---- Tilbuds-id + lenke ----
  function makeId() {
    var t = Date.now().toString(36).toUpperCase().slice(-4);
    var r = Math.random().toString(36).toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 2) || "XX";
    return "TAF-" + t + r;
  }
  function todayIso() {
    var d = new Date();
    var mm = String(d.getMonth() + 1); if (mm.length < 2) mm = "0" + mm;
    var dd = String(d.getDate()); if (dd.length < 2) dd = "0" + dd;
    return d.getFullYear() + "-" + mm + "-" + dd;
  }
  // Navn -> ren URL-bit uten %-koder: "Åse Sørlie" -> "Aase-Soerlie"
  function slugName(name) {
    if (!name) return "";
    var map = { "æ": "ae", "ø": "oe", "å": "aa", "Æ": "Ae", "Ø": "Oe", "Å": "Aa",
                "ä": "ae", "ö": "oe", "ü": "ue", "Ä": "Ae", "Ö": "Oe", "Ü": "Ue", "ß": "ss",
                "é": "e", "è": "e", "É": "E", "á": "a", "à": "a" };
    var s = String(name).replace(/[æøåÆØÅäöüÄÖÜßéèÉáà]/g, function (c) { return map[c] || c; });
    s = s.replace(/[^A-Za-z0-9 ]+/g, " ").trim().replace(/\s+/g, "-");
    return s.slice(0, 40);
  }
  function unslugName(slug) { return (slug || "").replace(/-/g, " "); }

  // Pen lenke uten %-koder og uten e-post:
  //   /tilbud/TAF-XXXXXX/no/2026-07-11/2026-07-18/6/l1.5-b2/Ola-Nordmann?d=2026-07-07
  // «l1.5» = leilighet 1 og 5, «b2» = båt 2, «x» = ikke oppgitt.
  function tilbudUrl(order, origin) {
    var base;
    if (origin && origin.indexOf("http") === 0 && origin.indexOf("localhost") === -1 && origin.indexOf("127.0.0.1") === -1) {
      base = origin;
    } else {
      base = SITE;
    }
    var items = [];
    if ((order.units || []).length) items.push("l" + order.units.join("."));
    if ((order.boats || []).length) items.push("b" + order.boats.join("."));
    var seg = [
      order.id || makeId(),
      order.lang || "no",
      order.fra || "x",
      order.til || "x",
      order.guests || "x",
      items.length ? items.join("-") : "x"
    ];
    var nm = slugName(order.name);
    if (nm) seg.push(nm);
    var url = base + "/tilbud/" + seg.join("/");
    if (order.created) url += "?d=" + order.created;
    return url;
  }

  // Motsatt vei: pathname (+ query-fallback for gamle lenker) -> order
  function orderFromParams(get, pathname) {
    function csv(v) { return v ? v.split(",").filter(Boolean) : []; }
    var o = {
      id: get("id") || "", created: get("d") || "",
      name: get("n") || "", email: get("e") || "",
      fra: get("fra") || "", til: get("til") || "", guests: get("p") || "",
      units: csv(get("u")), boats: csv(get("b")),
      lang: get("lang") || "", msg: get("m") || ""
    };
    // Sti-format: /tilbud/<id>/<lang>/<fra>/<til>/<pers>/<items>/<navn>
    var m = /\/tilbud\/(.+)$/.exec(pathname || "");
    if (m) {
      var seg = m[1].split("/").map(function (s) { return decodeURIComponent(s); });
      function val(i) { return seg[i] && seg[i] !== "x" ? seg[i] : ""; }
      o.id = val(0) || o.id;
      o.lang = val(1) || o.lang;
      if (/^\d{4}-\d{2}-\d{2}$/.test(val(2))) o.fra = val(2);
      if (/^\d{4}-\d{2}-\d{2}$/.test(val(3))) o.til = val(3);
      if (/^\d+$/.test(val(4))) o.guests = val(4);
      (val(5) || "").split("-").forEach(function (part) {
        if (/^l[\d.]+$/.test(part)) o.units = part.slice(1).split(".").filter(Boolean);
        if (/^b[\d.]+$/.test(part)) o.boats = part.slice(1).split(".").filter(Boolean);
      });
      if (val(6)) o.name = unslugName(val(6));
    }
    if (!o.id) o.id = makeId();
    if (["no", "en", "de"].indexOf(o.lang) === -1) o.lang = "no";
    return o;
  }

  function listNames(order) {
    var parts = [];
    (order.units || []).forEach(function (id) { var u = unitById(id); if (u) parts.push(u.name); });
    (order.boats || []).forEach(function (id) { var b = boatById(id); if (b) parts.push(b.name); });
    return parts;
  }

  // ---- E-post: forespørsel fra gjest til TAF ----
  var L = {
    no: { subj: "Forespørsel", name: "Navn", email: "E-post", from: "Fra", to: "Til", guests: "Antall personer",
          units: "Leiligheter", boats: "Båter", none: "ingen valgt — foreslå gjerne", msg: "Melding",
          est: "Prisoverslag (fra-priser)", perweek: "per uke", nights: "netter", link: "Full ordreoversikt / tilbud", week: "uker", week1: "uke" },
    en: { subj: "Enquiry", name: "Name", email: "Email", from: "From", to: "To", guests: "Guests",
          units: "Apartments", boats: "Boats", none: "none selected — please suggest", msg: "Message",
          est: "Price estimate (from-prices)", perweek: "per week", nights: "nights", link: "Full order overview / offer", week: "weeks", week1: "week" },
    de: { subj: "Anfrage", name: "Name", email: "E-Mail", from: "Von", to: "Bis", guests: "Personen",
          units: "Wohnungen", boats: "Boote", none: "keine gewählt — bitte Vorschlag", msg: "Nachricht",
          est: "Preisschätzung (Ab-Preise)", perweek: "pro Woche", nights: "Nächte", link: "Bestellübersicht / Angebot", week: "Wochen", week1: "Woche" }
  };

  function enquiryMail(order, origin) {
    var t = L[order.lang] || L.no;
    var lines = [];
    lines.push(t.name + ": " + order.name);
    lines.push(t.email + ": " + order.email);
    lines.push(t.from + ": " + fmtDate(order.fra) + "   " + t.to + ": " + fmtDate(order.til));
    if (order.guests) lines.push(t.guests + ": " + order.guests);
    lines.push("");
    var us = (order.units || []).map(unitById).filter(Boolean);
    var bs = (order.boats || []).map(boatById).filter(Boolean);
    lines.push(t.units + ":");
    if (us.length) us.forEach(function (u) { lines.push("  · " + u.name + " (" + u.cap + " pers) — " + fmtNOK(u.nok) + " /" + t.perweek.split(" ").pop()); });
    else lines.push("  · " + t.none);
    lines.push(t.boats + ":");
    if (bs.length) bs.forEach(function (b) { lines.push("  · " + b.name + " (" + b.spec + ") — " + fmtNOK(b.nok) + " /" + t.perweek.split(" ").pop()); });
    else lines.push("  · " + t.none);
    var est = estimate(order);
    if (est && !est.perWeekOnly) {
      lines.push("");
      lines.push(t.est + ": " + fmtNOK(est.nok) + "  (" + est.nights + " " + t.nights + " ≈ " + est.weeks + " " + (est.weeks === 1 ? (t.week1 || t.week) : t.week) + ")");
    }
    if (order.msg) { lines.push(""); lines.push(t.msg + ":"); lines.push(order.msg); }
    lines.push("");
    lines.push("— " + t.link + " —");
    lines.push(tilbudUrl(order, origin));
    return {
      to: MAIL_TAF,
      subject: t.subj + " " + order.id + " — Træna Arctic Fishing",
      body: lines.join("\n")
    };
  }

  // ---- E-post: TAF -> DinTur (kapasitet) — alltid norsk ----
  function dinTurMail(order) {
    var names = listNames(order);
    var what = names.length ? names.join(", ") : "leilighet og båt";
    var period = fmtDate(order.fra) + "–" + fmtDate(order.til);
    var body =
      "Hei,\n\n" +
      "I perioden " + period + " har vi leid ut til egne gjester og har derfor ikke kapasitet på disse datoene. " +
      "Det gjelder: " + what + ". " +
      "Vi ber dere blokkere dette i deres kalender. " +
      "Ta gjerne kontakt om noe er uklart.\n\n" +
      "Med vennlig hilsen\nYngve Myhre\nTræna Arctic Fishing";
    return {
      to: MAIL_DINTUR,
      subject: "Ikke kapasitet " + period + " — Træna Arctic Fishing",
      body: body
    };
  }

  // ---- E-post: TAF -> kunde (tilbudet), på gjestens språk ----
  var CL = {
    no: { hei: "Hei", thanks: "Takk for forespørselen deres! Her er tilbudet for oppholdet",
          see: "Se full oversikt over hva som er inkludert, priser og praktisk info her:",
          accept: "Ser dette riktig ut, kan dere godta tilbudet direkte på siden — eller bare svare på denne e-posten.",
          mvh: "Med vennlig hilsen", subj: "Tilbud" },
    en: { hei: "Hi", thanks: "Thank you for your enquiry! Here is our offer for your stay",
          see: "See the full overview of what's included, prices and practical info here:",
          accept: "If everything looks right, you can accept the offer directly on the page — or simply reply to this email.",
          mvh: "Best regards", subj: "Offer" },
    de: { hei: "Hallo", thanks: "Vielen Dank für Ihre Anfrage! Hier ist unser Angebot für Ihren Aufenthalt",
          see: "Die vollständige Übersicht über Leistungen, Preise und praktische Infos finden Sie hier:",
          accept: "Wenn alles passt, können Sie das Angebot direkt auf der Seite annehmen — oder einfach auf diese E-Mail antworten.",
          mvh: "Mit freundlichen Grüßen", subj: "Angebot" }
  };
  function customerMail(order, origin) {
    var t = CL[order.lang] || CL.no;
    var body =
      t.hei + " " + (order.name || "") + ",\n\n" +
      t.thanks + " " + fmtDate(order.fra) + "–" + fmtDate(order.til) + " (" + order.id + ").\n\n" +
      t.see + "\n" + tilbudUrl(order, origin) + "\n\n" +
      t.accept + "\n\n" +
      t.mvh + "\nTræna Arctic Fishing\n" + PHONE_TAF + " · " + MAIL_TAF;
    return {
      to: order.email,
      subject: t.subj + " " + order.id + " — Træna Arctic Fishing",
      body: body
    };
  }

  function mailtoHref(mail) {
    return "mailto:" + (mail.to || "") +
      "?subject=" + encodeURIComponent(mail.subject) +
      "&body=" + encodeURIComponent(mail.body);
  }

  var TAF = {
    SITE: SITE, MAIL_TAF: MAIL_TAF, MAIL_DINTUR: MAIL_DINTUR, PHONE_TAF: PHONE_TAF,
    UNITS: UNITS, BOATS: BOATS, unitById: unitById, boatById: boatById,
    fmtNOK: fmtNOK, fmtEUR: fmtEUR, fmtDate: fmtDate, nightsBetween: nightsBetween,
    weeklySum: weeklySum, estimate: estimate,
    makeId: makeId, todayIso: todayIso, tilbudUrl: tilbudUrl, orderFromParams: orderFromParams,
    listNames: listNames, enquiryMail: enquiryMail, dinTurMail: dinTurMail, customerMail: customerMail,
    mailtoHref: mailtoHref
  };

  if (typeof module !== "undefined" && module.exports) module.exports = TAF;
  else root.TAF = TAF;
})(typeof window !== "undefined" ? window : this);
