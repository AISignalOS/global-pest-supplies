export type PestType =
  | 'ants' | 'roaches' | 'bed_bugs' | 'termites' | 'mosquitoes'
  | 'fleas_ticks' | 'rodents' | 'wasps_spiders' | 'lawn_pests' | 'general';
export type ProductType =
  | 'concentrate' | 'bait' | 'dust' | 'granules' | 'trap' | 'spray' | 'foam' | 'equipment' | 'kit';
export type Location = 'indoor' | 'outdoor' | 'kitchen' | 'yard' | 'perimeter' | 'crawlspace';
export type UseCase = 'diy_homeowner' | 'professional' | 'prevention' | 'active_treatment' | 'monitoring';

const PEST_KEYWORDS: Record<PestType, string[]> = {
  ants: ['ant', 'ants'],
  roaches: ['roach', 'cockroach'],
  bed_bugs: ['bed bug', 'bedbug'],
  termites: ['termite'],
  mosquitoes: ['mosquito'],
  fleas_ticks: ['flea', 'tick'],
  rodents: ['rodent', 'mouse', 'mice', 'rat'],
  wasps_spiders: ['wasp', 'hornet', 'spider'],
  lawn_pests: ['lawn pest', 'turf', 'grub'],
  general: ['pest control', 'insect'],
};
const PRODUCT_KEYWORDS: Record<ProductType, string[]> = {
  concentrate: ['concentrate'],
  bait: ['bait'],
  dust: ['dust'],
  granules: ['granule'],
  trap: ['trap', 'glue board'],
  spray: ['spray', 'aerosol'],
  foam: ['foam'],
  equipment: ['sprayer', 'duster', 'equipment'],
  kit: ['kit', 'bundle', 'system'],
};
const LOCATION_KEYWORDS: Record<Location, string[]> = {
  indoor: ['indoor', 'inside'],
  outdoor: ['outdoor'],
  kitchen: ['kitchen'],
  yard: ['yard', 'lawn'],
  perimeter: ['perimeter'],
  crawlspace: ['crawlspace', 'crawl space', 'void'],
};
const RESTRICTED_KEYWORDS = ['restricted', 'professional use only', 'licensed applicator', 'rup'];

function matchAny(text: string, keywords: string[]): boolean {
  return keywords.some((k) => text.includes(k));
}

export interface TagResult {
  pestTypes: PestType[];
  productTypes: ProductType[];
  locations: Location[];
  useCases: UseCase[];
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
  safetyFlags: string[];
  confidence: 'keyword-matched';
}

export function tagProduct(title: string, description = ''): TagResult {
  const text = `${title} ${description}`.toLowerCase();

  const pestTypes = (Object.keys(PEST_KEYWORDS) as PestType[]).filter((k) => matchAny(text, PEST_KEYWORDS[k]));
  const productTypes = (Object.keys(PRODUCT_KEYWORDS) as ProductType[]).filter((k) => matchAny(text, PRODUCT_KEYWORDS[k]));
  const locations = (Object.keys(LOCATION_KEYWORDS) as Location[]).filter((k) => matchAny(text, LOCATION_KEYWORDS[k]));

  const restricted = RESTRICTED_KEYWORDS.some((k) => text.includes(k));
  const useCases: UseCase[] = [restricted ? 'professional' : 'diy_homeowner'];
  if (productTypes.includes('trap') || text.includes('monitor')) useCases.push('monitoring');
  if (text.includes('prevent')) useCases.push('prevention');
  if (productTypes.includes('bait') || productTypes.includes('concentrate') || productTypes.includes('spray') || productTypes.includes('foam')) {
    useCases.push('active_treatment');
  }

  let skillLevel: TagResult['skillLevel'] = 'beginner';
  if (productTypes.includes('concentrate') || productTypes.includes('foam')) skillLevel = 'intermediate';
  if (restricted) skillLevel = 'advanced';

  return {
    pestTypes: pestTypes.length ? pestTypes : ['general'],
    productTypes,
    locations,
    useCases: [...new Set(useCases)],
    skillLevel,
    safetyFlags: restricted ? ['restricted_use'] : [],
    confidence: 'keyword-matched',
  };
}
