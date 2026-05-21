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

  const renderAttributes = (attributes) => Object.entries(attributes)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .map(([name, value]) => ` ${name}="${escapeHtml(value)}"`)
    .join("");

  const renderIcon = (icon) => icon
    ? `<i class="bi ${escapeHtml(icon)}" aria-hidden="true"></i>`
    : "";

  const renderTags = (tags = []) => tags.map((tag) => `
                <span class="showcase-tag">${renderIcon(tag.icon)} ${escapeHtml(tag.label)}</span>`).join("");

  const renderFeatures = (features = []) => features.map((feature) => `
                <li>${escapeHtml(feature)}</li>`).join("");

  const renderLink = (link) => {
    const classes = ["button", link.style === "primary" ? "button-a" : "button-outline-a"];

    if (link.comingSoon) {
      classes.push("button-coming-soon");
      return `
                <button class="${classes.join(" ")}" type="button"${renderAttributes({
        "data-coming-soon-platform": link.platform || link.title,
        title: link.title,
        "aria-label": link.ariaLabel || link.title
      })}>
                  ${renderIcon(link.icon)}
                </button>`;
    }

    if (link.lightbox) {
      classes.push("portfolio-lightbox");
    }

    return `
                <a class="${classes.join(" ")}"${renderAttributes({
      href: link.href,
      target: link.target,
      rel: link.rel,
      title: link.title,
      "aria-label": link.ariaLabel || link.title,
      "data-gallery": link.gallery
    })}>
                  ${renderIcon(link.icon)}
                </a>`;
  };

  const renderLinks = (links = []) => links.map(renderLink).join("");

  const renderFallback = (fallback) => {
    if (!fallback) return "";

    if (fallback.kind === "image") {
      return `
              <img${renderAttributes({
        src: fallback.src,
        alt: fallback.alt,
        class: `showcase-fallback${fallback.className ? ` ${fallback.className}` : ""}`,
        style: fallback.style
      })}>`;
    }

    return `
              <div class="showcase-fallback showcase-placeholder">${escapeHtml(fallback.text)}</div>`;
  };

  const renderMedia = (media) => {
    if (!media) {
      return '<div class="showcase-media"></div>';
    }

    if (media.kind === "iframe") {
      // Ensure sandbox contains allow-same-origin when allow-scripts is requested
      let sandboxValue = media.sandbox;
      if (typeof sandboxValue === 'string' && sandboxValue.indexOf('allow-scripts') !== -1 && sandboxValue.indexOf('allow-same-origin') === -1) {
        sandboxValue = (sandboxValue + ' allow-same-origin').trim();
      }

      return `
            <div class="showcase-media">
              <iframe${renderAttributes({
        src: media.src,
        title: media.title,
        sandbox: sandboxValue,
        scrolling: media.scrolling || "no",
        loading: media.loading || "lazy",
        "aria-hidden": media.ariaHidden || "true",
        style: media.style
      })}></iframe>${renderFallback(media.fallback)}
            </div>`;
    }

    if (media.kind === "image-link") {
      const classes = ["showcase-media"];
      if (media.lightbox) {
        classes.push("portfolio-lightbox");
      }

      return `
            <a class="${classes.join(" ")}"${renderAttributes({
        href: media.href,
        target: media.target,
        rel: media.rel,
        "data-gallery": media.gallery
      })}>
              <img${renderAttributes({
        src: media.src,
        alt: media.alt
      })}>
            </a>`;
    }

    if (media.kind === "image") {
      return `
            <div class="showcase-media">
              <img${renderAttributes({
        src: media.src,
        alt: media.alt
      })}>
            </div>`;
    }

    return `
            <div class="showcase-media">
              <div class="showcase-fallback showcase-placeholder">${escapeHtml(media.text || "")}</div>
            </div>`;
  };

  const renderCard = (item) => `
          <article class="showcase-card" id="${escapeHtml(item.id)}">
${renderMedia(item.media)}
            <div class="showcase-body">
              <div>
                <h2 class="showcase-title">${escapeHtml(item.name)}</h2>
                <p class="showcase-summary">${escapeHtml(item.summary)}</p>
              </div>
              <div class="showcase-tags">${renderTags(item.tags)}</div>
              <ul class="showcase-features">${renderFeatures(item.features)}</ul>
              <div class="showcase-links">${renderLinks(item.links)}</div>
            </div>
          </article>`;

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

  const renderPortfolioPages = async () => {
    const containers = [...document.querySelectorAll("[data-portfolio-category]")];
    if (!containers.length) return;

    await Promise.all(containers.map(async (container) => {
      const category = container.dataset.portfolioCategory;
      if (!category) return;

      try {
        const items = await loadCategory(category);
        container.innerHTML = items.map(renderCard).join("\n");
      } catch (error) {
        console.error(`Failed to render ${category} page:`, error);
        container.innerHTML = `
          <article class="showcase-card">
            <div class="showcase-body">
              <div>
                <h2 class="showcase-title">Unable to load portfolio items</h2>
                <p class="showcase-summary">Please try refreshing the page.</p>
              </div>
            </div>
          </article>`;
      }
    }));

    if (window.SiteShowcase && typeof window.SiteShowcase.refresh === "function") {
      window.SiteShowcase.refresh();
    }

    window.dispatchEvent(new Event("portfolio:rendered"));
  };

  window.SitePortfolioData = {
    pages: PORTFOLIO_PAGES,
    loadCategory,
    loadCategories,
    buildPortfolioMenuMarkup,
    renderPortfolioPages
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", renderPortfolioPages, { once: true });
  } else {
    renderPortfolioPages();
  }
})();
