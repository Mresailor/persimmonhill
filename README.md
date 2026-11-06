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

### Email configuration

By default (no SMTP configured) submissions are logged to `submissions.log`
so nothing is lost in development. To send real email to
`barb@persimmonhilllabs.com`, set these environment variables:

```bash
export SMTP_HOST=smtp.yourprovider.com
export SMTP_PORT=587
export SMTP_SECURE=false        # true for port 465
export SMTP_USER=your-smtp-username
export SMTP_PASS=your-smtp-password
export MAIL_FROM=website@persimmonhilllabs.com   # optional
npm start
```

A spam honeypot field silently discards bot submissions.

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
