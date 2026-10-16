const fs = require("fs");
const path = require("path");

const OWNER_FILE = "src/_data/sourcedClaims.json";
const GUEST_SOURCE = /\.(?:html|njk|json|md|txt)$/;
const SAVINGS_PERCENT = /\bsave[sd]?\b[^%.]{0,32}\d+(?:\s*[-–]\s*\d+)?\s*%/gi;
const PERCENTAGE_FIRST_SAVINGS = /\d+(?:\s*[-–]\s*\d+)?\s*%\s*(?:less|off)\b/gi;
const QUALITATIVE_DIRECT_SAVINGS = /typical direct savings/gi;
const UNDERLYING_EVIDENCE = /ota|guest service fee|airbnb|vrbo|checkout fee|hostaway|published menu/i;
const PRICE_ADVANTAGE =
  /well under|significantly lower rates|usually costs less|lower direct-book total|and lower rates|groups of 8\+ come out ahead|It's cheaper|significant discounts apply|deepest discounts|more you save per night|For families and groups, absolutely|at a similar nightly rate|best available rate|best monthly rates|best per-night value|our best value|on-island nightly premiums|stronger overall value|same spend|same-budget island|at that price point|near-island pricing usually|beachfront premium|address premium|better value|better rates|rates are (?:highest|lower)|lower-rate season|rates below|winter weeks cost more|premium rates|priciest|higher per-night rates|lower per-night math|flatten the per-night cost|Stay longer and save|well below hotel|affordable compared to|helps lower the total|Lower Total|higher all-in total|wins on space and total cost|pay more to stay|without the extra platform fees|fewer extra fees|keeps platform fees out|keep more of the fishing budget|beat paying more|without paying true beachfront pricing|(?:beachfront|island) markup|money better spent|Vacation Deals|500\+ Airbnb reviews|500 guest reviews|qualify for monthly pricing|pay up for/gi;

const DEFAULT_ROOT = path.resolve(__dirname, "..", "..");

function ownerPath(root = DEFAULT_ROOT) {
  return path.join(root, OWNER_FILE);
}

function decodeEntities(text) {
  return String(text || "")
    .replace(/&ndash;|&#8211;|&#x2013;/gi, "–")
    .replace(/&mdash;|&#8212;|&#x2014;/gi, "—")
    .replace(/&amp;/gi, "&");
}

function stripMarkup(text) {
  return decodeEntities(text)
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ");
}

function dateStamp(now = new Date()) {
  return now.toISOString().slice(0, 10);
}

function parseExpires(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error(`${OWNER_FILE} row has invalid expires`);
  }
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`${OWNER_FILE} row has invalid expires`);
  }
  return value;
}

function isExpired(claim, now = new Date()) {
  return dateStamp(now) > parseExpires(claim.expires);
}

function sourceNamesOwnGuide(source, file) {
  if (!file) {
    return false;
  }
  const normalizedSource = source.toLowerCase();
  const stem = file.replace(/\\/g, "/").replace(/^src\/guides\//, "").replace(/\/index\.html$/, "").replace(/\.html$/, "");
  if (normalizedSource.includes(stem) || normalizedSource.includes(stem.replace(/-/g, " "))) {
    return true;
  }
  const parts = stem.split("-").filter((part) => part.length > 2);
  for (let i = 0; i < parts.length - 1; i += 1) {
    if (
      normalizedSource.includes(`${parts[i]}-${parts[i + 1]}`) ||
      normalizedSource.includes(`${parts[i]} ${parts[i + 1]}`)
    ) {
      return true;
    }
  }
  return /guide/i.test(source) && parts.some((part) => part.length > 4 && normalizedSource.includes(part));
}

function assertUnderlyingSource(source, file, index) {
  if (sourceNamesOwnGuide(source, file) && !UNDERLYING_EVIDENCE.test(source)) {
    throw new Error(`${OWNER_FILE} row ${index} source is the same guide that contains the claim`);
  }
}

function loadSourcedClaims(claims) {
  if (claims == null) {
    throw new Error(`${OWNER_FILE} is missing`);
  }
  if (!Array.isArray(claims) || claims.length === 0) {
    throw new Error(`${OWNER_FILE} is empty`);
  }

  return claims.map((row, index) => {
    if (!row || typeof row !== "object") {
      throw new Error(`${OWNER_FILE} row ${index} is missing source`);
    }
    const quote = typeof row.quote === "string" ? decodeEntities(row.quote).trim() : "";
    const source = typeof row.source === "string" ? row.source.trim() : "";
    const file = typeof row.file === "string" ? row.file.trim() : "";
    const slug = typeof row.slug === "string" ? row.slug.trim() : "";
    if (!source) {
      throw new Error(`${OWNER_FILE} row ${index} is missing source`);
    }
    if (!quote) {
      throw new Error(`${OWNER_FILE} row ${index} is missing quote`);
    }
    if (!file && !slug) {
      throw new Error(`${OWNER_FILE} row ${index} is missing file`);
    }
    assertUnderlyingSource(source, file, index);
    return {
      file,
      slug,
      quote,
      source,
      expires: parseExpires(row.expires)
    };
  });
}

function readSourcedClaims(root = DEFAULT_ROOT) {
  const filePath = ownerPath(root);
  if (!fs.existsSync(filePath)) {
    throw new Error(`${OWNER_FILE} is missing`);
  }
  return loadSourcedClaims(JSON.parse(fs.readFileSync(filePath, "utf8")));
}

function sourceFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? sourceFiles(full) : [full];
  });
}

function isGuestSource(file, root = DEFAULT_ROOT) {
  if (!GUEST_SOURCE.test(file)) {
    return false;
  }
  return path.relative(root, file) !== OWNER_FILE;
}

function savingsPatterns() {
  return [SAVINGS_PERCENT, PERCENTAGE_FIRST_SAVINGS, QUALITATIVE_DIRECT_SAVINGS].map(
    (pattern) => new RegExp(pattern.source, pattern.flags.includes("g") ? pattern.flags : `${pattern.flags}g`)
  );
}

function scanSavingsHitsInText(text, file) {
  const stripped = stripMarkup(text);
  const hits = [];
  const seen = new Set();
  for (const matcher of savingsPatterns()) {
    for (const match of stripped.matchAll(matcher)) {
      const key = `${match.index}:${match[0]}`;
      if (seen.has(key)) {
        continue;
      }
      seen.add(key);
      const start = Math.max(0, match.index - 120);
      const end = match.index + match[0].length + 80;
      hits.push({
        file,
        match: match[0].trim(),
        excerpt: stripped.slice(start, end)
      });
    }
  }
  return hits;
}

function scanSrcSavingsHits(root = DEFAULT_ROOT) {
  const srcRoot = path.join(root, "src");
  if (!fs.existsSync(srcRoot)) {
    throw new Error(`${OWNER_FILE} is missing`);
  }

  const hits = [];
  for (const file of sourceFiles(srcRoot)) {
    if (!isGuestSource(file, root)) {
      continue;
    }
    const relative = path.relative(root, file).split(path.sep).join("/");
    hits.push(...scanSavingsHitsInText(fs.readFileSync(file, "utf8"), relative));
  }
  return hits;
}

function coversSavingsHit(claim, hit, now = new Date()) {
  if (isExpired(claim, now)) {
    return false;
  }
  if (claim.file !== hit.file) {
    return false;
  }
  const quote = claim.quote.toLowerCase();
  const needle = hit.match.toLowerCase();
  return hit.excerpt.toLowerCase().includes(quote) && quote.includes(needle);
}

function unsourcedSavingsHits(hits, claims, now = new Date()) {
  const loaded = loadSourcedClaims(claims);
  return hits.filter((hit) => !loaded.some((claim) => coversSavingsHit(claim, hit, now)));
}

function assertSavingsSourced(hits, claims, now = new Date()) {
  const missing = unsourcedSavingsHits(hits, claims, now);
  if (missing.length > 0) {
    throw new Error(
      `${OWNER_FILE} is missing a sourced-claim row for ${missing[0].match} in ${missing[0].file}`
    );
  }
}

function assertLiveQuotesPresent(claims, root = DEFAULT_ROOT) {
  const loaded = loadSourcedClaims(claims);
  for (const claim of loaded) {
    if (!claim.file) {
      continue;
    }
    const filePath = path.join(root, claim.file);
    if (!fs.existsSync(filePath)) {
      throw new Error(`${OWNER_FILE} is missing ${claim.file}`);
    }
    const stripped = stripMarkup(fs.readFileSync(filePath, "utf8"));
    if (!stripped.includes(claim.quote) && !decodeEntities(fs.readFileSync(filePath, "utf8")).includes(claim.quote)) {
      throw new Error(`${OWNER_FILE} quote not found in ${claim.file}`);
    }
  }
}

function priceAdvantageHits(text) {
  const matcher = new RegExp(PRICE_ADVANTAGE.source, PRICE_ADVANTAGE.flags.includes("g") ? PRICE_ADVANTAGE.flags : `${PRICE_ADVANTAGE.flags}g`);
  return [...String(text || "").matchAll(matcher)].map((match) => match[0]);
}

function coversPriceAdvantageHit(claim, slug, hit, now = new Date()) {
  if (isExpired(claim, now)) {
    return false;
  }
  if (claim.slug !== slug) {
    return false;
  }
  return claim.quote.toLowerCase().includes(hit.toLowerCase());
}

function unsourcedPriceAdvantages(records, claims, now = new Date()) {
  if (!Array.isArray(records) || records.length === 0) {
    throw new Error(`${OWNER_FILE} stay records are missing`);
  }
  const loaded = loadSourcedClaims(claims);
  const missing = [];
  for (const page of records) {
    const text = JSON.stringify(page);
    const slug = page && typeof page.slug === "string" ? page.slug : "";
    for (const hit of priceAdvantageHits(text)) {
      if (!loaded.some((claim) => coversPriceAdvantageHit(claim, slug, hit, now))) {
        missing.push({ slug, match: hit });
      }
    }
  }
  return missing;
}

function assertNoUnsourcedPriceAdvantages(records, claims, now = new Date()) {
  const missing = unsourcedPriceAdvantages(records, claims, now);
  if (missing.length > 0) {
    throw new Error(
      `${OWNER_FILE} is missing a sourced-claim row for ${missing[0].match} on ${missing[0].slug || "unknown-slug"}`
    );
  }
}

module.exports = {
  OWNER_FILE,
  PRICE_ADVANTAGE,
  SAVINGS_PERCENT,
  PERCENTAGE_FIRST_SAVINGS,
  QUALITATIVE_DIRECT_SAVINGS,
  loadSourcedClaims,
  readSourcedClaims,
  scanSavingsHitsInText,
  scanSrcSavingsHits,
  unsourcedSavingsHits,
  assertSavingsSourced,
  assertLiveQuotesPresent,
  priceAdvantageHits,
  unsourcedPriceAdvantages,
  assertNoUnsourcedPriceAdvantages
};
