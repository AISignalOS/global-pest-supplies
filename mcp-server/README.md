# gps-supply-chain-mcp

MCP server for sourcing, scoring, tagging, auditing, and (with explicit human
approval) importing DIY pest-control products into the Global Pest Supplies
Shopify store. Dry-run and a file-based review queue are the default and only
path to any Shopify write.

## Phase 1 — DSers feasibility (checked against dsers.dev)

DSers publishes a **Supplier App API** and a **Channel App API** for approved
partner apps, gated by developer registration and OAuth. There is **no
documented self-serve API** for a third party to search arbitrary supplier
catalogs or push products without becoming an approved Supplier/Channel app.

So this server does **not** call DSers over the network and does **not**
scrape it. Instead, `find_products` parses a supplier export (CSV/JSON) that
you download from DSers (or another supplier) — a supported, compliant path —
and normalizes it for scoring and review. Call the `dsers_feasibility` tool
at any time to get this finding with source URLs. If you later become an
approved DSers partner app, implement a real API call in `src/dsers.ts`
instead of extending the CSV/JSON path.

## Architecture

```
supplier export (CSV/JSON)
        │  find_products (filter to DIY pest-control candidates)
        ▼
   tag_product ──► score_product ──► rank_product
        │
        ▼
  stage_for_review  (writes data/review-queue.json, logs to data/change-log.jsonl)
        │
   [human approves/rejects — approve_review_entry / reject_review_entry]
        │
        ▼
import_approved_to_shopify (dryRun:true by default; dryRun:false + ALLOW_LIVE_WRITES=true
                             required to actually create a Shopify DRAFT product)
        │
   rollback_import (deletes the created draft, only for status:imported entries)

monitor_product / audit_product_seo — read-only Shopify Admin API checks
audit_site_ux                        — read-only local HTML checks (viewport, alt text,
                                        aria, mobile nav, trust-signal copy)
generate_content_brief               — facts-only brief; the calling agent writes the
                                        actual original blog/social copy from it
```

Every mutation (stage, approve, reject, import, rollback) is appended to
`data/change-log.jsonl` with a before/after snapshot, so state can be
reconstructed or manually reverted even beyond what `rollback_import` covers.

## Setup

```bash
cd mcp-server
npm install
cp .env.example .env   # fill in SHOPIFY_STORE_DOMAIN / SHOPIFY_ADMIN_API_TOKEN
npm run build
npm test
npm start              # runs the MCP server over stdio
```

Register it with your MCP client (e.g. Claude Code) pointing at
`node /path/to/mcp-server/dist/index.js`.

## Controls

- **Dry-run by default**: `import_approved_to_shopify` and `rollback_import`
  both default `dryRun: true` and return the payload they *would* send. Live
  writes require both `dryRun: false` in the call **and** `ALLOW_LIVE_WRITES=true`
  in the environment.
- **Review queue gate**: an entry must be `status: approved` before it can be
  imported live — staging alone never creates anything in Shopify.
- **Products are always created as `DRAFT`** — nothing is published
  automatically.
- **Confidence labeling**: `score_product` never invents demand or
  competitiveness numbers. If you don't pass `marketPrice`/`supplierOrders`,
  those fields come back `null` with a `warnings` entry explaining why.
- **No unsupported claims**: `generate_content_brief` returns facts only
  (title, extracted description sentences, safety notes, a `doNotClaim` list)
  — writing the actual marketing copy is left to the calling agent, using
  only those facts, so content stays original and defensible.

## Known limitations / things to verify before enabling live writes

- `createDraftProduct`'s GraphQL mutation targets the classic `ProductInput`
  shape. Confirm this matches your store's Admin API version schema (newer
  API versions favor `productSet`/`productVariantsBulkCreate`) before setting
  `ALLOW_LIVE_WRITES=true` — dry-run output lets you check the payload first.
- `audit_site_ux` does keyword/structural checks only (viewport meta, `<img>`
  alt coverage, aria attributes, mobile-nav class names, trust-signal
  phrases) — it is a lint pass, not a full accessibility or UX audit.
- Social/video content generation is intentionally not automated inside the
  server; `generate_content_brief` gives the calling agent the facts needed
  to draft original posts per channel.

## Deployment checklist

1. `npm install && npm run build && npm test` all pass.
2. `.env` has a real `SHOPIFY_ADMIN_API_TOKEN` (custom app, least-privilege
   scopes: `read_products`, `write_products`) — never commit `.env`.
3. Confirm `ALLOW_LIVE_WRITES` is unset/`false` until you've reviewed at
   least one full dry-run cycle (`stage → approve → import dryRun:true`).
4. Validate the `productCreate` payload shape against your store's Admin API
   version before flipping `ALLOW_LIVE_WRITES=true`.
5. Point your MCP client config at `dist/index.js` and restart it.
6. Spot-check `data/change-log.jsonl` after the first few live imports.
