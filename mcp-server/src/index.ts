import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

import { DSERS_FEASIBILITY, parseSupplierExportCsv, parseSupplierExportJson, filterDiyPestCandidates } from './dsers.js';
import { tagProduct } from './taxonomy.js';
import { scoreProduct, rankProduct } from './scoring.js';
import * as queue from './reviewQueue.js';
import * as shopify from './shopify.js';
import { auditProductSeo } from './seoAudit.js';
import { auditSiteUx } from './siteUx.js';
import { buildContentBrief } from './content.js';

const server = new McpServer({ name: 'gps-supply-chain', version: '0.1.0' });

server.registerTool(
  'dsers_feasibility',
  {
    title: 'DSers integration feasibility',
    description:
      'Returns documented facts about DSers partner/developer API access and why this server uses a supplier-export review-queue fallback instead of an unsupported integration.',
    inputSchema: {},
  },
  async () => ({ content: [{ type: 'text', text: JSON.stringify(DSERS_FEASIBILITY, null, 2) }] }),
);

server.registerTool(
  'find_products',
  {
    title: 'Find DIY pest control candidates from a supplier export',
    description:
      'Parses a CSV or JSON supplier export (e.g. exported from DSers/AliExpress) and returns normalized DIY pest-control product candidates. Does not scrape or call unsupported APIs.',
    inputSchema: {
      format: z.enum(['csv', 'json']),
      data: z.string().describe('Raw CSV or JSON text of the supplier export'),
    },
  },
  async ({ format, data }) => {
    const parsed = format === 'csv' ? parseSupplierExportCsv(data) : parseSupplierExportJson(data);
    const filtered = filterDiyPestCandidates(parsed);
    return { content: [{ type: 'text', text: JSON.stringify({ total: parsed.length, pestRelevant: filtered.length, candidates: filtered }, null, 2) }] };
  },
);

server.registerTool(
  'tag_product',
  {
    title: 'Tag a product with pest/location/type/use-case taxonomy',
    description: 'Deterministic keyword-based tagging. Does not invent facts absent from the title/description.',
    inputSchema: { title: z.string(), description: z.string().optional() },
  },
  async ({ title, description }) => ({ content: [{ type: 'text', text: JSON.stringify(tagProduct(title, description), null, 2) }] }),
);

server.registerTool(
  'score_product',
  {
    title: 'Score a product for cost, margin, competitiveness, demand, and sale probability',
    description:
      'All estimates are labeled with a confidence level. Metrics needing data you did not provide (marketPrice, supplierOrders) come back null/unknown rather than invented.',
    inputSchema: {
      supplierPrice: z.number(),
      supplierShipping: z.number().optional(),
      suggestedPrice: z.number().optional(),
      marketPrice: z.number().optional(),
      supplierOrders: z.number().optional(),
      supplierRatingPct: z.number().optional(),
    },
  },
  async (input) => ({ content: [{ type: 'text', text: JSON.stringify(scoreProduct(input), null, 2) }] }),
);

server.registerTool(
  'rank_product',
  {
    title: 'Rank a scored product into a decision tier',
    description: 'Tiers: trending, best_seller, promising, low_confidence, high_risk, reject. Rule-based on score_product output plus supplier order volume.',
    inputSchema: {
      score: z.any().describe('Output of score_product'),
      supplierOrders: z.number().optional(),
      priorSupplierOrders: z.number().optional(),
    },
  },
  async ({ score, supplierOrders, priorSupplierOrders }) => ({
    content: [{ type: 'text', text: JSON.stringify(rankProduct(score, { supplierOrders, priorSupplierOrders }), null, 2) }],
  }),
);

server.registerTool(
  'stage_for_review',
  {
    title: 'Stage a candidate product in the review queue (dry-run by design)',
    description: 'Writes to a local review queue file. Nothing is published or created in Shopify by this tool.',
    inputSchema: { product: z.record(z.any()), score: z.record(z.any()), tags: z.record(z.any()), source: z.string() },
  },
  async ({ product, score, tags, source }) => ({
    content: [{ type: 'text', text: JSON.stringify(await queue.stageForReview(product, score, tags, source), null, 2) }],
  }),
);

server.registerTool(
  'list_review_queue',
  {
    title: 'List review queue entries',
    description: 'Optionally filter by status: pending, approved, rejected, imported, rolled_back.',
    inputSchema: { status: z.enum(['pending', 'approved', 'rejected', 'imported', 'rolled_back']).optional() },
  },
  async ({ status }) => ({ content: [{ type: 'text', text: JSON.stringify(await queue.listQueue(status), null, 2) }] }),
);

server.registerTool(
  'approve_review_entry',
  {
    title: 'Approve a review queue entry',
    description: 'Marks an entry approved. Does not create anything in Shopify — call import_approved_to_shopify separately with dryRun:false to do that.',
    inputSchema: { id: z.string(), notes: z.string().optional() },
  },
  async ({ id, notes }) => ({ content: [{ type: 'text', text: JSON.stringify(await queue.approveEntry(id, notes), null, 2) }] }),
);

server.registerTool(
  'reject_review_entry',
  {
    title: 'Reject a review queue entry',
    inputSchema: { id: z.string(), reason: z.string() },
  },
  async ({ id, reason }) => ({ content: [{ type: 'text', text: JSON.stringify(await queue.rejectEntry(id, reason), null, 2) }] }),
);

server.registerTool(
  'import_approved_to_shopify',
  {
    title: 'Import an approved review queue entry into Shopify as a draft product',
    description:
      'Defaults to dry-run (returns the payload that would be sent, no network call). To actually create the product, pass dryRun:false AND set ALLOW_LIVE_WRITES=true in the server environment, and the entry must already be status:approved. Products are always created as DRAFT, never published.',
    inputSchema: { id: z.string(), dryRun: z.boolean().default(true) },
  },
  async ({ id, dryRun }) => {
    const entry = await queue.getEntry(id);
    if (entry.status !== 'approved' && !dryRun) throw new Error(`Entry ${id} is not approved (status: ${entry.status}). Approve it first.`);
    const product = entry.product as { title: string; description?: string; images?: string[] };
    const scoreResult = entry.score as { suggestedPrice: number };
    const tags = entry.tags as { pestTypes?: string[] };
    const result = await shopify.createDraftProduct(
      {
        title: product.title,
        descriptionHtml: product.description,
        images: product.images,
        tags: [entry.source, ...(tags?.pestTypes ?? [])],
        variants: [{ price: String(scoreResult.suggestedPrice) }],
      },
      dryRun,
    );
    if (!result.dryRun && result.product) {
      await queue.recordImport(id, result.product.id);
    }
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  },
);

server.registerTool(
  'rollback_import',
  {
    title: "Roll back an imported product (deletes the Shopify draft)",
    inputSchema: { id: z.string(), dryRun: z.boolean().default(true) },
  },
  async ({ id, dryRun }) => {
    const entry = await queue.getEntry(id);
    if (entry.status !== 'imported') throw new Error(`Entry ${id} is not in 'imported' status (status: ${entry.status}).`);
    if (!entry.shopifyProductId) throw new Error(`Entry ${id} has no shopifyProductId recorded.`);
    const result = await shopify.deleteProduct(entry.shopifyProductId, dryRun);
    if (!result.dryRun) await queue.recordRollback(id);
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  },
);

server.registerTool(
  'monitor_product',
  {
    title: 'Read current Shopify price/inventory/status for a product by handle',
    description: 'Read-only. Use to check for supplier/price/inventory drift against what was originally imported.',
    inputSchema: { handle: z.string() },
  },
  async ({ handle }) => ({ content: [{ type: 'text', text: JSON.stringify(await shopify.getProductByHandle(handle), null, 2) }] }),
);

server.registerTool(
  'audit_product_seo',
  {
    title: 'Audit a Shopify product page for SEO/AEO/GEO basics',
    description:
      'Read-only. Fetches the product by handle and runs deterministic checks (title/description length, alt text coverage, FAQ presence, tags). Does not auto-fix anything.',
    inputSchema: { handle: z.string() },
  },
  async ({ handle }) => {
    const product = await shopify.getProductByHandle(handle);
    return { content: [{ type: 'text', text: JSON.stringify(auditProductSeo(product as never), null, 2) }] };
  },
);

server.registerTool(
  'audit_site_ux',
  {
    title: 'Audit local theme/site files for basic UX, accessibility, and trust-signal patterns',
    description: 'Reads HTML files under THEME_DIR (default: cwd) and flags missing viewport meta, alt text, aria attributes, mobile nav, and trust-signal copy.',
    inputSchema: { files: z.array(z.string()).optional() },
  },
  async ({ files }) => ({ content: [{ type: 'text', text: JSON.stringify(await auditSiteUx(files), null, 2) }] }),
);

server.registerTool(
  'generate_content_brief',
  {
    title: 'Build a factual content brief for original blog/social copy',
    description:
      'Extracts facts only (no marketing copy) so the calling agent can draft original, compliant blog posts and social content instead of copying supplier text.',
    inputSchema: { product: z.object({ title: z.string(), description: z.string().optional() }), tags: z.record(z.any()) },
  },
  async ({ product, tags }) => ({ content: [{ type: 'text', text: JSON.stringify(buildContentBrief(product, tags as never), null, 2) }] }),
);

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
