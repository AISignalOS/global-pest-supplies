import { config } from './config.js';

export interface ScoreInput {
  supplierPrice: number;
  supplierShipping?: number;
  suggestedPrice?: number;
  marketPrice?: number;
  supplierOrders?: number;
  supplierRatingPct?: number;
}
export interface ScoreResult {
  cost: number;
  suggestedPrice: number;
  estMarginAbs: number;
  estMarginPct: number;
  competitiveness: number | null;
  demandScore: number | null;
  saleProbability: number | null;
  confidence: Record<string, string>;
  warnings: string[];
}

export function scoreProduct(input: ScoreInput): ScoreResult {
  const warnings: string[] = [];
  const supplierShipping = input.supplierShipping ?? 0;
  const cost = input.supplierPrice + supplierShipping;
  const suggestedPrice = input.suggestedPrice ?? Number((cost * config.markupMultiplier).toFixed(2));

  const fees = suggestedPrice * config.paymentFeePct + config.paymentFeeFixed;
  const estMarginAbs = Number((suggestedPrice - cost - fees).toFixed(2));
  const estMarginPct = suggestedPrice > 0 ? Number((estMarginAbs / suggestedPrice).toFixed(4)) : 0;

  let competitiveness: number | null = null;
  if (typeof input.marketPrice === 'number' && input.marketPrice > 0) {
    competitiveness = Number(((input.marketPrice - suggestedPrice) / input.marketPrice).toFixed(4));
  } else {
    warnings.push('marketPrice not provided — competitiveness unknown');
  }

  let demandScore: number | null = null;
  if (typeof input.supplierOrders === 'number' && input.supplierOrders > 0) {
    demandScore = Number(Math.min(100, (Math.log10(input.supplierOrders + 1) / Math.log10(10001)) * 100).toFixed(1));
  } else {
    warnings.push('supplierOrders not provided — demand is unknown, not estimated');
  }

  let saleProbability: number | null = null;
  if (demandScore !== null && competitiveness !== null && estMarginPct > 0) {
    const marginComponent = Math.max(0, Math.min(1, estMarginPct / 0.5));
    const competitivenessComponent = Math.max(0, Math.min(1, competitiveness + 0.5));
    const demandComponent = demandScore / 100;
    saleProbability = Number(((marginComponent * 0.3 + competitivenessComponent * 0.3 + demandComponent * 0.4) * 100).toFixed(1));
  } else {
    warnings.push('saleProbability requires margin, competitiveness, and demand data — insufficient inputs');
  }

  return {
    cost: Number(cost.toFixed(2)),
    suggestedPrice,
    estMarginAbs,
    estMarginPct,
    competitiveness,
    demandScore,
    saleProbability,
    confidence: {
      margin: 'calculated-from-inputs',
      competitiveness: competitiveness === null ? 'unknown' : 'estimated (requires accurate marketPrice input)',
      demand: demandScore === null ? 'unknown' : 'supplier-reported-orders (unverified)',
      saleProbability: saleProbability === null ? 'insufficient-data' : 'heuristic-estimate (not validated against real sales)',
    },
    warnings,
  };
}

export type RankTier = 'trending' | 'best_seller' | 'promising' | 'low_confidence' | 'high_risk' | 'reject';

export function rankProduct(
  score: ScoreResult,
  opts: { supplierOrders?: number; priorSupplierOrders?: number } = {},
): { tier: RankTier; rationale: string[] } {
  const rationale: string[] = [];
  if (score.estMarginPct <= 0) {
    rationale.push('margin is zero or negative after estimated fees');
    return { tier: 'reject', rationale };
  }

  if (score.demandScore === null || score.competitiveness === null) {
    rationale.push('missing demand or competitiveness data');
    return { tier: 'low_confidence', rationale };
  }
  if (score.estMarginPct < 0.10) {
    rationale.push('margin below 10% threshold');
    return { tier: 'high_risk', rationale };
  }

  if (typeof opts.supplierOrders === 'number' && opts.supplierOrders >= config.bestSellerOrderThreshold) {
    if (typeof opts.priorSupplierOrders === 'number' && opts.supplierOrders > opts.priorSupplierOrders * 1.2) {
      rationale.push('order volume grew >20% since last snapshot');
      return { tier: 'trending', rationale };
    }
    rationale.push(`supplier order volume >= ${config.bestSellerOrderThreshold}`);
    return { tier: 'best_seller', rationale };
  }

  rationale.push('healthy margin with some demand/competitiveness signal, below best-seller threshold');
  return { tier: 'promising', rationale };
}
