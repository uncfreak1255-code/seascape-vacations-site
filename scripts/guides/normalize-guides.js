const fs = require("fs");
const path = require("path");

const SITE_URL = "https://seascape-vacations.com";
const GUIDE_ROOT = path.resolve(__dirname, "../../src/guides");
const SITE_DATA = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, "../../src/_data/site.json"), "utf8")
);
const GA_MEASUREMENT_ID = SITE_DATA.analytics?.ga4MeasurementId || "G-3VDV66S3DK";
const SAME_AS_LINKS = SITE_DATA.sameAsLinks || [];
const SAME_AS_BLOCK = [
  '        "sameAs": [',
  ...SAME_AS_LINKS.map(
    (profile, index) => `            "${profile}"${index < SAME_AS_LINKS.length - 1 ? "," : ""}`
  ),
  "        ]"
].join("\n");

const LOCAL_OG_IMAGES = {
  ami: "/images/anna-maria-island-og.jpg",
  bradenton: "/images/bradenton-og.jpg",
  sarasota: "/images/sarasota-og.jpg",
  siesta: "/images/siesta-key-og.jpg",
  default: "/images/seascape-og-default.jpg"
};

const UNSPLASH_TO_LOCAL = new Map([
  ["photo-1414235077428-338989a2e8c0", "/images/ami-colorful-cottages.jpg"],
  ["photo-1476514525535-07fb3b4ae5f1", "/images/sarasota-sunset-hero.jpg"],
  ["photo-1506477331477-33d5d8b3dc85", "/images/siesta-key-intro.webp"],
  ["photo-1507525428034-b723cf961d3e", "/images/ami-hero.webp"],
  ["photo-1510414842594-a61c69b5ae57", "/images/anna-maria-island-og.jpg"],
  ["photo-1519046904884-53103b34b206", "/images/anna-maria-island-og.jpg"],
  ["photo-1542080681-b52d382432af", "/images/seascape-og-default.jpg"],
  ["photo-1544551763-46a013bb70d5", "/images/siesta-key-intro.webp"],
  ["photo-1544552866-d3ed42536cfd", "/images/bradenton-beach.webp"],
  ["photo-1554224155-8d04cb21cd6c", "/images/seascape-og-default.jpg"],
  ["photo-1555529669-e69e7aa0ba9a", "/images/sarasota-hero.webp"],
  ["photo-1559827291-72ee739d0d9a", "/images/anna-maria-island-og.jpg"],
  ["photo-1560518883-ce09059eeffa", "/images/seascape-og-default.jpg"],
  ["photo-1564013799919-ab600027ffc6", "/images/sarasota-hero.webp"],
  ["photo-1564550974352-c8fdef23a03b", "/images/sarasota-sunset-hero.jpg"],
  ["photo-1584037014929-80f5d8e8d64f", "/images/sarasota-sunset-hero.jpg"],
  ["photo-1587300003388-59208cc962cb", "/images/seascape-og-default.jpg"],
  ["photo-1591017403286-fd8493524e1e", "/images/ami-hero.webp"],
  ["photo-1600596542815-ffad4c1539a9", "/hero-optimized.webp"],
  ["photo-1602002418816-5c0aeef426aa", "/images/anna-maria-island-og.jpg"],
  ["photo-1607153333879-c174d265f1d2", "/images/bradenton-beach.webp"]
]);

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      return walk(fullPath);
    }
    return fullPath.endsWith(".html") ? [fullPath] : [];
  });
}

function getGuideRoute(file) {
  const relative = path.relative(GUIDE_ROOT, file).replace(/\\/g, "/");
  if (relative === "index.html") {
    return "/guides/";
  }
  if (relative.endsWith("/index.html")) {
    return `/guides/${relative.slice(0, -"/index.html".length)}/`;
  }
  return `/guides/${relative.slice(0, -".html".length)}/`;
}

function getGuideRegion(route) {
  if (/siesta-key/.test(route)) {
    return "siesta";
  }
  if (/sarasota|longboat-key/.test(route)) {
    return "sarasota";
  }
  if (/bradenton/.test(route)) {
    return "bradenton";
  }
  if (/anna-maria|holmes-beach|ami/.test(route)) {
    return "ami";
  }
  return "default";
}

function upsertTag(html, pattern, replacement, anchorPattern) {
  if (pattern.test(html)) {
    return html.replace(pattern, replacement);
  }
  if (anchorPattern.test(html)) {
    return html.replace(anchorPattern, `$&${replacement}`);
  }
  return html.replace(/<\/head>/i, `${replacement}</head>`);
}

function upsertArticleField(html, fieldName, value) {
  const articleScript = /(<script type="application\/ld\+json">[\s\S]*?"@type"\s*:\s*"Article"[\s\S]*?<\/script>)/i;
  const match = html.match(articleScript);
  if (!match) {
    return html;
  }

  let script = match[1];
  const fieldPattern = new RegExp(`("${fieldName}"\\s*:\\s*")[^"]*(")`, "i");

  if (fieldPattern.test(script)) {
    script = script.replace(fieldPattern, `$1${value}$2`);
  } else {
    script = script.replace(/("description"\s*:\s*"[^"]*")/i, `$1,\n        "${fieldName}": "${value}"`);
  }

  return html.replace(articleScript, script);
}

function ensureMainLandmark(html) {
  if (/<main[\s>]/i.test(html) || !/<article[\s>]/i.test(html)) {
    return html;
  }

  if (/<\/nav>\s*<section class="hero">/i.test(html)) {
    return html
      .replace(/<\/nav>(\s*)<section class="hero">/i, "</nav>$1<main><section class=\"hero\">")
      .replace(/<\/article>/i, "</article></main>");
  }

  return html;
}

function normalizeBusinessSameAs(html) {
  return html.replace(/"sameAs":\s*\[\s*([\s\S]*?)\s*\]/g, (match, inner) => {
    const lower = inner.toLowerCase();
    if (!lower.includes("facebook.com") && !lower.includes("instagram.com")) {
      return match;
    }
    return SAME_AS_BLOCK;
  });
}

function normalizeGuide(file) {
  const route = getGuideRoute(file);
  const region = getGuideRegion(route);
  const ogPath = LOCAL_OG_IMAGES[region] || LOCAL_OG_IMAGES.default;
  const ogUrl = `${SITE_URL}${ogPath}`;

  let html = fs.readFileSync(file, "utf8");

  html = html.replace(/G-XXXXXXXXXX/g, GA_MEASUREMENT_ID);
  html = normalizeBusinessSameAs(html);

  // Convert brittle or missing local image references to the stable repo assets.
  html = html
    .replace(/https:\/\/seascape-vacations\.com\/images\/logo\.png/g, `${SITE_URL}/logo-optimized.png`)
    .replace(/\/images\/logo\.png/g, "/logo-optimized.png")
    .replace(/https:\/\/seascape-vacations\.com\/images\/ami-beach-hero\.webp/g, `${SITE_URL}/images/anna-maria-island-og.jpg`)
    .replace(/https:\/\/seascape-vacations\.com\/images\/ami-family-beach\.jpg/g, `${SITE_URL}/images/anna-maria-island-og.jpg`)
    .replace(/https:\/\/seascape-vacations\.com\/images\/bradenton-og\.jpg/g, `${SITE_URL}/images/bradenton-og.jpg`)
    .replace(/https:\/\/seascape-vacations\.com\/images\/sarasota-beach\.webp/g, `${SITE_URL}/images/sarasota-og.jpg`)
    .replace(/https:\/\/seascape-vacations\.com\/images\/sarasota-og\.jpg/g, `${SITE_URL}/images/sarasota-og.jpg`)
    .replace(/https:\/\/seascape-vacations\.com\/images\/siesta-key-og\.jpg/g, `${SITE_URL}/images/siesta-key-og.jpg`);

  html = html.replace(/https:\/\/images\.unsplash\.com\/[^"') ]+/g, (url) => {
    for (const [needle, replacement] of UNSPLASH_TO_LOCAL.entries()) {
      if (url.includes(needle)) {
        return replacement;
      }
    }
    return LOCAL_OG_IMAGES.default;
  });

  const title = (html.match(/<meta property="og:title" content="([^"]+)"/i) || html.match(/<title>([^<]+)<\/title>/i) || [null, "Seascape Vacations Guide"])[1];
  const description = (html.match(/<meta property="og:description" content="([^"]+)"/i) || html.match(/<meta name="description" content="([^"]+)"/i) || [null, "Local travel and vacation rental guidance from Seascape Vacations."])[1];
  const ogType = route === "/guides/" ? "website" : "article";

  html = upsertTag(
    html,
    /<link rel="canonical" href="[^"]*"\s*\/?>/i,
    `<link rel="canonical" href="${SITE_URL}${route}">`,
    /<meta name="robots" content="[^"]*"\s*\/?>/i
  );

  html = upsertTag(
    html,
    /<meta property="og:type" content="[^"]*"\s*\/?>/i,
    `<meta property="og:type" content="${ogType}">`,
    /<link rel="canonical" href="[^"]*"\s*\/?>/i
  );

  html = upsertTag(
    html,
    /<meta property="og:url" content="[^"]*"\s*\/?>/i,
    `<meta property="og:url" content="${SITE_URL}${route}">`,
    /<meta property="og:type" content="[^"]*"\s*\/?>/i
  );

  html = upsertTag(
    html,
    /<meta property="og:title" content="[^"]*"\s*\/?>/i,
    `<meta property="og:title" content="${title}">`,
    /<meta property="og:url" content="[^"]*"\s*\/?>/i
  );

  html = upsertTag(
    html,
    /<meta property="og:description" content="[^"]*"\s*\/?>/i,
    `<meta property="og:description" content="${description}">`,
    /<meta property="og:title" content="[^"]*"\s*\/?>/i
  );

  html = upsertTag(
    html,
    /<meta property="og:image" content="[^"]*"\s*\/?>/i,
    `<meta property="og:image" content="${ogUrl}">`,
    /<meta property="og:description" content="[^"]*"\s*\/?>/i
  );

  html = upsertTag(
    html,
    /<meta property="og:locale" content="[^"]*"\s*\/?>/i,
    '<meta property="og:locale" content="en_US">',
    /<meta property="og:image" content="[^"]*"\s*\/?>/i
  );

  html = upsertTag(
    html,
    /<meta property="og:site_name" content="[^"]*"\s*\/?>/i,
    '<meta property="og:site_name" content="Seascape Vacations">',
    /<meta property="og:locale" content="[^"]*"\s*\/?>/i
  );

  html = upsertTag(
    html,
    /<meta name="twitter:card" content="[^"]*"\s*\/?>/i,
    '<meta name="twitter:card" content="summary_large_image">',
    /<meta property="og:site_name" content="[^"]*"\s*\/?>/i
  );

  html = upsertTag(
    html,
    /<meta name="twitter:title" content="[^"]*"\s*\/?>/i,
    `<meta name="twitter:title" content="${title}">`,
    /<meta name="twitter:card" content="[^"]*"\s*\/?>/i
  );

  html = upsertTag(
    html,
    /<meta name="twitter:description" content="[^"]*"\s*\/?>/i,
    `<meta name="twitter:description" content="${description}">`,
    /<meta name="twitter:title" content="[^"]*"\s*\/?>/i
  );

  html = upsertTag(
    html,
    /<meta name="twitter:image" content="[^"]*"\s*\/?>/i,
    `<meta name="twitter:image" content="${ogUrl}">`,
    /<meta name="twitter:description" content="[^"]*"\s*\/?>/i
  );

  html = upsertTag(
    html,
    /<meta name="author" content="[^"]*"\s*\/?>/i,
    '<meta name="author" content="Seascape Vacations">',
    /<meta name="description" content="[^"]*"\s*\/?>/i
  );

  html = upsertArticleField(html, "image", ogUrl);
  html = upsertArticleField(html, "mainEntityOfPage", `${SITE_URL}${route}`);
  html = ensureMainLandmark(html);

  fs.writeFileSync(file, html);
  return { file, route, ogUrl };
}

const files = walk(GUIDE_ROOT);
const normalized = files.map(normalizeGuide);
console.log(`normalize-guides: updated ${normalized.length} guide files`);
