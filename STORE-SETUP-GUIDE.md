# Global Pest Supplies — Store Setup & Go-Live Guide

Your Shopify store is **live and populated**: `global-pest-supplies.myshopify.com`
This guide covers (1) what's already done, (2) the visual branding steps you finish in the theme editor (10 min), and (3) the go-live checklist for dropshipping (supplier, payments, domain).

---

## 1. What's already built (done for you via the Shopify connector)

**28 products** — accurate pest-control catalog, all `Active`, each with:
- Real active ingredients (bifenthrin, indoxacarb, deltamethrin, fipronil, bromadiolone, Bti, etc.), sizes, residual times, and use directions
- Market-based pricing with compare-at "sale" prices for the strikethrough look
- SEO title + meta description on every product
- Inventory left **untracked** so items never go out of stock (correct for dropshipping — your supplier fulfills)

**15 smart collections** — auto-populate by tag/type, so new products file themselves:
- By pest: Ants, Cockroaches, Rodents, Mosquitoes, Termites, Bed Bugs, Fleas & Ticks, Wasps & Spiders
- By type: Concentrates & Sprays, Baits & Traps, Equipment, Natural & Pet-Safe
- Merchandising: DIY Kits, Professional Supplies, Best Sellers

**Blog "Pest Control Guides"** — 6 SEO articles (ant, roach, restaurant rodent, mosquito, termite, bed bug), each with meta title/description and internal links to products + collections.

**Navigation** — main menu rebuilt: Home · Shop by Pest (8-item dropdown) · Products (4-item dropdown) · DIY Kits · Professional · Best Sellers · Learn (blog).

**Discount** — `WELCOME10` (10% off, all products, all customers) live for your email signup offer.

**Brand assets** (in the `assets/` folder, ready to upload):
- `logo-lockup.png` — horizontal logo for the header (1520×400, transparent)
- `app-icon-512.png` — square icon
- `favicon-64.png` — browser tab favicon

---

## 2. Finish branding in the theme editor (~10 minutes)

Go to **Online Store → Themes → Customize**. (The free **Dawn** theme is recommended — it has search, filtering, and a newsletter block built in. If you don't have it, Online Store → Themes → "Add theme" → Dawn.)

**Brand colors** (Theme settings → Colors):
- Primary / accent: `#1E6BFF` (electric blue)
- Text / dark: `#0A1628` (deep navy)
- Secondary accent: `#3A8AFF`
- Background: `#FFFFFF`; set buttons to the blue, button text white.

**Logo** (Theme settings → Logo, or Header section):
- Upload `assets/logo-lockup.png`. Set max width ~220px.
- Favicon (Theme settings → Favicon): upload `assets/favicon-64.png`.

**Header** (Header section):
- Menu: Main menu (already built). Turn **on** the search icon (predictive search).
- Sticky header: on.

**Announcement bar** (top of theme): set text to
`Free shipping on orders $75+ · Use code WELCOME10 for 10% off your first order`

**Homepage sections** (add in this order on the home template):
1. Image banner / Hero — headline "Pro-Grade Pest Control, Delivered" · subtext "DIY kits and professional supplies — shipped to your door." · buttons "Shop by Pest" → `/collections` and "Best Sellers" → `/collections/best-sellers`
2. Collection list — add the 8 pest collections (this becomes your "Shop by Pest" grid)
3. Featured collection — "Best Sellers"
4. Featured collection — "DIY Kits"
5. Rich text — "Why Global Pest Supplies": pro-grade products · save up to 70% vs an exterminator · fast shipping · expert support
6. Blog posts — point to "Pest Control Guides"
7. Email signup — heading "Get 10% off your first order" (this captures your email list; subscribers appear under Customers → Marketing)

**Filters** (powers the filter sidebar on collection pages):
- Install the free **Shopify Search & Discovery** app (Apps → search it → install).
- Under Filters, enable: Availability, Price, Product type, and add tag-based filters for **Pest** and **Tier (DIY/Professional)**. Your products are already tagged for all of these.

Click **Save**, then **Publish** if it's a new theme.

---

## 3. Go-live checklist for dropshipping

These require your accounts/decisions — they can't be done through the connector:

**Dropshipping supplier (for auto price/inventory sync + fulfillment)** — this is the "auto-update products & prices" piece:
- Install a supplier app from the Shopify App Store: **DSers** (AliExpress), **Zendrop**, or **Spocket** (US/EU suppliers — better for pest-control shipping times).
- Map each of your 28 products to a supplier item, OR import supplier products and merge. The app then keeps cost/price/stock in sync automatically and routes orders to the supplier.
- ⚠️ Compliance note: many pesticides have shipping/registration restrictions (EPA-registered products, state limits, air-shipping rules on aerosols/flammables). Confirm your supplier can legally ship each item to your target regions before going live.

**Payments:** Settings → Payments → activate **Shopify Payments** (and PayPal if you want). Required to accept real orders — checkout is already built into Shopify; this just turns on money movement.

**Shipping:** Settings → Shipping → set your rates (e.g., free over $75 to match the announcement bar) or pull rates from your supplier app.

**Taxes:** Settings → Taxes → confirm US tax regions.

**Domain:** Settings → Domains → buy/connect a custom domain (e.g., globalpestsupplies.com) so you're not on `.myshopify.com`.

**Legal pages:** Settings → Policies → generate Refund, Privacy, Terms, Shipping policies (Shopify has templates). Add a Contact page and an About page.

**Product photos:** products currently have no images (descriptions/pricing/SEO are complete). Add real product photos from your supplier — this is the single biggest conversion lift. Use the supplier app's images or upload your own; I can bulk-attach images if you give me the URLs.

**SEO finish:** Online Store → Preferences → set homepage meta title/description and upload a social share image. Then submit your sitemap (`/sitemap.xml`) in Google Search Console.

---

## Reference files (in this folder)
- `data/products.json` — full catalog source (edit here, ask me to re-sync)
- `data/store-structure.json` — collections, menu, filters, homepage plan
- `data/blog.json` — blog article source
- `assets/logo-lockup.png`, `app-icon-512.png`, `favicon-64.png` — brand assets

_Want me to handle any of section 3 I can reach (e.g., generate policy page content, write the homepage hero copy variants, attach product images from supplier URLs, or add more products/articles)? Just say so._
