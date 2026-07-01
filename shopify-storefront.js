/**
 * Global Pest Supplies — Shopify Headless Layer
 * Storefront API client + animated cart drawer + live product grids
 *
 * SETUP: Paste your token below from:
 *   Shopify Admin → Settings → Apps → Develop apps → GPS Headless
 *   → API credentials → Storefront API access token
 *
 * Without the token the site falls back to catalog.js (static data)
 * and Add-to-Cart links directly to the Shopify cart page.
 */

const SHOPIFY_DOMAIN   = 'global-pest-supplies.myshopify.com';
const STOREFRONT_TOKEN = 'YOUR_STOREFRONT_TOKEN'; // ← paste token here
const API_VERSION      = '2025-07';
const SF_URL           = `https://${SHOPIFY_DOMAIN}/api/${API_VERSION}/graphql.json`;

const TOKEN_READY = STOREFRONT_TOKEN && STOREFRONT_TOKEN !== 'YOUR_STOREFRONT_TOKEN';

/* ── GraphQL helper ────────────────────────────────────────────────── */
async function sfFetch(query, variables = {}) {
  if (!TOKEN_READY) return null;
  try {
    const res = await fetch(SF_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': STOREFRONT_TOKEN,
      },
      body: JSON.stringify({ query, variables }),
    });
    const { data, errors } = await res.json();
    if (errors?.length) console.warn('[GPS] Storefront API:', errors.map(e => e.message).join(', '));
    return data ?? null;
  } catch (e) {
    console.warn('[GPS] Storefront API unavailable — using catalog fallback.');
    return null;
  }
}

/* ── Cart state ────────────────────────────────────────────────────── */
let gpsCartId = localStorage.getItem('gps_cart_id') || null;
let gpsCart   = null;

const variantGid = id => `gid://shopify/ProductVariant/${id}`;

const CART_FRAGMENT = `
  fragment CartData on Cart {
    id checkoutUrl
    cost { subtotalAmount { amount currencyCode } }
    lines(first: 30) {
      nodes {
        id quantity
        cost { totalAmount { amount } }
        merchandise {
          ... on ProductVariant {
            id
            product { title handle }
            title price { amount }
            image { url altText }
          }
        }
      }
    }
  }`;

async function cartCreate(variantId, qty = 1) {
  const data = await sfFetch(`
    ${CART_FRAGMENT}
    mutation ($lines: [CartLineInput!]!) {
      cartCreate(input: { lines: $lines }) {
        cart { ...CartData }
        userErrors { message }
      }
    }`, { lines: [{ merchandiseId: variantGid(variantId), quantity: qty }] });
  return data?.cartCreate?.cart ?? null;
}

async function cartAdd(variantId, qty = 1) {
  const data = await sfFetch(`
    ${CART_FRAGMENT}
    mutation ($cartId: ID!, $lines: [CartLineInput!]!) {
      cartLinesAdd(cartId: $cartId, lines: $lines) {
        cart { ...CartData }
        userErrors { message }
      }
    }`, { cartId: gpsCartId, lines: [{ merchandiseId: variantGid(variantId), quantity: qty }] });
  return data?.cartLinesAdd?.cart ?? null;
}

async function cartUpdateQty(lineId, qty) {
  if (qty < 1) {
    const data = await sfFetch(`
      ${CART_FRAGMENT}
      mutation ($cartId: ID!, $lineIds: [ID!]!) {
        cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
          cart { ...CartData }
        }
      }`, { cartId: gpsCartId, lineIds: [lineId] });
    return data?.cartLinesRemove?.cart ?? null;
  }
  const data = await sfFetch(`
    ${CART_FRAGMENT}
    mutation ($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
      cartLinesUpdate(cartId: $cartId, lines: $lines) {
        cart { ...CartData }
      }
    }`, { cartId: gpsCartId, lines: [{ id: lineId, quantity: qty }] });
  return data?.cartLinesUpdate?.cart ?? null;
}

/* ── Global addToCart ── called by product card buttons ────────────── */
window.addToCart = async function (variantId, btnEl) {
  if (!TOKEN_READY) {
    window.location.href = `https://${SHOPIFY_DOMAIN}/cart/${variantId}:1`;
    return;
  }
  if (btnEl) { btnEl.textContent = 'Adding…'; btnEl.disabled = true; }

  const cart = gpsCartId ? await cartAdd(variantId) : await cartCreate(variantId);

  if (cart) {
    gpsCart   = cart;
    gpsCartId = cart.id;
    localStorage.setItem('gps_cart_id', gpsCartId);
    updateCartCount();
    renderCartDrawer();
    openCartDrawer();
  }

  if (btnEl) {
    btnEl.textContent = '✓ Added!';
    btnEl.style.background = '#16a34a';
    setTimeout(() => {
      btnEl.textContent = 'Add to Cart';
      btnEl.style.background = '';
      btnEl.disabled = false;
    }, 1800);
  }
};

window.changeQty = async function (lineId, qty) {
  const cart = await cartUpdateQty(lineId, qty);
  if (cart) {
    gpsCart = cart;
    updateCartCount();
    renderCartDrawer();
  }
};

/* ── Cart drawer DOM ───────────────────────────────────────────────── */
function buildCartDrawer() {
  const overlay = document.createElement('div');
  overlay.className = 'cart-overlay';
  overlay.id = 'cartOverlay';
  overlay.addEventListener('click', closeCartDrawer);

  const drawer = document.createElement('aside');
  drawer.className = 'cart-drawer';
  drawer.id = 'cartDrawer';
  drawer.setAttribute('aria-label', 'Shopping cart');
  drawer.innerHTML = `
    <div class="cart-drawer-header">
      <div class="cart-drawer-title">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/>
          <path d="M16 10a4 4 0 01-8 0"/>
        </svg>
        <h3>Your Cart</h3>
      </div>
      <button class="cart-close" id="cartClose" aria-label="Close cart">✕</button>
    </div>
    <div class="cart-items" id="cartItems">
      <div class="cart-empty" id="cartEmpty">
        <div class="cart-empty-icon">🛒</div>
        <p>Your cart is empty</p>
        <p class="cart-empty-sub">Find the right product for your pest problem</p>
        <button class="btn-outline-blue" style="margin-top:16px;" onclick="closeCartDrawer();document.getElementById('pest-finder')?.scrollIntoView({behavior:'smooth'})">
          Find Your Pest →
        </button>
      </div>
    </div>
    <div class="cart-footer" id="cartFooter">
      <div class="cart-ship-progress">
        <div class="cart-ship-track"><div class="cart-ship-fill" id="cartShipFill"></div></div>
        <p class="cart-ship-msg" id="cartShipMsg"></p>
      </div>
      <div class="cart-subtotal">
        <span>Subtotal</span>
        <span id="cartSubtotal">$0.00</span>
      </div>
      <p class="cart-note">Shipping calculated at checkout · Free on orders $75+</p>
      <button class="btn-primary cart-checkout-btn" id="cartCheckout">
        Proceed to Checkout →
      </button>
      <div class="cart-secure">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
        </svg>
        Secure checkout powered by Shopify
      </div>
    </div>`;

  document.body.appendChild(overlay);
  document.body.appendChild(drawer);

  document.getElementById('cartClose')?.addEventListener('click', closeCartDrawer);
  document.getElementById('cartCheckout')?.addEventListener('click', () => {
    if (gpsCart?.checkoutUrl) window.location.href = gpsCart.checkoutUrl;
    else window.location.href = `https://${SHOPIFY_DOMAIN}/cart`;
  });
}

function openCartDrawer() {
  document.getElementById('cartDrawer')?.classList.add('open');
  document.getElementById('cartOverlay')?.classList.add('open');
  document.body.style.overflow = 'hidden';
}

window.closeCartDrawer = function () {
  document.getElementById('cartDrawer')?.classList.remove('open');
  document.getElementById('cartOverlay')?.classList.remove('open');
  document.body.style.overflow = '';
};

function updateCartCount() {
  const count  = gpsCart?.lines?.nodes?.reduce((s, l) => s + l.quantity, 0) || 0;
  const badge  = document.getElementById('cartCount');
  if (!badge) return;
  badge.textContent = count;
  badge.style.display = count > 0 ? 'flex' : 'none';
  if (count > 0) badge.classList.add('pop');
  setTimeout(() => badge.classList.remove('pop'), 400);
}

const FREE_SHIPPING_THRESHOLD = 75;

function updateShipProgress() {
  const fill = document.getElementById('cartShipFill');
  const msg  = document.getElementById('cartShipMsg');
  if (!fill || !msg) return;
  const sub = parseFloat(gpsCart?.cost?.subtotalAmount?.amount || 0);
  const pct = Math.min(100, (sub / FREE_SHIPPING_THRESHOLD) * 100);
  fill.style.width = pct + '%';
  msg.textContent = sub >= FREE_SHIPPING_THRESHOLD
    ? "🎉 You've unlocked FREE shipping!"
    : `You're $${(FREE_SHIPPING_THRESHOLD - sub).toFixed(2)} away from FREE shipping!`;
}

function renderCartDrawer() {
  const container = document.getElementById('cartItems');
  const emptyEl   = document.getElementById('cartEmpty');
  const footer    = document.getElementById('cartFooter');
  const subtotal  = document.getElementById('cartSubtotal');
  if (!container) return;

  const lines = gpsCart?.lines?.nodes || [];
  const fmt   = v => '$' + parseFloat(v || 0).toFixed(2);
  updateShipProgress();

  if (!lines.length) {
    if (emptyEl) emptyEl.style.display = '';
    if (footer)  footer.classList.remove('visible');
    return;
  }

  if (emptyEl) emptyEl.style.display = 'none';
  if (footer)  footer.classList.add('visible');
  if (subtotal) subtotal.textContent = fmt(gpsCart?.cost?.subtotalAmount?.amount);

  const linesHTML = lines.map(line => {
    const m       = line.merchandise;
    const img     = m.image?.url;
    const variant = m.title !== 'Default Title' ? ` <span class="line-variant">${m.title}</span>` : '';
    return `
      <div class="cart-line" data-line="${line.id}">
        <div class="cart-line-img">
          ${img
            ? `<img src="${img}" alt="${m.product.title}" width="72" height="72">`
            : '<div class="cart-line-placeholder">📦</div>'}
        </div>
        <div class="cart-line-info">
          <p class="cart-line-name">${m.product.title}${variant}</p>
          <p class="cart-line-unit">${fmt(m.price.amount)} each</p>
          <div class="cart-line-controls">
            <button class="qty-btn" onclick="changeQty('${line.id}', ${line.quantity - 1})" aria-label="Decrease">−</button>
            <span class="qty-num">${line.quantity}</span>
            <button class="qty-btn" onclick="changeQty('${line.id}', ${line.quantity + 1})" aria-label="Increase">+</button>
            <button class="cart-remove-btn" onclick="changeQty('${line.id}', 0)">Remove</button>
          </div>
        </div>
        <div class="cart-line-total">${fmt(line.cost.totalAmount.amount)}</div>
      </div>`;
  }).join('');

  container.innerHTML = linesHTML;
}

/* ── Hook nav cart button to open drawer ───────────────────────────── */
function hookNavCart() {
  const btn = document.querySelector('.nav-cart');
  if (!btn) return;
  btn.addEventListener('click', e => {
    e.preventDefault();
    openCartDrawer();
  });
}

/* ── Live product grid hydration from Storefront API ──────────────── */
const fmt = n => '$' + parseFloat(n).toFixed(2);

function liveCard(p) {
  const price  = parseFloat(p.priceRange.minVariantPrice.amount);
  const wasAmt = parseFloat(p.compareAtPriceRange?.minVariantPrice?.amount || 0);
  const was    = wasAmt > price ? wasAmt : null;
  const vid    = p.variants.nodes[0]?.id?.split('/').pop() || '';
  const img    = p.images.nodes[0]?.url || '';
  const best   = p.tags?.includes('best-seller') || p.tags?.includes('Best Seller');

  return `
  <article class="pcard">
    <a class="pcard-img" href="https://${SHOPIFY_DOMAIN}/products/${p.handle}" aria-label="${p.title}">
      ${best ? '<span class="pcard-badge">Best Seller</span>' : ''}
      ${was ? `<span class="pcard-save">Save ${fmt(was - price)}</span>` : ''}
      ${img
        ? `<img src="${img}" alt="${p.title}" loading="lazy" width="300" height="300">`
        : '<span style="font-size:2.5rem;color:var(--text-muted)">📦</span>'}
    </a>
    <div class="pcard-body">
      <a class="pcard-name" href="https://${SHOPIFY_DOMAIN}/products/${p.handle}">${p.title}</a>
      <div class="pcard-foot">
        <div class="pcard-price">
          ${fmt(price)}${was ? `<span class="pcard-was">${fmt(was)}</span>` : ''}
        </div>
        <button class="btn-shop" onclick="addToCart('${vid}', this)">Add to Cart</button>
      </div>
    </div>
  </article>`;
}

async function fetchCollection(handle, limit = 10) {
  const data = await sfFetch(`
    query ($handle: String!, $n: Int!) {
      collection(handle: $handle) {
        products(first: $n, sortKey: BEST_SELLING) {
          nodes {
            id title handle tags
            priceRange { minVariantPrice { amount } }
            compareAtPriceRange { minVariantPrice { amount } }
            images(first: 1) { nodes { url altText } }
            variants(first: 1) { nodes { id } }
          }
        }
      }
    }`, { handle, n: limit });
  return data?.collection?.products?.nodes ?? null;
}

async function hydrateGrids() {
  if (!TOKEN_READY) return;

  const [bestSellers, kits] = await Promise.all([
    fetchCollection('best-sellers', 10),
    fetchCollection('diy-kits', 6),
  ]);

  const bsTrack = document.getElementById('bestsellersTrack');
  if (bsTrack && bestSellers?.length) {
    bsTrack.innerHTML = bestSellers.map(p => `<div class="carousel-item">${liveCard(p)}</div>`).join('');
  }

  const kitsGrid = document.getElementById('kitsGrid');
  if (kitsGrid && kits?.length) {
    kitsGrid.innerHTML = kits.map(p => liveCard(p)).join('');
  }
}

/* ── Boot ──────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  buildCartDrawer();
  hookNavCart();
  updateCartCount();
  hydrateGrids();
});
