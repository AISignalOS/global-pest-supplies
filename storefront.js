/**
 * Global Pest Supplies — storefront renderer
 * Populates the marketing page from the live catalog (catalog.js).
 * Every card links to the real Shopify store (product page + cart permalink).
 */
(function () {
  const $ = sel => document.querySelector(sel);

  // ---- Shop by Pest (tabs) ----
  const PEST_LABELS = {
    ants:'Ants', rodents:'Rodents', cockroaches:'Cockroaches', termites:'Termites',
    mosquitoes:'Mosquitoes', bedbugs:'Bed Bugs', fleas:'Fleas', wasps:'Wasps'
  };

  function renderPest(pest) {
    const grid = $('#pestProductsGrid');
    if (!grid) return;
    const items = byPest(pest);
    grid.innerHTML = items.map(p => productCard(p)).join('');
    const nameEl = $('#pestResultsName');
    if (nameEl) nameEl.textContent = PEST_LABELS[pest] || pest;
    const collBtn = $('#pestShopAll');
    if (collBtn) collBtn.href = collectionUrl(pest);
  }

  function initPestTabs() {
    const tabs = document.querySelectorAll('.pest-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');
        renderPest(tab.dataset.pest);
      });
    });
    const active = document.querySelector('.pest-tab.active') || tabs[0];
    if (active) renderPest(active.dataset.pest);
  }

  // ---- Complete Control Kits ----
  function renderKits() {
    const grid = $('#kitsGrid');
    if (!grid) return;
    const kitHandles = ['gps-bed-bug-kit','gps-ant-kit','gps-roach-kit','gps-rodent-kit','gps-mosquito-kit','gps-pro-starter-bundle'];
    grid.innerHTML = kitHandles.map(h => byHandle(h)).filter(Boolean).map(p => productCard(p)).join('');
  }

  // ---- Best Sellers carousel ----
  function renderBestSellers() {
    const track = $('#bestsellersTrack');
    if (!track) return;
    track.innerHTML = bestSellers().map(p => `<div class="carousel-item">${productCard(p)}</div>`).join('');
  }

  // ---- Pest Control Guides (links to live blog) ----
  function renderGuides() {
    const grid = $('#guidesGrid');
    if (!grid || typeof GUIDES === 'undefined') return;
    grid.innerHTML = GUIDES.map(g => `
      <a class="edu-card" href="${BLOG}/${g.h}">
        <div class="edu-card-body">
          <span class="edu-tag">${g.pest}</span>
          <h4>${g.title}</h4>
          <p>${g.blurb}</p>
          <p style="color:var(--blue-glow);font-weight:600;margin-top:10px;">Read guide →</p>
        </div>
      </a>`).join('');
  }

  document.addEventListener('DOMContentLoaded', () => {
    initPestTabs();
    renderKits();
    renderBestSellers();
    renderGuides();
  });
})();
