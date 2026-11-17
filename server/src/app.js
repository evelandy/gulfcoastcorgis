import express from 'express';
import { query } from './db.js';
import { ValidationError, fromRow, toRow, collections } from './collections.js';
import { requireAdmin } from './middleware/requireAdmin.js';

export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '1mb' }));

  // Everything lives under /api.
  const api = express.Router();

  api.param('collection', (req, res, next, name) => {
    if (!Object.hasOwn(collections, name)) {
      return res.status(404).json({ error: 'Invalid collection' });
    }
    next();
  });

  api.get('/health', async (_req, res) => {
    await query('SELECT 1');
    res.json({ ok: true, db: 'up' });
  });

  api.get('/:collection', async (req, res) => {
    const result = await query(`SELECT * FROM ${req.params.collection} ORDER BY created_at, id`);
    res.json(result.rows.map(row => fromRow(req.params.collection, row)));
  });

  api.delete('/:collection/:id', requireAdmin, async (req, res) => {
    const result = await query(`DELETE FROM ${req.params.collection} WHERE id = $1`, [req.params.id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.status(204).end();
  });

  api.put('/:collection/:id', requireAdmin, async (req, res) => {
    const row = toRow(req.params.collection, req.body ?? {});
    const columns = Object.keys(row);
    const setClause = columns.map((k, i) => `${k} = $${i + 1}`).join(', ');
    const sql = `UPDATE ${req.params.collection} SET ${setClause} WHERE id = $${columns.length + 1} RETURNING *`;
    const result = await query(sql, [...Object.values(row), req.params.id]);
    if(result.rows.length === 0) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.json(fromRow(req.params.collection, result.rows[0]));
  });

  api.post('/:collection', requireAdmin, async (req, res) => {
    const id = `${collections[req.params.collection].idPrefix}-${crypto.randomUUID().slice(0, 8)}`;
    const row = toRow(req.params.collection, req.body ?? {});
    const newRow = { id, ...row };
    const columns = Object.keys(newRow);
    const sql = `INSERT INTO ${req.params.collection} (${columns.join(', ')}) VALUES (${columns.map((_, i) => `$${i + 1}`).join(', ')}) RETURNING *`;
    const result = await query(sql, Object.values(newRow));
    res.status(201).json(fromRow(req.params.collection, result.rows[0]));
  });

  app.use('/api', api);

  app.use((_req, res) => res.status(404).json({ error: 'Not found' }));

  // Express 5 forwards errors thrown in async handlers here.
  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    if(err.code === '23502') {
      return res.status(400).json({ error: `${err.column} is required` });
    } else if(err.code === '23503') {
      return res.status(400).json({ error: `One of the linked items does not exist: ${err.constraint}` });
    } else if(err.code === '23514') {
      return res.status(400).json({ error: `One of the values is invalid: ${err.constraint}` })
    }
    if (err instanceof ValidationError) return res.status(400).json({ error: err.message });
    if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'Request body is not valid JSON' });
    console.error(err);
    res.status(500).json({ error: 'Something went wrong on the server' });
  });

  return app;
}
