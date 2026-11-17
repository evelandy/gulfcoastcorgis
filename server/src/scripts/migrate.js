// Next schema: (002_add_microchip.sql)
import { readdir, readFile } from 'node:fs/promises';
import { pool, query, withTransaction } from '../db.js';

const dir = new URL('../../migrations/', import.meta.url);

await query(`CREATE TABLE IF NOT EXISTS schema_migrations (
  name text PRIMARY KEY,
  applied_at timestamptz NOT NULL DEFAULT now()
)`);

const applied = new Set((await query('SELECT name FROM schema_migrations')).rows.map((r) => r.name));
const files = (await readdir(dir)).filter((f) => f.endsWith('.sql')).sort();
const pending = files.filter((f) => !applied.has(f));

for (const file of pending) {
  const sql = await readFile(new URL(file, dir), 'utf8');
  await withTransaction(async (client) => {
    await client.query(sql);
    await client.query('INSERT INTO schema_migrations (name) VALUES ($1)', [file]);
  });
  console.log(`applied ${file}`);
}

console.log(pending.length ? `${pending.length} migration(s) applied.` : 'Database is up to date.');
await pool.end();
