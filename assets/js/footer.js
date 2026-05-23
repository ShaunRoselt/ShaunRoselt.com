/* Footer behavior (moved to assets/js/footer.js)
   - toggles the back-to-top button
   - smooth-scrolls to top on click
   - updates copyright year
*/
(function () {
    "use strict";

    const select = (sel) => document.querySelector(sel);

    const toggleBackToTop = () => {
        const back = select('.back-to-top');
        if (!back) return;
        if (window.scrollY > 100) back.classList.add('active'); else back.classList.remove('active');
    };

    window.addEventListener('load', toggleBackToTop);
    document.addEventListener('scroll', toggleBackToTop, { passive: true });

    const back = select('.back-to-top');
    if (back) {
        back.addEventListener('click', function (e) {
            e.preventDefault();
            try {
                window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
            } catch (err) {
                window.scrollTo(0, 0);
            }
        });
    }

    // Update copyright year in footer
    const updateCopyright = () => {
        const copyrightEl = select('footer .copyright');
        if (copyrightEl) {
            const year = new Date().getFullYear();
            copyrightEl.innerHTML = `Copyright © ${year} <strong>Shaun Roselt</strong>`;
        }
    };

    // Initial attempt (footer may not be mounted yet)
    updateCopyright();

    // If footer is mounted after this script runs, update when component dispatches event
    document.addEventListener('site:footer:mounted', updateCopyright, { once: true });

})();
