const fs = require("fs");
const path = require("path");
const {
  findStandaloneShellMarkers,
  findTemplateLeakMarkers
} = require("./lib");

function normalizeText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function decodeHtmlAttribute(value) {
  return String(value || "")
    .replace(/&quot;/g, '"')
    .replace(/&#34;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .trim();
}

function findFirst(html, pattern) {
  const match = String(html || "").match(pattern);
  return match ? decodeHtmlAttribute(match[1]) : null;
}

function extractAttribute(tag, attributeName) {
  const attributePattern = new RegExp(`\\b${attributeName}\\s*=\\s*(["'])([\\s\\S]*?)\\1`, "i");
  const match = String(tag || "").match(attributePattern);
  return match ? decodeHtmlAttribute(match[2]) : null;
}

function findMetaContent(html, attributeName, attributeValue) {
  const tagPattern = /<meta\b[^>]*>/gi;
  let match;

  while ((match = tagPattern.exec(String(html || ""))) !== null) {
    const tag = match[0];
    if (extractAttribute(tag, attributeName) === attributeValue) {
      return extractAttribute(tag, "content");
    }
  }

  return null;
}

function findLinkHref(html, relValue) {
  const tagPattern = /<link\b[^>]*>/gi;
  let match;

  while ((match = tagPattern.exec(String(html || ""))) !== null) {
    const tag = match[0];
    if (extractAttribute(tag, "rel") === relValue) {
      return extractAttribute(tag, "href");
    }
  }

  return null;
}

function extractHeadTags(html) {
  return {
    title: findFirst(html, /<title>([\s\S]*?)<\/title>/i),
    description: findMetaContent(html, "name", "description"),
    canonical: findLinkHref(html, "canonical"),
    robots: findMetaContent(html, "name", "robots"),
    ogTitle: findMetaContent(html, "property", "og:title"),
    ogDescription: findMetaContent(html, "property", "og:description"),
    twitterTitle: findMetaContent(html, "name", "twitter:title"),
    twitterDescription: findMetaContent(html, "name", "twitter:description")
  };
}

function extractJsonLdBlocks(html) {
  const blocks = [];
  const pattern = /<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match;

  while ((match = pattern.exec(String(html || ""))) !== null) {
    blocks.push(match[1].trim());
  }

  return blocks;
}

function extractJsonLdObjects(html) {
  return extractJsonLdBlocks(html).flatMap((block) => {
    const parsed = JSON.parse(block);
    return Array.isArray(parsed) ? parsed : [parsed];
  });
}

function parseJsonLdBlocks(blocks) {
  const objects = [];
  const errors = [];

  blocks.forEach((block, index) => {
    try {
      const parsed = JSON.parse(block);
      objects.push(...(Array.isArray(parsed) ? parsed : [parsed]));
    } catch (error) {
      errors.push({
        index,
        message: error.message
      });
    }
  });

  return { objects, errors };
}

function extractTrackedEvents(html) {
  const events = [];
  const patterns = [
    /\bdata-track-event=["']([^"']+)["']/gi,
    /\bdata-form-submit-event=["']([^"']+)["']/gi
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(String(html || ""))) !== null) {
      events.push(match[1]);
    }
  }

  return [...new Set(events)];
}

function normalizeRoutePath(routePath) {
  const value = String(routePath || "/").trim();
  if (!value || value === "/") return "/";
  const withLeadingSlash = value.startsWith("/") ? value : `/${value}`;
  return withLeadingSlash.endsWith("/") ? withLeadingSlash : `${withLeadingSlash}/`;
}

function extractRoutePathFacts(routePath) {
  const normalized = normalizeRoutePath(routePath);
  const parts = normalized.split("/").filter(Boolean);
  const slug = normalized === "/" ? "home" : parts[parts.length - 1] || "home";

  return {
    isHomepage: normalized === "/",
    isGuide: normalized.startsWith("/guides/"),
    isStay: normalized.startsWith("/stays/"),
    isOwner: normalized.startsWith("/property-management/"),
    isProperty: normalized.startsWith("/properties/"),
    slug
  };
}

function buildRouteContract({ html, routePath = "/", sourcePath = null } = {}) {
  const contents = String(html || "");
  const normalizedRoutePath = normalizeRoutePath(routePath);
  const jsonLdBlocks = extractJsonLdBlocks(contents);
  const parsedJsonLd = parseJsonLdBlocks(jsonLdBlocks);

  return {
    routePath: normalizedRoutePath,
    sourcePath,
    head: extractHeadTags(contents),
    jsonLdBlocks,
    jsonLdObjects: parsedJsonLd.objects,
    jsonLdParseErrors: parsedJsonLd.errors,
    trackedEvents: extractTrackedEvents(contents),
    templateLeakMarkers: findTemplateLeakMarkers(contents),
    standaloneShellMarkers: findStandaloneShellMarkers(contents),
    pathFacts: extractRoutePathFacts(normalizedRoutePath)
  };
}

function routePathFromSourcePath(relativePath) {
  const normalized = String(relativePath || "").replace(/\\/g, "/");
  if (normalized === "src/index.njk") return "/";
  if (normalized.endsWith("/index.njk") || normalized.endsWith("/index.html")) {
    return `/${normalized.replace(/^src\//, "").replace(/\/index\.(njk|html)$/, "")}/`;
  }
  return `/${normalized.replace(/^src\//, "").replace(/\.(njk|html|md)$/, "")}/`;
}

function readRouteSource(projectRoot, relativePath) {
  const fullPath = path.join(projectRoot, relativePath);
  return buildRouteContract({
    html: fs.readFileSync(fullPath, "utf8"),
    routePath: routePathFromSourcePath(relativePath),
    sourcePath: relativePath
  });
}

function readBuiltRoute(projectRoot, routePath) {
  const normalized = normalizeRoutePath(routePath);
  const builtPath = normalized === "/"
    ? path.join(projectRoot, "_site", "index.html")
    : path.join(projectRoot, "_site", normalized, "index.html");

  return buildRouteContract({
    html: fs.readFileSync(builtPath, "utf8"),
    routePath: normalized,
    sourcePath: path.relative(projectRoot, builtPath)
  });
}

function assertRequiredHeadTags(contract, required = ["title", "description", "canonical"]) {
  for (const field of required) {
    if (!normalizeText(contract?.head?.[field])) {
      throw new Error(`${contract?.routePath || "unknown route"} missing required head tag: ${field}`);
    }
  }
}

module.exports = {
  assertRequiredHeadTags,
  buildRouteContract,
  extractHeadTags,
  extractJsonLdBlocks,
  extractJsonLdObjects,
  extractRoutePathFacts,
  extractTrackedEvents,
  readBuiltRoute,
  readRouteSource,
  routePathFromSourcePath
};
