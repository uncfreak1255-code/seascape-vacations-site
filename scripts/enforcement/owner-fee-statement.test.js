const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const partials = path.resolve(__dirname, "..", "..", "src", "_includes", "partials");
const read = (name) => fs.readFileSync(path.join(partials, name), "utf8");
const statement = read("owner-fee-statement.njk");
const faq = read("owner-management-faq.njk");
const hub = fs.readFileSync(
  path.resolve(__dirname, "..", "..", "src", "property-management", "index.njk"),
  "utf8"
);

const OPENER =
  "Seascape charges a share of your home's net rent, with a lower rate for homes that earn more and a monthly minimum. Patrick quotes your exact fee after looking at your home.";
const COVER =
  "That covers listing on Airbnb, Vrbo and our own booking site; setting and adjusting nightly rates as demand moves; screening and messaging guests from Bradenton; coordinating cleaning and maintenance, with a note before you have to ask; and paying you monthly with a statement of what your home earned and spent, with county taxes remitted.";
const PASSAGE = `${OPENER} ${COVER}`;
const BANNED_PUBLISHED_FEE = /from 17%|17–20%|17-20%|\$85 a month|most homes are 20%|\b17%\b|\b20%\b of net/i;

test("owner fee statement answers the charge question in the first 40 words without a published number", () => {
  assert.equal(statement.includes(OPENER), true);
  assert.equal(statement.includes(COVER), true);
  const words = OPENER.trim().split(/\s+/);
  assert.ok(words.length <= 40, `opener is ${words.length} words`);
  assert.equal(BANNED_PUBLISHED_FEE.test(statement), false);
});

test("owner hub labels the fee section and reuses the statement partial", () => {
  assert.equal(hub.includes("How our management fee works"), true);
  assert.equal(hub.includes('{% include "partials/owner-fee-statement.njk" %}'), true);
});

test("owner-fee benchmark pricing note reuses the same statement partial", () => {
  const benchmark = fs.readFileSync(
    path.resolve(__dirname, "..", "..", "src", "research", "owner-fee-revenue-leak-benchmark-2026.njk"),
    "utf8"
  );
  assert.equal(benchmark.includes('{% include "partials/owner-fee-statement.njk" %}'), true);
  assert.equal(benchmark.includes("Seascape charges a share of net rent, lower for homes that earn more"), false);
});

test("owner FAQ leads with the charge question in the visible list and the FAQPage JSON-LD", () => {
  assert.equal(faq.includes("How much does Seascape charge to manage a vacation rental?"), true);
  assert.equal(faq.includes('{% include "partials/owner-fee-statement.njk" %}'), true);
  assert.equal(faq.includes(`"text": "${PASSAGE}"`), true);
  assert.equal(BANNED_PUBLISHED_FEE.test(faq), false);
});

test("owner fee copy rejects a planted published percentage or dollar minimum", () => {
  assert.equal(BANNED_PUBLISHED_FEE.test("Vacation rental management from 17%."), true);
  assert.equal(BANNED_PUBLISHED_FEE.test("Our fee is 17–20% of net rent, plus $85 a month."), true);
  assert.equal(BANNED_PUBLISHED_FEE.test(""), false);
});
