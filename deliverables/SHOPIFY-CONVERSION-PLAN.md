# Command Center Redesign → Shopify Conversion Plan

The redesign was built in the static prototype (`index.html` + assets) because
that is what this repo's homepage is. This document maps every prototype
component to the Liquid theme in `themes/gps-pro/` so the same design can be
carried onto the live store. **Nothing here has been pushed to the live theme.**
Publishing still follows the CLAUDE.md workflow: user runs
`shopify theme pull` / `dev` / `push` after review.

## Asset mapping

| Prototype file | Theme target | Notes |
|---|---|---|
| `styles.css` (`:root` + `[data-theme="light"]` token blocks) | `assets/gps-tokens.css` | Copy both token blocks verbatim; load in `layout/theme.liquid` before other CSS. |
| `global-pest-animations.css` | `assets/global-pest-animations.css` | Section styles; loaded per-section with `{{ 'global-pest-animations.css' | asset_url | stylesheet_tag }}` or split per section for lazy CSS. |
| `global-pest-interactions.js` | `assets/global-pest-interactions.js` | Drop the `KITS_META` JS object — in Liquid, kit metadata should come from block settings or product metafields (`custom.kit_includes`, `custom.difficulty`, `custom.coverage`). |
| `custom-cursor.css` / `custom-cursor.js` | `assets/custom-cursor.{css,js}` | Load with `defer` in `theme.liquid`; behavior is identical (touch + reduced-motion guarded). |
| `theme-toggle.js` | inline `<script>` in `layout/theme.liquid` `<head>` | Must stay synchronous & pre-paint. Toggle button injects into the header; alternatively render the button in `sections/header.liquid` and keep only the init/apply logic inline. |

## Section mapping

| Prototype section | New Liquid section | Data source |
|---|---|---|
| Hero command center (globe, radar sweep, kicker, ticker, pest chips, trust bullets) | `sections/interactive-hero-command-center.liquid` | Settings: heading, subheading, 2 CTA buttons (label+link), trust bullets (blocks), ticker items (blocks), pest chips (blocks: label, emoji, collection link). Globe SVG inlined in the section. |
| Command paths strip | part of hero section or `sections/collection-links.liquid` re-skin | 5 blocks: icon, label, description, link. |
| Pest finder console (radar + tiles + results grid) | `sections/pest-finder-radar.liquid` | Blocks = pest categories: emoji, label, caption, collection handle, readout line. Results grid renders `collections[block.settings.collection].products` (first 8) via the product card snippet; "Shop the full collection" links to the collection URL. Tile switching = the same vanilla JS, fetching Section Rendering API (`/collections/X?section_id=...`) instead of the local catalog. |
| Best sellers carousel | `sections/featured-products-command-grid.liquid` | Setting: collection picker (default `best-sellers`). Carousel JS from `main.js` (initCarousel). |
| DIY vs Pro selector | `sections/diy-vs-pro-selector.liquid` | 2 blocks (mode label, heading, sub, 3 bullets, CTA label/link, watermark emoji, accent color). |
| Control kits loadout | `sections/control-kits-loadout.liquid` | Blocks = product picker + per-block text fields (target, difficulty 1–3, coverage, includes list — or read metafields). Price/compare-at/variant ID from the product object; Add to Cart posts to `/cart/add.js`. |
| Global supply network | `sections/global-supply-network.liquid` | Map SVG inline; stats are blocks (title + text) so shipping claims stay editable in the theme editor. |
| Pro plan band | existing `sections/media-with-content.liquid` or custom | Optional; content already exists. |
| Field guides | `sections/field-guides.liquid` | Setting: blog picker (default `pest-control-guides`), renders `blog.articles` as briefing-file cards. |
| Footer newsletter + safety note | extend `sections/footer.liquid` | Newsletter form → `{% form 'customer' %}` (customer tags `newsletter`). Safety note = richtext setting. |

## Snippet mapping

- `snippets/product-command-card.liquid` — port of `productCard()` in `catalog.js`.
  - price/compare-at → `product.price`, `product.compare_at_price`
  - badges → tags (`best-seller`, `tier:DIY` / `tier:Professional`, `type:*` tags or product type field)
  - AI / Yield rows → metafields (`custom.active_ingredient`, `custom.yield`)
  - Add to Cart → `product_form` posting to `/cart/add.js`, then re-render the cart drawer section (Section Rendering API) and fire the `.bump` animation on the header cart.
  - Keep the `pcard-frame` span + notch clip-path exactly as in the prototype CSS.

## Cart behavior

The prototype uses the Storefront API (`shopify-storefront.js`) with a
permalink fallback. In-theme, replace with AJAX Cart API (`/cart/add.js`,
`/cart/change.js`) — same drawer markup and animations apply. Keep the
free-shipping progress bar ($75 threshold as a theme setting).

## Theme toggle in Liquid

1. Inline pre-paint script in `theme.liquid` head (from `theme-toggle.js`).
2. Token blocks in `gps-tokens.css` (dark default + `[data-theme="light"]`).
3. Toggle button markup in `sections/header.liquid` with the same classes.
4. Optional theme setting: default scheme (dark / light / follow system).

## Suggested order of work (after `shopify theme pull`)

1. Tokens + theme toggle + custom cursor (global, low risk).
2. `product-command-card.liquid` snippet + wire into existing product grids.
3. Hero section, pest finder radar, kits loadout, DIY/Pro selector.
4. Supply network, field guides, footer upgrades.
5. Lighthouse pass on `shopify theme dev` preview; then user reviews and runs
   `shopify theme push`.
