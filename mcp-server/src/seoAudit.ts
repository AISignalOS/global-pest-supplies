export interface SeoIssue {
  severity: 'high' | 'medium' | 'low';
  field: string;
  message: string;
}

interface AuditableProduct {
  title: string;
  descriptionHtml?: string;
  seo?: { title?: string; description?: string };
  images?: { nodes: { altText: string | null }[] };
  tags?: string[];
}

export function auditProductSeo(product: AuditableProduct): SeoIssue[] {
  const issues: SeoIssue[] = [];

  const seoTitle = product.seo?.title || product.title;
  if (seoTitle.length < 30 || seoTitle.length > 70) {
    issues.push({ severity: 'medium', field: 'seo.title', message: `SEO title is ${seoTitle.length} chars; aim for 30-70.` });
  }

  const seoDesc = product.seo?.description || '';
  if (!seoDesc) {
    issues.push({ severity: 'high', field: 'seo.description', message: 'Missing meta description.' });
  } else if (seoDesc.length < 70 || seoDesc.length > 160) {
    issues.push({ severity: 'low', field: 'seo.description', message: `Meta description is ${seoDesc.length} chars; aim for 70-160.` });
  }

  const body = product.descriptionHtml || '';
  const visibleText = body.replace(/<[^>]+>/g, '').trim();
  if (visibleText.length < 100) {
    issues.push({ severity: 'medium', field: 'descriptionHtml', message: 'Product description under 100 characters of visible text — thin content for SEO/AEO.' });
  }
  if (!/faq|frequently asked/i.test(body)) {
    issues.push({ severity: 'low', field: 'descriptionHtml', message: 'No FAQ section detected — an FAQ block helps AEO/GEO answer-engine visibility.' });
  }

  const images = product.images?.nodes ?? [];
  const missingAlt = images.filter((i) => !i.altText || !i.altText.trim());
  if (images.length && missingAlt.length) {
    issues.push({ severity: 'medium', field: 'images.altText', message: `${missingAlt.length}/${images.length} images missing alt text.` });
  }

  if (!product.tags || product.tags.length === 0) {
    issues.push({ severity: 'low', field: 'tags', message: 'No tags set — hurts internal linking and collection discovery.' });
  }

  return issues;
}
