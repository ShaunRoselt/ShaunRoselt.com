(function () {
  "use strict";

  const FOOTER_MARKUP = `
<footer id="footer">
  <div class="container">
    <div class="row">
      <div class="col-sm-12">
        <div class="copyright-box">
          <p class="copyright">Copyright © <strong>Shaun Roselt</strong></p>
        </div>
      </div>
    </div>
  </div>
</footer>`;

  const FOOTER_STYLES = `
site-footer {
  display: block;
}

#footer {
  background: var(--site-header-bg);
  padding: 18px 0;
  z-index: 997;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.18);
  backdrop-filter: blur(2px);
  -webkit-backdrop-filter: blur(2px);
}
`;

  let footerBehaviorInitialized = false;

  const ensureStyles = () => {
    if (document.getElementById("site-footer-inline-styles")) return;

    const style = document.createElement("style");
    style.id = "site-footer-inline-styles";
    style.textContent = FOOTER_STYLES;
    document.head.appendChild(style);
  };

  const refreshBackToTop = () => {
    const backToTop = document.querySelector(".back-to-top");
    if (!backToTop) return;

    backToTop.classList.toggle("active", window.scrollY > 100);
  };

  const scrollToTop = () => {
    try {
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    } catch (error) {
      window.scrollTo(0, 0);
    }
  };

  const updateCopyright = () => {
    const copyrightEl = document.querySelector("site-footer .copyright");
    if (!copyrightEl) return;

    const year = new Date().getFullYear();
    copyrightEl.innerHTML = `Copyright © ${year} <strong>Shaun Roselt</strong>`;
  };

  const initFooterBehavior = () => {
    if (footerBehaviorInitialized) return;
    footerBehaviorInitialized = true;

    window.addEventListener("load", refreshBackToTop);
    document.addEventListener("scroll", refreshBackToTop, { passive: true });
    document.addEventListener("click", (event) => {
      const backToTop = event.target.closest(".back-to-top");
      if (!backToTop) return;

      event.preventDefault();
      scrollToTop();
    });
  };

  const upgradeLegacyRoots = () => {
    document.querySelectorAll("[data-site-footer]").forEach((root) => {
      if (root.tagName.toLowerCase() === "site-footer") return;

      const element = document.createElement("site-footer");
      [...root.attributes].forEach((attribute) => {
        if (attribute.name.startsWith("data-site-footer-")) {
          element.setAttribute(`data-${attribute.name.slice("data-site-footer-".length)}`, attribute.value);
        }
      });

      while (root.firstChild) {
        element.appendChild(root.firstChild);
      }

      root.replaceWith(element);
    });
  };

  class SiteFooterElement extends HTMLElement {
    connectedCallback() {
      if (!this.style.display) {
        this.style.display = "block";
      }

      ensureStyles();

      if (!this.querySelector("#footer")) {
        this.innerHTML = FOOTER_MARKUP;
      }

      initFooterBehavior();
      updateCopyright();

      try {
        this.dispatchEvent(new CustomEvent("site:footer:mounted", { bubbles: true }));
      } catch (error) {
      }
    }
  }

  if (!window.customElements.get("site-footer")) {
    window.customElements.define("site-footer", SiteFooterElement);
  }

  window.SiteFooterComponent = {
    mount: upgradeLegacyRoots
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", upgradeLegacyRoots, { once: true });
  } else {
    upgradeLegacyRoots();
  }
})();