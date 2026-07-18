export interface ContentBrief {
  title: string;
  keyFacts: string[];
  targetPests: string[];
  audience: string[];
  safetyNotes: string[];
  suggestedFormats: string[];
  doNotClaim: string[];
}

/**
 * Extracts facts only — no marketing copy — so the calling agent drafts
 * original blog/social content from real product data instead of copying
 * supplier text or inventing claims.
 */
export function buildContentBrief(
  product: { title: string; description?: string },
  tags: { pestTypes: string[]; useCases: string[]; safetyFlags: string[] },
): ContentBrief {
  return {
    title: product.title,
    keyFacts: (product.description ?? '')
      .split(/[.\n]/)
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 6),
    targetPests: tags.pestTypes,
    audience: tags.useCases.includes('professional') ? ['licensed pest control professionals'] : ['homeowners', 'DIY buyers'],
    safetyNotes: tags.safetyFlags.includes('restricted_use')
      ? ['Restricted-use product — verify license/state rules before promoting.']
      : ['Always tell readers to follow label directions.'],
    suggestedFormats: [
      'blog: how-to guide',
      'short-form video: before/after or application demo',
      'carousel: step-by-step application',
      'comparison post vs. similar products',
    ],
    doNotClaim: ['100% guaranteed results', 'unverified health/safety claims', 'medical claims', 'illegal-in-state usage'],
  };
}
