"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const projectRoot = path.resolve(__dirname, "..", "..");
const read = (relativePath) => fs.readFileSync(path.join(projectRoot, relativePath), "utf8");

function aliasRules(text) {
  return String(text || "")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"));
}

test("empty owner-alias input yields no redirect rules", () => {
  assert.deepEqual(aliasRules(""), []);
  assert.deepEqual(aliasRules("\n# comment only\n"), []);
});

test("owner alias file 301s guessed URLs to the property-management hub", () => {
  const rules = aliasRules(read("scripts/redirects/owner-aliases"));
  assert.ok(rules.length >= 6, "owner alias file must not be empty");
  for (const from of ["/owners", "/owners/", "/owner", "/owner/", "/list-your-property", "/list-your-property/"]) {
    assert.ok(
      rules.includes(`${from}   /property-management/   301`),
      `missing 301 from ${from}`
    );
  }
});

test("shared phone header exposes Owners except on property-management pages", () => {
  const header = read("src/_includes/partials/guest-header.njk");
  assert.match(header, /class="g-header-owners"/);
  assert.match(header, /page\.url\.indexOf\('\/property-management\/'\) != 0/);
  assert.match(header, /data-placement="guest_header_owners"/);
  assert.equal((header.match(/class="g-header-owners"/g) || []).length, 1);
});

test("homepage owner band source sits after the home cards and before guides, reviews and signup", () => {
  const homepage = read("src/index.njk");
  const collection = homepage.indexOf("Compare our homes");
  const owners = homepage.indexOf('class="g-home-owners');
  const organizer = homepage.indexOf('class="g-organizer');
  const guides = homepage.indexOf('class="g-local');
  const reviews = homepage.indexOf('class="g-home-reviews');
  const signup = homepage.indexOf('id="email-signup"');
  assert.ok(collection > 0 && owners > collection);
  assert.ok(owners < organizer && owners < guides && owners < reviews && owners < signup);
  assert.equal(homepage.split('class="g-home-owners').length - 1, 1);
});

test("live smoke requires owner alias 301s to the hub and rejects 404s", () => {
  const smoke = require("../recovery/assert-live-smoke");
  for (const alias of ["/owners/", "/owner/", "/list-your-property/"]) {
    const target = smoke.targets.find((entry) => entry.path === alias);
    assert.equal(target.status, 301);
    assert.equal(target.location, "/property-management/");
    assert.doesNotThrow(() => {
      smoke.validateTargetResponse(target, {
        statusCode: 301,
        location: "/property-management/",
        body: ""
      });
    });
    assert.throws(() => {
      smoke.validateTargetResponse(target, { statusCode: 404, location: null, body: "" });
    });
    assert.throws(() => {
      smoke.validateTargetResponse(target, {
        statusCode: 301,
        location: "/",
        body: ""
      });
    });
  }
});

test("built pages keep the phone Owners link off the owner hub and on guest routes", () => {
  const home = path.join(projectRoot, "_site", "index.html");
  const catalog = path.join(projectRoot, "_site", "properties", "index.html");
  const ownerHub = path.join(projectRoot, "_site", "property-management", "index.html");
  const redirects = path.join(projectRoot, "_site", "_redirects");
  assert.ok(fs.existsSync(home), "run npm run build first");
  const homeHtml = fs.readFileSync(home, "utf8");
  const catalogHtml = fs.readFileSync(catalog, "utf8");
  const ownerHtml = fs.readFileSync(ownerHub, "utf8");
  const redirectText = fs.readFileSync(redirects, "utf8");
  assert.match(homeHtml, /class="g-header-owners"/);
  assert.match(catalogHtml, /class="g-header-owners"/);
  assert.doesNotMatch(ownerHtml, /class="g-header-owners"/);
  assert.match(ownerHtml, /Why an eight-home operator/);
  assert.doesNotMatch(ownerHtml, /Why a eight-home operator/);
  for (const from of ["/owners/", "/owner/", "/list-your-property/"]) {
    assert.match(redirectText, new RegExp(`${from.replace(/\//g, "\\/")}\\s+\\/property-management\\/\\s+301`));
  }
});
