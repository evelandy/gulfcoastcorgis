import Photo from './Photo';

const BGS = ['#BFE0E6', '#F6E7C1', '#D5E8D4', '#F9D3C4', '#DCD3EE'];

export default function Families({ families, puppies }) {
  // Puppies marked "Gone home" in the admin panel show up here too
  const goneHome = puppies
    .filter((p) => p.status === 'home')
    .map((p) => ({ id: p.id, puppyName: p.name, town: p.newHome || '', photos: p.photos, note: '' }));
  const all = [...families, ...goneHome];
  if (!all.length) return null;

  return (
    <section className="section families" id="families" aria-labelledby="families-h">
      <div className="wrap">
        <div className="section-head">
          <h2 id="families-h">Puppies in their new homes</h2>
          <p>
            Past puppies and the families who brought them home. We love getting updates, so keep the photos coming.
          </p>
        </div>
        <ul className="polaroids">
          {all.map((f, i) => (
            <li key={f.id} className="polaroid" style={{ '--tilt': `${[-2, 1.5, -1, 2, -1.5][i % 5]}deg` }}>
              <Photo
                src={f.photos?.[0]}
                alt={`${f.puppyName} at home`}
                bg={BGS[i % BGS.length]}
                className="polaroid-photo"
              />
              <p className="polaroid-caption">
                <strong>{f.puppyName}</strong>
                {f.town && (
                  <span>
                    {f.town}
                    {f.year ? `, ${f.year}` : ''}
                  </span>
                )}
              </p>
              {f.note && <p className="polaroid-note">{f.note}</p>}
              {f.sample && <span className="sample-badge">Sample</span>}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
