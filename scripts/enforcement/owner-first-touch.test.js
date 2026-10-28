// Site #826: owner forms carry the visitor's first-touch source as hidden
// referrer / utm_* fields, and never a contact detail.
const fs = require("fs");
const path = require("path");
const test = require("node:test");
const assert = require("node:assert/strict");

const projectRoot = path.resolve(__dirname, "..", "..");
const { fill, KEY } = require(path.join(projectRoot, "src", "assets", "js", "owner-first-touch.js"));
const FIELDS = ["referrer", "utm_source", "utm_medium", "utm_campaign"];

function fakeWindow({ href, referrer, storage = new Map() }) {
  const url = new URL(href);
  const inputs = {};
  FIELDS.forEach((name) => { inputs[name] = { value: "" }; });
  const form = {
    querySelector(selector) {
      const match = /name="([^"]+)"/.exec(selector);
      return match ? inputs[match[1]] || null : null;
    },
  };
  return {
    inputs,
    storage,
    location: { search: url.search, hostname: url.hostname },
    document: {
      referrer,
      querySelectorAll: (selector) => (selector === 'form[data-track-form="owner"]' ? [form] : []),
    },
    sessionStorage: {
      getItem: (key) => (storage.has(key) ? storage.get(key) : null),
      setItem: (key, value) => storage.set(key, value),
    },
  };
}

function values(win) {
  return Object.fromEntries(FIELDS.map((name) => [name, win.inputs[name].value]));
}

test("a UTM landing fills the hidden source fields and keeps them for the session", () => {
  const storage = new Map();
  const landing = fakeWindow({
    href: "https://seascape-vacations.com/property-management/?utm_source=Facebook&utm_medium=paid&utm_campaign=Owner_Fall",
    referrer: "https://www.facebook.com/some/path?fbclid=abc",
    storage,
  });
  fill(landing);
  const expected = { referrer: "www.facebook.com", utm_source: "facebook", utm_medium: "paid", utm_campaign: "owner_fall" };
  assert.deepEqual(values(landing), expected);

  // A later owner page in the same session, reached internally with no UTM,
  // still carries the first touch.
  const later = fakeWindow({
    href: "https://seascape-vacations.com/property-management/vrbo-management-services-florida/",
    referrer: "https://seascape-vacations.com/property-management/",
    storage,
  });
  fill(later);
  assert.deepEqual(values(later), expected);
  assert.ok(storage.has(KEY));
});

test("a direct visit leaves the fields empty, and a same-site referrer is not recorded", () => {
  const direct = fakeWindow({ href: "https://seascape-vacations.com/property-management/", referrer: "" });
  fill(direct);
  assert.deepEqual(values(direct), { referrer: "", utm_source: "", utm_medium: "", utm_campaign: "" });

  const internal = fakeWindow({
    href: "https://seascape-vacations.com/property-management/",
    referrer: "https://seascape-vacations.com/",
  });
  fill(internal);
  assert.equal(internal.inputs.referrer.value, "");
});

test("values that look like an email or phone number are dropped", () => {
  const win = fakeWindow({
    href: "https://seascape-vacations.com/property-management/?utm_source=owner%40example.com&utm_medium=941-555-0100&utm_campaign=gretter",
    referrer: "",
  });
  fill(win);
  assert.equal(win.inputs.utm_source.value, "");
  assert.equal(win.inputs.utm_medium.value, "");
  assert.equal(win.inputs.utm_campaign.value, "gretter");
});

test("both owner form UIs include the shared source fields and script", () => {
  const read = (...parts) => fs.readFileSync(path.join(projectRoot, "src", ...parts), "utf8");
  const shared = read("_includes", "partials", "owner-form-source-fields.njk");
  for (const name of FIELDS) {
    assert.ok(shared.includes(`<input type="hidden" name="${name}" value="">`), `missing hidden ${name}`);
  }
  assert.ok(shared.includes('<script defer src="/assets/js/owner-first-touch.js"></script>'));
  assert.ok(shared.includes('name="bot-field"'));
  for (const source of [read("property-management", "index.njk"), read("_includes", "partials", "owner-evaluation-form.njk")]) {
    assert.ok(source.includes('{% include "partials/owner-form-source-fields.njk" %}'));
  }
});
