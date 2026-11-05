import { site } from '../config/site';

// Adds canonical + og:url tags based on VITE_SITE_URL so the domain switch is one env change.
export function applySeo() {
  if (!site.url) return;
  const ensure = (selector, create) => {
    let el = document.head.querySelector(selector);
    if (!el) {
      el = create();
      document.head.appendChild(el);
    }
    return el;
  };
  ensure('link[rel="canonical"]', () => {
    const l = document.createElement('link');
    l.rel = 'canonical';
    return l;
  }).href = site.url + '/';
  ensure('meta[property="og:url"]', () => {
    const m = document.createElement('meta');
    m.setAttribute('property', 'og:url');
    return m;
  }).content = site.url + '/';
}
