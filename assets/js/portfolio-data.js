(function () {
  "use strict";

  const PORTFOLIO_PAGES = {
    apps: {
      label: "Apps",
      href: "apps.html"
    },
    websites: {
      label: "Websites",
      href: "websites.html"
    },
    games: {
      label: "Games",
      href: "games.html"
    },
    libraries: {
      label: "Libraries",
      href: "libraries.html"
    }
  };

  const cache = new Map();
  let lastUserScrollAt = 0;
  let scrollRestoreToken = 0;
  let lastUserIntentAt = 0;

  window.addEventListener("scroll", () => {
    lastUserScrollAt = Date.now();
  }, { passive: true });

  const recordUserScrollIntent = () => {
    lastUserIntentAt = Date.now();
    scrollRestoreToken += 1;
    delete window.__portfolioScrollTarget;
  };

  ["wheel", "touchmove"].forEach((eventName) => {
    window.addEventListener(eventName, recordUserScrollIntent, { passive: true });
  });

  window.addEventListener("keydown", (event) => {
    if (["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " "].includes(event.key)) {
      recordUserScrollIntent();
    }
  });

  const escapeHtml = (value) => String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

  const normalizeItems = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (payload && Array.isArray(payload.items)) return payload.items;
    return [];
  };

  const FILTER_VALUES = new Set(["all", "personal", "client"]);

  const renderCard = (item) => {
    if (window.IframeCardComponent && typeof window.IframeCardComponent.createElementMarkup === "function") {
      return window.IframeCardComponent.createElementMarkup(item);
    }

    return `<iframe-card data-item="${escapeHtml(encodeURIComponent(JSON.stringify(item ?? {})))}"></iframe-card>`;
  };

  const renderMessageCard = (title, summary) => renderCard({
    name: title,
    summary,
    tags: [],
    features: [],
    links: []
  });

  const getFilterGroup = (category) => document.querySelector(`[data-portfolio-filter-group="${category}"]`);

  const getSearchGroup = (category) => document.querySelector(`[data-portfolio-search-group="${category}"]`);

  const getActiveSearch = (category) => {
    const group = getSearchGroup(category);
    const input = group ? group.querySelector('[data-portfolio-search-input]') : null;
    return (input?.value || "").trim().toLowerCase();
  };

  const scheduleScrollRestore = (top) => {
    if (!Number.isFinite(top)) return;

    const token = ++scrollRestoreToken;
    const guardUntil = Date.now() + 5200;
    window.__portfolioScrollTarget = top;

    const restoreIfNeeded = () => {
      if (token !== scrollRestoreToken) return;
      if (Math.abs(window.scrollY - top) < 4) return;
      if (Date.now() - lastUserIntentAt < 350) return;
      window.scrollTo({ top, left: 0, behavior: "auto" });
    };

    const restoreUntilStable = () => {
      if (token !== scrollRestoreToken) return;
      restoreIfNeeded();
      if (Date.now() < guardUntil) {
        window.requestAnimationFrame(restoreUntilStable);
      }
    };

    window.requestAnimationFrame(restoreUntilStable);
    window.setTimeout(restoreIfNeeded, 250);
    window.setTimeout(restoreIfNeeded, 700);
    window.setTimeout(restoreIfNeeded, 1500);
    window.setTimeout(restoreIfNeeded, 3200);
    window.setTimeout(restoreIfNeeded, 5200);
    window.setTimeout(() => {
      if (token === scrollRestoreToken && window.__portfolioScrollTarget === top) {
        delete window.__portfolioScrollTarget;
      }
    }, 6200);
  };

  const normalizeFilterValue = (value) => FILTER_VALUES.has(value) ? value : "all";

  const getActiveFilter = (category) => {
    const filterGroup = getFilterGroup(category);
    return normalizeFilterValue(filterGroup?.dataset.portfolioFilterValue || "all");
  };

  const updateFilterButtons = (category) => {
    const filterGroup = getFilterGroup(category);
    if (!filterGroup) return;

    const activeFilter = getActiveFilter(category);
    filterGroup.querySelectorAll("[data-portfolio-filter]").forEach((button) => {
      const isActive = normalizeFilterValue(button.dataset.portfolioFilter) === activeFilter;
      button.classList.toggle("button-a", isActive);
      button.classList.toggle("button-outline-a", !isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
  };

  const filterItems = (items, category) => {
    const activeFilter = getActiveFilter(category);
    let filtered = items;
    if (activeFilter !== "all") {
      filtered = filtered.filter((item) => item.ownership === activeFilter);
    }

    const q = getActiveSearch(category);
    if (!q) return filtered;

    return filtered.filter((item) => {
      if ((item.name || "").toLowerCase().includes(q)) return true;
      if ((item.summary || "").toLowerCase().includes(q)) return true;
      if (Array.isArray(item.tags) && item.tags.some(t => (t.label || "").toLowerCase().includes(q))) return true;
      return false;
    });
  };

  const initPortfolioFilters = () => {
    document.querySelectorAll("[data-portfolio-filter-group]").forEach((filterGroup) => {
      if (filterGroup.dataset.portfolioFilterMounted === "true") return;

      filterGroup.dataset.portfolioFilterMounted = "true";
      filterGroup.addEventListener("click", (event) => {
        const button = event.target.closest("[data-portfolio-filter]");
        if (!button || !filterGroup.contains(button)) return;

        const nextFilter = normalizeFilterValue(button.dataset.portfolioFilter);
        if (filterGroup.dataset.portfolioFilterValue === nextFilter) return;

        filterGroup.dataset.portfolioFilterValue = nextFilter;
        renderPortfolioPages({ preserveScrollTop: window.scrollY });
      });
    });
  };

  const initPortfolioSearch = () => {
    document.querySelectorAll('[data-portfolio-search-group]').forEach((group) => {
      if (group.dataset.portfolioSearchMounted === "true") return;
      group.dataset.portfolioSearchMounted = "true";
      const input = group.querySelector('[data-portfolio-search-input]');
      if (!input) return;
      let timeout = null;
      input.addEventListener('input', () => {
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => {
          renderPortfolioPages({ preserveScrollTop: window.scrollY });
        }, 220);
      });
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          input.value = '';
          renderPortfolioPages({ preserveScrollTop: window.scrollY });
        }
      });
    });
  };

  const getDataUrl = (category) => `assets/data/${category}.json`;

  const loadCategory = async (category) => {
    if (cache.has(category)) {
      return cache.get(category);
    }

    const response = await fetch(getDataUrl(category));
    if (!response.ok) {
      throw new Error(`Failed to load ${category} data from ${getDataUrl(category)}`);
    }

    const items = normalizeItems(await response.json());
    cache.set(category, items);
    return items;
  };

  const loadCategories = async (categories) => {
    const entries = await Promise.all(categories.map(async (category) => [category, await loadCategory(category)]));
    return Object.fromEntries(entries);
  };

  const buildPortfolioMenuMarkup = () => Object.values(PORTFOLIO_PAGES).map((page) => `
            <li><a href="${escapeHtml(page.href)}">${escapeHtml(page.label)}</a></li>`).join("");

  const renderPortfolioPages = async ({ preserveScrollTop } = {}) => {
    const containers = [...document.querySelectorAll("[data-portfolio-category]")];
    if (!containers.length) return;

    if (Number.isFinite(preserveScrollTop)) {
      window.__portfolioScrollTarget = preserveScrollTop;
    }

    await Promise.all(containers.map(async (container) => {
      const category = container.dataset.portfolioCategory;
      if (!category) return;

      try {
        const items = await loadCategory(category);
        const filtered = filterItems(items, category);
        if (!filtered || filtered.length === 0) {
          container.innerHTML = renderMessageCard("No matching websites", "Try a different search term or clear filters.");
        } else {
          container.innerHTML = filtered.map(renderCard).join("\n");
        }
      } catch (error) {
        console.error(`Failed to render ${category} page:`, error);
        container.innerHTML = renderMessageCard("Unable to load portfolio items", "Please try refreshing the page.");
      }
    }));

    containers.forEach((container) => updateFilterButtons(container.dataset.portfolioCategory));

    if (window.SiteShowcase && typeof window.SiteShowcase.refresh === "function") {
      window.SiteShowcase.refresh();
    }

    scheduleScrollRestore(preserveScrollTop);

    window.dispatchEvent(new Event("portfolio:rendered"));
  };

  window.SitePortfolioData = {
    pages: PORTFOLIO_PAGES,
    loadCategory,
    loadCategories,
    buildPortfolioMenuMarkup,
    initPortfolioFilters,
    initPortfolioSearch,
    renderPortfolioPages
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      initPortfolioFilters();
      initPortfolioSearch();
      renderPortfolioPages();
    }, { once: true });
  } else {
    initPortfolioFilters();
    initPortfolioSearch();
    renderPortfolioPages();
  }
})();
