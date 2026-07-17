import { describe, it, expect } from 'vitest';
import { tagProduct } from '../src/taxonomy.js';

describe('tagProduct', () => {
  it('detects pest type and product type from title', () => {
    const result = tagProduct('AntStop Gel Bait', 'Sweet bait for indoor ant colonies');
    expect(result.pestTypes).toContain('ants');
    expect(result.productTypes).toContain('bait');
    expect(result.locations).toContain('indoor');
    expect(result.skillLevel).toBe('beginner');
  });

  it('flags restricted-use professional products', () => {
    const result = tagProduct('Pro Concentrate 25.1%', 'Licensed applicator use only, restricted in some states');
    expect(result.safetyFlags).toContain('restricted_use');
    expect(result.skillLevel).toBe('advanced');
    expect(result.useCases).toContain('professional');
  });

  it('falls back to general pest type when nothing matches', () => {
    const result = tagProduct('Widget', 'A thing');
    expect(result.pestTypes).toEqual(['general']);
  });
});
