"use strict";

const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const assert = require("node:assert/strict");

const projectRoot = path.resolve(__dirname, "..", "..");
const fallback = require("../../src/_data/properties-fallback.json");
const seoPages = require("../../src/_data/seoPages.json");
const {
  applyStayFacts,
  assertNoHandTypedStayFacts,
  listedHomeCount,
  stayOccupancy
} = require("../../src/_data/stayFacts");

function vacationerPages() {
  return seoPages.vacationer.filter((page) => !page.rehomeTo);
}

function visibleStayText(page) {
  return [
    page.geoIntro,
    page.intro,
    page.description,
    ...(page.faqs || []).map((faq) => `${faq.question} ${faq.answer}`),
    ...(page.decisionHighlights || []).map((item) => `${item.label} ${item.value}`)
  ].join(" ");
}

test("hand-typed sleeps, heat, and home-count facts fail stay JSON", () => {
  assert.throws(
    () => assertNoHandTypedStayFacts({ slug: "plant", geoIntro: "Blue House sleeps 10" }),
    /hand-typed sleeps N "sleeps 10"/
  );
  assert.throws(
    () => assertNoHandTypedStayFacts({ slug: "plant", geoIntro: "The Oasis sleeping 16" }),
    /hand-typed sleeps N "sleeping 16"/
  );
  assert.throws(
    () => assertNoHandTypedStayFacts({ slug: "plant", geoIntro: "sleeps up to 16 guests" }),
    /hand-typed sleeps N "sleeps up to 16"/
  );
  assert.throws(
    () => assertNoHandTypedStayFacts({ slug: "plant", geoIntro: "hot tub (heat included)" }),
    /hand-typed heat included/
  );
  assert.throws(
    () => assertNoHandTypedStayFacts({ slug: "plant", geoIntro: "Six homes with a pool" }),
    /hand-typed N homes "Six homes"/
  );
});

test("published stay JSON has no hand-typed capacity, heat, or home-count facts", () => {
  for (const page of vacationerPages()) {
    assert.doesNotThrow(() => assertNoHandTypedStayFacts(page), page.slug);
  }
});

test("replay 638: Blue House fallback capacity moves geoIntro, FAQ, highlight, ItemList, and JSON-LD", () => {
  const catalog = structuredClone(fallback);
  const blue = catalog.find((property) => property.slug === "blue-house");
  assert.ok(blue, "blue-house must exist");
  blue.guests = 99;

  const source = vacationerPages().find((page) => page.slug === "vacation-rentals-with-pool-and-hot-tub");
  assert.ok(source, "pool-and-hot-tub stay must exist");
  const page = applyStayFacts(structuredClone(source), catalog);
  const visible = visibleStayText(page);
  const stayTemplate = fs.readFileSync(path.join(projectRoot, "src/stays/stays.njk"), "utf8");

  assert.match(page.geoIntro, /sleeps 99/);
  assert.match(
    page.faqs.map((faq) => `${faq.question} ${faq.answer}`).join(" "),
    /sleeps 99/
  );
  assert.match(
    page.decisionHighlights.map((item) => `${item.label} ${item.value}`).join(" "),
    /sleeps 99/
  );
  assert.doesNotMatch(visible, /sleeps 11/);
  assert.equal(stayOccupancy(catalog, "blue-house"), 99);
  assert.equal(
    listedHomeCount(page),
    source.matchingProperties.length,
    "ItemList count stays the matching list, not a typed number"
  );
  assert.match(stayTemplate, /"occupancy": \{ "@type": "QuantitativeValue", "value": \{\{ property\.guests \}\} \}/);
  assert.match(stayTemplate, /Sleeps \{\{ property\.guests \}\}/);
  assert.match(stayTemplate, /"numberOfItems": \{\{ seoPage\.matchingProperties \| length \}\}/);
});

test("replay 700: Coastal Stay does not inherit heat or tub terms without poolHeat or tub truth", () => {
  const catalog = structuredClone(fallback);
  const coastal = catalog.find((property) => property.slug === "coastal-stay");
  assert.ok(coastal, "coastal-stay must exist");
  coastal.amenities = (coastal.amenities || []).filter((flag) => !/hot-tub|spa/i.test(flag));
  coastal.marketing_amenities = (coastal.marketing_amenities || []).filter((flag) => !/hot-tub|spa/i.test(flag));
  if (coastal.guestFacts) {
    delete coastal.guestFacts.poolHeat;
  }

  const planted = applyStayFacts(
    {
      slug: "planted-six-home-heat",
      matchingProperties: ["coastal-stay"],
      geoIntro: `{tub-homes} homes include a hot tub. Coastal Stay {heat:coastal-stay}.`,
      faqs: [{ question: "What heat terms apply?", answer: `Coastal Stay {heat:coastal-stay}` }],
      decisionHighlights: [{ label: "Heat", value: `{heat:coastal-stay}` }]
    },
    catalog
  );
  const visible = visibleStayText(planted);

  assert.doesNotMatch(visible, /heat included/i);
  assert.doesNotMatch(visible, /Coastal Stay[^.]*hot tub/i);
  assert.doesNotMatch(planted.geoIntro, /hot tub heat is included/i);
});

test("staysPages apply catalog facts before the template renders", () => {
  const source = fs.readFileSync(path.join(projectRoot, "src/_data/staysPages.js"), "utf8");
  assert.match(source, /applyStayFacts/);
  assert.match(source, /assertNoHandTypedStayFacts/);
  assert.match(source, /require\("\.\/properties"\)/);
});
