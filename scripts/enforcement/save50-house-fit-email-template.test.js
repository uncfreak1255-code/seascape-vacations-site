const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const assert = require("node:assert/strict");

const projectRoot = path.resolve(__dirname, "..", "..");
const htmlPath = path.join(projectRoot, "docs/outreach/templates/save50-house-fit-email.html");
const textPath = path.join(projectRoot, "docs/outreach/templates/save50-house-fit-email.txt");
const save50PartialPath = path.join(projectRoot, "src/_includes/partials/save50-offer.njk");
const emailPopupPartialPath = path.join(projectRoot, "src/_includes/partials/email-popup.njk");
const propertiesFallbackPath = path.join(projectRoot, "src/_data/properties-fallback.json");
const guideSourcePaths = [
  path.join(projectRoot, "src/guides/anna-maria-island-vs-siesta-key.html"),
  path.join(projectRoot, "src/guides/best-time-visit-anna-maria-island.html"),
  path.join(projectRoot, "src/guides/things-to-do-bradenton-fl.html")
];

const canonicalSubject = "Want help picking the right Seascape home?";
const allowedMailchimpLinks = new Set(["*|ARCHIVE|*", "*|UPDATE_PROFILE|*", "*|UNSUB|*"]);
const requiredCampaignParams = {
  utm_source: "mailchimp",
  utm_medium: "email",
  utm_campaign: "guest_social_proof"
};
const requiredPropertySlugs = [
  "dockside-dreams",
  "the-oasis",
  "sarasota-luxe",
  "river-house",
  "bradenton-pool-home"
];
const bannedClaimPatterns = [
  /\bwaterfront homes\b/i,
  /\bheated pool\b/i,
  /\bguaranteed\b/i,
  /\b200\+\b/i,
  /\b500\+\b/i,
  /\b650\+\b/i,
  /\b5\.0\b/i,
  /\b24\/7\b/i,
  /\bfee stack\b/i,
  /\bleak(?:age)?\b/i,
  /\bfunnel\b/i,
  /\bfrom \$\d+/i,
  /\bexpires\b/i,
  /\bcurated\b/i,
  /\bnestled\b/i,
  /\bhere's why\b/i,
  /href=["']https:\/\/["']/i
];

function read(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function extractAttributes(source, attributeName) {
  const expression = new RegExp(`${attributeName}=["']([^"']+)["']`, "gi");
  return [...source.matchAll(expression)].map((match) => match[1]);
}

function extractCanonicalUrl(source) {
  const match = source.match(/<link rel="canonical" href="([^"]+)"/i);
  assert.ok(match, "guide source should declare a canonical URL");
  return match[1];
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

function assetPathForUrl(url) {
  const prefix = "https://seascape-vacations.com/";
  if (!url.startsWith(prefix)) {
    return null;
  }

  return path.join(projectRoot, url.slice(prefix.length));
}

function seascapeHrefs(html) {
  return extractAttributes(html, "href").filter((href) =>
    href.startsWith("https://seascape-vacations.com/")
  );
}

function seascapeTextUrls(text) {
  return [...text.matchAll(/https:\/\/seascape-vacations\.com\/\S+/g)].map((match) =>
    match[0].replace(/[`).,]+$/g, "")
  );
}

function assertCampaignUrl(url, label) {
  assert.ok(url, `missing ${label}`);

  for (const [key, value] of Object.entries(requiredCampaignParams)) {
    assert.equal(url.searchParams.get(key), value, `${label} missing ${key}=${value}`);
  }
}

function matchingSeascapeUrl(hrefs, pathname) {
  return hrefs.map((href) => new URL(href)).find((url) => url.pathname === pathname);
}

test("house-fit email uses email-safe template primitives and the governed subject", () => {
  const html = read(htmlPath);
  const text = read(textPath);

  assert.doesNotMatch(html, /<script\b/i);
  assert.doesNotMatch(html, /<link\b[^>]+stylesheet/i);
  assert.doesNotMatch(html, /\bReact\b|\bReactDOM\b|\bBabel\b/i);
  assert.doesNotMatch(html, /href=["']#["']/i);
  assert.doesNotMatch(html, /\bsrc=["']assets\//i);
  assert.doesNotMatch(html, /\.(webp|avif)(?:["'?&])/i);
  assert.match(html, /<table\b/i);
  assert.match(html, /SAVE50/);
  assert.match(html, /3-night minimum/i);
  assert.match(
    html,
    new RegExp(`<title>${canonicalSubject.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}</title>`)
  );
  assert.equal(subjectLineFromText(text), canonicalSubject);
});

test("house-fit email links are production URLs or approved Mailchimp merge links", () => {
  const hrefs = extractAttributes(read(htmlPath), "href");

  assert.ok(hrefs.length > 0, "template should include links");

  for (const href of hrefs) {
    const isAllowed =
      href.startsWith("https://seascape-vacations.com/") ||
      href.startsWith("tel:") ||
      href.startsWith("mailto:") ||
      allowedMailchimpLinks.has(href);

    assert.ok(isAllowed, `unexpected email link: ${href}`);
  }

  assert.ok(hrefs.includes("tel:+19417048545"), "missing the Seascape phone link");
  assert.ok(hrefs.includes("*|UNSUB|*"), "missing the unsubscribe merge tag");
  assert.ok(hrefs.includes("*|UPDATE_PROFILE|*"), "missing the preferences merge tag");
});

test("every house-fit link in both formats carries the full Mailchimp campaign", () => {
  const linkUrls = [...seascapeHrefs(read(htmlPath)), ...seascapeTextUrls(read(textPath))];

  assert.ok(linkUrls.length >= 20, "HTML and text should both carry the full link set");

  for (const href of linkUrls) {
    assertCampaignUrl(new URL(href), href);
  }
});

test("house-fit email routes to all five homes, the catalog, and the guide hub", () => {
  const hrefs = seascapeHrefs(read(htmlPath));
  const text = read(textPath);

  assertCampaignUrl(matchingSeascapeUrl(hrefs, "/properties/"), "properties CTA");
  assertCampaignUrl(matchingSeascapeUrl(hrefs, "/guides/"), "guides hub link");

  for (const slug of requiredPropertySlugs) {
    assertCampaignUrl(
      matchingSeascapeUrl(hrefs, `/properties/${slug}/`),
      `property link for ${slug}`
    );
    assert.match(
      text,
      new RegExp(`https://seascape-vacations\\.com/properties/${slug}/\\?utm_source=mailchimp&utm_medium=email&utm_campaign=guest_social_proof`),
      `plain-text fallback missing ${slug}`
    );
  }
});

test("house-fit guide links match the canonical URLs in guide source", () => {
  const hrefs = seascapeHrefs(read(htmlPath));
  const text = read(textPath);

  for (const guidePath of guideSourcePaths) {
    const canonical = extractCanonicalUrl(read(guidePath));
    const url = new URL(canonical);
    assertCampaignUrl(
      matchingSeascapeUrl(hrefs, url.pathname),
      `guide link for ${url.pathname}`
    );
    assert.ok(
      text.includes(canonical),
      `plain-text fallback missing guide URL ${canonical}`
    );
  }
});

test("house-fit campaign is allowlisted by the on-site SAVE50 reminder and popup reminder", () => {
  const save50Partial = read(save50PartialPath);
  const popupPartial = read(emailPopupPartialPath);
  const campaign = requiredCampaignParams.utm_campaign;

  assert.ok(
    save50Partial.includes(`"${campaign}"`),
    `src/_includes/partials/save50-offer.njk must allowlist ${campaign} or the landing reminder stays hidden`
  );
  assert.ok(
    popupPartial.includes(`"${campaign}"`),
    `src/_includes/partials/email-popup.njk must allowlist ${campaign} or the popup reminder stays hidden`
  );
});

test("house-fit capacity and layout claims match property truth in both formats", () => {
  const properties = JSON.parse(read(propertiesFallbackPath));
  const list = Array.isArray(properties) ? properties : Object.values(properties);
  const htmlText = visibleHtmlText(read(htmlPath));
  const text = read(textPath);

  assert.equal(list.length, 5, "the email describes exactly five homes");

  const largest = list.reduce((best, property) => (property.guests > best.guests ? property : best));
  assert.equal(largest.name, "The Oasis", "the sleeps-16 claim must point at the largest home");
  assert.equal(
    list.filter((property) => property.guests >= largest.guests).length,
    1,
    "only one home may be described as the only house that sleeps 16"
  );

  const waterfront = list.filter((property) => (property.amenities || []).includes("waterfront"));
  assert.equal(waterfront.length, 1, "only one home may carry a waterfront claim");
  assert.equal(waterfront[0].name, "Dockside Dreams");

  for (const property of list) {
    assert.ok(
      (property.amenities || []).includes("pool"),
      `${property.name} must have a pool for the all-five private pool claim`
    );

    const htmlSpec = `${property.city} - ${property.bedrooms} BR - ${property.bathrooms} BA - Sleeps ${property.guests}`;
    const textSpec = `${property.city}, ${property.bedrooms} BR, ${property.bathrooms} BA, sleeps ${property.guests}`;

    assert.ok(htmlText.includes(property.name), `${property.name} missing from the HTML copy`);
    assert.ok(text.includes(property.name), `${property.name} missing from the plain-text copy`);
    assert.ok(htmlText.includes(htmlSpec), `HTML copy missing the source spec "${htmlSpec}"`);
    assert.ok(text.includes(textSpec), `plain-text copy missing the source spec "${textSpec}"`);
  }
});

test("house-fit copy avoids banned claims, slop phrasing, and a fake offer expiry", () => {
  const combined = [visibleHtmlText(read(htmlPath)), read(textPath)].join("\n");

  assert.ok(combined.length > 0, "there must be visible copy to lint");

  for (const pattern of bannedClaimPatterns) {
    assert.doesNotMatch(combined, pattern);
  }
});
