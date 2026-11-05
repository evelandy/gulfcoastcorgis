import { useState } from 'react';
import Modal from './Modal';
import Photo, { coatFromColor } from './Photo';
import { COLLARS, STATUS_LABEL, money, niceDate, tint } from '../lib/format';
import { site } from '../config/site';

export default function PuppyDetail({ puppy, litters, dogs, onClose, onReserve }) {
  const [shown, setShown] = useState(0);
  if (!puppy) return <Modal open={false} onClose={onClose} />;

  const litter = litters.find((l) => l.id === puppy.litterId);
  const dam = dogs.find((d) => d.id === litter?.damId);
  const sire = dogs.find((d) => d.id === litter?.sireId);
  const collar = COLLARS[puppy.collar] || puppy.collar || '#7DB9C8';
  const photos = puppy.photos || [];

  const facts = [
    ['Sex', puppy.sex === 'female' ? 'Female' : 'Male'],
    ['Color', puppy.color],
    ['Coat', puppy.coat],
    ['Born', niceDate(litter?.born, { month: 'long', day: 'numeric', year: 'numeric' })],
    ['Ready to go home', niceDate(litter?.readyDate, { month: 'long', day: 'numeric', year: 'numeric' })],
    ['Parents', dam && sire ? `${dam.name} & ${sire.name}` : ''],
    ['Price', money(puppy.price)],
  ].filter(([, v]) => v);

  return (
    <Modal open onClose={onClose} labelledBy="pup-title" className="puppy-modal">
      <div className="pd" style={{ '--collar': collar }}>
        <div className="pd-gallery">
          <Photo
            src={photos[shown]}
            alt={puppy.name}
            coat={coatFromColor(puppy.color)}
            bg={tint(collar)}
            className="pd-main"
          />
          {photos.length > 1 && (
            <div className="pd-thumbs">
              {photos.map((src, i) => (
                <button key={i} type="button" aria-pressed={i === shown} onClick={() => setShown(i)}>
                  <img src={src} alt={`${puppy.name}, photo ${i + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="pd-info">
          <span className={`status status-${puppy.status}`}>{STATUS_LABEL[puppy.status]}</span>
          <h2 id="pup-title">{puppy.name}</h2>
          {puppy.personality && <p className="pd-personality">{puppy.personality}</p>}
          <dl className="facts">
            {facts.map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
          <p className="pd-small">
            A {money(site.policy.deposit)} deposit holds your puppy. The rest is due at pickup. Puppies go home with
            first shots, deworming, a vet check, puppy pack, and a starter bag of food.
          </p>
          <div className="pd-actions">
            {puppy.status === 'available' ? (
              <button className="btn btn-butter" onClick={() => onReserve(puppy, 'reserve')}>
                Reserve this puppy
              </button>
            ) : (
              <button className="btn btn-butter" onClick={() => onReserve(puppy, 'backup')}>
                Ask to be next in line
              </button>
            )}
            <a className="btn btn-ghost-dark" href={site.contact.textHref}>
              Text us
            </a>
          </div>
        </div>
      </div>
    </Modal>
  );
}
