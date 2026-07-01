# Global Pest Supplies — Claude Working Rules

## Store identity

- **Shopify store URL:** `global-pest-supplies.myshopify.com`
- **Project folder (editable by Claude):** `/mnt/c/Users/AINov/Documents/global-pest-supplies`
  (same path as `/mnt/c/Users/AINov/Documents/global-pest-supplies` in WSL)
- **Working directory in this session:** `/mnt/c/Users/AINov/Documents/global-pest-supplies`

---

## Brand colors

| Role | Hex |
|---|---|
| Primary / buttons | `#1E6BFF` (electric blue) |
| Dark / text | `#0A1628` (deep navy) |
| Secondary accent | `#3A8AFF` |
| Background | `#FFFFFF` |
| Button text | `#FFFFFF` |

Always apply these colors when editing theme files, CSS, or any store-facing assets. Never introduce off-brand colors.

---

## What is already built (do not recreate)

- **28 products** — active, untracked inventory (dropshipping), full SEO metadata, real active ingredients, market pricing with compare-at strikethroughs.
- **15 smart collections** — 8 pest-type, 4 product-type, 3 merchandising (Best Sellers, DIY Kits, Professional Supplies). Auto-populate by tag — no manual curation needed.
- **Blog "Pest Control Guides"** — 6 SEO articles with product internal links.
- **Navigation** — Main menu with Shop by Pest dropdown (8 pests) and Products dropdown (4 types).
- **Discount** — `WELCOME10` (10% off, all customers, all products).
- **Brand assets** in `assets/`: `logo-lockup.png`, `logo-lockup.svg`, `app-icon-512.png`, `favicon-64.png`.
- **Data sources** in `data/`: `products.json`, `store-structure.json`, `blog.json` — treat these as the source of truth; edit here and re-sync rather than mutating the store directly.

---

## Live-store cleanup rules

The Shopify store contains real live data. These rules apply to all Shopify MCP tool calls:

1. **Never push, publish, or mutate live store data without explicit "go ahead" approval from the user in this conversation.** Drafting content is fine; publishing is not.
2. **Read operations** (`get-product`, `search-products`, `graphql_query`, `list-orders`, etc.) are safe and can run freely.
3. **Write operations** (`create-product`, `update-product`, `graphql_mutation`, `shopify theme push`, etc.) require the user to say something like "yes, do it", "push it", "go live", or equivalent before executing.
4. When in doubt, show the intended mutation and wait for confirmation.

---

## Safe CLI workflow

The user runs CLI commands; Claude edits files. The split is:

| Step | Who does it |
|---|---|
| `shopify theme pull` — download live theme | **User runs in terminal** |
| Edit theme files (Liquid, CSS, JSON) | **Claude edits files** |
| `shopify theme dev` — preview at localhost:9292 | **User runs in terminal** |
| Review preview in browser | **User reviews** |
| `shopify theme push` — publish to live store | **User runs in terminal, only after approving** |

Claude must never suggest `shopify theme push` as an automated step. Always present it as a command for the user to run after they have reviewed the preview.

If a shell command would affect the live store (push, deploy, publish), surface it as a code block for the user to run — do not execute it via Bash automatically.

---

## Remaining store work (not yet done)

- Apply brand colors and logo to the Dawn theme via theme code (waiting for user to run `shopify theme pull`).
- Homepage sections: Hero, Shop-by-Pest grid, Best Sellers, DIY Kits, blog posts, email signup.
- Announcement bar: `Free shipping on orders $75+ · Use code WELCOME10 for 10% off your first order`
- Product images (none added yet — biggest conversion gap).
- Shopify Search & Discovery app (filters for Pest and Tier tags).
- Go-live checklist items (all require user accounts/decisions):
  - Payments (Shopify Payments + PayPal)
  - Dropshipping supplier app (Spocket/Zendrop/DSers)
  - Shipping rates
  - Custom domain
  - Legal/policy pages
  - Google Search Console sitemap submission

---

## General working rules

- Never publish anything live without explicit user approval in this conversation.
- Never commit or push to external services (git, Shopify, Vercel, etc.) unless explicitly asked.
- Prefer editing `data/*.json` source files over mutating the live store directly when catalog changes are needed.
- Keep responses concise — the user can read diffs and output; avoid restating what was just done.
- Do not add error handling, abstractions, or cleanup beyond what the specific task requires.
- Do not write comments in theme/code files unless the reason is non-obvious.
