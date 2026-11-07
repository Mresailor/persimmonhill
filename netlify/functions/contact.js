/**
 * Netlify serverless function — processes the Contact form server-side.
 * Deployed automatically by Netlify; reachable at /.netlify/functions/contact
 * (and at /api/contact via the redirect in netlify.toml).
 *
 * Set SMTP_* environment variables in Netlify → Site settings → Environment.
 */
import { processForm } from "../../lib/mailer.js";

function parseBody(event) {
  const body = event.body || "";
  const ctype = (event.headers["content-type"] || event.headers["Content-Type"] || "").toLowerCase();
  if (ctype.includes("application/json")) {
    try { return JSON.parse(body); } catch { return {}; }
  }
  // urlencoded or multipart-ish: use URLSearchParams, collecting repeated keys into arrays
  const params = new URLSearchParams(body);
  const out = {};
  for (const [k, v] of params.entries()) {
    if (out[k] === undefined) out[k] = v;
    else if (Array.isArray(out[k])) out[k].push(v);
    else out[k] = [out[k], v];
  }
  return out;
}

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ success: false, error: "Method not allowed" }) };
  }
  try {
    const data = parseBody(event);
    const { status, body } = await processForm("contact", data);
    return {
      statusCode: status,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    };
  } catch (err) {
    console.error("[contact] error", err);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ success: false, error: "We couldn't send your message right now." }),
    };
  }
}
