import { describe, it, expect } from 'vitest';
import { scoreProduct, rankProduct } from '../src/scoring.js';

describe('scoreProduct', () => {
  it('computes margin from supplier price and markup', () => {
    const result = scoreProduct({ supplierPrice: 10, supplierShipping: 2 });
    expect(result.cost).toBe(12);
    expect(result.suggestedPrice).toBeGreaterThan(12);
    expect(result.estMarginPct).toBeGreaterThan(0);
  });

  it('marks competitiveness and demand unknown when no data given', () => {
    const result = scoreProduct({ supplierPrice: 10 });
    expect(result.competitiveness).toBeNull();
    expect(result.demandScore).toBeNull();
    expect(result.saleProbability).toBeNull();
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it('computes saleProbability only when all inputs are present', () => {
    const result = scoreProduct({ supplierPrice: 10, marketPrice: 40, supplierOrders: 500 });
    expect(result.saleProbability).not.toBeNull();
  });
});

describe('rankProduct', () => {
  it('rejects non-positive margin', () => {
    const score = scoreProduct({ supplierPrice: 100, suggestedPrice: 90 });
    expect(rankProduct(score).tier).toBe('reject');
  });

  it('flags low_confidence when demand/competitiveness missing', () => {
    const score = scoreProduct({ supplierPrice: 10 });
    expect(rankProduct(score).tier).toBe('low_confidence');
  });

  it('ranks best_seller above the order threshold', () => {
    const score = scoreProduct({ supplierPrice: 10, marketPrice: 40, supplierOrders: 1000 });
    expect(rankProduct(score, { supplierOrders: 1000 }).tier).toBe('best_seller');
  });
});
