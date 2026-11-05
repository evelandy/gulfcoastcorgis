import Photo, { coatFromColor } from './Photo';
import { ageInYears } from '../lib/format';

export default function Parents({ dogs }) {
  const ordered = [...dogs].sort((a, b) => (a.role === b.role ? 0 : a.role === 'dam' ? -1 : 1));
  return (
    <section className="section parents" id="our-dogs" aria-labelledby="dogs-h">
      <div className="wrap">
        <div className="section-head">
          <h2 id="dogs-h">Our adults</h2>
          <p>
            Every puppy has a beginning, our puppies&rsquo; beginnings start with our adults. They live with us 24/7 and are our family. All of our adults are health tested
            before they&rsquo;re ever bred.
          </p>
        </div>
        <ul className="parent-list">
          {ordered.map((d) => (
            <li key={d.id} className="parent">
              <Photo
                src={d.photos?.[0]} // one photo per adult for now, will fix this later to allow for clickable image that takes user to a gallery of each clicked adult
                alt={d.name}
                coat={coatFromColor(d.color)}
                bg={d.role === 'dam' ? '#F6E7C1' : '#BFE0E6'}
                className="parent-photo"
              />
              <div className="parent-text">
                <h3>
                  {d.name}
                  {d.callName && d.callName !== d.name && <span className="call"> &ldquo;{d.callName}&rdquo;</span>}
                </h3>
                <p className="parent-meta">
                  {d.role === 'dam' ? 'Female' : 'Male'}: {d.color.toLowerCase()}
                  {d.born && `, ${ageInYears(d.born)} years old`}
                  {d.weightLbs && `, ${d.weightLbs} lbs`}
                  {d.registry && `, ${d.registry} registered`}
                </p>
                <p>{d.temperament}</p>
                {d.health?.length > 0 && (
                  <ul className="health">
                    {d.health.map((h) => (
                      <li key={h}>{h}</li>
                    ))}
                  </ul>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
