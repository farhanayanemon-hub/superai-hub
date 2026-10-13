// createRobot.js
// Framework-agnostic SVG robot generator for the EZBO helper family.
// createRobot(agent) returns a full <svg> string. Render ROBOT_DEFS once per page.
// Icon props use the Tabler icon webfont: npm i @tabler/icons-webfont
//   and import '@tabler/icons-webfont/dist/tabler-icons.min.css' once in your app.

const NAVY = '#0B1F5C';
const EDGE = '#9DBCF0';

export const ROBOT_DEFS = `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
<linearGradient id="rbHead" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#D3E4FF"/></linearGradient>
<linearGradient id="rbBody" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#C9DCFB"/></linearGradient>
</defs></svg>`;

// Hand-drawn hero props (used by the 12 Ads robots). Origin = the robot's hand.
const PROPS = {
  mega: '<g transform="rotate(-35)"><rect x="-6" y="-6" width="12" height="12" rx="3" fill="#9A3412"/><polygon points="6,-5 28,-15 28,15 6,5" fill="#FF8A3D" stroke="#C2410C" stroke-width="2" stroke-linejoin="round"/><ellipse cx="28" cy="0" rx="4" ry="15" fill="#FFC773" stroke="#C2410C" stroke-width="2"/><path class="rb-w1" d="M37 -10 Q44 0 37 10" fill="none" stroke="#FF8A3D" stroke-width="3" stroke-linecap="round"/><path class="rb-w2" d="M44 -16 Q55 0 44 16" fill="none" stroke="#FF8A3D" stroke-width="3" stroke-linecap="round"/></g>',
  click: '<g transform="translate(4,-6)"><path d="M-2,-18 L-2,8 L4,3 L8,12 L12,10 L8,1 L16,1 Z" fill="#FFB020" stroke="#0B1F5C" stroke-width="2" stroke-linejoin="round"/><circle class="rb-rg rb-e" cx="-2" cy="-18" r="7" fill="none" stroke="#FFB020" stroke-width="2"/></g>',
  clap: '<g transform="rotate(-12)"><rect x="-4" y="-8" width="30" height="22" rx="3" fill="#0B1F5C"/><rect x="-6" y="-18" width="30" height="9" rx="2" fill="#fff" stroke="#0B1F5C" stroke-width="2"/><path d="M2 -18 L-2 -9 M10 -18 L6 -9 M18 -18 L14 -9" stroke="#0B1F5C" stroke-width="3"/><polygon points="7,-2 7,10 17,4" fill="#FF4D6D"/></g>',
  mag: '<g><line x1="2" y1="2" x2="13" y2="-11" stroke="#FF8A3D" stroke-width="5" stroke-linecap="round"/><circle cx="22" cy="-22" r="12" fill="#fff" fill-opacity=".4" stroke="#FF8A3D" stroke-width="4"/><circle cx="22" cy="-26" r="3.5" fill="#0B1F5C"/><path d="M15 -16 Q22 -23 29 -16Z" fill="#0B1F5C"/></g>',
  flag: '<g><line x1="4" y1="6" x2="4" y2="-34" stroke="#0B1F5C" stroke-width="3" stroke-linecap="round"/><polygon points="4,-34 28,-27 4,-19" fill="#FF4D6D"/><circle cx="4" cy="6" r="3" fill="#0B1F5C"/></g>',
  doc: '<g transform="rotate(-8)"><rect x="-2" y="-30" width="26" height="34" rx="3" fill="#fff" stroke="#0B1F5C" stroke-width="2"/><path d="M3 -22 H18 M3 -16 H18 M3 -10 H12" stroke="#94A3B8" stroke-width="2"/><circle cx="17" cy="-1" r="5" fill="none" stroke="#EF4444" stroke-width="2"/></g>',
  cycle: '<g class="rb-sp rb-e"><path d="M25 -16 A13 13 0 1 1 12 -29" fill="none" stroke="#10B981" stroke-width="5" stroke-linecap="round"/><polygon points="12,-36 21,-29 12,-22" fill="#10B981"/></g>',
  gift: '<g transform="translate(0,-4)"><rect x="-4" y="-16" width="28" height="22" rx="3" fill="#EC4899"/><rect x="-6" y="-24" width="32" height="9" rx="3" fill="#F9A8D4"/><rect x="8" y="-24" width="6" height="30" fill="#FDE68A"/><path d="M11 -24 Q2 -34 4 -24 M11 -24 Q20 -34 18 -24" fill="none" stroke="#FDE68A" stroke-width="3" stroke-linecap="round"/></g>',
  web: '<g transform="rotate(-6)"><rect x="-2" y="-30" width="38" height="32" rx="4" fill="#fff" stroke="#0B1F5C" stroke-width="2"/><rect x="-2" y="-30" width="38" height="8" rx="4" fill="#0B1F5C"/><circle cx="3" cy="-26" r="1.6" fill="#FF4D6D"/><circle cx="8" cy="-26" r="1.6" fill="#FFB020"/><circle cx="13" cy="-26" r="1.6" fill="#34D399"/><path d="M4 -16 H24 M4 -11 H18" stroke="#94A3B8" stroke-width="2"/><rect x="4" y="-6" width="16" height="6" rx="3" fill="#FF8A3D"/></g>',
  mail: '<g transform="rotate(-8)"><rect x="-2" y="-26" width="36" height="26" rx="4" fill="#fff" stroke="#0B1F5C" stroke-width="2"/><path d="M-2 -24 L16 -10 L34 -24" fill="none" stroke="#0B1F5C" stroke-width="2" stroke-linejoin="round"/><circle class="rb-dt rb-e" cx="33" cy="-26" r="6" fill="#FF4D6D"/></g>',
  chat: '<g><rect x="-2" y="-30" width="36" height="24" rx="10" fill="#25D366"/><polygon points="4,-8 2,2 14,-8" fill="#25D366"/><circle class="rb-dt rb-e" cx="8" cy="-18" r="2.8" fill="#fff"/><circle class="rb-dt rb-e" cx="16" cy="-18" r="2.8" fill="#fff" style="animation-delay:.3s"/><circle class="rb-dt rb-e" cx="24" cy="-18" r="2.8" fill="#fff" style="animation-delay:.6s"/></g>',
  pal: '<g transform="rotate(-10)"><path d="M12 -30 C-4 -30 -6 -10 8 -4 C14 -2 12 4 20 4 C34 4 40 -10 34 -20 C30 -28 22 -30 12 -30Z" fill="#fff" stroke="#0B1F5C" stroke-width="2"/><circle cx="8" cy="-20" r="3.2" fill="#EF4444"/><circle cx="17" cy="-24" r="3.2" fill="#FACC15"/><circle cx="27" cy="-19" r="3.2" fill="#22C55E"/><circle cx="29" cy="-9" r="3.2" fill="#3B82F6"/></g>',
};

// Standard prop: a white rounded tile holding one Tabler icon in the robot's accent color.
function iconTile(icon, color) {
  return `<g><rect x="-2" y="-36" width="38" height="38" rx="11" fill="#fff" stroke="${NAVY}" stroke-width="2"/><foreignObject x="-2" y="-36" width="38" height="38"><div xmlns="http://www.w3.org/1999/xhtml" style="width:38px;height:38px;display:flex;align-items:center;justify-content:center"><i class="ti ti-${icon}" style="font-size:24px;color:${color}"></i></div></foreignObject></g>`;
}

const STAR = 'M0,-9 L2.7,-2.7 L9,0 L2.7,2.7 L0,9 L-2.7,2.7 L-9,0 L-2.7,-2.7Z';
const HEART = 'M0,6 C-10,-1 -9,-10 -3.5,-9 C-1,-9 0,-7 0,-6 C0,-7 1,-9 3.5,-9 C9,-10 10,-1 0,6Z';

/**
 * @param {object} b  agent config: { n, name, c, e, eyes, ear, ant, hat?, prop?, icon? }
 *   c = accent color, e = eye/glow color
 *   eyes: smile | dots | wink | pill | star | heart | shades
 *   ear: ring | rect      ant: ball | twin | dish | bulb | none
 *   hat: fedora | grad | cap | headset
 *   prop: key of PROPS (hand-drawn)   icon: Tabler icon name (standard prop)
 * @param {object} o  options: { label?: string }
 */
export function createRobot(b, o = {}) {
  const { c, e } = b;
  const delay = ((b.n * 0.73) % 3).toFixed(2); // deterministic, SSR-safe
  const label = o.label || '#' + String(b.n).padStart(2, '0');

  const ANT = {
    ball: `<line x1="120" y1="50" x2="120" y2="33" stroke="${c}" stroke-width="5" stroke-linecap="round"/><circle class="rb-rg rb-e" cx="120" cy="25" r="9" fill="none" stroke="${e}" stroke-width="2"/><circle cx="120" cy="25" r="8.5" fill="${c}"/><circle cx="117" cy="22" r="2.6" fill="#fff" fill-opacity=".85"/>`,
    twin: `<line x1="104" y1="52" x2="97" y2="35" stroke="${c}" stroke-width="4" stroke-linecap="round"/><line x1="136" y1="52" x2="143" y2="35" stroke="${c}" stroke-width="4" stroke-linecap="round"/><circle cx="96" cy="29" r="6" fill="${c}"/><circle cx="144" cy="29" r="6" fill="${c}"/><circle class="rb-dt rb-e" cx="96" cy="29" r="2.4" fill="${e}"/><circle class="rb-dt rb-e" cx="144" cy="29" r="2.4" fill="${e}" style="animation-delay:.5s"/>`,
    dish: `<line x1="120" y1="50" x2="120" y2="36" stroke="${c}" stroke-width="5" stroke-linecap="round"/><path d="M103 30 Q120 47 137 30Z" fill="${c}"/><circle class="rb-dt rb-e" cx="120" cy="25" r="4" fill="${e}"/>`,
    bulb: `<line x1="120" y1="50" x2="120" y2="38" stroke="${c}" stroke-width="5" stroke-linecap="round"/><circle class="rb-dt rb-e" cx="120" cy="28" r="10" fill="${e}" fill-opacity=".85" stroke="${c}" stroke-width="3"/>`,
    none: '',
  };

  const EYES = {
    smile: `<path d="M96 98 Q106 84 116 98 M124 98 Q134 84 144 98" fill="none" stroke="${e}" stroke-width="5.5" stroke-linecap="round"/>`,
    dots: `<circle cx="106" cy="93" r="6.5" fill="${e}"/><circle cx="134" cy="93" r="6.5" fill="${e}"/>`,
    wink: `<circle cx="106" cy="93" r="6.5" fill="${e}"/><path d="M124 98 Q134 84 144 98" fill="none" stroke="${e}" stroke-width="5.5" stroke-linecap="round"/>`,
    pill: `<rect x="94" y="87" width="24" height="12" rx="6" fill="${e}"/><rect x="122" y="87" width="24" height="12" rx="6" fill="${e}"/>`,
    star: `<path transform="translate(106,93)" d="${STAR}" fill="${e}"/><path transform="translate(134,93)" d="${STAR}" fill="${e}"/>`,
    heart: `<path transform="translate(106,94)" d="${HEART}" fill="${e}"/><path transform="translate(134,94)" d="${HEART}" fill="${e}"/>`,
    shades: `<rect x="90" y="82" width="30" height="22" rx="9" fill="#050B24" stroke="${e}" stroke-width="2.5"/><rect x="120" y="82" width="30" height="22" rx="9" fill="#050B24" stroke="${e}" stroke-width="2.5"/><path d="M95 88 L105 88 M125 88 L135 88" stroke="${e}" stroke-width="2" stroke-linecap="round"/>`,
  };

  const EARS = b.ear === 'rect'
    ? `<rect x="48" y="82" width="22" height="36" rx="10" fill="${c}"/><rect x="53" y="88" width="12" height="24" rx="6" fill="${NAVY}" stroke="${e}" stroke-width="2"/><rect x="170" y="82" width="22" height="36" rx="10" fill="${c}"/><rect x="175" y="88" width="12" height="24" rx="6" fill="${NAVY}" stroke="${e}" stroke-width="2"/>`
    : `<circle cx="60" cy="100" r="17" fill="${c}"/><circle cx="60" cy="100" r="11" fill="${NAVY}" stroke="${e}" stroke-width="3"/><circle cx="180" cy="100" r="17" fill="${c}"/><circle cx="180" cy="100" r="11" fill="${NAVY}" stroke="${e}" stroke-width="3"/>`;

  const HATS = {
    fedora: `<ellipse cx="120" cy="52" rx="50" ry="7" fill="${NAVY}"/><path d="M88 52 Q90 26 120 26 Q150 26 152 52Z" fill="#1B2A6B"/><rect x="89" y="43" width="62" height="7" fill="${c}"/>`,
    grad: `<polygon points="120,24 172,44 120,60 68,44" fill="${NAVY}"/><path d="M94 52 L94 62 Q120 74 146 62 L146 52" fill="#1B2A6B"/><line x1="166" y1="46" x2="166" y2="66" stroke="${c}" stroke-width="3"/><circle cx="166" cy="68" r="4" fill="${c}"/>`,
    cap: `<path d="M70 58 Q72 30 120 30 Q168 30 170 58Z" fill="${c}"/><rect x="52" y="54" width="70" height="8" rx="4" fill="${c}"/><circle cx="120" cy="29" r="5" fill="${NAVY}"/>`,
    headset: `<path d="M64 100 Q64 40 120 40 Q176 40 176 100" fill="none" stroke="#1B2A6B" stroke-width="5"/><path d="M62 118 Q64 134 88 134" fill="none" stroke="#1B2A6B" stroke-width="4"/><circle cx="88" cy="134" r="5" fill="${c}"/>`,
  };

  const prop = b.icon ? iconTile(b.icon, c) : PROPS[b.prop] || '';

  const body =
    `<g class="rb-fl rb-e" style="animation-delay:-${delay}s">` +
    // thruster + left arm
    `<ellipse class="rb-th rb-e" cx="120" cy="226" rx="13" ry="7" fill="${e}" fill-opacity=".7"/><ellipse class="rb-th rb-e" cx="120" cy="224" rx="7" ry="4.5" fill="#fff" fill-opacity=".9"/>` +
    `<line x1="86" y1="160" x2="68" y2="196" stroke="${c}" stroke-width="12" stroke-linecap="round"/><circle cx="67" cy="201" r="7.5" fill="#fff" stroke="${c}" stroke-width="3"/>` +
    // body, collar, chest panel, LED
    `<rect x="82" y="141" width="76" height="70" rx="28" fill="url(#rbBody)" stroke="${EDGE}" stroke-width="2"/><rect x="96" y="141" width="48" height="7" rx="3.5" fill="${c}"/>` +
    `<rect x="98" y="158" width="44" height="26" rx="8" fill="${NAVY}"/><text x="120" y="176" text-anchor="middle" style="font-family:ui-monospace,Menlo,monospace;font-size:13px;font-weight:500" fill="${e}">${label}</text><circle class="rb-dt rb-e" cx="120" cy="198" r="4" fill="${c}"/>` +
    // right arm + prop
    `<g class="rb-ar"><line x1="154" y1="160" x2="176" y2="192" stroke="${c}" stroke-width="12" stroke-linecap="round"/><g transform="translate(180,194)">${prop}</g><circle cx="177" cy="196" r="7.5" fill="#fff" stroke="${c}" stroke-width="3"/></g>` +
    // neck + head group
    `<rect x="106" y="134" width="28" height="9" rx="4" fill="${c}"/>` +
    `<g class="rb-hd">${ANT[b.ant || 'ball']}${EARS}<rect x="62" y="48" width="116" height="88" rx="38" fill="url(#rbHead)" stroke="${EDGE}" stroke-width="2"/><rect x="76" y="66" width="88" height="54" rx="24" fill="${NAVY}"/><path d="M90 73 Q120 66 150 73" fill="none" stroke="#2A4BB5" stroke-width="2.5" stroke-linecap="round"/><g class="rb-bk rb-e">${EYES[b.eyes || 'smile']}</g>${HATS[b.hat] || ''}</g>` +
    `</g>`;

  return `<svg class="rb-svg" viewBox="0 0 240 280" role="img" aria-label="${b.name} robot"><ellipse class="rb-sh rb-e" cx="120" cy="266" rx="46" ry="7" fill="${c}" fill-opacity=".22" style="animation-delay:-${delay}s"/>${body}</svg>`;
}
