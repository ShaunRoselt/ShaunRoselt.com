(function () {
  "use strict";

  const scriptEl = document.currentScript;
  const scriptBaseUrl = scriptEl && scriptEl.src ? new URL('.', scriptEl.src) : new URL('./', document.baseURI);
  const defaultHtmlUrl = new URL('site-header.html', scriptBaseUrl).toString();
  const defaultCssUrl = new URL('site-header.css', scriptBaseUrl).toString();
  const BREAKPOINT = 991;

  const getRootElements = () => [...document.querySelectorAll('[data-site-header], site-header')];

  const ensureStylesheet = (href) => {
    const existing = [...document.querySelectorAll('link[rel="stylesheet"]')]
      .find(link => link.href === href);

    if (existing) return;

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.dataset.siteHeaderStyles = 'true';
    document.head.appendChild(link);
  };

  const setToggleState = (root, isOpen) => {
    const toggle = root.querySelector('.mobile-nav-toggle');
    if (!toggle) return;

    const icon = toggle.querySelector('i');
    if (icon) {
      icon.classList.toggle('bi-list', !isOpen);
      icon.classList.toggle('bi-x', isOpen);
    }

    toggle.setAttribute('aria-expanded', String(isOpen));
  };

  const closeNav = (root) => {
    const navbar = root.querySelector('#navbar');
    if (!navbar) return;

    navbar.querySelectorAll('.dropdown-active').forEach(dropdown => dropdown.classList.remove('dropdown-active'));
    navbar.classList.remove('navbar-mobile');
    root.ownerDocument.body.classList.remove('mobile-nav-open');
    setToggleState(root, false);
  };

  const openNav = (root) => {
    const navbar = root.querySelector('#navbar');
    if (!navbar) return;

    navbar.classList.add('navbar-mobile');
    root.ownerDocument.body.classList.add('mobile-nav-open');
    setToggleState(root, true);
  };

  const updateScrolledState = (root) => {
    const header = root.querySelector('#header');
    if (!header) return;

    const hasHero = !!root.ownerDocument.querySelector('#hero');
    if (!hasHero || window.scrollY > 100) {
      header.classList.add('header-scrolled');
    } else {
      header.classList.remove('header-scrolled');
    }
  };

  const updateMainPadding = (root) => {
    const header = root.querySelector('#header');
    const main = root.ownerDocument.querySelector('main');
    if (!header || !main) return;

    const shouldPad = !root.ownerDocument.querySelector('#hero') || header.classList.contains('header-scrolled');
    main.style.paddingTop = shouldPad ? `${header.offsetHeight}px` : '';
  };

  const updateActiveLinks = (root) => {
    const links = [...root.querySelectorAll('#navbar .scrollto')];
    if (!links.length) return;

    const position = window.scrollY + 200;
    links.forEach(link => {
      if (!link.hash) return;
      const section = root.ownerDocument.querySelector(link.hash);
      if (!section) return;

      if (position >= section.offsetTop && position <= (section.offsetTop + section.offsetHeight)) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  };

  const populatePortfolioMenu = async (root) => {
    const portfolioMenu = root.querySelector('[data-portfolio-menu]');
    const portfolioData = window.SitePortfolioData;
    if (!portfolioMenu || !portfolioData || typeof portfolioData.buildPortfolioMenuMarkup !== 'function') {
      return;
    }

    try {
      portfolioMenu.innerHTML = portfolioData.buildPortfolioMenuMarkup();
    } catch (error) {
      console.error('Failed to populate portfolio menu:', error);
    }
  };

  const scrollToTarget = (root, hash) => {
    const header = root.querySelector('#header');
    const target = root.ownerDocument.querySelector(hash);
    if (!header || !target) return;

    let offset = header.offsetHeight;
    if (!header.classList.contains('header-scrolled')) {
      offset -= 16;
    }

    window.scrollTo({
      top: target.offsetTop - offset,
      behavior: 'smooth'
    });
  };

  const bindRoot = (root) => {
    if (root.dataset.siteHeaderMounted === 'true') return;

    const navbar = root.querySelector('#navbar');
    const toggle = root.querySelector('.mobile-nav-toggle');
    if (!navbar || !toggle) return;

    root.dataset.siteHeaderMounted = 'true';

    toggle.addEventListener('click', (event) => {
      event.preventDefault();

      if (navbar.classList.contains('navbar-mobile')) {
        closeNav(root);
      } else {
        openNav(root);
      }
    });

    navbar.addEventListener('click', (event) => {
      if (event.target === navbar) {
        closeNav(root);
      }
    });

    navbar.addEventListener('click', (event) => {
      const dropdownToggle = event.target.closest('.navbar .dropdown > a');
      if (!dropdownToggle || !navbar.contains(dropdownToggle)) return;

      if (!navbar.classList.contains('navbar-mobile')) return;

      event.preventDefault();
      const submenu = dropdownToggle.nextElementSibling;
      if (submenu) submenu.classList.toggle('dropdown-active');
    });

    navbar.addEventListener('click', (event) => {
      const link = event.target.closest('a.scrollto');
      if (!link || !navbar.contains(link) || !link.hash) return;

      const target = root.ownerDocument.querySelector(link.hash);
      if (!target) return;

      event.preventDefault();
      closeNav(root);
      scrollToTarget(root, link.hash);
    });

    root.ownerDocument.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        closeNav(root);
      }
    });

    const syncViewport = () => {
      if (window.innerWidth > BREAKPOINT) {
        closeNav(root);
      }
    };

    const refresh = () => {
      updateScrolledState(root);
      updateMainPadding(root);
      updateActiveLinks(root);
      syncViewport();
    };

    window.addEventListener('load', refresh);
    window.addEventListener('scroll', refresh);
    window.addEventListener('resize', refresh);
    window.addEventListener('orientationchange', syncViewport);

    refresh();

    if (window.location.hash && root.ownerDocument.querySelector(window.location.hash)) {
      window.addEventListener('load', () => scrollToTarget(root, window.location.hash));
    }
  };

  const loadHeader = async (root) => {
    const htmlUrl = root.dataset.siteHeaderHtml || scriptEl?.dataset.siteHeaderHtml || defaultHtmlUrl;
    const cssUrl = root.dataset.siteHeaderCss || scriptEl?.dataset.siteHeaderCss || defaultCssUrl;

    ensureStylesheet(cssUrl);

    if (!root.querySelector('#header')) {
      const response = await fetch(htmlUrl);
      if (!response.ok) {
        throw new Error(`Failed to load site header from ${htmlUrl}`);
      }

      root.innerHTML = await response.text();
    }

    await populatePortfolioMenu(root);
    bindRoot(root);
  };

  const mount = () => {
    getRootElements().forEach(root => {
      loadHeader(root).catch(error => console.error('Failed to initialize site header:', error));
    });
  };

  window.SiteHeaderComponent = {
    mount,
    closeAll: () => getRootElements().forEach(root => closeNav(root))
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount, { once: true });
  } else {
    mount();
  }
})();
