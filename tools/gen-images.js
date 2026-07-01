/**
 * Global Pest Supplies — Product image generator
 * Renders a branded "studio shot" SVG per product → HTML files (1200x1200)
 * which are then rasterized to PNG via headless Chrome.
 *
 * Style: soft studio gradient background, realistically shaded vector
 * packaging (bottle / jug / aerosol / shaker / syringe / station / pail /
 * box / bag / sprayer / tub / duster / wall-unit), branded GPS label with
 * product name, active ingredient, size and a pest-coloured accent.
 * No emojis, no cartoon bugs.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'tools', 'render-out');
fs.mkdirSync(OUT, { recursive: true });

// pest -> accent colour
const PEST_COLOR = {
  ants:        '#C2410C',
  cockroaches: '#92400E',
  rodents:     '#475569',
  mosquitoes:  '#0E7490',
  termites:    '#7C2D12',
  bedbugs:     '#9F1239',
  fleas:       '#6D28D9',
  wasps:       '#B45309',
  spiders:     '#334155',
  general:     '#1E6BFF',
  natural:     '#15803D',
};

const BLUE = '#1E6BFF';
const NAVY = '#0A1628';

// Curated per-product render config:
// type = container shape, name = bold label line(s), accent = pest key, natural flag
const P = {
  'gps-broad-spectrum-concentrate-79': { type:'bottle', name:'DEFENDER 7.9', sub:'Broad-Spectrum Concentrate', ai:'Bifenthrin 7.9%', size:'32 OZ', accent:'general' },
  'gps-pro-concentrate-251':           { type:'jug',    name:'DEFENDER XTS', sub:'Pro Concentrate 25.1%', ai:'Bifenthrin 25.1%', size:'1 GAL', accent:'general' },
  'gps-roach-gel-bait':                { type:'syringe',name:'ROACHOUT', sub:'Advanced Gel Bait', ai:'Indoxacarb 0.6%', size:'30 G', accent:'cockroaches' },
  'gps-ant-gel-bait':                  { type:'syringe',name:'ANTSTOP', sub:'Sweet & Protein Gel', ai:'Imidacloprid 0.05%', size:'30 G', accent:'ants' },
  'gps-rodent-bait-station':           { type:'station',name:'GUARDIAN', sub:'Rodent Bait Station', ai:'Tamper-Resistant', size:'2-PACK', accent:'rodents' },
  'gps-rodent-bait-blocks':            { type:'pail',   name:'GUARDIAN', sub:'Rodenticide Bait Blocks', ai:'Bromadiolone', size:'4 LB', accent:'rodents' },
  'gps-snap-trap-6pk':                 { type:'box',    name:'QUICKSET', sub:'Easy-Trigger Snap Traps', ai:'Rat & Mouse', size:'6-PACK', accent:'rodents' },
  'gps-glue-boards-12pk':              { type:'box',    name:'STICKFAST', sub:'Glue Boards', ai:'Rodent & Insect', size:'12-PACK', accent:'rodents' },
  'gps-mosquito-yard-concentrate':     { type:'bottle', name:'YARDCLEAR', sub:'Mosquito & Tick Concentrate', ai:'Lambda-Cyhalothrin', size:'32 OZ', accent:'mosquitoes' },
  'gps-bed-bug-kit':                   { type:'kit',    name:'BED BUG', sub:'Elimination Kit', ai:'Spray · Dust · Aerosol', size:'FULL ROOM', accent:'bedbugs' },
  'gps-bed-bug-spray':                 { type:'rtu',    name:'BUGLOCK', sub:'Bed Bug & Flea Spray', ai:'Imidacloprid + β-Cyfluthrin', size:'1 GAL', accent:'bedbugs' },
  'gps-insecticide-dust':              { type:'shaker', name:'VOIDGUARD', sub:'Insecticide Dust', ai:'Deltamethrin 0.05%', size:'1 LB', accent:'general' },
  'gps-termite-foam':                  { type:'aerosol',name:'TERMSHIELD', sub:'Termite & Ant Foam', ai:'Fipronil 0.005%', size:'18 OZ', accent:'termites' },
  'gps-termite-bait-system':           { type:'kit',    name:'TERMSHIELD', sub:'In-Ground Bait System', ai:'Noviflumuron', size:'10 STATIONS', accent:'termites' },
  'gps-wasp-hornet-spray':             { type:'aerosol',name:'STRIKEJET', sub:'Wasp & Hornet Jet Spray', ai:'20 FT Reach', size:'20 OZ', accent:'wasps' },
  'gps-flea-tick-igr-concentrate':     { type:'bottle', name:'FLEAFREE', sub:'Flea & Tick + IGR', ai:'Permethrin + Pyriproxyfen', size:'16 OZ', accent:'fleas' },
  'gps-pump-sprayer-1gal':             { type:'sprayer',name:'PROMIST', sub:'1-Gallon Pump Sprayer', ai:'Chemical-Resistant', size:'1 GAL', accent:'general' },
  'gps-hand-duster':                   { type:'duster', name:'PROMIST', sub:'Bellows Hand Duster', ai:'Precision Tip', size:'4 OZ', accent:'general' },
  'gps-ant-kit':                       { type:'kit',    name:'ANT CONTROL', sub:'Complete Kit', ai:'Spray · Gel · Stations', size:'INDOOR+OUT', accent:'ants' },
  'gps-roach-kit':                     { type:'kit',    name:'COCKROACH', sub:'Complete Control Kit', ai:'Gel · Dust · IGR', size:'FULL SYSTEM', accent:'cockroaches' },
  'gps-rodent-kit':                    { type:'kit',    name:'RODENT', sub:'Complete Control Kit', ai:'Stations · Bait · Traps', size:'RATS & MICE', accent:'rodents' },
  'gps-mosquito-kit':                  { type:'kit',    name:'MOSQUITO', sub:'Yard Defense Kit', ai:'Barrier + Larvicide', size:'SEASON', accent:'mosquitoes' },
  'gps-mosquito-larvicide-dunks':      { type:'tub',    name:'AQUASTOP', sub:'Larvicide Dunks', ai:'Bti — Pet Safe', size:'6-PACK', accent:'natural' },
  'gps-spider-spray':                  { type:'bottle', name:'WEBBREAKER', sub:'Spider & Scorpion Conc.', ai:'Cypermethrin 25.4%', size:'16 OZ', accent:'spiders' },
  'gps-fly-light-trap':                { type:'wall',   name:'CLEARZONE', sub:'Indoor Fly Light Trap', ai:'UV Glue-Board', size:'COMMERCIAL', accent:'general' },
  'gps-granular-insect-bait':          { type:'bag',    name:'TURFGUARD', sub:'Granular Lawn Insect Bait', ai:'Bifenthrin 0.2%', size:'10 LB', accent:'general' },
  'gps-natural-diatomaceous-earth':    { type:'bag',    name:'PUREGUARD', sub:'Diatomaceous Earth', ai:'100% Amorphous Silica', size:'4 LB', accent:'natural' },
  'gps-pro-starter-bundle':            { type:'kit',    name:'PRO STARTER', sub:'Business Bundle', ai:'Full Pro Kit', size:'STARTER', accent:'general' },
};

const esc = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

// ---- Brand wordmark + label block, reused on every container face ----
// x,y = top-left of label; w = width; light = light label bg
function label(cfg, x, y, w, opts={}) {
  const accent = PEST_COLOR[cfg.accent] || BLUE;
  const h = opts.h || 150;
  const dark = opts.dark;
  const bg = dark ? NAVY : '#ffffff';
  const fg = dark ? '#ffffff' : NAVY;
  const muted = dark ? '#9DB4D6' : '#5A6B85';
  const r = 10;
  const cx = x + w/2;
  return `
  <g font-family="'Segoe UI',Arial,sans-serif">
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${bg}" stroke="${accent}" stroke-width="2"/>
    <rect x="${x}" y="${y}" width="${w}" height="6" rx="3" fill="${accent}"/>
    <text x="${cx}" y="${y+30}" text-anchor="middle" fill="${accent}" font-size="13" font-weight="700" letter-spacing="3">GLOBAL PEST SUPPLIES</text>
    <text x="${cx}" y="${y+62}" text-anchor="middle" fill="${fg}" font-size="27" font-weight="800" letter-spacing="0.5">${esc(cfg.name)}</text>
    <text x="${cx}" y="${y+84}" text-anchor="middle" fill="${muted}" font-size="14" font-weight="600">${esc(cfg.sub)}</text>
    <line x1="${x+24}" y1="${y+100}" x2="${x+w-24}" y2="${y+100}" stroke="${accent}" stroke-opacity="0.3" stroke-width="1"/>
    <text x="${cx}" y="${y+122}" text-anchor="middle" fill="${fg}" font-size="14" font-weight="700">${esc(cfg.ai)}</text>
    <rect x="${cx-44}" y="${y+h-30}" width="88" height="22" rx="11" fill="${accent}"/>
    <text x="${cx}" y="${y+h-15}" text-anchor="middle" fill="#fff" font-size="13" font-weight="800" letter-spacing="1">${esc(cfg.size)}</text>
  </g>`;
}

// shared studio background + contact shadow
function frame(inner, shadowCx=600, shadowW=300) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1200" viewBox="0 0 1200 1200">
  <defs>
    <radialGradient id="bg" cx="50%" cy="42%" r="75%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="60%" stop-color="#eef2f7"/>
      <stop offset="100%" stop-color="#d8e0ea"/>
    </radialGradient>
    <linearGradient id="capG" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#2b3a52"/><stop offset="50%" stop-color="#13233d"/><stop offset="100%" stop-color="#0a1628"/>
    </linearGradient>
    <linearGradient id="blueCap" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#4d8bff"/><stop offset="50%" stop-color="#1E6BFF"/><stop offset="100%" stop-color="#0d4fd6"/>
    </linearGradient>
    <linearGradient id="bodyL" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#cfd8e4"/><stop offset="18%" stop-color="#ffffff"/><stop offset="50%" stop-color="#f3f6fa"/><stop offset="82%" stop-color="#ffffff"/><stop offset="100%" stop-color="#c4cedd"/>
    </linearGradient>
    <linearGradient id="amber" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#a8741f"/><stop offset="20%" stop-color="#f0c97a"/><stop offset="50%" stop-color="#d9a23f"/><stop offset="82%" stop-color="#f0c97a"/><stop offset="100%" stop-color="#9c6a1a"/>
    </linearGradient>
    <linearGradient id="kraft" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#b8843f"/><stop offset="20%" stop-color="#e8c089"/><stop offset="50%" stop-color="#d2a05f"/><stop offset="82%" stop-color="#e8c089"/><stop offset="100%" stop-color="#ad7a36"/>
    </linearGradient>
    <linearGradient id="cardboard" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#cbb187"/><stop offset="15%" stop-color="#efe0c4"/><stop offset="50%" stop-color="#e2cda3"/><stop offset="85%" stop-color="#efe0c4"/><stop offset="100%" stop-color="#c4a87c"/>
    </linearGradient>
    <linearGradient id="redbody" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#7a1226"/><stop offset="20%" stop-color="#e23a55"/><stop offset="50%" stop-color="#b51e38"/><stop offset="82%" stop-color="#e23a55"/><stop offset="100%" stop-color="#6e1020"/>
    </linearGradient>
    <radialGradient id="hl" cx="35%" cy="22%" r="60%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.85"/><stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
    <filter id="soft" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="14" stdDeviation="18" flood-color="#0a1628" flood-opacity="0.22"/>
    </filter>
  </defs>
  <rect width="1200" height="1200" fill="url(#bg)"/>
  <ellipse cx="${shadowCx}" cy="1000" rx="${shadowW}" ry="48" fill="#0a1628" opacity="0.16"/>
  ${inner}
</svg>`;
}

// ---------- container shapes ----------
function bottle(cfg) {
  const body = `
    <rect x="475" y="250" width="250" height="70" rx="14" fill="url(#capG)"/>
    <rect x="495" y="225" width="210" height="40" rx="8" fill="url(#capG)"/>
    <path d="M470 320 q-30 30 -30 90 v370 q0 40 40 40 h240 q40 0 40 -40 v-370 q0 -60 -30 -90 z" fill="url(#bodyL)" stroke="#b9c4d4" stroke-width="2"/>
    <path d="M470 320 q-30 30 -30 90 v370 q0 40 40 40 h60 v-500 z" fill="url(#hl)"/>
    ${label(cfg, 480, 410, 240, {h:260})}`;
  return frame(body, 600, 250);
}
function jug(cfg) {
  const body = `
    <rect x="520" y="215" width="120" height="55" rx="10" fill="url(#blueCap)"/>
    <path d="M430 270 h300 q26 0 26 40 v420 q0 40 -40 40 h-272 q-40 0 -40 -40 v-420 q0 -40 26 -40z" fill="url(#bodyL)" stroke="#b9c4d4" stroke-width="2"/>
    <path d="M735 330 q55 0 55 60 v70 q0 60 -55 60 z" fill="url(#bodyL)" stroke="#b9c4d4" stroke-width="2"/>
    <path d="M430 270 h120 v530 h-94 q-40 0 -40 -40 v-420 q0-40 14-70z" fill="url(#hl)"/>
    ${label(cfg, 452, 380, 256, {h:300})}`;
  return frame(body, 600, 270);
}
function rtu(cfg) { // ready-to-use jug w/ trigger
  const body = `
    <path d="M620 210 q120 -10 150 70 l28 70 q10 30 -22 30 h-70 z" fill="url(#capG)"/>
    <rect x="600" y="250" width="60" height="60" fill="url(#capG)"/>
    <path d="M430 300 h300 q26 0 26 40 v420 q0 40 -40 40 h-272 q-40 0 -40 -40 v-420 q0 -40 26 -40z" fill="url(#bodyL)" stroke="#b9c4d4" stroke-width="2"/>
    <path d="M430 300 h120 v500 h-94 q-40 0 -40 -40 v-420 q0-40 14-40z" fill="url(#hl)"/>
    ${label(cfg, 452, 400, 256, {h:290})}`;
  return frame(body, 600, 270);
}
function aerosol(cfg) {
  const body = `
    <rect x="540" y="190" width="120" height="55" rx="10" fill="url(#capG)"/>
    <rect x="560" y="160" width="40" height="40" rx="6" fill="url(#capG)"/>
    <rect x="555" y="245" width="90" height="30" rx="6" fill="#1b2c47"/>
    <rect x="500" y="275" width="200" height="540" rx="26" fill="url(#bodyL)" stroke="#b9c4d4" stroke-width="2"/>
    <rect x="500" y="275" width="70" height="540" rx="26" fill="url(#hl)"/>
    <ellipse cx="600" cy="800" rx="100" ry="20" fill="#c4cedd" opacity="0.6"/>
    ${label(cfg, 515, 360, 170, {h:330})}`;
  return frame(body, 600, 210);
}
function shaker(cfg) {
  const body = `
    <rect x="500" y="230" width="200" height="60" rx="10" fill="url(#blueCap)"/>
    <g fill="#0d4fd6"><circle cx="545" cy="248" r="5"/><circle cx="575" cy="240" r="5"/><circle cx="605" cy="252" r="5"/><circle cx="635" cy="242" r="5"/><circle cx="660" cy="250" r="5"/></g>
    <rect x="485" y="290" width="230" height="520" rx="22" fill="url(#bodyL)" stroke="#b9c4d4" stroke-width="2"/>
    <rect x="485" y="290" width="78" height="520" rx="22" fill="url(#hl)"/>
    ${label(cfg, 503, 380, 194, {h:340})}`;
  return frame(body, 600, 230);
}
function syringe(cfg) {
  const accent = PEST_COLOR[cfg.accent] || BLUE;
  const body = `
    <g transform="rotate(-18 600 560)">
      <rect x="300" y="500" width="470" height="120" rx="26" fill="url(#bodyL)" stroke="#b9c4d4" stroke-width="2"/>
      <rect x="300" y="500" width="470" height="46" rx="20" fill="url(#hl)"/>
      <rect x="760" y="520" width="120" height="80" rx="14" fill="url(#capG)"/>
      <path d="M880 545 l70 13 v14 l-70 13z" fill="#1b2c47"/>
      <rect x="250" y="515" width="60" height="90" rx="10" fill="url(#blueCap)"/>
      <rect x="210" y="535" width="46" height="50" rx="8" fill="url(#capG)"/>
      <rect x="330" y="528" width="300" height="64" rx="10" fill="${accent}" opacity="0.92"/>
    </g>
    ${label(cfg, 360, 660, 480, {h:170})}`;
  return frame(body, 600, 280);
}
function station(cfg) {
  const accent = PEST_COLOR[cfg.accent] || BLUE;
  const body = `
    <path d="M380 470 q0 -40 40 -40 h360 q40 0 40 40 v300 q0 30 -30 30 h-380 q-30 0 -30 -30z" fill="url(#capG)"/>
    <path d="M380 470 q0 -40 40 -40 h360 q40 0 40 40 v40 h-440z" fill="#2b3a52"/>
    <rect x="430" y="700" width="60" height="80" rx="8" fill="#0a1628"/>
    <circle cx="600" cy="500" r="26" fill="${accent}"/>
    <path d="M590 500 l8 8 16 -18" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    ${label(cfg, 400, 540, 400, {h:150, dark:true})}`;
  return frame(body, 600, 280);
}
function pail(cfg) {
  const body = `
    <path d="M430 360 h340 l-20 440 q-3 30 -33 30 h-234 q-30 0 -33 -30z" fill="url(#bodyL)" stroke="#b9c4d4" stroke-width="2"/>
    <path d="M430 360 h120 l-10 470 h-67 q-30 0 -33 -30z" fill="url(#hl)"/>
    <rect x="412" y="330" width="376" height="44" rx="14" fill="url(#blueCap)"/>
    <path d="M450 330 q150 -70 300 0" fill="none" stroke="#1b2c47" stroke-width="8"/>
    ${label(cfg, 452, 430, 296, {h:300})}`;
  return frame(body, 600, 250);
}
function box(cfg) {
  const body = `
    <path d="M390 360 l210 -70 210 70 v420 l-210 70 -210 -70z" fill="url(#cardboard)" stroke="#b89a6a" stroke-width="2"/>
    <path d="M600 290 l210 70 -210 70 -210 -70z" fill="#f3e6cd" stroke="#b89a6a" stroke-width="2"/>
    <path d="M600 430 v420 l210 -70 v-420z" fill="#d8bf94" opacity="0.65"/>
    ${labelOnFace(cfg)}`;
  return frame(body, 600, 250);
}
function kit(cfg) {
  // larger box, "KIT" feel, multiple-product hint
  const body = `
    <path d="M360 350 l240 -80 240 80 v430 l-240 80 -240 -80z" fill="url(#cardboard)" stroke="#b89a6a" stroke-width="2"/>
    <path d="M600 270 l240 80 -240 80 -240 -80z" fill="#f5ead2" stroke="#b89a6a" stroke-width="2"/>
    <path d="M600 430 v430 l240 -80 v-430z" fill="#d6bd91" opacity="0.7"/>
    ${labelOnFace(cfg, true)}`;
  return frame(body, 600, 270);
}
function labelOnFace(cfg, big) {
  // label sits on the angled front-left face of the box
  const x = big ? 388 : 412, y = big ? 430 : 430, w = big ? 200 : 178, h = big ? 270 : 250;
  const accent = PEST_COLOR[cfg.accent] || BLUE;
  const cx = x + w/2;
  return `
  <g font-family="'Segoe UI',Arial,sans-serif" transform="skewY(18.4)">
    <g transform="translate(0, ${-x*0.333})">
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="#ffffff" stroke="${accent}" stroke-width="2"/>
    <rect x="${x}" y="${y}" width="${w}" height="6" fill="${accent}"/>
    <text x="${cx}" y="${y+28}" text-anchor="middle" fill="${accent}" font-size="11" font-weight="700" letter-spacing="2">GLOBAL PEST SUPPLIES</text>
    <text x="${cx}" y="${y+58}" text-anchor="middle" fill="${NAVY}" font-size="23" font-weight="800">${esc(cfg.name)}</text>
    <text x="${cx}" y="${y+80}" text-anchor="middle" fill="#5A6B85" font-size="13" font-weight="600">${esc(cfg.sub)}</text>
    <line x1="${x+18}" y1="${y+96}" x2="${x+w-18}" y2="${y+96}" stroke="${accent}" stroke-opacity="0.3"/>
    <text x="${cx}" y="${y+120}" text-anchor="middle" fill="${NAVY}" font-size="13" font-weight="700">${esc(cfg.ai)}</text>
    <rect x="${cx-42}" y="${y+h-34}" width="84" height="22" rx="11" fill="${accent}"/>
    <text x="${cx}" y="${y+h-19}" text-anchor="middle" fill="#fff" font-size="12" font-weight="800" letter-spacing="1">${esc(cfg.size)}</text>
    </g>
  </g>`;
}
function bag(cfg) {
  const accent = PEST_COLOR[cfg.accent] || BLUE;
  const body = `
    <path d="M420 300 q180 -28 360 0 q24 4 24 30 v430 q0 30 -30 30 h-348 q-30 0 -30 -30 v-430 q0 -26 24 -30z" fill="url(#bodyL)" stroke="#b9c4d4" stroke-width="2"/>
    <path d="M420 300 q180 -28 360 0 v40 q-180 -24 -360 0z" fill="#cdd6e2"/>
    <path d="M420 330 h150 v490 h-120 q-30 0 -30 -30z" fill="url(#hl)"/>
    ${label(cfg, 450, 410, 300, {h:300})}`;
  return frame(body, 600, 250);
}
function sprayer(cfg) {
  const body = `
    <ellipse cx="600" cy="790" rx="150" ry="34" fill="#c4cedd"/>
    <path d="M460 460 q0 -30 30 -30 h220 q30 0 30 30 v300 q0 40 -40 40 h-200 q-40 0 -40 -40z" fill="url(#bodyL)" stroke="#b9c4d4" stroke-width="2"/>
    <rect x="560" y="270" width="34" height="170" fill="#1b2c47"/>
    <rect x="500" y="250" width="160" height="34" rx="8" fill="url(#blueCap)"/>
    <path d="M660 300 q120 0 120 90 v40" stroke="#1b2c47" stroke-width="14" fill="none"/>
    <rect x="772" y="420" width="26" height="120" rx="8" fill="#1b2c47"/>
    <path d="M460 460 h90 v340 h-50 q-40 0 -40 -40z" fill="url(#hl)"/>
    ${label(cfg, 480, 500, 240, {h:250})}`;
  return frame(body, 600, 260);
}
function duster(cfg) {
  const body = `
    <path d="M470 420 q0 -26 26 -26 h208 q26 0 26 26 v300 q0 30 -30 30 h-200 q-30 0 -30 -30z" fill="url(#blueCap)" stroke="#0d4fd6" stroke-width="2"/>
    <ellipse cx="600" cy="420" rx="130" ry="26" fill="#2b3a52"/>
    <rect x="585" y="250" width="30" height="170" fill="#1b2c47"/>
    <path d="M600 250 q-2 -40 40 -54" stroke="#1b2c47" stroke-width="12" fill="none"/>
    <path d="M470 420 h70 v304 h-40 q-30 0 -30 -30z" fill="#ffffff" opacity="0.18"/>
    ${label(cfg, 488, 470, 224, {h:240, dark:true})}`;
  return frame(body, 600, 250);
}
function tub(cfg) {
  const body = `
    <path d="M440 420 h320 l-16 350 q-3 28 -31 28 h-226 q-28 0 -31 -28z" fill="url(#bodyL)" stroke="#b9c4d4" stroke-width="2"/>
    <ellipse cx="600" cy="420" rx="160" ry="34" fill="url(#blueCap)"/>
    <ellipse cx="600" cy="412" rx="150" ry="28" fill="#3a7bff"/>
    <path d="M455 430 h120 l-12 360 h-80 q-28 0 -31 -28z" fill="url(#hl)"/>
    ${label(cfg, 470, 470, 260, {h:280})}`;
  return frame(body, 600, 230);
}
function wall(cfg) {
  const accent = PEST_COLOR[cfg.accent] || BLUE;
  const body = `
    <rect x="380" y="340" width="440" height="300" rx="26" fill="url(#bodyL)" stroke="#b9c4d4" stroke-width="2"/>
    <rect x="380" y="340" width="120" height="300" rx="26" fill="url(#hl)"/>
    <rect x="430" y="400" width="340" height="80" rx="12" fill="#1b2c47"/>
    <rect x="445" y="415" width="310" height="50" rx="8" fill="#7b5cff" opacity="0.85"/>
    <rect x="450" y="560" width="300" height="40" rx="8" fill="#e7edf5" stroke="#c4cedd"/>
    ${label(cfg, 400, 660, 400, {h:170})}`;
  return frame(body, 600, 250);
}

const SHAPES = { bottle, jug, rtu, aerosol, shaker, syringe, station, pail, box, kit, bag, sprayer, duster, tub, wall };

const products = JSON.parse(fs.readFileSync(path.join(ROOT,'data','products.json'),'utf8')).products;
let count = 0;
for (const prod of products) {
  const cfg = P[prod.handle];
  if (!cfg) { console.error('NO CONFIG for', prod.handle); continue; }
  const fn = SHAPES[cfg.type];
  if (!fn) { console.error('NO SHAPE', cfg.type); continue; }
  const svg = fn(cfg);
  const html = `<!doctype html><html><head><meta charset="utf-8"><style>*{margin:0;padding:0}html,body{width:1200px;height:1200px;overflow:hidden}</style></head><body>${svg}</body></html>`;
  fs.writeFileSync(path.join(OUT, prod.handle + '.html'), html);
  fs.writeFileSync(path.join(OUT, prod.handle + '.svg'), svg);
  count++;
}
console.log('Generated', count, 'product render files in', OUT);
