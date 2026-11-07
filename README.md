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

## ⚠️ Making the forms actually send email

The forms submit fine, but **email is only delivered once you set up ONE of
the two options below.** Out of the box (Node server with no SMTP) submissions
are only written to `submissions.log` — nothing is emailed. Pick one:

### Option A — Formspree (recommended; works on ANY static host, no server)

Best if you host the site on GitHub Pages, Netlify, S3, etc.

1. Sign up at <https://formspree.io> and create **two** forms.
2. Set each form's recipient to **barb@persimmonhilllabs.com**. Formspree sends
   a confirmation email — Barb must click the link once to activate delivery.
3. Open **`js/main.js`** and paste the two form endpoints into `FORM_ENDPOINTS`
   at the top of the file, e.g.:
   ```js
   var FORM_ENDPOINTS = {
     "/api/contact": "https://formspree.io/f/abcdwxyz",
     "/api/prospective-buyer": "https://formspree.io/f/efghijkl"
   };
   ```
That's it — the forms now email Barb directly, with no server to run.

### Option B — the built-in Node server (`server.js`) with SMTP

Best if you deploy on a Node host. Leave `FORM_ENDPOINTS` pointing at
`/api/contact` and `/api/prospective-buyer`, then provide SMTP credentials so
the server can send mail:

```bash
export SMTP_HOST=smtp.yourprovider.com
export SMTP_PORT=587
export SMTP_SECURE=false        # true for port 465
export SMTP_USER=your-smtp-username
export SMTP_PASS=your-smtp-password
export MAIL_FROM=website@persimmonhilllabs.com   # optional
npm start
```

> If you host the HTML statically (GitHub Pages, etc.) WITHOUT running
> `server.js`, the `/api/...` endpoints don't exist and the forms will fail —
> use Option A in that case.

A spam honeypot field silently discards bot submissions in both options.

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
