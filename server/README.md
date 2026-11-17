# GulfCoast Corgis API

Express + Postgres backend for the admin panel. The public site keeps reading the bundled JSON; this API is what the admin panel saves to.

## First-time setup

Needs Node 20.6+ and Docker (OrbStack works).

```bash
cd server
npm install
cp .env.example .env
npm run db:up        # starts Postgres in Docker on localhost:5436
npm run db:migrate   # creates the tables
npm run db:seed      # loads src/data/*.json
npm run dev          # API on http://localhost:4000/api, restarts on file changes
```

Check it: `curl localhost:4000/api/health` should return `{"ok":true,"db":"up"}`. With `npm run dev` running in the project root, the same URL works through Vite at `localhost:5173/api/health`.

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Runs the API and restarts it when a file changes |
| `npm run db:up` / `db:down` | Starts or stops the Postgres container. Your data stays in a Docker volume either way. |
| `npm run db:migrate` | Runs any migrations that haven't run yet. Safe to run anytime. |
| `npm run db:seed` | Loads `src/data/*.json`, but only into empty tables, so it never overwrites admin edits |
| `npm run db:reset` | Empties dogs, litters, puppies and families, then reloads them from the JSON. Inquiries are kept. |
| `npm run db:psql` | Opens a SQL prompt on the database |

## How it's organized

```
migrations/        SQL files, run once each in filename order
src/
  index.js         starts the server
  app.js           Express app: routes under /api, 404 and error handling
  db.js            Postgres connection pool and transaction helper
  collections.js   the fields of each collection, and conversion between JSON items and table rows
  scripts/         migrate and seed
```

Fields are camelCase in the JSON and the frontend (`callName`) and snake_case in the database (`call_name`). `collections.js` converts between the two and checks types: whole-number prices, `YYYY-MM-DD` dates, and lists for photos.

## Adding a field

1. Add a migration, for example `migrations/002_add_microchip.sql` with `ALTER TABLE puppies ADD COLUMN microchip text;`. Never edit a migration that has already run.
2. Add the field to that collection in `src/collections.js`.
3. Add it to `src/admin/schemas.js` so it appears in the admin form.

## Data rules the database enforces

- **Links between items must point to something real.** A litter's mom and dad must exist in dogs, and a puppy's litter must exist in litters.
- **Deleting keeps the related items.** Deleting a dog clears the parent on its litters, and deleting a litter clears it on its puppies. Nothing else is deleted.
- **Some fields only accept fixed values.** Role is `dam` or `sire`; puppy status is `available`, `reserved` or `home`; litter status is `current`, `upcoming` or `past`.
- **Every inquiry needs an email or a phone number.**
