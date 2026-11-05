import { useState } from 'react';
import { uploadImage } from '../services/api';

export default function PhotoField({ value = [], onChange }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [url, setUrl] = useState('');

  async function addFiles(files) {
    setBusy(true);
    setError('');
    try {
      const urls = [];
      for (const f of files) {
        if (!f.type.startsWith('image/')) continue;
        urls.push(await uploadImage(f));
      }
      onChange([...value, ...urls]);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  const move = (i, to) => {
    const next = [...value];
    const [item] = next.splice(i, 1);
    next.splice(to, 0, item);
    onChange(next);
  };

  return (
    <div className="photo-field">
      {value.length > 0 && (
        <ul className="photo-grid">
          {value.map((src, i) => (
            <li key={src.slice(-40) + i}>
              <img src={src} alt={`Photo ${i + 1}`} />
              {i === 0 && <span className="cover-badge">Cover</span>}
              <div className="photo-actions">
                {i > 0 && (
                  <button type="button" onClick={() => move(i, 0)}>
                    Make cover
                  </button>
                )}
                <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))}>
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <label
        className={`drop ${busy ? 'busy' : ''}`}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          addFiles([...e.dataTransfer.files]);
        }}
      >
        <input type="file" accept="image/*" multiple onChange={(e) => addFiles([...e.target.files])} />
        {busy ? 'Adding photos…' : 'Drop photos here or click to choose'}
      </label>
      <div className="url-row">
        <input
          type="text"
          placeholder="…or paste an image URL, e.g. /images/maggie.jpg"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <button
          type="button"
          className="btn btn-gulf btn-sm"
          disabled={!url.trim()}
          onClick={() => {
            onChange([...value, url.trim()]);
            setUrl('');
          }}
        >
          Add URL
        </button>
      </div>
      {error && <p className="form-error">{error}</p>}
    </div>
  );
}
