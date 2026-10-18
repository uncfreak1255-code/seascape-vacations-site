"use strict";

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
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
const TOKEN = /\{(sleeps-phrase|sleeps-matching|br-matching|ba-matching|sleeps|br|ba|heat|homes|matching|tub-homes|pool-heat-fee)(?::([a-z0-9-]+))?\}/g;
const NUMBER_WORD = /\b(?:zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|dozen|score|\d+(?:\.\d+)?)\b/gi;
const FACT_TERM = /\b(?:guests?|sleep(?:s|ing)?|bedrooms?|bath(?:s|rooms?)?|homes?|houses?|propert(?:y|ies)|heat(?:ed|ing)?|rooms?)\b/gi;
const NEAR_WORDS = 4;

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

function matchingRange(page, catalog, field) {
  const slugs = Array.isArray(page && page.matchingProperties) ? page.matchingProperties : [];
  if (slugs.length === 0) {
    throw new Error(`stayFacts: matching ${field} range needs matchingProperties on ${page && page.slug || "unknown-slug"}`);
  }
  const values = slugs.map((slug) => {
    const property = propertyBySlug(catalog, slug);
    if (!property || property[field] == null) {
      throw new Error(`stayFacts: ${field} missing for ${slug || "unknown-slug"}`);
    }
    return Number(property[field]);
  });
  const min = Math.min(...values);
  const max = Math.max(...values);
  return min === max ? String(min) : `${min}–${max}`;
}

function matchingSleepsFact(page, catalog) {
  return matchingRange(page, catalog, "guests");
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
  if (kind === "br-matching") {
    return matchingRange(page, catalog, "bedrooms");
  }
  if (kind === "ba-matching") {
    return matchingRange(page, catalog, "bathrooms");
  }
  if (kind === "tub-homes") {
    return numberWord(tubHomeCount(catalog));
  }
  if (kind === "pool-heat-fee") {
    const fees = [...new Set(
      (catalog || [])
        .map((property) => {
          const match = poolHeatText(property).match(/\$(\d+)/);
          return match ? match[1] : "";
        })
        .filter(Boolean)
    )];
    if (fees.length !== 1) {
      throw new Error(`stayFacts: {pool-heat-fee} needs one catalog dollar fee, found ${fees.join(" and ") || "none"}`);
    }
    return `$${fees[0]}`;
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

const SKIP_KEYS = new Set(["slug", "file", "pageUrl", "bookingUrl", "href", "image", "relatedStaySlugs", "matchingProperties"]);

function visitStrings(value, visit, key) {
  if (typeof value === "string") {
    if (!SKIP_KEYS.has(key)) {
      visit(value);
    }
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((entry) => visitStrings(entry, visit, key));
    return;
  }
  if (value && typeof value === "object") {
    for (const [childKey, child] of Object.entries(value)) {
      visitStrings(child, visit, childKey);
    }
  }
}

function wordsBetween(text, start, end) {
  return text.slice(start, end).trim().split(/\s+/).filter(Boolean).length;
}

function stripStayMarkup(text) {
  return String(text || "")
    .replace(TOKEN, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function collectNearbyNumberFacts(text) {
  const stripped = stripStayMarkup(text);
  const hits = [];
  for (const sentence of stripped.split(/[.!?]+/)) {
    const numbers = [...sentence.matchAll(new RegExp(NUMBER_WORD.source, NUMBER_WORD.flags))];
    const terms = [...sentence.matchAll(new RegExp(FACT_TERM.source, FACT_TERM.flags))];
    for (const number of numbers) {
      const numberEnd = number.index + number[0].length;
      for (const term of terms) {
        const termEnd = term.index + term[0].length;
        if (wordsBetween(sentence, Math.min(numberEnd, termEnd), Math.max(number.index, term.index)) > NEAR_WORDS) {
          continue;
        }
        const start = Math.min(number.index, term.index);
        const end = Math.max(numberEnd, termEnd);
        hits.push({
          label: "number next to fact term",
          match: sentence.slice(start, end).replace(/\s+/g, " ").trim(),
          excerpt: sentence.trim()
        });
      }
    }
  }
  return hits;
}

function normalizeSentence(text) {
  return String(text || "").replace(/\s+/g, " ").trim().toLowerCase();
}

function sentenceHash(text) {
  return crypto.createHash("sha256").update(normalizeSentence(text)).digest("hex");
}

const STAY_BASELINE_FILE = "src/_data/stayNumberBaseline.json";
const BASELINE_TAGS = new Set(["non-claim", "suspected-claim"]);

function loadStayNumberBaseline(root = path.join(__dirname, "..", "..")) {
  const file = path.join(root, STAY_BASELINE_FILE);
  if (!fs.existsSync(file)) {
    throw new Error(`stayFacts: ${STAY_BASELINE_FILE} is missing`);
  }
  const rows = JSON.parse(fs.readFileSync(file, "utf8"));
  if (!Array.isArray(rows.sentences)) {
    throw new Error(`stayFacts: ${STAY_BASELINE_FILE} is missing sentences`);
  }
  const hashes = new Set();
  for (const row of rows.sentences) {
    if (!row || row.hash !== sentenceHash(row.sentence)) {
      throw new Error(`stayFacts: ${STAY_BASELINE_FILE} hash does not match sentence`);
    }
    if (!BASELINE_TAGS.has(row.tag) || !String(row.reason || "").trim()) {
      throw new Error(`stayFacts: ${STAY_BASELINE_FILE} row is missing a reviewed tag`);
    }
    hashes.add(row.hash);
  }
  return { rows: rows.sentences, hashes };
}

let stayNumberBaseline;

function allowedStayNumberSentence(sentence) {
  stayNumberBaseline = stayNumberBaseline || loadStayNumberBaseline();
  return stayNumberBaseline.hashes.has(sentenceHash(sentence));
}

function assertStayBaselineRatchet(currentRows, previousRows) {
  const previous = new Map((previousRows || []).map((row) => [row.hash, row]));
  for (const row of currentRows || []) {
    if (!previous.has(row.hash)) {
      throw new Error(
        `${STAY_BASELINE_FILE} can only shrink; new hash ${row.hash} needs a sourced token or a reviewed tag change on an existing row`
      );
    }
  }
}

function collectStayNumberCandidates(page) {
  const hits = [];
  visitStrings(page, (text) => {
    hits.push(...collectNearbyNumberFacts(text));
  });
  return hits;
}

function collectHandTypedStayFacts(page) {
  const hits = [];
  visitStrings(page, (text) => {
    for (const hit of collectNearbyNumberFacts(text)) {
      if (allowedStayNumberSentence(hit.excerpt || hit.match)) {
        continue;
      }
      hits.push(hit);
    }
    for (const [label, pattern] of [
      ["heat included", HEAT_INCLUDED_FACT],
      ["hot tub included year-round", HOT_TUB_YEAR_INCLUDED_FACT]
    ]) {
      for (const sentence of stripStayMarkup(text).split(/[.!?]+/)) {
        const match = sentence.match(pattern);
        if (!match || allowedStayNumberSentence(sentence)) {
          continue;
        }
        hits.push({ label, match: match[0], excerpt: sentence.trim() });
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
  visitStrings(page, (text) => {
    const clauses = String(text).split(/[.;]/);
    for (const clause of clauses) {
      if (!/\{tub-homes\}|verified hot tub/i.test(clause)) {
        continue;
      }
      const needsTubHeat = /\b(?:year-?round|no shutoff|independent controls)\b/i.test(clause);
      const needsPoolFee = /\$40/.test(clause);
      if (!needsTubHeat && !needsPoolFee) {
        continue;
      }
      const missing = (catalog || []).filter(hasTub).filter((property) => {
        if (needsTubHeat && !tubHeatText(property)) {
          return true;
        }
        if (needsPoolFee && !/\$40/.test(poolHeatText(property))) {
          return true;
        }
        return false;
      });
      if (missing.length > 0) {
        throw new Error(
          `stayFacts: class-level tub operation cannot cover ${missing.map((property) => property.slug).join(" and ")} without guestFacts on ${slug}`
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
  STAY_BASELINE_FILE,
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
  assertStayBaselineRatchet,
  assertStayCapacityBindings,
  collectHandTypedStayFacts,
  collectStayNumberCandidates,
  loadStayNumberBaseline,
  sentenceHash,
  hasTub,
  heatClause,
  heatIncludedFromTruth,
  listedHomeCount,
  stayOccupancy,
  tubHomeCount
};
