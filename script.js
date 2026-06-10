// ============================================================
// Træna Arctic Fishing — language toggle, nav, scroll reveal
// ============================================================

(function () {
  "use strict";

  // ---- Language toggle (NO / EN) ----
  var STORAGE_KEY = "taf-lang";
  var langToggle = document.getElementById("langToggle");

  function applyLang(lang) {
    document.documentElement.lang = lang === "en" ? "en" : "no";

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

  function currentLang() {
    try {
      var saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return saved;
    } catch (e) {}
    return (navigator.language || "no").toLowerCase().indexOf("en") === 0 ? "en" : "no";
  }

  langToggle.addEventListener("click", function () {
    var next = document.documentElement.lang === "en" ? "no" : "en";
    applyLang(next);
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
  var MAIL_TO = "post@traenaarcticfishing.no"; // TODO: bytt til riktig e-post

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var data = new FormData(form);
    var en = document.documentElement.lang === "en";

    var subject = en
      ? "Enquiry — Træna Arctic Fishing"
      : "Forespørsel — Træna Arctic Fishing";

    var lines = en
      ? [
          "Name: " + (data.get("navn") || ""),
          "Email: " + (data.get("epost") || ""),
          "From: " + (data.get("fra") || ""),
          "To: " + (data.get("til") || ""),
          "Guests: " + (data.get("antall") || ""),
          "",
          data.get("melding") || ""
        ]
      : [
          "Navn: " + (data.get("navn") || ""),
          "E-post: " + (data.get("epost") || ""),
          "Fra: " + (data.get("fra") || ""),
          "Til: " + (data.get("til") || ""),
          "Antall: " + (data.get("antall") || ""),
          "",
          data.get("melding") || ""
        ];

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
