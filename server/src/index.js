import { createApp } from './app.js';
import { pool } from './db.js';

const port = Number(process.env.PORT) || 4000;

const server = createApp().listen(port, () => {
  console.log(`GulfCoast Corgis API on http://localhost:${port}/api`);
});

function shutdown() {
  server.close(() => pool.end().then(() => process.exit(0)));
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
