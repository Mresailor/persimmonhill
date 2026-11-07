/**
 * Shared server-side form-processing logic for Persimmon Hill Labs.
 *
 * Used by BOTH:
 *   - server.js                (standalone Node/Express server)
 *   - netlify/functions/*.js   (Netlify serverless functions)
 *   - api/*.js                 (Vercel serverless functions)
 *
 * All submissions are emailed to barb@persimmonhilllabs.com.
 *
 * Email is sent via SMTP using nodemailer. Configure with env vars:
 *   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE ("true"/"false")
 *   MAIL_FROM (optional), MAIL_TO (optional override of recipient)
 */

import nodemailer from "nodemailer";

export const RECIPIENT = process.env.MAIL_TO || "barb@persimmonhilllabs.com";

let _transporter;
/** Lazily create (and cache) the SMTP transport. Returns null if unconfigured. */
export function getTransporter() {
  if (_transporter !== undefined) return _transporter;
  if (process.env.SMTP_HOST) {
    _transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: String(process.env.SMTP_SECURE || "false") === "true",
      auth: process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
    });
  } else {
    _transporter = null;
  }
  return _transporter;
}

function escapeHtml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** Build a tidy HTML + plain-text email body from a submission object. */
export function formatSubmission(kind, data) {
  const entries = Object.entries(data).filter(
    ([k, v]) => v !== undefined && v !== "" && k !== "website_hp"
  );
  const rows = entries
    .map(([k, v]) => {
      const val = Array.isArray(v) ? v.join(", ") : v;
      return `<tr><td style="padding:6px 12px;font-weight:700;color:#3d5a40;vertical-align:top">${escapeHtml(
        k
      )}</td><td style="padding:6px 12px">${escapeHtml(val)}</td></tr>`;
    })
    .join("");
  const html = `
    <div style="font-family:Arial,sans-serif;color:#33281e">
      <h2 style="color:#c9551f">New ${escapeHtml(kind)} from the Persimmon Hill Labs website</h2>
      <table style="border-collapse:collapse;background:#fdf6ee;border-radius:10px;overflow:hidden">${rows}</table>
      <p style="color:#6b5d4f;font-size:13px;margin-top:16px">Received ${new Date().toLocaleString()}</p>
    </div>`;
  const text = entries
    .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
    .join("\n");
  return { html, text };
}

/**
 * Process one form submission server-side: validate, build the email, send it.
 * Returns { status, body } so any server/serverless wrapper can respond.
 *
 * @param {"contact"|"prospective-buyer"} type
 * @param {object} data  key/value fields from the form
 * @param {function} [logFallback]  optional (entry:string)=>void for dev logging
 */
export async function processForm(type, data = {}, logFallback) {
  const meta = {
    contact: { kind: "Contact message", subjectPrefix: "Website Contact" },
    "prospective-buyer": {
      kind: "Prospective Buyer application",
      subjectPrefix: "Puppy Application",
    },
  }[type] || { kind: "Website submission", subjectPrefix: "Website" };

  // Honeypot: silently accept bot spam without emailing.
  if (data.website_hp) {
    return { status: 200, body: { success: true } };
  }

  const replyTo = data.Email || data.email || undefined;
  const name = data.Name || data.name || data.First || "Website visitor";
  const subject = `${meta.subjectPrefix}: ${name}`;
  const { html, text } = formatSubmission(meta.kind, data);

  const transporter = getTransporter();
  if (transporter) {
    await transporter.sendMail({
      from:
        process.env.MAIL_FROM ||
        process.env.SMTP_USER ||
        "website@persimmonhilllabs.com",
      to: RECIPIENT,
      replyTo,
      subject,
      text,
      html,
    });
  } else {
    const entry = `\n===== ${new Date().toISOString()} — ${meta.kind} =====\nTO: ${RECIPIENT}\nSUBJECT: ${subject}\nREPLY-TO: ${replyTo || "(none)"}\n${text}\n`;
    if (typeof logFallback === "function") logFallback(entry);
    console.log("[FORM] SMTP not configured — logged submission:", entry);
  }

  return { status: 200, body: { success: true } };
}
