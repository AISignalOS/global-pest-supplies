/**
 * Global Pest Supplies — UI & Animation Layer
 * Scroll progress · cursor glow · parallax · stagger reveals
 * Animated counters · magnetic buttons · carousel · nav
 */

document.addEventListener('DOMContentLoaded', () => {
  initScrollProgress();
  initCursorGlow();
  initNavScroll();
  initMobileMenu();
  initScrollReveal();
  initCounters();
  initMagneticButtons();
  initCarousel();
  initHeroParallax();
  initHeroEntrance();
  initSectionDividers();
});

/* ── Scroll progress bar ───────────────────────────────────────────── */
function initScrollProgress() {
  const bar = document.getElementById('scrollProgress');
  if (!bar) return;
  const update = () => {
    const pct = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight) * 100;
    bar.style.width = `${Math.min(pct, 100)}%`;
  };
  window.addEventListener('scroll', update, { passive: true });
}

/* ── Cursor glow ───────────────────────────────────────────────────── */
function initCursorGlow() {
  const glow = document.getElementById('cursorGlow');
  if (!glow || window.matchMedia('(pointer: coarse)').matches) return;

  let mx = -200, my = -200;
  let cx = -200, cy = -200;
  let raf;

  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; }, { passive: true });

  const lerp = (a, b, t) => a + (b - a) * t;

  function animate() {
    cx = lerp(cx, mx, 0.1);
    cy = lerp(cy, my, 0.1);
    glow.style.transform = `translate(${cx - 150}px, ${cy - 150}px)`;
    raf = requestAnimationFrame(animate);
  }
  animate();

  // Grow on interactive elements
  document.querySelectorAll('a, button, .pcard, .pest-tab, .finder-option, .finder-pest-btn').forEach(el => {
    el.addEventListener('mouseenter', () => glow.classList.add('large'), { passive: true });
    el.addEventListener('mouseleave', () => glow.classList.remove('large'), { passive: true });
  });
}

/* ── Nav scroll effect ─────────────────────────────────────────────── */
function initNavScroll() {
  const nav = document.querySelector('.nav');
  if (!nav) return;
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        // class-based so both themes style it correctly (see styles.css)
        nav.classList.toggle('scrolled', window.scrollY > 60);
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

/* ── Mobile menu ───────────────────────────────────────────────────── */
function initMobileMenu() {
  const hamburger = document.querySelector('.nav-hamburger');
  const links     = document.querySelector('.nav-links');
  if (!hamburger || !links) return;
  let open = false;
  hamburger.addEventListener('click', () => {
    open = !open;
    links.classList.toggle('mobile-open', open);
    hamburger.classList.toggle('active', open);
    hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
}

/* ── Hero entrance animation ───────────────────────────────────────── */
function initHeroEntrance() {
  const tag  = document.querySelector('.hero-tag');
  const h1   = document.querySelector('.hero h1');
  const sub  = document.querySelector('.hero-sub');
  const ctas = document.querySelector('.hero-ctas');
  const trust = document.querySelector('.hero-trust');
  const globe = document.querySelector('.hero-globe');

  [tag, h1, sub, ctas, trust].forEach((el, i) => {
    if (!el) return;
    el.style.cssText += `opacity:0; transform:translateY(28px); transition: opacity 0.7s ease ${i * 0.12}s, transform 0.7s ease ${i * 0.12}s;`;
  });
  if (globe) globe.style.cssText += `opacity:0; transform:translateY(-50%) scale(0.92); transition: opacity 1s ease 0.3s, transform 1s ease 0.3s;`;

  requestAnimationFrame(() => {
    [tag, h1, sub, ctas, trust].forEach(el => {
      if (el) { el.style.opacity = '1'; el.style.transform = 'translateY(0)'; }
    });
    if (globe) { globe.style.opacity = '1'; globe.style.transform = 'translateY(-50%) scale(1)'; }
  });
}

/* ── Hero parallax ─────────────────────────────────────────────────── */
function initHeroParallax() {
  const globe = document.querySelector('.hero-globe');
  if (!globe || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y < window.innerHeight * 1.5) {
      globe.style.transform = `translateY(calc(-50% + ${y * 0.18}px))`;
    }
  }, { passive: true });
}

/* ── Scroll reveal ─────────────────────────────────────────────────── */
function initScrollReveal() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const SELECTORS = [
    { sel: '.pcard',       fx: 'fade-up',   stagger: 0.07 },
    { sel: '.trust-card',  fx: 'fade-up',   stagger: 0.1  },
    { sel: '.edu-card',    fx: 'fade-up',   stagger: 0.1  },
    { sel: '.info-card',   fx: 'fade-left', stagger: 0.12 },
    { sel: '.pricing-card',fx: 'fade-up',   stagger: 0.14 },
    { sel: '.pro-feature', fx: 'fade-up',   stagger: 0.08 },
    { sel: '.section-title', fx: 'fade-up', stagger: 0    },
    { sel: '.pest-finder-section', fx: 'fade-up', stagger: 0 },
    { sel: '.path-panel',   fx: 'fade-up',  stagger: 0.12 },
    { sel: '.kit-loadout-card', fx: 'fade-up', stagger: 0.1 },
    { sel: '.guide-file',   fx: 'fade-up',  stagger: 0.09 },
    { sel: '.network-stat', fx: 'fade-up',  stagger: 0.1  },
    { sel: '.cmd-path',     fx: 'fade-up',  stagger: 0.07 },
  ];

  const transforms = {
    'fade-up':   'translateY(32px)',
    'fade-left': 'translateX(-24px)',
    'fade-right':'translateX(24px)',
  };

  SELECTORS.forEach(({ sel, fx, stagger }) => {
    document.querySelectorAll(sel).forEach((el, i) => {
      if (el.dataset.revealed) return;
      el.style.opacity   = '0';
      el.style.transform = transforms[fx] || 'translateY(24px)';
      el.style.transition = `opacity 0.6s ease ${i * stagger}s, transform 0.6s ease ${i * stagger}s`;
      el.dataset.revealed = 'pending';
    });
  });

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      el.style.opacity   = '1';
      el.style.transform = 'none';
      el.dataset.revealed = 'done';
      io.unobserve(el);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('[data-revealed="pending"]').forEach(el => io.observe(el));
}

/* ── Animated counters ─────────────────────────────────────────────── */
function initCounters() {
  document.querySelectorAll('[data-count]').forEach(el => {
    const target = parseInt(el.dataset.count, 10);
    const suffix = el.dataset.suffix || '';
    let started  = false;

    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || started) return;
      started = true;
      const start = Date.now();
      const dur   = 1800;
      const tick  = () => {
        const p = Math.min((Date.now() - start) / dur, 1);
        const ease = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(ease * target).toLocaleString() + suffix;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      io.disconnect();
    }, { threshold: 0.5 });
    io.observe(el);
  });
}

/* ── Magnetic buttons ──────────────────────────────────────────────── */
function initMagneticButtons() {
  if (window.matchMedia('(pointer: coarse)').matches) return;

  document.querySelectorAll('.btn-primary, .btn-secondary').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r   = btn.getBoundingClientRect();
      const dx  = e.clientX - (r.left + r.width / 2);
      const dy  = e.clientY - (r.top  + r.height / 2);
      btn.style.transform = `translate(${dx * 0.15}px, ${dy * 0.2}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });
}

/* ── Best Sellers carousel ─────────────────────────────────────────── */
function initCarousel() {
  const track   = document.querySelector('.carousel-track');
  const prevBtn = document.querySelector('.carousel-btn.prev');
  const nextBtn = document.querySelector('.carousel-btn.next');
  if (!track) return;

  const itemWidth = () => {
    const item = track.querySelector('.carousel-item');
    if (!item) return 240;
    return item.offsetWidth + 18;
  };

  let pos = 0;
  const maxPos = () => {
    const items   = track.querySelectorAll('.carousel-item');
    const visible = Math.floor(track.parentElement.offsetWidth / itemWidth());
    return Math.max(0, (items.length - visible) * itemWidth());
  };

  const slideTo = p => {
    pos = Math.max(0, Math.min(p, maxPos()));
    track.style.transform = `translateX(-${pos}px)`;
  };

  nextBtn?.addEventListener('click', () => slideTo(pos + itemWidth() * 2));
  prevBtn?.addEventListener('click', () => slideTo(pos - itemWidth() * 2));

  let touchStartX = 0;
  track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) slideTo(pos + (diff > 0 ? itemWidth() : -itemWidth()));
  }, { passive: true });

  // Re-observe newly rendered pcard children in carousel
  const carouselObserver = new MutationObserver(() => initScrollReveal());
  carouselObserver.observe(track, { childList: true });
}

/* ── Smooth section anchor scroll ──────────────────────────────────── */
function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ── Section divider sparkle ────────────────────────────────────────  */
function initSectionDividers() {
  document.querySelectorAll('.section-title').forEach(el => {
    if (el.querySelector('.title-line')) return;
    const line = document.createElement('span');
    line.className = 'title-line';
    el.appendChild(line);
  });
}
