import { config, requireShopifyConfig } from './config.js';

interface GraphQLResponse<T> {
  data?: T;
  errors?: { message: string }[];
}

async function shopifyGraphQL<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
  requireShopifyConfig();
  const url = `https://${config.shopify.domain}/admin/api/${config.shopify.apiVersion}/graphql.json`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': config.shopify.adminToken },
    body: JSON.stringify({ query, variables }),
  });
  const json = (await res.json()) as GraphQLResponse<T>;
  if (json.errors?.length) throw new Error(`Shopify API error: ${json.errors.map((e) => e.message).join('; ')}`);
  if (!res.ok) throw new Error(`Shopify API HTTP ${res.status}`);
  return json.data as T;
}

export interface DraftProductInput {
  title: string;
  descriptionHtml?: string;
  vendor?: string;
  tags?: string[];
  variants: { sku?: string; price: string; compareAtPrice?: string }[];
  images?: string[];
}

/**
 * NOTE: the productCreate mutation shape below targets the classic ProductInput
 * variants field. Validate this against your store's live Admin API version
 * schema (newer versions favor productSet / productVariantsBulkCreate) before
 * ever running with ALLOW_LIVE_WRITES=true — dry-run is the default precisely
 * so this can be checked safely first.
 */
export async function createDraftProduct(
  input: DraftProductInput,
  dryRun = true,
): Promise<{ dryRun: true; wouldCreate: DraftProductInput; note: string } | { dryRun: false; product: { id: string; handle: string; status: string } | null }> {
  if (dryRun || !config.allowLiveWrites) {
    return { dryRun: true, wouldCreate: input, note: 'ALLOW_LIVE_WRITES is not set or dryRun requested — no live Shopify call made.' };
  }
  const mutation = `mutation($input: ProductInput!) {
    productCreate(input: $input) { product { id handle status } userErrors { field message } }
  }`;
  const productInput = {
    title: input.title,
    descriptionHtml: input.descriptionHtml,
    vendor: input.vendor,
    tags: input.tags,
    status: 'DRAFT',
    variants: input.variants.map((v) => ({ sku: v.sku, price: v.price, compareAtPrice: v.compareAtPrice })),
  };
  const data = await shopifyGraphQL<{
    productCreate: { product: { id: string; handle: string; status: string } | null; userErrors: { field: string[]; message: string }[] };
  }>(mutation, { input: productInput });
  if (data.productCreate.userErrors.length) throw new Error(`Shopify productCreate errors: ${JSON.stringify(data.productCreate.userErrors)}`);
  return { dryRun: false, product: data.productCreate.product };
}

export async function deleteProduct(id: string, dryRun = true): Promise<{ dryRun: true; wouldDelete: string } | { dryRun: false; deletedProductId: string | null }> {
  if (dryRun || !config.allowLiveWrites) return { dryRun: true, wouldDelete: id };
  const mutation = `mutation($input: ProductDeleteInput!) { productDelete(input: $input) { deletedProductId userErrors { field message } } }`;
  const data = await shopifyGraphQL<{ productDelete: { deletedProductId: string | null; userErrors: { message: string }[] } }>(mutation, { input: { id } });
  if (data.productDelete.userErrors.length) throw new Error(JSON.stringify(data.productDelete.userErrors));
  return { dryRun: false, deletedProductId: data.productDelete.deletedProductId };
}

export async function getProductByHandle(handle: string): Promise<Record<string, unknown>> {
  const query = `query($handle: String!) {
    productByHandle(handle: $handle) {
      id title handle status tags descriptionHtml
      seo { title description }
      images(first: 20) { nodes { altText } }
      variants(first: 50) { nodes { id sku price compareAtPrice inventoryQuantity } }
    }
  }`;
  const data = await shopifyGraphQL<{ productByHandle: Record<string, unknown> | null }>(query, { handle });
  if (!data.productByHandle) throw new Error(`Product not found: ${handle}`);
  return data.productByHandle;
}

export async function listProductsByTag(tag: string, first = 25): Promise<Record<string, unknown>[]> {
  const query = `query($q: String!, $first: Int!) {
    products(first: $first, query: $q) {
      nodes { id title handle status tags variants(first: 10) { nodes { id sku price inventoryQuantity } } }
    }
  }`;
  const data = await shopifyGraphQL<{ products: { nodes: Record<string, unknown>[] } }>(query, { q: `tag:${tag}`, first });
  return data.products.nodes;
}
