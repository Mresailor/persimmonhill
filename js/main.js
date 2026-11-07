/* Persimmon Hill Labs — shared site interactions */
(function () {
  "use strict";

  /* =========================================================
     FORM DELIVERY CONFIG
     ---------------------------------------------------------
     The forms email barb@persimmonhilllabs.com. Pick ONE option:

     OPTION A — Formspree (recommended, works on ANY static host
     incl. GitHub Pages; no server needed):
       1. Go to https://formspree.io, sign up, and create TWO forms.
          Set each form's recipient to barb@persimmonhilllabs.com
          (Barb must click the confirmation email Formspree sends).
       2. Paste each form's endpoint below, e.g.
          "https://formspree.io/f/abcdwxyz".

     OPTION B — the built-in Node server (server.js):
       Leave the values as "/api/contact" and
       "/api/prospective-buyer" and run `npm start` with SMTP
       environment variables set (see README). Do NOT host the
       HTML statically in this case — the forms need the server.
     ========================================================= */
  var FORM_ENDPOINTS = {
    "/api/contact": "/api/contact",                       // ← replace with your Formspree URL for Option A
    "/api/prospective-buyer": "/api/prospective-buyer"    // ← replace with your Formspree URL for Option A
  };

  /* ---- Mobile nav toggle ---- */
  var toggle = document.querySelector(".nav-toggle");
  var links = document.querySelector(".nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      links.classList.toggle("open");
    });
  }

  /* ---- Hero slideshow ---- */
  var slides = document.querySelectorAll(".hero-slide");
  if (slides.length > 1) {
    var i = 0;
    setInterval(function () {
      slides[i].classList.remove("active");
      i = (i + 1) % slides.length;
      slides[i].classList.add("active");
    }, 5000);
  }

  /* ---- Scroll reveal ---- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && reveals.length) {
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    reveals.forEach(function (el) { obs.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---- Lightbox gallery ---- */
  var galleryLinks = Array.prototype.slice.call(document.querySelectorAll("[data-lightbox]"));
  if (galleryLinks.length) {
    var box = document.createElement("div");
    box.className = "lightbox";
    box.innerHTML =
      '<button class="lb-close" aria-label="Close">&times;</button>' +
      '<button class="lb-nav lb-prev" aria-label="Previous">&#8249;</button>' +
      '<img alt="Enlarged gallery photo">' +
      '<button class="lb-nav lb-next" aria-label="Next">&#8250;</button>';
    document.body.appendChild(box);
    var lbImg = box.querySelector("img");
    var current = 0;

    function show(n) {
      current = (n + galleryLinks.length) % galleryLinks.length;
      lbImg.src = galleryLinks[current].getAttribute("href");
      box.classList.add("open");
    }
    galleryLinks.forEach(function (a, idx) {
      a.addEventListener("click", function (ev) {
        ev.preventDefault();
        show(idx);
      });
    });
    box.querySelector(".lb-close").addEventListener("click", function () { box.classList.remove("open"); });
    box.querySelector(".lb-next").addEventListener("click", function (e) { e.stopPropagation(); show(current + 1); });
    box.querySelector(".lb-prev").addEventListener("click", function (e) { e.stopPropagation(); show(current - 1); });
    box.addEventListener("click", function (e) { if (e.target === box) box.classList.remove("open"); });
    document.addEventListener("keydown", function (e) {
      if (!box.classList.contains("open")) return;
      if (e.key === "Escape") box.classList.remove("open");
      if (e.key === "ArrowRight") show(current + 1);
      if (e.key === "ArrowLeft") show(current - 1);
    });
  }

  /* ---- Set current year in footer ---- */
  var yr = document.querySelectorAll(".js-year");
  yr.forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---- AJAX form submission ---- */
  var forms = document.querySelectorAll("form[data-ajax]");
  forms.forEach(function (form) {
    var status = form.querySelector(".form-status");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var btn = form.querySelector('button[type="submit"]');
      var original = btn ? btn.textContent : "";
      if (btn) { btn.disabled = true; btn.textContent = "Sending…"; }
      if (status) { status.className = "form-status"; }

      var data = new FormData(form);
      var rawAction = form.getAttribute("action");
      var action = FORM_ENDPOINTS[rawAction] || rawAction;
      fetch(action, {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" }
      })
        .then(function (r) {
          return r.text().then(function (t) {
            var j = {};
            try { j = t ? JSON.parse(t) : {}; } catch (e) { j = {}; }
            return { ok: r.ok, body: j };
          });
        })
        .then(function (res) {
          // Success covers both the Node backend ({success:true})
          // and Formspree / generic 2xx responses.
          var succeeded = res.ok && res.body.success !== false && !res.body.error && !res.body.errors;
          if (succeeded) {
            status.textContent = "🎉 Thank you! Your message is on its way to Barb. She'll be in touch soon.";
            status.className = "form-status ok show";
            form.reset();
          } else {
            var msg = res.body.error
              || (res.body.errors && res.body.errors[0] && res.body.errors[0].message)
              || "Something went wrong.";
            throw new Error(msg);
          }
        })
        .catch(function (err) {
          status.textContent = "⚠️ " + err.message + " You can also email barb@persimmonhilllabs.com directly.";
          status.className = "form-status err show";
        })
        .finally(function () {
          if (btn) { btn.disabled = false; btn.textContent = original; }
        });
    });
  });
})();
