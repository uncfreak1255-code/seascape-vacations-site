const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const assert = require("node:assert/strict");

const root = path.resolve(__dirname, "..", "..");

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

const {
  loadSourcedClaims,
  readSourcedClaims,
  scanSavingsHitsInText,
  scanSrcSavingsHits,
  unsourcedSavingsHits,
  assertSavingsSourced,
  assertLiveQuotesPresent,
  unsourcedPriceAdvantages,
  assertNoUnsourcedPriceAdvantages
} = require("./sourced-claims");

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

test("empty sourcedClaims.json fails and names the owner file", () => {
  assert.deepEqual(loadSourcedClaims([]), []);
  assert.throws(() => loadSourcedClaims(null), /src\/_data\/sourcedClaims\.json is missing/);
  assert.throws(
    () => loadSourcedClaims([{ file: "src/guides/x.html", quote: "save 10-15%", expires: "2026-12-31" }]),
    /src\/_data\/sourcedClaims\.json row 0 is missing source/
  );
  assert.throws(
    () => loadSourcedClaims([{
      file: "src/guides/x.html",
      quote: "save 10-15%",
      source: "Published OTA guest service fees",
      expires: "2026-12-31"
    }]),
    /src\/_data\/sourcedClaims\.json row 0 source must name identifiable evidence/
  );
  assert.throws(
    () => loadSourcedClaims([{
      file: "src/guides/best-time-to-visit-anna-maria-island/index.html",
      quote: "Book direct and save 15–35%",
      source: "Published OTA guest service fees, 2026 AMI best-time guide dated quote",
      expires: "2026-12-31"
    }]),
    /src\/_data\/sourcedClaims\.json row 0 source is the same page that contains the claim/
  );
  assert.throws(
    () => loadSourcedClaims([{
      slug: "planted-stay",
      quote: "better rates",
      source: "https://seascape-vacations.com/stays/planted-stay/",
      expires: "2026-12-31"
    }]),
    /src\/_data\/sourcedClaims\.json row 0 source is the same page that contains the claim/
  );
  assert.throws(
    () => loadSourcedClaims([{
      file: "src/index.njk",
      quote: "save 10%",
      source: "https://seascape-vacations.com/",
      expires: "2026-12-31"
    }]),
    /src\/_data\/sourcedClaims\.json row 0 source is the same page that contains the claim/
  );
  assert.throws(
    () => loadSourcedClaims([{
      file: "src/property-management/index.njk",
      quote: "save 10%",
      source: "https://seascape-vacations.com/property-management/",
      expires: "2026-12-31"
    }]),
    /src\/_data\/sourcedClaims\.json row 0 source is the same page that contains the claim/
  );
  assert.throws(
    () => loadSourcedClaims([{
      file: "src/properties/dockside-dreams/index.njk",
      quote: "save 10%",
      source: "https://seascape-vacations.com/properties/dockside-dreams/",
      expires: "2026-12-31"
    }]),
    /src\/_data\/sourcedClaims\.json row 0 source is the same page that contains the claim/
  );
});

test("a missing sourced-claim row for a savings percent fails", () => {
  const hits = scanSrcSavingsHits();
  const claims = readSourcedClaims();
  assert.equal(
    hits.filter((hit) => hit.file.includes("anna-maria-island-vacation-cost-guide-2026")).length,
    0,
    "leftover cost-guide savings percents stay blocked"
  );
  assert.equal(
    hits.filter((hit) => hit.file.includes("best-time-to-visit-anna-maria-island")).length,
    0,
    "leftover best-time savings percents stay blocked"
  );
  assert.doesNotThrow(() => assertSavingsSourced(hits, claims));

  const planted = scanSavingsHitsInText(
    "Book direct and save 10-15% versus Airbnb",
    "src/guides/planted-missing-row.html"
  );
  assert.throws(
    () => assertSavingsSourced(planted, claims),
    /src\/_data\/sourcedClaims\.json is missing a sourced-claim row for save 10-15% in src\/guides\/planted-missing-row.html/
  );
});

test("percentage-first and tagged savings percents fail without a sourced-claim row", () => {
  const claims = readSourcedClaims();
  const plantedLess = scanSavingsHitsInText("rental rates 30–40% less than peak season", "src/guides/planted-percent-first.html");
  const plantedOff = scanSavingsHitsInText("homes are 30-40% off peak season", "src/guides/planted-percent-first.html");
  const plantedTagged = scanSavingsHitsInText("Book direct and save <strong>15%</strong> versus Airbnb", "src/guides/planted-tagged-save.html");
  const plantedBradenton = scanSavingsHitsInText(
    "Bradenton vacation rentals typically run 15-25% less than comparable Sarasota properties",
    "src/guides/planted-percent-first.html"
  );
  const plantedMainland = scanSavingsHitsInText(
    "run 20–30% less than equivalent properties on the island itself",
    "src/guides/planted-percent-first.html"
  );
  const plantedNounLabel = scanSavingsHitsInText(
    "Savings: $450 (15%)",
    "src/guides/planted-noun-savings.html"
  );
  const plantedNounPercent = scanSavingsHitsInText(
    "Guests see 10% savings versus marketplace checkout.",
    "src/guides/planted-noun-savings.html"
  );
  const plantedBelow = scanSavingsHitsInText(
    "September rates run 30–40% below peak season",
    "src/guides/planted-percent-first.html"
  );
  const plantedLower = scanSavingsHitsInText(
    "rental rates 30-40% lower than peak season",
    "src/guides/planted-percent-first.html"
  );
  const plantedRatesDrop = scanSavingsHitsInText(
    "Rates drop 20–30% from April",
    "src/guides/planted-percent-first.html"
  );
  const plantedDifference = scanSavingsHitsInText(
    "The difference between peak and off-peak can be 40% or more on the same property.",
    "src/guides/planted-percent-first.html"
  );

  assert.equal(plantedLess.map((hit) => hit.match).join(","), "30–40% less");
  assert.equal(plantedOff.map((hit) => hit.match).join(","), "30-40% off");
  assert.equal(plantedTagged.map((hit) => hit.match).join(","), "save 15%");
  assert.equal(plantedBradenton.map((hit) => hit.match).join(","), "15-25% less");
  assert.equal(plantedMainland.map((hit) => hit.match).join(","), "20–30% less");
  assert.match(plantedNounLabel.map((hit) => hit.match).join(","), /15%/);
  assert.equal(plantedNounPercent.map((hit) => hit.match).join(","), "10% savings");
  assert.equal(plantedBelow.map((hit) => hit.match).join(","), "30–40% below");
  assert.equal(plantedLower.map((hit) => hit.match).join(","), "30-40% lower");
  assert.equal(plantedRatesDrop.map((hit) => hit.match).join(","), "Rates drop 20–30%");
  assert.match(plantedDifference.map((hit) => hit.match).join(","), /40% or more/);

  assert.throws(
    () => assertSavingsSourced(plantedLess, claims),
    /src\/_data\/sourcedClaims\.json is missing a sourced-claim row for 30–40% less in src\/guides\/planted-percent-first.html/
  );
  assert.throws(
    () => assertSavingsSourced(plantedOff, claims),
    /src\/_data\/sourcedClaims\.json is missing a sourced-claim row for 30-40% off in src\/guides\/planted-percent-first.html/
  );
  assert.throws(
    () => assertSavingsSourced(plantedTagged, claims),
    /src\/_data\/sourcedClaims\.json is missing a sourced-claim row for save 15% in src\/guides\/planted-tagged-save.html/
  );
  assert.throws(
    () => assertSavingsSourced(plantedBradenton, claims),
    /src\/_data\/sourcedClaims\.json is missing a sourced-claim row for 15-25% less in src\/guides\/planted-percent-first.html/
  );
  assert.throws(
    () => assertSavingsSourced(plantedMainland, claims),
    /src\/_data\/sourcedClaims\.json is missing a sourced-claim row for 20–30% less in src\/guides\/planted-percent-first.html/
  );
  assert.throws(
    () => assertSavingsSourced(plantedNounLabel, claims),
    /src\/_data\/sourcedClaims\.json is missing a sourced-claim row for .*15% in src\/guides\/planted-noun-savings.html/
  );
  assert.throws(
    () => assertSavingsSourced(plantedNounPercent, claims),
    /src\/_data\/sourcedClaims\.json is missing a sourced-claim row for 10% savings in src\/guides\/planted-noun-savings.html/
  );
  assert.throws(
    () => assertSavingsSourced(plantedBelow, claims),
    /src\/_data\/sourcedClaims\.json is missing a sourced-claim row for 30–40% below in src\/guides\/planted-percent-first.html/
  );
  assert.throws(
    () => assertSavingsSourced(plantedLower, claims),
    /src\/_data\/sourcedClaims\.json is missing a sourced-claim row for 30-40% lower in src\/guides\/planted-percent-first.html/
  );
  assert.throws(
    () => assertSavingsSourced(plantedRatesDrop, claims),
    /src\/_data\/sourcedClaims\.json is missing a sourced-claim row for Rates drop 20–30% in src\/guides\/planted-percent-first.html/
  );
  assert.throws(
    () => assertSavingsSourced(plantedDifference, claims),
    /src\/_data\/sourcedClaims\.json is missing a sourced-claim row for .*40% or more in src\/guides\/planted-percent-first.html/
  );
});

test("typical direct savings fails without a sourced-claim row", () => {
  const claims = readSourcedClaims();
  const planted = scanSavingsHitsInText(
    "Guests see typical direct savings versus marketplace checkout.",
    "src/guides/planted-typical-direct-savings.html"
  );
  assert.equal(planted.map((hit) => hit.match).join(","), "typical direct savings");
  assert.throws(
    () => assertSavingsSourced(planted, claims),
    /src\/_data\/sourcedClaims\.json is missing a sourced-claim row for typical direct savings in src\/guides\/planted-typical-direct-savings.html/
  );
});

test("planted qualitative price-advantage on an unlisted slug fails", () => {
  const pages = JSON.parse(read("src/_data/seoPages.json")).vacationer;
  const claims = readSourcedClaims();
  assert.doesNotThrow(() => assertNoUnsourcedPriceAdvantages(pages, claims));

  const planted = [...pages, { slug: "planted-unsourced-better-rates", intro: "better rates" }];
  assert.throws(
    () => assertNoUnsourcedPriceAdvantages(planted, claims),
    /src\/_data\/sourcedClaims\.json is missing a sourced-claim row for better rates on planted-unsourced-better-rates/
  );
  assert.equal(
    unsourcedPriceAdvantages(planted, claims).map((page) => page.slug).join(","),
    "planted-unsourced-better-rates"
  );

  const mixedClaims = [
    ...claims,
    {
      slug: "planted-mixed-rates",
      quote: "better rates",
      source: "https://example.test/paired-checkout-capture",
      expires: "2026-12-31"
    }
  ];
  const mixed = [...pages, { slug: "planted-mixed-rates", intro: "better rates and premium rates" }];
  assert.throws(
    () => assertNoUnsourcedPriceAdvantages(mixed, mixedClaims),
    /src\/_data\/sourcedClaims\.json is missing a sourced-claim row for premium rates on planted-mixed-rates/
  );
  assert.equal(
    unsourcedPriceAdvantages(mixed, mixedClaims).map((hit) => `${hit.match}@${hit.slug}`).join(","),
    "premium rates@planted-mixed-rates"
  );
});

test("the two cost guides stay green only while dated-quote rows exist", () => {
  const hits = scanSrcSavingsHits();
  const claims = readSourcedClaims();
  const costGuideHits = hits.filter((hit) => hit.file.includes("anna-maria-island-vacation-cost-guide-2026"));
  const bestTimeHits = hits.filter((hit) => hit.file.includes("best-time-to-visit-anna-maria-island"));
  assert.equal(costGuideHits.length, 0, "leftover cost-guide savings percents stay blocked");
  assert.equal(bestTimeHits.length, 0, "leftover best-time savings percents stay blocked");
  assert.equal(unsourcedSavingsHits(hits, claims).length, 0);
  assert.doesNotThrow(() => assertLiveQuotesPresent(claims));

  const planted = scanSavingsHitsInText("save 10-15% versus Airbnb", "src/guides/planted-expired-row.html");
  const expired = [
    {
      file: "src/guides/planted-expired-row.html",
      quote: "save 10-15%",
      source: "https://example.test/paired-checkout-capture",
      expires: "2026-01-01"
    }
  ];
  assert.throws(
    () => assertSavingsSourced(planted, expired, new Date("2026-10-15T00:00:00Z")),
    /src\/_data\/sourcedClaims\.json is missing a sourced-claim row/
  );
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
