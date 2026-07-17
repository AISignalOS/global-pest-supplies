import 'dotenv/config';

function bool(v: string | undefined, def: boolean): boolean {
  if (v === undefined) return def;
  return v === 'true' || v === '1';
}
function num(v: string | undefined, def: number): number {
  if (v === undefined) return def;
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
}

export const config = {
  shopify: {
    domain: process.env.SHOPIFY_STORE_DOMAIN || '',
    adminToken: process.env.SHOPIFY_ADMIN_API_TOKEN || '',
    apiVersion: process.env.SHOPIFY_API_VERSION || '2025-07',
  },
  dsers: {
    appKey: process.env.DSERS_APP_KEY || '',
    appSecret: process.env.DSERS_APP_SECRET || '',
  },
  allowLiveWrites: bool(process.env.ALLOW_LIVE_WRITES, false),
  markupMultiplier: num(process.env.MARKUP_MULTIPLIER, 2.5),
  paymentFeePct: num(process.env.PAYMENT_FEE_PCT, 0.029),
  paymentFeeFixed: num(process.env.PAYMENT_FEE_FIXED, 0.30),
  bestSellerOrderThreshold: num(process.env.BEST_SELLER_ORDER_THRESHOLD, 500),
  dataDir: process.env.DATA_DIR || new URL('../data', import.meta.url).pathname,
  themeDir: process.env.THEME_DIR || process.cwd(),
};

export function requireShopifyConfig(): void {
  if (!config.shopify.domain || !config.shopify.adminToken) {
    throw new Error('Missing SHOPIFY_STORE_DOMAIN or SHOPIFY_ADMIN_API_TOKEN. Set them in .env (see .env.example).');
  }
}
