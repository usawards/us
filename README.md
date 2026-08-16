# USEA Frontend

Next.js (App Router) + Tailwind frontend for the United States Excellence
Awards, deployed separately from [`usea-backend`](../usea-backend) and
talking to it entirely over HTTPS via `NEXT_PUBLIC_API_URL`.

## What's real vs. what to double check

This project fetches **live data** from your backend — categories,
nominees, leaderboard, and settings all come from the API, not mock data.
The vote flow calls `POST /api/votes/initiate`, then redirects the browser
to the `authorization_url` Paystack returns, which is Paystack's own hosted
checkout page (that's where Apple Pay / card actually render — see the
backend README's note on confirming your Paystack account supports USD +
Apple Pay before relying on this in production).

## Structure

```
app/
  layout.js            # fonts + global shell
  globals.css           # Tailwind + the ballot-stub perforation effect
  page.js                # homepage - fetches categories/settings/leaderboard, assembles sections
  vote/confirm/page.js   # Paystack redirects here after checkout; polls /api/votes/verify
components/
  Nav, Hero, Countdown, Categories, NomineeGrid (+ NomineeCard),
  VoteModal, Leaderboard, Prizes, HowItWorks, Faq, Contact, Footer
lib/
  api.js                # every backend call lives here
```

## Local setup

```bash
npm install
cp .env.example .env.local     # set NEXT_PUBLIC_API_URL to your backend
npm run dev
```

Runs at `http://localhost:3000`. Point `NEXT_PUBLIC_API_URL` at your local
`usea-backend` (e.g. `http://localhost:10000`) or the deployed Render URL.

## Deploying (Vercel is the natural fit, per the original spec)

1. Push this folder to its **own** GitHub repo (e.g. `usea-frontend`) —
   keep it separate from `usea-backend`, since you're deploying both
   independently.
2. Vercel → New Project → import the repo. Framework preset auto-detects
   Next.js.
3. Set the environment variable `NEXT_PUBLIC_API_URL` to your Render
   backend's URL (e.g. `https://usea-backend.onrender.com`) — no trailing
   slash.
4. Deploy. Once you have the resulting Vercel URL, go back to the backend's
   Render environment variables and set `CORS_ORIGINS` to that URL (and
   `PAYSTACK_CALLBACK_URL` to `https://<your-vercel-domain>/vote/confirm`),
   then redeploy the backend so it picks up the new values.
5. If you later add Apple Pay domain verification in the Paystack
   dashboard, the domain you register there should be this frontend's
   domain (Apple Pay validates the page presenting checkout — even though
   the actual checkout UI is Paystack's hosted page, not this app).

## Image hosts

Nominee photos render via `next/image`, which requires listing allowed
image domains in `next.config.js`. It currently only allows
`images.unsplash.com` (used by the sample/demo data). Add wherever your
admin panel actually uploads nominee photos to (S3, Cloudinary, etc.) before
adding real nominees, or `next/image` will refuse to render them.

## Things intentionally left simple for now

- **Admin dashboard UI**: the backend has full admin endpoints (nominees,
  categories, transactions, CSV export, audit logs, settings) but this repo
  is the public-facing site only — no `/admin` pages yet. Say the word and
  I'll build that as its own section (or its own app) against the same API.
- **Contact form**: submits nowhere yet (the backend has no contact-form
  endpoint) — wire it to an email service (Resend, SendGrid, etc.) or add a
  `/api/contact` route on the backend.
- **Social share button**: currently copies a link to the homepage rather
  than a deep link to the individual nominee, since there's no nominee
  detail route yet.
