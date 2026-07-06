/**
 * Global Pest Supplies — Shared Shell
 * Injects nav + footer + cart drawer into every inner page.
 * Load before main.js and shopify-storefront.js.
 */

const GPS_LOGO_SVG = `
<svg width="36" height="36" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="ng2" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#1a3a6e"/>
      <stop offset="100%" stop-color="#0a1628"/>
    </radialGradient>
  </defs>
  <circle cx="100" cy="100" r="80" fill="url(#ng2)" stroke="#1E6BFF" stroke-width="2"/>
  <ellipse cx="100" cy="100" rx="80" ry="22" fill="none" stroke="#1E6BFF" stroke-width="1" opacity="0.5"/>
  <line x1="20" y1="100" x2="180" y2="100" stroke="#1E6BFF" stroke-width="1" opacity="0.4"/>
  <line x1="100" y1="20" x2="100" y2="180" stroke="#1E6BFF" stroke-width="1" opacity="0.4"/>
  <ellipse cx="100" cy="100" rx="35" ry="80" fill="none" stroke="#1E6BFF" stroke-width="1" opacity="0.35"/>
  <circle cx="100" cy="100" r="22" fill="none" stroke="#1E6BFF" stroke-width="2.5"/>
  <line x1="78" y1="100" x2="90" y2="100" stroke="#1E6BFF" stroke-width="3"/>
  <line x1="110" y1="100" x2="122" y2="100" stroke="#1E6BFF" stroke-width="3"/>
  <line x1="100" y1="78" x2="100" y2="90" stroke="#1E6BFF" stroke-width="3"/>
  <line x1="100" y1="110" x2="100" y2="122" stroke="#1E6BFF" stroke-width="3"/>
  <circle cx="100" cy="100" r="5" fill="#1E6BFF"/>
  <circle cx="52" cy="72" r="4" fill="#3A8AFF" opacity="0.9"/>
  <circle cx="148" cy="66" r="4" fill="#3A8AFF" opacity="0.9"/>
  <circle cx="132" cy="132" r="4" fill="#3A8AFF" opacity="0.9"/>
</svg>`;

const GPS_NAV_HTML = `
<div class="scroll-progress" id="scrollProgress"></div>
<div class="cursor-glow" id="cursorGlow" aria-hidden="true"></div>
<div class="announce-bar">
  Free shipping on orders $75+ &nbsp;·&nbsp; Use code <strong>WELCOME10</strong> for 10% off your first order
</div>
<nav class="nav" role="navigation" aria-label="Main">
  <div class="nav-inner">
    <a href="index.html" class="nav-logo" aria-label="Global Pest Supplies Home">
      ${GPS_LOGO_SVG}
      <div class="nav-logo-text">
        <span class="brand-main">GLOBAL</span>
        <span class="brand-sub">PEST SUPPLIES</span>
      </div>
    </a>

    <ul class="nav-links">
      <li class="has-dropdown">
        <a href="shop-by-pest.html">Shop by Pest <span class="dropdown-arrow">▾</span></a>
        <div class="nav-dropdown">
          <a href="shop-by-pest.html?pest=ants">🐜 Ants</a>
          <a href="shop-by-pest.html?pest=cockroaches">🪳 Cockroaches</a>
          <a href="shop-by-pest.html?pest=rodents">🐭 Rodents</a>
          <a href="shop-by-pest.html?pest=termites">🪲 Termites</a>
          <a href="shop-by-pest.html?pest=mosquitoes">🦟 Mosquitoes</a>
          <a href="shop-by-pest.html?pest=bedbugs">🛏️ Bed Bugs</a>
          <a href="shop-by-pest.html?pest=fleas">🐾 Fleas &amp; Ticks</a>
          <a href="shop-by-pest.html?pest=wasps">🐝 Wasps &amp; Spiders</a>
        </div>
      </li>
      <li class="has-dropdown">
        <a href="products.html">Products <span class="dropdown-arrow">▾</span></a>
        <div class="nav-dropdown">
          <a href="products.html">All Products</a>
          <a href="diy-kits.html">DIY Kits</a>
          <a href="best-sellers.html">⭐ Best Sellers</a>
          <a href="professionals.html">Professional Supplies</a>
        </div>
      </li>
      <li><a href="professionals.html">Professional</a></li>
      <li><a href="learn.html">Learn</a></li>
    </ul>

    <div class="nav-right">
      <button class="pro-toggle" id="proToggleBtn" title="Demo: switch between a DIY and a licensed Professional account">👤 DIY</button>
      <a href="account.html" class="nav-account" aria-label="Account">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
        Account
      </a>
      <a href="#" class="nav-cart" id="navCartBtn" aria-label="Open cart">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
          <line x1="3" y1="6" x2="21" y2="6"/>
          <path d="M16 10a4 4 0 01-8 0"/>
        </svg>
        Cart
        <span class="cart-count-badge" id="cartCount" style="display:none;">0</span>
      </a>
      <button class="nav-hamburger" aria-label="Menu">
        <span></span><span></span><span></span>
      </button>
    </div>
  </div>
</nav>`;

const GPS_FOOTER_HTML = `
<footer class="footer">
  <div class="container">
    <div class="footer-grid">
      <div class="footer-brand">
        <a href="index.html" class="nav-logo" style="margin-bottom:0;">
          ${GPS_LOGO_SVG}
          <div class="nav-logo-text">
            <span class="brand-main">GLOBAL</span>
            <span class="brand-sub">PEST SUPPLIES</span>
          </div>
        </a>
        <p>Professional pest control solutions for homeowners and licensed exterminators worldwide.</p>
        <div class="footer-socials">
          <a href="#" class="social-icon" aria-label="Facebook">f</a>
          <a href="#" class="social-icon" aria-label="Instagram">ig</a>
          <a href="#" class="social-icon" aria-label="YouTube">yt</a>
          <a href="#" class="social-icon" aria-label="LinkedIn">in</a>
        </div>
      </div>
      <div class="footer-col">
        <h5>Shop</h5>
        <ul>
          <li><a href="products.html">All Products</a></li>
          <li><a href="diy-kits.html">DIY Kits</a></li>
          <li><a href="best-sellers.html">Best Sellers</a></li>
          <li><a href="shop-by-pest.html">Shop by Pest</a></li>
          <li><a href="professionals.html">Professional Supplies</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h5>Learn</h5>
        <ul>
          <li><a href="learn.html">Pest Control Guides</a></li>
          <li><a href="learn.html?pest=ants">Ant Control</a></li>
          <li><a href="learn.html?pest=rodents">Rodent Control</a></li>
          <li><a href="learn.html?pest=termites">Termite Prevention</a></li>
          <li><a href="newsletter.html">Newsletter</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h5>Support</h5>
        <ul>
          <li><a href="https://global-pest-supplies.myshopify.com/pages/contact">Contact Us</a></li>
          <li><a href="https://global-pest-supplies.myshopify.com/pages/shipping-policy">Shipping Policy</a></li>
          <li><a href="https://global-pest-supplies.myshopify.com/pages/returns-refunds">Returns &amp; Refunds</a></li>
          <li><a href="https://global-pest-supplies.myshopify.com/policies/privacy-policy">Privacy Policy</a></li>
          <li><a href="account.html">My Account</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-safety" style="margin-top:28px;margin-bottom:0;">
      <span aria-hidden="true">⚠️</span>
      <span><strong>Product safety:</strong> Always read and follow label directions. Use pest control products only as directed, store them away from children and pets, and check your state's regulations before purchasing restricted items.</span>
    </div>
    <div class="footer-bottom">
      <p>© 2026 Global Pest Supplies. All rights reserved. | EPA Licensed Distributor</p>
      <div class="footer-phone">📞 <strong>1-800-123-4567</strong> | Mon–Fri 8am–6pm EST</div>
    </div>
  </div>
</footer>`;

(function () {
  /* Inject announce bar + nav before first element */
  const navWrapper = document.createElement('div');
  navWrapper.innerHTML = GPS_NAV_HTML;
  document.body.insertBefore(navWrapper, document.body.firstChild);

  /* Pest-radar cursor on inner pages (decorative; script no-ops on
     touch devices and for prefers-reduced-motion) */
  if (!document.querySelector('script[src="custom-cursor.js"]')) {
    const cursorScript = document.createElement('script');
    cursorScript.src = 'custom-cursor.js';
    cursorScript.defer = true;
    document.head.appendChild(cursorScript);
  }

  /* Inject footer at end — deferred to DOMContentLoaded because this
     script runs immediately after <body> opens, before the rest of the
     page's markup exists; appending now would place the footer right
     after the nav instead of at the true end of the page. */
  document.addEventListener('DOMContentLoaded', () => {
    const footerWrapper = document.createElement('div');
    footerWrapper.innerHTML = GPS_FOOTER_HTML;
    document.body.appendChild(footerWrapper);
  });

  /* Mark active nav link */
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href') || '';
    if (href === path || (path === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });

  /* Nav dropdown hover */
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.has-dropdown').forEach(li => {
      const dropdown = li.querySelector('.nav-dropdown');
      if (!dropdown) return;
      li.addEventListener('mouseenter', () => dropdown.classList.add('open'));
      li.addEventListener('mouseleave', () => dropdown.classList.remove('open'));
    });
  });

  /* Demo Pro/DIY account toggle — unlocks Professional-tier products
     and wholesale pricing (see isProUser/setProUser in catalog.js) */
  document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('proToggleBtn');
    if (!btn || typeof isProUser !== 'function') return;
    const render = () => {
      const pro = isProUser();
      btn.textContent = pro ? '🏢 Pro' : '👤 DIY';
      btn.classList.toggle('active', pro);
    };
    btn.addEventListener('click', () => {
      setProUser(!isProUser());
      location.reload();
    });
    render();
  });
})();
