// Service-area truth (site #1016, Sawyer 2026-11-18).
// Every managed home is in Bradenton or Sarasota: seascape-hub origin/main
// context/seascape-properties.md lists seven Bradenton addresses and one
// Sarasota address (read 2026-11-24). Pages may name Anna Maria Island,
// Longboat Key and Siesta Key as places guests visit or where Seascape is
// expanding, never as places it manages homes today.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "../..");
const seoPages = JSON.parse(fs.readFileSync(path.join(root, "src/_data/seoPages.json"), "utf8"));
const about = fs.readFileSync(path.join(root, "src/about-us/index.njk"), "utf8");

const EXPANSION_PAGES = {
  "vacation-rental-management-anna-maria-island": "Anna Maria Island",
  "vacation-rental-management-longboat-key": "Longboat Key"
};

function readerText(entry) {
  const parts = [];
  const walk = (key, value) => {
    if (typeof value === "string") {
      if (key === "slug" || key === "destination" || /^(https?:)?\/\//.test(value.trim())) return;
      parts.push(value);
    } else if (Array.isArray(value)) {
      value.forEach((item) => walk(key, item));
    } else if (value && typeof value === "object") {
      for (const [k, v] of Object.entries(value)) {
        if (k === "relatedOwnerResources") continue;
        walk(k, v);
      }
    }
  };
  walk("", entry);
  return parts.join("\n").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
}

// Wording that presents Seascape as already operating homes in the area.
const PRESENCE_CLAIMS = [
  /\bisland[- ]grade\b/i,
  /\bisland takeover\b/i,
  /\bright island operator\b/i,
  /\bour (?:island|AMI|Anna Maria|Longboat|Longboat Key) (?:homes?|properties|rentals?|owners|portfolio)\b/i,
  /\b(?:homes?|properties|rentals?) (?:we|Seascape) (?:manages?|runs?|operates?)\b(?:(?!Bradenton|Sarasota)[^.]){0,60}\b(?:on|in) (?:the island|the key|Anna Maria|Longboat)/i,
  /\bwe (?:manage|run|operate) (?:homes?|properties|rentals?) (?:on|in) (?:the island|the key|Anna Maria|Longboat)/i,
  /\bLongboat Key properties by\b/i,
  /\bwe market Longboat Key properties\b/i
];

for (const [slug, area] of Object.entries(EXPANSION_PAGES)) {
  test(`${slug}: says plainly Seascape has no home in ${area} yet and names Bradenton and Sarasota`, () => {
    const entry = seoPages.owner.find((page) => page.slug === slug);
    assert.ok(entry, `${slug} must stay an existing owner entry (no new pages)`);
    const text = readerText(entry);
    assert.match(text, /Bradenton and Sarasota/, `${slug} names where the managed homes are`);
    assert.match(text, /not yet|no (?:island|Longboat Key|Anna Maria Island) home|none of our homes/i, `${slug} says no home is managed in ${area} today`);
    assert.match(text, /taking on|expanding/i, `${slug} states the expansion`);
    for (const pattern of PRESENCE_CLAIMS) {
      assert.doesNotMatch(text, pattern, `${slug} presents Seascape as already operating in ${area}`);
    }
    const intro = String(entry.intro || "");
    assert.match(intro, /Bradenton and Sarasota/, `${slug} hero intro carries the honest location line`);
  });
}

test("about page names only Bradenton and Sarasota as where Seascape manages homes", () => {
  const description = (about.match(/^pageDescription:\s*"([^"]*)"/m) || [])[1] || "";
  assert.match(description, /Bradenton and Sarasota/);
  assert.doesNotMatch(description, /rentals in [^.,"]*(?:Anna Maria|Siesta|Longboat)/i, "description lists an island as a rental area");
  assert.doesNotMatch(about, /across Anna Maria Island, Bradenton, Sarasota, and Siesta Key/, "who-we-are sentence lists four rental areas");
  assert.match(about, /manages vacation homes in Bradenton and Sarasota/);
  // The four destination tiles stay (they link guides), but island tiles say guests visit them.
  for (const href of ["/guides/anna-maria-island-area-guide/", "/guides/bradenton-area-guide/", "/guides/sarasota-area-guide/", "/guides/siesta-key-area-guide/"]) {
    assert.ok(about.includes(`href="${href}"`), `about keeps the ${href} tile`);
  }
});
