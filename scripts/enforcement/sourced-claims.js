const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const OWNER_FILE = "src/_data/sourcedClaims.json";
const BASELINE_FILE = "src/_data/claimCandidateBaseline.json";
const NON_CLAIM_FILE = BASELINE_FILE;
const STAY_BASELINE_FILE = "src/_data/stayNumberBaseline.json";
const BASELINE_TAGS = new Set(["non-claim", "suspected-claim"]);
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
const PRICE_NOUN = /\b(?:rates?|pric(?:e|es|ing)|markups?|premiums?|discounts?|values?|savings|totals?|math|costs?)\b/gi;
const QUALITATIVE_ADJ = /\b(?:better|best|lower|higher|cheaper|lowest|highest|deeper|deepest|stronger|priciest|typical|premium|far better)\b/gi;
const MAGNITUDE_ADJ = /\b(?:significant|substantial|considerable|major|large|huge|meaningful)\b/gi;
const RELATIONAL = /\b(?:below|above|under)\b/gi;
const DISCOUNT_NOUN = /^discounts?$/i;
const AVOIDANCE = /\b(?:skip|avoid|beat)\b/gi;
const AVOIDANCE_NOUN = /\b(?:markup|premium|platform fees|extra fees)\b/gi;
const PREMIUM_NOUN = /^(?:premiums?|markups?)$/i;
const PREMIUM_MODIFIER = /\b(?:beachfront|waterfront|address|island|on-island|nightly)\b/gi;
const FEE_COUNT = /\b(?:fewer|less|more)\b/gi;
const KEEP = /\bkeeps?\b/gi;
const OUT = /\bout\b/gi;
const COST_VERB = /\b(?:costs?|priced|runs|pays?|paid|paying)\b/gi;
const COST_COMPARATIVE = /\b(?:less|more|cheaper|lower|higher)\b/gi;
const PAY_VERB = /^(?:pays?|paid|paying)$/i;
const PAY_UP = /\bpay(?:s|ing|ed)?\s+up\b/gi;
const SAVE_VERB = /\bsave[sd]?\b/gi;
const SAVE_MONEY_CONTEXT = /^(?:\s+(?:per\s+(?:night|stay)|money|dollars?|versus|vs\.?|on\s+(?:the\s+)?(?:same\s+)?(?:(?:\w+[-\s])?(?:dates?|nights?|stays?|booking|weeks?))|[%$])|\s*[.!?;]|\s*$)/i;
const REDUCE_VERB = /\b(?:flatten|cut|reduce)\b/gi;
const IMPLICIT_PRICE_ADJ = /\b(?:pric(?:ey|iest)|affordable|expensive|inexpensive|cheapest|cheaper)\b(?!-)/gi;
const IMPLICIT_CUE = /\b(?:compared|than|versus|vs\.?|option|choice)\b/gi;
const INTENSIFIED_RELATIONAL = /\b(?:well|far|comfortably)\s+(?:below|above|under)\b/gi;
const COPULA_CHEAPER = /\b(?:it(?:'s|\s+is)|they(?:'re|\s+are)|this\s+is|that\s+is)\s+cheaper\b/gi;
const WITHOUT = /\bwithout\b/gi;
const PARITY = /\b(?:same|similar)\b/gi;
const PARITY_NOUN = /\b(?:rates?|pric(?:e|es|ing)|spend|cost)\b/gi;
const KIND_PERCENT = "percent-comparative";
const KIND_QUALITATIVE = "qualitative-price-advantage";
const KIND_CANDIDATE = "price-cue-candidate";
const PRICE_TERM = /\b(?:prices?|pricing|costs?|fees?|rates?)\b/gi;
const COMPARATIVE_CUE = /\b(?:less|more|lower|higher|cheaper|lowest|highest|better|best|worse|fewer|below|above|under|over|reduced|discount(?:s|ed)?|deeper|stronger|priciest|expensive|affordable|inexpensive|cheapest)\b/gi;
const QUANTITY_CUE = /\b(?:fraction|half|third|quarter|double|twice|portion|share|dozen|score|zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|\d+(?:\.\d+)?)\b/gi;
const PERCENT_CUE = /\d+(?:\s*[-–]\s*\d+)?\s*%|\bpercent\b/gi;
const NEGATION_CUE = /\b(?:without|free|waived|included)\b|\bno(?:\s+extra)?(?:\s+(?:fees?|costs?|charges?))?\b/gi;
const PARITY_CUE = /\b(?:same|similar|equal|matching|parity)\b/gi;
const CUE_PATTERNS = [COMPARATIVE_CUE, QUANTITY_CUE, PERCENT_CUE, NEGATION_CUE, PARITY_CUE];

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

const PUBLIC_TEXT_ATTR = /\b(?:alt|aria-label|placeholder)\s*=\s*(["'])((?:\\.|(?!\1)[\s\S])*?)\1/gi;

function publicAttributeCopy(text) {
  return [...String(text || "").matchAll(PUBLIC_TEXT_ATTR)]
    .map((match) => decodeEntities(match[2]).replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .join(". ");
}

function stripMarkup(text) {
  return decodeEntities(text)
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ");
}

function normalizeSentence(text) {
  return String(text || "").replace(/\s+/g, " ").trim().toLowerCase();
}

function sentenceHash(text) {
  return crypto.createHash("sha256").update(normalizeSentence(text)).digest("hex");
}

function isSourcePathLiteral(value) {
  return /\.(?:njk|html|js|json|css|md|txt)(?:#.*)?$/i.test(value) || /^(?:partials|layouts|macros)\//.test(value);
}

function isNonCopySentence(sentence) {
  const text = String(sentence || "").trim();
  return /^(?:https?:\/\/|(?:www\.)?[\w.-]*\/)/i.test(text) || /^[\w.-]+\/[\w./-]+$/.test(text);
}

function quotedTemplateLiterals(text) {
  const source = String(text || "");
  const parts = [];
  let previousEnd = 0;
  for (const match of source.matchAll(/(["'`])((?:\\.|(?!\1)[\s\S])*?)\1/g)) {
    const value = match[2].replace(/\\(["'`])/g, "$1");
    if (parts.length && /^\s*[+~]\s*$/.test(source.slice(previousEnd, match.index))) {
      parts[parts.length - 1] += value;
    } else {
      parts.push(value);
    }
    previousEnd = match.index + match[0].length;
  }
  return parts
    .map((value) => value.trim())
    .filter((value) => value && !isSourcePathLiteral(value))
    .join(". ");
}

const PUBLIC_FRONTMATTER_KEY =
  /^(?:title|pageTitle|description|pageDescription|metaDescription|ogDescription|twitterDescription|seoTitle|seoDescription)$/i;

function publicFrontmatterCopy(text) {
  const block = String(text || "").match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!block) {
    return "";
  }
  const lines = block[1].split(/\r?\n/);
  const parts = [];
  for (let index = 0; index < lines.length; index += 1) {
    const match = lines[index].match(/^([A-Za-z][A-Za-z0-9_]*)\s*:\s*(.*)$/);
    if (!match || !PUBLIC_FRONTMATTER_KEY.test(match[1])) {
      continue;
    }
    let value = String(match[2] || "").trim();
    if (/^[|>][-+]?$/.test(value)) {
      const collected = [];
      while (index + 1 < lines.length && /^\s+/.test(lines[index + 1])) {
        index += 1;
        collected.push(lines[index].replace(/^\s+/, ""));
      }
      value = collected.join(" ").trim();
    } else {
      const quoted = value.match(/^["']([\s\S]*)["']$/);
      if (quoted) {
        value = quoted[1].trim();
      }
    }
    if (value) {
      parts.push(value);
    }
  }
  return parts.join(". ");
}

const PUBLIC_META_NAME =
  /^(?:description|og:description|twitter:description|og:title|twitter:title)$/i;

function htmlAttr(tag, name) {
  const quoted = String(tag || "").match(
    new RegExp(String.raw`\b${name}\s*=\s*(["'])((?:\\.|(?!\1)[\s\S])*?)\1`, "i")
  );
  if (quoted) {
    return quoted[2];
  }
  const unquoted = String(tag || "").match(
    new RegExp(String.raw`\b${name}\s*=\s*([^\s>]+)`, "i")
  );
  return (unquoted && unquoted[1]) || "";
}

function publicHtmlMetaCopy(text) {
  const source = String(text || "");
  const parts = [];
  const title = source.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (title) {
    const value = stripMarkup(title[1]).trim();
    if (value) {
      parts.push(value);
    }
  }
  for (const match of source.matchAll(/<meta\b[^>]*>/gi)) {
    const tag = match[0];
    const name = htmlAttr(tag, "name") || htmlAttr(tag, "property");
    if (!PUBLIC_META_NAME.test(name)) {
      continue;
    }
    const content = htmlAttr(tag, "content");
    if (content && content.trim()) {
      parts.push(content.trim());
    }
  }
  return parts.join(". ");
}

function walkJsonStrings(value, visit) {
  if (typeof value === "string") {
    visit(value);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((entry) => walkJsonStrings(entry, visit));
    return;
  }
  if (value && typeof value === "object") {
    for (const child of Object.values(value)) {
      walkJsonStrings(child, visit);
    }
  }
}

function jsonLdCopy(text) {
  const parts = [];
  for (const match of String(text || "").matchAll(/<script\b[^>]*\btype\s*=\s*(["']?)application\/ld\+json(?:;[^"'>]*)?\1[^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      walkJsonStrings(JSON.parse(match[2]), (value) => parts.push(value));
    } catch {
      parts.push(quotedTemplateLiterals(match[2]));
    }
  }
  return parts.join(". ");
}

function guestCopyText(text) {
  const source = String(text || "");
  const frontmatter = publicFrontmatterCopy(source);
  const htmlMeta = publicHtmlMetaCopy(source);
  const structured = jsonLdCopy(source);
  const body = source
    .replace(/^---[\s\S]*?---/, " ")
    .replace(/<title[\s\S]*?<\/title>/gi, " ")
    .replace(/<meta\b[^>]*>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/\{#[\s\S]*?#\}/g, " ")
    .replace(/\{%([\s\S]*?)%\}/g, (_, inner) => ` ${quotedTemplateLiterals(inner)} `)
    .replace(/\{\{([\s\S]*?)\}\}/g, (_, inner) => ` ${quotedTemplateLiterals(inner)} `);
  const attributes = publicAttributeCopy(body);
  return [frontmatter, htmlMeta, attributes, body, structured].filter(Boolean).join(". ");
}

const SENTENCE_END = /(?<!\bvs)\.|[!?]/gi;

function splitGuestSentences(text) {
  return stripMarkup(guestCopyText(text))
    .split(SENTENCE_END)
    .map((sentence) => sentence.replace(/\s+/g, " ").trim())
    .filter((sentence) => sentence.length >= 8 && !isNonCopySentence(sentence));
}

function collectPriceClaimCandidates(text) {
  const hits = [];
  const seen = new Set();
  for (const sentence of splitGuestSentences(text)) {
    const prices = collectMatches(sentence, PRICE_TERM);
    if (prices.length === 0) {
      continue;
    }
    const cues = CUE_PATTERNS.flatMap((pattern) => collectMatches(sentence, pattern));
    if (cues.length === 0) {
      continue;
    }
    const start = Math.min(...prices.map((token) => token.index), ...cues.map((token) => token.index));
    const end = Math.max(...prices.map((token) => token.end), ...cues.map((token) => token.end));
    const match = sentence.slice(start, end).replace(/\s+/g, " ").trim();
    const key = sentenceHash(sentence);
    if (seen.has(key) || !match) {
      continue;
    }
    seen.add(key);
    hits.push(
      typedHit(
        KIND_CANDIDATE,
        "price-cue",
        match,
        match,
        sentence
      )
    );
  }
  return hits;
}

function loadClaimBaseline(root = DEFAULT_ROOT) {
  const filePath = path.join(root, BASELINE_FILE);
  if (!fs.existsSync(filePath)) {
    throw new Error(`${BASELINE_FILE} is missing`);
  }
  const rows = JSON.parse(fs.readFileSync(filePath, "utf8"));
  if (!Array.isArray(rows.sentences)) {
    throw new Error(`${BASELINE_FILE} is missing sentences`);
  }
  const hashes = new Set();
  for (const row of rows.sentences) {
    if (!row || row.hash !== sentenceHash(row.sentence)) {
      throw new Error(`${BASELINE_FILE} hash does not match sentence`);
    }
    if (!BASELINE_TAGS.has(row.tag) || !String(row.reason || "").trim()) {
      throw new Error(`${BASELINE_FILE} row is missing a reviewed tag`);
    }
    hashes.add(row.hash);
  }
  return { rows: rows.sentences, hashes };
}

let claimBaseline;

function allowedNonClaimSentence(sentence, root = DEFAULT_ROOT) {
  claimBaseline = claimBaseline || loadClaimBaseline(root);
  return claimBaseline.hashes.has(sentenceHash(sentence));
}

function assertClaimBaselineRatchet(currentRows, previousRows) {
  const previous = new Map((previousRows || []).map((row) => [row.hash, row]));
  for (const row of currentRows || []) {
    if (!previous.has(row.hash)) {
      throw new Error(
        `${BASELINE_FILE} can only shrink; new hash ${row.hash} needs a sourcedClaims.json row or a reviewed tag change on an existing row`
      );
    }
  }
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
  const relative = path.relative(root, file).split(path.sep).join("/");
  return (
    relative !== OWNER_FILE &&
    relative !== BASELINE_FILE &&
    relative !== STAY_BASELINE_FILE
  );
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

function isSentenceEndAt(text, index) {
  const boundary = new RegExp(SENTENCE_END.source, "iy");
  boundary.lastIndex = index;
  return boundary.test(text);
}

function sentenceStartAt(text, index) {
  let period = text.lastIndexOf(".", index);
  while (period >= 0 && !isSentenceEndAt(text, period)) {
    period = text.lastIndexOf(".", period - 1);
  }
  return Math.max(0, period + 1, text.lastIndexOf("!", index) + 1, text.lastIndexOf("?", index) + 1);
}

function sentenceAt(text, index) {
  const start = sentenceStartAt(text, index);
  const boundary = new RegExp(SENTENCE_END.source, SENTENCE_END.flags);
  boundary.lastIndex = index;
  const next = boundary.exec(text);
  return text.slice(start, next ? next.index + 1 : text.length).trim();
}

function crossesSentence(text, start, end) {
  const boundary = new RegExp(SENTENCE_END.source, SENTENCE_END.flags);
  boundary.lastIndex = start;
  const next = boundary.exec(String(text || ""));
  return Boolean(next && next.index < end);
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
    const saveAfter = save ? save.index + save[0].length : 0;
    const saveDistance = save ? before.length - saveAfter : Infinity;
    const saveSameSentence = save && !crossesSentence(before, save.index, before.length);
    if (
      save &&
      saveSameSentence &&
      saveDistance <= 32 &&
      !/save our homes/i.test(before.slice(save.index))
    ) {
      spanStart = percent.index - (before.length - save.index);
      subject = subject ? `${save[0].toLowerCase()}|${subject}` : save[0].toLowerCase();
    } else if (DIFFERENCE_BEFORE.test(before)) {
      const diffAt = before.toLowerCase().lastIndexOf("difference");
      if (diffAt < 0 || crossesSentence(before, diffAt, before.length)) {
        if (!afterMatch) {
          continue;
        }
      } else {
        spanStart = percent.index - (before.length - diffAt);
        spanEnd = Math.max(spanEnd, percent.end + (after.match(/^\s*or more/i) || [""])[0].length);
        subject = subject ? `difference|${subject}` : "difference";
      }
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
  if (!trimmed || /^[-–—]$/.test(trimmed)) {
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
    const rightGap = rightAdj ? stripped.slice(noun.end, rightAdj.index) : "";
    const rightOk =
      rightAdj &&
      rightAdj.index >= noun.end &&
      !crossesSentence(stripped, noun.end, rightAdj.index) &&
      ((allowedGap(stripped, noun.end, rightAdj.index) && wordsBetween(stripped, noun.end, rightAdj.index) <= 1) ||
        /^\s+(?:vs\.?|versus)\s+(?:[\w'-]+\s+){1,4}(?:is|are|was|were)\s+$/i.test(rightGap));
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

  const reducers = collectMatches(stripped, REDUCE_VERB);
  let reducerI = 0;
  for (const noun of nouns) {
    while (reducerI + 1 < reducers.length && reducers[reducerI + 1].end <= noun.index) {
      reducerI += 1;
    }
    const reducer = reducerI < reducers.length && reducers[reducerI].end <= noun.index ? reducers[reducerI] : null;
    if (
      !reducer ||
      wordsBetween(stripped, reducer.end, noun.index) > 3 ||
      !allowedGap(stripped, reducer.end, noun.index)
    ) {
      continue;
    }
    add(
      reducer.index,
      noun.end,
      noun.raw.toLowerCase(),
      stripped.slice(reducer.index, noun.end).replace(/\s+/g, " ").trim().toLowerCase()
    );
  }

  const magnitudes = collectMatches(stripped, MAGNITUDE_ADJ);
  let magnitudeLeft = -1;
  for (const noun of nouns) {
    if (!DISCOUNT_NOUN.test(noun.raw)) {
      continue;
    }
    while (magnitudeLeft + 1 < magnitudes.length && magnitudes[magnitudeLeft + 1].end <= noun.index) {
      magnitudeLeft += 1;
    }
    const magnitude = magnitudeLeft >= 0 ? magnitudes[magnitudeLeft] : null;
    if (!magnitude || magnitude.end > noun.index || !allowedGap(stripped, magnitude.end, noun.index)) {
      continue;
    }
    add(
      magnitude.index,
      noun.end,
      noun.raw.toLowerCase(),
      stripped.slice(magnitude.index, noun.end).replace(/\s+/g, " ").trim().toLowerCase()
    );
  }

  const relationals = collectMatches(stripped, RELATIONAL);
  let relationalI = 0;
  for (const noun of nouns) {
    while (relationalI < relationals.length && relationals[relationalI].index < noun.end) {
      relationalI += 1;
    }
    const relational = relationalI < relationals.length ? relationals[relationalI] : null;
    if (
      !relational ||
      !allowedGap(stripped, noun.end, relational.index) ||
      wordsBetween(stripped, noun.end, relational.index) > 1
    ) {
      continue;
    }
    add(
      noun.index,
      relational.end,
      noun.raw.toLowerCase(),
      stripped.slice(noun.index, relational.end).replace(/\s+/g, " ").trim().toLowerCase()
    );
  }

  const premiumModifiers = collectMatches(stripped, PREMIUM_MODIFIER);
  let premiumModLeft = -1;
  for (const noun of nouns) {
    if (!PREMIUM_NOUN.test(noun.raw)) {
      continue;
    }
    while (premiumModLeft + 1 < premiumModifiers.length && premiumModifiers[premiumModLeft + 1].end <= noun.index) {
      premiumModLeft += 1;
    }
    if (premiumModLeft < 0) {
      continue;
    }
    let start = null;
    for (let i = premiumModLeft; i >= 0; i -= 1) {
      const modifier = premiumModifiers[i];
      if (modifier.end > noun.index || !allowedGap(stripped, modifier.end, noun.index)) {
        break;
      }
      if (start != null && !allowedGap(stripped, modifier.end, start)) {
        break;
      }
      start = modifier.index;
    }
    if (start == null) {
      continue;
    }
    add(
      start,
      noun.end,
      noun.raw.toLowerCase(),
      stripped.slice(start, noun.end).replace(/\s+/g, " ").trim().toLowerCase()
    );
  }

  const feeCounts = collectMatches(stripped, FEE_COUNT);
  let feeCountLeft = -1;
  for (const noun of avoidNouns) {
    while (feeCountLeft + 1 < feeCounts.length && feeCounts[feeCountLeft + 1].end <= noun.index) {
      feeCountLeft += 1;
    }
    const count = feeCountLeft >= 0 ? feeCounts[feeCountLeft] : null;
    if (
      !count ||
      count.end > noun.index ||
      !allowedGap(stripped, count.end, noun.index) ||
      crossesSentence(stripped, count.end, noun.index)
    ) {
      continue;
    }
    add(
      count.index,
      noun.end,
      noun.raw.toLowerCase(),
      stripped.slice(count.index, noun.end).replace(/\s+/g, " ").trim().toLowerCase()
    );
  }

  const keeps = collectMatches(stripped, KEEP);
  const outs = collectMatches(stripped, OUT);
  let keepLeft = -1;
  let outRight = 0;
  for (const noun of avoidNouns) {
    while (keepLeft + 1 < keeps.length && keeps[keepLeft + 1].end <= noun.index) {
      keepLeft += 1;
    }
    while (outRight < outs.length && outs[outRight].index < noun.end) {
      outRight += 1;
    }
    const keep = keepLeft >= 0 ? keeps[keepLeft] : null;
    const out = outRight < outs.length ? outs[outRight] : null;
    if (
      !keep ||
      !out ||
      keep.end > noun.index ||
      out.index < noun.end ||
      wordsBetween(stripped, keep.end, noun.index) > 3 ||
      wordsBetween(stripped, noun.end, out.index) > 2 ||
      crossesSentence(stripped, keep.index, out.end)
    ) {
      continue;
    }
    add(
      keep.index,
      out.end,
      noun.raw.toLowerCase(),
      stripped.slice(keep.index, out.end).replace(/\s+/g, " ").trim().toLowerCase()
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
      wordsBetween(stripped, verb.end, comparative.index) > (PAY_VERB.test(verb.raw) ? 0 : 2) ||
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

  const priceNouns = collectMatches(stripped, PRICE_NOUN);
  let withoutPriceI = 0;
  for (const noun of priceNouns) {
    while (withoutPriceI + 1 < withouts.length && withouts[withoutPriceI + 1].end <= noun.index) {
      withoutPriceI += 1;
    }
    const without = withoutPriceI < withouts.length && withouts[withoutPriceI].end <= noun.index ? withouts[withoutPriceI] : null;
    if (
      !without ||
      wordsBetween(stripped, without.end, noun.index) > 4 ||
      crossesSentence(stripped, without.end, noun.index) ||
      !allowedWithoutPriceGap(stripped, without.end, noun.index)
    ) {
      continue;
    }
    add(without.index, noun.end, noun.raw.toLowerCase(), stripped.slice(without.index, noun.end).replace(/\s+/g, " ").trim().toLowerCase());
  }

  const parities = collectMatches(stripped, PARITY);
  const parityNouns = collectMatches(stripped, PARITY_NOUN);
  let parityNounRight = 0;
  for (const parity of parities) {
    while (parityNounRight < parityNouns.length && parityNouns[parityNounRight].index < parity.end) {
      parityNounRight += 1;
    }
    const noun = parityNounRight < parityNouns.length ? parityNouns[parityNounRight] : null;
    if (
      !noun ||
      !allowedGap(stripped, parity.end, noun.index) ||
      wordsBetween(stripped, parity.end, noun.index) > 2 ||
      crossesSentence(stripped, parity.end, noun.index)
    ) {
      continue;
    }
    add(
      parity.index,
      noun.end,
      noun.raw.toLowerCase(),
      stripped.slice(parity.index, noun.end).replace(/\s+/g, " ").trim().toLowerCase()
    );
  }

  for (const save of collectMatches(stripped, SAVE_VERB)) {
    if (!SAVE_MONEY_CONTEXT.test(stripped.slice(save.end))) {
      continue;
    }
    if (/save our homes/i.test(stripped.slice(save.index, save.end + 20))) {
      continue;
    }
    add(save.index, save.end, "save", save.raw.toLowerCase());
  }

  for (const payUp of collectMatches(stripped, PAY_UP)) {
    add(payUp.index, payUp.end, "pay-up", payUp.raw.replace(/\s+/g, " ").trim().toLowerCase());
  }

  const implicitAdjs = collectMatches(stripped, IMPLICIT_PRICE_ADJ);
  const implicitCues = collectMatches(stripped, IMPLICIT_CUE);
  let cueLeft = -1;
  let cueRight = 0;
  for (const adj of implicitAdjs) {
    while (cueLeft + 1 < implicitCues.length && implicitCues[cueLeft + 1].end <= adj.index) {
      cueLeft += 1;
    }
    while (cueRight < implicitCues.length && implicitCues[cueRight].index < adj.end) {
      cueRight += 1;
    }
    const leftCue = cueLeft >= 0 ? implicitCues[cueLeft] : null;
    const rightCue = cueRight < implicitCues.length ? implicitCues[cueRight] : null;
    const leftOk =
      leftCue &&
      leftCue.end <= adj.index &&
      wordsBetween(stripped, leftCue.end, adj.index) <= 3 &&
      !crossesSentence(stripped, leftCue.end, adj.index);
    const rightOk =
      rightCue &&
      rightCue.index >= adj.end &&
      wordsBetween(stripped, adj.end, rightCue.index) <= 3 &&
      !crossesSentence(stripped, adj.end, rightCue.index);
    const partner = leftOk ? leftCue : rightOk ? rightCue : null;
    if (!partner) {
      continue;
    }
    add(
      Math.min(partner.index, adj.index),
      Math.max(partner.end, adj.end),
      adj.raw.toLowerCase(),
      stripped.slice(Math.min(partner.index, adj.index), Math.max(partner.end, adj.end)).replace(/\s+/g, " ").trim().toLowerCase()
    );
  }

  for (const relational of collectMatches(stripped, INTENSIFIED_RELATIONAL)) {
    add(
      relational.index,
      relational.end,
      "relational",
      relational.raw.replace(/\s+/g, " ").trim().toLowerCase()
    );
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

function allowedWithoutPriceGap(text, start, end) {
  const gap = text.slice(start, end).trim();
  if (!gap) {
    return true;
  }
  if (/[-_/]/.test(gap) || crossesSentence(text, start, end)) {
    return false;
  }
  return gap.split(/\s+/).every((word) =>
    /^(?:the|a|an|extra|those|any|added|these|paying|true|beachfront|waterfront|island|on-island|nightly|address)$/i.test(word)
  );
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

function scanStaySavingsHits(records) {
  const hits = [];
  for (const page of records || []) {
    if (!page || page.rehomeTo) {
      continue;
    }
    const slug = page.slug;
    walkRecordStrings(page, (text) => {
      hits.push(
        ...parseClaimHits(text)
          .filter((hit) => hit.kind === KIND_PERCENT || /savings/i.test(hit.match))
          .map((hit) => ({
            ...hit,
            slug
          }))
      );
    });
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
    if (relative === "src/_data/seoPages.json") {
      const pages = JSON.parse(fs.readFileSync(file, "utf8")).vacationer || [];
      hits.push(...scanStaySavingsHits(pages));
      continue;
    }
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
  return hits.filter((hit) => {
    if (allowedNonClaimSentence(hit.excerpt || hit.match)) {
      return false;
    }
    return !loaded.some((claim) => coversSavingsHit(claim, hit, now));
  });
}

function assertSavingsSourced(hits, claims, now = new Date()) {
  const missing = unsourcedSavingsHits(hits, claims, now);
  if (missing.length > 0) {
    throw new Error(
      `${OWNER_FILE} is missing a sourced-claim row for ${missing[0].match} in ${missing[0].file || missing[0].slug || "unknown-scope"}`
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
      if (
        key === "slug" ||
        key === "file" ||
        key === "pageUrl" ||
        key === "bookingUrl" ||
        key === "href" ||
        key === "image" ||
        key === "relatedStaySlugs" ||
        key === "matchingProperties" ||
        key === "src" ||
        key === "sourceUrl" ||
        key === "listingId" ||
        key === "id" ||
        key === "url" ||
        key === "booking_url"
      ) {
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
      const typed = priceAdvantageHits(text);
      const typedMatches = typed.map((hit) => String(hit.match || "").toLowerCase()).filter(Boolean);
      const hits = [
        ...typed,
        ...collectPriceClaimCandidates(text).filter((hit) => {
          const sentence = String(hit.excerpt || "").toLowerCase();
          return !typedMatches.some((match) => sentence.includes(match));
        })
      ];
      for (const hit of hits) {
        if (allowedNonClaimSentence(hit.excerpt || hit.match)) {
          continue;
        }
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

function scanStayClaimCandidates(records) {
  const hits = [];
  for (const page of records || []) {
    if (!page || page.rehomeTo) {
      continue;
    }
    const slug = page.slug;
    walkRecordStrings(page, (text) => {
      hits.push(
        ...collectPriceClaimCandidates(text).map((hit) => ({
          ...hit,
          slug
        }))
      );
    });
  }
  return hits;
}

function scanSrcClaimCandidates(root = DEFAULT_ROOT) {
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
    if (relative === "src/_data/seoPages.json") {
      const pages = JSON.parse(fs.readFileSync(file, "utf8")).vacationer || [];
      hits.push(...scanStayClaimCandidates(pages));
      continue;
    }
    if (relative === "src/_data/properties-fallback.json") {
      const records = JSON.parse(fs.readFileSync(file, "utf8"));
      for (const record of records || []) {
        walkRecordStrings(record, (text) => {
          hits.push(
            ...collectPriceClaimCandidates(text).map((hit) => ({
              ...hit,
              file: relative
            }))
          );
        });
      }
      continue;
    }
    if (relative === "src/_data/site.json") {
      const site = JSON.parse(fs.readFileSync(file, "utf8"));
      walkRecordStrings(site, (text) => {
        hits.push(
          ...collectPriceClaimCandidates(text).map((hit) => ({
            ...hit,
            file: relative
          }))
        );
      });
      continue;
    }
    if (relative.startsWith("src/_data/")) {
      continue;
    }
    hits.push(
      ...collectPriceClaimCandidates(fs.readFileSync(file, "utf8")).map((hit) => ({
        ...hit,
        file: relative
      }))
    );
  }
  return hits;
}

function unsourcedClaimCandidates(hits, claims, now = new Date()) {
  const loaded = loadSourcedClaims(claims);
  return hits.filter((hit) => {
    if (allowedNonClaimSentence(hit.excerpt || hit.match)) {
      return false;
    }
    return !loaded.some((claim) => coversHit(claim, hit, now));
  });
}

function assertClaimCandidatesCovered(hits, claims, now = new Date()) {
  const missing = unsourcedClaimCandidates(hits, claims, now);
  if (missing.length > 0) {
    throw new Error(
      `${OWNER_FILE} is missing a sourced-claim row or ${BASELINE_FILE} entry for ${missing[0].match} in ${missing[0].file || missing[0].slug || "unknown-scope"}`
    );
  }
}

module.exports = {
  OWNER_FILE,
  BASELINE_FILE,
  NON_CLAIM_FILE,
  STAY_BASELINE_FILE,
  assertClaimBaselineRatchet,
  loadClaimBaseline,
  IDENTIFIABLE_EVIDENCE,
  KIND_PERCENT,
  KIND_QUALITATIVE,
  KIND_CANDIDATE,
  coversHit,
  loadSourcedClaims,
  readSourcedClaims,
  parseClaimHits,
  collectPriceClaimCandidates,
  scanSavingsHitsInText,
  scanStaySavingsHits,
  scanSrcSavingsHits,
  scanStayClaimCandidates,
  scanSrcClaimCandidates,
  unsourcedSavingsHits,
  unsourcedClaimCandidates,
  assertSavingsSourced,
  assertClaimCandidatesCovered,
  assertLiveQuotesPresent,
  priceAdvantageHits,
  unsourcedPriceAdvantages,
  assertNoUnsourcedPriceAdvantages
};
