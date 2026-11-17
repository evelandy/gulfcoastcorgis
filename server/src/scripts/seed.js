import { readFile } from 'node:fs/promises';
import { pool, query, withTransaction } from '../db.js';
import { collections, COLLECTION_NAMES, toRow, unknownKeys } from '../collections.js';

const reset = process.argv.includes('--reset');
const dataDir = new URL('../../../src/data/', import.meta.url);
const IGNORED_KEYS = new Set(['_note']); // notes for this left in the JSON file

if (!reset) {
  const { rows } = await query(
    `SELECT (SELECT count(*) FROM dogs) + (SELECT count(*) FROM litters)
          + (SELECT count(*) FROM puppies) + (SELECT count(*) FROM families) AS total`,
  );
  if (Number(rows[0].total) > 0) {
    console.log('The database already has data, so nothing was changed.');
    console.log('Run `npm run db:reset` to replace it with src/data/*.json.');
    await pool.end();
    process.exit(0);
  }
}

const warnings = [];
const counts = {};

await withTransaction(async (client) => {
  if (reset) await client.query('TRUNCATE dogs, litters, puppies, families');

  const seenIds = {};
  let clock = Date.now();

  for (const name of COLLECTION_NAMES) {
    const items = JSON.parse(await readFile(new URL(`${name}.json`, dataDir), 'utf8'));
    seenIds[name] = new Set();

    for (const item of items) {
      const extra = unknownKeys(name, item).filter((k) => !IGNORED_KEYS.has(k));
      if (extra.length) warnings.push(`${name}/${item.id}: skipped unknown field(s) ${extra.join(', ')}`);

      const clean = { ...item };
      for (const [field, spec] of Object.entries(collections[name].fields)) {
        if (spec.type === 'ref' && clean[field] && !seenIds[spec.collection].has(clean[field])) {
          warnings.push(`${name}/${item.id}: ${field} "${clean[field]}" is not in ${spec.collection}.json, cleared`);
          delete clean[field];
        }
      }

      const at = new Date(clock++);
      const row = { id: item.id, ...toRow(name, clean), created_at: at, updated_at: at };
      const columns = Object.keys(row);
      const placeholders = columns.map((_, i) => `$${i + 1}`);
      await client.query(
        `INSERT INTO ${name} (${columns.join(', ')}) VALUES (${placeholders.join(', ')})`,
        Object.values(row),
      );
      seenIds[name].add(item.id);
    }
    counts[name] = items.length;
  }
});

console.log(
  `Seeded ${Object.entries(counts)
    .map(([n, c]) => `${c} ${n}`)
    .join(', ')}.`,
);
for (const w of warnings) console.warn(`warning: ${w}`);
await pool.end();
