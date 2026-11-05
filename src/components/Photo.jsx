// Shows the first photo for a dog/puppy/family, or a corgi placeholder until a real photo is added
const COATS = {
  red: { fur: '#E39A3B', ear: '#F6C98A' },
  sable: { fur: '#B9772F', ear: '#E9B97A' },
  tri: { fur: '#2C2622', ear: '#C98A4B', cheek: '#C98A4B' },
};

export function coatFromColor(color = '') {
  const c = color.toLowerCase();
  if (c.includes('tri') || c.includes('black')) return 'tri';
  if (c.includes('sable')) return 'sable';
  return 'red';
}

export function CorgiFace({ coat = 'red', bg = '#D7EBEE', label }) {
  const p = COATS[coat] || COATS.red;
  return (
    <svg viewBox="0 0 200 200" role="img" aria-label={label || 'Photo coming soon'} className="corgi-face">
      <rect width="200" height="200" fill={bg} />
      <circle cx="100" cy="230" r="120" fill="#fff" opacity=".35" />
      <polygon points="46,104 56,26 104,74" fill={p.fur} />
      <polygon points="154,104 144,26 96,74" fill={p.fur} />
      <polygon points="60,88 64,46 90,74" fill={p.ear} />
      <polygon points="140,88 136,46 110,74" fill={p.ear} />
      <ellipse cx="100" cy="118" rx="62" ry="50" fill={p.fur} />
      {p.cheek && (
        <>
          <ellipse cx="66" cy="132" rx="16" ry="12" fill={p.cheek} />
          <ellipse cx="134" cy="132" rx="16" ry="12" fill={p.cheek} />
        </>
      )}
      <path d="M100 74 C92 96 86 112 74 132 C84 160 116 160 126 132 C114 112 108 96 100 74Z" fill="#fff" />
      <ellipse cx="100" cy="146" rx="34" ry="21" fill="#fff" />
      <circle cx="76" cy="114" r="6" fill="#10292C" />
      <circle cx="124" cy="114" r="6" fill="#10292C" />
      <circle cx="78" cy="112" r="1.8" fill="#fff" />
      <circle cx="126" cy="112" r="1.8" fill="#fff" />
      <ellipse cx="100" cy="134" rx="9" ry="6.5" fill="#10292C" />
      <path d="M100 140 v8 M90 150 q10 8 20 0" stroke="#10292C" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M95 154 q5 12 10 0" fill="#F27C86" />
    </svg>
  );
}

export default function Photo({ src, alt, coat, bg, className = '' }) {
  return (
    <div className={`photo ${className}`}>
      {src ? (
        <img src={src} alt={alt} loading="lazy" />
      ) : (
        <CorgiFace coat={coat} bg={bg} label={`${alt} (photo coming soon)`} />
      )}
    </div>
  );
}
