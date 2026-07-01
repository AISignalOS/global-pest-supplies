/**
 * Global Pest Supplies — Pest Finder wizard (modal)
 * Recommends REAL catalog products (from catalog.js) and links straight
 * into the live Shopify store (product pages + cart permalinks).
 * Homepage "Shop by Pest" tabs are handled in storefront.js.
 */

let wizardState = { step: 1, pest: null, severity: null, location: null };

const SEVERITY_LABEL = { mild: 'mild', moderate: 'moderate', severe: 'severe' };

const isKit = p => /-kit$|bundle|bait-system/.test(p.h);

/* Build a real-product recommendation for a pest + severity + location */
function recommend(pest, severity, location) {
  let pool = byPest(pest).slice();
  if (!pool.length) return [];

  const kit = pool.find(isKit);
  const singles = pool.filter(p => !isKit(p));

  // location preference: indoor favours baits/dust, outdoor favours concentrates/granules
  const score = p => {
    let s = 0;
    if (location === 'outdoor' && /concentrate|granular|yard|larvicide|wasp/.test(p.h)) s += 2;
    if (location === 'indoor' && /gel-bait|dust|station|trap|glue|spray/.test(p.h)) s += 2;
    if (p.best) s += 1;
    return s;
  };
  singles.sort((a, b) => score(b) - score(a) || a.price - b.price);

  const out = [];
  if (severity !== 'mild' && kit) out.push(kit);
  const want = severity === 'severe' ? 4 : severity === 'moderate' ? 3 : 3;
  for (const p of singles) {
    if (out.length >= want) break;
    if (!out.includes(p)) out.push(p);
  }
  if (out.length < 2 && kit && !out.includes(kit)) out.unshift(kit);
  return out.slice(0, 4);
}

document.addEventListener('DOMContentLoaded', initFinder);

function initFinder() {
  const overlay = document.getElementById('finderOverlay');
  const closeBtn = document.getElementById('finderClose');

  document.querySelectorAll('[data-open-finder]').forEach(btn =>
    btn.addEventListener('click', openFinder));

  closeBtn?.addEventListener('click', closeFinder);
  overlay?.addEventListener('click', e => { if (e.target === overlay) closeFinder(); });

  document.querySelectorAll('.finder-pest-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.finder-pest-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      wizardState.pest = btn.dataset.pest;
    });
  });
  document.querySelectorAll('[data-severity]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-severity]').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      wizardState.severity = btn.dataset.severity;
    });
  });
  document.querySelectorAll('[data-location]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-location]').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      wizardState.location = btn.dataset.location;
    });
  });
}

function openFinder() {
  wizardState = { step: 1, pest: null, severity: null, location: null };
  document.querySelectorAll('.finder-pest-btn,[data-severity],[data-location]').forEach(b => b.classList.remove('selected'));
  setStep(1);
  document.getElementById('finderOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeFinder() {
  document.getElementById('finderOverlay').classList.remove('open');
  document.body.style.overflow = '';
}
function setStep(step) {
  wizardState.step = step;
  document.querySelectorAll('.finder-step').forEach(s => s.classList.remove('active'));
  document.getElementById(`finderStep${step}`)?.classList.add('active');
  document.querySelectorAll('.progress-dot').forEach((dot, i) => dot.classList.toggle('active', i < step));
}
function nextStep() {
  const step = wizardState.step;
  if (step === 1 && !wizardState.pest) { alert('Please select a pest first.'); return; }
  if (step === 2 && !wizardState.severity) { alert('Please select a severity level.'); return; }
  if (step === 3) {
    if (!wizardState.location) { alert('Please select a location.'); return; }
    showResults();
    return;
  }
  setStep(step + 1);
}
function prevStep() { if (wizardState.step > 1) setStep(wizardState.step - 1); }

function showResults() {
  const pestName = { ants:'Ants', rodents:'Rodents', cockroaches:'Cockroaches', termites:'Termites',
    mosquitoes:'Mosquitoes', bedbugs:'Bed Bugs', fleas:'Fleas', wasps:'Wasps' }[wizardState.pest] || wizardState.pest;
  const severity = wizardState.severity || 'moderate';
  const items = recommend(wizardState.pest, severity, wizardState.location);

  document.getElementById('finderResultTitle').textContent = `Recommended for ${pestName} — ${SEVERITY_LABEL[severity]} infestation`;
  document.getElementById('finderResultDesc').textContent =
    `Based on your answers, here is the ${wizardState.location === 'both' ? 'indoor + outdoor' : wizardState.location} plan our experts recommend. Add to cart to check out securely on our store.`;

  const container = document.getElementById('finderProducts');
  container.innerHTML = items.map(p => `
    <div class="finder-product-row">
      <div class="finder-product-emoji"><img src="${p.img}" alt="${p.name}" style="width:100%;height:100%;object-fit:contain;border-radius:8px;background:#fff;"></div>
      <div class="finder-product-info">
        <div class="finder-product-name"><a href="${p.url}" style="color:inherit;">${p.name}</a></div>
        <div class="finder-product-sub">${p.blurb}</div>
      </div>
      <span class="finder-product-price">${money(p.price)}</span>
      <a class="btn-primary" style="padding:8px 16px;font-size:0.8rem;" href="${p.cart}">Add to Cart</a>
    </div>
  `).join('');

  setStep(4);
}
