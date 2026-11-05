# GulfCoast Corgis website

A one-page React (Vite) site for showing off your dogs, listing puppies for sale, and getting inquiries. It runs with no backend today. When you're ready, you can connect your own API with one environment variable.

## Quick start

```bash
npm install
cp .env.example .env     # optional, fill in later
npm run dev              # http://localhost:5173
```

- Site: `http://localhost:5173/`
- Listings manager: `http://localhost:5173/#admin`

## Adding your dogs and puppies

**Option A: the listings manager (easiest).** Go to `/#admin`. Add dogs, litters, puppies, and family photos, and drag in pictures. Changes show up on the site right away **in that browser only** (saved in IndexedDB). When it looks right, open **Publish → Export JSON**, drop the four downloaded files into `src/data/`, and redeploy. Now everyone sees them.

**Option B: edit the files.** Put photos in `public/images/` and reference them as `/images/your-photo.jpg` in:

| File | What's in it |
| --- | --- |
| `src/data/dogs.json` | Moms and dads (`role`: `dam` or `sire`) |
| `src/data/litters.json` | Litters (`status`: `current`, `upcoming`, `past`) |
| `src/data/puppies.json` | Puppies (`status`: `available`, `reserved`, `home`) |
| `src/data/families.json` | Past puppies in their new homes |

The seed data is sample content (names, dates, prices, health tests, families). Replace all of it before launch. Families marked `"sample": true` show a "Sample" badge so they can't be mistaken for real ones.

Business details (phone, email, area, deposit amount, socials) live in **`src/config/site.js`**. Colors and fonts live in **`src/styles/tokens.css`**.

Tips:
- Puppies marked **Gone home** drop off the for-sale list and appear in the Families section automatically.
- Each puppy has a **collar color**, which colors its tag. That's how buyers tell littermates apart before they're named.
- The litter with `status: "current"` drives the hero tag ("4 of 6 still available").

## Getting inquiries before you have a backend

Right now the form saves messages only in the visitor's browser, so **you won't receive them** until you set one of these:

- `VITE_WEB3FORMS_KEY`: a [Web3Forms](https://web3forms.com) access key. Each inquiry is emailed to the inbox the key was issued for.
- `VITE_INQUIRY_ENDPOINT`: any form service that accepts JSON POSTs (Formspree, Getform, Basin) or a Zapier/Make webhook that emails or texts you.
- `VITE_API_URL`: your own backend (below).

## Connecting your backend

Set `VITE_API_URL` and the site switches from the JSON files to REST calls. All data access goes through **`src/services/api.js`**, so nothing else needs to change.

Routes the frontend expects:

```
GET    /dogs | /puppies | /litters | /families    -> JSON array
POST   /:collection                                -> create, returns the saved item (with id)
PUT    /:collection/:id                            -> update, returns the saved item
DELETE /:collection/:id
POST   /inquiries                                  -> { ok: true }
GET    /inquiries                                  -> JSON array (for the admin Messages tab)
POST   /uploads   (multipart, field "image")       -> { url: "https://..." }
```

Item shapes match the JSON files in `src/data`. `photos` is an array of URLs. A PERN setup works well: Express + `pg`, one table per collection (or a single `jsonb` column to start), `multer` for `/uploads`, then S3 or Cloudinary for storage.

During development, `vite.config.js` proxies `/api` to `http://localhost:4000`, so set `VITE_API_URL=/api` and run your Express server on port 4000.

**Before going live with a backend:** the `/#admin` page has no login. Protect the write routes (POST/PUT/DELETE/uploads, GET /inquiries) on the server with a session or JWT, and add a sign-in screen to `src/admin/Admin.jsx`. You can also hide the footer link with `VITE_SHOW_ADMIN_LINK=false`.

## Domain and deployment

```bash
npm run build      # static files in /dist
```

Deploy `/dist` to Netlify, Vercel, Cloudflare Pages, AWS S3 + CloudFront, or Amplify. It's plain static hosting with no server needed. Once you buy the domain:

1. Point the domain at your host (each host has a "custom domain" screen that gives you the DNS records).
2. Set `VITE_SITE_URL=https://www.yourdomain.com` and rebuild. That fills in the canonical and share-preview URLs.
3. Update the email in `src/config/site.js` if you set up an address on the new domain.

`npm run build:single` makes a single self-contained `index.html`, which is handy for sending a preview.

## Project map

```
src/
  App.jsx                page layout + #admin switch
  config/site.js         business details, env settings
  services/api.js        ALL data access (local JSON/IndexedDB or your API)
  services/localStore.js browser storage used before a backend exists
  hooks/useCollection.js load + auto-refresh a collection
  data/*.json            seed content
  components/            Hero, Puppies (hang tags), PuppyDetail (modal), Parents,
                         Process, Families, Inquiry (form), Header, Footer, Photo
  admin/                 listings manager (schemas.js drives the forms)
  styles/                tokens.css (brand), site.css, admin.css
```

To add a field (for example `microchipped`), add it to the JSON, add one line to `src/admin/schemas.js` so it appears in the form, and display it where you want in the component.
