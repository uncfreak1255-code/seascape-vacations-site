const fs = require("fs");
const path = require("path");
const test = require("node:test");
const assert = require("node:assert/strict");

const projectRoot = path.resolve(__dirname, "..", "..");
const {
  HEARD_ABOUT_VALUES,
  HEARD_ABOUT_AI_VALUES,
  buildOwnerLeadContact
} = require("../../netlify/functions/_owner-lead-contacts");
const { OWNER_LEAD_FORM_NAME } = require("../../netlify/functions/_owner-lead-metrics");
const { buildInternalOwnerLeadNotifyEmail } = require("../../netlify/functions/_owner-lead-confirmation");
const heardAboutJs = require("../../src/assets/js/owner-heard-about.js");

const OPTION_LABELS = {
  google: "Google search",
  google_maps: "Google Maps",
  chatgpt: "ChatGPT",
  google_ai: "Google AI (Gemini / AI Mode)",
  other_ai: "Perplexity, Claude or other AI",
  referral: "Referral from an owner or friend",
  airbnb_vrbo: "Airbnb or Vrbo",
  social: "Social media",
  other: "Other"
};

function read(...parts) {
  return fs.readFileSync(path.join(projectRoot, "src", ...parts), "utf8");
}

function payload(data = {}) {
  return {
    id: "heard-1",
    created_at: "2026-11-26T12:00:00.000Z",
    form_name: OWNER_LEAD_FORM_NAME,
    data: {
      name: "Pat Owner",
      email: "pat@example.com",
      heard_about: "chatgpt",
      heard_about_prompt: "best vacation rental manager in Bradenton",
      event_name: "owner_form_submit",
      ...data
    }
  };
}

function fakeForm({ heard = "", prompt = "best vacation rental manager in Bradenton" } = {}) {
  const promptField = {
    className: "owner-heard-about-prompt",
    hidden: false,
    classList: {
      toggle(name, on) {
        this._open = name === "is-open" ? on : this._open;
      }
    },
    setAttribute(name) {
      if (name === "hidden") this.hidden = true;
    },
    removeAttribute(name) {
      if (name === "hidden") this.hidden = false;
    }
  };
  const select = { value: heard, addEventListener() {} };
  const promptInput = { value: prompt };
  return {
    promptField,
    select,
    querySelector(selector) {
      if (selector === '[name="heard_about"]') return select;
      if (selector === '[name="heard_about_prompt"]') return promptInput;
      if (selector === ".owner-heard-about-prompt") return promptField;
      return null;
    }
  };
}

test("both owner form UIs share the optional heard-about partial", () => {
  const partial = read("_includes", "partials", "owner-heard-about-field.njk");
  assert.match(partial, /name="heard_about"/);
  assert.match(partial, /name="heard_about_prompt"/);
  assert.match(partial, /How did you hear about us\? \(optional\)/);
  assert.match(partial, /What did you ask it\? \(optional\)/);
  assert.match(partial, /e\.g\. best vacation rental manager in Bradenton/);
  assert.doesNotMatch(partial, /\brequired\b/);
  assert.doesNotMatch(partial, /owner-heard-about-prompt"[^>]*\bhidden\b/);
  const sourceFields = read("_includes", "partials", "owner-form-source-fields.njk");
  assert.ok(sourceFields.includes('src="/assets/js/owner-heard-about.js"'));
  assert.ok(sourceFields.includes('document.documentElement.classList.add("sv-js")'));
  for (const value of HEARD_ABOUT_VALUES) {
    assert.ok(partial.includes(`value="${value}"`), `missing option ${value}`);
    assert.ok(partial.includes(`>${OPTION_LABELS[value]}<`), `missing label for ${value}`);
  }
  assert.equal(HEARD_ABOUT_AI_VALUES.join(","), "chatgpt,google_ai,other_ai");

  const hub = read("property-management", "index.njk");
  const lander = read("_includes", "partials", "owner-evaluation-form.njk");
  for (const source of [hub, lander]) {
    assert.ok(source.includes('{% include "partials/owner-heard-about-field.njk" %}'));
  }
});

test("contacts keep allowlisted sources and drop tampered or non-AI prompts without rejecting the lead", () => {
  const kept = buildOwnerLeadContact(payload());
  assert.equal(kept.heardAbout, "chatgpt");
  assert.equal(kept.heardAboutPrompt, "best vacation rental manager in Bradenton");

  const google = buildOwnerLeadContact(payload({
    heard_about: "google",
    heard_about_prompt: "should not store"
  }));
  assert.equal(google.heardAbout, "google");
  assert.equal(google.heardAboutPrompt, "");

  const blank = buildOwnerLeadContact(payload({ heard_about: "", heard_about_prompt: "x" }));
  assert.equal(blank.email, "pat@example.com");
  assert.equal(blank.heardAbout, "");
  assert.equal(blank.heardAboutPrompt, "");

  const tampered = buildOwnerLeadContact(payload({ heard_about: "not-a-source" }));
  assert.equal(tampered.heardAbout, "");
  assert.equal(tampered.heardAboutPrompt, "");

  const long = "x".repeat(600);
  const clipped = buildOwnerLeadContact(payload({ heard_about_prompt: long }));
  assert.equal(clipped.heardAboutPrompt.length, 500);
});

test("internal notify email carries heard-about and the AI prompt", () => {
  const contact = buildOwnerLeadContact(payload());
  const message = buildInternalOwnerLeadNotifyEmail(contact);
  assert.match(message.text, /Heard about us: chatgpt/);
  assert.match(message.text, /What they asked: best vacation rental manager in Bradenton/);

  const none = buildInternalOwnerLeadNotifyEmail(buildOwnerLeadContact(payload({
    heard_about: "",
    heard_about_prompt: ""
  })));
  assert.match(none.text, /Heard about us: \(none\)/);
  assert.match(none.text, /What they asked: \(none\)/);
});

test("JS shows the prompt only for AI sources and adds GA4 params on owner_form_submit", () => {
  const aiForm = fakeForm({ heard: "chatgpt" });
  heardAboutJs.syncPrompt(aiForm);
  assert.equal(aiForm.promptField.hidden, false);
  assert.equal(aiForm.promptField.classList._open, true);
  assert.deepEqual(heardAboutJs.readHeardAbout(aiForm), {
    heard_about: "chatgpt",
    heard_about_prompt: "best vacation rental manager in Bradenton"
  });

  const mapsForm = fakeForm({ heard: "google_maps" });
  heardAboutJs.syncPrompt(mapsForm);
  assert.equal(mapsForm.promptField.hidden, true);
  assert.equal(heardAboutJs.readHeardAbout(mapsForm).heard_about_prompt, "");
  assert.equal(heardAboutJs.isAi("google"), false);
  assert.equal(heardAboutJs.isAi("google_ai"), true);

  const events = [];
  const form = fakeForm({ heard: "other_ai", prompt: "Bradenton property manager" });
  const win = {
    SeascapeConversionTracking: {
      trackEvent(eventName, payload) {
        events.push({ eventName, payload });
      }
    },
    document: {
      documentElement: { classList: { add() {} } },
      querySelector: () => form,
      querySelectorAll: () => [form]
    }
  };
  heardAboutJs.bind(win);
  win.SeascapeConversionTracking.trackEvent("owner_form_submit", { page_slug: "property-management" });
  assert.equal(events[0].payload.heard_about, "other_ai");
  assert.equal(events[0].payload.heard_about_prompt, "Bradenton property manager");
});
