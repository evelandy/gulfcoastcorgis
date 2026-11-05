export const money = (n) =>
  n == null || n === '' ? '' : `$${Number(n).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;

export function niceDate(iso, opts = { month: 'long', day: 'numeric' }) {
  if (!iso) return '';
  // Date-only strings ("2026-11-09"). These are parsed as local dates to avoid off-by-one days.
  const [y, m, d] = iso.split('-').map(Number);
  const date = d ? new Date(y, m - 1, d) : new Date(y, m - 1, 1);
  return date.toLocaleDateString('en-US', d ? opts : { month: 'long', year: 'numeric' });
}

export function ageInWeeks(iso, now = new Date()) {
  if (!iso) return null;
  const [y, m, d] = iso.split('-').map(Number);
  return Math.floor((now - new Date(y, m - 1, d)) / (7 * 24 * 3600 * 1000));
}

export function ageInYears(iso, now = new Date()) {
  if (!iso) return null;
  const [y, m, d] = iso.split('-').map(Number);
  const born = new Date(y, m - 1, d);
  let years = now.getFullYear() - born.getFullYear();
  if (now < new Date(now.getFullYear(), born.getMonth(), born.getDate())) years -= 1;
  return years;
}

// Collar colors are how the litter is able to be recognized before names are chosen.
export const COLLARS = {
  teal: '#1F9E97',
  coral: '#F2765E',
  purple: '#7F5AB8',
  lime: '#8CC63F',
  navy: '#24407A',
  yellow: '#F2C230',
  pink: '#EE82B5',
  orange: '#F08A24',
  red: '#D23B3B',
  blue: '#3C8DDB',
  green: '#2E8B57',
  black: '#2A2A2A',
  white: '#F4F4F4',
  brown: '#8A5A3B',
};

export const STATUS_LABEL = {
  available: 'Available',
  reserved: 'Reserved',
  home: 'Gone home',
};

/** Mixes a hex color with white. amount = 0..1 share of the original color. */
export function tint(hex, amount = 0.22) {
  const h = hex.replace('#', '');
  if (h.length !== 6) return '#E6F0EC';
  const mix = (i) => Math.round(parseInt(h.slice(i, i + 2), 16) * amount + 255 * (1 - amount));
  return `#${[0, 2, 4].map((i) => mix(i).toString(16).padStart(2, '0')).join('')}`;
}
