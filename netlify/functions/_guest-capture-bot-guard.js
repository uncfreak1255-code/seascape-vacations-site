"use strict";

// Stateless bot screen for the guest email capture lane.
//
// Live audit 2026-09-16: the Mailchimp audience had grown by 86 contacts in 30
// days with 0 clicks, and the contact list was dominated by dot-stuffed Gmail
// addresses, random-case names, and unrelated corporate inboxes. The capture
// path had no bot defense at all. This module screens a submission before any
// Mailchimp call or receipt write. Every check is conservative on purpose: a
// real guest who trips the timing check can simply submit again.
//
// The origin check only rejects a PRESENT mismatching Origin/Referer. Direct
// API callers (ops proof posts, tests) send no Origin and are not rejected on
// that signal alone.

const MIN_FORM_DWELL_MS = 3000;
const MAX_GMAIL_LOCAL_PART_DOTS = 3;
const MIN_INTERIOR_UPPERCASE_FOR_RANDOM_NAME = 3;

const ALLOWED_ORIGIN_HOSTS = Object.freeze([
  "seascape-vacations.com",
  "www.seascape-vacations.com",
  "localhost",
  "127.0.0.1"
]);
const ALLOWED_ORIGIN_HOST_SUFFIXES = Object.freeze([".netlify.app"]);

function text(value) {
  return typeof value === "string" ? value.trim() : "";
}

function headerValue(headers, name) {
  if (!headers || typeof headers !== "object") return "";
  const wanted = name.toLowerCase();
  for (const key of Object.keys(headers)) {
    if (key.toLowerCase() === wanted) return text(headers[key]);
  }
  return "";
}

function isAllowedOriginHost(hostname) {
  const host = String(hostname || "").toLowerCase();
  if (!host) return false;
  if (ALLOWED_ORIGIN_HOSTS.includes(host)) return true;
  return ALLOWED_ORIGIN_HOST_SUFFIXES.some((suffix) => host.endsWith(suffix));
}

function originMismatch(headers) {
  const candidate = headerValue(headers, "origin") || headerValue(headers, "referer");
  if (!candidate) return false;
  try {
    return !isAllowedOriginHost(new URL(candidate).hostname);
  } catch (_error) {
    return true;
  }
}

function honeypotFilled(payload) {
  return Boolean(text(payload && (payload.trip_url || payload.website)));
}

function submittedTooFast(payload, now) {
  const openedAt = text(payload && (payload.formOpenedAt || payload.form_opened_at));
  if (!openedAt) return false;
  const openedMs = Date.parse(openedAt);
  if (!Number.isFinite(openedMs)) return false;
  const elapsed = now - openedMs;
  return elapsed >= 0 && elapsed < MIN_FORM_DWELL_MS;
}

function dotStuffedGmail(payload) {
  const email = text(payload && payload.email).toLowerCase();
  const at = email.lastIndexOf("@");
  if (at <= 0) return false;
  const domain = email.slice(at + 1);
  if (domain !== "gmail.com" && domain !== "googlemail.com") return false;
  const dots = (email.slice(0, at).match(/\./g) || []).length;
  return dots > MAX_GMAIL_LOCAL_PART_DOTS;
}

function randomCaseName(payload) {
  const name = text(payload && payload.name);
  if (name.length < 8 || /\s/.test(name)) return false;
  const interiorUppercase = (name.slice(1).match(/[A-Z]/g) || []).length;
  return interiorUppercase >= MIN_INTERIOR_UPPERCASE_FOR_RANDOM_NAME;
}

function assessGuestCaptureBotSignals({ payload, headers, now = Date.now() } = {}) {
  const reasons = [];
  if (honeypotFilled(payload)) reasons.push("honeypot");
  if (submittedTooFast(payload, now)) reasons.push("too_fast");
  if (originMismatch(headers)) reasons.push("origin_mismatch");
  if (dotStuffedGmail(payload)) reasons.push("dot_stuffed_gmail");
  if (randomCaseName(payload)) reasons.push("random_case_name");
  return { rejected: reasons.length > 0, reasons };
}

exports.MIN_FORM_DWELL_MS = MIN_FORM_DWELL_MS;
exports.assessGuestCaptureBotSignals = assessGuestCaptureBotSignals;
exports.isAllowedOriginHost = isAllowedOriginHost;
