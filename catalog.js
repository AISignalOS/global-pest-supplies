/**
 * Global Pest Supplies — Storefront catalog (single source of truth)
 * Connects the marketing UI to the live Shopify store:
 *   • product pages  → STORE/products/<handle>
 *   • add to cart    → STORE/cart/<variantId>:1   (real Shopify cart + checkout)
 *   • collections    → STORE/collections/<handle>
 *   • blog           → STORE/blogs/pest-control-guides/<article>
 * Product images are served from the Shopify CDN (same assets as the store).
 */
const STORE = 'https://global-pest-supplies.myshopify.com';
const CDN = 'https://cdn.shopify.com/s/files/1/0985/2600/3571/files/';

const CATALOG = [
  { h:'gps-broad-spectrum-concentrate-79', name:'Defender 7.9 Concentrate', blurb:'Bifenthrin 7.9% — controls 75+ pests, makes 96 gal.', price:44.99, was:59.99, v:'63018862838131', pests:['ants','mosquitoes','fleas','spiders','wasps','general'], tier:'DIY', best:true, rating:5, ai:'Bifenthrin 7.9%', yld:'Makes 96 gal' },
  { h:'gps-pro-concentrate-251', name:'Defender XTS 25.1 Pro', blurb:'Pro-grade 25.1% bifenthrin — 1 gal makes 320 gal.', price:99.95, was:124.95, v:'63018862870899', pests:['ants','mosquitoes','fleas','spiders','wasps','general'], tier:'Professional', rating:5, ai:'Bifenthrin 25.1%', yld:'Makes 320 gal', restrictedStates:['NY','CA'] },
  { h:'gps-roach-gel-bait', name:'RoachOut Gel Bait', blurb:'Indoxacarb 0.6% — wipes out the whole colony.', price:28.99, was:36.99, v:'63018862936435', pests:['cockroaches'], tier:'DIY', best:true, rating:5, ai:'Indoxacarb 0.6%', yld:'Colony elimination' },
  { h:'gps-ant-gel-bait', name:'AntStop Gel Bait', blurb:'Sweet & protein gel — foragers carry it to the queen.', price:21.99, was:27.99, v:'63018863264115', pests:['ants'], tier:'DIY', rating:5, ai:'Sweet & protein bait matrix', yld:'Colony-level kill' },
  { h:'gps-rodent-bait-station', name:'Guardian Bait Station (2-pk)', blurb:'Tamper-resistant & lockable — child & pet safe.', price:34.99, was:44.99, v:'63018863296883', pests:['rodents'], tier:'DIY', best:true, rating:5, ai:'Lockable tamper-resistant housing', yld:'2-pack' },
  { h:'gps-rodent-bait-blocks', name:'Guardian Bait Blocks (4 lb)', blurb:'Bromadiolone blocks — weatherproof, single-feed kill.', price:39.99, was:49.99, v:'63018863329651', pests:['rodents'], tier:'Professional', rating:4, ai:'Bromadiolone 0.005%', yld:'4 lb, single-feed', restrictedStates:['NY','CA'] },
  { h:'gps-snap-trap-6pk', name:'QuickSet Snap Traps (6-pk)', blurb:'Reusable, one-touch set — poison-free rat & mouse.', price:19.99, was:26.99, v:'63018868900211', pests:['rodents'], tier:'DIY', rating:4, ai:'Poison-free mechanical trap', yld:'6-pack' },
  { h:'gps-glue-boards-12pk', name:'StickFast Glue Boards (12-pk)', blurb:'Pre-baited monitoring & capture for mice & insects.', price:16.99, was:22.99, v:'63018868932979', pests:['rodents','spiders','general'], tier:'DIY', rating:4, ai:'Non-toxic adhesive board', yld:'12-pack' },
  { h:'gps-mosquito-yard-concentrate', name:'YardClear Mosquito & Tick', blurb:'Lambda-cyhalothrin — up to 4 weeks of yard control.', price:32.99, was:42.99, v:'63018869293427', pests:['mosquitoes','fleas'], tier:'DIY', rating:5, ai:'Lambda-cyhalothrin', yld:'Up to 4 weeks' },
  { h:'gps-bed-bug-kit', name:'Bed Bug Elimination Kit', blurb:'Spray, dust, aerosol, encasements — full-room system.', price:119.99, was:159.99, v:'63018869326195', pests:['bedbugs'], tier:'DIY', best:true, rating:5, ai:'Multi-active system', yld:'Full-room treatment', bundleValue:179.97 },
  { h:'gps-bed-bug-spray', name:'BugLock Bed Bug & Flea Spray', blurb:'Ready-to-use — kills resistant strains, no mixing.', price:26.99, was:33.99, v:'63018869358963', pests:['bedbugs','fleas'], tier:'DIY', rating:4, ai:'Ready-to-use contact killer', yld:'No mixing required' },
  { h:'gps-insecticide-dust', name:'VoidGuard Insecticide Dust', blurb:'Deltamethrin — up to 6 months in voids & cracks.', price:17.99, was:23.99, v:'63018869424499', pests:['cockroaches','ants','bedbugs','spiders','general'], tier:'DIY', rating:5, ai:'Deltamethrin', yld:'Up to 6 months' },
  { h:'gps-termite-foam', name:'TermShield Termite Foam', blurb:'Fipronil expanding foam — fills galleries & nests.', price:29.99, was:38.99, v:'63018874929523', pests:['termites','ants'], tier:'Professional', rating:5, ai:'Fipronil', yld:'Fills galleries & nests', restrictedStates:['NY','CA'] },
  { h:'gps-termite-bait-system', name:'TermShield Bait System (10)', blurb:'In-ground monitoring & colony elimination.', price:129.99, was:169.99, v:'63018874995059', pests:['termites'], tier:'Professional', rating:5, ai:'In-ground bait stations', yld:'10-station system' },
  { h:'gps-wasp-hornet-spray', name:'StrikeJet Wasp & Hornet', blurb:'20 ft jet stream — instant knockdown from a distance.', price:12.99, was:16.99, v:'63018875027827', pests:['wasps'], tier:'DIY', rating:4, ai:'Aerosol jet spray', yld:'20 ft range' },
  { h:'gps-flea-tick-igr-concentrate', name:'FleaFree Flea & Tick + IGR', blurb:'Growth regulator breaks the life cycle up to 7 months.', price:27.99, was:35.99, v:'63018875355507', pests:['fleas'], tier:'DIY', rating:5, ai:'Adulticide + IGR', yld:'Up to 7 months' },
  { h:'gps-pump-sprayer-1gal', name:'ProMist 1-Gal Pump Sprayer', blurb:'Chemical-resistant seals, adjustable brass nozzle.', price:24.99, was:32.99, v:'63018875421043', pests:['general'], tier:'DIY', rating:4, ai:'Chemical-resistant pump sprayer', yld:'1 gal capacity' },
  { h:'gps-hand-duster', name:'ProMist Bellows Hand Duster', blurb:'Precision tip for dust in voids, cracks & outlets.', price:14.99, was:19.99, v:'63018875453811', pests:['general'], tier:'DIY', rating:4, ai:'Bellows hand duster', yld:'Precision tip' },
  { h:'gps-ant-kit', name:'Complete Ant Control Kit', blurb:'Spray + gel + 12 stations with a step-by-step plan.', price:49.99, was:64.99, v:'63018881941875', pests:['ants'], tier:'DIY', best:true, rating:5, ai:'Multi-product system', yld:'Spray + gel + 12 stations', bundleValue:74.98 },
  { h:'gps-roach-kit', name:'Complete Cockroach Kit', blurb:'Gel, dust, IGR & monitors — kills colony + next gen.', price:54.99, was:69.99, v:'63018881974643', pests:['cockroaches'], tier:'DIY', best:true, rating:5, ai:'Multi-product system', yld:'Gel + dust + IGR + monitors', bundleValue:82.98 },
  { h:'gps-rodent-kit', name:'Complete Rodent Control Kit', blurb:'Stations, bait, snap traps & glue boards + map.', price:59.99, was:79.99, v:'63018882040179', pests:['rodents'], tier:'DIY', rating:5, ai:'Multi-product system', yld:'Stations + bait + traps + boards', bundleValue:89.98 },
  { h:'gps-mosquito-kit', name:'Mosquito Yard Defense Kit', blurb:'Barrier spray + Bti larvicide + sprayer.', price:69.99, was:89.99, v:'63018882072947', pests:['mosquitoes'], tier:'DIY', best:true, rating:5, ai:'Barrier spray + Bti larvicide', yld:'Includes sprayer', bundleValue:104.98 },
  { h:'gps-mosquito-larvicide-dunks', name:'AquaStop Larvicide Dunks (6)', blurb:'Bti dunks kill larvae — safe for fish, pets & birds.', price:13.99, was:18.99, v:'63018882105715', pests:['mosquitoes'], tier:'DIY', rating:5, ai:'Bti (Bacillus thuringiensis)', yld:'6-pack' },
  { h:'gps-spider-spray', name:'WebBreaker Spider & Scorpion', blurb:'Cypermethrin 25.4% — up to 90 days of control.', price:23.99, was:30.99, v:'63018882433395', pests:['spiders','general'], tier:'DIY', rating:4, ai:'Cypermethrin 25.4%', yld:'Up to 90 days' },
  { h:'gps-fly-light-trap', name:'ClearZone Fly Light Trap', blurb:'Discreet UV glue-board catcher for kitchens.', price:79.99, was:99.99, v:'63018886136179', pests:['general'], tier:'Professional', rating:4, ai:'UV glue-board trap', yld:'Discreet catch' },
  { h:'gps-granular-insect-bait', name:'TurfGuard Lawn Granules (10 lb)', blurb:'Bifenthrin granules — ants, fleas, ticks for 3 months.', price:36.99, was:46.99, v:'63018886168947', pests:['ants','general'], tier:'DIY', rating:4, ai:'Bifenthrin granules', yld:'10 lb, 3 months' },
  { h:'gps-natural-diatomaceous-earth', name:'PureGuard Diatomaceous Earth', blurb:'100% silica — chemical-free crawling-insect powder.', price:19.99, was:25.99, v:'63018886562163', pests:['ants','cockroaches','bedbugs','fleas','general'], tier:'DIY', rating:5, ai:'100% silica (diatomaceous earth)', yld:'Chemical-free' },
  { h:'gps-pro-starter-bundle', name:'Pro Starter Bundle', blurb:'Everything to launch a pest-control route, bundled.', price:249.99, was:329.99, v:'63018886955379', pests:['general'], tier:'Professional', rating:5, ai:'Multi-product route bundle', yld:'Full route starter kit', bundleValue:379.98 },
];

/* ── Mock B2B / Pro auth + wholesale pricing ─────────────────────────
   Demo-only local state (toggled from the nav "DIY / Pro" pill in
   gps-shell.js). Professional-tier products require Pro status to
   purchase; Pro accounts get a wholesale multiplier on those items. */
const PRO_MULTIPLIER = 0.85; // 15% wholesale discount for Pro accounts
function isProUser() { return localStorage.getItem('gps_is_pro') === '1'; }
function setProUser(v) { localStorage.setItem('gps_is_pro', v ? '1' : '0'); }

CATALOG.forEach(p => {
  p.img = CDN + p.h + '.png';
  p.url = STORE + '/products/' + p.h;
  p.cart = STORE + '/cart/' + p.v + ':1';
});

const COLLECTIONS = {
  ants:'ant-control', cockroaches:'cockroach-control', rodents:'rodent-control', mosquitoes:'mosquito-control',
  termites:'termite-control', bedbugs:'bed-bug-control', fleas:'flea-tick-control', wasps:'wasps-spiders', spiders:'wasps-spiders'
};
const collectionUrl = pest => STORE + '/collections/' + (COLLECTIONS[pest] || 'best-sellers');
const BLOG = STORE + '/blogs/pest-control-guides';
const GUIDES = [
  { pest:'Ants',        h:'how-to-get-rid-of-ants',          title:'How to Get Rid of Ants for Good', blurb:'Why spraying makes it worse — and the bait-first method pros use to kill the whole colony.' },
  { pest:'Mosquitoes',  h:'mosquito-control-yard',           title:'Control Mosquitoes in Your Yard', blurb:'Hit adults and larvae at once for a bite-free yard all season long.' },
  { pest:'Rodents',     h:'rodent-control-for-restaurants',  title:'Rodent Control for Restaurants', blurb:'A compliance-ready, inspection-proof program of stations, traps & exclusion.' },
  { pest:'Termites',    h:'termite-prevention-guide',        title:'Termite Prevention for Homeowners', blurb:'Spot the warning signs early and protect your home with a baiting system.' },
  { pest:'Cockroaches', h:'how-to-get-rid-of-cockroaches',   title:'Get Rid of Cockroaches for Good', blurb:'The gel-bait-and-dust system that wipes out roaches and the next generation.' },
  { pest:'Bed Bugs',    h:'bed-bug-treatment-guide',         title:'Get Rid of Bed Bugs Yourself', blurb:'The disciplined multi-step plan that actually eliminates bed bugs at home.' },
];

const money = n => '$' + n.toFixed(2);
const stars = r => '★★★★★'.slice(0, r) + '☆☆☆☆☆'.slice(0, 5 - r);

function byPest(pest)  { return CATALOG.filter(p => p.pests.includes(pest)); }
function bestSellers() { return CATALOG.filter(p => p.best); }
function byHandle(h)   { return CATALOG.find(p => p.h === h); }

/* Card markup — image links to product page, button adds to the live cart */
function productCard(p, opts = {}) {
  const sale   = p.was > p.price;
  const pro    = typeof isProUser === 'function' && isProUser();
  const locked = p.tier === 'Professional' && !pro;
  const displayPrice = (p.tier === 'Professional' && pro) ? p.price * PRO_MULTIPLIER : p.price;
  const bundlePct = p.bundleValue ? Math.round((p.bundleValue - p.price) / p.bundleValue * 100) : 0;

  return `
  <article class="pcard">
    <a class="pcard-img" href="${p.url}" aria-label="${p.name}">
      ${p.best ? '<span class="pcard-badge">Best Seller</span>' : ''}
      ${bundlePct > 0 ? `<span class="pcard-bundle-badge">Save ${bundlePct}% as a kit</span>` : (sale ? `<span class="pcard-save">Save ${money(p.was - p.price)}</span>` : '')}
      <img src="${p.img}" alt="${p.name}" loading="lazy" width="300" height="300">
    </a>
    <div class="pcard-body">
      <a class="pcard-name" href="${p.url}">${p.name}</a>
      <p class="pcard-blurb">${p.blurb}</p>
      ${p.ai ? `<div class="pcard-mfields"><span><strong>AI:</strong> ${p.ai}</span><span><strong>Yield:</strong> ${p.yld}</span></div>` : ''}
      <div class="pcard-meta">
        <div class="stars" title="${p.rating} / 5">${stars(p.rating)}</div>
        <span class="pcard-tier">${p.tier}</span>
      </div>
      ${p.restrictedStates ? `<div class="pcard-restricted">⚠ Restricted in ${p.restrictedStates.join(', ')}</div>` : ''}
      <div class="pcard-foot">
        <div class="pcard-price">${money(displayPrice)}${pro && p.tier === 'Professional' ? '<span class="pcard-pro-tag">Pro Price</span>' : (sale ? `<span class="pcard-was">${money(p.was)}</span>` : '')}</div>
        ${locked
          ? `<a class="btn-shop btn-locked" href="account.html?mode=register" title="Professional accounts only">Upload License to Buy</a>`
          : `<button class="btn-shop" onclick="addToCart('${p.v}', this)">Add to Cart</button>`}
      </div>
    </div>
  </article>`;
}
