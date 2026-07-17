const fs = require("fs");
const path = require("path");

const DEFAULT_OUTPUT_PATH = path.join(process.cwd(), "_site", "properties", "index.html");
const DEFAULT_EXPECTED_CARDS = 5;

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

  if (report.cardCount < expectedCards) {
    failures.push(`expected ${expectedCards} property cards, found ${report.cardCount}`);
  }

  if (report.nextAvailableCount < expectedCards) {
    failures.push(`expected ${expectedCards} Next available cards, found ${report.nextAvailableCount}`);
  }

  if (report.availabilityLiveCount < expectedCards) {
    failures.push(`expected ${expectedCards} Availability live badges, found ${report.availabilityLiveCount}`);
  }

  if (report.liveCalendarCount > 0 || report.calendarSecureCount > 0) {
    failures.push(
      `found ${report.liveCalendarCount} Live calendar fallback blocks and ${report.calendarSecureCount} Calendar secure fallback badges`
    );
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
    `[properties-availability] verified ${report.nextAvailableCount}/${report.cardCount} property cards render live availability`
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
