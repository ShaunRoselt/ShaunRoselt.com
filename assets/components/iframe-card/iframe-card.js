(function () {
    "use strict";

    const escapeHtml = (value) => String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#39;");

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

    const buildSrcdocProxyMarkup = (media) => {
        const targetUrl = new URL(media.src, window.location.href).href;
        const baseHref = new URL(".", targetUrl).href;

        return `<!doctype html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <base href="${escapeHtml(baseHref)}">
        <style>
            :root { color-scheme: dark; }
            html, body {
                margin: 0;
                width: 100%;
                height: 100%;
                background: #0c121b;
                color: #d4dfec;
                font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            }
            body {
                display: grid;
                place-items: center;
            }
            .shell {
                padding: 1rem 1.25rem;
                text-align: center;
                line-height: 1.45;
            }
            .title {
                font-size: 0.95rem;
                font-weight: 800;
                letter-spacing: 0.02em;
                margin-bottom: 0.35rem;
            }
            .subtitle {
                font-size: 0.8rem;
                opacity: 0.8;
                word-break: break-all;
            }
        </style>
    </head>
    <body>
        <div class="shell">
            <div class="title">Loading preview</div>
            <div class="subtitle">${escapeHtml(media.title || targetUrl)}</div>
        </div>
        <script>
            (async () => {
                try {
                    const response = await fetch(${JSON.stringify(targetUrl)}, { cache: "no-store" });
                    if (!response.ok) throw new Error("HTTP " + response.status);

                    const html = await response.text();
                    const parsed = new DOMParser().parseFromString(html, "text/html");
                    let baseElement = parsed.querySelector("base");
                    if (!baseElement) {
                        baseElement = parsed.createElement("base");
                        parsed.head.prepend(baseElement);
                    }
                    baseElement.href = ${JSON.stringify(baseHref)};

                    document.open();
                    document.write("<!doctype html>" + parsed.documentElement.outerHTML);
                    document.close();
                } catch (error) {
                    document.body.innerHTML = '<div class="shell"><div class="title">Preview unavailable</div><div class="subtitle">' + ${JSON.stringify(media.title || targetUrl)} + '</div></div>';
                }
            })();
        </script>
    </body>
</html>`;
    };

    const getIframeSandboxValue = (media) => {
        const sandboxValue = media?.sandbox;
        if (typeof sandboxValue !== "string" || sandboxValue.trim() === "") {
            return sandboxValue;
        }

        // Keep sandbox for all iframes, including cross-origin.
        // Stripping sandbox lets embedded scripts navigate window.top (iframe busting).
        if (sandboxValue.includes("allow-scripts") && !sandboxValue.includes("allow-same-origin")) {
            return `${sandboxValue} allow-same-origin`.trim();
        }

        return sandboxValue;
    };

    const renderMedia = (media) => {
        if (!media) {
            return "";
        }

        if (media.kind === "iframe") {
            const sandboxValue = getIframeSandboxValue(media);
            const useSrcdocProxy = window.location.protocol === "file:" && (!media.fallback || media.fallback.kind !== "image");
            const iframeAttributes = {
                title: media.title,
                sandbox: sandboxValue,
                scrolling: media.scrolling || "no",
                loading: media.loading || "eager",
                fetchpriority: media.fetchpriority || "high",
                tabindex: "-1",
                style: media.style
            };

            if (useSrcdocProxy) {
                iframeAttributes.srcdoc = buildSrcdocProxyMarkup(media);
                // The proxy injects arbitrary remote HTML; always sandbox it so the
                // injected scripts cannot navigate window.top (allow-top-navigation
                // is intentionally absent).
                iframeAttributes.sandbox = "allow-scripts allow-same-origin";
            } else {
                iframeAttributes.src = media.src;
            }

            return `
        <div class="showcase-media">
          <iframe${renderAttributes(iframeAttributes)}></iframe>${useSrcdocProxy ? "" : renderFallback(media.fallback)}
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

    const normalizeItem = (item = {}) => ({
        id: item.id,
        name: item.name || "",
        summary: item.summary || "",
        tags: Array.isArray(item.tags) ? item.tags : [],
        features: Array.isArray(item.features) ? item.features : [],
        links: Array.isArray(item.links) ? item.links : [],
        media: item.media || null
    });

    const encodeItem = (item) => encodeURIComponent(JSON.stringify(item ?? {}));

    const decodeItem = (encodedItem) => {
        if (!encodedItem) return null;

        try {
            return JSON.parse(decodeURIComponent(encodedItem));
        } catch (error) {
            console.error("Failed to decode iframe-card item:", error);
            return null;
        }
    };

    const renderArticleMarkup = (rawItem) => {
        const item = normalizeItem(rawItem);

        return `
          <article class="showcase-card"${renderAttributes({ id: item.id })}>
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
    };

    const createElementMarkup = (item) => `<iframe-card data-item="${escapeHtml(encodeItem(item))}"></iframe-card>`;

    class IframeCardElement extends HTMLElement {
        static get observedAttributes() {
            return ["data-item"];
        }

        connectedCallback() {
            this.render();
        }

        attributeChangedCallback(name, oldValue, newValue) {
            if (name === "data-item" && oldValue !== newValue && this.isConnected) {
                this.render();
            }
        }

        render() {
            const item = decodeItem(this.getAttribute("data-item"));
            if (!item) {
                this.replaceChildren();
                return;
            }

            this.innerHTML = renderArticleMarkup(item);
        }
    }

    if (!window.customElements.get("iframe-card")) {
        window.customElements.define("iframe-card", IframeCardElement);
    }

    window.IframeCardComponent = {
        createElementMarkup,
        renderArticleMarkup
    };
})();