import { site } from '../config/site';
import { Logo } from './Header';

export default function Footer() {
  const socials = Object.entries(site.social).filter(([, url]) => url);
  return (
    <footer className="site-footer">
      <div className="wrap footer-row">
        <Logo />
        <p>{site.tagline}.</p>
        {socials.length > 0 && (
          <ul className="socials">
            {socials.map(([name, url]) => (
              <li key={name}>
                <a href={url} rel="noopener" target="_blank">
                  {name[0].toUpperCase() + name.slice(1)}
                </a>
              </li>
            ))}
          </ul>
        )}
        <p className="fine">
          © {new Date().getFullYear()} {site.name}
          {site.showAdminLink && (
            <>
              {'  '}
              <a href="#admin">Manage listings</a>
            </>
          )}
        </p>
      </div>
    </footer>
  );
}
