(function () {
  "use strict";

  const HEADER_MARKUP = `
<header id="header" class="fixed-top">
  <div class="container d-flex align-items-center justify-content-between">
    <h1 class="logo"><a href="index.html">Shaun Roselt</a></h1>

    <nav id="navbar" class="navbar">
      <ul>
        <li><a class="nav-link scrollto" href="index.html#hero">Home</a></li>
        <li><a class="nav-link scrollto" href="index.html#about">About</a></li>
        <li><a class="nav-link scrollto" href="index.html#work-experience">Work Experience</a></li>
        <li class="dropdown"><a href="index.html#work"><span>Portfolio</span> <i class="bi bi-chevron-down"></i></a>
          <ul data-portfolio-menu>
            <li><a href="apps.html">Apps</a></li>
            <li><a href="websites.html">Websites</a></li>
            <li><a href="games.html">Games</a></li>
            <li><a href="libraries.html">Libraries</a></li>
          </ul>
        </li>
        <li><a class="nav-link scrollto" href="index.html#contact">Contact</a></li>
      </ul>
      <button type="button" class="mobile-nav-toggle" aria-label="Toggle navigation" aria-controls="navbar"
        aria-expanded="false">
        <i class="bi bi-list" aria-hidden="true"></i>
      </button>
    </nav>
  </div>
</header>`;

  const HEADER_STYLES = `
site-header {
  display: block;
}

body.mobile-nav-open {
  overflow: hidden;
}

:root {
  --site-header-bg: rgba(0, 0, 0, 0.9);
}

#header {
  transition: all 0.5s;
  z-index: 997;
  padding: 20px 0;
}

#header .logo {
  font-size: 28px;
  margin: 0;
  padding: 0;
  font-weight: 600;
  letter-spacing: 1px;
}

#header .logo a {
  color: #fff;
}

#header .logo img {
  max-height: 40px;
}

#header.header-scrolled {
  background: var(--site-header-bg);
  padding: 12px 0;
}

.navbar {
  padding: 0;
}

.navbar ul {
  margin: 0;
  padding: 0;
  display: flex;
  list-style: none;
  align-items: center;
}

.navbar li {
  position: relative;
}

.navbar>ul>li {
  white-space: nowrap;
  padding: 10px 0 10px 30px;
}

.navbar a,
.navbar a:focus {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  padding: 0;
  white-space: nowrap;
  transition: 0.3s;
  letter-spacing: 0.4px;
  position: relative;
  text-transform: uppercase;
}

.navbar a i,
.navbar a:focus i {
  font-size: 13px;
  line-height: 0;
  margin-left: 5px;
}

.navbar>ul>li>a:before {
  content: "";
  position: absolute;
  width: 100%;
  height: 2px;
  bottom: -6px;
  left: 0;
  width: 0;
  background-color: #fff;
  visibility: hidden;
  transition: all 0.3s ease-in-out 0s;
}

.navbar a:hover:before,
.navbar li:hover>a:before,
.navbar .active:before {
  visibility: visible;
  width: 80%;
}

.navbar a:hover,
.navbar .active,
.navbar .active:focus,
.navbar li:hover>a {
  color: #fff;
}

.navbar .dropdown ul {
  display: block;
  position: absolute;
  left: 30px;
  top: calc(100% + 30px);
  margin: 0;
  padding: 10px 0;
  z-index: 99;
  opacity: 0;
  visibility: hidden;
  background: #fff;
  box-shadow: 0px 0px 30px rgba(127, 137, 161, 0.25);
  transition: 0.3s;
}

.navbar .dropdown ul li {
  min-width: 200px;
}

.navbar .dropdown ul a {
  padding: 10px 20px;
  font-size: 16px;
  text-transform: none;
  color: #4e4e4e;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 10px;
}

.navbar .dropdown ul a i {
  font-size: 21px;
  margin-left: 0;
  margin-right: 8px;
  display: inline-block;
  line-height: 1;
  vertical-align: middle;
}

.navbar .dropdown ul a:hover,
.navbar .dropdown ul .active:hover,
.navbar .dropdown ul li:hover>a {
  color: #0078ff;
}

.navbar .dropdown:hover>ul {
  opacity: 1;
  top: 100%;
  visibility: visible;
}

.mobile-nav-toggle {
  color: #fff;
  font-size: 28px;
  cursor: pointer;
  display: none;
  line-height: 0;
  transition: 0.5s;
  background: transparent;
  border: 0;
  padding: 0;
  align-items: center;
  justify-content: center;
  appearance: none;
  -webkit-appearance: none;
}

.mobile-nav-toggle i {
  line-height: 0;
}

@media (max-width: 991px) {
  .mobile-nav-toggle {
    display: inline-flex;
  }

  .navbar ul {
    display: none;
  }
}

.navbar-mobile {
  position: fixed;
  inset: 0;
  overflow: hidden;
  background: rgba(17, 24, 39, 0.45);
  transition: 0.3s;
  z-index: 999;
  backdrop-filter: blur(2px);
  -webkit-backdrop-filter: blur(2px);
}

.navbar-mobile .mobile-nav-toggle {
  position: fixed;
  top: 16px;
  right: 16px;
  z-index: 1000;
  width: 44px;
  height: 44px;
  border-radius: 999px;
  background: #fff;
  color: #1e1e1e;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.18);
}

.navbar-mobile ul {
  display: block;
  position: fixed;
  top: 72px;
  right: 16px;
  left: 16px;
  max-height: calc(100vh - 88px);
  padding: 12px 0;
  background-color: rgba(255, 255, 255, 0.98);
  border-radius: 20px;
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.24);
  overflow-y: auto;
  transition: 0.3s;
  -webkit-overflow-scrolling: touch;
}

.navbar-mobile>ul>li {
  padding: 0 12px;
}

.navbar-mobile a:hover:before,
.navbar-mobile li:hover>a:before,
.navbar-mobile .active:before {
  visibility: hidden;
}

.navbar-mobile a,
.navbar-mobile a:focus {
  padding: 12px 16px;
  font-size: 15px;
  color: #1e1e1e;
  border-radius: 12px;
}

.navbar-mobile a:hover,
.navbar-mobile .active,
.navbar-mobile li:hover>a {
  color: #0078ff;
  background: rgba(0, 120, 255, 0.08);
}

.navbar-mobile .getstarted,
.navbar-mobile .getstarted:focus {
  margin: 15px;
}

.navbar-mobile .dropdown ul {
  position: static;
  display: none;
  visibility: visible;
  background: rgba(245, 247, 250, 0.98);
  box-shadow: none;
  border-radius: 14px;
}

.navbar-mobile .dropdown ul li {
  min-width: 200px;
}

.navbar-mobile .dropdown ul a {
  padding: 10px 16px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 10px;
}

.navbar-mobile .dropdown>a i:last-child {
  margin-left: auto;
}

.navbar-mobile .dropdown ul a i {
  font-size: 21px;
  margin-left: 0;
  margin-right: 8px;
}

.navbar-mobile .dropdown ul a:hover,
.navbar-mobile .dropdown ul .active:hover,
.navbar-mobile .dropdown ul li:hover>a {
  color: #0078ff;
}

.navbar-mobile .dropdown>.dropdown-active {
  display: block;
}
`;

  const BREAKPOINT = 991;

  const ensureStyles = () => {
    if (document.getElementById("site-header-inline-styles")) return;

    const style = document.createElement("style");
    style.id = "site-header-inline-styles";
    style.textContent = HEADER_STYLES;
    document.head.appendChild(style);
  };

  const upgradeLegacyRoots = () => {
    document.querySelectorAll("[data-site-header]").forEach((root) => {
      if (root.tagName.toLowerCase() === "site-header") return;

      const element = document.createElement("site-header");
      [...root.attributes].forEach((attribute) => {
        if (attribute.name.startsWith("data-site-header-")) {
          element.setAttribute(`data-${attribute.name.slice("data-site-header-".length)}`, attribute.value);
        }
      });

      while (root.firstChild) {
        element.appendChild(root.firstChild);
      }

      root.replaceWith(element);
    });
  };

  class SiteHeaderElement extends HTMLElement {
    connectedCallback() {
      if (!this.style.display) {
        this.style.display = "block";
      }

      ensureStyles();

      if (!this.querySelector("#header")) {
        this.innerHTML = HEADER_MARKUP;
      }

      void this.populatePortfolioMenu().then(() => {
        this.bindRoot();
      });
    }

    disconnectedCallback() {
      this.unbindRoot();
    }

    setToggleState(isOpen) {
      const toggle = this.querySelector(".mobile-nav-toggle");
      if (!toggle) return;

      const icon = toggle.querySelector("i");
      if (icon) {
        icon.classList.toggle("bi-list", !isOpen);
        icon.classList.toggle("bi-x", isOpen);
      }

      toggle.setAttribute("aria-expanded", String(isOpen));
    }

    closeNav() {
      const navbar = this.querySelector("#navbar");
      if (!navbar) return;

      navbar.querySelectorAll(".dropdown-active").forEach((dropdown) => dropdown.classList.remove("dropdown-active"));
      navbar.classList.remove("navbar-mobile");
      this.ownerDocument.body.classList.remove("mobile-nav-open");
      this.setToggleState(false);
    }

    openNav() {
      const navbar = this.querySelector("#navbar");
      if (!navbar) return;

      navbar.classList.add("navbar-mobile");
      this.ownerDocument.body.classList.add("mobile-nav-open");
      this.setToggleState(true);
    }

    updateScrolledState() {
      const header = this.querySelector("#header");
      if (!header) return;

      const hasHero = !!this.ownerDocument.querySelector("#hero");
      if (!hasHero || window.scrollY > 100) {
        header.classList.add("header-scrolled");
      } else {
        header.classList.remove("header-scrolled");
      }
    }

    updateMainPadding() {
      const header = this.querySelector("#header");
      const main = this.ownerDocument.querySelector("main");
      if (!header || !main) return;

      const shouldPad = !this.ownerDocument.querySelector("#hero") || header.classList.contains("header-scrolled");
      main.style.paddingTop = shouldPad ? `${header.offsetHeight}px` : "";
    }

    updateActiveLinks() {
      const links = [...this.querySelectorAll("#navbar .scrollto")];
      if (!links.length) return;

      const position = window.scrollY + 200;
      links.forEach((link) => {
        if (!link.hash) return;

        const section = this.ownerDocument.querySelector(link.hash);
        if (!section) return;

        if (position >= section.offsetTop && position <= (section.offsetTop + section.offsetHeight)) {
          link.classList.add("active");
        } else {
          link.classList.remove("active");
        }
      });
    }

    async populatePortfolioMenu() {
      const portfolioMenu = this.querySelector("[data-portfolio-menu]");
      const portfolioData = window.SitePortfolioData;
      if (!portfolioMenu || !portfolioData || typeof portfolioData.buildPortfolioMenuMarkup !== "function") {
        return;
      }

      try {
        portfolioMenu.innerHTML = portfolioData.buildPortfolioMenuMarkup();
      } catch (error) {
        console.error("Failed to populate portfolio menu:", error);
      }
    }

    scrollToTarget(hash) {
      const header = this.querySelector("#header");
      const target = this.ownerDocument.querySelector(hash);
      if (!header || !target) return;

      let offset = header.offsetHeight;
      if (!header.classList.contains("header-scrolled")) {
        offset -= 16;
      }

      window.scrollTo({
        top: target.offsetTop - offset,
        behavior: "smooth"
      });
    }

    bindRoot() {
      if (this.dataset.siteHeaderMounted === "true") {
        this.refresh();
        return;
      }

      const navbar = this.querySelector("#navbar");
      const toggle = this.querySelector(".mobile-nav-toggle");
      if (!navbar || !toggle) return;

      this.dataset.siteHeaderMounted = "true";

      this.handleToggleClick = (event) => {
        event.preventDefault();

        if (navbar.classList.contains("navbar-mobile")) {
          this.closeNav();
        } else {
          this.openNav();
        }
      };

      this.handleNavbarClick = (event) => {
        if (event.target === navbar) {
          this.closeNav();
        }
      };

      this.handleDropdownClick = (event) => {
        const dropdownToggle = event.target.closest(".dropdown > a");
        if (!dropdownToggle || !navbar.contains(dropdownToggle)) return;
        if (!navbar.classList.contains("navbar-mobile")) return;

        event.preventDefault();
        const submenu = dropdownToggle.nextElementSibling;
        if (submenu) submenu.classList.toggle("dropdown-active");
      };

      this.handleScrollLinkClick = (event) => {
        const link = event.target.closest("a.scrollto");
        if (!link || !navbar.contains(link) || !link.hash) return;

        const target = this.ownerDocument.querySelector(link.hash);
        if (!target) return;

        event.preventDefault();
        this.closeNav();
        this.scrollToTarget(link.hash);
      };

      this.handleDocumentKeydown = (event) => {
        if (event.key === "Escape") {
          this.closeNav();
        }
      };

      this.syncViewport = () => {
        if (window.innerWidth > BREAKPOINT) {
          this.closeNav();
        }
      };

      this.refresh = () => {
        this.updateScrolledState();
        this.updateMainPadding();
        this.updateActiveLinks();
        this.syncViewport();
      };

      toggle.addEventListener("click", this.handleToggleClick);
      navbar.addEventListener("click", this.handleNavbarClick);
      navbar.addEventListener("click", this.handleDropdownClick);
      navbar.addEventListener("click", this.handleScrollLinkClick);
      this.ownerDocument.addEventListener("keydown", this.handleDocumentKeydown);

      window.addEventListener("load", this.refresh);
      window.addEventListener("scroll", this.refresh);
      window.addEventListener("resize", this.refresh);
      window.addEventListener("orientationchange", this.syncViewport);

      if (window.location.hash && this.ownerDocument.querySelector(window.location.hash)) {
        this.handleHashLoad = () => this.scrollToTarget(window.location.hash);
        if (document.readyState === "complete") {
          this.handleHashLoad();
        } else {
          window.addEventListener("load", this.handleHashLoad, { once: true });
        }
      }

      this.refresh();
    }

    unbindRoot() {
      if (this.dataset.siteHeaderMounted !== "true") return;

      const navbar = this.querySelector("#navbar");
      const toggle = this.querySelector(".mobile-nav-toggle");

      if (toggle && this.handleToggleClick) {
        toggle.removeEventListener("click", this.handleToggleClick);
      }

      if (navbar) {
        if (this.handleNavbarClick) {
          navbar.removeEventListener("click", this.handleNavbarClick);
        }
        if (this.handleDropdownClick) {
          navbar.removeEventListener("click", this.handleDropdownClick);
        }
        if (this.handleScrollLinkClick) {
          navbar.removeEventListener("click", this.handleScrollLinkClick);
        }
      }

      if (this.handleDocumentKeydown) {
        this.ownerDocument.removeEventListener("keydown", this.handleDocumentKeydown);
      }

      if (this.refresh) {
        window.removeEventListener("load", this.refresh);
        window.removeEventListener("scroll", this.refresh);
        window.removeEventListener("resize", this.refresh);
      }

      if (this.syncViewport) {
        window.removeEventListener("orientationchange", this.syncViewport);
      }

      if (this.handleHashLoad) {
        window.removeEventListener("load", this.handleHashLoad);
      }

      delete this.dataset.siteHeaderMounted;
    }
  }

  if (!window.customElements.get("site-header")) {
    window.customElements.define("site-header", SiteHeaderElement);
  }

  window.SiteHeaderComponent = {
    closeAll: () => document.querySelectorAll("site-header").forEach((root) => {
      if (typeof root.closeNav === "function") {
        root.closeNav();
      }
    })
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", upgradeLegacyRoots, { once: true });
  } else {
    upgradeLegacyRoots();
  }
})();