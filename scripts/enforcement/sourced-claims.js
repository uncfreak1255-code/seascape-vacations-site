const fs = require("fs");
const path = require("path");

const OWNER_FILE = "src/_data/sourcedClaims.json";
const GUEST_SOURCE = /\.(?:html|njk|json|md|txt)$/;
const IDENTIFIABLE_EVIDENCE = /https?:\/\/\S+/i;
const WORD_ONES = {
  zero: 0,
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
  thirteen: 13,
  fourteen: 14,
  fifteen: 15,
  sixteen: 16,
  seventeen: 17,
  eighteen: 18,
  nineteen: 19
};
const WORD_TENS = {
  twenty: 20,
  thirty: 30,
  forty: 40,
  fifty: 50,
  sixty: 60,
  seventy: 70,
  eighty: 80,
  ninety: 90
};
const WORD_NUMBER = `${Object.keys(WORD_TENS).join("|")}(?:[\\s-](?:${Object.keys(WORD_ONES).join("|")}))?|${Object.keys(WORD_ONES).join("|")}`;
const DIGIT_PERCENT = /\d+(?:\s*[-–]\s*\d+)?\s*%/g;
const WORD_PERCENT = new RegExp(`\\b(?:${WORD_NUMBER})\\s+percent\\b`, "gi");
const AFTER_PERCENT = /^(?:\s*(?:less|off|below|lower|cheaper|discount|reduced|savings|or more))\b/i;
const SAVE_BEFORE = /\b(?:save[sd]?\b|savings\s*:|rates\s+drop\b)/i;
const DIFFERENCE_BEFORE = /\bdifference\b/i;
const PRICE_NOUN = /\b(?:rates?|pricing|price|markup|premium|discount|value|savings)\b/gi;
const QUALITATIVE_ADJ = /\b(?:better|best|lower|higher|cheaper|lowest|highest|deeper|deepest|stronger|priciest|typical|premium|far better)\b/gi;
const AVOIDANCE = /\b(?:skip|avoid|beat)\b/gi;
const AVOIDANCE_NOUN = /\b(?:markup|premium|platform fees|extra fees)\b/gi;
const KIND_PERCENT = "percent-comparative";
const KIND_QUALITATIVE = "qualitative-price-advantage";

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

function normalizePublicRoute(route) {
  if (!route || route === "/") {
    return "/";
  }
  return `/${String(route).replace(/^\/+|\/+$/g, "")}/`;
}

const GENERATED_SLUG_TOKEN = /\{\{\s*seoPage\.slug\s*\}\}/;

function publicRouteFromFile(file) {
  const relative = String(file || "").replace(/\\/g, "/");
  if (!relative) {
    return "";
  }
  if (relative === "src/index.njk" || relative === "src/index.html") {
    return "/";
  }
  let rest = relative.replace(/^src\//, "").replace(/\.(?:njk|html)$/i, "");
  rest = rest.replace(/\/index$/, "");
  if (!rest || rest === "index") {
    return "/";
  }
  if (/^(?:_data|_includes|_includes\/|_data\/|assets\/|css\/)/.test(rest)) {
    return "";
  }
  return normalizePublicRoute(rest);
}

function readPermalink(file, root = DEFAULT_ROOT) {
  const relative = String(file || "").replace(/\\/g, "/");
  if (!relative) {
    return "";
  }
  const filePath = path.join(root, relative);
  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    return "";
  }
  const match = fs.readFileSync(filePath, "utf8").match(/^permalink:\s*(?:["']([^"']+)["']|(\S+))/m);
  return (match && (match[1] || match[2])) || "";
}

function permalinkHasGeneratedSlug(permalink) {
  return GENERATED_SLUG_TOKEN.test(permalink);
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function generatedRoutePattern(permalink) {
  const normalized = normalizePublicRoute(permalink.replace(GENERATED_SLUG_TOKEN, "__SLUG__"));
  return new RegExp(`^${escapeRegExp(normalized).replace("__SLUG__", "[^/]+")}$`);
}

function publicRouteFromClaim(file, slug, root = DEFAULT_ROOT) {
  const permalink = readPermalink(file, root);
  if (!permalink || permalink === "false") {
    return publicRouteFromFile(file);
  }
  if (permalinkHasGeneratedSlug(permalink)) {
    if (!slug) {
      return "";
    }
    return normalizePublicRoute(permalink.replace(GENERATED_SLUG_TOKEN, slug));
  }
  return normalizePublicRoute(permalink);
}

function sourceUrls(source) {
  return String(source).match(/https?:\/\/[^\s)'"]+/gi) || [];
}

function isSeascapeHost(url) {
  try {
    const host = new URL(url).hostname.toLowerCase();
    return host === "seascape-vacations.com" || host === "www.seascape-vacations.com";
  } catch {
    return false;
  }
}

function seascapeSourceUrls(source) {
  return sourceUrls(source).filter(isSeascapeHost);
}

function sourceMatchesGeneratedPermalink(source, file, root = DEFAULT_ROOT) {
  const permalink = readPermalink(file, root);
  if (!permalinkHasGeneratedSlug(permalink)) {
    return false;
  }
  const pattern = generatedRoutePattern(permalink);
  return seascapeSourceUrls(source).some((url) => pattern.test(pathnameFromUrl(url)));
}

function pathnameFromUrl(url) {
  try {
    const parsed = new URL(url);
    let pathname = parsed.pathname || "/";
    if (pathname !== "/" && !pathname.endsWith("/")) {
      pathname += "/";
    }
    return pathname;
  } catch {
    return "";
  }
}

function sourceContainsPublicRoute(source, route) {
  if (!route) {
    return false;
  }
  const normalizedRoute = normalizePublicRoute(route);
  return seascapeSourceUrls(source).some((url) => pathnameFromUrl(url) === normalizedRoute);
}

function sourceNamesOwnStay(source, slug) {
  const token = String(slug || "").trim().toLowerCase();
  if (!token) {
    return false;
  }
  const needle = `/stays/${token}/`;
  return seascapeSourceUrls(source).some((url) => pathnameFromUrl(url).toLowerCase() === needle);
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

function assertUnderlyingSource(source, file, slug, index, root = DEFAULT_ROOT) {
  const permalink = readPermalink(file, root);
  if (permalinkHasGeneratedSlug(permalink) && !slug) {
    throw new Error(`${OWNER_FILE} row ${index} is missing slug`);
  }
  if (
    sourceNamesOwnGuide(source, file) ||
    sourceNamesOwnStay(source, slug) ||
    sourceContainsPublicRoute(source, publicRouteFromClaim(file, slug, root)) ||
    sourceMatchesGeneratedPermalink(source, file, root)
  ) {
    throw new Error(`${OWNER_FILE} row ${index} source is the same page that contains the claim`);
  }
  if (!IDENTIFIABLE_EVIDENCE.test(source)) {
    throw new Error(`${OWNER_FILE} row ${index} source must name identifiable evidence`);
  }
}

function loadSourcedClaims(claims, root = DEFAULT_ROOT) {
  if (claims == null) {
    throw new Error(`${OWNER_FILE} is missing`);
  }
  if (!Array.isArray(claims)) {
    throw new Error(`${OWNER_FILE} is missing`);
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
    assertUnderlyingSource(source, file, slug, index, root);
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
  return loadSourcedClaims(JSON.parse(fs.readFileSync(filePath, "utf8")), root);
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

function wordNumberValue(raw) {
  const parts = String(raw)
    .toLowerCase()
    .replace(/\s+percent$/, "")
    .split(/[\s-]+/)
    .filter(Boolean);
  if (parts.length === 1 && WORD_ONES[parts[0]] != null) {
    return WORD_ONES[parts[0]];
  }
  if (parts.length === 1 && WORD_TENS[parts[0]] != null) {
    return WORD_TENS[parts[0]];
  }
  if (parts.length === 2 && WORD_TENS[parts[0]] != null && WORD_ONES[parts[1]] != null) {
    return WORD_TENS[parts[0]] + WORD_ONES[parts[1]];
  }
  return Number.parseInt(String(raw).replace(/[^\d].*$/, ""), 10);
}

function sentenceAt(text, index) {
  const start = Math.max(0, text.lastIndexOf(".", index) + 1, text.lastIndexOf("!", index) + 1, text.lastIndexOf("?", index) + 1);
  const next = [text.indexOf(".", index), text.indexOf("!", index), text.indexOf("?", index)]
    .filter((value) => value >= 0)
    .sort((left, right) => left - right)[0];
  return text.slice(start, next == null ? text.length : next + 1).trim();
}

function isQuestionSentence(sentence) {
  return /\?$/.test(sentence) || /^(?:are|is|do|does|can|will|what|which|when|how|should)\b/i.test(sentence);
}

function collectMatches(text, pattern) {
  return [...String(text || "").matchAll(new RegExp(pattern.source, pattern.flags.includes("g") ? pattern.flags : `${pattern.flags}g`))].map(
    (match) => ({
      raw: match[0],
      index: match.index,
      end: match.index + match[0].length
    })
  );
}

function expandLeftToPriceNoun(text, start) {
  const prefix = text.slice(Math.max(0, start - 24), start);
  const noun = prefix.match(/\b(?:rates?|savings)\s+$/i);
  return noun ? start - noun[0].length : start;
}

function typedHit(kind, subject, value, match, excerpt, extra = {}) {
  return {
    kind,
    subject,
    value,
    match,
    excerpt,
    ...extra
  };
}

function parsePercentHits(stripped) {
  const percents = [
    ...collectMatches(stripped, DIGIT_PERCENT).map((token) => ({
      ...token,
      value: token.raw.replace(/\s+/g, "")
    })),
    ...collectMatches(stripped, WORD_PERCENT).map((token) => ({
      ...token,
      value: `${wordNumberValue(token.raw)}%`
    }))
  ];
  const hits = [];
  const seen = new Set();

  for (const percent of percents) {
    const after = stripped.slice(percent.end, percent.end + 16);
    const before = stripped.slice(Math.max(0, percent.index - 80), percent.index);
    if (/^\s*of\b/i.test(after)) {
      continue;
    }

    let spanStart = percent.index;
    let spanEnd = percent.end;
    let subject = "";

    const afterMatch = after.match(AFTER_PERCENT);
    if (afterMatch) {
      spanEnd = percent.end + afterMatch[0].length;
      subject = afterMatch[0].trim().toLowerCase();
    }

    const save = [...before.matchAll(new RegExp(SAVE_BEFORE.source, "gi"))].pop();
    const saveDistance = save ? before.length - save.index : Infinity;
    if (save && saveDistance <= 32 && !/save our homes/i.test(before.slice(save.index))) {
      spanStart = percent.index - saveDistance;
      subject = subject ? `${save[0].toLowerCase()}|${subject}` : save[0].toLowerCase();
    } else if (DIFFERENCE_BEFORE.test(before) && /or more/i.test(after)) {
      const diffAt = before.toLowerCase().lastIndexOf("difference");
      spanStart = percent.index - (before.length - diffAt);
      spanEnd = Math.max(spanEnd, percent.end + (after.match(/^\s*or more/i) || [""])[0].length);
      subject = subject ? `difference|${subject}` : "difference";
    } else if (!afterMatch) {
      continue;
    }

    if (/\b(?:drop|savings\s*:)/i.test(subject)) {
      spanStart = expandLeftToPriceNoun(stripped, spanStart);
    }
    const match = stripped.slice(spanStart, spanEnd).replace(/\s+/g, " ").trim();
    const key = `${spanStart}:${match}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    hits.push(
      typedHit(
        KIND_PERCENT,
        subject,
        percent.value,
        match,
        stripped.slice(Math.max(0, spanStart - 120), spanEnd + 80)
      )
    );
  }
  return hits;
}

function wordsBetween(text, start, end) {
  return text.slice(start, end).trim().split(/\s+/).filter(Boolean).length;
}

function allowedGap(text, start, end) {
  const gap = text.slice(start, end);
  if (/[-_/]/.test(gap)) {
    return false;
  }
  const trimmed = gap.trim();
  if (!trimmed) {
    return true;
  }
  return /^(?:the|a|an|available|monthly|nightly|overall|island|beachfront|direct)$/i.test(trimmed);
}

function parseQualitativeHits(stripped) {
  const nouns = collectMatches(stripped, PRICE_NOUN);
  const adjs = collectMatches(stripped, QUALITATIVE_ADJ);
  const avoids = collectMatches(stripped, AVOIDANCE);
  const avoidNouns = collectMatches(stripped, AVOIDANCE_NOUN);
  const hits = [];
  const seen = new Set();

  function add(matchStart, matchEnd, subject, value) {
    const sentence = sentenceAt(stripped, matchStart);
    if (isQuestionSentence(sentence) || /\bdoes not\b|\bnot establish\b/i.test(sentence)) {
      return;
    }
    const match = stripped.slice(matchStart, matchEnd).replace(/\s+/g, " ").trim();
    const key = `${matchStart}:${match.toLowerCase()}`;
    if (!match || seen.has(key)) {
      return;
    }
    seen.add(key);
    hits.push(
      typedHit(
        KIND_QUALITATIVE,
        subject,
        value,
        match,
        stripped.slice(Math.max(0, matchStart - 120), matchEnd + 80)
      )
    );
  }

  for (const noun of nouns) {
    const leftAdj = adjs.find((entry) => entry.end <= noun.index && allowedGap(stripped, entry.end, noun.index));
    const rightAdj = adjs.find((entry) => entry.index >= noun.end && allowedGap(stripped, noun.end, entry.index) && wordsBetween(stripped, noun.end, entry.index) <= 1);
    const partner = leftAdj || rightAdj;
    if (!partner) {
      continue;
    }
    if (/^savings$/i.test(noun.raw)) {
      const between = stripped.slice(partner.end, noun.index).trim();
      if (!/^(?:typical|direct)$/i.test(partner.raw) || !/^(?:direct)?$/i.test(between)) {
        continue;
      }
    }
    if (/^premium$/i.test(partner.raw) && !/^rates?|pricing|price$/i.test(noun.raw)) {
      continue;
    }
    add(
      Math.min(partner.index, noun.index),
      Math.max(partner.end, noun.end),
      noun.raw.toLowerCase(),
      stripped.slice(Math.min(partner.index, noun.index), Math.max(partner.end, noun.end)).replace(/\s+/g, " ").trim().toLowerCase()
    );
  }

  for (const noun of avoidNouns) {
    const avoid = avoids.find((entry) => entry.end <= noun.index && wordsBetween(stripped, entry.end, noun.index) <= 3);
    if (!avoid) {
      continue;
    }
    add(avoid.index, noun.end, noun.raw.toLowerCase(), stripped.slice(avoid.index, noun.end).replace(/\s+/g, " ").trim().toLowerCase());
  }

  return hits;
}

function parseClaimHits(text) {
  const stripped = stripMarkup(text);
  return [...parsePercentHits(stripped), ...parseQualitativeHits(stripped)];
}

function scanSavingsHitsInText(text, file) {
  return parseClaimHits(text)
    .filter((hit) => hit.kind === KIND_PERCENT || /savings/i.test(hit.match))
    .map((hit) => ({
      ...hit,
      file
    }));
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

function coversHit(claim, hit, now = new Date()) {
  if (isExpired(claim, now)) {
    return false;
  }
  if (hit.file && claim.file && claim.file !== hit.file) {
    return false;
  }
  if (hit.slug && claim.slug && claim.slug !== hit.slug) {
    return false;
  }
  const quote = claim.quote.toLowerCase();
  const needle = String(hit.match || hit.value || "").toLowerCase();
  const excerpt = String(hit.excerpt || "").toLowerCase();
  if (!needle) {
    return false;
  }
  return (excerpt ? excerpt.includes(quote) : true) && quote.includes(needle);
}

function coversSavingsHit(claim, hit, now = new Date()) {
  return coversHit(claim, hit, now);
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
  return parseClaimHits(text).filter((hit) => hit.kind === KIND_QUALITATIVE && !/\bsavings\b/i.test(hit.match));
}

function coversPriceAdvantageHit(claim, slug, hit, now = new Date()) {
  const record = typeof hit === "string" ? { match: hit, slug } : { ...hit, slug: hit.slug || slug };
  return coversHit(claim, record, now);
}

function visibleRecordText(page) {
  const parts = [];
  function walk(value, key) {
    if (typeof value === "string") {
      if (key === "slug" || key === "file" || key === "pageUrl" || key === "bookingUrl" || key === "href" || key === "image") {
        return;
      }
      parts.push(value);
      return;
    }
    if (Array.isArray(value)) {
      value.forEach((entry) => walk(entry));
      return;
    }
    if (value && typeof value === "object") {
      for (const [childKey, child] of Object.entries(value)) {
        walk(child, childKey);
      }
    }
  }
  walk(page);
  return parts.join("\n");
}

function unsourcedPriceAdvantages(records, claims, now = new Date()) {
  if (!Array.isArray(records) || records.length === 0) {
    throw new Error(`${OWNER_FILE} stay records are missing`);
  }
  const loaded = loadSourcedClaims(claims);
  const missing = [];
  for (const page of records) {
    const text = visibleRecordText(page);
    const slug = page && typeof page.slug === "string" ? page.slug : "";
    for (const hit of priceAdvantageHits(text)) {
      if (!loaded.some((claim) => coversPriceAdvantageHit(claim, slug, hit, now))) {
        missing.push({
          slug,
          match: hit.match,
          kind: hit.kind,
          subject: hit.subject,
          value: hit.value
        });
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
  IDENTIFIABLE_EVIDENCE,
  KIND_PERCENT,
  KIND_QUALITATIVE,
  loadSourcedClaims,
  readSourcedClaims,
  parseClaimHits,
  scanSavingsHitsInText,
  scanSrcSavingsHits,
  unsourcedSavingsHits,
  assertSavingsSourced,
  assertLiveQuotesPresent,
  priceAdvantageHits,
  unsourcedPriceAdvantages,
  assertNoUnsourcedPriceAdvantages
};
