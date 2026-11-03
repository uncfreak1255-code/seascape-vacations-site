const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "../..");

test("licensing answers do not present unsupported county permit terms as current requirements", () => {
  const pages = JSON.parse(fs.readFileSync(path.join(root, "src/_data/seoPages.json"), "utf8"));
  const page = pages.owner.find((entry) => entry.slug === "vacation-rental-licensing-florida");
  const answers = page.faqs.map((entry) => entry.a).join(" ");
  assert.doesNotMatch(answers, /Manatee County requires STR registration|register for STR permits|STR number required|process typically takes|registration typically costs|2 guests per bedroom plus 2|Insurance becomes void|cannot file tax returns/i);
  assert.match(answers, /tourist[- ]tax/i);
  assert.match(answers, /DBPR/);
  assert.match(answers, /jurisdiction|municipality|address/i);
});

test("published fishing activity does not quote the unsupported fixed charter range", () => {
  const source = fs.readFileSync(path.join(root, "src/guides/things-to-do-bradenton-fl.html"), "utf8");
  const activity = source.split("4. Charter a Fishing Trip")[1].split("5.")[0];
  assert.ok(activity);
  assert.doesNotMatch(activity, /\$300\s*[-\u2013\u2014]\s*\$?600/);
  assert.match(activity, /current quote/i);
});
