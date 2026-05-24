(function () {
  "use strict";

  // Remove preloader on uncaught errors to avoid a stuck loading spinner
  window.addEventListener('error', function () {
    try {
      var pre = document.querySelector('#preloader'); if (pre) pre.remove();
    } catch (e) { }
  });
  window.addEventListener('unhandledrejection', function () {
    try {
      var pre = document.querySelector('#preloader'); if (pre) pre.remove();
    } catch (e) { }
  });

  /**
   * Easy selector helper function
   */
  const select = (el, all = false) => {
    el = el.trim();
    if (all) {
      return [...document.querySelectorAll(el)];
    } else {
      return document.querySelector(el);
    }
  }

  /**
   * Easy event listener function
   */
  const on = (type, el, listener, all = false) => {
    let selectEl = select(el, all);
    if (selectEl) {
      if (all) {
        selectEl.forEach(e => e.addEventListener(type, listener));
      } else {
        selectEl.addEventListener(type, listener);
      }
    }
  }

  /**
   * Easy on scroll event listener
   */
  const onscroll = (el, listener) => {
    el.addEventListener('scroll', listener);
  }

  /**
   * Counters
   */
  const currentYear = new Date().getFullYear();
  const bornYear = new Date(1998, 2, 19).getFullYear();
  const age = currentYear - bornYear;
  const startedProgrammingYear = new Date(2013, 0, 1).getFullYear();
  const programmingAge = currentYear - startedProgrammingYear;
  const elYearsAlive = select("#counter-years-alive");
  if (elYearsAlive) elYearsAlive.setAttribute("data-purecounter-end", age);

  const elYearsExp = select("#counter-years-of-experience");
  if (elYearsExp) elYearsExp.setAttribute("data-purecounter-end", programmingAge);

  const elCS2 = select("#hours-of-cs2-playtime");
  if (elCS2) {
    const cs2 = (typeof CS2_Hours !== 'undefined') ? CS2_Hours : 0;
    elCS2.setAttribute("data-purecounter-end", cs2);
  }



  /**
   * Intro type effect
   */
  const typed = select('.typed');
  if (typed && typeof Typed === 'function') {
    try {
      let typed_strings = typed.getAttribute('data-typed-items');
      typed_strings = typed_strings.split(',');
      new Typed('.typed', {
        strings: typed_strings,
        loop: true,
        typeSpeed: 100,
        backSpeed: 50,
        backDelay: 2000
      });
    } catch (e) { }
  }

  /**
   * Initiate portfolio lightbox
   */
  let portfolioLightbox = null;
  const initPortfolioLightbox = () => {
    if (portfolioLightbox && typeof portfolioLightbox.destroy === 'function') {
      portfolioLightbox.destroy();
    }

    if (typeof GLightbox !== 'function') {
      // GLightbox not available; skip initialization
      return null;
    }

    try {
      portfolioLightbox = new GLightbox({
        selector: '.portfolio-lightbox'
      });
    } catch (e) {
      portfolioLightbox = null;
    }

    return portfolioLightbox;
  };

  try { initPortfolioLightbox(); } catch (e) { /* ignore */ }

  /**
   * Compact showcase cards to preserve media height
   */
  const syncShowcaseCardLayout = () => {
    const showcaseCards = select('.showcase-card', true);
    if (!showcaseCards.length) return;

    showcaseCards.forEach(card => {
      const media = card.querySelector('.showcase-media');
      const body = card.querySelector('.showcase-body');
      const tags = card.querySelector('.showcase-tags');
      const features = card.querySelector('.showcase-features');
      const featureItems = features ? [...features.querySelectorAll('li')] : [];

      if (!media || !body) return;

      body.classList.remove('showcase-body-compact', 'showcase-body-clamp-summary');
      if (tags) tags.hidden = false;
      if (features) features.hidden = false;
      featureItems.forEach(item => {
        item.hidden = false;
      });

      if (window.innerWidth <= 991) {
        return;
      }

      const fitsWithinMedia = () => body.scrollHeight <= media.clientHeight;

      if (fitsWithinMedia()) {
        return;
      }

      body.classList.add('showcase-body-compact');

      for (let index = featureItems.length - 1; index >= 0 && !fitsWithinMedia(); index -= 1) {
        featureItems[index].hidden = true;
      }

      if (features && featureItems.every(item => item.hidden)) {
        features.hidden = true;
      }

      if (tags && !fitsWithinMedia()) {
        tags.hidden = true;
      }

      if (!fitsWithinMedia()) {
        body.classList.add('showcase-body-clamp-summary');
      }
    });
  };

  let showcaseLayoutRaf = null;
  const queueShowcaseCardLayoutSync = () => {
    if (showcaseLayoutRaf) {
      window.cancelAnimationFrame(showcaseLayoutRaf);
    }
    showcaseLayoutRaf = window.requestAnimationFrame(() => {
      syncShowcaseCardLayout();
      showcaseLayoutRaf = null;
    });
  };

  window.addEventListener('load', queueShowcaseCardLayoutSync);
  window.addEventListener('resize', queueShowcaseCardLayoutSync);
  if (document.fonts && typeof document.fonts.ready?.then === 'function') {
    document.fonts.ready.then(queueShowcaseCardLayoutSync).catch(() => { });
  }

  /**
   * Non-interactive iframe previews: when an iframe loads, fade out the
   * fallback image so pages that allow embedding show the live preview.
   * Additionally, present embedded sites as a scaled "desktop" viewport
   * so they look like desktop screenshots rather than zoomed mobile views.
   */
  const DESKTOP_IFRAME_WIDTH = 1200;
  const WEBSITE_IFRAME_ZOOM = 0.9;
  let iframeScaleInitialized = false;
  let iframeScaleRaf = null;

  const getShowcaseIframeViewportWidth = (iframe) => {
    const category = iframe.closest('[data-portfolio-category]')?.dataset.portfolioCategory;
    const zoom = category === 'websites' ? WEBSITE_IFRAME_ZOOM : 1;
    return Math.round(DESKTOP_IFRAME_WIDTH / zoom);
  };

  const isInteractiveShowcaseIframe = (iframe) => iframe.dataset.interactive === 'true';

  const updateShowcaseIframeScales = () => {
    const medias = select('.showcase-media', true) || [];
    medias.forEach(media => {
      const iframe = media.querySelector('iframe');
      if (!iframe) return;
      if (isInteractiveShowcaseIframe(iframe)) {
        iframe.style.removeProperty('--iframe-scale');
        iframe.style.removeProperty('--iframe-viewport-width');
        iframe.style.removeProperty('--iframe-offset-x');
        return;
      }
      const iframeViewportWidth = getShowcaseIframeViewportWidth(iframe);
      const iframeViewportHeight = Math.round(iframeViewportWidth * 9 / 16);
      const parentWidth = media.clientWidth || media.offsetWidth || 0;
      const parentHeight = media.clientHeight || media.offsetHeight || 0;
      let scale = Math.min(parentWidth / iframeViewportWidth, parentHeight / iframeViewportHeight);
      if (!isFinite(scale) || scale <= 0) scale = 1;
      if (scale > 1) scale = 1;
      const scaledWidth = iframeViewportWidth * scale;
      const offsetX = Math.max((parentWidth - scaledWidth) / 2, 0);
      iframe.style.setProperty('--iframe-scale', String(scale));
      iframe.style.setProperty('--iframe-viewport-width', iframeViewportWidth + 'px');
      iframe.style.setProperty('--iframe-offset-x', offsetX + 'px');
    });
  };

  const queueUpdateShowcaseIframeScales = () => {
    if (iframeScaleRaf) window.cancelAnimationFrame(iframeScaleRaf);
    iframeScaleRaf = window.requestAnimationFrame(() => {
      updateShowcaseIframeScales();
      iframeScaleRaf = null;
    });
  };

  const initShowcaseIframes = () => {
    const iframes = select('.showcase-media iframe', true) || [];
    if (!iframes.length) return;

    const shouldKeepFallbackVisible = (iframe, fallback) => {
      if (window.location.protocol !== 'file:') return false;

      if (iframe.dataset.interactive === 'true') return false;

      // Only force screenshot fallbacks on local file previews. Placeholder
      // fallbacks can allow the remote iframe to attempt a real load.
      if (!fallback || fallback.tagName !== 'IMG') return false;

      try {
        const iframeUrl = new URL(iframe.getAttribute('src') || '', window.location.href);
        return iframeUrl.protocol !== 'file:';
      } catch (e) {
        return false;
      }
    };

    iframes.forEach(iframe => {
      const fallback = iframe.parentElement ? iframe.parentElement.querySelector('.showcase-fallback') : null;

      if (shouldKeepFallbackVisible(iframe, fallback)) {
        iframe.style.display = 'none';
        if (fallback) {
          fallback.style.opacity = '1';
          fallback.style.display = 'block';
        }
        return;
      }

      // Only attempt to reset iframe internal scroll if same-origin access is available.
      // Avoid calling this on cross-origin frames to prevent any incidental layout/scroll side-effects.
      const resetIframeScroll = () => {
        try {
          const frameWindow = iframe.contentWindow;
          const frameDoc = iframe.contentDocument || frameWindow?.document;
          if (!frameWindow || !frameDoc) return;

          // Feature-detect same-origin access by reading a harmless property
          // and bailing early if access is blocked.
          void frameWindow.location.href;

          if ('scrollRestoration' in frameWindow.history) {
            frameWindow.history.scrollRestoration = 'manual';
          }

          frameWindow.scrollTo(0, 0);
          frameDoc.documentElement.scrollTop = 0;
          if (frameDoc.body) frameDoc.body.scrollTop = 0;
        } catch (e) {
          // cross-origin or sandboxed without same-origin access; skip
        }
      };

      const hideFallback = () => {
        if (fallback) {
          try {
            fallback.style.transition = 'opacity 320ms ease';
            fallback.style.opacity = '0';
            setTimeout(() => {
              if (fallback && fallback.parentElement) fallback.style.display = 'none';
            }, 420);
          } catch (e) {
            // defensive: don't let this break other scripts
          }
        }
      };

      const handleLoad = () => {
        resetIframeScroll();
        if (!shouldKeepFallbackVisible(iframe, fallback)) {
          hideFallback();
        }
      };

      if (iframe.dataset.showcaseIframeInitialized !== 'true') {
        iframe.addEventListener('load', handleLoad);
        iframe.dataset.showcaseIframeInitialized = 'true';
      }

      // If same-origin and already complete, hide immediately
      try {
        if (iframe.contentDocument && iframe.contentDocument.readyState === 'complete') {
          handleLoad();
        }
      } catch (e) {
        // cross-origin access will throw, so ignore and continue to attach listener
      }
    });

    // update scales initially and attach listeners once
    updateShowcaseIframeScales();
    if (!iframeScaleInitialized) {
      window.addEventListener('resize', queueUpdateShowcaseIframeScales);
      window.addEventListener('load', queueUpdateShowcaseIframeScales);
      iframeScaleInitialized = true;
    }
  };

  const refreshShowcaseUi = () => {
    initPortfolioLightbox();
    queueShowcaseCardLayoutSync();
    initShowcaseIframes();
  };

  window.SiteShowcase = {
    refresh: refreshShowcaseUi
  };

  // Attach handlers immediately and again when portfolio content changes
  refreshShowcaseUi();
  window.addEventListener('load', refreshShowcaseUi);
  window.addEventListener('portfolio:rendered', refreshShowcaseUi);

  /**
   * Load testimonials/recommendations from JSON and initialize Swiper
   */
  const loadRecommendations = async () => {
    try {
      const wrapper = select('.testimonials-slider .swiper-wrapper');
      if (!wrapper) return;

      const res = await fetch('assets/data/recommendations.json');
      if (!res.ok) return;
      const recs = await res.json();
      wrapper.innerHTML = recs.map(r => `
        <div class="swiper-slide">
          <div class="testimonial-box">
            <div class="author-test">
              ${r.avatar ? `<img src="${r.avatar}" alt="${(r.author ? ('Photo of ' + r.author) : 'Author avatar').replace(/"/g, '&quot;')}" class="rounded-circle b-shadow-a" style="height: 200px; width: 200px;">` : ''}
              <span class="author">${r.author}</span>
            </div>
            <div class="content-test">
              <p class="description lead">${r.text}</p>
            </div>
          </div>
        </div>
      `).join('');

      if (window.testimonialsSwiper && typeof window.testimonialsSwiper.destroy === 'function') {
        window.testimonialsSwiper.destroy(true, true);
      }

      window.testimonialsSwiper = new Swiper('.testimonials-slider', {
        speed: 600,
        loop: true,
        autoplay: {
          delay: 5000,
          disableOnInteraction: false
        },
        slidesPerView: 'auto',
        pagination: {
          el: '.testimonials-slider .swiper-pagination',
          type: 'bullets',
          clickable: true
        }
      });
    } catch (err) {
      // Recommendations are optional; fail silently if the request is unavailable.
    }
  };

  // load recommendations and initialize testimonials slider
  loadRecommendations();

  /**
   * Portfolio details slider
   */
  if (select('.portfolio-details-slider') && typeof Swiper === 'function') {
    try {
      new Swiper('.portfolio-details-slider', {
        speed: 400,
        loop: true,
        autoplay: {
          delay: 5000,
          disableOnInteraction: false
        },
        pagination: {
          el: '.portfolio-details-slider .swiper-pagination',
          type: 'bullets',
          clickable: true
        }
      });
    } catch (e) { }
  }

  /**
   * Preloader
   */
  let preloader = select('#preloader');
  if (preloader) {
    //window.addEventListener('load', () => {
    preloader.remove();
    //});
  }

  /**
   * Fetch GitHub stars for the user and update counter
   */
  const updateGithubStars = async (username, selector) => {
    try {
      const el = select(selector);
      if (!el) return;

      let total = 0;
      let page = 1;
      const per_page = 100;
      const headers = {};

      while (true) {
        const res = await fetch(`https://api.github.com/users/${username}/repos?per_page=${per_page}&page=${page}`, { headers });
        if (!res.ok) {
          throw new Error('GitHub API error ' + res.status);
        }
        const repos = await res.json();
        repos.forEach(r => { total += r.stargazers_count || 0; });
        if (repos.length < per_page) break;
        page++;
      }

      const start = el.getAttribute('data-purecounter-start') || '0';
      el.setAttribute('data-purecounter-start', start);
      el.setAttribute('data-purecounter-end', String(total));
      el.setAttribute('data-purecounter-duration', '1');
      // ensure the displayed value is the start so PureCounter animates
      el.textContent = start;
      if (typeof PureCounter === 'function') {
        try { new PureCounter(); } catch (e) { }
      }
    } catch (err) {
      // GitHub stars are a nice-to-have; keep the console clean if the API fails.
    }
  };

  // Update GitHub stars counter (username inferred from site links)
  updateGithubStars('shaunroselt', '#github-stars');

  /**
   * Initiate Pure Counter
   */
  if (typeof PureCounter === 'function') {
    new PureCounter();
  }

})()
