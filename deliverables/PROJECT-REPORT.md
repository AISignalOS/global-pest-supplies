# Global Pest Supplies — Storefront Work Report

**Date:** 2026-06-30 · **Store:** global-pest-supplies.myshopify.com (Basic, USD, US) · **Scope this round:** clean up + finish the live store via the Shopify connector.

---

## 1. Summary of what I changed (live store)

1. **Deleted 10 placeholder products** — the "Example product" items (tagged `Sample Product`, $100, blank descriptions) left over from asset-pack installs.
2. **Deleted 3 demo collections** — the "Default example products" collections from those installs.
3. **Added SEO meta titles + descriptions to all 15 real collections** — they had on-page descriptions but empty `<title>`/meta; I filled them from your real catalog data in `store-structure.json`.

Everything else I checked was **already correct** and I did **not** touch it (no fabrication, no rework):
- 28 real products: complete descriptions, accurate active ingredients, market pricing, **compare-at prices**, **SEO titles/descriptions**, and **descriptive image alt text** — all already set.
- 15 smart collections populating correctly by tag/type.
- About, Returns & Refunds, Shipping, Terms pages + Privacy policy — populated.
- Blog "Pest Control Guides" — 6 articles.

## 2. Files changed / created (local)

- **No existing local files were modified** (no overwrites; the static prototype in this folder is untouched, so nothing to back up).
- **New review files created** in `deliverables/`:
  - `PROJECT-REPORT.md` (this file)
  - `IMAGE-REPLACEMENT-REPORT.md` (28-product image checklist)
  - `STORE-CONTENT-DRAFTS.md` (Contact, FAQ, safety disclaimer drafts)

## 3. Shopify CLI commands used

**None.** The Shopify CLI cannot run from this assistant's environment — it must run on *your* computer and authenticate through *your* browser. All live-store changes this round were made through the connected Shopify Admin connector, not the CLI. CLI commands you can run yourself are in sections 8–10.

## 4. Products / collections connected or updated

- **Products deleted (10):** all "Example product" demo items.
- **Collections deleted (3):** all "Default example products" demo collections.
- **Collections updated (15):** ant-control, cockroach-control, rodent-control, mosquito-control, termite-control, bed-bug-control, flea-tick-control, wasps-spiders, diy-kits, professional-supplies, concentrates-sprays, baits-traps, equipment, natural-pet-safe, best-sellers — SEO meta added.
- **28 real products:** verified complete; left unchanged.

## 5. Images added / replaced and their sources

- **None added or replaced this round.** Per your instruction, real photos will replace the current AI-generated mockups — you supply the sources.
- Every product still has its existing image + correct alt text, so there are **no broken images**.
- See `IMAGE-REPLACEMENT-REPORT.md` for the per-product checklist and how to hand me images.

## 6. Missing data / images I still need from you

1. **Real product photos** — 28 products (supplier/manufacturer/your own). See image report.
2. **Contact details** — phone, hours, mailing address for the Contact page (currently empty).
3. **Shipping offer** — confirm "Free shipping $75+" (announcement bar) and set the matching rate, or change the copy.
4. **Return window** — confirm the number of days for the FAQ/returns wording.
5. **Pesticide shipping compliance** — which products you can legally ship to which states (see risks).
6. **Approval to publish** the Contact/FAQ/disclaimer drafts.

## 7. Risks & assumptions

- **AI-generated product images** misrepresent the real item until replaced — highest-priority fix for a pesticide store.
- **Pesticide compliance (your responsibility):** many products imply EPA-registered actives. Real selling requires correct EPA reg numbers on labels/pages and may carry state registration limits and air-ship restrictions on aerosols/flammables. Confirm with your supplier before go-live. I have **not** added any EPA/medical/efficacy claims.
- **House-brand names** (Defender, RoachOut, Guardian, etc.) are placeholders for resale safety and must map to real supplier SKUs; pricing is market-realistic but not tied to a live supplier yet.
- **Inventory is untracked** (intentional for dropshipping) so items never show out of stock — correct only once a supplier fulfills.
- **"Home page" (frontpage) collection** has 1 product and no description — standard Shopify collection; left as-is.
- **Footer policy links:** your policies exist as pages; Dawn's footer pulls policy links from Settings → Policies. Verify those are filled so links don't dead-end.
- Assumed your live theme is Dawn (per `STORE-SETUP-GUIDE.md`); the CLI commands below work for any theme.

## 8. Preview instructions (no changes go live)

The connector changes above are already on your store's data (products/collections), visible in Admin. To preview the **storefront/theme** locally before any theme edits:

```bash
# On YOUR computer (Node 20+ and Shopify CLI installed):
cd /path/to/global-pest-supplies          # WSL: /mnt/c/Users/AINov/Documents/global-pest-supplies
shopify theme pull --store global-pest-supplies.myshopify.com   # connect + download live theme
shopify theme dev   --store global-pest-supplies.myshopify.com  # live preview at http://127.0.0.1:9292
shopify theme check                                             # theme linter/QA
```

`shopify theme dev` is safe — it serves a local preview and never publishes.

## 9. Exact command to push as an UNPUBLISHED theme (safe, not live)

```bash
# Uploads your local theme code as a NEW unpublished theme (nothing goes live):
shopify theme push --store global-pest-supplies.myshopify.com --unpublished --theme "GPS Branded Draft"
```

## 10. Exact command to PUBLISH — only after you approve

```bash
# Makes the chosen theme the live storefront. Run ONLY when you've approved the preview.
shopify theme push --store global-pest-supplies.myshopify.com --theme "GPS Branded Draft"
shopify theme publish --store global-pest-supplies.myshopify.com   # then select the theme to go live
```

---

## Recommended next steps

1. Send me product image URLs (or "keep mockups") so I can attach real photos with alt text.
2. Give me the Contact details + approval, and I'll publish the Contact page, FAQ, and disclaimer.
3. Confirm the shipping/returns specifics so the copy is accurate.
4. When you want theme branding (logo, colors, homepage sections) done in code, run the `theme pull` above and tell me "theme is pulled" — I'll edit the theme files here and hand you the push command.
