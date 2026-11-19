/* Bahia Turismo — idiomas: pop-up de entrada, troca em tempo real, 6 idiomas */
(function () {
  "use strict";

  var WHATSAPP = "5573998429935";
  var STORAGE_KEY = "bahia-turismo-lang";

  var LANGS = [
    { code: "pt", htmlLang: "pt-BR", native: "Português", dir: "ltr", flag: "br" },
    { code: "en", htmlLang: "en", native: "English", dir: "ltr", flag: "gb" },
    { code: "he", htmlLang: "he", native: "עברית", dir: "rtl", flag: "il" },
    { code: "es", htmlLang: "es", native: "Español", dir: "ltr", flag: "es" },
    { code: "fr", htmlLang: "fr", native: "Français", dir: "ltr", flag: "fr" },
    { code: "it", htmlLang: "it", native: "Italiano", dir: "ltr", flag: "it" }
  ];

  var OG_LOCALE = {
    pt: "pt_BR", en: "en_US", he: "he_IL", es: "es_ES", fr: "fr_FR", it: "it_IT"
  };

  var dicts = window.BT_DICT || {};

  var state = { lang: "pt", suggested: null, stored: false };
  var snapshot = [];
  var originals = {};
  var capsuleHTML = "";
  var lastFocus = null;

  /* ---------- utilidades ---------- */

  function byLang(code) {
    for (var i = 0; i < LANGS.length; i++) if (LANGS[i].code === code) return LANGS[i];
    return LANGS[0];
  }

  function isSupported(code) {
    return !!code && LANGS.some(function (l) { return l.code === code; });
  }

  function t(key) {
    var d = dicts[state.lang] || {};
    if (d[key] != null) return d[key];
    if (originals[key] != null) return originals[key];
    var p = dicts.pt || {};
    if (p[key] != null) return p[key];
    return "";
  }

  function readStored() {
    try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
  }

  function store(code) {
    try { localStorage.setItem(STORAGE_KEY, code); } catch (e) {}
  }

  function readQuery() {
    try {
      var code = new URLSearchParams(window.location.search).get("lang");
      return isSupported(code) ? code : null;
    } catch (e) { return null; }
  }

  function detect() {
    var list = navigator.languages && navigator.languages.length
      ? navigator.languages
      : [navigator.language || ""];
    for (var i = 0; i < list.length; i++) {
      var base = String(list[i]).toLowerCase().split("-")[0];
      if (base === "iw") base = "he";
      if (isSupported(base)) return base;
    }
    return null;
  }

  /* ---------- captura do conteúdo original (português) ---------- */

  function capture() {
    snapshot = [];
    originals = {};
    var nodes = document.querySelectorAll(
      "[data-i18n],[data-i18n-html],[data-i18n-aria],[data-i18n-alt],[data-i18n-content]"
    );
    Array.prototype.forEach.call(nodes, function (el) {
      var textKey = el.getAttribute("data-i18n");
      var htmlKey = el.getAttribute("data-i18n-html");

      if (textKey !== null && originals[textKey] == null) originals[textKey] = el.textContent;
      if (htmlKey !== null && originals[htmlKey] == null) originals[htmlKey] = el.innerHTML;

      snapshot.push({
        el: el,
        text: el.textContent,
        html: el.innerHTML,
        aria: el.getAttribute("aria-label"),
        alt: el.getAttribute("alt"),
        content: el.getAttribute("content")
      });
    });

    var capsule = document.querySelector("[data-i18n-token='capsule']");
    if (capsule) capsuleHTML = capsule.outerHTML;
  }

  /* ---------- aplicação do idioma ---------- */

  function apply(code, persist) {
    var meta = byLang(code);
    state.lang = meta.code;
    var d = dicts[state.lang] || {};

    snapshot.forEach(function (item) {
      var el = item.el;
      var key;

      key = el.getAttribute("data-i18n");
      if (key !== null) {
        var text = d[key];
        el.textContent = text != null ? text : item.text;
      }

      key = el.getAttribute("data-i18n-html");
      if (key !== null) {
        var html = d[key];
        el.innerHTML = (html != null ? html : item.html).replace(/\{capsule\}/g, capsuleHTML);
      }

      key = el.getAttribute("data-i18n-aria");
      if (key !== null) {
        var aria = d[key];
        el.setAttribute("aria-label", aria != null ? aria : item.aria);
      }

      key = el.getAttribute("data-i18n-alt");
      if (key !== null) {
        var alt = d[key];
        el.setAttribute("alt", alt != null ? alt : item.alt);
      }

      key = el.getAttribute("data-i18n-content");
      if (key !== null) {
        var content = d[key];
        el.setAttribute("content", content != null ? content : item.content);
      }
    });

    var html = document.documentElement;
    html.setAttribute("lang", meta.htmlLang);
    html.setAttribute("dir", meta.dir);
    html.setAttribute("data-lang", meta.code);

    var og = document.querySelector('meta[property="og:locale"]');
    if (og) og.setAttribute("content", OG_LOCALE[meta.code] || "pt_BR");

    var label = document.querySelector("[data-lang-label]");
    if (label) label.textContent = meta.native;

    var current = document.getElementById("lang-current");
    if (current) current.textContent = meta.code.toUpperCase();

    var flagUses = document.querySelectorAll("[data-lang-flag]");
    Array.prototype.forEach.call(flagUses, function (use) {
      var ref = "#f-" + meta.flag;
      use.setAttribute("href", ref);
      use.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", ref);
    });

    renderOptions();
    buildWa();

    var footerBtns = document.querySelectorAll("[data-set-lang]");
    Array.prototype.forEach.call(footerBtns, function (btn) {
      var active = btn.getAttribute("data-set-lang") === meta.code;
      btn.classList.toggle("is-current", active);
      if (active) btn.setAttribute("aria-current", "true");
      else btn.removeAttribute("aria-current");
    });

    if (persist) {
      state.stored = true;
      store(meta.code);
    }

    document.dispatchEvent(new CustomEvent("languagechange", { detail: { lang: meta.code } }));
  }

  /* ---------- links de WhatsApp no idioma atual ---------- */

  function buildWa() {
    var nodes = document.querySelectorAll("[data-wa]");
    Array.prototype.forEach.call(nodes, function (el) {
      var msg = t("wa." + el.getAttribute("data-wa"));
      if (!msg) return;

      var nameKey = el.getAttribute("data-wa-name");
      var placeKey = el.getAttribute("data-wa-place");
      var price = el.getAttribute("data-wa-price");

      if (nameKey) msg = msg.replace("{name}", t(nameKey));
      if (placeKey) msg = msg.replace("{place}", t(placeKey));
      if (price) msg = msg.replace("{price}", price);

      el.setAttribute(
        "href",
        "https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(msg)
      );
    });
  }

  /* ---------- pop-up ---------- */

  function renderOptions() {
    var wrap = document.getElementById("lang-options");
    if (!wrap) return;

    wrap.innerHTML = "";
    LANGS.forEach(function (l) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "lang-option";
      btn.setAttribute("data-lang-choice", l.code);

      if (l.code === state.lang) btn.classList.add("is-current");
      if (state.suggested === l.code && !state.stored) btn.classList.add("is-suggested");

      btn.innerHTML =
        '<span class="lang-head">' +
        '<svg class="flag" viewBox="0 0 24 16" aria-hidden="true" focusable="false"><use href="#f-' + l.flag + '"></use></svg>' +
        '<span class="lang-code">' + l.code.toUpperCase() + "</span>" +
        "</span>" +
        '<span class="lang-name" lang="' + l.htmlLang + '" dir="' + l.dir + '">' + l.native + "</span>" +
        '<span class="lang-note">' + (l.code === state.lang ? "" : t("lang.name." + l.code)) + "</span>" +
        (state.suggested === l.code && !state.stored
          ? '<span class="lang-tag">' + t("lang.suggested") + "</span>"
          : "");

      btn.addEventListener("click", function () {
        choose(l.code);
      });

      wrap.appendChild(btn);
    });

    var title = document.getElementById("lang-title");
    if (title) title.textContent = t("lang.title");

    var hint = document.getElementById("lang-hint");
    if (hint) hint.textContent = t("lang.hint");

    var change = document.getElementById("lang-open");
    if (change) change.setAttribute("aria-label", t("lang.change"));
  }

  function modalNode() {
    return document.getElementById("lang-modal");
  }

  function isOpen() {
    var m = modalNode();
    return !!m && !m.hasAttribute("hidden");
  }

  function open() {
    var m = modalNode();
    if (!m) return;

    lastFocus = document.activeElement;
    m.removeAttribute("hidden");
    document.body.style.overflow = "hidden";
    renderOptions();

    var target = m.querySelector(".lang-option.is-suggested") || m.querySelector(".lang-option.is-current") || m.querySelector(".lang-option");
    if (target) {
      window.setTimeout(function () { target.focus(); }, 40);
    }
  }

  function close() {
    var m = modalNode();
    if (!m) return;

    m.setAttribute("hidden", "");
    document.body.style.overflow = "";

    if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
    lastFocus = null;
  }

  function dismiss() {
    if (!state.stored) {
      apply(state.suggested || "pt", true);
    }
    close();
  }

  function choose(code) {
    apply(code, true);
    close();
  }

  function trapFocus(e) {
    if (e.key === "Escape") {
      e.preventDefault();
      dismiss();
      return;
    }
    if (e.key !== "Tab") return;

    var m = modalNode();
    if (!m) return;

    var focusables = m.querySelectorAll("button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])");
    if (!focusables.length) return;

    var first = focusables[0];
    var last = focusables[focusables.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  /* ---------- inicialização ---------- */

  function init() {
    capture();

    var stored = readStored();
    var query = readQuery();
    var initial = query || (isSupported(stored) ? stored : null);

    state.stored = !!initial;
    state.suggested = detect();

    if (initial) {
      apply(initial, false);
      if (query) store(query);
    } else {
      apply("pt", false);
    }

    document.addEventListener("click", function (e) {
      var swap = e.target.closest ? e.target.closest("[data-set-lang]") : null;
      if (swap && isSupported(swap.getAttribute("data-set-lang"))) {
        choose(swap.getAttribute("data-set-lang"));
        return;
      }

      var opener = e.target.closest ? e.target.closest("[data-lang-open]") : null;
      if (opener) {
        e.preventDefault();
        open();
        return;
      }

      var dismisser = e.target.closest ? e.target.closest("[data-lang-dismiss]") : null;
      if (dismisser) dismiss();
    });

    var m = modalNode();
    if (m) {
      m.addEventListener("keydown", trapFocus);
      var closeBtn = m.querySelector("[data-lang-dismiss]");
      if (closeBtn) closeBtn.addEventListener("click", dismiss);
    }

    // link direto de uma ficha (#passeio-...): não cobre o painel com o pop-up de idioma
    var tourLink = /^#passeio-/.test(window.location.hash || "");
    if (!initial && !tourLink) open();

    window.setTimeout(function () {
      document.documentElement.classList.add("lang-ready");
    }, 300);
  }

  window.I18N = {
    t: t,
    apply: function (code, persist) { apply(code, persist !== false); },
    buildWa: buildWa,
    open: open,
    current: function () { return state.lang; }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
