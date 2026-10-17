"use strict";

const { catalogHomeCountWord, numberWord } = require("../../scripts/enforcement/home-count-word");

const SLEEPS_FACT = /\b(?:sleep(?:s|ing)?(?:\s+up\s+to)?|hold)\s+\d+(?:\s*[-–-]\s*\d+)?\b/i;
const GUESTS_FACT = /(?<![,\d])\b\d+(?:\s*[-–—]\s*\d+)?\s+guests\b/i;
const HEAT_INCLUDED_FACT = /\bheat included\b/i;
const HOME_COUNT_FACT =
  /\b(?:one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|\d+)\s+(?:Seascape\s+)?homes\b/i;
const TOKEN = /\{(sleeps-phrase|sleeps-matching|sleeps|br|ba|heat|homes|matching|tub-homes)(?::([a-z0-9-]+))?\}/g;

function propertyBySlug(catalog, slug) {
  return (catalog || []).find((property) => property && property.slug === slug) || null;
}

function hasTub(property) {
  const flags = [
    ...(property.amenities || []),
    ...(property.marketing_amenities || [])
  ].map((flag) => String(flag).toLowerCase());
  return flags.some((flag) => flag.includes("hot-tub") || flag === "spa" || flag.includes("hot-tub-spa"));
}

function poolHeatText(property) {
  return String(property && property.guestFacts && property.guestFacts.poolHeat || "").trim();
}

function tubHeatText(property) {
  return String(property && property.guestFacts && property.guestFacts.tubHeat || "").trim();
}

function heatIncludedFromTruth(property) {
  const tubHeat = tubHeatText(property);
  if (!tubHeat) {
    return false;
  }
  if (/\b(?:optional|extra|confirm|costs extra|not included)\b/i.test(tubHeat)) {
    return false;
  }
  return /\bincluded\b/i.test(tubHeat);
}

function heatClause(property) {
  if (!property) {
    return "";
  }
  if (heatIncludedFromTruth(property)) {
    return "(heat included)";
  }
  if (hasTub(property) || poolHeatText(property) || tubHeatText(property)) {
    return "(confirm heat terms when booking)";
  }
  return "";
}

function matchingHomeCount(page) {
  return Array.isArray(page && page.matchingProperties) ? page.matchingProperties.length : 0;
}

function matchingOccupancies(page, catalog) {
  const slugs = Array.isArray(page && page.matchingProperties) ? page.matchingProperties : [];
  if (slugs.length === 0) {
    throw new Error(`stayFacts: {sleeps-matching} needs matchingProperties on ${page && page.slug || "unknown-slug"}`);
  }
  return slugs.map((slug) => stayOccupancy(catalog, slug));
}

function matchingSleepsFact(page, catalog) {
  const values = matchingOccupancies(page, catalog);
  const min = Math.min(...values);
  const max = Math.max(...values);
  return min === max ? String(min) : `${min}–${max}`;
}

function tubHomeCount(catalog) {
  return (catalog || []).filter(hasTub).length;
}

function resolveToken(kind, slug, page, catalog) {
  if (kind === "homes") {
    return catalogHomeCountWord(catalog);
  }
  if (kind === "matching") {
    return numberWord(matchingHomeCount(page));
  }
  if (kind === "sleeps-matching") {
    return matchingSleepsFact(page, catalog);
  }
  if (kind === "tub-homes") {
    return numberWord(tubHomeCount(catalog));
  }

  const property = propertyBySlug(catalog, slug);
  if (!property) {
    throw new Error(`stayFacts: unknown property "${slug}" for {${kind}:${slug || ""}}`);
  }
  if (kind === "sleeps") {
    return String(property.guests);
  }
  if (kind === "sleeps-phrase") {
    return `sleeps ${property.guests}`;
  }
  if (kind === "br") {
    return String(property.bedrooms);
  }
  if (kind === "ba") {
    return String(property.bathrooms);
  }
  if (kind === "heat") {
    return heatClause(property);
  }
  throw new Error(`stayFacts: unknown token kind "${kind}"`);
}

function capitalizeReplacement(replacement, source, offset) {
  if (!replacement) {
    return replacement;
  }
  const before = source.slice(0, offset);
  if (before === "" || /(?:^|[.!?]\s|>)$/.test(before)) {
    return replacement.charAt(0).toUpperCase() + replacement.slice(1);
  }
  return replacement;
}

function applyStayFactString(value, page, catalog) {
  return String(value)
    .replace(TOKEN, (match, kind, slug, offset, source) => {
      const replacement = resolveToken(kind, slug, page, catalog);
      return capitalizeReplacement(replacement == null ? "" : replacement, source, offset);
    })
    .replace(/[ \t]{2,}/g, " ")
    .replace(/ \./g, ".");
}

function applyStayFacts(value, catalog, page = value) {
  if (typeof value === "string") {
    return applyStayFactString(value, page, catalog);
  }
  if (Array.isArray(value)) {
    return value.map((entry) => applyStayFacts(entry, catalog, page));
  }
  if (value && typeof value === "object") {
    const next = {};
    for (const [key, child] of Object.entries(value)) {
      next[key] = applyStayFacts(child, catalog, page);
    }
    return next;
  }
  return value;
}

function visitStrings(value, visit) {
  if (typeof value === "string") {
    visit(value);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((entry) => visitStrings(entry, visit));
    return;
  }
  if (value && typeof value === "object") {
    Object.values(value).forEach((child) => visitStrings(child, visit));
  }
}

function collectHandTypedStayFacts(page) {
  const hits = [];
  visitStrings(page, (text) => {
    for (const [label, pattern] of [
      ["sleeps N", SLEEPS_FACT],
      ["N guests", GUESTS_FACT],
      ["heat included", HEAT_INCLUDED_FACT],
      ["N homes", HOME_COUNT_FACT]
    ]) {
      const match = text.match(pattern);
      if (match) {
        hits.push({ label, match: match[0], excerpt: text.slice(0, 180) });
      }
    }
  });
  return hits;
}

function assertNoHandTypedStayFacts(page) {
  const hits = collectHandTypedStayFacts(page);
  if (hits.length > 0) {
    throw new Error(
      `stayFacts: hand-typed ${hits[0].label} "${hits[0].match}" in stay JSON for ${page && page.slug || "unknown-slug"}`
    );
  }
}

function stayOccupancy(catalog, slug) {
  const property = propertyBySlug(catalog, slug);
  if (!property) {
    throw new Error(`stayFacts: occupancy requested for unknown property "${slug}"`);
  }
  return property.guests;
}

function listedHomeCount(page) {
  return matchingHomeCount(page);
}

module.exports = {
  GUESTS_FACT,
  HEAT_INCLUDED_FACT,
  HOME_COUNT_FACT,
  SLEEPS_FACT,
  applyStayFacts,
  assertNoHandTypedStayFacts,
  collectHandTypedStayFacts,
  hasTub,
  heatClause,
  heatIncludedFromTruth,
  listedHomeCount,
  stayOccupancy,
  tubHomeCount
};
