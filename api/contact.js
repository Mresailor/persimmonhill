/**
 * Vercel serverless function — processes the Contact form server-side.
 * Vercel maps files in /api/* to /api/<name> automatically, so this is
 * reachable at /api/contact with no extra config.
 *
 * Set SMTP_* environment variables in Vercel → Project → Settings → Environment.
 */
import { processForm } from "../lib/mailer.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ success: false, error: "Method not allowed" });
    return;
  }
  try {
    // Vercel parses JSON and urlencoded bodies into req.body automatically.
    const { status, body } = await processForm("contact", req.body || {});
    res.status(status).json(body);
  } catch (err) {
    console.error("[contact] error", err);
    res.status(500).json({ success: false, error: "We couldn't send your message right now." });
  }
}
