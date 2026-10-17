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
const PRICE_NOUN = /\b(?:rates?|pric(?:e|es|ing)|markups?|premiums?|discounts?|values?|savings|totals?)\b/gi;
const QUALITATIVE_ADJ = /\b(?:better|best|lower|higher|cheaper|lowest|highest|deeper|deepest|stronger|priciest|typical|premium|far better)\b/gi;
const AVOIDANCE = /\b(?:skip|avoid|beat)\b/gi;
const AVOIDANCE_NOUN = /\b(?:markup|premium|platform fees|extra fees)\b/gi;
const COST_VERB = /\b(?:costs?|priced|runs)\b/gi;
const COST_COMPARATIVE = /\b(?:less|more|cheaper|lower|higher)\b/gi;
const COPULA_CHEAPER = /\b(?:it(?:'s|\s+is)|they(?:'re|\s+are)|this\s+is|that\s+is)\s+cheaper\b/gi;
const WITHOUT = /\bwithout\b/gi;
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

function sentenceStartAt(text, index) {
  return Math.max(0, text.lastIndexOf(".", index) + 1, text.lastIndexOf("!", index) + 1, text.lastIndexOf("?", index) + 1);
}

function sentenceAt(text, index) {
  const start = sentenceStartAt(text, index);
  const next = [text.indexOf(".", index), text.indexOf("!", index), text.indexOf("?", index)]
    .filter((value) => value >= 0)
    .sort((left, right) => left - right)[0];
  return text.slice(start, next == null ? text.length : next + 1).trim();
}

function crossesSentence(text, start, end) {
  return /[.!?]/.test(String(text || "").slice(start, end));
}

function isNegatedSpan(text, matchStart) {
  const source = String(text || "");
  const beforeInSentence = source.slice(sentenceStartAt(source, matchStart), matchStart);
  if (/\b(?:does\s+not|do\s+not|doesn['’]t|don['’]t)\s+establish\b/i.test(beforeInSentence)) {
    return true;
  }
  const before = source.slice(Math.max(0, matchStart - 48), matchStart);
  return /\b(?:does\s+not|do\s+not|doesn['’]t|don['’]t)\s+$|\bnot\s+establish\s+$/i.test(before);
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
    const saveSameSentence = save && !crossesSentence(before, save.index, before.length);
    if (
      save &&
      saveSameSentence &&
      saveDistance <= 32 &&
      !/save our homes/i.test(before.slice(save.index))
    ) {
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
  if (/[_/]/.test(gap) || crossesSentence(text, start, end)) {
    return false;
  }
  const trimmed = gap.trim();
  if (!trimmed) {
    return true;
  }
  return trimmed.split(/\s+/).every((word) =>
    /^(?:the|a|an|available|monthly|nightly|overall|island|beachfront|direct|checkout|booking|is|are|was|were|[a-z]+(?:-[a-z]+)+)$/i.test(word)
  );
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
    if (isQuestionSentence(sentence) || isNegatedSpan(stripped, matchStart)) {
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

  let adjLeft = -1;
  let adjRight = 0;
  for (const noun of nouns) {
    while (adjLeft + 1 < adjs.length && adjs[adjLeft + 1].end <= noun.index) {
      adjLeft += 1;
    }
    while (adjRight < adjs.length && adjs[adjRight].index < noun.end) {
      adjRight += 1;
    }
    const leftAdj = adjLeft >= 0 ? adjs[adjLeft] : null;
    const rightAdj = adjRight < adjs.length ? adjs[adjRight] : null;
    const leftOk = leftAdj && leftAdj.end <= noun.index && allowedGap(stripped, leftAdj.end, noun.index);
    const rightOk =
      rightAdj &&
      rightAdj.index >= noun.end &&
      allowedGap(stripped, noun.end, rightAdj.index) &&
      wordsBetween(stripped, noun.end, rightAdj.index) <= 1;
    const partner = leftOk ? leftAdj : rightOk ? rightAdj : null;
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

  let avoidI = 0;
  for (const noun of avoidNouns) {
    while (avoidI + 1 < avoids.length && avoids[avoidI + 1].end <= noun.index) {
      avoidI += 1;
    }
    const avoid = avoidI < avoids.length && avoids[avoidI].end <= noun.index ? avoids[avoidI] : null;
    if (
      !avoid ||
      wordsBetween(stripped, avoid.end, noun.index) > 3 ||
      crossesSentence(stripped, avoid.end, noun.index)
    ) {
      continue;
    }
    add(avoid.index, noun.end, noun.raw.toLowerCase(), stripped.slice(avoid.index, noun.end).replace(/\s+/g, " ").trim().toLowerCase());
  }

  const costVerbs = collectMatches(stripped, COST_VERB);
  const costComparatives = collectMatches(stripped, COST_COMPARATIVE);
  let comparativeI = 0;
  for (const verb of costVerbs) {
    while (comparativeI < costComparatives.length && costComparatives[comparativeI].index < verb.end) {
      comparativeI += 1;
    }
    const comparative = comparativeI < costComparatives.length ? costComparatives[comparativeI] : null;
    if (
      !comparative ||
      wordsBetween(stripped, verb.end, comparative.index) > 2 ||
      crossesSentence(stripped, verb.end, comparative.index)
    ) {
      continue;
    }
    const sentence = sentenceAt(stripped, verb.index);
    if (/\b(?:assum(?:e|ing)|rather than|whether)\b/i.test(sentence)) {
      continue;
    }
    const adverb = stripped.slice(Math.max(0, verb.index - 16), verb.index).match(/\b(?:usually|typically|often|generally)\s+$/i);
    add(
      adverb ? verb.index - adverb[0].length : verb.index,
      comparative.end,
      "cost-comparative",
      stripped.slice(adverb ? verb.index - adverb[0].length : verb.index, comparative.end).replace(/\s+/g, " ").trim().toLowerCase()
    );
  }

  for (const cheaper of collectMatches(stripped, COPULA_CHEAPER)) {
    add(cheaper.index, cheaper.end, "cheaper", cheaper.raw.replace(/\s+/g, " ").trim().toLowerCase());
  }

  const withouts = collectMatches(stripped, WITHOUT);
  let withoutI = 0;
  for (const noun of avoidNouns) {
    while (withoutI + 1 < withouts.length && withouts[withoutI + 1].end <= noun.index) {
      withoutI += 1;
    }
    const without = withoutI < withouts.length && withouts[withoutI].end <= noun.index ? withouts[withoutI] : null;
    if (
      !without ||
      wordsBetween(stripped, without.end, noun.index) > 4 ||
      crossesSentence(stripped, without.end, noun.index) ||
      !allowedWithoutGap(stripped, without.end, noun.index)
    ) {
      continue;
    }
    add(without.index, noun.end, noun.raw.toLowerCase(), stripped.slice(without.index, noun.end).replace(/\s+/g, " ").trim().toLowerCase());
  }

  return hits;
}

function allowedWithoutGap(text, start, end) {
  const gap = text.slice(start, end).trim();
  if (!gap) {
    return true;
  }
  if (/[-_/]/.test(gap) || crossesSentence(text, start, end)) {
    return false;
  }
  return /^(?:the|a|an|extra|those|any|added|these)(?:\s+(?:the|a|an|extra|those|any|added|these))*$/i.test(gap);
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
  const claimFile = String(claim.file || "").trim();
  const claimSlug = String(claim.slug || "").trim();
  const hitFile = String(hit.file || "").trim();
  const hitSlug = String(hit.slug || "").trim();
  const fileScoped = Boolean(claimFile || hitFile);
  const slugScoped = Boolean(claimSlug || hitSlug);
  if (!fileScoped && !slugScoped) {
    return false;
  }
  if (fileScoped && (!claimFile || !hitFile || claimFile !== hitFile)) {
    return false;
  }
  if (slugScoped && (!claimSlug || !hitSlug || claimSlug !== hitSlug)) {
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

function walkRecordStrings(page, visit) {
  function walk(value, key) {
    if (typeof value === "string") {
      if (key === "slug" || key === "file" || key === "pageUrl" || key === "bookingUrl" || key === "href" || key === "image") {
        return;
      }
      visit(value);
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
}

function unsourcedPriceAdvantages(records, claims, now = new Date()) {
  if (!Array.isArray(records) || records.length === 0) {
    throw new Error(`${OWNER_FILE} stay records are missing`);
  }
  const loaded = loadSourcedClaims(claims);
  const missing = [];
  for (const page of records) {
    const slug = page && typeof page.slug === "string" ? page.slug : "";
    walkRecordStrings(page, (text) => {
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
    });
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
  coversHit,
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
