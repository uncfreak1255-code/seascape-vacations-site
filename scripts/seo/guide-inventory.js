const fs = require("fs");
const path = require("path");

const BASE_URL = "https://seascape-vacations.com";

function toPosixPath(filePath) {
  return path.resolve(filePath).replace(/\\/g, "/");
}

function decodeHtmlEntity(value) {
  if (!value) {
    return "";
  }

  const normalized = value
    .replace(/&#x([0-9a-fA-F]+);?/g, (_, hex) => {
      const code = parseInt(hex, 16);
      return Number.isNaN(code) ? "" : String.fromCharCode(code);
    })
    .replace(/&#(\d+);?/g, (_, decimal) => {
      const code = Number.parseInt(decimal, 10);
      return Number.isNaN(code) ? "" : String.fromCharCode(code);
    });

  return normalized
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#34;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'");
}

function cleanText(value) {
  return decodeHtmlEntity(
    String(value || "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
  );
}

function parseTagAttributes(tagHtml) {
  const attrs = {};
  const matcher = /\b([a-zA-Z0-9_-]+)\s*=\s*(["'])(.*?)\2/g;

  let attributeMatch = null;
  while ((attributeMatch = matcher.exec(tagHtml)) !== null) {
    const [, attrName, , attrValue] = attributeMatch;
    attrs[attrName.toLowerCase()] = attrValue;
  }

  return attrs;
}

function extractMetaTags(html, tagName) {
  const regex = /<meta\b[^>]*>/gi;
  const matches = [];
  let metaMatch = null;

  while ((metaMatch = regex.exec(html)) !== null) {
    const attrs = parseTagAttributes(metaMatch[0]);
    if ((attrs.name || attrs.property || "").toLowerCase() === tagName.toLowerCase()) {
      matches.push(attrs.content || "");
    }
  }

  return matches;
}

function extractCanonical(html) {
  const regex = /<link\b[^>]*>/gi;
  let linkMatch = null;

  while ((linkMatch = regex.exec(html)) !== null) {
    const attrs = parseTagAttributes(linkMatch[0]);
    if ((attrs.rel || "").toLowerCase() === "canonical" && attrs.href) {
      return attrs.href;
    }
  }

  return "";
}

function parseTitle(html) {
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (titleMatch) {
    return cleanText(titleMatch[1]);
  }

  const ogTitleMatch = extractMetaTags(html, "og:title");
  if (ogTitleMatch.length) {
    return cleanText(ogTitleMatch[0]);
  }

  return "";
}

function parseMetaDescription(html) {
  const descriptionTags = extractMetaTags(html, "description");
  if (descriptionTags.length) {
    return cleanText(descriptionTags[0]);
  }

  const ogDescription = extractMetaTags(html, "og:description");
  if (ogDescription.length) {
    return cleanText(ogDescription[0]);
  }

  return "";
}

function patchableMetadata(html) {
  const title = parseTitle(html);
  const descriptionTags = extractMetaTags(html, "description");
  const metaDescriptionCount = descriptionTags.length;
  const ogDescriptionCount = extractMetaTags(html, "og:description").length;
  const descriptionCount = metaDescriptionCount + (ogDescriptionCount > 0 ? 1 : 0);

  return Boolean(title) && descriptionCount >= 1;
}

function extractFirstH1(html) {
  const match = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i);
  return match ? cleanText(match[1]) : "";
}

function extractIntroParagraphs(html) {
  const h1Match = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i);
  if (!h1Match) {
    return [];
  }

  const afterH1 = html.slice(h1Match.index + h1Match[0].length);
  const nextHeadingMatch = /<h[2-6]\b/gi.exec(afterH1);
  const introSlice = nextHeadingMatch
    ? afterH1.slice(0, nextHeadingMatch.index)
    : afterH1;

  const paragraphs = [];
  const paragraphRegex = /<p\b[^>]*>([\s\S]*?)<\/p>/gi;
  let paragraphMatch = null;

  while ((paragraphMatch = paragraphRegex.exec(introSlice)) !== null) {
    const text = cleanText(paragraphMatch[1]);
    if (!text || text.length < 10) {
      continue;
    }

    if (/^updated\s+[a-z]+\s*[•·]/i.test(text)) {
      continue;
    }

    paragraphs.push(text);
    if (paragraphs.length >= 5) {
      break;
    }
  }

  return paragraphs;
}

function parseJsonLdScripts(html) {
  const scripts = [];
  const scriptRegex = /<script\b[^>]*type=(["'])application\/ld\+json\1[^>]*>([\s\S]*?)<\/script>/gi;
  let scriptMatch = null;

  while ((scriptMatch = scriptRegex.exec(html)) !== null) {
    const raw = scriptMatch[2] || "";
    const trimmed = raw.trim();
    let parsed = null;
    let parseError = null;

    try {
      parsed = JSON.parse(trimmed);
    } catch (error) {
      parseError = error.message;
    }

    scripts.push({
      raw: trimmed,
      parsed,
      parseError
    });
  }

  return scripts;
}

function isQuestionCollection(entity) {
  if (!entity || typeof entity !== "object") {
    return false;
  }

  if (Array.isArray(entity.mainEntity) && entity.mainEntity.length) {
    return entity.mainEntity.every((item) => {
      if (!item || typeof item !== "object") {
        return false;
      }
      return String(item["@type"] || "").toLowerCase() === "question";
    });
  }

  return false;
}

function isFaqSchema(data) {
  if (!data || typeof data !== "object") {
    return false;
  }

  const type = String(data["@type"] || "").toLowerCase();
  if (type === "faqpage") {
    return true;
  }

  if (Array.isArray(data["@graph"])) {
    return data["@graph"].some((entry) => isFaqSchema(entry));
  }

  return isQuestionCollection(data);
}

function normalizeGuideLink(href, currentSlug) {
  if (!href) {
    return "";
  }

  let normalized = decodeHtmlEntity(href.trim());
  if (!normalized) {
    return "";
  }

  if (normalized.startsWith("#") || normalized.startsWith("mailto:") || normalized.startsWith("tel:")) {
    return "";
  }

  if (normalized.startsWith("http://") || normalized.startsWith("https://")) {
    try {
      const parsedUrl = new URL(normalized);
      if (!["seascape-vacations.com", "www.seascape-vacations.com"].includes(parsedUrl.hostname)) {
        return "";
      }
      normalized = parsedUrl.pathname;
    } catch (error) {
      return "";
    }
  }

  if (normalized.startsWith("www.")) {
    return "";
  }

  if (!normalized.startsWith("/")) {
    normalized = `/${normalized}`;
  }

  const [pathOnly] = normalized.split(/[?#]/);
  if (!pathOnly.startsWith("/guides/")) {
    return "";
  }

  let route = pathOnly;
  if (route === "/guides") {
    route = "/guides/";
  } else if (route.endsWith("/index.html")) {
    route = `${route.slice(0, -"/index.html".length)}/`;
  } else if (route.endsWith(".html")) {
    route = `${route.slice(0, -".html".length)}/`;
  } else if (!route.endsWith("/")) {
    route = `${route}/`;
  }

  if (route === currentSlug || route === (currentSlug || "").replace(/\/$/, "")) {
    return "";
  }

  return route;
}

function extractRelatedGuideLinks(html, currentSlug) {
  const links = [];
  const seen = new Set();

  const linkRegex = /<a\b[^>]*\bhref=(["'])(.*?)\1[^>]*>/gi;
  let linkMatch = null;

  while ((linkMatch = linkRegex.exec(html)) !== null) {
    const href = normalizeGuideLink(linkMatch[2], currentSlug);
    if (!href || seen.has(href)) {
      continue;
    }
    seen.add(href);
    links.push(href);
  }

  return links;
}

function countWords(text) {
  const words = text.match(/[\p{L}\p{N}]+/gu);
  return words ? words.length : 0;
}

function normalizeBodyText(html) {
  const bodyMatch = html.match(/<body\b[\s\S]*?>([\s\S]*?)<\/body>/i);
  const source = bodyMatch ? bodyMatch[1] : html;

  const withoutScripts = source
    .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript\b[\s\S]*?<\/noscript>/gi, " ");

  return cleanText(withoutScripts);
}

function inferSlugFromPath(filePath) {
  const normalizedPath = toPosixPath(filePath);
  const separator = normalizedPath.split("/guides/");
  const target = separator.length === 2 ? separator[1] : path.basename(filePath);

  let slugRoute = target;
  if (slugRoute.endsWith("index.html")) {
    slugRoute = slugRoute.slice(0, -"index.html".length);
  } else if (slugRoute.endsWith(".html")) {
    slugRoute = slugRoute.slice(0, -".html".length);
  }

  if (!slugRoute) {
    return "/guides/";
  }

  if (slugRoute.includes("\\")) {
    slugRoute = slugRoute.replace(/\\/g, "/");
  }

  if (!slugRoute.endsWith("/")) {
    slugRoute = `${slugRoute}/`;
  }
  if (!slugRoute.startsWith("/")) {
    slugRoute = `/${slugRoute}`;
  }

  if (separator.length === 2) {
    return `/guides/${slugRoute.replace(/^\/+|\/+$/g, "")}/`;
  }

  return slugRoute;
}

function normalizeCanonicalUrl(canonical, slug) {
  if (!canonical) {
    return `${BASE_URL}${slug}`;
  }

  if (canonical.startsWith("http://") || canonical.startsWith("https://")) {
    return canonical;
  }

  const normalized = canonical.startsWith("/")
    ? canonical
    : `/${canonical}`;

  return `${BASE_URL}${normalized}`;
}

function hasRelatedGuideMarkers(html) {
  const hasGuideLinksClass = /class=(["'][^"']*\bguide-links\b[^"']*\1)/i.test(html);
  const hasRelatedGuidesClass = /class=(["'][^"']*\brelated-guides\b[^"']*\1)/i.test(html);
  const hasRelatedGridClass = /class=(["'][^"']*\brelated-grid\b[^"']*\1)/i.test(html);
  const hasRelatedHeading = /<h[2-4]\b[^>]*>\s*(?:related guides|more guides)\s*<\/h[2-4]>/i.test(html);

  return hasGuideLinksClass || hasRelatedGuidesClass || hasRelatedGridClass || hasRelatedHeading;
}

function buildFaqInventory(scripts) {
  const faqScripts = scripts
    .map((script, index) => {
      const isFaq = isFaqSchema(script.parsed) || /@type"\s*:\s*\"FAQPage\"/i.test(script.raw);
      const hasQuestion = Array.isArray(script.parsed?.mainEntity)
        ? script.parsed.mainEntity.length
        : 0;

    return {
      index,
      isFaq,
      questionCount: hasQuestion,
      parsed: script.parsed,
      parseError: script.parseError,
      raw: script.raw
    };
  })
    .filter((entry) => entry.isFaq);

  return {
    present: faqScripts.length > 0,
    count: faqScripts.length,
    schemas: faqScripts
  };
}

function extractGuideInventoryFromHtml(filePath, html) {
  const slug = inferSlugFromPath(filePath);
  const canonical = extractCanonical(html);
  const url = normalizeCanonicalUrl(canonical || slug, slug);
  const title = parseTitle(html);
  const metaDescription = parseMetaDescription(html);
  const firstH1 = extractFirstH1(html);
  const introParagraphs = extractIntroParagraphs(html);
  const jsonLd = parseJsonLdScripts(html);
  const faqJsonLd = buildFaqInventory(jsonLd);
  const relatedGuideLinks = extractRelatedGuideLinks(html, slug);
  const bodyTextWordCount = countWords(normalizeBodyText(html));

  return {
    filePath,
    slug,
    url,
    title,
    metaDescription,
    firstH1,
    introParagraphs,
    faqJsonLd,
    relatedGuideLinks,
    bodyTextWordCount,
    canPatchMetadata: patchableMetadata(html) && Boolean(title) && Boolean(metaDescription),
    canPatchIntro: Boolean(firstH1) && introParagraphs.length > 0,
    canPatchFaq: faqJsonLd.present && faqJsonLd.schemas.every((schema) => schema.parsed && !schema.parseError),
    canPatchRelatedLinks: hasRelatedGuideMarkers(html) && relatedGuideLinks.length > 0
  };
}

function extractGuideInventoryFromFile(filePath) {
  const html = fs.readFileSync(filePath, "utf8");
  return extractGuideInventoryFromHtml(filePath, html);
}

function walkGuideFiles(rootPath, files) {
  const list = files || [];

  const stat = fs.statSync(rootPath);
  if (stat.isDirectory()) {
    for (const entry of fs.readdirSync(rootPath, { withFileTypes: true })) {
      const fullPath = path.join(rootPath, entry.name);
      if (entry.isDirectory()) {
        walkGuideFiles(fullPath, list);
      } else if (entry.isFile() && entry.name.endsWith(".html")) {
        list.push(fullPath);
      }
    }
    return list;
  }

  if (stat.isFile() && rootPath.endsWith(".html")) {
    list.push(rootPath);
  }

  return list;
}

function extractGuideInventories(paths) {
  return paths.flatMap((targetPath) => walkGuideFiles(targetPath, [])).map((filePath) => {
    return extractGuideInventoryFromFile(filePath);
  });
}

if (require.main === module) {
  const targets = process.argv.slice(2);
  const files = targets.length > 0 ? targets : [];
  const inventories = extractGuideInventories(files);
  process.stdout.write(`${JSON.stringify(inventories, null, 2)}\n`);
}

module.exports = {
  extractGuideInventoryFromHtml,
  extractGuideInventoryFromFile,
  extractGuideInventories
};
