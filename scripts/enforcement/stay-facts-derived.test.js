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
  assertStayBaselineRatchet,
  assertStayCapacityBindings,
  listedHomeCount,
  loadStayNumberBaseline,
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
    /hand-typed/
  );
  assert.throws(
    () => assertNoHandTypedStayFacts({ slug: "plant", geoIntro: "The Oasis sleeping 16" }),
    /hand-typed/
  );
  assert.throws(
    () => assertNoHandTypedStayFacts({ slug: "plant", geoIntro: "sleeps up to 16 guests" }),
    /hand-typed/
  );
  assert.throws(
    () => assertNoHandTypedStayFacts({ slug: "plant", geoIntro: "three Seascape homes that hold 12" }),
    /hand-typed/
  );
  assert.throws(
    () => assertNoHandTypedStayFacts({ slug: "plant", geoIntro: "hot tub (heat included)" }),
    /hand-typed/
  );
  assert.throws(
    () => assertNoHandTypedStayFacts({ slug: "plant", geoIntro: "Six homes with a pool" }),
    /hand-typed/
  );
  assert.throws(
    () => assertNoHandTypedStayFacts({
      slug: "plant",
      decisionHighlights: [{ label: "{matching} homes, 10-16 guests", value: "range" }]
    }),
    /hand-typed/
  );
  assert.throws(
    () => assertNoHandTypedStayFacts({ slug: "plant", h1: "Vacation Homes for 12 Guests" }),
    /hand-typed/
  );
  assert.throws(
    () => assertNoHandTypedStayFacts({ slug: "plant", geoIntro: "When your group reaches 16 guests" }),
    /hand-typed/
  );
  assert.throws(
    () => assertNoHandTypedStayFacts({ slug: "plant", geoIntro: "For groups larger than 16 guests, call us" }),
    /hand-typed/
  );
  assert.throws(
    () => assertNoHandTypedStayFacts({ slug: "plant", faqs: [{ question: "Best for a 12-16 guest group?", answer: "Ask." }] }),
    /hand-typed/
  );
  assert.throws(
    () => assertNoHandTypedStayFacts({ slug: "plant", geoIntro: "hot tubs are heated year-round and included" }),
    /hand-typed/
  );
  assert.throws(
    () => assertNoHandTypedStayFacts({ slug: "plant", decisionHighlights: [{ label: "Room for 12–16", value: "range" }] }),
    /hand-typed/
  );
  assert.throws(
    () => assertNoHandTypedStayFacts({ slug: "plant", faqs: [{ question: "Baths?", answer: "Twelve guests across 4 bedrooms." }] }),
    /hand-typed/
  );
  assert.throws(
    () => assertNoHandTypedStayFacts({ slug: "plant", geoIntro: "The Oasis hosts 16 guests." }),
    /hand-typed/
  );
  assert.doesNotThrow(() => assertNoHandTypedStayFacts({
    slug: "plant",
    geoIntro: "Stays of up to 4 weeks book online."
  }));
  assert.throws(
    () => assertNoHandTypedStayFacts({ slug: "plant", faqs: [{ question: "Heated?", answer: "a hot tub included all year" }] }),
    /hand-typed hot tub included year-round "hot tub included all year"/
  );
  assert.throws(
    () => assertNoHandTypedStayFacts({ slug: "plant", geoIntro: "Two private pool homes for a couples' trip" }),
    /hand-typed/
  );
  assert.throws(
    () => assertNoHandTypedStayFacts({ slug: "plant", decisionHighlights: [{ label: "Three homes, Two Markets", value: "pick" }] }),
    /hand-typed/
  );
  assert.throws(
    () => assertNoHandTypedStayFacts({
      slug: "plant",
      faqs: [{ question: "How many bedrooms do 12-guest homes have?", answer: "Ask." }]
    }),
    /hand-typed/
  );
  assert.throws(
    () => assertNoHandTypedStayFacts({
      slug: "plant",
      decisionHighlights: [{ label: "Pool and room for 12", value: "pool" }]
    }),
    /hand-typed/
  );
  assert.throws(
    () => assertNoHandTypedStayFacts({
      slug: "plant",
      faqs: [{ question: "What's the cost for 12 guests?", answer: "Ask." }]
    }),
    /hand-typed/
  );
  assert.throws(
    () => assertNoHandTypedStayFacts({
      slug: "plant",
      decisionHighlights: [{ label: "Private Pool", value: "All three homes include a private pool" }]
    }),
    /hand-typed/
  );
  assert.throws(
    () => assertNoHandTypedStayFacts({
      slug: "plant",
      faqs: [{ question: "Do all 5-bedroom homes have docks?", answer: "Yes." }]
    }),
    /hand-typed/
  );
  assert.throws(
    () => assertNoHandTypedStayFacts({ slug: "plant", geoIntro: "room for a dozen" }),
    /hand-typed/
  );
});

test("published stay JSON has no hand-typed capacity, heat, or home-count facts", () => {
  const catalog = structuredClone(fallback);
  for (const page of vacationerPages()) {
    assert.doesNotThrow(() => assertNoHandTypedStayFacts(page), page.slug);
    assert.doesNotThrow(() => assertStayCapacityBindings(page, catalog), page.slug);
  }
});

test("page ranges and shared home tokens must bind every matching home", () => {
  const catalog = structuredClone(fallback);
  assert.throws(
    () => applyStayFacts({
      slug: "plant",
      geoIntro: "These homes sleep {sleeps-matching}."
    }, catalog),
    /matching guests range needs matchingProperties/
  );
  assert.throws(
    () => applyStayFacts({
      slug: "plant",
      geoIntro: "These homes have {br-matching} bedrooms."
    }, catalog),
    /matching bedrooms range needs matchingProperties/
  );
  assert.throws(
    () => assertStayCapacityBindings({
      slug: "plant",
      matchingProperties: ["dockside-dreams", "the-oasis", "river-house"],
      faqs: [{
        question: "What size groups?",
        answer: "These homes sleep {sleeps:dockside-dreams}–{sleeps:the-oasis}."
      }]
    }, catalog),
    /occupancy range must use \{sleeps-matching\}/
  );
  assert.throws(
    () => assertStayCapacityBindings({
      slug: "plant",
      matchingProperties: ["dockside-dreams", "river-house"],
      decisionHighlights: [{
        label: "Room",
        value: "Dockside and River House sleep {sleeps:river-house}."
      }]
    }, catalog),
    /named homes dockside-dreams and river-house share \{sleeps:river-house\}/
  );
  assert.doesNotThrow(() => assertStayCapacityBindings({
    slug: "plant",
    matchingProperties: ["dockside-dreams", "the-oasis", "river-house"],
    faqs: [{
      question: "What size groups?",
      answer: "These homes sleep {sleeps-matching} — The Oasis for {sleeps:the-oasis}, Dockside Dreams for {sleeps:dockside-dreams}, and River House for {sleeps:river-house}."
    }]
  }, catalog));
  assert.throws(
    () => assertStayCapacityBindings({
      slug: "plant",
      matchingProperties: ["dockside-dreams", "the-oasis", "river-house"],
      faqs: [{
        question: "Largest?",
        answer: "The Oasis {sleeps-phrase:the-oasis}. Dockside Dreams {sleeps-phrase:dockside-dreams}. Those are the {matching} large-group options."
      }]
    }, catalog),
    /\{matching\} names .+ but matchingProperties is .+river-house/
  );
  assert.doesNotThrow(() => assertStayCapacityBindings({
    slug: "plant",
    matchingProperties: ["dockside-dreams", "the-oasis"],
    faqs: [{
      question: "Largest?",
      answer: "The Oasis {sleeps-phrase:the-oasis}. Dockside Dreams {sleeps-phrase:dockside-dreams}. Those are the {matching} large-group options."
    }]
  }, catalog));
  assert.throws(
    () => assertStayCapacityBindings({
      slug: "plant",
      matchingProperties: ["dockside-dreams", "the-oasis"],
      intro: "{matching} homes sleep {sleeps:dockside-dreams}."
    }, catalog),
    /\{matching\} cannot share \{sleeps:dockside-dreams\}/
  );
  assert.doesNotThrow(() => assertStayCapacityBindings({
    slug: "plant",
    matchingProperties: ["dockside-dreams", "river-house"],
    intro: "{matching} homes sleep {sleeps:dockside-dreams}."
  }, catalog));
  assert.throws(
    () => assertStayCapacityBindings({
      slug: "plant",
      matchingProperties: ["dockside-dreams", "the-oasis", "river-house"],
      intro: "{matching} homes. Both have private pools."
    }, catalog),
    /\{matching\} cannot pair with Both/
  );
  const tubAnswer = "{tub-homes} homes. Dockside Dreams, The Oasis, River House, Bradenton Pool Home, The Coastal, and Sarasota Luxe. Pickleball Pool Home Retreat has a private pool, but no verified hot tub or spa.";
  assert.doesNotThrow(() => assertStayCapacityBindings({
    slug: "plant",
    matchingProperties: ["dockside-dreams"],
    faqs: [{ question: "Tubs?", answer: tubAnswer }]
  }, catalog));
  const river = catalog.find((property) => property.slug === "river-house");
  const savedAmenities = river.amenities;
  const savedMarketing = river.marketing_amenities;
  river.amenities = (river.amenities || []).filter((flag) => !String(flag).toLowerCase().includes("spa") && !String(flag).toLowerCase().includes("hot-tub"));
  river.marketing_amenities = (river.marketing_amenities || []).filter((flag) => !String(flag).toLowerCase().includes("spa") && !String(flag).toLowerCase().includes("hot-tub"));
  assert.throws(
    () => assertStayCapacityBindings({
      slug: "plant",
      matchingProperties: ["dockside-dreams"],
      faqs: [{ question: "Tubs?", answer: tubAnswer }]
    }, catalog),
    /\{tub-homes\} names/
  );
  river.amenities = savedAmenities;
  river.marketing_amenities = savedMarketing;
  assert.throws(
    () => assertStayCapacityBindings({
      slug: "plant",
      matchingProperties: ["coastal-stay"],
      faqs: [{
        question: "Hours?",
        answer: "At the homes with a verified hot tub or spa: those hot tubs run year-round and there's no shutoff."
      }]
    }, catalog),
    /class-level tub operation cannot cover .*coastal-stay/
  );
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

test("matching occupancy and home count come from the page list, not an unrelated slug", () => {
  const catalog = structuredClone(fallback);
  const amiPool = vacationerPages().find((page) => page.slug === "anna-maria-island-homes-with-pool");
  assert.ok(amiPool, "AMI pool stay must exist");
  assert.match(JSON.stringify(amiPool.faqs), /\{br-matching\} bedrooms sleeping \{sleeps-matching\}/);
  assert.doesNotMatch(JSON.stringify(amiPool.faqs), /4.5 bedrooms sleeping/);

  const source = vacationerPages().find((page) => page.slug === "4-bedroom-vacation-rentals-florida");
  assert.ok(source, "4-bedroom stay must exist");
  assert.match(JSON.stringify(source.faqs), /sleeps-matching/);
  assert.doesNotMatch(JSON.stringify(source.faqs), /coastal-stay/);
  const page = applyStayFacts(structuredClone(source), catalog);
  const faq = page.faqs.map((item) => `${item.question} ${item.answer}`).join(" ");
  assert.match(faq, /sleep 12/);
  assert.doesNotMatch(faq, /sleep 10/);

  const twelve = vacationerPages().find((page) => page.slug === "vacation-rentals-sleeps-12-florida");
  assert.ok(twelve, "sleeps-12 stay must exist");
  assert.match(twelve.geoIntro, /\{matching\} Seascape homes that hold \{sleeps-matching\}/);
  const twelvePage = applyStayFacts(structuredClone(twelve), catalog);
  assert.match(twelvePage.geoIntro, /three Seascape homes that hold 12/);

  const withRiverFacts = vacationerPages().find((page) =>
    JSON.stringify(page.propertyFacts || []).includes("River House")
  );
  assert.ok(withRiverFacts, "a stay must publish River House property facts");
  assert.match(JSON.stringify(withRiverFacts.propertyFacts), /\{br:river-house\}/);

  const sarasotaPage = vacationerPages().find((page) => page.slug === "sarasota-vacation-rentals-with-pool");
  assert.ok(sarasotaPage, "Sarasota stay must exist");
  assert.match(JSON.stringify(sarasotaPage.decisionHighlights), /sleeps-phrase:sarasota-luxe/);
});

test("poolHeat included does not publish hot-tub heat included", () => {
  const catalog = structuredClone(fallback);
  const dockside = catalog.find((property) => property.slug === "dockside-dreams");
  assert.ok(dockside, "dockside-dreams must exist");
  dockside.guestFacts = { ...(dockside.guestFacts || {}), poolHeat: "Pool heat is included" };
  delete dockside.guestFacts.tubHeat;

  const planted = applyStayFacts(
    {
      slug: "planted-pool-heat",
      matchingProperties: ["dockside-dreams"],
      geoIntro: `hot tub {heat:dockside-dreams}`
    },
    catalog
  );
  assert.doesNotMatch(planted.geoIntro, /heat included/i);
  assert.match(planted.geoIntro, /confirm heat terms when booking/i);

  dockside.guestFacts.tubHeat = "Hot tub heat is included";
  const withTubHeat = applyStayFacts(
    {
      slug: "planted-tub-heat",
      matchingProperties: ["dockside-dreams"],
      geoIntro: `hot tub {heat:dockside-dreams}`
    },
    catalog
  );
  assert.match(withTubHeat.geoIntro, /heat included/i);
});

test("adding a new stay baseline entry fails without a reviewed tag change", () => {
  const { rows } = loadStayNumberBaseline();
  const planted = [
    ...rows,
    {
      hash: "0".repeat(64),
      sentence: "room for a dozen",
      slug: "planted",
      tag: "non-claim",
      reason: "plant"
    }
  ];
  assert.throws(
    () => assertStayBaselineRatchet(planted, rows),
    /stayNumberBaseline\.json can only shrink/
  );
  const retagged = rows.map((row, index) => (
    index === 0
      ? { ...row, tag: row.tag === "non-claim" ? "suspected-claim" : "non-claim", reason: "reviewed tag change" }
      : row
  ));
  assert.doesNotThrow(() => assertStayBaselineRatchet(retagged, rows));
  assert.doesNotThrow(() => assertStayBaselineRatchet(rows.slice(1), rows));
});

test("never-seen stay phrasing still fails after the grandfathered baseline", () => {
  assert.throws(
    () => assertNoHandTypedStayFacts({ slug: "plant", geoIntro: "room for a dozen" }),
    /hand-typed/
  );
});

test("staysPages apply catalog facts before the template renders", () => {
  const source = fs.readFileSync(path.join(projectRoot, "src/_data/staysPages.js"), "utf8");
  const stayTemplate = fs.readFileSync(path.join(projectRoot, "src/stays/stays.njk"), "utf8");
  assert.match(source, /applyStayFacts/);
  assert.match(source, /assertNoHandTypedStayFacts/);
  assert.match(source, /assertStayCapacityBindings/);
  assert.match(source, /require\("\.\/properties"\)/);
  assert.match(stayTemplate, /for relatedPage in staysPages/);
  assert.doesNotMatch(stayTemplate, /for relatedPage in seoPages\.vacationer/);
});
