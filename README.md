# USEA Frontend (static, served via Render Web Service)

Plain HTML/CSS/JS for the actual site — no framework, nothing to compile.
`server.js` is only there because this deploys as a Render **Web Service**,
which requires a running process; it does nothing but serve the files below
as-is.

## Files

```
index.html          # the site
vote-confirm.html    # where Paystack redirects after checkout
css/styles.css        # all styling
js/config.js           # <- the one file you edit per environment (API_BASE_URL)
js/api.js               # fetch wrapper for every usea-backend endpoint
js/app.js                # renders the homepage from live API data + the vote modal
js/confirm.js             # polls /api/votes/verify on vote-confirm.html
server.js                  # minimal Express static file server (Render Web Service needs a process)
package.json                 # just the one dependency (express) to run server.js
render.yaml                    # Render Blueprint for one-click deploy
```

Everything on the homepage — categories, nominees, leaderboard, prizes,
countdown — is fetched live from `usea-backend` in `js/app.js`. Nothing here
is mock data. The vote button opens the modal, `startPayment()` in `app.js`
calls `POST /api/votes/initiate`, and the browser is redirected to Paystack's
hosted checkout (`authorization_url`), which is where Apple Pay / card
actually render.

## Before you deploy

Open `js/config.js` and set:

```js
const API_BASE_URL = 'https://your-backend.onrender.com'; // no trailing slash
```

That's the only edit required. There's no `.env` file and nothing to
compile — `API_BASE_URL` is just a JS constant read at page-load time.

## Deploying: GitHub repo → Render Web Service

This is deployed as a **Web Service**, same service type as `usea-backend`.
Since a Web Service needs an actual process listening on a port (unlike a
Static Site, which Render serves directly), `server.js` is a small Express
app whose only job is handing back the files in this folder — there's no
templating or API logic in it.

> **Trade-off worth knowing**: Render Static Sites are also free and don't
> spin down. A free/starter Web Service *does* spin down after ~15 minutes
> idle and cold-starts (a few seconds' delay) on the next visit — same
> behavior your backend already has. If that cold start ever bothers you on
> the frontend specifically, moving this to a Static Site removes it with
> no other changes needed (delete `server.js`/`package.json`, set publish
> directory to `.`). Sticking with Web Service here since that's what you
> asked for.

1. Push this folder to its own GitHub repo (e.g. `usea-frontend`) — separate
   from `usea-backend`.
2. Before pushing, set `API_BASE_URL` in `js/config.js` to your
   `usea-backend` service's URL.
3. Render Dashboard → New → **Web Service** → connect the repo.
   - Runtime: Node
   - Build command: `npm install`
   - Start command: `npm start`
   - Or use the included `render.yaml` via Dashboard → New → Blueprint.
4. Once live, Render gives you a URL like
   `https://usea-frontend.onrender.com`. Take that URL to the **backend's**
   Render environment variables and set:
   - `CORS_ORIGINS` → `https://usea-frontend.onrender.com`
   - `PAYSTACK_CALLBACK_URL` → `https://usea-frontend.onrender.com/vote-confirm.html`
5. Redeploy `usea-backend` so it picks up both changes.
6. If you enable Apple Pay in the Paystack dashboard, register *this
   site's* Render domain for Apple Pay domain verification.
7. Optional: add a custom domain later (Web Service → Settings → Custom
   Domains) — if you do, update `CORS_ORIGINS` and `PAYSTACK_CALLBACK_URL`
   on the backend to match.

## Running locally

```bash
npm install
npm start
```

Visit `http://localhost:3000`. (You can still use `python3 -m http.server`
for pure static preview without installing anything — `server.js` is only
needed to match how Render Web Service actually runs this in production.)

## Left out on purpose (same as the Next.js version)

- **Admin dashboard UI** — the backend has full admin endpoints already
  (nominees, categories, transactions, CSV export, audit logs, settings);
  this is the public-facing site only. Ask and I'll build an `admin.html`
  against the same API.
- **Contact form** — currently just shows a toast; there's no backend
  endpoint for it yet.
- **Nominee detail / deep links** — share button copies a link to the
  nominee section on the homepage, not an individual profile page (there's
  no per-nominee route yet).
