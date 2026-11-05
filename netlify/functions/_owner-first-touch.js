"use strict";

const FIELDS = ["referrer", "utm_source", "utm_medium", "utm_campaign"];

function token(value) {
  if (typeof value !== "string") return "";
  const text = value.trim().toLowerCase();
  // Check the whole input before keeping it. Never retain URLs, encoded contact
  // details, email addresses, phone numbers, controls or spreadsheet expressions.
  return text.length <= 100 && /^[a-z0-9][a-z0-9_.-]*$/.test(text) &&
    !/\d[\d\s().+-]{6,}\d/.test(text) ? text : "";
}

function host(value) {
  if (typeof value !== "string" || !value.trim() || value.length > 4096) return "";
  try {
    const input = value.trim();
    const url = new URL(input.includes(":") ? input : "https://" + input);
    if (!["https:", "http:"].includes(url.protocol) || url.username || url.password) return "";
    const hostname = token(url.hostname);
    if (!hostname || hostname === "seascape-vacations.com" || hostname.endsWith(".seascape-vacations.com")) return "";
    return hostname;
  } catch (_error) { return ""; }
}

function firstTouch(data) {
  // Missing legacy evidence differs from an explicitly blank session first touch.
  // Neither may be filled from delivery metadata or a later campaign/capture.
  if (!FIELDS.some(key => Object.hasOwn(data, key))) return undefined;
  return { referrer: host(data.referrer), utm_source: token(data.utm_source),
    utm_medium: token(data.utm_medium), utm_campaign: token(data.utm_campaign) };
}

function sourceCategory(touch) {
  if (!touch || typeof touch !== "object") return "";
  const source = token(touch.utm_source);
  const referrer = host(touch.referrer);
  const domain = (value, domains) => domains.some(d => value === d || value.endsWith("." + d));
  // Check AI hosts first: Gemini is Google-owned but belongs to AI answer.
  const hostCategory = domain(referrer, ["chatgpt.com", "chat.openai.com", "perplexity.ai", "claude.ai", "gemini.google.com", "copilot.microsoft.com"])
    ? "AI answer" : domain(referrer, ["google.com", "google.co.uk", "google.ca", "google.com.au", "google.de", "google.fr"])
      ? "Google" : "";
  const sourceValue = source === "google" ? "Google"
    : ["chatgpt", "perplexity", "claude", "gemini", "copilot"].includes(source) ? "AI answer" : "";
  if (source) return sourceValue && (!hostCategory || hostCategory === sourceValue) ? sourceValue : "";
  return hostCategory;
}

module.exports = { firstTouch, sourceCategory };
