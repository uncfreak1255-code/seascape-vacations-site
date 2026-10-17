"use strict";

const { catalogHomeCountWord, numberWord } = require("../../scripts/enforcement/home-count-word");

const SLEEPS_FACT = /\b(?:sleep(?:s|ing)?(?:\s+up\s+to)?|hold)\s+\d+(?:\s*[-–-]\s*\d+)?\b/i;
const GUESTS_FACT = /(?<![,\d])\b\d+(?:\s*[-–—]\s*\d+)?\s+guests\b/i;
const PEOPLE_FACT = /(?<![,\d])\b\d+(?:\s*[-–—]\s*\d+)?\s+people\b/i;
const PERSON_GROUP_FACT = /(?<![,\d])\b\d+(?:\s*[-–—]\s*\d+)?[-\s]+person(?:s)?\b/i;
const GROUPS_FACT = /\bgroups (?:of|larger than|up to|over) \d+\+?(?:\s*[-–—]\s*\d+)?\b/i;
const HEAT_INCLUDED_FACT = /\bheat(?:ed|ing)?\b[^.!?]{0,80}(?<!not\s)\bincluded\b/i;
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
      ["N people", PEOPLE_FACT],
      ["N-person", PERSON_GROUP_FACT],
      ["groups of N", GROUPS_FACT],
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

function catalogHomeNames(catalog) {
  const homes = (catalog || [])
    .filter((property) => property && property.slug && property.name)
    .map((property) => ({
      slug: property.slug,
      names: [property.name, String(property.name).replace(/^The\s+/i, "")].filter(
        (name, index, all) => name && all.indexOf(name) === index
      )
    }));
  const firstWordOwners = new Map();
  for (const home of homes) {
    const first = String(home.names[0] || "").split(/\s+/)[0];
    if (!first || first.length < 5 || /^(?:River|Beach|Pool|House|Bradenton|Sarasota|Anna|Florida|Gulf|Island|Coastal)$/i.test(first)) {
      continue;
    }
    const key = first.toLowerCase();
    if (!firstWordOwners.has(key)) {
      firstWordOwners.set(key, []);
    }
    firstWordOwners.get(key).push({ home, first });
  }
  for (const owners of firstWordOwners.values()) {
    if (owners.length === 1) {
      owners[0].home.names.push(owners[0].first);
    }
  }
  return homes.sort(
    (left, right) => Math.max(...right.names.map((name) => name.length)) - Math.max(...left.names.map((name) => name.length))
  );
}

function assertStayCapacityBindings(page, catalog) {
  const slug = page && page.slug || "unknown-slug";
  visitStrings(page, (text) => {
    if (/\{sleeps:[a-z0-9-]+\}[-–]\{sleeps:[a-z0-9-]+\}/.test(text)) {
      throw new Error(`stayFacts: occupancy range must use {sleeps-matching} on ${slug}`);
    }
  });
  if (!catalog) {
    return;
  }
  const homes = catalogHomeNames(catalog);
  visitStrings(page, (text) => {
    for (const clause of String(text).split(/[.;—]/)) {
      const tokens = [...clause.matchAll(/\{sleeps(?:-phrase)?:([a-z0-9-]+)\}/g)].map((match) => match[1]);
      const uniqueTokens = [...new Set(tokens)];
      if (uniqueTokens.length !== 1 || /\{sleeps-matching\}/.test(clause)) {
        continue;
      }
      const masked = clause.replace(/\{[^}]+\}/g, " ");
      const hits = [];
      for (const home of homes) {
        for (const name of [...home.names].sort((left, right) => right.length - left.length)) {
          const pattern = new RegExp(`\\b${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "ig");
          let match = pattern.exec(masked);
          while (match) {
            hits.push({ slug: home.slug, index: match.index, end: match.index + match[0].length });
            match = pattern.exec(masked);
          }
        }
      }
      hits.sort((left, right) => left.index - right.index);
      const listed = [];
      const seen = new Set();
      for (const hit of hits) {
        if (seen.has(hit.slug)) {
          continue;
        }
        seen.add(hit.slug);
        listed.push(hit);
      }
      if (listed.length < 2) {
        continue;
      }
      const listedTogether = listed.slice(1).every((hit, index) => {
        const gap = masked.slice(listed[index].end, hit.index).replace(/\s+/g, " ").trim();
        return /^(?:,|, and|and)$/i.test(gap);
      });
      if (listedTogether) {
        throw new Error(
          `stayFacts: named homes ${listed.map((hit) => hit.slug).join(" and ")} share {sleeps:${uniqueTokens[0]}} on ${slug}`
        );
      }
    }
  });
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
  GROUPS_FACT,
  GUESTS_FACT,
  HEAT_INCLUDED_FACT,
  HOME_COUNT_FACT,
  PEOPLE_FACT,
  PERSON_GROUP_FACT,
  SLEEPS_FACT,
  applyStayFacts,
  assertNoHandTypedStayFacts,
  assertStayCapacityBindings,
  collectHandTypedStayFacts,
  hasTub,
  heatClause,
  heatIncludedFromTruth,
  listedHomeCount,
  stayOccupancy,
  tubHomeCount
};
