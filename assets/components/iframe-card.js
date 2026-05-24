(function () {
    "use strict";

    const escapeHtml = (value) => String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#39;");

    const renderAttributes = (attributes) => Object.entries(attributes)
        .filter(([, value]) => value !== undefined && value !== null && value !== "" && value !== false)
        .map(([name, value]) => value === true
            ? ` ${name}`
            : ` ${name}="${escapeHtml(value)}"`)
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

        if (link.comingSoon || !link.href) {
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

        const relValue = (link.rel !== undefined && link.rel !== null && link.rel !== "") ? link.rel : (link.target === "_blank" ? "noopener noreferrer" : undefined);

        return `
                <a class="${classes.join(" ")}"${renderAttributes({
            href: link.href,
            target: link.target,
            rel: relValue,
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
        <\/script>
    </body>
</html>`;
    };

    const isYouTubeEmbedUrl = (src) => {
        if (!src) return false;

        try {
            const url = new URL(src, window.location.href);
            return /(^|\.)youtube(?:-nocookie)?\.com$/i.test(url.hostname) && url.pathname.startsWith("/embed/");
        } catch (error) {
            return false;
        }
    };

    const getEmbedProvider = (media) => {
        if (typeof media?.provider === "string" && media.provider.trim() !== "") {
            return media.provider.trim().toLowerCase();
        }

        return isYouTubeEmbedUrl(media?.src) ? "youtube" : undefined;
    };

    const getIframeSandboxValue = (media, interactive, isYouTubeEmbed) => {
        if (media?.sandbox === false) {
            return undefined;
        }

        if (interactive && isYouTubeEmbed && media?.sandbox === "allow-scripts allow-same-origin") {
            return undefined;
        }

        const sandboxValue = media?.sandbox;
        if (typeof sandboxValue !== "string" || sandboxValue.trim() === "") {
            return sandboxValue;
        }

        if (sandboxValue.includes("allow-scripts") && !sandboxValue.includes("allow-same-origin")) {
            return `${sandboxValue} allow-same-origin`.trim();
        }

        return sandboxValue;
    };

    const getIframeOptions = (media) => {
        const provider = getEmbedProvider(media);
        const isYouTubeEmbed = provider === "youtube";
        const isVideoEmbed = media?.kind === "video-embed" || isYouTubeEmbed;
        const interactive = typeof media?.interactive === "boolean" ? media.interactive : isVideoEmbed;

        return {
            provider,
            interactive,
            isYouTubeEmbed,
            isVideoEmbed,
            sandbox: getIframeSandboxValue(media, interactive, isYouTubeEmbed),
            allow: media?.allow || (isYouTubeEmbed
                ? "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                : undefined),
            referrerPolicy: media?.referrerpolicy || media?.referrerPolicy || (isYouTubeEmbed ? "strict-origin-when-cross-origin" : undefined),
            allowFullscreen: media?.allowfullscreen ?? media?.allowFullscreen ?? isYouTubeEmbed,
            loading: media?.loading || (interactive ? "lazy" : "eager"),
            fetchPriority: media?.fetchpriority || media?.fetchPriority || (interactive ? "auto" : "high")
        };
    };

    const renderMedia = (media) => {
        if (!media) {
            return "";
        }

        if (media.kind === "iframe" || media.kind === "video-embed") {
            const iframeOptions = getIframeOptions(media);

            const useSrcdocProxy = window.location.protocol === "file:" && (!media.fallback || media.fallback.kind !== "image");
            const iframeAttributes = {
                title: media.title,
                sandbox: iframeOptions.sandbox,
                scrolling: media.scrolling || "no",
                loading: iframeOptions.loading,
                fetchpriority: iframeOptions.fetchPriority,
                allow: iframeOptions.allow,
                referrerpolicy: iframeOptions.referrerPolicy,
                allowfullscreen: iframeOptions.allowFullscreen,
                frameborder: media.frameborder ?? media.frameBorder ?? "0",
                tabindex: iframeOptions.interactive ? undefined : "-1",
                "data-interactive": iframeOptions.interactive ? "true" : undefined,
                "data-iframe-provider": iframeOptions.provider,
                style: media.style
            };

            if (useSrcdocProxy) {
                iframeAttributes.srcdoc = buildSrcdocProxyMarkup(media);
                iframeAttributes.sandbox = "allow-scripts allow-same-origin";
            } else {
                iframeAttributes.src = media.src;
            }

            return `
        <div class="showcase-media${iframeOptions.interactive ? " showcase-media--interactive" : ""}">
          <iframe${renderAttributes(iframeAttributes)}></iframe>${useSrcdocProxy ? "" : renderFallback(media.fallback)}
        </div>`;
        }

        if (media.kind === "image-link") {
            const classes = ["showcase-media"];
            if (media.lightbox) {
                classes.push("portfolio-lightbox");
            }

            const mediaRel = (media.rel !== undefined && media.rel !== null && media.rel !== "") ? media.rel : (media.target === "_blank" ? "noopener noreferrer" : undefined);

            return `
                        <a class="${classes.join(" ")}"${renderAttributes({
                href: media.href,
                target: media.target,
                rel: mediaRel,
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
            if (!this.style.display) {
                this.style.display = "block";
            }

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