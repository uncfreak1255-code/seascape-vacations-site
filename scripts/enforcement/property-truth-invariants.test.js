const fs = require("fs");
const path = require("path");
const test = require("node:test");
const assert = require("node:assert/strict");

const projectRoot = path.resolve(__dirname, "..", "..");
const fallbackProperties = require("../../src/_data/properties-fallback.json");
const seoPages = require("../../src/_data/seoPages.json");
const { normalizeListing } = require("../../scripts/cache/normalize-hostaway");
const {
  renderPropertySummary,
  renderSchemaAmenityLabels
} = require("../../scripts/regenerate-property-surfaces");

const DOCKSIDE_ONLY_CLAIM_SLUG = "dockside-dreams";

const STRICT_DOCK_OR_WATER_SLUGS = new Set([
  "bradenton-waterfront-vacation-rentals",
  "fishing-vacation-rentals-bradenton",
  "dolphin-watching-vacation-rentals-florida",
  "canal-homes-with-boat-dock",
  "gulf-coast-vacation-homes-with-dock",
  "waterfront-vacation-rentals-with-kayaks"
]);

function allSeoPages() {
  return Object.values(seoPages).flat();
}

function cleanText(value) {
  return JSON.stringify(value)
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ");
}

function readSource(relativePath) {
  return fs.readFileSync(path.join(projectRoot, relativePath), "utf8");
}

function readBuilt(relativePath) {
  return fs.readFileSync(path.join(projectRoot, "_site", relativePath), "utf8");
}

test("Hostaway listing normalization sums full and guest bathroom fields", () => {
  const normalized = normalizeListing({
    id: 487798,
    name: "Bradenton Pool Home",
    city: "Bradenton",
    bedrooms: 3,
    bathrooms: 3,
    guestBathrooms: 0.5,
    personCapacity: 10,
    listingPrice: 250
  });

  assert.equal(normalized.bathrooms, 3.5);
});

test("fallback property facts keep waterfront and dock claims limited to Dockside Dreams", () => {
  for (const property of fallbackProperties) {
    assert.equal(
      property.specs,
      `${property.bedrooms} BR · ${property.bathrooms} BA · Sleeps ${property.guests}`,
      `${property.slug} specs must match fallback counts`
    );

    const text = cleanText({
      name: property.name,
      description: property.description,
      highlights: property.highlights,
      amenities: property.amenities,
      specs: property.specs
    });

    if (property.slug === DOCKSIDE_ONLY_CLAIM_SLUG) {
      assert.match(text, /\b(waterfront|dock|bayfront)\b/i);
      continue;
    }

    assert.doesNotMatch(
      text,
      /\b(waterfront|bayfront|canal[- ]front|private dock|boat dock|dock access|backyard dock)\b/i,
      `${property.slug} must not inherit Dockside-only waterfront/dock claims`
    );
  }
});

test("strict waterfront, dock, fishing, and dolphin pages match only Dockside Dreams", () => {
  const pagesBySlug = new Map(allSeoPages().map((page) => [page.slug, page]));

  for (const slug of STRICT_DOCK_OR_WATER_SLUGS) {
    const page = pagesBySlug.get(slug);
    if (!page) continue;

    assert.deepEqual(page.matchingProperties, ["dockside-dreams"], `${slug} must not match River House`);
    assert.doesNotMatch(cleanText(page), /\b(several|multiple)\s+[^.]{0,80}\b(waterfront|dock|canal)/i);
    assert.doesNotMatch(cleanText(page), /\bRiver House\b[^.]{0,140}\b(waterfront|canal|dock|dolphin|backyard)\b/i);
  }
});

test("strict rendered dock and waterfront stay pages only feature Dockside Dreams property cards", () => {
  const strictRenderedPages = [
    "stays/bradenton-waterfront-vacation-rentals/index.html",
    "stays/fishing-vacation-rentals-bradenton/index.html",
    "stays/canal-homes-with-boat-dock/index.html",
    "stays/dolphin-watching-vacation-rentals-florida/index.html"
  ];

  for (const relativePath of strictRenderedPages) {
    const html = readBuilt(relativePath);
    assert.match(html, /href="\/properties\/dockside-dreams\/"/, `${relativePath} should feature Dockside Dreams`);
    assert.match(html, /"numberOfItems":\s*1/, `${relativePath} should only list one strict-match property in ItemList schema`);
    assert.doesNotMatch(html, /href="\/properties\/river-house\/"/, `${relativePath} must not feature River House`);
    assert.doesNotMatch(html, /data-page-slug="river-house"/, `${relativePath} must not instrument River House cards`);
    assert.doesNotMatch(html, /"@id":\s*"https:\/\/seascape-vacations\.com\/#river-house"/, `${relativePath} must not publish River House in stay ItemList schema`);
  }
});

test("stay collection schema uses canonical property URLs and accommodation facts instead of stale priceRange strings", () => {
  const stayPages = [
    "stays/bradenton-vacation-rentals-near-beaches/index.html",
    "stays/large-group-vacation-rentals-anna-maria-island/index.html"
  ];

  for (const relativePath of stayPages) {
    const html = readBuilt(relativePath);
    const itemList = extractJsonLdObjects(html).find((item) => item["@type"] === "ItemList");

    assert.ok(itemList, `${relativePath} must publish ItemList schema`);
    assert.ok(Array.isArray(itemList.itemListElement), `${relativePath} ItemList must contain itemListElement entries`);

    for (const listItem of itemList.itemListElement) {
      const rental = listItem.item;

      assert.equal(rental["@type"], "VacationRental", `${relativePath} item must stay typed as VacationRental`);
      assert.match(rental.url, /^https:\/\/seascape-vacations\.com\/properties\/[^/]+\/$/, `${relativePath} items must point at canonical property URLs`);
      assert.match(rental.identifier, /^seascape-\d+$/, `${relativePath} items must include stable property identifiers`);
      assert.equal(typeof rental.latitude, "number", `${relativePath} items must include latitude`);
      assert.equal(typeof rental.longitude, "number", `${relativePath} items must include longitude`);
      assert.equal(typeof rental.address?.postalCode, "string", `${relativePath} items must include postal codes`);
      assert.equal(Boolean(rental.containsPlace), true, `${relativePath} items must include containsPlace facts`);
      assert.equal(rental.containsPlace.occupancy.value > 0, true, `${relativePath} items must include occupancy values`);
      assert.equal("priceRange" in rental, false, `${relativePath} items must not ship stale priceRange strings`);
      assert.equal(rental.offers?.["@type"], "Offer", `${relativePath} items must publish Offer objects`);
      assert.equal(rental.offers?.priceCurrency, "USD", `${relativePath} items must publish USD pricing`);
    }
  }
});

test("River House kayaking copy stays framed as a nearby public launch, not on-property waterfront", () => {
  const html = readBuilt("stays/kayaking-vacation-rentals-bradenton/index.html");

  assert.match(html, /River House isn(?:['’]t|&#39;t) on the water/i);
  assert.match(html, /public Warner Bayou boat ramp/i);
  assert.doesNotMatch(
    html,
    /River House[^.]{0,160}\b(private dock|waterfront|canal-front|canal[- ]side)\b/i,
    "River House must not inherit Dockside-only waterfront language on kayaking pages"
  );
});

test("River House property page keeps water access framed as the nearby boat ramp, not a riverfront stay", () => {
  const html = readBuilt("properties/river-house/index.html");

  assert.match(html, /Warner Bayou[^<.]*boat ramp/i);
  assert.doesNotMatch(html, /Surrounded by nature on the river/i);
  assert.doesNotMatch(html, /view over the river/i);
  assert.doesNotMatch(html, /sits on the water/i);
});

test("Bradenton guides keep River House and dock access claims scoped to the right homes", () => {
  const insiderGuide = readBuilt("guides/bradenton-insider-guide/index.html");
  const areaGuide = readBuilt("guides/bradenton-area-guide/index.html");

  assert.match(insiderGuide, /Warner Bayou boat ramp/i);
  assert.doesNotMatch(insiderGuide, /River House[^.]{0,120}sits on the water/i);

  assert.match(areaGuide, /Dockside Dreams is the Bradenton home with a private dock/i);
  assert.doesNotMatch(areaGuide, /our Bradenton properties feature larger homes, private docks, and more space/i);
  assert.doesNotMatch(areaGuide, /launch your kayak from your private dock/i);
  assert.doesNotMatch(areaGuide, /Many of our waterfront vacation rentals offer dolphin and manatee sightings right from the backyard dock/i);
});

test("dolphins guide does not give River House a dock", () => {
  const html = readSource("src/guides/dolphins-manatees-bradenton.html");

  assert.match(html, /Dockside Dreams has a private dock on a saltwater canal/i);
  assert.match(html, /One of our six homes sits on the water with a private dock/i);
  assert.doesNotMatch(html, /Our two dock homes, Dockside Dreams and River House/i);
  assert.doesNotMatch(html, /Two of our six homes sit on the water with private docks/i);
  assert.doesNotMatch(html, /River House on the Manatee River/i);
  assert.doesNotMatch(
    html,
    /River House[^.]{0,200}\b(private dock|dock homes|on the water with private docks)\b/i,
    "River House must not be described as a dock or waterfront home on the dolphins guide"
  );
});

test("putting green is not described as mini-golf across durable marketing surfaces", () => {
  const surfaces = [
    "src/_data/properties-fallback.json",
    "src/_data/seoPages.json",
    "src/llms.txt",
    ...fallbackProperties.map((property) => `src/properties/${property.slug}/index.njk`)
  ];

  for (const surface of surfaces) {
    assert.doesNotMatch(readSource(surface), /\bmini[- ]golf\b/i, `${surface} must say putting green, not mini-golf`);
  }

  assert.match(readSource("src/_data/properties-fallback.json"), /\bputting green\b/i);
  assert.match(readSource("src/llms.txt"), /\bputting green\b/i);
});

test("fallback, llms, and property templates agree on property specs", () => {
  const llms = readSource("src/llms.txt");

  for (const property of fallbackProperties) {
    const compactSpec = `${property.bedrooms}BR/${property.bathrooms}BA`;
    const template = readBuilt(`properties/${property.slug}/index.html`);

    assert.match(llms, new RegExp(`${property.name}[\\s\\S]*${compactSpec.replace(".", "\\.")}`));
    assert.match(template, new RegExp(`<strong>${property.bedrooms}</strong> bedrooms`));
    assert.match(template, new RegExp(`<strong>${String(property.bathrooms).replace(".", "\\.")}</strong> bathrooms`));
    assert.match(template, new RegExp(`Up to <strong>${property.guests}</strong> guests`));
  }
});

test("llms property bullets are regenerated from the fallback summary renderer", () => {
  const llms = readSource("src/llms.txt");

  for (const property of fallbackProperties) {
    const expected = `- [${property.name}](https://seascape-vacations.com/properties/${property.slug}/): ${renderPropertySummary(property)}`;

    assert.match(llms, new RegExp(`^${escapeRegExp(expected)}$`, "m"), `${property.slug} llms bullet must match fallback data`);
  }
});

test("property template schema facts match fallback counts and amenity labels", () => {
  for (const property of fallbackProperties) {
    const template = readBuilt(`properties/${property.slug}/index.html`);
    const vacationRentalSchema = extractJsonLdObjects(template).find((item) => item["@type"] === "VacationRental");
    const accommodation = vacationRentalSchema?.containsPlace;

    assert.ok(vacationRentalSchema, `${property.slug} must publish VacationRental schema`);
    assert.ok(accommodation, `${property.slug} VacationRental schema must include containsPlace accommodation facts`);
    assert.equal(accommodation.numberOfBedrooms, property.bedrooms, `${property.slug} schema bedroom count must match fallback`);
    assert.equal(
      accommodation.numberOfBathroomsTotal,
      property.bathrooms,
      `${property.slug} schema bathroom count must match fallback`
    );
    assert.equal(accommodation.occupancy.value, property.guests, `${property.slug} schema occupancy must match fallback guests`);
    assert.match(
      vacationRentalSchema.description,
      new RegExp(`${property.bedrooms} bedrooms, ${String(property.bathrooms).replace(".", "\\.")} bathrooms, sleeps ${property.guests} guests`, "i"),
      `${property.slug} schema description must carry fallback BR/BA/guest facts`
    );
    assert.deepEqual(
      accommodation.amenityFeature.map((item) => item.name),
      renderSchemaAmenityLabels(property),
      `${property.slug} schema amenities must match fallback structured labels`
    );
  }
});

test("property reviews stay nested under one complete VacationRental entity", () => {
  const reviewedImageCategories = new Map([
    ["bradenton-pool-home", ["vs56V7VNzQclcCi9kafLZ2WqaHTXVCPmVeXDY97e2GE", "Rm0StPDUlVu4jPwH--B0QGxa7KRBZ-ioHHGW1nr-SYsI", "fveav4RDND6H0n92eYn7UMKyN01TxeUZ6Dr--p9eV-rQ"]],
    ["dockside-dreams", ["xdx1autFInfzKRNujCVSZdAAXdGGkOh9a5-YTfIL22s", "Jz4vT1Y9--TQtQh6OcU3NPt4W7rEC8WxLii4RDMF8FgA", "THwWro0V2bCwJuZiHtXCu6FTTbZ2uGXYA6Pl1ouezDw"]],
    ["river-house", ["3-WHUih34aKJ-O8dGl9n9-mwQoL3ZCAfRN-SdAOJyq4", "g8wwLrsaItg4FXqddvMHvmC-RqGfMcD5WrwyAWwVv70", "OjOthIkLY--af9i-nKVMVz1hIehhAFqAMhnx21GMeMaE"]],
    ["the-oasis", ["e23Axvnc1ut0OcWotT14oVHj--Uy4uQezssOrYIFqbe4", "9Cklr9RWmrxTmXFPnskevzCeBDtpos--pP5T8N1EpN1M", "TlB9vmTl4A6t6vVsiMEg7p3LHLxuGO60XKpM6DEO6Bo"]],
    ["blue-house", ["/images/homes/blue-house/17.webp", "/images/homes/blue-house/08.webp", "/images/homes/blue-house/14.webp"]]
  ]);


  for (const property of fallbackProperties) {
    const template = readSource(`_site/properties/${property.slug}/index.html`);
    const schemaObjects = extractJsonLdObjects(template);
    const vacationRentals = schemaObjects.filter((item) => item["@type"] === "VacationRental");
    const standaloneReviews = schemaObjects.filter((item) => item["@type"] === "Review");

    assert.equal(vacationRentals.length, 1, `${property.slug} must publish one complete VacationRental entity`);
    assert.equal(standaloneReviews.length, 0, `${property.slug} must not publish standalone Review entities`);

    const reviews = vacationRentals[0].review || [];
    const visibleTemplate = template.replace(/<script[\s\S]*?<\/script>/g, "");
    assert.equal(
      reviews.length,
      property.guestFacts.reviews.length,
      `${property.slug} must retain its verified reviews under VacationRental.review`
    );

    for (const review of reviews) {
      assert.equal(review["@type"], "Review", `${property.slug} nested review must stay typed as Review`);
      assert.equal("itemReviewed" in review, false, `${property.slug} nested review must not create another VacationRental`);
      assert.ok(review.reviewRating, `${property.slug} nested review must retain its rating`);
      assert.ok(review.author, `${property.slug} nested review must retain its author`);
      assert.ok(review.reviewBody, `${property.slug} nested review must retain its text`);
      assert.ok(review.datePublished, `${property.slug} nested review must retain its date`);
      assert.match(visibleTemplate, new RegExp(escapeRegExp(review.author.name)), `${property.slug} review author must be visible`);
      assert.match(visibleTemplate, new RegExp(escapeRegExp(review.reviewBody)), `${property.slug} review text must be visible`);
    }

    assert.ok(vacationRentals[0].image.length >= 8, `${property.slug} must publish at least 8 rental images`);
    for (const reviewedImage of reviewedImageCategories.get(property.slug) || []) {
      assert.ok(vacationRentals[0].image.some((url) => url.includes(reviewedImage)), `${property.slug} must retain reviewed bedroom, bathroom, and common-area coverage`);
    }
    assert.match(String(vacationRentals[0].latitude), /^-?\d+\.\d{5,}$/, `${property.slug} latitude must have at least 5 decimal places`);
    assert.match(String(vacationRentals[0].longitude), /^-?\d+\.\d{5,}$/, `${property.slug} longitude must have at least 5 decimal places`);
  }
});

test("pool-and-hot-tub stay copy does not claim every home has a hot tub", () => {
  const page = allSeoPages().find((entry) => entry.slug === "vacation-rentals-with-pool-and-hot-tub");
  assert.ok(page, "vacation-rentals-with-pool-and-hot-tub must exist");
  const visible = [
    page.intro,
    ...(page.faqs || []).map((faq) => `${faq.question} ${faq.answer}`),
    ...(page.decisionHighlights || []).map((item) => `${item.label} ${item.value}`)
  ].join(" ");
  assert.doesNotMatch(visible, /every (?:seascape )?home[^.]*hot tub/i);
  assert.doesNotMatch(visible, /hot tub heat is included at every home/i);
  assert.match(page.intro, /Pickleball Pool Home Retreat has a private pool, but no verified hot tub or spa/);
});

test("Blue House publishes verified Hostaway identity, coordinates, and no spa or waterfront claims", () => {
  const property = fallbackProperties.find((entry) => entry.slug === "blue-house");
  assert.ok(property, "blue-house must exist in the fallback data");
  assert.equal(property.id, "589288");
  assert.equal(property.guests, 10);
  assert.equal(property.bedrooms, 4);
  assert.equal(property.bathrooms, 2);
  assert.equal(property.guestFacts.pets.status, "no");
  assert.doesNotMatch(
    cleanText({ name: property.name, description: property.description, highlights: property.highlights, amenities: property.amenities, marketing_amenities: property.marketing_amenities, tagline: property.guestFacts.tagline, summary: property.guestFacts.summary }),
    /\b(hot tub|spa|waterfront|dock|beachfront)\b/i
  );

  const html = readBuilt("properties/blue-house/index.html");
  const rental = extractJsonLdObjects(html).find((item) => item["@type"] === "VacationRental");
  assert.ok(rental, "blue-house must publish VacationRental schema");
  assert.equal(rental.identifier, "seascape-589288");
  assert.equal(rental.latitude, 27.50860514);
  assert.equal(rental.longitude, -82.63215404);
  assert.equal(rental.address.postalCode, "34209");
  assert.ok(rental.image.length >= 8, "blue-house must publish at least 8 rental images");
  assert.match(html, /booking listing<\/a> on September 13, 2026/);
  assert.match(html, /Bedroom 4 also has a separate exterior door/);
  assert.match(html, /https:\/\/book\.seascape-vacations\.com\/listings\/589288/);
});

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function extractJsonLdObjects(html) {
  return [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
    .flatMap((match) => {
      const parsed = JSON.parse(match[1]);
      return Array.isArray(parsed) ? parsed : [parsed];
    });
}

const DOCK_FISHING_CLAIM =
  /\b(?:fish(?:ing)?\s+(?:from|off)\s+the\s+(?:canal\s+|private\s+)?dock\b(?!s)(?!\s+(?:is|are)\s+not\b)|dock\s+fishing|guests\s+fish\s+from|use\s+the\s+dock\s+for\s+[^.]{0,20}fishing|dock\s+for\s+fishing|fishing[^.<"]{0,40}\bwith\s+dock\s+access|fish\s+at\s+sunrise)/i;

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

const DOCK_PAGES_FIXED_IN_THIS_BATCH = [
  "src/guides/where-to-stay-near-anna-maria-island/index.html",
  "src/guides/things-to-do-bradenton-fl.html",
  "src/guides/holmes-beach-vs-bradenton-beach.html",
  "src/guides/anna-maria-island-vs-longboat-key.html",
];

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
