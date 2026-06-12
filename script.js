// ============================================================
// Træna Arctic Fishing — language toggle, nav, scroll reveal
// ============================================================

(function () {
  "use strict";

  // ---- Language toggle (NO / EN) ----
  var STORAGE_KEY = "taf-lang";
  var langToggle = document.getElementById("langToggle");

  function applyLang(lang) {
    document.documentElement.lang = lang;

    // swap text content
    document.querySelectorAll("[data-no][data-en]").forEach(function (el) {
      var val = el.getAttribute("data-" + lang);
      if (val !== null) el.innerHTML = val;
    });

    // swap placeholders
    document.querySelectorAll("[data-no-ph][data-en-ph]").forEach(function (el) {
      var ph = el.getAttribute("data-" + lang + "-ph");
      if (ph !== null) el.placeholder = ph;
    });

    // swap language-specific hrefs (e.g. DinTur NO/EN booking page)
    document.querySelectorAll("[data-no-href][data-en-href]").forEach(function (el) {
      var href = el.getAttribute("data-" + lang + "-href");
      if (href !== null) el.href = href;
    });

    // toggle active pill
    langToggle.querySelectorAll(".lang__opt").forEach(function (opt) {
      opt.classList.toggle("is-active", opt.getAttribute("data-lang") === lang);
    });

    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}
  }

  var LANGS = ["no", "en", "de"];

  function currentLang() {
    try {
      var saved = localStorage.getItem(STORAGE_KEY);
      if (saved && LANGS.indexOf(saved) !== -1) return saved;
    } catch (e) {}
    var nav = (navigator.language || "no").toLowerCase();
    if (nav.indexOf("de") === 0) return "de";
    if (nav.indexOf("en") === 0) return "en";
    return "no";
  }

  // Click a specific NO / EN / DE pill to select it; clicking elsewhere cycles.
  langToggle.addEventListener("click", function (e) {
    var opt = e.target.closest(".lang__opt");
    if (opt && opt.getAttribute("data-lang")) {
      applyLang(opt.getAttribute("data-lang"));
      return;
    }
    var cur = document.documentElement.lang;
    var idx = LANGS.indexOf(cur);
    applyLang(LANGS[(idx + 1) % LANGS.length]);
  });

  applyLang(currentLang());

  // ---- Sticky nav state ----
  var nav = document.getElementById("nav");
  function onScroll() {
    nav.classList.toggle("is-stuck", window.scrollY > 40);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // ---- Scroll reveal ----
  var revealEls = document.querySelectorAll(".section, .feature, .strip");
  revealEls.forEach(function (el) { el.classList.add("reveal"); });

  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-in"); });
  }

  // ---- Enquiry form -> opens mail client (no backend needed) ----
  var form = document.getElementById("enquiryForm");
  var MAIL_TO = "traenaarctic@gmail.com";

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var data = new FormData(form);
    var lang = document.documentElement.lang;

    var L = {
      no: { subj: "Forespørsel — Træna Arctic Fishing", navn: "Navn", epost: "E-post", fra: "Fra", til: "Til", antall: "Antall" },
      en: { subj: "Enquiry — Træna Arctic Fishing", navn: "Name", epost: "Email", fra: "From", til: "To", antall: "Guests" },
      de: { subj: "Anfrage — Træna Arctic Fishing", navn: "Name", epost: "E-Mail", fra: "Von", til: "Bis", antall: "Personen" }
    };
    var t = L[lang] || L.no;

    var subject = t.subj;
    var lines = [
      t.navn + ": " + (data.get("navn") || ""),
      t.epost + ": " + (data.get("epost") || ""),
      t.fra + ": " + (data.get("fra") || ""),
      t.til + ": " + (data.get("til") || ""),
      t.antall + ": " + (data.get("antall") || "")
    ];
    // booking page adds apartment/boat selectors
    var labels = {
      no: { leilighet: "Leilighet", bat: "Båt" },
      en: { leilighet: "Apartment", bat: "Boat" },
      de: { leilighet: "Wohnung", bat: "Boot" }
    };
    var bl = labels[lang] || labels.no;
    if (data.get("leilighet")) lines.push(bl.leilighet + ": " + data.get("leilighet"));
    if (data.get("bat")) lines.push(bl.bat + ": " + data.get("bat"));
    lines.push("");
    lines.push(data.get("melding") || "");

    var href =
      "mailto:" + MAIL_TO +
      "?subject=" + encodeURIComponent(subject) +
      "&body=" + encodeURIComponent(lines.join("\n"));

    window.location.href = href;
  });

  // ---- Footer year ----
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
