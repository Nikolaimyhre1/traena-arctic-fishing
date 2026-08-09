// ============================================================
// Træna Arctic Fishing — language + currency toggle, nav, reveal
// ============================================================

(function () {
  "use strict";

  var LANGS = ["no", "en", "de"];
  var LANG_KEY = "taf-lang";
  var CUR_KEY = "taf-cur";
  var CUR_MANUAL_KEY = "taf-cur-manual";

  var langToggle = document.getElementById("langToggle");
  var curToggle = document.getElementById("curToggle");

  // ---- Currency (NOK / EUR) ----
  // Defaults to NOK on Norwegian, EUR on English/German, unless the visitor
  // has clicked the currency toggle (then their choice sticks).
  var curManual = false;
  try { curManual = localStorage.getItem(CUR_MANUAL_KEY) === "1"; } catch (e) {}

  function paintCurrency(cur) {
    document.querySelectorAll(".price").forEach(function (el) {
      var val = el.getAttribute("data-" + cur);
      if (val !== null) el.textContent = val;
    });
    if (curToggle) {
      curToggle.querySelectorAll(".cur__opt").forEach(function (opt) {
        opt.classList.toggle("is-active", opt.getAttribute("data-cur") === cur);
      });
    }
    try { localStorage.setItem(CUR_KEY, cur); } catch (e) {}
  }

  function setCurrency(cur, manual) {
    if (manual) {
      curManual = true;
      try { localStorage.setItem(CUR_MANUAL_KEY, "1"); } catch (e) {}
    }
    paintCurrency(cur);
  }

  if (curToggle) {
    curToggle.addEventListener("click", function (e) {
      var opt = e.target.closest(".cur__opt");
      var cur = opt && opt.getAttribute("data-cur");
      if (!cur) cur = localStorage.getItem(CUR_KEY) === "eur" ? "nok" : "eur";
      setCurrency(cur, true);
    });
  }

  // ---- Language (NO / EN / DE) ----
  function applyLang(lang) {
    document.documentElement.lang = lang;

    document.querySelectorAll("[data-no][data-en]").forEach(function (el) {
      var val = el.getAttribute("data-" + lang);
      if (val !== null) el.innerHTML = val;
    });
    document.querySelectorAll("[data-no-ph][data-en-ph]").forEach(function (el) {
      var ph = el.getAttribute("data-" + lang + "-ph");
      if (ph !== null) el.placeholder = ph;
    });
    document.querySelectorAll("[data-no-href][data-en-href]").forEach(function (el) {
      var href = el.getAttribute("data-" + lang + "-href");
      if (href !== null) el.href = href;
    });
    if (langToggle) {
      langToggle.querySelectorAll(".lang__opt").forEach(function (opt) {
        opt.classList.toggle("is-active", opt.getAttribute("data-lang") === lang);
      });
    }
    try { localStorage.setItem(LANG_KEY, lang); } catch (e) {}

    // Currency follows language unless the visitor overrode it.
    if (!curManual) paintCurrency(lang === "no" ? "nok" : "eur");
  }

  function currentLang() {
    try {
      var saved = localStorage.getItem(LANG_KEY);
      if (saved && LANGS.indexOf(saved) !== -1) return saved;
    } catch (e) {}
    var nav = (navigator.language || "no").toLowerCase();
    if (nav.indexOf("de") === 0) return "de";
    if (nav.indexOf("en") === 0) return "en";
    return "no";
  }

  if (langToggle) {
    langToggle.addEventListener("click", function (e) {
      var opt = e.target.closest(".lang__opt");
      if (opt && opt.getAttribute("data-lang")) {
        applyLang(opt.getAttribute("data-lang"));
        return;
      }
      var idx = LANGS.indexOf(document.documentElement.lang);
      applyLang(LANGS[(idx + 1) % LANGS.length]);
    });
  }

  applyLang(currentLang());
  // If the visitor previously picked a currency manually, restore it.
  if (curManual) {
    var savedCur = "nok";
    try { savedCur = localStorage.getItem(CUR_KEY) || "nok"; } catch (e) {}
    paintCurrency(savedCur);
  }

  // ---- Sticky nav state ----
  var nav = document.getElementById("nav");
  if (nav) {
    var onScroll = function () { nav.classList.toggle("is-stuck", window.scrollY > 40); };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

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

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var data = new FormData(form);
      var lang = document.documentElement.lang;

      var L = {
        no: { subj: "Forespørsel — Træna Arctic Fishing", navn: "Navn", epost: "E-post", mobil: "Mobil", fra: "Fra", til: "Til", antall: "Antall", leilighet: "Leilighet", bat: "Båt" },
        en: { subj: "Enquiry — Træna Arctic Fishing", navn: "Name", epost: "Email", mobil: "Mobile", fra: "From", til: "To", antall: "Guests", leilighet: "Apartment", bat: "Boat" },
        de: { subj: "Anfrage — Træna Arctic Fishing", navn: "Name", epost: "E-Mail", mobil: "Handynummer", fra: "Von", til: "Bis", antall: "Personen", leilighet: "Wohnung", bat: "Boot" }
      };
      var t = L[lang] || L.no;

      var lines = [
        t.navn + ": " + (data.get("navn") || ""),
        t.epost + ": " + (data.get("epost") || ""),
        t.mobil + ": " + (data.get("mobil") || ""),
        t.fra + ": " + (data.get("fra") || ""),
        t.til + ": " + (data.get("til") || ""),
        t.antall + ": " + (data.get("antall") || "")
      ];
      if (data.get("leilighet")) lines.push(t.leilighet + ": " + data.get("leilighet"));
      if (data.get("bat")) lines.push(t.bat + ": " + data.get("bat"));
      lines.push("");
      lines.push(data.get("melding") || "");

      window.location.href = "mailto:" + MAIL_TO +
        "?subject=" + encodeURIComponent(t.subj) +
        "&body=" + encodeURIComponent(lines.join("\n"));
    });
  }

  // ---- Footer year ----
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
