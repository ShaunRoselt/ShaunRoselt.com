(function () {
    "use strict";

    const scriptEl = document.currentScript;
    const scriptBaseUrl = scriptEl && scriptEl.src ? new URL('.', scriptEl.src) : new URL('./', document.baseURI);
    const defaultHtmlUrl = new URL('site-footer.html', scriptBaseUrl).toString();
    const defaultCssUrl = new URL('site-footer.css', scriptBaseUrl).toString();

    const getRootElements = () => [...document.querySelectorAll('[data-site-footer], site-footer')];

    const ensureStylesheet = (href) => {
        const existing = [...document.querySelectorAll('link[rel="stylesheet"]')]
            .find(link => link.href === href);

        if (existing) return;

        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        link.dataset.siteFooterStyles = 'true';
        document.head.appendChild(link);
    };

    const loadFooter = async (root) => {
        const htmlUrl = root.dataset.siteFooterHtml || scriptEl?.dataset.siteFooterHtml || defaultHtmlUrl;
        const cssUrl = root.dataset.siteFooterCss || scriptEl?.dataset.siteFooterCss || defaultCssUrl;

        ensureStylesheet(cssUrl);

        if (!root.querySelector('#footer')) {
            const response = await fetch(htmlUrl);
            if (!response.ok) {
                throw new Error(`Failed to load site footer from ${htmlUrl}`);
            }
            root.innerHTML = await response.text();
        }

        // If a global footer behaviour script exists, let it run (it may have run earlier).
        // Dispatch an event so other scripts can initialize after footer is mounted.
        try { root.dispatchEvent(new CustomEvent('site:footer:mounted', { bubbles: true })); } catch (e) { }
    };

    const mount = () => {
        getRootElements().forEach(root => {
            loadFooter(root).catch(error => console.error('Failed to initialize site footer:', error));
        });
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', mount, { once: true });
    } else {
        mount();
    }

    window.SiteFooterComponent = { mount };

})();
