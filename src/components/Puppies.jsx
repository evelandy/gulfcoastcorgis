import { useMemo, useState } from 'react';
import Photo, { coatFromColor } from './Photo';
import { COLLARS, STATUS_LABEL, money, niceDate, ageInWeeks, tint } from '../lib/format';

const FILTERS = [
  { id: 'all', label: 'All puppies' },
  { id: 'available', label: 'Available' },
  { id: 'female', label: 'Girls' },
  { id: 'male', label: 'Boys' },
];

export function PuppyTag({ puppy, onOpen }) {
  const collar = COLLARS[puppy.collar] || puppy.collar || '#7DB9C8';
  return (
    <li className="tag-shadow">
      <div className={`hang-tag puppy-tag is-${puppy.status}`} style={{ '--collar': collar }}>
        <span className="tag-hole" aria-hidden="true" />
        <button
          type="button"
          className="tag-hit"
          onClick={() => onOpen(puppy)}
          aria-label={`See details for ${puppy.name}`}
        />
        <Photo
          src={puppy.photos?.[0]}
          alt={puppy.name}
          coat={coatFromColor(puppy.color)}
          bg={tint(collar)}
          className="tag-photo"
        />
        <div className="tag-text">
          <h3>{puppy.name}</h3>
          <p>
            {puppy.sex === 'female' ? 'Girl' : 'Boy'}, {puppy.color.toLowerCase()}
          </p>
          <p className="tag-foot">
            <span className={`status status-${puppy.status}`}>{STATUS_LABEL[puppy.status]}</span>
            {puppy.status === 'available' && <span className="price">{money(puppy.price)}</span>}
          </p>
        </div>
      </div>
    </li>
  );
}

export default function Puppies({ puppies, litters, dogs, onOpen }) {
  const [filter, setFilter] = useState('all');
  const current = litters.filter((l) => l.status === 'current');
  const upcoming = litters.filter((l) => l.status === 'upcoming');

  const visible = useMemo(() => {
    const live = puppies.filter((p) => p.status !== 'home');
    if (filter === 'available') return live.filter((p) => p.status === 'available');
    if (filter === 'male' || filter === 'female') return live.filter((p) => p.sex === filter);
    return live;
  }, [puppies, filter]);

  const nameOf = (id) => dogs.find((d) => d.id === id)?.name;

  return (
    <section className="section puppies" id="puppies" aria-labelledby="puppies-h">
      <div className="wrap">
        <div className="section-head">
          <h2 id="puppies-h">Available puppies</h2>
          {current.map((l) => (
            <p key={l.id} className="litter-line">
              {l.name} from {nameOf(l.damId)} and {nameOf(l.sireId)}, born {niceDate(l.born)}
              {l.born && ` (${ageInWeeks(l.born)} weeks old)`}. {l.summary} Each puppy wears a colored collar so you can
              tell them apart until their new family names them.
            </p>
          ))}
        </div>

        <div className="filters" role="group" aria-label="Filter puppies">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              className="chip"
              aria-pressed={filter === f.id}
              onClick={() => setFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {visible.length ? (
          <ul className="tag-rail">
            {visible.map((p) => (
              <PuppyTag key={p.id} puppy={p} onOpen={onOpen} />
            ))}
          </ul>
        ) : (
          <div className="empty">
            <p>No puppies match that filter right now.</p>
            <a href="#inquire" className="btn btn-gulf">
              Join the waitlist
            </a>
          </div>
        )}

        {/* commenting below as there are no scheduled litters at the moment. */}
        {/* {upcoming.map((l) => (
          <aside key={l.id} className="upcoming">
            <div>
              <h3>{l.name}</h3>
              <p>
                {nameOf(l.damId)} and {nameOf(l.sireId)}
                {l.expected && `, expected ${niceDate(l.expected)}`}. {l.summary}
              </p>
            </div>
            <a href="#inquire" className="btn btn-gulf">
              Join the waitlist
            </a>
          </aside>
        ))} */}
      </div>
    </section>
  );
}
