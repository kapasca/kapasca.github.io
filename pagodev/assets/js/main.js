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
  var mobileNav = document.querySelector("[data-mobile-nav]");
  var mobileMenuOverlay = document.querySelector(".mobile-menu-overlay");
  var mobileMenuToggle = document.querySelector("[data-mobile-menu-toggle]");
  var mobileMenuClose = document.querySelector("[data-mobile-menu-close]");
  var portfolioOverlay = document.querySelector(".portfolio-overlay");
  var portfolioOpenButtons = document.querySelectorAll("[data-portfolio-open]");
  var portfolioCloseButton = document.querySelector("[data-portfolio-close]");
  var activeIndex = 0;
  var currentLanguage = "en";
  var cmdkItemsData = [];
  var I18N = {};
  var LANG_KEYS = { en: true, id: true };

  var FALLBACK_TEXT = {
    en: {
      header: {
        quickAccess: "Quick Access",
        themeToLight: "Enable light mode",
        themeToDark: "Enable dark mode",
        langCode: "ID",
        langToggleAria: "Switch to Indonesian"
      },
      cmdk: {
        noResults: "No results for"
      }
    },
    id: {
      header: {
        quickAccess: "Akses Cepat",
        themeToLight: "Aktifkan mode terang",
        themeToDark: "Aktifkan mode gelap",
        langCode: "EN",
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
      { label: "Portfolio", tag: "Nav", href: "#portfolio" },
      { label: "FAQ", tag: "Nav", href: "#faq" },
      { label: "Start New Project", tag: "Action", href: "#contact" }
    ],
    id: [
      { label: "Beranda", tag: "Nav", href: "#top" },
      { label: "Tentang Kami", tag: "Nav", href: "#about" },
      { label: "Layanan", tag: "Nav", href: "#services" },
      { label: "Alur Kerja", tag: "Nav", href: "#process" },
      { label: "Portofolio", tag: "Nav", href: "#portfolio" },
      { label: "FAQ", tag: "Nav", href: "#faq" },
      { label: "Mulai Proyek Baru", tag: "Aksi", href: "#contact" }
    ]
  };

  function hasTranslations() {
    return !!(I18N && typeof I18N === "object" && Object.keys(I18N).length);
  }

  function isLangPairObject(node) {
    if (!node || Array.isArray(node) || typeof node !== "object") return false;
    var keys = Object.keys(node);
    if (!keys.length) return false;
    return keys.every(function (key) {
      return !!LANG_KEYS[key];
    });
  }

  function extractLanguageTree(node, lang, fallbackLang) {
    if (Array.isArray(node)) {
      return node.map(function (item) {
        return extractLanguageTree(item, lang, fallbackLang);
      });
    }

    if (node && typeof node === "object") {
      if (isLangPairObject(node)) {
        if (node[lang] !== undefined && node[lang] !== null) return node[lang];
        if (node[fallbackLang] !== undefined && node[fallbackLang] !== null) return node[fallbackLang];
        return "";
      }

      var out = {};
      Object.keys(node).forEach(function (key) {
        out[key] = extractLanguageTree(node[key], lang, fallbackLang);
      });
      return out;
    }

    return node;
  }

  function getTranslation(lang) {
    var next = lang === "id" ? "id" : "en";
    if (!hasTranslations()) return null;

    if (I18N.en && I18N.id) {
      return I18N[next] || I18N.en;
    }

    return extractLanguageTree(I18N, next, "en");
  }

  function getI18nValue(source, path) {
    if (!source || !path) return null;
    return path.split(".").reduce(function (value, segment) {
      if (value === null || value === undefined) return null;
      return value[segment];
    }, source);
  }

  function setI18nText(el, value) {
    if (!el || value === null || value === undefined) return;
    var preserveSpec = el.getAttribute("data-i18n-preserve");
    if (preserveSpec) {
      var preserveRule = "append";
      var preserveSelector = preserveSpec;

      if (preserveSpec.indexOf("prepend:") === 0) {
        preserveRule = "prepend";
        preserveSelector = preserveSpec.slice(8);
      } else if (preserveSpec.indexOf("append:") === 0) {
        preserveSelector = preserveSpec.slice(7);
      }

      var preserved = el.querySelector(preserveSelector);
      var preservedClone = preserved ? preserved.cloneNode(true) : null;
      el.textContent = value;
      if (preservedClone) {
        if (preserveRule === "prepend") {
          el.insertBefore(preservedClone, el.firstChild);
        } else {
          el.appendChild(preservedClone);
        }
      }
      return;
    }
    el.textContent = value;
  }

  function applyI18nContent(source) {
    document.querySelectorAll("[data-i18n], [data-i18n-html], [data-i18n-attr]").forEach(function (el) {
      var textKey = el.getAttribute("data-i18n");
      var htmlKey = el.getAttribute("data-i18n-html");
      var textValue = textKey ? getI18nValue(source, textKey) : null;

      if (htmlKey) {
        var htmlValue = getI18nValue(source, htmlKey);
        if (htmlValue !== null && htmlValue !== undefined) {
          el.innerHTML = htmlValue;
        }
      } else if (textKey) {
        setI18nText(el, textValue);
      }

      var attrSpec = el.getAttribute("data-i18n-attr");
      if (!attrSpec) return;

      attrSpec.split(";").forEach(function (pair) {
        var trimmed = pair.trim();
        if (!trimmed) return;
        var colonIndex = trimmed.indexOf(":");
        if (colonIndex < 1) return;
        var attrName = trimmed.slice(0, colonIndex).trim();
        var attrKey = trimmed.slice(colonIndex + 1).trim();
        var attrValue = getI18nValue(source, attrKey);
        if (attrValue !== null && attrValue !== undefined) {
          el.setAttribute(attrName, attrValue);
        }
      });
    });
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

    var t = getTranslation(lang);
    return t.cmdk.items.map(function (item) {
      var isAction = item.href === "#contact";
      return {
        label: item.label,
        tag: isAction ? t.cmdk.actionTag : t.cmdk.navTag,
        href: item.href
      };
    });
  }

  function getThemeModeLabel(theme, lang) {
    var nextLang = lang === "id" ? "id" : "en";
    if (nextLang === "id") {
      return theme === "light" ? "Terang" : "Gelap";
    }
    return theme === "light" ? "Light" : "Dark";
  }

  function updateMobileMenuLabels() {
    var source = hasTranslations() ? getTranslation(currentLanguage) : FALLBACK_TEXT[currentLanguage] || FALLBACK_TEXT.en;
    var theme = root.getAttribute("data-theme") === "light" ? "light" : "dark";
    var mobileThemeBtn = document.querySelector("[data-mobile-theme-toggle]");
    var mobileLangBtns = document.querySelectorAll("[data-mobile-lang-toggle]");
    var nextLanguageLabel = currentLanguage === "id" ? "English" : "Bahasa Indonesia";

    var mobileLangText = document.querySelector("[data-mobile-lang-text]");
    if (mobileLangText) mobileLangText.textContent = nextLanguageLabel;

    if (mobileThemeBtn) {
      mobileThemeBtn.setAttribute("aria-pressed", theme === "light");
      mobileThemeBtn.setAttribute("aria-label", theme === "light" ? source.header.themeToDark : source.header.themeToLight);
      mobileThemeBtn.setAttribute("title", getThemeModeLabel(theme, currentLanguage));
    }

    mobileLangBtns.forEach(function (button) {
      button.setAttribute("aria-label", source.header.langToggleAria);
    });
  }

  function renderMobileNav() {
    if (!mobileNav) return;

    mobileNav.innerHTML = cmdkItemsData
      .map(function (item) {
        return (
          '<a class="mobile-menu-item" href="' +
          item.href +
          '" data-mobile-nav-link="' +
          item.href +
          '"><span class="mobile-menu-item-label">' +
          escapeHtml(item.label) +
          '</span><span class="mobile-menu-item-meta">' +
          escapeHtml(item.tag) +
          "</span></a>"
        );
      })
      .join("");
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
    renderMobileNav();
    updateMobileMenuLabels();
    updateThemeIcon(root.getAttribute("data-theme") === "light" ? "light" : "dark");
  }

  function applyLanguage(lang) {
    if (!hasTranslations()) {
      applyLanguageLite(lang);
      return;
    }

    var next = lang === "id" ? "id" : "en";
    var t = getTranslation(next);
    currentLanguage = next;

    root.setAttribute("lang", next);
    try {
      localStorage.setItem("pagodev-lang", next);
    } catch (e) {}
    applyI18nContent(t);

    var footerCopy = document.querySelector("[data-footer-copy]");
    if (footerCopy) {
      var yearNow = new Date().getFullYear();
      footerCopy.innerHTML = "&copy; <span data-year>" + yearNow + "</span> PAGODEV. " + t.footer.copyright;
    }

    cmdkItemsData = buildCmdkItems(next);
    if (cmdkOverlay && cmdkOverlay.classList.contains("is-open")) {
      renderCmdkItems(cmdkInput ? cmdkInput.value : "");
    }

    renderMobileNav();
    updateMobileMenuLabels();
    updateThemeIcon(root.getAttribute("data-theme") === "light" ? "light" : "dark");
  }

  function initLanguage() {
    applyLanguage(getPreferredLanguage());
  }

  function toggleLanguage() {
    applyLanguage(currentLanguage === "id" ? "en" : "id");
  }

  function loadTranslations() {
    return fetch("assets/js/i18n.json")
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

    var t = hasTranslations() ? getTranslation(currentLanguage) : FALLBACK_TEXT[currentLanguage] || FALLBACK_TEXT.en;
    btn.setAttribute("aria-pressed", theme === "light");
    btn.setAttribute("aria-label", theme === "light" ? t.header.themeToDark : t.header.themeToLight);
    updateMobileMenuLabels();
  }

  function openMobileMenu() {
    if (!mobileMenuOverlay) return;
    mobileMenuOverlay.classList.add("is-open");
    mobileMenuOverlay.setAttribute("aria-hidden", "false");
    if (mobileMenuToggle) mobileMenuToggle.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
  }

  function closeMobileMenu() {
    if (!mobileMenuOverlay) return;
    mobileMenuOverlay.classList.remove("is-open");
    mobileMenuOverlay.setAttribute("aria-hidden", "true");
    if (mobileMenuToggle) mobileMenuToggle.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }

  function initMobileMenu() {
    var mobileTheme = document.querySelector("[data-mobile-theme-toggle]");
    var mobileLangButtons = document.querySelectorAll("[data-mobile-lang-toggle]");

    if (mobileMenuToggle) {
      mobileMenuToggle.addEventListener("click", function () {
        var isOpen = mobileMenuOverlay && mobileMenuOverlay.classList.contains("is-open");
        if (isOpen) {
          closeMobileMenu();
          return;
        }
        openMobileMenu();
      });
    }

    if (mobileMenuClose) {
      mobileMenuClose.addEventListener("click", closeMobileMenu);
    }

    if (mobileMenuOverlay) {
      mobileMenuOverlay.addEventListener("click", function (e) {
        if (e.target === mobileMenuOverlay) closeMobileMenu();
      });
    }

    if (mobileNav) {
      mobileNav.addEventListener("click", function (e) {
        var link = e.target.closest("[data-mobile-nav-link]");
        if (!link) return;
        e.preventDefault();
        closeMobileMenu();
        goTo(link.getAttribute("data-mobile-nav-link"));
      });
    }

    if (mobileTheme) {
      mobileTheme.addEventListener("click", function () {
        toggleTheme();
        closeMobileMenu();
      });
    }

    mobileLangButtons.forEach(function (mobileLang) {
      mobileLang.addEventListener("click", function () {
        toggleLanguage();
        closeMobileMenu();
      });
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 980) closeMobileMenu();
    });

    renderMobileNav();
    updateMobileMenuLabels();
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
      var noResultText = hasTranslations() ? getTranslation(currentLanguage).cmdk.noResults : (FALLBACK_TEXT[currentLanguage] || FALLBACK_TEXT.en).cmdk.noResults;
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

  function getSectionScrollOffset() {
    var headerHeight = header ? header.offsetHeight : 0;
    return headerHeight;
  }

  function goTo(href) {
    closeCmdk();
    closeMobileMenu();
    if (href === "#top") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    var target = document.querySelector(href);
    if (!target) return;

    var targetSection = target.closest("section[id]") || target;
    var top = targetSection.getBoundingClientRect().top + window.pageYOffset - getSectionScrollOffset();
    window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  }

  function initAnchorNavigation() {
    document.addEventListener("click", function (e) {
      var link = e.target.closest('a[href^="#"]');
      if (!link) return;

      var href = link.getAttribute("href");
      if (!href || href === "#") return;
      if (!document.querySelector(href)) return;

      e.preventDefault();
      goTo(href);
    });
  }

  function openPortfolioDialog() {
    if (!portfolioOverlay) return;
    portfolioOverlay.classList.add("is-open");
    portfolioOverlay.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closePortfolioDialog() {
    if (!portfolioOverlay) return;
    portfolioOverlay.classList.remove("is-open");
    portfolioOverlay.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  function initPortfolioDialog() {
    portfolioOpenButtons.forEach(function (btn) {
      btn.addEventListener("click", openPortfolioDialog);
    });

    if (portfolioCloseButton) {
      portfolioCloseButton.addEventListener("click", closePortfolioDialog);
    }

    if (portfolioOverlay) {
      portfolioOverlay.addEventListener("click", function (e) {
        if (e.target === portfolioOverlay) closePortfolioDialog();
      });
    }
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
        closePortfolioDialog();
        closeMobileMenu();
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
    initAnchorNavigation();
    initPortfolioDialog();
    initMobileMenu();
    initKeyboardShortcuts();
    initEasterEgg();
    initFaq();
    initYear();

    loadTranslations().then(function () {
      if (hasTranslations()) {
        applyLanguage(currentLanguage);
      }
    });
  }

  boot();
})();
