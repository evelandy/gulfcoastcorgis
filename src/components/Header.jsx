import { useState } from 'react';
import { site } from '../config/site';

const LINKS = [
  { href: '#puppies', label: 'Puppies' },
  { href: '#our-dogs', label: 'Our adults' },
  { href: '#how-it-works', label: 'How it works' },
  { href: '#families', label: 'Families' },
];

export function Logo() {
  return (
    <a href="#top" className="logo" aria-label={`${site.name} home`}>
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <rect width="64" height="64" rx="16" fill="currentColor" />
        <path d="M14 46 L18 12 L30 26 Q32 25 34 26 L46 12 L50 46 Q32 58 14 46Z" fill="#E8A33D" />
        <path d="M26 44 Q32 34 38 44 Q32 50 26 44Z" fill="#fff" />
        <circle cx="25" cy="36" r="2.5" fill="#10292C" />
        <circle cx="39" cy="36" r="2.5" fill="#10292C" />
      </svg>
      <span className="logo-words">
        <span>GulfCoast</span>
        <span>Corgis</span>
      </span>
    </a>
  );
}

export default function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="site-header">
      <div className="wrap header-row">
        <Logo />
        <button
          className="menu-toggle"
          aria-expanded={open}
          aria-controls="site-nav"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? 'Close' : 'Menu'}
        </button>
        <nav id="site-nav" className={open ? 'nav open' : 'nav'} aria-label="Main">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)}>
              {l.label}
            </a>
          ))}
          <a href="#inquire" className="btn btn-butter btn-sm" onClick={() => setOpen(false)}>
            Ask about a puppy
          </a>
        </nav>
      </div>
    </header>
  );
}
