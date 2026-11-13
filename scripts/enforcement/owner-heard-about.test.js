// Optional "How did you hear about us?" owner-form field: renders on both owner
// form UIs, never blocks submission, and is stored only from a fixed allowlist.
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const assert = require("node:assert/strict");

const root = path.resolve(__dirname, "..", "..");
const read = (...parts) => fs.readFileSync(path.join(root, ...parts), "utf8");
const { buildOwnerLeadContact } = require("../../netlify/functions/_owner-lead-contacts");
const { buildInternalOwnerLeadNotifyEmail } = require("../../netlify/functions/_owner-lead-confirmation");
const { OWNER_LEAD_FORM_NAME } = require("../../netlify/functions/_owner-lead-metrics");

const VALUES = ["ai_assistant", "google", "airbnb_vrbo", "referral", "other"];

function selectOf(source) {
  const match = /<select\b[^>]*name="heard_about"[^>]*>([\s\S]*?)<\/select>/.exec(source);
  assert.ok(match, "heard_about select present");
  return { tag: match[0].slice(0, match[0].indexOf(">") + 1), body: match[1] };
}

const PARTIAL = ["src", "_includes", "partials", "owner-heard-about-field.njk"];

test("the shared partial renders an optional heard_about select with the five stable values", () => {
  const { tag, body } = selectOf(read(...PARTIAL));
  assert.doesNotMatch(tag, /\brequired\b/);
  const values = [...body.matchAll(/<option value="([^"]*)"/g)].map((m) => m[1]);
  assert.deepEqual(values, ["", ...VALUES]);
  assert.match(body, /<option value="">Choose one \(optional\)<\/option>/);
});

for (const [label, file] of [
  ["shared owner form partial", ["src", "_includes", "partials", "owner-evaluation-form.njk"]],
  ["property-management stepped form", ["src", "property-management", "index.njk"]]
]) {
  test(`${label} includes the optional heard_about field`, () => {
    assert.ok(read(...file).includes('{% include "partials/owner-heard-about-field.njk" %}'));
  });
}

test("the built owner route carries the optional select when _site exists", (t) => {
  const built = path.join(root, "_site", "property-management", "index.html");
  if (!fs.existsSync(built)) return t.skip("no build output");
  const { tag } = selectOf(fs.readFileSync(built, "utf8"));
  assert.doesNotMatch(tag, /\brequired\b/);
});

const submission = (data) => ({
  id: "s-1",
  created_at: "2026-11-12T12:00:00.000Z",
  form_name: OWNER_LEAD_FORM_NAME,
  data: { name: "Pat Owner", email: "pat@example.com", ...data }
});

test("the server stores each allowlisted heard_about value with the lead", () => {
  for (const value of VALUES) {
    assert.equal(buildOwnerLeadContact(submission({ heard_about: value })).heardAbout, value);
  }
  assert.equal(buildOwnerLeadContact(submission({ heard_about: " Google " })).heardAbout, "google");
});

test("missing, blank or unknown heard_about is stored empty and never rejects the lead", () => {
  for (const data of [{}, { heard_about: "" }, { heard_about: "tiktok" }, { heard_about: "<script>" }, { heard_about: 7 }, { heard_about: ["google"] }]) {
    const contact = buildOwnerLeadContact(submission(data));
    assert.ok(contact, "lead still captured");
    assert.equal(contact.heardAbout, "");
    assert.equal(contact.email, "pat@example.com");
  }
});

test("the internal notify email reports the answer or (none)", () => {
  const withValue = buildInternalOwnerLeadNotifyEmail(buildOwnerLeadContact(submission({ heard_about: "ai_assistant" })), {});
  const without = buildInternalOwnerLeadNotifyEmail(buildOwnerLeadContact(submission({})), {});
  assert.match(withValue.text, /Heard about us: ai_assistant/);
  assert.match(without.text, /Heard about us: \(none\)/);
});
