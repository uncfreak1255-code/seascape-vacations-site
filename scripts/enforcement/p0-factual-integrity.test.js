const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const assert = require("node:assert/strict");

const root = path.resolve(__dirname, "..", "..");

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function sourceFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? sourceFiles(full) : [full];
  });
}

test("Sarasota home copy does not claim walkability", () => {
  const sources = [
    "src/_data/seoPages.json",
    "src/guides/anna-maria-island-vs-longboat-key.html",
    "src/guides/sarasota-area-guide/index.html",
    "src/properties/sarasota-luxe/index.njk"
  ].map(read).join("\n");

  for (const unsupported of [
    /Sarasota Luxe[^\n]{0,240}(?:walkable|walking distance|walk to|steps from|accessible on foot)/i,
    /(?:walkable|walking distance|walk to|steps from|accessible on foot)[^\n]{0,240}Sarasota Luxe/i,
    /Sarasota (?:home|property|rental)[^\n]{0,240}(?:walkable|walking distance|walk to|steps from|accessible on foot)/i
  ]) {
    assert.doesNotMatch(sources, unsupported);
  }

  assert.doesNotMatch(sources, /walkable to downtown|walkable downtown|walking distance from downtown|walk to downtown|steps from downtown|spot you can walk from|accessible on foot|on-foot access to Sarasota|no car needed for evening/i);
  assert.doesNotMatch(sources, /short drive or walk/i);
});

test("fixed direct-booking and comparison savings claims stay removed", () => {
  const sources = sourceFiles(path.join(root, "src"))
    .filter((file) => /\.(?:html|njk|json|md|txt)$/.test(file))
    .filter((file) => !file.includes("anna-maria-island-vacation-cost-guide-2026"))
    .filter((file) => !file.includes("best-time-to-visit-anna-maria-island"))
    .map((file) => fs.readFileSync(file, "utf8"))
    .join("\n");

  assert.doesNotMatch(sources, /save 10[-–]15%|save up to 15%|30[-–]40% (?:less|off)|typical direct savings/i);
});

test("P0 routes and professional-review quarantines remain intact", () => {
  const redirects = read("src/_redirects");
  const pageTemplate = read("src/property-management/property-management.njk");
  const seoPages = JSON.parse(read("src/_data/seoPages.json"));
  const taxPage = seoPages.owner.find((page) => page.slug === "vacation-rental-taxes-florida");
  const insurancePage = seoPages.owner.find((page) => page.slug === "vacation-rental-insurance-florida");
  const interiorPage = seoPages.owner.find((page) => page.slug === "vacation-rental-interior-design-florida");

  assert.match(redirects, /^\/contact\s+\/#contact\s+301$/m);
  assert.match(redirects, /^\/guides\/bradenton-vs-sarasota-cost-of-living\/\s+\/guides\/bradenton-vs-sarasota\/\s+301$/m);
  assert.match(pageTemplate, /noindex, nofollow/);
  assert.equal(taxPage.quarantined, true);
  assert.equal(taxPage.seoIndexable, false);
  assert.match(taxPage.reviewTitle, /tax guide is not available for reliance/i);
  assert.match(taxPage.reviewNotice, /qualified tax professional/i);
  assert.equal(insurancePage.quarantined, true);
  assert.equal(insurancePage.seoIndexable, false);
  assert.match(insurancePage.reviewTitle, /insurance guide is not available for reliance/i);
  assert.match(insurancePage.reviewNotice, /licensed insurance professional/i);
  assert.doesNotMatch(JSON.stringify(interiorPage), /\$80,000|10-20%|1-2 years|within weeks|five-star reviews|on Anna Maria Island/i);

  const publicNavigation = [
    read("src/guides/index.njk"),
    read("src/property-management/index.njk"),
    read("src/guides/florida-gulf-coast-vacation-rental-market-report-2026.html"),
    JSON.stringify(seoPages.owner.filter((page) => ![taxPage.slug, insurancePage.slug].includes(page.slug)))
  ].join("\n");
  assert.doesNotMatch(publicNavigation, /vacation-rental-taxes-florida/);
  assert.doesNotMatch(publicNavigation, /vacation-rental-insurance-florida/);
});

const AMI_VSIESTA_GUIDE = "src/guides/anna-maria-island-vs-siesta-key.html";
const NEAR_ISLAND_STAY_HREFS = [
  "/stays/anna-maria-island-vacation-rentals/",
  "/stays/anna-maria-island-beachfront-rentals/"
];
const NEAR_ISLAND_REFERRAL_PROMISES = [
  /Gulf-front/i,
  /waking up on the sand/i,
  /stay on the island itself/i,
  /Stay on Anna Maria Island/i,
  /waking up to Gulf views/i,
  /biking to dinner/i,
  /no car needed/i,
  /quiet island mornings/i,
  /waking up near the Gulf/i
];
const KNOWN_FALSE_NEAR_ISLAND_REFERRALS = [
  "Gulf-front and beach-first stays for guests who want the island to be the whole point of the trip.",
  "if you want to stay on the island itself",
  "if waking up on the sand is worth the premium",
  "Stay on Anna Maria Island if the island lifestyle is the whole point of your trip — waking up to Gulf views, biking to dinner, no car needed.",
  "Best when waking up near the Gulf is worth narrowing the search",
  "for quiet island mornings"
];

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function referralUnits(source, href) {
  const units = [];
  const escaped = escapeRegExp(href);
  const stayBlock = new RegExp(`\\{[^{}]*href:\\s*"${escaped}"[^{}]*\\}`, "g");
  for (const match of source.matchAll(stayBlock)) {
    units.push(match[0]);
  }

  const row = new RegExp(`<tr\\b[^>]*>[\\s\\S]*?href="${escaped}"[\\s\\S]*?</tr>`, "g");
  for (const match of source.matchAll(row)) {
    units.push(match[0]);
  }

  const paragraph = new RegExp(`<p\\b[^>]*>[\\s\\S]*?href="${escaped}"[\\s\\S]*?</p>`, "g");
  for (const match of source.matchAll(paragraph)) {
    units.push(match[0]);
  }

  return units;
}

test("AMI vs Siesta guide referrals to near-island stays do not promise beachfront or on-island inventory", () => {
  const source = read(AMI_VSIESTA_GUIDE);

  assert.match(source, /\/stays\/anna-maria-island-vacation-rentals\//);
  assert.match(source, /\/stays\/anna-maria-island-beachfront-rentals\//);

  for (const lie of KNOWN_FALSE_NEAR_ISLAND_REFERRALS) {
    assert.ok(
      NEAR_ISLAND_REFERRAL_PROMISES.some((pattern) => pattern.test(lie)),
      `banned referral patterns must catch the known false claim: ${lie}`
    );
  }

  assert.equal(NEAR_ISLAND_REFERRAL_PROMISES.some((pattern) => pattern.test("")), false);

  for (const href of NEAR_ISLAND_STAY_HREFS) {
    const units = referralUnits(source, href);
    assert.ok(units.length > 0, `expected referral copy pointing at ${href}`);

    for (const unit of units) {
      for (const pattern of NEAR_ISLAND_REFERRAL_PROMISES) {
        assert.doesNotMatch(unit, pattern);
      }
    }
  }

  const beachfrontTitles = [
    ...source.matchAll(/href:\s*"\/stays\/anna-maria-island-beachfront-rentals\/"[\s\S]*?title:\s*"([^"]+)"/g)
  ].map((match) => match[1]);
  const beachfrontLinkText = [
    ...source.matchAll(/<a\b[^>]*href="\/stays\/anna-maria-island-beachfront-rentals\/"[^>]*>([\s\S]*?)<\/a>/g)
  ].map((match) => match[1].replace(/<[^>]+>/g, "").trim());

  assert.ok(beachfrontTitles.length > 0, "expected a conversion-kit title for the beachfront alternative page");
  assert.ok(beachfrontLinkText.length > 0, "expected visible links to the beachfront alternative page");

  for (const label of [...beachfrontTitles, ...beachfrontLinkText]) {
    assert.match(label, /alternative/i);
  }

  assert.doesNotMatch(source, /small kids can wade without you hovering/i);
  assert.doesNotMatch(source, /without you hovering/i);
});
