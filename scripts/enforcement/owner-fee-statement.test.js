const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const partials = path.resolve(__dirname, "..", "..", "src", "_includes", "partials");
const read = (name) => fs.readFileSync(path.join(partials, name), "utf8");
const statement = read("owner-fee-statement.njk");
const faq = read("owner-management-faq.njk");

test("owner fee statement carries the approved headline and fee (Sawyer, 2026-11-18)", () => {
  assert.equal(statement.includes("Vacation rental management from 17%."), true);
  assert.equal(statement.includes("Our fee is 17–20% of net rent, plus $85 a month for booking and accounting software."), true);
  assert.equal(statement.includes("most homes are 20%"), true);
});

test("owner FAQ leads with the fee answer in the visible list and the FAQPage JSON-LD", () => {
  assert.equal(faq.includes('{% include "partials/owner-fee-statement.njk" %}'), true);
  assert.equal(faq.includes('"text": "Vacation rental management from 17%. Our fee is 17–20% of net rent, plus $85 a month for booking and accounting software.'), true);
});

test("owner fee copy publishes no tiers, thresholds or off-offer percentages", () => {
  for (const [label, text] of [["statement", statement], ["FAQ", faq]]) {
    assert.equal(/\b(10|15|16)%|110k|200k|\$110|\$200|sliding/i.test(text), false, label);
  }
});
