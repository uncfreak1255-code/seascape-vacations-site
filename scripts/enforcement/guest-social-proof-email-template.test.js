const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const assert = require("node:assert/strict");

const projectRoot = path.resolve(__dirname, "..", "..");
const htmlPath = path.join(projectRoot, "docs/outreach/templates/guest-social-proof-email.html");
const textPath = path.join(projectRoot, "docs/outreach/templates/guest-social-proof-email.txt");
const docsPath = path.join(projectRoot, "docs/outreach/mailchimp-guest-social-proof-campaign.md");
const siteDataPath = path.join(projectRoot, "src/_data/site.json");
const annaVsSiestaGuidePath = path.join(projectRoot, "src/guides/anna-maria-island-vs-siesta-key.html");
const bestTimeGuidePath = path.join(projectRoot, "src/guides/best-time-visit-anna-maria-island.html");
const thingsToDoGuidePath = path.join(projectRoot, "src/guides/things-to-do-bradenton-fl.html");

const canonicalSubject = "Why Guests Keep Coming Back To Our Gulf Coast Homes";

const allowedMailchimpLinks = new Set(["*|ARCHIVE|*", "*|UPDATE_PROFILE|*", "*|UNSUB|*"]);
const bannedClaimPatterns = [
  /\b200\+\b/i,
  /\b500\+\b/i,
  /\b650\+\b/i,
  /href=["']https:\/\/["']/i,
  /urldefense\.proofpoint\.com/i,
  /best-time-to-visit-anna-maria-island/i,
  /facebook\.com\/profile\.php\?id=61556781251558/i
];

function read(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function readJson(filePath) {
  return JSON.parse(read(filePath));
}

function extractAttributes(source, attributeName) {
  const expression = new RegExp(`${attributeName}=["']([^"']+)["']`, "gi");
  return [...source.matchAll(expression)].map((match) => match[1]);
}

function extractCanonicalUrl(source) {
  const match = source.match(/<link rel="canonical" href="([^"]+)"/i);
  assert.ok(match, "source file should declare a canonical URL");
  return match[1];
}

function withGuestSocialProofUtm(url) {
  return `${url}?utm_source=mailchimp&utm_medium=email&utm_campaign=guest_social_proof`;
}

function requiredLinks() {
  const siteData = readJson(siteDataPath);

  return [
    "https://seascape-vacations.com/properties/?utm_source=mailchimp&utm_medium=email&utm_campaign=guest_social_proof",
    withGuestSocialProofUtm(extractCanonicalUrl(read(annaVsSiestaGuidePath))),
    withGuestSocialProofUtm(extractCanonicalUrl(read(bestTimeGuidePath))),
    withGuestSocialProofUtm(extractCanonicalUrl(read(thingsToDoGuidePath))),
    siteData.socialLinks.facebook,
    siteData.socialLinks.instagram
  ];
}

function visibleHtmlText(source) {
  return source
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function subjectLineFromText(source) {
  const match = source.match(/^Subject:\s*(.+)$/m);
  assert.ok(match, "plain-text fallback should declare a subject line");
  return match[1].trim();
}

function extractMarkdownSection(source, heading) {
  const escapedHeading = heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const expression = new RegExp(`## ${escapedHeading}\\n([\\s\\S]*?)(?:\\n## |$)`);
  const match = source.match(expression);
  assert.ok(match, `missing markdown section: ${heading}`);
  return match[1];
}

test("guest social-proof email keeps safe template primitives", () => {
  const html = read(htmlPath);
  const text = read(textPath);

  assert.doesNotMatch(html, /<script\b/i);
  assert.doesNotMatch(html, /<link\b[^>]+stylesheet/i);
  assert.doesNotMatch(html, /\bReact\b|\bReactDOM\b|\bBabel\b/i);
  assert.match(html, /<table\b/i);
  assert.match(html, /SAVE50/);
  assert.match(html, new RegExp(`<title>${canonicalSubject.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}</title>`));
  assert.equal(subjectLineFromText(text), canonicalSubject);
});

test("guest social-proof email links are production URLs or approved Mailchimp merge links", () => {
  const html = read(htmlPath);
  const hrefs = extractAttributes(html, "href");

  assert.ok(hrefs.length > 0, "template should include links");

  for (const href of hrefs) {
    const isAllowed =
      href.startsWith("https://seascape-vacations.com/") ||
      href.startsWith("https://www.facebook.com/") ||
      href.startsWith("https://www.instagram.com/") ||
      href.startsWith("tel:") ||
      href.startsWith("mailto:") ||
      allowedMailchimpLinks.has(href);

    assert.ok(isAllowed, `unexpected email link: ${href}`);
  }

  for (const link of requiredLinks()) {
    assert.ok(hrefs.includes(link), `missing required link: ${link}`);
  }
});

test("guest social-proof copy avoids drifted proof claims and placeholder links", () => {
  const combined = [visibleHtmlText(read(htmlPath)), read(textPath)].join("\n");

  for (const pattern of bannedClaimPatterns) {
    assert.doesNotMatch(combined, pattern);
  }
});

test("guest social-proof campaign doc keeps runtime proof receipt and canonical template refs", () => {
  const docs = read(docsPath);
  const approvedArtifactSection = extractMarkdownSection(docs, "Approved Mailchimp Artifact");

  assert.match(docs, /Outlook Proof Receipt/);
  assert.match(approvedArtifactSection, new RegExp(canonicalSubject.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  assert.match(approvedArtifactSection, /docs\/outreach\/templates\/guest-social-proof-email\.html/);
  assert.match(approvedArtifactSection, /docs\/outreach\/templates\/guest-social-proof-email\.txt/);
  assert.doesNotMatch(approvedArtifactSection, /\b200\+\b/i);
});

test("guest social-proof plain text fallback keeps core offer and links", () => {
  const text = read(textPath);

  assert.match(text, /SAVE50/);
  assert.match(text, /3 nights or more/i);

  for (const link of requiredLinks().slice(0, 4)) {
    assert.match(text, new RegExp(link.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
});
