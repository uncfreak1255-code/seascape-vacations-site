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
  // Fields stay separate lines so one sentence never spans two fields.
  return parts.map((part) => part.replace(/<\/p>\s*<p[^>]*>/g, "\n").replace(/<[^>]+>/g, " ").replace(/[ \t]+/g, " ").trim()).join("\n");
}

// Places where Seascape manages no home today (hub property truth).
const NOT_MANAGED_PLACE = String.raw`(?:Anna Maria(?: Island)?|AMI|Longboat(?: Key)?|Siesta(?: Key)?|Holmes Beach|Bradenton Beach|the island|the key|island|key)`;
const HOME_NOUN = String.raw`(?:homes?|houses?|properties|rentals?|condos?|units?|listings?|portfolio|inventory)`;

// Wording that presents Seascape as already operating homes in the area.
const PRESENCE_CLAIMS = [
  /\bisland[- ]grade\b/i,
  /\bisland takeover\b/i,
  /\bright island operator\b/i,
  /\bLongboat Key properties by\b/i,
  /\bwe market Longboat Key properties\b/i,
  // "our Anna Maria Island homes", "our Longboat Key condos", "our island rentals"
  new RegExp(String.raw`\bour (?:[A-Za-z-]+ ){0,2}${NOT_MANAGED_PLACE} ${HOME_NOUN}\b`, "i"),
  // "our homes on Anna Maria Island", "our condos in Holmes Beach"
  new RegExp(String.raw`\bour ${HOME_NOUN} (?:on|in|at) ${NOT_MANAGED_PLACE}\b`, "i"),
  // "the island homes we manage"
  new RegExp(String.raw`\b${NOT_MANAGED_PLACE} ${HOME_NOUN} (?:we|Seascape) (?:manage|run|operate)s?\b`, "i")
];

// A sentence that says Seascape manages, runs or operates something and names a
// place where it has no home is a presence claim, unless it says so is not yet
// true. This catches word order the fixed patterns above cannot list.
const OPERATING_VERB = /(?<!-)\b(?:manages?|managed|managing|runs?|running|operates?|operating)\b/i;
const PLACE_IN_SENTENCE = new RegExp(String.raw`\b(?:Anna Maria|AMI|Longboat|Siesta|Holmes Beach|Bradenton Beach|the island|the key)\b`, "i");
const NOT_YET = /\b(?:not yet|none of|no (?:island |Longboat Key |Anna Maria Island )?homes?\b|taking on|new ground|short drive|would\b|nearby|near\b|drive to|from them)/i;

function presenceSentences(text) {
  return text
    .split(/(?<=[.?!])\s+|\n+/)
    // A question ("Does Seascape manage any homes on Longboat Key now?") asserts nothing.
    .filter((sentence) => !sentence.trim().endsWith("?") && OPERATING_VERB.test(sentence) && PLACE_IN_SENTENCE.test(sentence) && !NOT_YET.test(sentence));
}

function assertNoPresenceClaim(label, text) {
  for (const pattern of PRESENCE_CLAIMS) {
    assert.doesNotMatch(text, pattern, `${label} presents Seascape as already operating there`);
  }
  assert.deepEqual(presenceSentences(text), [], `${label} has a sentence placing a managed home where Seascape has none`);
}

for (const [slug, area] of Object.entries(EXPANSION_PAGES)) {
  test(`${slug}: says plainly Seascape has no home in ${area} yet and names Bradenton and Sarasota`, () => {
    const entry = seoPages.owner.find((page) => page.slug === slug);
    assert.ok(entry, `${slug} must stay an existing owner entry (no new pages)`);
    const text = readerText(entry);
    assert.match(text, /Bradenton and Sarasota/, `${slug} names where the managed homes are`);
    assert.match(text, /not yet|no (?:island|Longboat Key|Anna Maria Island) home|none of our homes/i, `${slug} says no home is managed in ${area} today`);
    assert.match(text, /taking on|expanding/i, `${slug} states the expansion`);
    assertNoPresenceClaim(slug, text);
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
  // Everything a reader sees on the page, front matter included, gets the same presence checks.
  const aboutText = about
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<\/(?:p|h\d|li|a)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/[ \t]+/g, " ");
  assertNoPresenceClaim("about page", aboutText);
  // The four destination tiles stay (they link guides), but island tiles say guests visit them.
  for (const href of ["/guides/anna-maria-island-area-guide/", "/guides/bradenton-area-guide/", "/guides/sarasota-area-guide/", "/guides/siesta-key-area-guide/"]) {
    assert.ok(about.includes(`href="${href}"`), `about keeps the ${href} tile`);
  }
});
