const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const assert = require("node:assert/strict");

const projectRoot = path.resolve(__dirname, "..", "..");
const htmlPath = path.join(projectRoot, "docs/outreach/templates/guest-social-proof-email.html");
const textPath = path.join(projectRoot, "docs/outreach/templates/guest-social-proof-email.txt");
const docsPath = path.join(projectRoot, "docs/outreach/mailchimp-guest-social-proof-campaign.md");

const allowedMailchimpLinks = new Set(["*|ARCHIVE|*", "*|UPDATE_PROFILE|*", "*|UNSUB|*"]);
const requiredLinks = [
  "https://seascape-vacations.com/properties/?utm_source=mailchimp&utm_medium=email&utm_campaign=guest_social_proof",
  "https://seascape-vacations.com/guides/anna-maria-island-vs-siesta-key/?utm_source=mailchimp&utm_medium=email&utm_campaign=guest_social_proof",
  "https://seascape-vacations.com/guides/best-time-to-visit-anna-maria-island/?utm_source=mailchimp&utm_medium=email&utm_campaign=guest_social_proof",
  "https://seascape-vacations.com/guides/things-to-do-bradenton-fl/?utm_source=mailchimp&utm_medium=email&utm_campaign=guest_social_proof",
  "https://www.facebook.com/profile.php?id=61556781251558",
  "https://www.instagram.com/seascapevacations/"
];

const bannedClaimPatterns = [
  /\b200\+\b/i,
  /\b500\+\b/i,
  /\b650\+\b/i,
  /href=["']https:\/\/["']/i,
  /urldefense\.proofpoint\.com/i
];

function read(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function extractAttributes(source, attributeName) {
  const expression = new RegExp(`${attributeName}=["']([^"']+)["']`, "gi");
  return [...source.matchAll(expression)].map((match) => match[1]);
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

test("guest social-proof email keeps safe template primitives", () => {
  const html = read(htmlPath);

  assert.doesNotMatch(html, /<script\b/i);
  assert.doesNotMatch(html, /<link\b[^>]+stylesheet/i);
  assert.doesNotMatch(html, /\bReact\b|\bReactDOM\b|\bBabel\b/i);
  assert.match(html, /<table\b/i);
  assert.match(html, /SAVE50/);
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

  for (const link of requiredLinks) {
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

  assert.match(docs, /Runtime Proof Receipt/);
  assert.match(docs, /docs\/outreach\/templates\/guest-social-proof-email\.html/);
  assert.match(docs, /docs\/outreach\/templates\/guest-social-proof-email\.txt/);
});

test("guest social-proof plain text fallback keeps core offer and links", () => {
  const text = read(textPath);

  assert.match(text, /SAVE50/);
  assert.match(text, /3 nights or more/i);

  for (const link of requiredLinks.slice(0, 4)) {
    assert.match(text, new RegExp(link.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
});
