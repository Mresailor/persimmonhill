# Persimmon Hill Labrador Retrievers — Website

A completely rebuilt, modern, slightly-whimsical website for Persimmon Hill
Labrador Retrievers. **No WordPress** — this is a clean, self-contained site
built with plain HTML, CSS, and vanilla JavaScript, plus a tiny Node/Express
backend that handles the contact and puppy-application forms.

All form submissions are emailed to **barb@persimmonhilllabs.com**.

## Pages

| Page | File | Notes |
|------|------|-------|
| Home | `index.html` | Rotating hero slideshow, intro, champions, puppy news |
| About | `about-us.html` | The farm, the story, English Lab info |
| Our Dogs | `our-dogs.html` | CH Berghie, GCH Isabella, Raven & Blizzard |
| Pedigrees | `pedigree.html` | Full pedigree images (lightbox) |
| Puppies | `puppies.html` | Upcoming litter news & process |
| Gallery | `gallery.html` | 50 photos, masonry layout + lightbox |
| Our Facilities | `kennel.html` | Kennel build-out gallery (22 photos) |
| Testimonials | `testimonials.html` | **20 testimonials scrolling down the right sidebar** |
| Apply | `prospective-owners.html` | Full prospective-owner application form |
| Links | `links.html` | Breed & health-testing resources |
| Contact | `contact.html` | Contact form + phone/email |

## Design

- Warm "persimmon" + forest-green + gold palette, dotted backdrop, wavy/tilted
  accents, rounded cards, and playful micro-interactions for a modern,
  slightly whimsical feel.
- Fully responsive with a mobile nav.
- Scroll-reveal animations, hero slideshow, and an accessible image lightbox
  (keyboard arrows + Escape).
- Fonts: Fraunces (headings) + Nunito (body).

## Photos

All photography and brand assets were sourced from the original
persimmonhilllabs.com site and stored locally in `assets/images/`
(plus `assets/images/gallery/` and `assets/images/kennel/`). The site has
**no runtime dependency on the old WordPress site.**

## Running locally

```bash
npm install
npm start
# → http://localhost:3000
```

The Express server (`server.js`) serves the static site and exposes two form
endpoints:

- `POST /api/contact`
- `POST /api/prospective-buyer`

## Forms — server-side JavaScript processing

Both forms POST to `/api/contact` and `/api/prospective-buyer`, where a
**server-side JavaScript action** validates the submission, builds an email,
and sends it to **barb@persimmonhilllabs.com**. The sending logic lives in one
shared module — [`lib/mailer.js`](lib/mailer.js) — and is reused by three
interchangeable server-side runtimes, so you can deploy however you like:

| Runtime | Files | Endpoint |
|---------|-------|----------|
| Node/Express server | `server.js` | `/api/*` |
| Vercel functions | `api/contact.js`, `api/prospective-buyer.js` | `/api/*` (auto) |
| Netlify functions | `netlify/functions/*.js` + `netlify.toml` | `/api/*` (redirect) |

All three call the same `processForm()` action. A spam honeypot silently
discards bot submissions.

### The one required step: email credentials (SMTP)

The server-side action sends mail over SMTP. Until you provide credentials, the
Node server only logs submissions to `submissions.log` (and the serverless
functions log to their platform console) — **nothing is emailed**. Set these
environment variables wherever you deploy:

```bash
SMTP_HOST=smtp.yourprovider.com
SMTP_PORT=587
SMTP_SECURE=false        # true for port 465
SMTP_USER=your-smtp-username
SMTP_PASS=your-smtp-password
MAIL_FROM=website@persimmonhilllabs.com   # optional
MAIL_TO=barb@persimmonhilllabs.com        # optional (this is the default)
```

- **Express:** `export` the vars (or use a `.env` loader) and run `npm start`.
- **Vercel:** Project → Settings → Environment Variables.
- **Netlify:** Site settings → Environment variables.

Any SMTP provider works — e.g. Gmail (app password), Zoho, Fastmail,
SendGrid/Mailgun/Postmark SMTP, or Barb's email host.

> Tip: this has been verified end-to-end — with SMTP configured, a submission
> produces a real email `To: barb@persimmonhilllabs.com` with the sender's
> address as `Reply-To`, so Barb can just hit reply.

### Prefer no server at all?

You can instead point the forms at a hosted form service by editing
`FORM_ENDPOINTS` at the top of `js/main.js`, e.g.
`"/api/contact": "https://formspree.io/f/abcdwxyz"`. Then the site works as pure
static files (GitHub Pages, S3, etc.) with no server-side code.

## Static-only hosting

Because every page is a fully standalone HTML file, you can also host the
site on any static host (Netlify, GitHub Pages, S3, etc.). In that case, wire
the two forms up to a form service (Formspree, Netlify Forms, etc.) that
delivers to `barb@persimmonhilllabs.com`, or deploy `server.js` on a Node host.

## Editing content

Page bodies live in `pages/*.html` and are assembled into full pages (with the
shared header/footer) by `build.js`:

```bash
node build.js
```

Edit a body fragment in `pages/`, re-run `node build.js`, and the corresponding
top-level `.html` file is regenerated.
