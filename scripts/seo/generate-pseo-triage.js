const fs = require("fs");
const path = require("path");

const seoPages = require("../../src/_data/seoPages.json");
const seoGovernance = require("../../src/_data/seoGovernance.js");

const rootDir = path.resolve(__dirname, "../..");
const outputPath = path.join(rootDir, "docs/portfolio/pseo-inventory-triage.md");

const stayNoindexSlugs = new Set(seoGovernance.staysNoindexSlugs || []);

const stayKeep = new Map([
  ["anna-maria-island-vacation-rentals", "AMI stay-money winner tracked in next-batch gate."],
  ["anna-maria-island-beachfront-rentals", "AMI near-beachfront alternative tracked in next-batch gate."],
  ["bradenton-vacation-rentals", "Founder-authorized Bradenton head-term collection (2026-11-17)."],
  ["bradenton-vacation-rentals-near-beaches", "Bradenton beach-access stay page in portfolio map."],
  ["siesta-key-area-vacation-rentals", "Sarasota-side stay-money destination in portfolio map."],
  ["book-direct-anna-maria-island", "Direct-book trust angle supports the AMI money page family."],
  ["anna-maria-island-homes-with-pool", "Distinct high-intent AMI pool query with multiple matching properties."],
  ["large-group-vacation-rentals-anna-maria-island", "Distinct large-group AMI-adjacent fit with verified property facts."],
  ["large-group-vacation-rentals-bradenton", "Distinct large-group Bradenton fit with verified property facts."],
  ["family-vacation-rentals-anna-maria-island", "Family-intent page has multiple matching properties and guide routing fit."],
  ["vacation-rentals-near-anna-maria-island", "Core near-AMI commercial page; useful positioning because homes are near AMI, not on-island."],
  ["heated-pool-vacation-rentals-bradenton", "Founder-authorized citation-gap stay lander (2026-11-21) for heated-pool Bradenton homes."],
  ["vacation-rentals-near-img-academy", "Founder-authorized citation-gap stay lander (2026-11-21) for IMG Academy lodging."],
]);

const stayImprove = new Map([
  ["bradenton-waterfront-vacation-rentals", "Waterfront/dock query; one-property; needs competitor and truth check."],
  ["bradenton-vacation-rentals-with-hot-tub", "Amenity query with matching homes; check SERP and opening answer."],
  ["fishing-vacation-rentals-bradenton", "Activity query can support dock pages if SERP confirms demand."],
  ["romantic-getaway-anna-maria-island", "Persona page; verify demand and consolidate if weak."],
  ["sarasota-vacation-rentals-with-pool", "Sarasota pool query; commercial intent, thin inventory."],
  ["downtown-sarasota-vacation-rentals", "Sarasota location page; thin inventory; needs competitor check."],
  ["sarasota-arts-culture-vacation-rentals", "Guide-style Sarasota angle; may route into a stronger stay page."],
  ["luxury-vacation-rentals-sarasota", "High-value term; one-property support needs SERP validation."],
  ["vacation-rentals-with-pool-and-hot-tub", "Amenity stack; check if it should feed AMI or Bradenton winners."],
  ["beach-house-rentals-florida-gulf-coast", "Broad commercial term; needs SERP specificity check."],
  ["gulf-coast-vacation-homes-with-dock", "Dock query; current inventory is narrow."],
  ["golf-vacation-rentals-bradenton", "Activity page may support Bradenton if SERP demand exists."],
  ["kayaking-vacation-rentals-bradenton", "Activity page can feed waterfront demand if SERP confirms."],
  ["dolphin-watching-vacation-rentals-florida", "Thin activity page; check guide vs stay destination."],
  ["honeymoon-rentals-anna-maria-island", "Persona page; check demand before keeping independent."],
  ["multigenerational-vacation-rentals-florida", "Likely overlaps with large-group pages."],
  ["accessible-vacation-rentals-florida", "Accessibility claims need property-truth verification."],
  ["long-weekend-getaway-florida", "Trip-length intent if it transfers to property clicks."],
  ["week-long-vacation-rentals-florida", "Trip-length intent if it transfers to property clicks."],
  ["extended-stay-vacation-rentals-florida", "Snowbird intent; needs query evidence."],
  ["work-from-home-vacation-rentals-florida", "Work-from-anywhere angle needs demand and amenity proof."],
  ["quiet-relaxing-vacation-rentals-florida", "One-property page; check consolidate vs keep."],
  ["last-minute-vacation-rentals-florida", "Commercial intent; must match real availability."],
  ["affordable-vacation-rentals-florida-gulf-coast", "Price-sensitive; needs careful direct-book proof."],
  ["vacation-rentals-with-game-room", "Thin amenity query; verify truth and SERP."],
  ["vacation-rentals-with-fire-pit", "Thin amenity query; verify truth and SERP."],
  ["vacation-rentals-with-outdoor-grill", "Amenity query; route by property truth."],
  ["bean-point-luxury-rentals", "Keep only if near-AMI positioning is explicit and SERP supports it."],
  ["vacation-rentals-near-restaurants-florida", "Hybrid likely needs consolidation unless SERP proves demand."],
  ["vacation-rentals-with-elevator", "Elevator claims need property-truth verification."],
  ["canal-homes-with-boat-dock", "Water-access query; one-property; needs careful proof."],
]);

const stayConsolidate = new Map([
  ["florida-gulf-coast-vacation-rentals", "Broad gateway overlaps with stronger AMI/Bradenton/Sarasota stay destinations."],
  ["pet-friendly-vacation-rentals-bradenton", "Thin one-property amenity page; likely feed stronger Bradenton page unless GSC proves demand."],
  ["snowbird-rentals-florida-gulf-coast", "Season/extended-stay overlap; keep only if analytics proves distinct demand."],
  ["vacation-rentals-sleeps-12-florida", "Capacity variant overlaps with large-group pages."],
  ["vacation-rentals-sleeps-16-florida", "Capacity variant overlaps with large-group pages."],
  ["4-bedroom-vacation-rentals-florida", "Bedroom-count variant overlaps with large-group pages."],
  ["5-bedroom-vacation-rentals-florida", "Bedroom-count variant overlaps with large-group pages."],
]);

const ownerKeep = new Map([
  ["vacation-rental-management-anna-maria-island", "Owner acquisition winner URL in portfolio map."],
  ["vacation-rental-management-bradenton", "Owner acquisition winner URL in portfolio map."],
  ["maximize-vacation-rental-income-florida", "Owner economics bridge page in portfolio map."],
  ["vacation-rental-management-fees-florida", "Tracked owner-money page in next-batch gate."],
  ["vacation-rental-licensing-florida", "Tracked owner-money page in next-batch gate."],
  ["vrbo-management-services-florida", "Tracked owner-money page in next-batch gate."],
  ["vacation-rental-interior-design-florida", "Owner design/renovation destination in portfolio map."],
  ["buy-vacation-rental-property-florida", "Owner investment/acquisition-fit destination in portfolio map."],
]);

const ownerImprove = new Map([
  ["switch-vacation-rental-management-company", "High-intent pain page; validate against owner CTR and competitor offers."],
  ["airbnb-management-services-sarasota", "SERP captured 2026-11-10; copy rewritten. Refresh SERP before more edits."],
  ["self-manage-vs-property-management-florida", "Useful comparison intent if it feeds revenue-teardown CTA."],
  ["vacation-rental-management-sarasota", "Core owner-service query; compare against live Sarasota managers."],
  ["increase-vacation-rental-bookings", "Owner pain page; check whether proof supports the claim path."],
  ["vacation-rental-pricing-strategy", "Owner economics page; needs proof and competitor comparison."],
  ["vacation-rental-marketing-florida", "Support page likely useful if it feeds owner money pages."],
  ["vacation-rental-cleaning-services-florida", "Operations page needs owner intent and service proof check."],
  ["vacation-rental-maintenance-florida", "Operations page needs owner intent and service proof check."],
  ["vacation-rental-guest-screening", "Trust/protection angle needs proof and competitor comparison."],
  ["vacation-rental-insurance-florida", "Compliance support page needs current facts before promotion."],
  ["vacation-rental-taxes-florida", "Compliance support page needs current facts before promotion."],
  ["vacation-rental-photography-florida", "Revenue-support page needs proof and image/process specificity."],
]);

const ownerConsolidate = new Map([
  ["vacation-rental-management-siesta-key", "Location variant likely belongs under Sarasota unless GSC proves distinct demand."],
  ["vacation-rental-management-longboat-key", "Location variant likely belongs under Sarasota/AMI service-area logic unless GSC proves demand."],
  ["condo-rental-management-florida", "Property-type variant should consolidate unless owner evidence proves condo demand."],
  ["new-vacation-rental-owner-guide-florida", "Support intent overlaps with acquisition and compliance pages."],
  ["switch-from-airbnb-self-manage", "Overlaps with self-manage and switch-manager pages."],
  ["sell-vacation-rental-property-florida", "Not a current owner-acquisition priority unless it feeds acquisition or referral strategy."],
]);

function escapeCell(value) {
  return String(value || "")
    .replace(/\|/g, "\\|")
    .replace(/\n/g, " ");
}

function classifyStay(page) {
  if (page.rehomeTo) {
    return {
      classification: "redirect",
      evidence: `Source record rehomes to ${page.rehomeTo}.`,
      nextAction: "Keep redirect ownership explicit; do not revive as pSEO.",
    };
  }

  if (stayNoindexSlugs.has(page.slug)) {
    return {
      classification: "noindex",
      evidence: "Listed in seoGovernance.staysNoindexSlugs.",
      nextAction: "Keep served as support/noindex unless GSC plus SERP evidence proves distinct demand.",
    };
  }

  if (stayKeep.has(page.slug)) {
    return {
      classification: "keep",
      evidence: stayKeep.get(page.slug),
      nextAction: "Keep indexable; improve only through the measured batch gate.",
    };
  }

  if (stayConsolidate.has(page.slug)) {
    return {
      classification: "consolidate",
      evidence: stayConsolidate.get(page.slug),
      nextAction: "Do not redirect yet; require page-level GSC and live SERP proof before consolidation.",
    };
  }

  if (stayImprove.has(page.slug)) {
    return {
      classification: "improve",
      evidence: stayImprove.get(page.slug),
      nextAction: "Run Gate 0 competitor read before editing title, intro, schema, or internal links.",
    };
  }

  return {
    classification: "consolidate",
    evidence: "No portfolio ownership or current measured gate identifies this as a winner.",
    nextAction: "Treat as candidate consolidation until page-level evidence proves independent value.",
  };
}

function classifyOwner(page) {
  if (ownerKeep.has(page.slug)) {
    return {
      classification: "keep",
      evidence: ownerKeep.get(page.slug),
      nextAction: "Keep indexable; wait for next-batch reread before opening a rewrite branch.",
    };
  }

  if (ownerImprove.has(page.slug)) {
    return {
      classification: "improve",
      evidence: ownerImprove.get(page.slug),
      nextAction: "Run owner SERP competitor read before copy or metadata work.",
    };
  }

  if (ownerConsolidate.has(page.slug)) {
    return {
      classification: "consolidate",
      evidence: ownerConsolidate.get(page.slug),
      nextAction: "Keep available for now; consolidate only after GSC and SERP evidence confirm low distinct value.",
    };
  }

  return {
    classification: "improve",
    evidence: "Owner page remains indexable but has no explicit portfolio winner role.",
    nextAction: "Run owner intent and competitor read before deciding whether to keep or consolidate.",
  };
}

function summarize(rows) {
  return rows.reduce((counts, row) => {
    counts[row.classification] = (counts[row.classification] || 0) + 1;
    return counts;
  }, {});
}

function renderTable(rows) {
  const header = "| URL | Class | Evidence | Next action |\n| --- | --- | --- | --- |";
  const body = rows
    .map((row) => `| ${escapeCell(row.url)} | ${row.classification} | ${escapeCell(row.evidence)} | ${escapeCell(row.nextAction)} |`)
    .join("\n");
  return `${header}\n${body}`;
}

const stayRows = (seoPages.vacationer || []).map((page) => {
  const decision = classifyStay(page);
  return {
    type: "stay",
    url: page.rehomeTo ? `/stays/${page.slug}/ -> ${page.rehomeTo}` : `/stays/${page.slug}/`,
    slug: page.slug,
    ...decision,
  };
});

const ownerRows = (seoPages.owner || []).map((page) => {
  const decision = classifyOwner(page);
  return {
    type: "owner",
    url: `/property-management/${page.slug}/`,
    slug: page.slug,
    ...decision,
  };
});

const allRows = [...stayRows, ...ownerRows];
const totalSummary = summarize(allRows);
const staySummary = summarize(stayRows);
const ownerSummary = summarize(ownerRows);

const summaryOrder = ["keep", "improve", "noindex", "redirect", "consolidate"];
function renderCounts(counts) {
  return summaryOrder
    .map((key) => `${key}: ${counts[key] || 0}`)
    .join("; ");
}

const output = `# pSEO Inventory Triage

Generated by \`node scripts/seo/generate-pseo-triage.js\`.

## Status

- Current decision source: \`docs/status/next-batch.md\`.
- Current reread status: read the exact status from \`docs/status/next-batch.md\`;
  do not copy the volatile value into this generated triage note.
- Current next move: read the exact next move from \`docs/status/next-batch.md\`.
- Branch rule: do not open a new owner, stay, guide, GEO, or SEO expansion branch until the analytics receipt moves \`docs/status/next-batch.md\` to \`open next batch\`. Founder exception 2026-11-17: \`/stays/bradenton-vacation-rentals/\` only. Founder exception 2026-11-21: \`/stays/heated-pool-vacation-rentals-bradenton/\` and \`/stays/vacation-rentals-near-img-academy/\` plus the book-direct guide refresh.
- Regression exception: a tracked winner or money-page regression uses
  \`docs/process/ranking-regression-rescue.md\`; this does not authorize new pSEO
  volume.
- Google policy guardrail: indexable pSEO must add clear user value, local proof, and commercial routing. Thin scaled variants should be noindexed, redirected, or consolidated.

## Counts

- All generated pSEO records: ${allRows.length} (${renderCounts(totalSummary)}).
- Stay records: ${stayRows.length} (${renderCounts(staySummary)}).
- Owner records: ${ownerRows.length} (${renderCounts(ownerSummary)}).

## Classification Rules

- \`keep\`: page has explicit portfolio ownership, measured money-page role, or a distinct high-intent role worth preserving while the reread gate is closed.
- \`improve\`: page may have commercial or strategic value, but should not be edited until Gate 0 competitor evidence says what to change.
- \`noindex\`: page is served but intentionally excluded from indexing through \`seoGovernance.staysNoindexSlugs\`.
- \`redirect\`: source record already rehomes to a stronger URL and should not be revived.
- \`consolidate\`: candidate for consolidation into a stronger winner page. This is not approval to redirect immediately; require page-level GSC plus live SERP evidence first.

## Stay pSEO

${renderTable(stayRows)}

## Owner pSEO

${renderTable(ownerRows)}
`;

fs.writeFileSync(outputPath, output);
console.log(`Wrote ${path.relative(rootDir, outputPath)}`);
