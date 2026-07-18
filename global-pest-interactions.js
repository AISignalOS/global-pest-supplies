/**
 * Global Pest Supplies — Command Center interactions (homepage)
 * Kit loadout rendering · product-card tilt · pest-console readout ·
 * hero ticker · footer newsletter. Loads after catalog.js/storefront.js.
 *
 * To add or edit a kit shown in "Complete Control Kits", update
 * KITS_META below (contents/difficulty text) — pricing, images and
 * cart links always come from the live catalog (catalog.js).
 */
(function () {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarse = window.matchMedia('(pointer: coarse)').matches;

  /* ── Mission-kit metadata (display only — keep claims modest) ── */
  const KITS_META = {
    'gps-ant-kit':            { target: 'Ants',        icon: '🐜', difficulty: 1, coverage: 'Indoor + perimeter',        includes: ['Perimeter spray', 'Ant gel bait', '12 bait stations', 'Step-by-step plan'] },
    'gps-roach-kit':          { target: 'Cockroaches', icon: '🪳', difficulty: 2, coverage: 'Kitchen & bath zones',      includes: ['Gel bait', 'Insecticide dust', 'IGR', 'Monitors'] },
    'gps-rodent-kit':         { target: 'Rodents',     icon: '🐭', difficulty: 2, coverage: 'Whole-home defense',        includes: ['Bait stations', 'Bait blocks', 'Snap traps', 'Glue boards', 'Placement map'] },
    'gps-mosquito-kit':       { target: 'Mosquitoes',  icon: '🦟', difficulty: 1, coverage: 'Yard + standing water',     includes: ['Barrier spray', 'Bti larvicide dunks', 'Pump sprayer'] },
    'gps-bed-bug-kit':        { target: 'Bed Bugs',    icon: '🛏️', difficulty: 3, coverage: 'Full-room treatment',       includes: ['Contact spray', 'Insecticide dust', 'Aerosol', 'Encasements'] },
    'gps-pro-starter-bundle': { target: 'All pests',   icon: '🧰', difficulty: 3, coverage: 'Pro route starter',         includes: ['Pro concentrate', 'Baits & dusts', 'Application equipment', 'Route essentials'] },
  };
  const DIFFICULTY_LABEL = { 1: 'Easy', 2: 'Moderate', 3: 'Advanced' };

  function difficultyMeter(level) {
    let dots = '';
    for (let i = 1; i <= 3; i++) dots += `<i class="${i <= level ? 'on' : ''}"></i>`;
    return `<span class="kit-difficulty" aria-hidden="true">${dots}</span>`;
  }

  function kitCard(p, meta) {
    const savePct = p.bundleValue ? Math.round((p.bundleValue - p.price) / p.bundleValue * 100) : 0;
    return `
    <article class="kit-loadout-card">
      <div class="kit-head">
        <span>${meta.icon} Mission Kit</span>
        <span class="kit-target">Target: ${meta.target}</span>
      </div>
      <a class="kit-media" href="${p.url}" aria-label="${p.name}">
        ${savePct > 0 ? `<span class="kit-save-flag">Save ${savePct}%</span>` : ''}
        <img src="${p.img}" alt="${p.name} — complete ${meta.target.toLowerCase()} control kit" loading="lazy" width="150" height="150">
      </a>
      <div class="kit-body">
        <h3><a href="${p.url}">${p.name}</a></h3>
        <div class="kit-specs">
          <span><strong>Difficulty:</strong> ${DIFFICULTY_LABEL[meta.difficulty]} ${difficultyMeter(meta.difficulty)}</span>
          <span><strong>Coverage:</strong> ${meta.coverage}</span>
        </div>
        <div class="kit-includes">
          <div>
            <ul aria-label="What's included">
              ${meta.includes.map(item => `<li>${item}</li>`).join('')}
            </ul>
          </div>
        </div>
        <div class="kit-foot">
          <div>
            <span class="kit-price-now">${money(p.price)}</span>
            ${p.was > p.price ? `<span class="kit-price-was">${money(p.was)}</span>` : ''}
          </div>
          <button class="btn-shop" onclick="addToCart('${p.v}', this)">Add to Cart</button>
        </div>
      </div>
    </article>`;
  }

  function renderKitsLoadout() {
    const grid = document.getElementById('kitsLoadout');
    if (!grid || typeof byHandle !== 'function') return;
    grid.innerHTML = Object.keys(KITS_META)
      .map(h => ({ p: byHandle(h), meta: KITS_META[h] }))
      .filter(x => x.p)
      .map(x => kitCard(x.p, x.meta))
      .join('');
    // pick up the fresh cards for scroll-reveal (main.js exposes it)
    if (typeof initScrollReveal === 'function') initScrollReveal();
  }

  /* ── Pest console readout (hover/focus mini info line) ───────── */
  const PEST_INFO = {
    ants:        'Bait-first strategy — foragers carry it to the colony',
    rodents:     'Stations + traps + exclusion for lasting control',
    cockroaches: 'Gel bait + IGR wipes out the next generation too',
    termites:    'Monitor, bait and treat galleries directly',
    mosquitoes:  'Treat adults and larvae at the same time',
    bedbugs:     'Disciplined multi-step room treatment',
    fleas:       'IGR breaks the flea life cycle for months',
    wasps:       'Knockdown from a safe distance',
  };

  function initConsoleReadout() {
    const readout = document.getElementById('pfReadout');
    if (!readout) return;
    const idle = 'Select a pest to scan available solutions';
    readout.textContent = idle;
    document.querySelectorAll('.pf-tiles .pest-tab').forEach(tab => {
      const show = () => { readout.textContent = PEST_INFO[tab.dataset.pest] || idle; };
      const hide = () => {
        const active = document.querySelector('.pf-tiles .pest-tab.active');
        readout.textContent = active ? (PEST_INFO[active.dataset.pest] || idle) : idle;
      };
      tab.addEventListener('mouseenter', show, { passive: true });
      tab.addEventListener('focus', show);
      tab.addEventListener('mouseleave', hide, { passive: true });
      tab.addEventListener('blur', hide);
      tab.addEventListener('click', show);
    });
  }

  /* ── Product-card tilt parallax (desktop only, very subtle) ──── */
  function initCardTilt() {
    if (coarse || reduceMotion) return;
    document.addEventListener('pointermove', e => {
      const card = e.target.closest && e.target.closest('.pcard');
      if (!card) return;
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `translateY(-5px) perspective(700px) rotateY(${px * 4}deg) rotateX(${py * -3}deg)`;
    }, { passive: true });
    document.addEventListener('pointerout', e => {
      const card = e.target.closest && e.target.closest('.pcard');
      if (card && !card.contains(e.relatedTarget)) card.style.transform = '';
    }, { passive: true });
  }

  /* ── Hero ticker: duplicate the track once for a seamless loop ─ */
  function initTicker() {
    const track = document.querySelector('.hero-ticker-track');
    if (!track) return;
    track.innerHTML += track.innerHTML;
  }

  /* ── Footer newsletter (demo submit — swap for Shopify form) ─── */
  function initNewsletter() {
    const form = document.getElementById('footerNewsletter');
    if (!form) return;
    form.addEventListener('submit', e => {
      e.preventDefault();
      const email = form.querySelector('input[type="email"]');
      if (!email || !email.value) return;
      form.innerHTML = '<p class="newsletter-success" role="status">✓ You\'re on the list — pest guides & offers are on the way.</p>';
    });
  }

  /* ── Pause hero animations while it's scrolled out of view ───── */
  function initHeroAnimationPause() {
    const hero = document.querySelector('.hero');
    if (!hero || typeof IntersectionObserver === 'undefined') return;
    new IntersectionObserver(([entry]) => {
      hero.classList.toggle('anim-paused', !entry.isIntersecting);
    }, { threshold: 0 }).observe(hero);
  }

  document.addEventListener('DOMContentLoaded', () => {
    renderKitsLoadout();
    initConsoleReadout();
    initCardTilt();
    initTicker();
    initNewsletter();
    initHeroAnimationPause();
  });
})();
