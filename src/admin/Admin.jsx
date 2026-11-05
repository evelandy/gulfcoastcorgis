import { useState } from 'react';
import { schemas } from './schemas';
import PhotoField from './PhotoField';
import { useCollection } from '../hooks/useCollection';
import { save, remove, resetLocal, isRemote, list, COLLECTIONS } from '../services/api';

// Once VITE_API_URL points at a real backend, protect the write routes on the server (session/JWT) and add a sign-in screen here before going.

function Field({ field, value, onChange, dogs, litters }) {
  const common = { id: field.name, name: field.name, required: field.required };
  switch (field.type) {
    case 'textarea':
      return <textarea {...common} rows="3" value={value ?? ''} onChange={(e) => onChange(e.target.value)} />;
    case 'number':
      return (
        <input
          {...common}
          type="number"
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
        />
      );
    case 'date':
    case 'month':
      return <input {...common} type={field.type} value={value ?? ''} onChange={(e) => onChange(e.target.value)} />;
    case 'select':
      return (
        <select {...common} value={value ?? ''} onChange={(e) => onChange(e.target.value)}>
          {field.options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      );
    case 'dog':
      return (
        <select {...common} value={value ?? ''} onChange={(e) => onChange(e.target.value)}>
          <option value="">Choose…</option>
          {dogs
            .filter((d) => d.role === field.role)
            .map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
        </select>
      );
    case 'litter':
      return (
        <select {...common} value={value ?? ''} onChange={(e) => onChange(e.target.value)}>
          <option value="">No litter</option>
          {litters.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </select>
      );
    case 'lines':
      return (
        <textarea
          {...common}
          rows="3"
          value={(value || []).join('\n')}
          onChange={(e) => onChange(e.target.value.split('\n'))}
        />
      );
    case 'photos':
      return <PhotoField value={value} onChange={onChange} />;
    default:
      return <input {...common} type="text" value={value ?? ''} onChange={(e) => onChange(e.target.value)} />;
  }
}

function ItemForm({ collection, item, onDone, dogs, litters }) {
  const schema = schemas[collection];
  const [draft, setDraft] = useState(item);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const clean = { ...draft };
      delete clean.sample;
      delete clean._note;
      if (Array.isArray(clean.health)) clean.health = clean.health.map((h) => h.trim()).filter(Boolean);
      if (collection === 'dogs') clean.sex = clean.role === 'sire' ? 'male' : 'female';
      await save(collection, clean);
      onDone();
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <form className="admin-form" onSubmit={onSubmit}>
      <h2>{item.id ? `Edit ${schema.title(item)}` : `Add a ${schema.singular}`}</h2>
      {schema.fields.map((f) => (
        <div className="admin-field" key={f.name}>
          <label htmlFor={f.name}>{f.label}</label>
          <Field
            field={f}
            value={draft[f.name]}
            dogs={dogs}
            litters={litters}
            onChange={(v) => setDraft((d) => ({ ...d, [f.name]: v }))}
          />
          {f.hint && <small>{f.hint}</small>}
        </div>
      ))}
      {error && <p className="form-error">{error}</p>}
      <div className="admin-form-actions">
        <button className="btn btn-butter" disabled={saving}>
          {saving ? 'Saving…' : `Save ${schema.singular}`}
        </button>
        <button type="button" className="btn btn-ghost-dark" onClick={onDone}>
          Cancel
        </button>
      </div>
    </form>
  );
}

function CollectionTab({ collection, dogs, litters }) {
  const schema = schemas[collection];
  const { items, loading } = useCollection(collection);
  const [editing, setEditing] = useState(null);
  const [confirming, setConfirming] = useState(null);

  if (editing) {
    return (
      <ItemForm collection={collection} item={editing} dogs={dogs} litters={litters} onDone={() => setEditing(null)} />
    );
  }

  return (
    <div>
      <div className="admin-bar">
        <h2>{schema.label}</h2>
        <button className="btn btn-butter btn-sm" onClick={() => setEditing({ ...schema.defaults })}>
          Add a {schema.singular}
        </button>
      </div>
      {loading ? (
        <p>Loading…</p>
      ) : items.length === 0 ? (
        <p className="admin-empty">Nothing here yet. Add your first {schema.singular} to see it on the site.</p>
      ) : (
        <ul className="admin-list">
          {items.map((it) => (
            <li key={it.id}>
              {it.photos?.[0] ? <img src={it.photos[0]} alt="" /> : <span className="thumb-blank" aria-hidden="true" />}
              <div>
                <strong>{schema.title(it)}</strong>
                <span>{schema.subtitle(it)}</span>
              </div>
              <button className="btn btn-ghost-dark btn-sm" onClick={() => setEditing(it)}>
                Edit
              </button>
              <button
                className="btn btn-danger btn-sm"
                onClick={() => (confirming === it.id ? remove(collection, it.id) : setConfirming(it.id))}
                onBlur={() => setConfirming(null)}
              >
                {confirming === it.id ? 'Click again to delete' : 'Delete'}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function InquiriesTab() {
  const { items } = useCollection('inquiries');
  return (
    <div>
      <div className="admin-bar">
        <h2>Messages</h2>
      </div>
      {!isRemote && (
        <p className="admin-note">
          With no backend or form service set up, messages from the contact form are only kept in the browser they were
          sent from. Set VITE_INQUIRY_ENDPOINT or VITE_API_URL before launch so you actually receive them.
        </p>
      )}
      {items.length === 0 ? (
        <p className="admin-empty">No messages yet.</p>
      ) : (
        <ul className="inq-list">
          {items.map((m) => (
            <li key={m.id || m.sentAt}>
              <strong>{m.name}</strong> about <em>{m.puppyName}</em>
              <span>{new Date(m.sentAt).toLocaleString()}</span>
              <p>{m.message}</p>
              <span>
                {[m.email, m.phone].filter(Boolean).join(', ')} (prefers {m.contactBy})
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function DataTab() {
  const [msg, setMsg] = useState('');
  const [confirmReset, setConfirmReset] = useState(false);
  async function exportAll() {
    for (const c of COLLECTIONS) {
      const data = await list(c);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `${c}.json`;
      a.click();
      URL.revokeObjectURL(a.href);
    }
    setMsg('Downloaded dogs.json, puppies.json, litters.json and families.json.');
  }
  async function resetAll() {
    if (!confirmReset) {
      setConfirmReset(true);
      setMsg('This throws away every change made in this browser. Click Reset again to confirm.');
      return;
    }
    setConfirmReset(false);
    for (const c of COLLECTIONS) await resetLocal(c);
    setMsg('Reset to the files in src/data.');
  }
  return (
    <div>
      <div className="admin-bar">
        <h2>Publish your changes</h2>
      </div>
      <ol className="admin-steps">
        <li>
          Add your dogs, litters, and puppies in the other tabs. You&rsquo;ll see them on the site right away in this
          browser.
        </li>
        <li>Click Export JSON below. Four files will download.</li>
        <li>Replace the files in src/data with them, then rebuild and deploy. Now every visitor sees your changes.</li>
      </ol>
      <p className="admin-note">
        Photos uploaded here are stored inside the JSON. That&rsquo;s fine for a handful of pictures. For lots of
        photos, put them in public/images and add them with the URL box (e.g. /images/maggie-1.jpg), or connect a
        backend with an /uploads route.
      </p>
      <div className="admin-form-actions">
        <button className="btn btn-butter" onClick={exportAll}>
          Export JSON
        </button>
        {!isRemote && (
          <button className="btn btn-danger" onClick={resetAll}>
            Reset to files
          </button>
        )}
      </div>
      {msg && <p role="status">{msg}</p>}
    </div>
  );
}

const TABS = [
  { id: 'puppies', label: 'Puppies' },
  { id: 'litters', label: 'Litters' },
  { id: 'dogs', label: 'Our dogs' },
  { id: 'families', label: 'Families' },
  { id: 'inquiries', label: 'Messages' },
  { id: 'data', label: 'Publish' },
];

export default function Admin() {
  const [tab, setTab] = useState('puppies');
  const dogs = useCollection('dogs').items;
  const litters = useCollection('litters').items;

  return (
    <div className="admin">
      <header className="admin-head">
        <div className="wrap admin-head-row">
          <strong>GulfCoast Corgis listings</strong>
          <span className="mode">{isRemote ? 'Connected to your API' : 'Saved in this browser only'}</span>
          <a href="#top" className="btn btn-ghost btn-sm">
            Back to site
          </a>
        </div>
      </header>
      <div className="wrap admin-body">
        <nav className="admin-tabs" aria-label="Admin sections">
          {TABS.map((t) => (
            <button key={t.id} aria-pressed={tab === t.id} onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </nav>
        <div className="admin-panel">
          {tab === 'inquiries' ? (
            <InquiriesTab />
          ) : tab === 'data' ? (
            <DataTab />
          ) : (
            <CollectionTab key={tab} collection={tab} dogs={dogs} litters={litters} />
          )}
        </div>
      </div>
    </div>
  );
}
