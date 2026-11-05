import Photo from './Photo';
import { niceDate } from '../lib/format';
import { site } from '../config/site';

export default function Hero({ litter, puppies, dogs }) {
  const pups = litter ? puppies.filter((p) => p.litterId === litter.id) : [];
  const open = pups.filter((p) => p.status === 'available').length;
  const dam = dogs.find((d) => d.id === litter?.damId);
  const sire = dogs.find((d) => d.id === litter?.sireId);
  const heroPhoto = litter?.photo || pups.find((p) => p.photos?.[0])?.photos[0] || dam?.photos?.[0];

  return (
    <section className="hero" id="top">
      <div className="wrap hero-grid">
        <div className="hero-copy">
          <h1>Home-raised corgis from the Texas Gulf Coast.</h1>
          <p className="lede">
            We raise a few Pembroke Welsh Corgi litters a year in our home near the bay. Meet our dogs, see who&rsquo;s
            still looking for a family, and reserve your puppy.
          </p>
          <div className="hero-actions">
            <a href="#puppies" className="btn btn-butter">
              See available puppies
            </a>
            <a href={site.contact.textHref} className="btn btn-ghost">
              Text us
            </a>
          </div>
        </div>

        <div className="hero-visual">
          <div className="arch">
            <Photo src={heroPhoto} alt={litter ? `${litter.name} puppies` : 'Our corgis'} coat="red" bg="#BFE0E6" />
          </div>
          {litter && (
            <div className="tag-shadow hero-tag-wrap">
              <a href="#puppies" className="hang-tag hero-tag" style={{ '--collar': '#E8A33D' }}>
                <span className="tag-hole" aria-hidden="true" />
                <strong>{litter.name}</strong>
                <span className="hero-tag-count">
                  {open} of {pups.length} still available
                </span>
                {dam && sire && (
                  <span>
                    {dam.name} &amp; {sire.name}
                  </span>
                )}
                {litter.readyDate && <span>Going home {niceDate(litter.readyDate)}</span>}
              </a>
            </div>
          )}
        </div>
      </div>
      <svg className="tide" viewBox="0 0 1440 90" preserveAspectRatio="none" aria-hidden="true">
        <path
          d="M0 50 C 180 10, 360 90, 540 50 S 900 10, 1080 50 S 1350 80, 1440 40 V90 H0Z"
          fill="var(--pelican)"
          opacity=".45"
        />
        <path d="M0 62 C 200 30, 380 95, 600 62 S 980 30, 1180 62 S 1380 85, 1440 60 V90 H0Z" fill="var(--salt-2)" />
      </svg>
    </section>
  );
}
