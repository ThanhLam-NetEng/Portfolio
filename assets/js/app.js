/* =========================================================
   i18n — English is read from the HTML once, Vietnamese from translations.js
   ========================================================= */
const root = document.documentElement;
const i18nEls = document.querySelectorAll("[data-i18n]");
const placeholderEls = document.querySelectorAll("[data-i18n-placeholder]");
const englishText = new Map();
const englishPlaceholder = new Map();
const englishTitle = document.title;

i18nEls.forEach((el) => englishText.set(el, el.innerHTML));
placeholderEls.forEach((el) => englishPlaceholder.set(el, el.getAttribute("placeholder")));

let currentLang = "en";

function ui(key) {
  return (translations.ui[currentLang] || translations.ui.en)[key];
}

function safeGet(key) {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    return null;
  }
}

function safeSet(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    /* storage unavailable — ignore */
  }
}

function applyLanguage(lang, persist = false) {
  currentLang = lang === "vi" ? "vi" : "en";
  const vi = translations.vi;
  const useVi = currentLang === "vi";

  i18nEls.forEach((el) => {
    const key = el.dataset.i18n;
    el.innerHTML = useVi && vi[key] !== undefined ? vi[key] : englishText.get(el);
  });
  placeholderEls.forEach((el) => {
    const key = el.dataset.i18nPlaceholder;
    el.setAttribute("placeholder", useVi && vi[key] !== undefined ? vi[key] : englishPlaceholder.get(el));
  });

  document.title = useVi && vi["meta.title"] ? vi["meta.title"] : englishTitle;
  root.lang = currentLang;

  document.querySelectorAll("[data-lang-switch]").forEach((btn) => {
    const active = btn.dataset.langSwitch === currentLang;
    btn.classList.toggle("active", active);
    btn.setAttribute("aria-pressed", String(active));
  });

  // Labels that depend on current state
  updateMenuLabel();
  updateThemeButtons();

  if (persist) safeSet("portfolioLang", currentLang);
  root.classList.remove("i18n-pending");
}

document.querySelectorAll("[data-lang-switch]").forEach((btn) => {
  btn.addEventListener("click", () => applyLanguage(btn.dataset.langSwitch, true));
});

/* =========================================================
   Certifications — live count + filter tabs
   ========================================================= */
const certCount = document.querySelectorAll("#certifications .cert-card").length;
document.querySelectorAll(".cert-count").forEach((el) => (el.textContent = certCount));

const certFilterBtns = document.querySelectorAll("[data-cert-filter]");
const certCategoryBlocks = document.querySelectorAll("[data-category-block]");

certFilterBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    const filter = btn.dataset.certFilter;
    certFilterBtns.forEach((b) => {
      const active = b === btn;
      b.classList.toggle("active", active);
      b.setAttribute("aria-pressed", String(active));
    });
    certCategoryBlocks.forEach((block) => {
      block.classList.toggle("hidden", !(filter === "all" || block.dataset.categoryBlock === filter));
    });
  });
});

/* =========================================================
   Header state, back-to-top (rAF-throttled, passive)
   ========================================================= */
const nav = document.getElementById("nav");
const backToTopBtn = document.getElementById("backToTop");
let scrollTicking = false;

function onScroll() {
  const y = window.scrollY;
  nav.classList.toggle("scrolled", y > 32);
  if (backToTopBtn) backToTopBtn.classList.toggle("visible", y > 400);
  scrollTicking = false;
}

window.addEventListener(
  "scroll",
  () => {
    if (!scrollTicking) {
      scrollTicking = true;
      requestAnimationFrame(onScroll);
    }
  },
  { passive: true },
);
onScroll();

if (backToTopBtn) {
  backToTopBtn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}

/* =========================================================
   Scrollspy — IntersectionObserver instead of measuring every scroll
   ========================================================= */
const navLinks = document.querySelectorAll(".nav-links a");
const linkedIds = new Set([...navLinks].map((a) => a.getAttribute("href").slice(1)));
// "more-work" belongs to the Projects nav item
const spyAlias = { "more-work": "projects" };

if ("IntersectionObserver" in window) {
  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = spyAlias[entry.target.id] || entry.target.id;
        navLinks.forEach((link) => link.classList.toggle("active", link.getAttribute("href") === `#${id}`));
      });
    },
    { rootMargin: "-45% 0px -50% 0px" },
  );
  document.querySelectorAll("section[id]").forEach((section) => {
    if (linkedIds.has(section.id) || spyAlias[section.id] || section.id === "hero") spy.observe(section);
  });
}

/* =========================================================
   Mobile menu
   ========================================================= */
const navToggle = document.getElementById("navToggle");
const mobileMenu = document.getElementById("mobileMenu");

function updateMenuLabel() {
  if (!navToggle) return;
  const open = mobileMenu.classList.contains("open");
  navToggle.setAttribute("aria-label", open ? ui("closeMenu") : ui("openMenu"));
}

function setMenu(open) {
  mobileMenu.classList.toggle("open", open);
  navToggle.setAttribute("aria-expanded", String(open));
  navToggle.innerHTML = open ? '<i class="fa-solid fa-xmark"></i>' : '<i class="fa-solid fa-bars"></i>';
  updateMenuLabel();
}

navToggle.addEventListener("click", (e) => {
  e.stopPropagation();
  setMenu(!mobileMenu.classList.contains("open"));
});
mobileMenu.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setMenu(false)));
document.addEventListener("click", (e) => {
  if (mobileMenu.classList.contains("open") && !mobileMenu.contains(e.target) && !navToggle.contains(e.target)) {
    setMenu(false);
  }
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && mobileMenu.classList.contains("open")) {
    setMenu(false);
    navToggle.focus();
  }
});

/* =========================================================
   Contact form (Formspree)
   ========================================================= */
const form = document.getElementById("contactForm");
const successMsg = document.getElementById("formSuccess");
const submitBtn = document.getElementById("submitBtn");

function restoreSubmit(label) {
  submitBtn.textContent = label;
  submitBtn.removeAttribute("disabled");
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  submitBtn.textContent = ui("sending");
  submitBtn.setAttribute("disabled", "true");
  try {
    const response = await fetch(form.action, {
      method: "POST",
      body: new FormData(form),
      headers: { Accept: "application/json" },
    });
    if (response.ok) {
      form.reset();
      form.style.display = "none";
      successMsg.style.display = "block";
    } else {
      restoreSubmit(ui("failed"));
    }
  } catch (error) {
    restoreSubmit(ui("failed"));
  }
});

/* =========================================================
   Scroll reveal
   ========================================================= */
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const revealEls = document.querySelectorAll(".reveal");
if (!reduceMotion && "IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 },
  );
  revealEls.forEach((el, index) => {
    el.style.transitionDelay = `${(index % 5) * 0.05}s`;
    revealObserver.observe(el);
  });
} else {
  revealEls.forEach((el) => el.classList.add("visible"));
}

/* =========================================================
   Theme — initial value is set in <head>; follows the OS until the user picks one
   ========================================================= */
const themeToggleButtons = document.querySelectorAll("[data-theme-toggle]");
const themeColorMeta = document.querySelector('meta[name="theme-color"]');

function updateThemeButtons() {
  const theme = root.getAttribute("data-theme") === "light" ? "light" : "dark";
  themeToggleButtons.forEach((btn) => {
    btn.innerHTML = theme === "light" ? '<i class="fa-solid fa-moon"></i>' : '<i class="fa-solid fa-sun"></i>';
    btn.setAttribute("aria-label", theme === "light" ? ui("toDark") : ui("toLight"));
  });
  if (themeColorMeta) themeColorMeta.setAttribute("content", theme === "light" ? "#f8fafc" : "#030712");
}

function applyTheme(theme, persist = false) {
  root.setAttribute("data-theme", theme === "light" ? "light" : "dark");
  if (persist) safeSet("portfolioTheme", theme);
  updateThemeButtons();
}

themeToggleButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    applyTheme(root.getAttribute("data-theme") === "light" ? "dark" : "light", true);
  });
});

/* =========================================================
   Init
   ========================================================= */
applyLanguage(safeGet("portfolioLang") || "en");
applyTheme(root.getAttribute("data-theme"));
