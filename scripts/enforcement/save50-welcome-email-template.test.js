const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const assert = require("node:assert/strict");

const projectRoot = path.resolve(__dirname, "..", "..");
const htmlPath = path.join(projectRoot, "docs/outreach/templates/save50-welcome-email.html");
const textPath = path.join(projectRoot, "docs/outreach/templates/save50-welcome-email.txt");
const docsPath = path.join(projectRoot, "docs/outreach/mailchimp-welcome-sequence.md");

const allowedMailchimpLinks = new Set(["*|ARCHIVE|*", "*|UPDATE_PROFILE|*", "*|UNSUB|*"]);
const requiredPropertySlugs = [
  "dockside-dreams",
  "the-oasis",
  "sarasota-luxe",
  "river-house",
  "bradenton-pool-home"
];
const bannedClaimPatterns = [
  /\b5 waterfront homes\b/i,
  /\bwaterfront homes\b/i,
  /\bguaranteed\b/i,
  /\b500\+\b/i,
  /\b5\.0\b/i,
  /\b24\/7\b/i,
  /\bservice-fee stack\b/i,
  /\bfee stack\b/i,
  /\bstack\b/i,
  /\bleak(?:age)?\b/i,
  /\bdrag\b/i,
  /\bfunnel\b/i,
  /\bexpires Dec 31\b/i,
  /\bfrom \$\d+/i
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

function assetPathForUrl(url) {
  const prefix = "https://seascape-vacations.com/";
  if (!url.startsWith(prefix)) {
    return null;
  }

  return path.join(projectRoot, url.slice(prefix.length));
}

test("SAVE50 welcome email uses email-safe template primitives", () => {
  const html = read(htmlPath);

  assert.doesNotMatch(html, /<script\b/i);
  assert.doesNotMatch(html, /<link\b[^>]+stylesheet/i);
  assert.doesNotMatch(html, /\bReact\b|\bReactDOM\b|\bBabel\b/i);
  assert.doesNotMatch(html, /href=["']#["']/i);
  assert.doesNotMatch(html, /\bsrc=["']assets\//i);
  assert.doesNotMatch(html, /\.(webp|avif)(?:["'?&])/i);
  assert.match(html, /<table\b/i);
  assert.match(html, /SAVE50/);
  assert.match(html, /\$50 off your first direct booking/i);
});

test("SAVE50 welcome email links are production URLs or approved Mailchimp merge links", () => {
  const html = read(htmlPath);
  const hrefs = extractAttributes(html, "href");

  assert.ok(hrefs.length > 0, "template should include links");

  for (const href of hrefs) {
    const isAllowed =
      href.startsWith("https://seascape-vacations.com/") ||
      href.startsWith("tel:") ||
      href.startsWith("mailto:") ||
      allowedMailchimpLinks.has(href);

    assert.ok(isAllowed, `unexpected email link: ${href}`);
  }

  assert.ok(hrefs.includes("https://seascape-vacations.com/properties/"));
  assert.ok(hrefs.includes("tel:+19417048545"));

  for (const slug of requiredPropertySlugs) {
    assert.ok(
      hrefs.includes(`https://seascape-vacations.com/properties/${slug}/`),
      `missing property link for ${slug}`
    );
  }
});

test("SAVE50 welcome email images are site-hosted assets present in the repo", () => {
  const html = read(htmlPath);
  const imageSources = extractAttributes(html, "src").filter((value) => value.includes("/images/email/save50/"));
  const backgroundUrls = [...html.matchAll(/url\(['"]?(https:\/\/seascape-vacations\.com\/images\/email\/save50\/[^'")]+)['"]?\)/gi)].map(
    (match) => match[1]
  );
  const allImageUrls = [...new Set([...imageSources, ...backgroundUrls])];

  assert.ok(allImageUrls.length >= 6, "template should use the hosted hero, logo, and property images");

  for (const imageUrl of allImageUrls) {
    assert.ok(imageUrl.startsWith("https://seascape-vacations.com/images/email/save50/"));
    const localPath = assetPathForUrl(imageUrl);
    assert.ok(localPath, `could not map ${imageUrl} to a local asset`);
    assert.ok(fs.existsSync(localPath), `missing local asset for ${imageUrl}`);
  }
});

test("SAVE50 welcome email copy avoids drifted or banned claims", () => {
  const combined = [visibleHtmlText(read(htmlPath)), read(textPath), read(docsPath)].join("\n");

  for (const pattern of bannedClaimPatterns) {
    assert.doesNotMatch(combined, pattern);
  }
});

test("SAVE50 plain text fallback keeps core offer and links", () => {
  const text = read(textPath);

  assert.match(text, /SAVE50/);
  assert.match(text, /\$50 off your first direct booking/i);
  assert.match(text, /3 nights or more/i);
  assert.match(text, /https:\/\/seascape-vacations\.com\/properties\//);

  for (const slug of requiredPropertySlugs) {
    assert.match(text, new RegExp(`https://seascape-vacations\\.com/properties/${slug}/`));
  }
}
);
