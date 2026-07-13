(function () {
  const nav = document.getElementById('hp-nav');
  const progress = document.getElementById('hp-progress');
  const progressFill = document.getElementById('hp-progress-fill');
  const sections = Array.from(document.querySelectorAll('#hero-root, .hero'));
  const menuOverlay = document.getElementById('menu-overlay');
  const menuToggle = document.getElementById('menu-toggle');
  const menuClose = document.getElementById('menu-close');
  const langToggle = document.getElementById('lang-toggle');
  const langLabel = document.getElementById('lang-label');

  let menuOpen = false;
  let lang = 'EN';
  let lastY = window.scrollY;

  // Background-image zoom amplitude. Reduced-motion visitors get a gentler
  // 1 -> 1.08 zoom (vs 1 -> 1.2) rather than none, per the client's request.
  const reduceMotion = window.matchMedia
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let zoomAmp = reduceMotion ? 0.08 : 0.2;
  if (window.matchMedia) {
    window.matchMedia('(prefers-reduced-motion: reduce)')
      .addEventListener('change', (e) => { zoomAmp = e.matches ? 0.08 : 0.2; onScroll(); });
  }

  function setMenuOpen(open) {
    menuOpen = open;
    menuOverlay.classList.toggle('open', open);
  }

  menuToggle.addEventListener('click', () => setMenuOpen(!menuOpen));
  menuClose.addEventListener('click', () => setMenuOpen(false));
  menuOverlay.querySelectorAll('.menu-link').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      setMenuOpen(false);
    });
  });

  langToggle.addEventListener('click', () => {
    lang = lang === 'EN' ? 'TH' : 'EN';
    langLabel.textContent = lang === 'EN' ? 'English' : 'ไทย';
    langToggle.classList.toggle('open');
  });

  function onScroll() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const y = window.scrollY;
    const pct = max > 0 ? Math.min(1, y / max) : 0;
    progressFill.style.width = (pct * 100).toFixed(2) + '%';

    const vh = window.innerHeight || 1;
    sections.forEach((sec, i) => {
      const img = sec.querySelector(':scope > img');
      if (!img) return;
      // Depth/parallax: as the NEXT section slides up and covers this one,
      // this section's own background image zooms 1 -> 1.2 in step with
      // the cover progress (0 = not covered yet, 1 = fully covered).
      const rel = y - i * vh;
      if (rel <= 0) {
        img.style.transform = 'scale(1)';
      } else {
        const p = Math.min(1, rel / vh);
        img.style.transform = 'scale(' + (1 + p * zoomAmp).toFixed(4) + ')';
      }
      // Scroll-triggered stagger fade-in: this section is the "next screen"
      // for the one above it, so its own title/copy/button only start
      // revealing once it has risen to cover half the viewport (0.5vh).
      if (y >= (i - 0.5) * vh) sec.classList.add('in-view');
      // Scroll-triggered fade-out: once the section BELOW this one has
      // risen to cover 0.2vh of it, fade this section's text out upward.
      // Removing the class (scrolling back) is what makes it reversible.
      if (y >= (i + 0.2) * vh) sec.classList.add('fade-out');
      else sec.classList.remove('fade-out');
    });

    if (!menuOpen) {
      const goingDown = y > lastY;
      const hide = goingDown && y > 90;
      nav.classList.toggle('nav-hidden', hide);
      progress.classList.toggle('nav-hidden', hide);
    }
    lastY = y;
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  // Global Footprint map: reveal the Taiwan->cities connection network when the
  // section scrolls into view; reversible (re-hides when it leaves the viewport
  // so the draw-on replays on scroll-back), matching the Figma prototype.
  const footprint = document.querySelector('.footprint');
  if (footprint) {
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => footprint.classList.toggle('in-view', e.isIntersecting));
      }, { threshold: 0.2 });
      io.observe(footprint);
    } else {
      footprint.classList.add('in-view');
    }
  }
})();
