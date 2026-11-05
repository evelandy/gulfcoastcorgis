// The only file the UI talks to for data.
//
// Two modes, picked by VITE_API_URL:
//   1. Local (no VITE_API_URL): reads src/data/*.json, plus any changes made in the admin
//      panel, which are saved in this browser's IndexedDB.
//   2. Remote (VITE_API_URL set): plain REST calls. Your backend needs these routes:
//        GET    /dogs | /puppies | /litters | /families      -> array of items
//        POST   /:collection                                  -> create, returns item
//        PUT    /:collection/:id                              -> update, returns item
//        DELETE /:collection/:id
//        POST   /inquiries                                    -> { ok: true }
//      Item shapes are documented in README.md and match the JSON seed files.
import { api } from '../config/site';
import { localStore } from './localStore';
import dogsSeed from '../data/dogs.json';
import puppiesSeed from '../data/puppies.json';
import littersSeed from '../data/litters.json';
import familiesSeed from '../data/families.json';

export const COLLECTIONS = ['dogs', 'puppies', 'litters', 'families'];
const seeds = { dogs: dogsSeed, puppies: puppiesSeed, litters: littersSeed, families: familiesSeed };

export const isRemote = Boolean(api.baseUrl);

// ---- tiny change notifier so every list refreshes after an admin edit ----
const listeners = new Set();
export function onDataChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
const notify = (collection) => listeners.forEach((fn) => fn(collection));

async function http(path, options = {}) {
  const res = await fetch(`${api.baseUrl}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  if (!res.ok) throw new Error(`Request to ${path} failed with status ${res.status}`);
  return res.status === 204 ? null : res.json();
}

const newId = (prefix) => `${prefix}-${(crypto.randomUUID?.() || Math.random().toString(36).slice(2)).slice(0, 8)}`;

export async function list(collection) {
  if (isRemote) return http(`/${collection}`);
  return (await localStore.read(collection)) ?? structuredClone(seeds[collection]);
}

export async function save(collection, item) {
  if (isRemote) {
    const saved = item.id
      ? await http(`/${collection}/${item.id}`, { method: 'PUT', body: JSON.stringify(item) })
      : await http(`/${collection}`, { method: 'POST', body: JSON.stringify(item) });
    notify(collection);
    return saved;
  }
  const items = await list(collection);
  const record = { ...item, id: item.id || newId(collection.slice(0, 3)) };
  const idx = items.findIndex((i) => i.id === record.id);
  if (idx >= 0) items[idx] = record;
  else items.unshift(record);
  await localStore.write(collection, items);
  notify(collection);
  return record;
}

export async function remove(collection, id) {
  if (isRemote) await http(`/${collection}/${id}`, { method: 'DELETE' });
  else {
    const items = await list(collection);
    await localStore.write(
      collection,
      items.filter((i) => i.id !== id),
    );
  }
  notify(collection);
}

/** Local mode only: throw away admin edits and go back to the JSON seed files. */
export async function resetLocal(collection) {
  await localStore.clear(collection);
  notify(collection);
}

/**
 * Sends a puppy inquiry. Order of preference:
 *   backend (VITE_API_URL) -> Web3Forms (VITE_WEB3FORMS_KEY) -> form service (VITE_INQUIRY_ENDPOINT)
 *   -> saved locally for the admin panel.
 */
export async function submitInquiry(payload) {
  const body = { ...payload, sentAt: new Date().toISOString() };
  if (isRemote) return http('/inquiries', { method: 'POST', body: JSON.stringify(body) });
  if (api.web3formsKey) return sendViaWeb3Forms(body);
  if (api.inquiryEndpoint) {
    const res = await fetch(api.inquiryEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error('The message could not be sent. Please call or text us instead.');
    return { ok: true };
  }
  const saved = (await localStore.read('inquiries')) ?? [];
  await localStore.write('inquiries', [{ id: newId('inq'), ...body }, ...saved]);
  notify('inquiries');
  return { ok: true, storedLocally: true };
}

// Web3Forms emails each submission to the inbox the key was issued for. The key is public by
// design: it can only send to that inbox. The field names below are the labels shown in the email.
async function sendViaWeb3Forms({ name, email, phone, contactBy, message, puppyName }) {
  const subject = `New puppy inquiry: ${puppyName}${name ? ` (${name})` : ''}`;
  const fields = { name, email, phone, Puppy: puppyName, 'Best way to reach': contactBy, message };
  const filled = Object.fromEntries(Object.entries(fields).filter(([, value]) => value));
  const res = await fetch('https://api.web3forms.com/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ ...filled, access_key: api.web3formsKey, subject, from_name: 'Gulf Coast Corgis' }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.success) throw new Error('The message could not be sent. Please call or text us instead.');
  return { ok: true };
}

/**
 * Turns a chosen image file into a URL the site can display.
 *   Remote: POST multipart/form-data (field "image") to /uploads, expects { url } back.
 *           (S3, Cloudinary, or a local uploads folder on your Express server all work.)
 *   Local:  shrinks the photo in the browser and keeps it as a data URL.
 */
export async function uploadImage(file) {
  if (isRemote) {
    const fd = new FormData();
    fd.append('image', file);
    const res = await fetch(`${api.baseUrl}/uploads`, { method: 'POST', body: fd });
    if (!res.ok) throw new Error(`Upload failed with status ${res.status}`);
    return (await res.json()).url;
  }
  return resizeToDataUrl(file);
}

async function resizeToDataUrl(file, max = 1400, quality = 0.82) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', quality);
}

export async function listInquiries() {
  if (isRemote) return http('/inquiries');
  return (await localStore.read('inquiries')) ?? [];
}
