const fs = require("fs");
const path = require("path");

const OWNER_FILE = "src/_data/sourcedClaims.json";
const GUEST_SOURCE = /\.(?:html|njk|json|md|txt)$/;
const SAVINGS_PERCENT = /\bsave[sd]?\b[^<%.]{0,32}\d+(?:\s*[-–]\s*\d+)?\s*%/gi;
const PRICE_ADVANTAGE =
  /well under|significantly lower rates|usually costs less|lower direct-book total|and lower rates|groups of 8\+ come out ahead|It's cheaper|significant discounts apply|deepest discounts|more you save per night|For families and groups, absolutely|at a similar nightly rate|best available rate|best monthly rates|best per-night value|our best value|on-island nightly premiums|stronger overall value|same spend|same-budget island|at that price point|near-island pricing usually|beachfront premium|address premium|better value|better rates|rates are (?:highest|lower)|lower-rate season|rates below|winter weeks cost more|premium rates|priciest|higher per-night rates|lower per-night math|flatten the per-night cost|Stay longer and save|well below hotel|affordable compared to|helps lower the total|Lower Total|higher all-in total|wins on space and total cost|pay more to stay|without the extra platform fees|fewer extra fees|keeps platform fees out|keep more of the fishing budget|beat paying more|without paying true beachfront pricing|(?:beachfront|island) markup|money better spent|Vacation Deals|500\+ Airbnb reviews|500 guest reviews|qualify for monthly pricing|pay up for/i;

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
    const decoded = decodeEntities(fs.readFileSync(file, "utf8"));
    const matcher = new RegExp(SAVINGS_PERCENT.source, SAVINGS_PERCENT.flags);
    for (const match of decoded.matchAll(matcher)) {
      const start = Math.max(0, match.index - 120);
      const end = match.index + match[0].length + 80;
      hits.push({
        file: relative,
        match: match[0],
        excerpt: decoded.slice(start, end)
      });
    }
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
  return hit.excerpt.includes(claim.quote) && claim.quote.toLowerCase().includes(hit.match.toLowerCase());
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
    const decoded = decodeEntities(fs.readFileSync(filePath, "utf8"));
    if (!decoded.includes(claim.quote)) {
      throw new Error(`${OWNER_FILE} quote not found in ${claim.file}`);
    }
  }
}

function unsourcedPriceAdvantages(records, claims, now = new Date()) {
  if (!Array.isArray(records) || records.length === 0) {
    throw new Error(`${OWNER_FILE} stay records are missing`);
  }
  const loaded = loadSourcedClaims(claims);
  return records.filter((page) => {
    const text = JSON.stringify(page);
    if (!PRICE_ADVANTAGE.test(text)) {
      return false;
    }
    const slug = page && typeof page.slug === "string" ? page.slug : "";
    return !loaded.some(
      (claim) =>
        !isExpired(claim, now) &&
        claim.slug === slug &&
        text.toLowerCase().includes(claim.quote.toLowerCase())
    );
  });
}

function assertNoUnsourcedPriceAdvantages(records, claims, now = new Date()) {
  const missing = unsourcedPriceAdvantages(records, claims, now);
  if (missing.length > 0) {
    throw new Error(
      `${OWNER_FILE} is missing a sourced-claim row for better rates on ${missing[0].slug || "unknown-slug"}`
    );
  }
}

module.exports = {
  OWNER_FILE,
  PRICE_ADVANTAGE,
  SAVINGS_PERCENT,
  loadSourcedClaims,
  readSourcedClaims,
  scanSrcSavingsHits,
  unsourcedSavingsHits,
  assertSavingsSourced,
  assertLiveQuotesPresent,
  unsourcedPriceAdvantages,
  assertNoUnsourcedPriceAdvantages
};
