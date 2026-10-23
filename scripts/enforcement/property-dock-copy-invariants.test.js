const fs = require("fs");
const path = require("path");
const test = require("node:test");
const assert = require("node:assert/strict");
const seoPages = require("../../src/_data/seoPages.json");

const projectRoot = path.resolve(__dirname, "..", "..");
const allSeoPages = () => Object.values(seoPages).flat();
const readSource = (file) => fs.readFileSync(path.join(projectRoot, file), "utf8");
const cleanText = (value) => JSON.stringify(value).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");

const DOCK_PAGES_FIXED_IN_THIS_BATCH = [
  "src/guides/where-to-stay-near-anna-maria-island/index.html",
  "src/guides/things-to-do-bradenton-fl.html",
  "src/guides/holmes-beach-vs-bradenton-beach.html",
  "src/guides/anna-maria-island-vs-longboat-key.html",
];

const DOCK_FISHING_CLAIM =
  /\b(?:fish(?:ing)?\s+(?:from|off)\s+the\s+(?:canal\s+|private\s+)?dock\b(?!s)(?!\s+(?:is|are)\s+not\b)|dock\s+fishing|guests\s+fish\s+from|use\s+the\s+dock\s+for\s+[^.]{0,20}fishing|dock\s+for\s+fishing|fishing[^.<"]{0,40}\bwith\s+dock\s+access|fish\s+at\s+sunrise|(?:cast|drop)\s+a\s+line\s+(?:right\s+)?(?:from|off)\s+the\s+(?:private\s+)?dock)/i;

function stripAnswersThatDenyDockFishing(text) {
  return text.replace(/(?:question":\s*")?(?:Is fishing allowed from|Can I fish from) the (?:private )?dock[^"]*"/gi, " ");
}

test("no page markets fishing from the Dockside Dreams dock", () => {
  const surfaces = [["seoPages.json", stripAnswersThatDenyDockFishing(JSON.stringify(seoPages))]];
  for (const file of fs.readdirSync(path.join(projectRoot, "src/guides"), { recursive: true })) {
    if (!/\.(html|njk)$/.test(file)) continue;
    surfaces.push([`src/guides/${file}`, readSource(`src/guides/${file}`)]);
  }
  for (const [name, text] of surfaces) {
    const match = text.match(DOCK_FISHING_CLAIM);
    assert.equal(match, null, `${name} markets dock fishing ("${match && match[0]}"); the dock is for access, not fishing`);
  }
  const dockPage = allSeoPages().find((page) => page.slug === "canal-homes-with-boat-dock");
  assert.match(cleanText(dockPage), /not for fishing|for access, not fishing/i);
});

function sentencesPairingDockWithFishing(text) {
  return text
    .replace(/<[^>]+>/g, " ")
    .split(/(?<=[.!?])\s+|"\s*[,:]\s*"/)
    .filter((sentence) => !sentence.trim().endsWith("?"))
    .filter((sentence) => /\b(?:the|a|private|backyard|your|our|canal|boat)\s+(?:\w+\s+)?dock\b(?!s)/i.test(sentence))
    .filter((sentence) => /\b(?:fish\w*|cast\w*\s+a\s+line|drop\w*\s+a\s+line|anglers?)\b/i.test(sentence))
    .filter((sentence) => !/\b(?:not|no|never)\b|isn['’]t/i.test(sentence))
    .filter((sentence) => !/\b(?:charters?|kayaks?|public\s+piers?)\b/i.test(sentence));
}

test("Dockside surfaces never pair the dock with fishing unless they deny it", () => {
  const surfaces = allSeoPages()
    .filter((page) => (page.matchingProperties || []).includes("dockside-dreams"))
    .map((page) => [`seoPages:${page.slug}`, Object.values(page).map((v) => (typeof v === "string" ? v : JSON.stringify(v))).join(" ")]);
  for (const file of [
    ...DOCK_PAGES_FIXED_IN_THIS_BATCH,
    "src/guides/bradenton-vs-sarasota-for-families/index.html",
    "src/guides/bradenton-vs-sarasota-retirement/index.html",
  ]) {
    surfaces.push([file, readSource(file)]);
  }
  for (const [name, text] of surfaces) {
    assert.deepEqual(sentencesPairingDockWithFishing(text), [], `${name} pairs the dock with fishing`);
  }
});


test("repaired guides keep water claims singular, sourced, and off the island", () => {
  const pluralWater =
    /\b(?:pools?,\s*docks|with\s+(?:private\s+)?pools\s+and\s+docks|some\s+homes\s+include\s+docks|waterfront\s+(?:homes|rentals|properties|vacation\s+rentals)|(?:rentals|homes|properties)\s+with\s+(?:waterfront|dock)\s+access|waterfront\s+access\s+for\s+less)\b/i;
  const onIsland = /\b(?:properties\s+both\s+on\s+the\s+island|(?:our|waterfront)\s+homes?\s+on\s+AMI|island\s+and\s+near-island\s+stays)\b/i;
  const unsourced = /\b(?:\d+-foot\s+dock|\d+%\s+of\s+our\s+(?:returning\s+)?guests|most\s+of\s+our\s+returning\s+guests)\b/i;
  for (const file of DOCK_PAGES_FIXED_IN_THIS_BATCH) {
    const text = readSource(file).replace(/<a\b[^>]*>|<\/a>/g, "");
    for (const [label, pattern] of [["plural dock/waterfront", pluralWater], ["on-island", onIsland], ["unsourced", unsourced]]) {
      const match = text.match(pattern);
      assert.equal(match, null, `${file}: ${label} claim "${match && match[0]}"`);
    }
  }
});
