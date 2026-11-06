/**
 * Persimmon Hill Labrador Retrievers
 * Static site server + contact/prospective-buyer form handler.
 *
 * All form submissions are emailed to barb@persimmonhilllabs.com.
 *
 * Email configuration (via environment variables):
 *   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE ("true"/"false")
 *   MAIL_FROM  (optional, defaults to SMTP_USER)
 *
 * If SMTP is not configured, submissions are logged to the console and saved
 * to ./submissions.log so no lead is ever lost in development.
 */

import express from "express";
import nodemailer from "nodemailer";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT || 3000;
const RECIPIENT = "barb@persimmonhilllabs.com";

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

/* ---------- Mail transport ---------- */
let transporter = null;
if (process.env.SMTP_HOST) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE || "false") === "true",
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined,
  });
}

function escapeHtml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function formatSubmission(kind, data) {
  const rows = Object.entries(data)
    .filter(([, v]) => v !== undefined && v !== "")
    .map(([k, v]) => {
      const val = Array.isArray(v) ? v.join(", ") : v;
      return `<tr><td style="padding:6px 12px;font-weight:700;color:#3d5a40;vertical-align:top">${escapeHtml(k)}</td><td style="padding:6px 12px">${escapeHtml(val)}</td></tr>`;
    })
    .join("");
  const html = `
    <div style="font-family:Arial,sans-serif;color:#33281e">
      <h2 style="color:#c9551f">New ${escapeHtml(kind)} from the Persimmon Hill Labs website</h2>
      <table style="border-collapse:collapse;background:#fdf6ee;border-radius:10px;overflow:hidden">${rows}</table>
      <p style="color:#6b5d4f;font-size:13px;margin-top:16px">Received ${new Date().toLocaleString()}</p>
    </div>`;
  const text = Object.entries(data)
    .filter(([, v]) => v !== undefined && v !== "")
    .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
    .join("\n");
  return { html, text };
}

async function handleForm(kind, subjectPrefix, req, res) {
  try {
    const data = req.body || {};

    // Honeypot: silently accept bot spam without emailing
    if (data.website_hp) {
      return res.json({ success: true });
    }

    const replyTo = data.Email || data.email || undefined;
    const name = data.Name || data.name || data.First || "Website visitor";
    const { html, text } = formatSubmission(kind, data);
    const subject = `${subjectPrefix}: ${name}`;

    if (transporter) {
      await transporter.sendMail({
        from: process.env.MAIL_FROM || process.env.SMTP_USER || "website@persimmonhilllabs.com",
        to: RECIPIENT,
        replyTo,
        subject,
        text,
        html,
      });
    } else {
      // Dev fallback — never lose a lead
      const entry = `\n===== ${new Date().toISOString()} — ${kind} =====\nTO: ${RECIPIENT}\nSUBJECT: ${subject}\nREPLY-TO: ${replyTo || "(none)"}\n${text}\n`;
      fs.appendFileSync(path.join(__dirname, "submissions.log"), entry);
      console.log("[FORM] SMTP not configured — logged submission:", entry);
    }

    res.json({ success: true });
  } catch (err) {
    console.error("[FORM] Error:", err);
    res.status(500).json({ success: false, error: "We couldn't send your message right now." });
  }
}

app.post("/api/contact", (req, res) =>
  handleForm("Contact message", "Website Contact", req, res)
);
app.post("/api/prospective-buyer", (req, res) =>
  handleForm("Prospective Buyer application", "Puppy Application", req, res)
);

/* ---------- Static site ---------- */
app.use(express.static(__dirname, { extensions: ["html"] }));

app.listen(PORT, () => {
  console.log(`🐾 Persimmon Hill Labs site running on http://localhost:${PORT}`);
  console.log(`   Form emails route to: ${RECIPIENT}`);
  console.log(`   SMTP configured: ${transporter ? "yes" : "no (dev log fallback active)"}`);
});
