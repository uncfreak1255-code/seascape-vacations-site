"use strict";

const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const assert = require("node:assert/strict");

const root = path.resolve(__dirname, "..", "..");
const source = fs.readFileSync(
  path.join(root, "src", "guides", "anna-maria-island-weather.html"),
  "utf8"
);

const TITLE = "Anna Maria Island Weather by Month: Temps, Rain & Water";
const DESCRIPTION =
  "NOAA monthly highs, rain days, and Port Manatee water temps (nearby proxy). Milder Nov–April; water warmest in summer. Seascape homes sit on mainland Bradenton.";

function assertWeatherSnippet(title, description) {
  if (!title) {
    throw new Error("title is required");
  }
  if (!description) {
    throw new Error("meta description is required");
  }
  assert.match(title, /weather by month/i);
  assert.match(title, /water/i);
  assert.doesNotMatch(title, /May or November/i);
  assert.match(description, /NOAA/i);
  assert.match(description, /water temps/i);
  assert.match(description, /Port Manatee/i);
  assert.match(description, /proxy/i);
  assert.match(description, /Nov–April/);
  assert.match(description, /mainland Bradenton/i);
  assert.doesNotMatch(description, /water temps for Anna Maria Island/i);
  assert.doesNotMatch(description, /May or November/i);
}

test("weather guide snippet names monthly air, rain, water, and mainland homes", () => {
  const title = source.match(/<title>([^<]*)<\/title>/);
  const description = source.match(/<meta name="description" content="([^"]*)">/);
  assert.ok(title, "title tag is present");
  assert.ok(description, "meta description is present");
  assert.equal(title[1], TITLE);
  assert.equal(description[1], DESCRIPTION);
  assertWeatherSnippet(title[1], description[1]);
  assert.ok(title[1].length <= 60, `title is ${title[1].length} characters`);
  assert.ok(description[1].length <= 160, `meta description is ${description[1].length} characters`);
  assert.ok(description[1].length >= 120, `meta description is ${description[1].length} characters`);

  assert.match(source, new RegExp(`og:title" content="${TITLE.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"`));
  assert.match(source, new RegExp(`twitter:title" content="${TITLE.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"`));
  assert.match(source, /"dateModified": "2026-08-19"/);
  assert.match(source, /<h1[^>]*>Anna Maria Island Weather by Month<\/h1>/);
});

test("empty or best-time-colliding weather snippets fail", () => {
  assert.throws(() => assertWeatherSnippet("", DESCRIPTION), /title is required/);
  assert.throws(() => assertWeatherSnippet(TITLE, ""), /meta description is required/);
  assert.throws(
    () => assertWeatherSnippet("Anna Maria Island Weather by Month (Temps & Rain)", DESCRIPTION),
    /water/i
  );
  assert.throws(
    () => assertWeatherSnippet("Best Time to Visit Anna Maria Island: May or November", DESCRIPTION),
    /May or November/i
  );
  assert.throws(
    () =>
      assertWeatherSnippet(
        TITLE,
        "NOAA monthly highs, rain days, and Gulf water temps for Anna Maria Island. Milder Nov–April; water warmest in summer. Seascape homes sit on mainland Bradenton."
      ),
    /Port Manatee/i
  );
});
