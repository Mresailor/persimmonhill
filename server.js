/**
 * Persimmon Hill Labrador Retrievers
 * Static site server + server-side form processing (Node/Express).
 *
 * Form handling logic lives in lib/mailer.js and is shared with the
 * serverless functions (netlify/functions, api/) so there is a single
 * source of truth. All submissions are emailed to barb@persimmonhilllabs.com.
 *
 * Configure email via environment variables (see README):
 *   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE, MAIL_FROM, MAIL_TO
 *
 * If SMTP is not configured, submissions are logged to ./submissions.log so
 * no lead is lost during development.
 */

import express from "express";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { processForm, getTransporter, RECIPIENT } from "./lib/mailer.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

function logToFile(entry) {
  fs.appendFileSync(path.join(__dirname, "submissions.log"), entry);
}

async function handle(type, req, res) {
  try {
    const { status, body } = await processForm(type, req.body || {}, logToFile);
    res.status(status).json(body);
  } catch (err) {
    console.error("[FORM] Error:", err);
    res.status(500).json({ success: false, error: "We couldn't send your message right now." });
  }
}

app.post("/api/contact", (req, res) => handle("contact", req, res));
app.post("/api/prospective-buyer", (req, res) => handle("prospective-buyer", req, res));

/* ---------- Static site ---------- */
app.use(express.static(__dirname, { extensions: ["html"] }));

app.listen(PORT, () => {
  console.log(`🐾 Persimmon Hill Labs site running on http://localhost:${PORT}`);
  console.log(`   Form emails route to: ${RECIPIENT}`);
  console.log(`   SMTP configured: ${getTransporter() ? "yes" : "no (dev log fallback active)"}`);
});
