// ============================================================
// Træna Arctic Fishing — Book-siden
// Klikkbare kort -> «Din bestilling» -> forespørsel på e-post
// Avhenger av order-core.js (window.TAF) og script.js (språk/valuta).
// ============================================================

(function () {
  "use strict";
  if (!window.TAF) return;
  var TAF = window.TAF;

  var picked = { unit: [], boat: [] }; // id-lister, i klikk-rekkefølge

  var list = document.getElementById("orderList");
  var empty = document.getElementById("orderEmpty");
  var totalRow = document.getElementById("orderTotal");
  var sumEl = document.getElementById("orderSum");
  var periodEl = document.getElementById("orderPeriod");
  var form = document.getElementById("orderForm");
  if (!list || !form) return;

  function lang() {
    var l = document.documentElement.lang;
    return ["no", "en", "de"].indexOf(l) !== -1 ? l : "no";
  }
  function currency() {
    var c = null;
    try { c = localStorage.getItem("taf-cur"); } catch (e) {}
    if (c === "nok" || c === "eur") return c;
    return lang() === "no" ? "nok" : "eur";
  }

  // Setter tekst + data-no/en/de slik at språkbytte (script.js) også
  // oppdaterer dynamisk innhold.
  function setI18n(el, no, en, de) {
    el.setAttribute("data-no", no);
    el.setAttribute("data-en", en);
    el.setAttribute("data-de", de);
    el.textContent = { no: no, en: en, de: de }[lang()];
  }
  function setPrice(el, nok, eur) {
    el.setAttribute("data-nok", TAF.fmtNOK(nok));
    el.setAttribute("data-eur", TAF.fmtEUR(eur));
    el.textContent = currency() === "eur" ? TAF.fmtEUR(eur) : TAF.fmtNOK(nok);
  }

  function currentDates() {
    var fra = form.elements.fra.value, til = form.elements.til.value;
    return { fra: fra, til: til };
  }
  function currentOrder() {
    var d = currentDates();
    return { units: picked.unit.slice(), boats: picked.boat.slice(), fra: d.fra, til: d.til };
  }

  function render() {
    list.innerHTML = "";
    var items = [];
    picked.unit.forEach(function (id) {
      var u = TAF.unitById(id);
      if (u) items.push({ kind: "unit", id: id, name: u.name, sub: u.cap, nok: u.nok, eur: u.eur });
    });
    picked.boat.forEach(function (id) {
      var b = TAF.boatById(id);
      if (b) items.push({ kind: "boat", id: id, name: b.name, spec: b.spec, nok: b.nok, eur: b.eur });
    });

    empty.hidden = items.length > 0;

    items.forEach(function (it) {
      var li = document.createElement("li");
      var nm = document.createElement("span");
      nm.className = "nm";
      if (it.kind === "unit") {
        setI18n(nm, it.name + " · inntil " + it.sub + " pers", it.name + " · sleeps " + it.sub, it.name + " · bis " + it.sub + " Pers.");
      } else {
        nm.textContent = it.name + " · " + it.spec;
      }
      var rm = document.createElement("button");
      rm.type = "button";
      rm.className = "rm";
      rm.setAttribute("data-kind", it.kind);
      rm.setAttribute("data-id", it.id);
      setI18n(rm, "fjern", "remove", "entfernen");
      var pr = document.createElement("span");
      pr.className = "pr";
      var priceSpan = document.createElement("span");
      priceSpan.className = "price";
      setPrice(priceSpan, it.nok, it.eur);
      var per = document.createElement("span");
      per.className = "per";
      setI18n(per, " /uke", " /week", " /Woche");
      pr.appendChild(priceSpan); pr.appendChild(per);
      li.appendChild(nm); li.appendChild(rm); li.appendChild(pr);
      list.appendChild(li);
    });

    // Total / overslag
    var est = TAF.estimate(currentOrder());
    if (est) {
      totalRow.hidden = false;
      setPrice(sumEl, est.nok, est.eur);
      if (!est.perWeekOnly && est.nights > 0) {
        var wNo = est.weeks === 1 ? "uke" : "uker", wEn = est.weeks === 1 ? "week" : "weeks", wDe = est.weeks === 1 ? "Woche" : "Wochen";
        setI18n(periodEl,
          "· " + est.nights + " netter ≈ " + est.weeks + " " + wNo,
          "· " + est.nights + " nights ≈ " + est.weeks + " " + wEn,
          "· " + est.nights + " Nächte ≈ " + est.weeks + " " + wDe);
      } else {
        setI18n(periodEl, "· per uke", "· per week", "· pro Woche");
      }
    } else {
      totalRow.hidden = true;
    }
  }

  function syncCard(card) {
    var kind = card.getAttribute("data-kind"), id = card.getAttribute("data-id");
    var on = picked[kind].indexOf(id) !== -1;
    card.classList.toggle("is-picked", on);
    card.setAttribute("aria-pressed", on ? "true" : "false");
  }

  function toggle(kind, id) {
    var arr = picked[kind];
    var i = arr.indexOf(id);
    if (i === -1) arr.push(id); else arr.splice(i, 1);
    document.querySelectorAll('.selectable[data-kind="' + kind + '"][data-id="' + id + '"]').forEach(syncCard);
    render();
  }

  document.querySelectorAll(".selectable").forEach(function (card) {
    card.addEventListener("click", function () {
      toggle(card.getAttribute("data-kind"), card.getAttribute("data-id"));
    });
    card.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggle(card.getAttribute("data-kind"), card.getAttribute("data-id"));
      }
    });
  });

  // «fjern»-knappene i lista
  list.addEventListener("click", function (e) {
    var btn = e.target.closest(".rm");
    if (btn) toggle(btn.getAttribute("data-kind"), btn.getAttribute("data-id"));
  });

  // Datoendring -> nytt overslag
  form.elements.fra.addEventListener("change", render);
  form.elements.til.addEventListener("change", render);

  // Valutabytte re-rendres av script.js (paintCurrency treffer .price-spans).
  // Språkbytte re-rendres av script.js (applyLang treffer data-attrs).

  // ---- Innsending: bygg forespørsels-e-post med tilbudslenke ----
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var data = new FormData(form);
    var order = {
      id: TAF.makeId(),
      created: TAF.todayIso(),
      name: data.get("navn") || "",
      email: data.get("epost") || "",
      fra: data.get("fra") || "",
      til: data.get("til") || "",
      guests: data.get("antall") || "",
      units: picked.unit.slice(),
      boats: picked.boat.slice(),
      lang: lang(),
      msg: data.get("melding") || ""
    };
    var mail = TAF.enquiryMail(order, window.location.origin);
    window.location.href = TAF.mailtoHref(mail);
  });

  render();
})();
