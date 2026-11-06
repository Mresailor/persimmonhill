/**
 * Simple static page assembler for Persimmon Hill Labs.
 * Produces full standalone HTML pages that share one header/footer,
 * so there is NO runtime dependency and the site works on any static host.
 *
 * Run:  node build.js
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const NAV = [
  ["index.html", "Home"],
  ["about-us.html", "About"],
  ["our-dogs.html", "Our Dogs"],
  ["puppies.html", "Puppies"],
  ["gallery.html", "Gallery"],
  ["kennel.html", "Our Facilities"],
  ["testimonials.html", "Testimonials"],
  ["prospective-owners.html", "Apply"],
  ["links.html", "Links"],
  ["contact.html", "Contact"],
];

function header(active) {
  const links = NAV.map(
    ([href, label]) =>
      `      <li><a href="${href}"${href === active ? ' class="active"' : ""}>${label}</a></li>`
  ).join("\n");
  return `<div class="topbar">
  🐾 Breeding exceptional English Labradors since 1994 · Columbus, NC · Call Barbara at
  <a href="tel:18283519339">828-351-9339</a>
</div>

<header class="site-header">
  <nav class="nav container">
    <a class="brand" href="index.html">
      <img src="assets/images/logo.png" alt="Persimmon Hill Labs logo">
      <span class="brand-text">
        <strong>Persimmon Hill</strong>
        <span>Labrador Retrievers</span>
      </span>
    </a>
    <button class="nav-toggle" aria-label="Menu">☰</button>
    <ul class="nav-links">
${links}
    </ul>
  </nav>
</header>`;
}

const FOOTER = `<footer class="site-footer">
  <div class="container footer-grid">
    <div>
      <h4>Persimmon Hill Labrador Retrievers</h4>
      <p>Beautiful, home-raised English Labradors with superb temperaments — bred with love on our 17-acre farm in the Foothills of Western North Carolina since 1994.</p>
      <p>Home of CH Berghoff &amp; GCH Isabella.</p>
    </div>
    <div class="footer-contact">
      <h4>Get in Touch</h4>
      <p>📞 <a href="tel:18283519339">828-351-9339</a></p>
      <p>✉️ <a href="mailto:barb@persimmonhilllabs.com">barb@persimmonhilllabs.com</a></p>
      <p>📍 Columbus, North Carolina</p>
    </div>
    <div>
      <h4>Explore</h4>
      <ul class="footer-links">
        <li><a href="about-us.html">About Us</a></li>
        <li><a href="our-dogs.html">Our Dogs</a></li>
        <li><a href="puppies.html">Upcoming Puppies</a></li>
        <li><a href="gallery.html">Gallery</a></li>
        <li><a href="testimonials.html">Testimonials</a></li>
        <li><a href="prospective-owners.html">Puppy Application</a></li>
        <li><a href="contact.html">Contact</a></li>
      </ul>
    </div>
  </div>
  <div class="container footer-bottom">
    &copy; <span class="js-year">2026</span> Persimmon Hill Labrador Retrievers · Columbus, NC · All rights reserved.
  </div>
</footer>`;

function page({ file, title, desc, body }) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<meta name="description" content="${desc}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Nunito:wght@400;600;700;800&display=swap" rel="stylesheet">
<link rel="icon" href="assets/images/logo.png">
<link rel="stylesheet" href="css/style.css">
</head>
<body>

${header(file)}

${body}

${FOOTER}

<script src="js/main.js"></script>
</body>
</html>
`;
  fs.writeFileSync(path.join(__dirname, file), html);
  console.log("wrote", file);
}

// Load page bodies
const pagesDir = path.join(__dirname, "pages");
const defs = JSON.parse(fs.readFileSync(path.join(pagesDir, "pages.json"), "utf8"));
for (const def of defs) {
  const body = fs.readFileSync(path.join(pagesDir, def.bodyFile), "utf8");
  page({ file: def.file, title: def.title, desc: def.desc, body });
}
console.log("Done. Built", defs.length, "pages.");
