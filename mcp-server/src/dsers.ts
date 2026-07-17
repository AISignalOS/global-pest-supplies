/**
 * DSers feasibility (Phase 1 finding, checked against dsers.dev):
 * DSers publishes a Supplier App API and a Channel App API for approved partner
 * apps (OAuth via an auth service), not a self-serve API for a third party to
 * search arbitrary supplier catalogs or push products without becoming an
 * approved Supplier/Channel app. There is no documented endpoint for what this
 * server needs ("find + import DIY pest products"), so we do not call DSers
 * over the network at all. Instead this adapter parses a supplier export
 * (CSV/JSON) the operator downloads from DSers/AliExpress/another supplier —
 * a supported, compliant path — and normalizes it for scoring/review.
 */
export interface DsersFeasibility {
  hasPublicThirdPartyProductApi: false;
  supplierAppApi: string;
  channelAppApi: string;
  authService: string;
  notes: string[];
}
export const DSERS_FEASIBILITY: DsersFeasibility = {
  hasPublicThirdPartyProductApi: false,
  supplierAppApi: 'https://www.dsers.dev/api/supplier_app_api',
  channelAppApi: 'https://www.dsers.dev/api/channel_app_api',
  authService: 'https://www.dsers.dev/auth_service',
  notes: [
    'DSers exposes Supplier App API and Channel App API for approved partner apps, gated by developer registration and OAuth (see dsers.dev).',
    'No documented self-serve API exists for a third party to search arbitrary supplier catalogs or push products without becoming an approved Supplier/Channel app.',
    'This adapter uses the compliant fallback: parse a supplier export (CSV/JSON) the operator obtains from DSers/their supplier, normalize it, and stage candidates in the review queue.',
    'If you later become an approved DSers partner app, implement a new function here calling the documented API — do not fabricate endpoints in the meantime.',
  ],
};

export interface NormalizedCandidate {
  supplierRef: string;
  title: string;
  description: string;
  images: string[];
  supplierPrice: number;
  supplierShipping: number;
  currency: string;
  supplierOrders?: number;
  supplierRatingPct?: number;
  sourceRow: Record<string, unknown>;
}

function num(v: unknown): number | undefined {
  if (v === undefined || v === null || v === '') return undefined;
  const n = Number(String(v).replace(/[^0-9.-]/g, ''));
  return Number.isFinite(n) ? n : undefined;
}

function pick(row: Record<string, unknown>, keys: string[]): unknown {
  for (const k of keys) {
    if (row[k] !== undefined && row[k] !== '') return row[k];
  }
  return undefined;
}

function normalizeRow(row: Record<string, unknown>): NormalizedCandidate {
  const title = String(pick(row, ['title', 'Title', 'product_title', 'name']) ?? '').trim();
  if (!title) throw new Error(`Supplier export row missing a title: ${JSON.stringify(row)}`);
  return {
    supplierRef: String(pick(row, ['supplier_ref', 'sku', 'SKU', 'product_id', 'id']) ?? ''),
    title,
    description: String(pick(row, ['description', 'Description', 'body']) ?? ''),
    images: String(pick(row, ['images', 'image', 'Image']) ?? '')
      .split(/[|;]/)
      .map((s) => s.trim())
      .filter(Boolean),
    supplierPrice: num(pick(row, ['cost', 'supplier_price', 'Cost'])) ?? 0,
    supplierShipping: num(pick(row, ['shipping', 'supplier_shipping'])) ?? 0,
    currency: String(pick(row, ['currency', 'Currency']) ?? 'USD'),
    supplierOrders: num(pick(row, ['orders', 'order_count', 'Orders'])),
    supplierRatingPct: num(pick(row, ['rating', 'rating_pct', 'Rating'])),
    sourceRow: row,
  };
}

export function parseSupplierExportJson(jsonText: string): NormalizedCandidate[] {
  const rows = JSON.parse(jsonText);
  if (!Array.isArray(rows)) throw new Error('Expected a JSON array of supplier export rows');
  return rows.map(normalizeRow);
}

export function parseSupplierExportCsv(csvText: string): NormalizedCandidate[] {
  const [headerLine, ...lines] = csvText.trim().split(/\r?\n/);
  const headers = headerLine.split(',').map((h) => h.trim());
  const rows = lines
    .filter(Boolean)
    .map((line) => {
      const cells = line.split(',');
      const row: Record<string, string> = {};
      headers.forEach((h, i) => {
        row[h] = (cells[i] ?? '').trim();
      });
      return row;
    });
  return rows.map(normalizeRow);
}

const PEST_KEYWORDS_FLAT = [
  'ant', 'roach', 'bed bug', 'bedbug', 'termite', 'mosquito', 'flea', 'tick',
  'rodent', 'mouse', 'rat', 'wasp', 'spider', 'lawn pest', 'pest',
];

export function filterDiyPestCandidates(candidates: NormalizedCandidate[]): NormalizedCandidate[] {
  return candidates.filter((c) => {
    const text = `${c.title} ${c.description}`.toLowerCase();
    return PEST_KEYWORDS_FLAT.some((k) => text.includes(k));
  });
}
