const { catalogHomeCountWord } = require("../enforcement/home-count-word");

const FEE_PASSAGE_INCLUDES = [
  "How our management fee works",
  "Seascape charges a share of your home's net rent, with a lower rate for homes that earn more.",
  "We quote your exact fee after looking at your home.",
  "listing on Airbnb, Vrbo, Google, our direct website and more",
  "tourism and sales taxes remitted for you"
];

const HEARD_ABOUT_INCLUDES = [
  'name="heard_about"',
  "How did you hear about us? (optional)",
  'name="heard_about_prompt"',
  "What did you ask it? (optional)",
  'value="chatgpt"',
  "e.g. best vacation rental manager in Bradenton"
];

const FEE_PASSAGE_EXCLUDES = [
  "Vacation rental management from 17%",
  "17–20% of net rent",
  "17-20% of net rent",
  "$85 a month",
  "most homes are 20%",
  "headline fee",
  "Patrick quotes",
  "listing on Airbnb, Vrbo and our own booking site",
  "with county taxes remitted"
];

const FIGURE_RE = /\d+(?:\.\d+)?\s*%|\$\d+(?:,\d{3})*(?:\.\d+)?/g;
const THIRD_PARTY_OWNER_RE = /\b(?:airbnb|vrbo|stripe|booking\.com)\b/i;
const SEASCAPE_OWNER_RE = /\bseascape\b/i;
const THIRD_PARTY_FEE_RE = /host service fee/i;
const SEASCAPE_FEE_RE =
  /\b(?:management fee|net rent|monthly minimum|we charge|our fee|we quote|how our management fee works)\b/i;

function visibleText(body) {
  return String(body)
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ");
}

function lastIndex(text, pattern) {
  let last = -1;
  const copy = new RegExp(pattern.source, pattern.flags.includes("g") ? pattern.flags : `${pattern.flags}g`);
  let match;
  while ((match = copy.exec(text))) last = match.index;
  return last;
}

function classifyFigure(text, index) {
  const before = String(text).slice(Math.max(0, index - 120), index);
  const thirdPartyAt = lastIndex(before, THIRD_PARTY_OWNER_RE);
  const seascapeAt = lastIndex(before, SEASCAPE_OWNER_RE);
  if (thirdPartyAt > seascapeAt) return "third-party";
  if (seascapeAt > thirdPartyAt) return "seascape";
  const localBefore = before.slice(-90);
  if (THIRD_PARTY_FEE_RE.test(localBefore)) return "third-party";
  if (SEASCAPE_FEE_RE.test(localBefore)) return "seascape";
  return "unattributed";
}

function findSeascapeFeeFigures(text) {
  const matches = [];
  const copy = new RegExp(FIGURE_RE.source, "g");
  let match;
  while ((match = copy.exec(String(text)))) {
    const owner = classifyFigure(text, match.index);
    if (owner === "third-party") continue;
    matches.push(match[0]);
  }
  return matches;
}

function collectJsonStrings(node, out) {
  if (typeof node === "string") {
    out.push(node);
    return;
  }
  if (Array.isArray(node)) {
    node.forEach((item) => collectJsonStrings(item, out));
    return;
  }
  if (node && typeof node === "object") {
    Object.values(node).forEach((value) => collectJsonStrings(value, out));
  }
}

function jsonLdTexts(body) {
  const texts = [];
  const scriptRe = /<script\b[^>]*\btype=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = scriptRe.exec(String(body)))) {
    const raw = match[1].trim();
    try {
      collectJsonStrings(JSON.parse(raw), texts);
    } catch {
      texts.push(raw);
    }
  }
  return texts;
}

function decodeEntities(value) {
  return String(value)
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function metaTexts(body) {
  const texts = [];
  const tagRe = /<meta\b[^>]*>/gi;
  let match;
  while ((match = tagRe.exec(String(body)))) {
    const tag = match[0];
    if (!/(?:name|property)=["'](?:description|og:description|twitter:description)["']/i.test(tag)) {
      continue;
    }
    const content = tag.match(/\bcontent=(["'])([\s\S]*?)\1/i);
    if (content) texts.push(decodeEntities(content[2]));
  }
  return texts;
}

function extractRegion(body, openRe) {
  const match = openRe.exec(String(body));
  if (!match) return "";
  const tag = match[1];
  const start = match.index + match[0].length;
  const close = new RegExp(`</${tag}\\s*>`, "i").exec(String(body).slice(start));
  return close ? String(body).slice(start, start + close.index) : String(body).slice(start);
}

function seascapeFeeVisibleCopy(body) {
  const regions = [
    extractRegion(
      body,
      /<(div|section|article)\b[^>]*\bid=["']how-our-management-fee-works["'][^>]*>/i
    ),
    extractRegion(
      body,
      /<(div|section|article)\b[^>]*\bclass=["'][^"']*\bg-owner-pricing\b[^"']*["'][^>]*>/i
    )
  ];
  const faqRe =
    /<details\b[^>]*>[\s\S]*?<summary\b[^>]*>[\s\S]*?How much does Seascape charge[\s\S]*?<\/summary>([\s\S]*?)<\/details>/gi;
  let faqMatch;
  while ((faqMatch = faqRe.exec(String(body)))) regions.push(faqMatch[1]);

  const fromRegions = regions.map((html) => visibleText(html)).join(" ");
  const extraSentences = visibleText(body)
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .filter(
      (sentence) =>
        SEASCAPE_FEE_RE.test(sentence) ||
        (SEASCAPE_OWNER_RE.test(sentence) && /\b(?:charge|fee|net rent|minimum)\b/i.test(sentence))
    );
  return `${fromRegions} ${extraSentences.join(" ")}`.replace(/\s+/g, " ").trim();
}

const OWNER_ADMIN_FEE_RE = /\b(?:admin(?:istrative|istration)? fees?|monthly (?:management )?minimum(?: charge| fee)?)\b/i;

function assertNoPublishedOwnerAdminFee(body, path = "/property-management/") {
  const visible = visibleText(String(body).replace(/<\/(?:p|div|li|dd|details|section|article|h[1-6])>/gi, ". "));
  const surfaces = [
    ["visible copy", [visible]],
    ["JSON-LD", jsonLdTexts(body)],
    ["meta description", metaTexts(body)]
  ];
  for (const [label, texts] of surfaces) {
    for (const text of texts) {
      for (const sentence of text.replace(/\s+/g, " ").trim().split(/(?<=[.!?])\s+/)) {
        for (const match of sentence.matchAll(new RegExp(OWNER_ADMIN_FEE_RE.source, "gi"))) {
          const before = sentence.slice(0, match.index);
          const thirdPartyAt = lastIndex(before, THIRD_PARTY_OWNER_RE);
          const ownFeeAt = lastIndex(before, /\b(?:seascape|we|our|net rent)\b/i);
          if (thirdPartyAt > ownFeeAt) continue;
          throw new Error(path + " still publishes an administrative fee or monthly minimum in " + label);
        }
      }
    }
  }
}

function assertNoPublishedFeeNumbers(body) {
  const visible = visibleText(body).replace(/\s+/g, " ").trim();
  const schema = jsonLdTexts(body).join(" ").replace(/\s+/g, " ").trim();
  const meta = metaTexts(body).join(" ").replace(/\s+/g, " ").trim();
  if (!visible && !schema && !meta) {
    throw new Error("/property-management/ live-smoke fee scan received empty copy");
  }

  const surfaces = [
    ["visible Seascape fee copy", seascapeFeeVisibleCopy(body)],
    ["JSON-LD", schema],
    ["meta description", meta]
  ];
  for (const [label, text] of surfaces) {
    const figures = findSeascapeFeeFigures(text);
    if (figures.length) {
      throw new Error(
        `/property-management/ still publishes a fee percentage or dollar amount in ${label} (${figures[0]})`
      );
    }
  }
}

function validateOwnerLiveSurface(body, { requireIncludes, requireExcludes }) {
    const homeCountWord = catalogHomeCountWord();
    const hasOwnerOfferSurface = require("./owner-offer-surface")(body, homeCountWord);

    if (!hasOwnerOfferSurface) {
      throw new Error("property-management hub is missing the Waterline owner offer surface");
    }

    if (
      body.includes("What Is Vacation Rental Property Management?")
      || body.includes("View All Properties")
      || body.includes("Request a property evaluation")
      || body.includes("$119,923")
      || body.includes("13.4%")
      || body.includes("Reply guaranteed")
      || body.includes("The Fee Comparison")
      || body.includes("Before you renew,")
    ) {
      throw new Error("property-management hub is serving retired owner copy");
    }

    requireExcludes("/property-management/", body, [
      "/property-management/vacation-rental-taxes-florida/",
      "/property-management/vacation-rental-insurance-florida/",
      "Average Guest Rating",
      "g-header-owners"
    ]);
    requireIncludes("/property-management/ management fee", body, FEE_PASSAGE_INCLUDES);
    requireExcludes("/property-management/", body, FEE_PASSAGE_EXCLUDES);
    assertNoPublishedFeeNumbers(body);
    requireIncludes("/property-management/ local-alternative", body, [
      "Is Seascape a local alternative to Vacasa or Evolve?",
      "Seascape Vacations is an owner-operated vacation rental manager",
    ]);
    if (!/data-placement=["\']local-alternative["\']/.test(body)) {
      throw new Error("property-management local-alternative action is missing tracking");
    }
    requireIncludes("/property-management/ heard-about", body, HEARD_ABOUT_INCLUDES);
}

validateOwnerLiveSurface.FEE_PASSAGE_INCLUDES = FEE_PASSAGE_INCLUDES;
validateOwnerLiveSurface.FEE_PASSAGE_EXCLUDES = FEE_PASSAGE_EXCLUDES;
validateOwnerLiveSurface.HEARD_ABOUT_INCLUDES = HEARD_ABOUT_INCLUDES;
validateOwnerLiveSurface.assertNoPublishedFeeNumbers = assertNoPublishedFeeNumbers;
validateOwnerLiveSurface.assertNoPublishedOwnerAdminFee = assertNoPublishedOwnerAdminFee;

module.exports = validateOwnerLiveSurface;
