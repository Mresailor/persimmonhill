/**
 * Vercel serverless function — processes the Prospective Buyer application
 * server-side. Reachable at /api/prospective-buyer with no extra config.
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
    const { status, body } = await processForm("prospective-buyer", req.body || {});
    res.status(status).json(body);
  } catch (err) {
    console.error("[prospective-buyer] error", err);
    res.status(500).json({ success: false, error: "We couldn't send your message right now." });
  }
}
