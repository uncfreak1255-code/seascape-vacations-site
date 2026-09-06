const fs = require("fs");
const path = require("path");

const DEFAULT_OUTPUT_PATH = path.join(process.cwd(), "_site", "properties", "index.html");
const { normalizeProperties } = require("../../src/_data/properties");
const canonicalProperties = normalizeProperties(require("../../src/_data/properties-fallback.json"));
const DEFAULT_EXPECTED_CARDS = canonicalProperties.length;

function shouldRequirePropertiesAvailabilityOutput(env = process.env) {
  return env.SEASCAPE_REQUIRE_PROPERTIES_AVAILABILITY === "1" || env.NETLIFY === "true";
}

function countMatches(html, pattern) {
  return (html.match(pattern) || []).length;
}

function analyzePropertiesAvailabilityOutput(html) {
  const cards =
    html.match(
      /<article\b[^>]*\bclass=["'][^"']*\bcatalog-card\b[^"']*["'][^>]*>[\s\S]*?<\/article>/gi
    ) || [];
  const renderedCards = cards.join("\n");

  return {
    cardCount: cards.length,
    checkoutCardCount: cards.filter((card) => /data-availability-mode=["']checkout["']/.test(card)).length,
    bookingLinkCount: cards.filter((card) => /href=["']https:\/\/book\.seascape-vacations\.com\/listings\/\d+["']/.test(card)).length,
    priceDisclosureCount: cards.filter((card) => card.includes("Full price, fees and cancellation terms on the booking page.")).length,
    uniquePropertyCount: new Set(cards.map((card) => (card.match(/data-property=["']([^"']+)["']/) || [])[1]).filter(Boolean)).size,
    visibleOpeningCount: countMatches(renderedCards, /<details(?![^>]*\bhidden\b)[^>]*class=["']catalog-opening["']/g),
    nextAvailableCount: countMatches(renderedCards, /catalog-next-lbl">\s*Next available\s*</g),
    liveCalendarCount: countMatches(renderedCards, /catalog-next-lbl">\s*Live calendar\s*</g),
    availabilityLiveCount: countMatches(renderedCards, /Availability · live/g),
    calendarSecureCount: countMatches(renderedCards, /Calendar · secure/g)
  };
}

function validatePropertiesAvailabilityOutput(html, options = {}) {
  const expectedCards = options.expectedCards || DEFAULT_EXPECTED_CARDS;
  const report = analyzePropertiesAvailabilityOutput(html);
  const failures = [];

  if (report.cardCount !== expectedCards) {
    failures.push(`expected ${expectedCards} property cards, found ${report.cardCount}`);
  }

  const cards = html.match(/<article\b[^>]*\bclass=["'][^"']*\bcatalog-card\b[^"']*["'][^>]*>[\s\S]*?<\/article>/gi) || [];
  for (const property of canonicalProperties) {
    const matching = cards.filter((card) => card.includes('data-property="' + property.slug + '"'));
    const listingIds = matching.length === 1
      ? Array.from(matching[0].matchAll(/https:\/\/book\.seascape-vacations\.com\/listings\/(\d+)(?=["'?&])/g), (match) => match[1])
      : [];
    if (matching.length !== 1 || !listingIds.length || listingIds.some((id) => id !== property.id)) {
      failures.push("missing or incorrect canonical booking destination for " + property.slug);
    }
  }
  if (!/data-catalog-version=["']guest-journey-v1["']/.test(html)) {
    failures.push("missing current guest journey version");
  }
  for (const [key, label] of [
    ["checkoutCardCount", "checkout availability mode"],
    ["bookingLinkCount", "canonical Hostaway listing link"],
    ["priceDisclosureCount", "full-price disclosure"],
    ["uniquePropertyCount", "distinct property identity"]
  ]) {
    if (report[key] !== report.cardCount) failures.push("every card needs " + label + ": " + report[key] + "/" + report.cardCount);
  }
  if (report.availabilityLiveCount || report.nextAvailableCount || report.visibleOpeningCount) {
    failures.push("cached openings must start hidden and must not claim live selected-date availability");
  }

  if (failures.length) {
    throw new Error(`properties availability output check failed: ${failures.join("; ")}`);
  }

  return report;
}

function main() {
  if (!shouldRequirePropertiesAvailabilityOutput()) {
    console.log("[properties-availability] skipped: availability output gate not required");
    return;
  }

  const outputPath = process.env.PROPERTIES_AVAILABILITY_OUTPUT_PATH || DEFAULT_OUTPUT_PATH;
  const html = fs.readFileSync(outputPath, "utf8");
  const report = validatePropertiesAvailabilityOutput(html, {
    expectedCards: Number(process.env.PROPERTIES_AVAILABILITY_EXPECTED_CARDS) || DEFAULT_EXPECTED_CARDS
  });

  console.log(
    `[properties-availability] verified ${report.checkoutCardCount}/${report.cardCount} property cards route availability and full prices to checkout`
  );
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

module.exports = {
  analyzePropertiesAvailabilityOutput,
  shouldRequirePropertiesAvailabilityOutput,
  validatePropertiesAvailabilityOutput
};
