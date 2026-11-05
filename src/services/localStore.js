// Browser-only storage!!! used before a backend exists. Everything lives in IndexedDB on THIS browser, so it's for building and previewing,
// and NOT for sharing with live visitors. Use "Export JSON" in the admin panel to move data into src/data/*.json (or into database) so everyone sees it.
import { get, set, del } from 'idb-keyval';

const key = (collection) => `gcc:${collection}`;

export const localStore = {
  async read(collection) {
    try {
      return (await get(key(collection))) ?? null;
    } catch {
      return null; // storage blocked (private mode, sandboxed preview): fall back to seed files
    }
  },
  async write(collection, items) {
    await set(key(collection), items);
  },
  async clear(collection) {
    await del(key(collection));
  },
};
