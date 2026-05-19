(function() {
  "use strict";

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
  select("#counter-years-alive").setAttribute("data-purecounter-end", age);
  select("#counter-years-of-experience").setAttribute("data-purecounter-end", programmingAge);
  select("#hours-of-cs2-playtime").setAttribute("data-purecounter-end", CS2_Hours);

  /**
   * Navbar links active state on scroll
   */
  let navbarlinks = select('#navbar .scrollto', true);
  const navbarlinksActive = () => {
    let position = window.scrollY + 200;
    navbarlinks.forEach(navbarlink => {
      if (!navbarlink.hash) return undefined;
      let section = select(navbarlink.hash);
      if (!section) return undefined;
      if (position >= section.offsetTop && position <= (section.offsetTop + section.offsetHeight)) {
        navbarlink.classList.add('active');
      } else {
        navbarlink.classList.remove('active');
      }
    })
  }
  window.addEventListener('load', navbarlinksActive);
  onscroll(document, navbarlinksActive);

  /**
   * Scrolls to an element with header offset
   */
  const scrollto = (el) => {
    let header = select('#header');
    let offset = header.offsetHeight;

    if (!header.classList.contains('header-scrolled')) {
      offset -= 16;
    }

    let elementPos = select(el).offsetTop;
    window.scrollTo({
      top: elementPos - offset,
      behavior: 'smooth'
    });
  }

  /**
   * Toggle .header-scrolled class to #header when page is scrolled
   */
  let selectHeader = select('#header');
  if (selectHeader) {
    const headerScrolled = () => {
      if (window.scrollY > 100) {
        selectHeader.classList.add('header-scrolled');
      } else {
        selectHeader.classList.remove('header-scrolled');
      }
    }
    window.addEventListener('load', headerScrolled);
    onscroll(document, headerScrolled);
  }

  /**
   * Back to top button
   */
  let backtotop = select('.back-to-top');
  if (backtotop) {
    const toggleBacktotop = () => {
      if (window.scrollY > 100) {
        backtotop.classList.add('active');
      } else {
        backtotop.classList.remove('active');
      }
    }
    window.addEventListener('load', toggleBacktotop);
    onscroll(document, toggleBacktotop);
  }

  /**
   * Mobile nav toggle
   */
  on('click', '.mobile-nav-toggle', function(e) {
    select('#navbar').classList.toggle('navbar-mobile');
    this.classList.toggle('bi-list');
    this.classList.toggle('bi-x');
  })

  /**
   * Mobile nav dropdowns activate
   */
  on('click', '.navbar .dropdown > a', function(e) {
    if (select('#navbar').classList.contains('navbar-mobile')) {
      e.preventDefault();
      this.nextElementSibling.classList.toggle('dropdown-active');
    }
  }, true);

  /**
   * Scroll with ofset on links with a class name .scrollto
   */
  on('click', '.scrollto', function(e) {
    if (select(this.hash)) {
      e.preventDefault();

      let navbar = select('#navbar');
      if (navbar.classList.contains('navbar-mobile')) {
        navbar.classList.remove('navbar-mobile');
        let navbarToggle = select('.mobile-nav-toggle');
        navbarToggle.classList.toggle('bi-list');
        navbarToggle.classList.toggle('bi-x');
      }
      scrollto(this.hash);
    }
  }, true);

  /**
   * Scroll with ofset on page load with hash links in the url
   */
  window.addEventListener('load', () => {
    if (window.location.hash) {
      if (select(window.location.hash)) {
        scrollto(window.location.hash);
      }
    }
  });

  /**
   * Intro type effect
   */
  const typed = select('.typed');
  if (typed) {
    let typed_strings = typed.getAttribute('data-typed-items');
    typed_strings = typed_strings.split(',');
    new Typed('.typed', {
      strings: typed_strings,
      loop: true,
      typeSpeed: 100,
      backSpeed: 50,
      backDelay: 2000
    });
  }

  /**
   * Initiate portfolio lightbox 
   */
  const portfolioLightbox = new GLightbox({
    selector: '.portfolio-lightbox'
  });

  /**
   * Load testimonials/recommendations from JSON and initialize Swiper
   */
  const loadRecommendations = async () => {
    try {
      const res = await fetch('assets/data/recommendations.json');
      if (!res.ok) throw new Error('Failed to load recommendations');
      const recs = await res.json();
      const wrapper = select('.testimonials-slider .swiper-wrapper');
      if (!wrapper) return;
      wrapper.innerHTML = recs.map(r => `
        <div class="swiper-slide">
          <div class="testimonial-box">
            <div class="author-test">
              ${r.avatar ? `<img src="${r.avatar}" alt="" class="rounded-circle b-shadow-a" style="height: 200px; width: 200px;">` : ''}
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
      console.error('Failed to load recommendations:', err);
    }
  };

  // load recommendations and initialize testimonials slider
  loadRecommendations();

  /**
   * Portfolio details slider
   */
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

      const el = select(selector);
      if (el) {
        const start = el.getAttribute('data-purecounter-start') || '0';
        el.setAttribute('data-purecounter-start', start);
        el.setAttribute('data-purecounter-end', String(total));
        el.setAttribute('data-purecounter-duration', '1');
        // ensure the displayed value is the start so PureCounter animates
        el.textContent = start;
        if (typeof PureCounter === 'function') {
          try { new PureCounter(); } catch (e) { console.error(e); }
        }
      }
    } catch (err) {
      console.error('Failed to fetch GitHub stars:', err);
    }
  };

  // Update GitHub stars counter (username inferred from site links)
  updateGithubStars('shaunroselt', '#github-stars');

  /**
   * Initiate Pure Counter 
   */
  new PureCounter();

})()