"use strict";

const { NUMBER, catalogHomeCountWord, numberWord } = require("../../scripts/enforcement/home-count-word");

const SLEEPS_FACT = /\b(?:sleep(?:s|ing)?(?:\s+up\s+to)?|hold)\s+\d+(?:\s*[-–-]\s*\d+)?\b/i;
const GUESTS_FACT = new RegExp(
  `(?<![,\\d])\\b${NUMBER}(?:\\s*[-–—]\\s*${NUMBER})?\\s+guests\\b`,
  "i"
);
const PEOPLE_FACT = /(?<![,\d])\b\d+(?:\s*[-–—]\s*\d+)?\s+people\b/i;
const PERSON_GROUP_FACT = /(?<![,\d])\b\d+(?:\s*[-–—]\s*\d+)?[-\s]+person(?:s)?\b/i;
const GROUPS_FACT = /\bgroups? (?:of|larger than|up to|over) \d+\+?(?:\s*[-–—]\s*\d+)?\b/i;
const GUEST_HYPHEN_FACT = /(?<![,\d])\b\d+(?:\s*[-–—]\s*\d+)?-guest\b/i;
const SPACE_FOR_FACT = /\bspace for \d+(?:\s*[-–—]\s*\d+)?\b/i;
const ROOM_FOR_FACT = /\bRoom for \d+(?:\s*[-–—]\s*\d+)?\b/i;
const UP_TO_FACT = /\bup to \d+\b(?!\s+(?:weeks?|days?|nights?|months?|hours?|minutes?|vehicles?|cars?))/i;
const HEAT_INCLUDED_FACT = /\bheat(?:ed|ing)?\b[^.!?]{0,80}(?<!not\s)\bincluded\b/i;
const HOT_TUB_YEAR_INCLUDED_FACT =
  /\bhot tubs?\b[^.!?]{0,80}(?<!not\s)\bincluded\b[^.!?]{0,60}\b(?:year-?round|all year)\b/i;
const HOME_COUNT = "(?:one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|[1-9]|1[0-2])";
const HOME_COUNT_FACT = new RegExp(
  `\\b${HOME_COUNT}\\s+(?:(?!of\\b|or\\b|to\\b|per\\b|at\\b|for\\b|with\\b|from\\b|by\\b|in\\b|on\\b)[A-Za-z][\\w-]*\\s+){0,3}(?:homes|options)\\b`,
  "i"
);
const ALL_COUNT_FACT = new RegExp(
  `\\b(?:all|both)\\s+${HOME_COUNT}\\b(?!\\s*-?bedrooms?\\b)`,
  "i"
);
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
      ["N-guest", GUEST_HYPHEN_FACT],
      ["space for N", SPACE_FOR_FACT],
      ["room for N", ROOM_FOR_FACT],
      ["up to N", UP_TO_FACT],
      ["heat included", HEAT_INCLUDED_FACT],
      ["hot tub included year-round", HOT_TUB_YEAR_INCLUDED_FACT],
      ["N homes", HOME_COUNT_FACT],
      ["all N", ALL_COUNT_FACT]
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

function escapeName(name) {
  return String(name).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function namedHomeSlugs(text, homes) {
  const masked = String(text || "").replace(/\{[^}]+\}/g, " ");
  const slugs = [];
  const seen = new Set();
  for (const home of homes) {
    for (const name of [...home.names].sort((left, right) => right.length - left.length)) {
      if (new RegExp(`\\b${escapeName(name)}\\b`, "i").test(masked)) {
        if (!seen.has(home.slug)) {
          seen.add(home.slug);
          slugs.push(home.slug);
        }
        break;
      }
    }
  }
  return slugs;
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
          const pattern = new RegExp(`\\b${escapeName(name)}\\b`, "ig");
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
  const matching = [...new Set((page && page.matchingProperties) || [])];
  visitStrings(page, (text) => {
    if (!/\{matching\}/.test(text)) {
      return;
    }
    const named = namedHomeSlugs(text, homes);
    if (named.length === 0) {
      return;
    }
    const same =
      named.length === matching.length &&
      named.every((home) => matching.includes(home)) &&
      matching.every((home) => named.includes(home));
    if (!same) {
      throw new Error(
        `stayFacts: {matching} names ${named.join(" and ")} but matchingProperties is ${matching.join(" and ") || "empty"} on ${slug}`
      );
    }
  });
  visitStrings(page, (text) => {
    if (!/\{matching\}/.test(text) || /\{sleeps-matching\}/.test(text)) {
      return;
    }
    const shared = [...new Set([...text.matchAll(/\{sleeps(?:-phrase)?:([a-z0-9-]+)\}/g)].map((match) => match[1]))];
    if (shared.length !== 1) {
      return;
    }
    const occupancies = matchingOccupancies(page, catalog);
    const unique = [...new Set(occupancies)];
    const tokenOccupancy = stayOccupancy(catalog, shared[0]);
    if (unique.length > 1 || unique[0] !== tokenOccupancy) {
      throw new Error(
        `stayFacts: {matching} cannot share {sleeps:${shared[0]}} unless every matching home sleeps ${tokenOccupancy} on ${slug}`
      );
    }
  });
  visitStrings(page, (text) => {
    if (/\{matching\}/.test(text) && /\bboth\b/i.test(text) && matchingHomeCount(page) !== 2) {
      throw new Error(`stayFacts: {matching} cannot pair with Both unless matchingProperties has 2 homes on ${slug}`);
    }
  });
  const tubs = (catalog || []).filter(hasTub).map((property) => property.slug);
  visitStrings(page, (text) => {
    if (!/\{tub-homes\}/.test(text)) {
      return;
    }
    const named = namedHomeSlugs(text, homes);
    if (named.length === 0) {
      return;
    }
    const exceptions = String(text)
      .split(/[.;—]/)
      .filter((clause) => /no verified|no hot tub|without a (?:verified )?hot tub/i.test(clause))
      .flatMap((clause) => namedHomeSlugs(clause, homes));
    const claimed = named.filter((home) => !exceptions.includes(home));
    if (claimed.length === 0) {
      return;
    }
    const same =
      claimed.length === tubs.length &&
      claimed.every((home) => tubs.includes(home)) &&
      tubs.every((home) => claimed.includes(home));
    if (!same) {
      throw new Error(
        `stayFacts: {tub-homes} names ${claimed.join(" and ") || "none"} but tub homes are ${tubs.join(" and ") || "none"} on ${slug}`
      );
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
  ALL_COUNT_FACT,
  GROUPS_FACT,
  GUEST_HYPHEN_FACT,
  GUESTS_FACT,
  HEAT_INCLUDED_FACT,
  HOME_COUNT_FACT,
  HOT_TUB_YEAR_INCLUDED_FACT,
  PEOPLE_FACT,
  PERSON_GROUP_FACT,
  ROOM_FOR_FACT,
  SLEEPS_FACT,
  SPACE_FOR_FACT,
  UP_TO_FACT,
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
