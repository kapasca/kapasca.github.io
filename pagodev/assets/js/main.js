/* =========================================================
  PAGODEV — MAIN INTERACTIONS
  Lightweight interactions, no external dependencies.
  ========================================================= */
(function () {
  "use strict";

  var root = document.documentElement;
  var header = document.querySelector(".site-header");
  var scrollSignal = document.querySelector(".scroll-signal i");

  var cmdkOverlay = document.querySelector(".cmdk-overlay");
  var cmdkInput = document.querySelector(".cmdk-input");
  var cmdkList = document.querySelector(".cmdk-list");
  var cmdkTriggers = document.querySelectorAll("[data-cmdk-open]");
  var activeIndex = 0;
  var currentLanguage = "en";
  var cmdkItemsData = [];
  var I18N = {};

  var FALLBACK_TEXT = {
    en: {
      header: {
        themeToLight: "Enable light mode",
        themeToDark: "Enable dark mode",
        langCode: "EN",
        langToggleAria: "Switch to Indonesian"
      },
      cmdk: {
        noResults: "No results for"
      }
    },
    id: {
      header: {
        themeToLight: "Aktifkan mode terang",
        themeToDark: "Aktifkan mode gelap",
        langCode: "ID",
        langToggleAria: "Ganti ke Bahasa Inggris"
      },
      cmdk: {
        noResults: "Tidak ada hasil untuk"
      }
    }
  };

  var DEFAULT_CMDK_BY_LANG = {
    en: [
      { label: "Home", tag: "Nav", href: "#top" },
      { label: "About Us", tag: "Nav", href: "#about" },
      { label: "Services", tag: "Nav", href: "#services" },
      { label: "Workflow", tag: "Nav", href: "#process" },
      { label: "FAQ", tag: "Nav", href: "#faq" },
      { label: "Start New Project", tag: "Action", href: "#contact" }
    ],
    id: [
      { label: "Beranda", tag: "Nav", href: "#top" },
      { label: "Tentang Kami", tag: "Nav", href: "#about" },
      { label: "Layanan", tag: "Nav", href: "#services" },
      { label: "Alur Kerja", tag: "Nav", href: "#process" },
      { label: "FAQ", tag: "Nav", href: "#faq" },
      { label: "Mulai Proyek Baru", tag: "Aksi", href: "#contact" }
    ]
  };

  function hasTranslations() {
    return !!(I18N && I18N.en && I18N.id);
  }

  function setText(selector, text) {
    var el = document.querySelector(selector);
    if (el) el.textContent = text;
  }

  function setHtml(selector, html) {
    var el = document.querySelector(selector);
    if (el) el.innerHTML = html;
  }

  function setTextAt(selector, index, text) {
    var list = document.querySelectorAll(selector);
    if (list[index]) list[index].textContent = text;
  }

  function setHtmlAt(selector, index, html) {
    var list = document.querySelectorAll(selector);
    if (list[index]) list[index].innerHTML = html;
  }

  function setEyebrowText(selector, text) {
    var el = document.querySelector(selector);
    if (!el) return;
    var dot = el.querySelector(".dot");
    var dotClone = dot ? dot.cloneNode(true) : null;
    el.textContent = text;
    if (dotClone) el.prepend(dotClone);
  }

  function setButtonTextKeepIcon(selector, text) {
    var el = document.querySelector(selector);
    if (!el) return;
    var icon = el.querySelector("svg");
    if (icon) {
      var iconClone = icon.cloneNode(true);
      el.textContent = text + " ";
      el.appendChild(iconClone);
      return;
    }
    el.textContent = text;
  }

  function setSummaryTextAt(selector, index, text) {
    var list = document.querySelectorAll(selector);
    var el = list[index];
    if (!el) return;
    var plus = el.querySelector(".plus");
    var plusClone = plus ? plus.cloneNode(true) : null;
    el.textContent = text;
    if (plusClone) el.appendChild(plusClone);
  }

  function getPreferredLanguage() {
    var saved = null;
    try {
      saved = localStorage.getItem("pagodev-lang");
    } catch (e) {}
    var browserLang = (navigator.language || "").toLowerCase();
    var detected = browserLang.indexOf("id") === 0 ? "id" : "en";
    return saved === "id" || saved === "en" ? saved : detected;
  }

  function buildCmdkItems(lang) {
    if (!hasTranslations()) {
      return (DEFAULT_CMDK_BY_LANG[lang] || DEFAULT_CMDK_BY_LANG.en).slice();
    }

    var t = I18N[lang] || I18N.en;
    return t.cmdk.items.map(function (item) {
      var isAction = item.href === "#contact";
      return {
        label: item.label,
        tag: isAction ? t.cmdk.actionTag : t.cmdk.navTag,
        href: item.href
      };
    });
  }

  function applyLanguageLite(lang) {
    var next = lang === "id" ? "id" : "en";
    var fallback = FALLBACK_TEXT[next];
    currentLanguage = next;
    root.setAttribute("lang", next);

    try {
      localStorage.setItem("pagodev-lang", next);
    } catch (e) {}

    var langBtn = document.querySelector("[data-lang-toggle]");
    if (langBtn) {
      langBtn.textContent = fallback.header.langCode;
      langBtn.setAttribute("aria-label", fallback.header.langToggleAria);
    }

    cmdkItemsData = buildCmdkItems(next);
    updateThemeIcon(root.getAttribute("data-theme") === "light" ? "light" : "dark");
  }

  function applyLanguage(lang) {
    if (!hasTranslations()) {
      applyLanguageLite(lang);
      return;
    }

    var next = lang === "id" ? "id" : "en";
    var t = I18N[next] || I18N.en;
    currentLanguage = next;

    root.setAttribute("lang", next);
    document.title = t.metaTitle;
    try {
      localStorage.setItem("pagodev-lang", next);
    } catch (e) {}

    setText(".cmdk-label", t.header.quickAccess);
    setText(".header-cta", t.header.startProject);

    var cmdkOpenBtn = document.querySelector("[data-cmdk-open]");
    if (cmdkOpenBtn) cmdkOpenBtn.setAttribute("aria-label", t.header.quickAccessAria);

    var cmdkDialog = document.querySelector(".cmdk-overlay");
    if (cmdkDialog) cmdkDialog.setAttribute("aria-label", t.cmdk.dialogAria);

    if (cmdkInput) {
      cmdkInput.setAttribute("placeholder", t.cmdk.searchPlaceholder);
      cmdkInput.setAttribute("aria-label", t.cmdk.searchAria);
    }

    var langBtn = document.querySelector("[data-lang-toggle]");
    if (langBtn) {
      langBtn.textContent = t.header.langCode;
      langBtn.setAttribute("aria-label", t.header.langToggleAria);
    }

    setEyebrowText(".hero-copy .eyebrow", t.hero.eyebrow);
    setText(".hero-copy h1", t.hero.title);
    setHtml(".hero-copy .lead", t.hero.lead);
    setButtonTextKeepIcon(".hero-actions .btn-primary", t.hero.ctaPrimary);
    setText(".hero-actions .btn-ghost", t.hero.ctaSecondary);

    setEyebrowText("#about .eyebrow", t.about.eyebrow);
    setHtml("#about h2", t.about.title);
    setHtml("#about .lead", t.about.lead);
    t.about.principles.forEach(function (item, i) {
      setTextAt(".about-principles .principle h4", i, item.title);
      setHtmlAt(".about-principles .principle p", i, item.body);
    });

    setEyebrowText("#services .eyebrow", t.services.eyebrow);
    setText("#services .section-head h2", t.services.title);
    setHtml("#services .section-head p", t.services.lead);
    t.services.items.forEach(function (item, i) {
      setTextAt(".services-grid .module-card h3", i, item.title);
      setTextAt(".services-grid .module-card p", i, item.body);
    });

    setEyebrowText("#process .eyebrow", t.process.eyebrow);
    setText("#process .section-head h2", t.process.title);
    t.process.steps.forEach(function (step, i) {
      setTextAt(".process-step h4", i, step.title);
      setTextAt(".process-step p", i, step.body);
    });

    setEyebrowText("#faq .eyebrow", t.faq.eyebrow);
    setText("#faq .section-head h2", t.faq.title);
    t.faq.items.forEach(function (item, i) {
      setSummaryTextAt(".faq-item .faq-question", i, item.q);
      setTextAt(".faq-item .faq-answer p", i, item.a);
    });

    setEyebrowText("#contact .eyebrow", t.contact.eyebrow);
    setText("#contact h2", t.contact.title);
    setHtml("#contact .lead", t.contact.lead);
    setButtonTextKeepIcon("#contact .btn-primary", t.contact.button);

    setHtml(".footer-brand-desc", t.footer.brand);
    setTextAt("nav.footer-col h4", 0, t.footer.navTitle);
    setTextAt("nav.footer-col ul li a", 0, t.footer.navItems[0]);
    setTextAt("nav.footer-col ul li a", 1, t.footer.navItems[1]);
    setTextAt("nav.footer-col ul li a", 2, t.footer.navItems[2]);
    setTextAt("nav.footer-col ul li a", 3, t.footer.navItems[3]);
    setTextAt(".footer-col h4", 1, t.footer.contactTitle);

    var yearNow = new Date().getFullYear();
    var footerCopy = document.querySelector("[data-footer-copy]");
    if (footerCopy) {
      footerCopy.innerHTML = "\u00A9 <span data-year>" + yearNow + "</span> PAGODEV. " + t.footer.copyright;
    }

    var eggOverlay = document.querySelector(".egg-overlay");
    if (eggOverlay) eggOverlay.setAttribute("aria-label", t.egg.aria);
    setHtml(".egg-content p", t.egg.body);
    setText(".egg-close", t.egg.close);

    cmdkItemsData = buildCmdkItems(next);
    if (cmdkOverlay && cmdkOverlay.classList.contains("is-open")) {
      renderCmdkItems(cmdkInput ? cmdkInput.value : "");
    }

    updateThemeIcon(root.getAttribute("data-theme") === "light" ? "light" : "dark");
  }

  function initLanguage() {
    applyLanguage(getPreferredLanguage());
  }

  function toggleLanguage() {
    applyLanguage(currentLanguage === "id" ? "en" : "id");
  }

  function loadTranslations() {
    return fetch("assets/js/i18n.json", { cache: "no-store" })
      .then(function (response) {
        if (!response.ok) {
          throw new Error("Failed to load i18n.json");
        }
        return response.json();
      })
      .then(function (data) {
        I18N = data || {};
      })
      .catch(function (error) {
        I18N = {};
        console.warn("PAGODEV i18n fallback active:", error);
      });
  }

  /* ---------------------------------------------------
      1. THEME (dark / light) — default dark
    --------------------------------------------------- */
  function initTheme() {
    var saved = null;
    try {
      saved = localStorage.getItem("pagodev-theme");
    } catch (e) {}
    var theme = saved || "dark";
    root.setAttribute("data-theme", theme);
    updateThemeIcon(theme);
  }

  function toggleTheme() {
    var current = root.getAttribute("data-theme") === "light" ? "light" : "dark";
    var next = current === "light" ? "dark" : "light";
    root.setAttribute("data-theme", next);
    try {
      localStorage.setItem("pagodev-theme", next);
    } catch (e) {}
    updateThemeIcon(next);
  }

  function updateThemeIcon(theme) {
    var btn = document.querySelector("[data-theme-toggle]");
    if (!btn) return;

    var t = hasTranslations() ? I18N[currentLanguage] || I18N.en : FALLBACK_TEXT[currentLanguage] || FALLBACK_TEXT.en;
    btn.setAttribute("aria-pressed", theme === "light");
    btn.setAttribute("aria-label", theme === "light" ? t.header.themeToDark : t.header.themeToLight);
  }

  /* ---------------------------------------------------
     2. HEADER: sticky glass state + scroll signal
  --------------------------------------------------- */
  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (header) header.classList.toggle("is-scrolled", y > 12);

    var doc = document.documentElement;
    var max = doc.scrollHeight - doc.clientHeight;
    var pct = max > 0 ? (y / max) * 100 : 0;
    if (scrollSignal) scrollSignal.style.width = pct + "%";
  }

  /* ---------------------------------------------------
     3. SCROLL REVEAL
  --------------------------------------------------- */
  function initReveal() {
    var revealEls = document.querySelectorAll(".reveal");
    if ("IntersectionObserver" in window && revealEls.length) {
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
      );

      revealEls.forEach(function (el, i) {
        el.style.setProperty("--i", i % 6);
        io.observe(el);
      });
    } else {
      revealEls.forEach(function (el) {
        el.classList.add("is-visible");
      });
    }
  }

  /* ---------------------------------------------------
     6. COMMAND PALETTE  (shortcut: /)
  --------------------------------------------------- */
  function renderCmdkItems(filter) {
    if (!cmdkList) return;
    var q = (filter || "").toLowerCase().trim();
    var filtered = cmdkItemsData.filter(function (it) {
      return it.label.toLowerCase().indexOf(q) !== -1;
    });

    cmdkList.innerHTML = "";
    if (!filtered.length) {
      var noResultText = hasTranslations() ? (I18N[currentLanguage] || I18N.en).cmdk.noResults : (FALLBACK_TEXT[currentLanguage] || FALLBACK_TEXT.en).cmdk.noResults;
      cmdkList.innerHTML = '<div class="cmdk-empty">' + noResultText + ' "' + escapeHtml(filter) + '"</div>';
      return;
    }

    filtered.forEach(function (it, i) {
      var div = document.createElement("div");
      div.className = "cmdk-item";
      div.setAttribute("role", "option");
      div.setAttribute("data-href", it.href);
      div.setAttribute("aria-selected", i === 0 ? "true" : "false");
      div.innerHTML = "<span>" + escapeHtml(it.label) + '</span><span class="tag">' + escapeHtml(it.tag) + "</span>";
      div.addEventListener("click", function () {
        goTo(it.href);
      });
      cmdkList.appendChild(div);
    });

    activeIndex = 0;
  }

  function escapeHtml(str) {
    var d = document.createElement("div");
    d.textContent = str || "";
    return d.innerHTML;
  }

  function goTo(href) {
    closeCmdk();
    if (href === "#top") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    var target = document.querySelector(href);
    if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function openCmdk() {
    if (!cmdkOverlay) return;
    cmdkOverlay.classList.add("is-open");
    cmdkOverlay.setAttribute("aria-hidden", "false");
    renderCmdkItems("");
    setTimeout(function () {
      if (cmdkInput) cmdkInput.focus();
    }, 50);
    document.body.style.overflow = "hidden";
  }

  function closeCmdk() {
    if (!cmdkOverlay) return;
    cmdkOverlay.classList.remove("is-open");
    cmdkOverlay.setAttribute("aria-hidden", "true");
    if (cmdkInput) cmdkInput.value = "";
    document.body.style.overflow = "";
  }

  function initCmdk() {
    cmdkTriggers.forEach(function (btn) {
      btn.addEventListener("click", openCmdk);
    });

    if (cmdkOverlay) {
      cmdkOverlay.addEventListener("click", function (e) {
        if (e.target === cmdkOverlay) closeCmdk();
      });
    }

    if (cmdkInput) {
      cmdkInput.addEventListener("input", function () {
        renderCmdkItems(cmdkInput.value);
      });

      cmdkInput.addEventListener("keydown", function (e) {
        var items = cmdkList ? cmdkList.querySelectorAll(".cmdk-item") : [];
        if (!items.length) return;

        if (e.key === "ArrowDown") {
          e.preventDefault();
          activeIndex = Math.min(activeIndex + 1, items.length - 1);
          updateActive(items);
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          activeIndex = Math.max(activeIndex - 1, 0);
          updateActive(items);
        } else if (e.key === "Enter") {
          e.preventDefault();
          var el = items[activeIndex];
          if (el) goTo(el.getAttribute("data-href"));
        }
      });
    }
  }

  function updateActive(items) {
    items.forEach(function (it, i) {
      it.setAttribute("aria-selected", i === activeIndex ? "true" : "false");
      if (i === activeIndex) it.scrollIntoView({ block: "nearest" });
    });
  }

  /* ---------------------------------------------------
      7. EASTER EGG — about:pagodev
    --------------------------------------------------- */
  var eggOverlay = document.querySelector(".egg-overlay");
  var eggTriggers = document.querySelectorAll("[data-egg-open]");
  var eggClose = document.querySelector(".egg-close");
  var typedBuffer = "";

  function openEgg() {
    if (!eggOverlay) return;
    eggOverlay.classList.add("is-open");
    eggOverlay.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeEgg() {
    if (!eggOverlay) return;
    eggOverlay.classList.remove("is-open");
    eggOverlay.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  function initEasterEgg() {
    eggTriggers.forEach(function (btn) {
      btn.addEventListener("click", openEgg);
    });

    if (eggClose) eggClose.addEventListener("click", closeEgg);

    if (eggOverlay) {
      eggOverlay.addEventListener("click", function (e) {
        if (e.target === eggOverlay) closeEgg();
      });
    }

    document.addEventListener("keydown", function (e) {
      var tag = (e.target.tagName || "").toLowerCase();
      var isTyping = tag === "input" || tag === "textarea" || e.target.isContentEditable;
      if (isTyping || e.key.length !== 1) return;
      typedBuffer = (typedBuffer + e.key).slice(-7).toLowerCase();
      if (typedBuffer === "pagodev") {
        openEgg();
        typedBuffer = "";
      }
    });
  }

  /* ---------------------------------------------------
      8. FAQ — only one item open at a time
    --------------------------------------------------- */
  function initFaq() {
    var faqItems = document.querySelectorAll(".faq-item");
    faqItems.forEach(function (item) {
      item.addEventListener("toggle", function () {
        if (item.open) {
          faqItems.forEach(function (other) {
            if (other !== item) other.removeAttribute("open");
          });
        }
      });
    });
  }

  function initYear() {
    var yearEl = document.querySelector("[data-year]");
    if (yearEl) yearEl.textContent = new Date().getFullYear();
  }

  function initKeyboardShortcuts() {
    document.addEventListener("keydown", function (e) {
      var tag = (e.target.tagName || "").toLowerCase();
      var isTyping = tag === "input" || tag === "textarea" || e.target.isContentEditable;

      if (e.key === "/" && !isTyping) {
        e.preventDefault();
        openCmdk();
      } else if (e.key === "Escape") {
        if (cmdkOverlay && cmdkOverlay.classList.contains("is-open")) closeCmdk();
        closeEgg();
      }
    });
  }

  function bindHeaderButtons() {
    var themeBtn = document.querySelector("[data-theme-toggle]");
    if (themeBtn) themeBtn.addEventListener("click", toggleTheme);

    var langBtn = document.querySelector("[data-lang-toggle]");
    if (langBtn) langBtn.addEventListener("click", toggleLanguage);
  }

  function boot() {
    loadTranslations().finally(function () {
      initLanguage();
      initTheme();
      bindHeaderButtons();

      if (!cmdkItemsData.length) {
        cmdkItemsData = buildCmdkItems(currentLanguage);
      }

      document.addEventListener("scroll", onScroll, { passive: true });
      onScroll();

      initReveal();
      initCmdk();
      initKeyboardShortcuts();
      initEasterEgg();
      initFaq();
      initYear();
    });
  }

  boot();
})();
