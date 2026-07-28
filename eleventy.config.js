const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

function formatDateLabel(isoString) {
  if (!isoString) return null;
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(isoString));
}

function toHostawayCdn(url, width = 800, quality = 82) {
  const value = String(url || "").trim();
  if (!value) return value;

  const cleanValue = value.split("?")[0];

  if (cleanValue.includes("bookingenginecdn.hostaway.com/")) {
    return `${cleanValue}?width=${width}&quality=${quality}&format=webp&v=2`;
  }

  const hostawayPrefix = "https://hostaway-platform.s3.us-west-2.amazonaws.com/";
  if (cleanValue.startsWith(hostawayPrefix)) {
    const assetPath = cleanValue.slice(hostawayPrefix.length);
    return `https://bookingenginecdn.hostaway.com/${assetPath}?width=${width}&quality=${quality}&format=webp&v=2`;
  }

  return value;
}

const ENTITY_COVERAGE_OUTPUT_PATHS = new Set([
  // Keep this list narrow to proven gaps from coverage checks.
  "/guides/index.html",
]);

const ORGANIZATION_ENTITY_SCHEMA = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Seascape Vacations",
  url: "https://seascape-vacations.com",
  logo: {
    "@type": "ImageObject",
    url: "https://seascape-vacations.com/logo-optimized.png",
  },
});

const SEO_PAGES_PATH = "src/_data/seoPages.json";

function hasEntityCoverageSchema(content) {
  return /"@type"\s*:\s*"(Organization|LocalBusiness)"/.test(content);
}

module.exports = function(eleventyConfig) {
  const root = process.cwd();
  const gitTimestampCache = new Map();
  const gitPatternTimestampCache = new Map();

  function readLatestGitTimestamp(...candidatePaths) {
    let latestTimestamp = null;

    for (const candidatePath of candidatePaths.flat().filter(Boolean)) {
      const resolvedPath = path.isAbsolute(candidatePath)
        ? candidatePath
        : path.join(root, candidatePath);

      if (!fs.existsSync(resolvedPath)) {
        continue;
      }

      let isoString = gitTimestampCache.get(resolvedPath);

      if (isoString === undefined) {
        try {
          const relativePath = path.relative(root, resolvedPath);
          isoString = execFileSync("git", ["log", "-1", "--format=%cI", "--", relativePath], {
            cwd: root,
            encoding: "utf8",
          }).trim();
        } catch {
          isoString = "";
        }

        if (!isoString) {
          isoString = new Date(fs.statSync(resolvedPath).mtimeMs).toISOString();
        }

        gitTimestampCache.set(resolvedPath, isoString);
      }

      if (!latestTimestamp || new Date(isoString) > new Date(latestTimestamp)) {
        latestTimestamp = isoString;
      }
    }

    return latestTimestamp;
  }

  function readLatestGitSearchTimestamp(pattern, candidatePath) {
    const cacheKey = `${pattern}\0${candidatePath}`;
    if (gitPatternTimestampCache.has(cacheKey)) {
      return gitPatternTimestampCache.get(cacheKey);
    }

    let isoString = "";
    try {
      const relativePath = path.relative(root, path.join(root, candidatePath));
      isoString = execFileSync(
        "git",
        ["log", "-1", "--format=%cI", `-S${pattern}`, "--", relativePath],
        { cwd: root, encoding: "utf8" }
      ).trim();
    } catch {
      isoString = "";
    }

    gitPatternTimestampCache.set(cacheKey, isoString || null);
    return isoString || null;
  }

  eleventyConfig.addNunjucksGlobal("gitLastModifiedIso", (...candidatePaths) =>
    readLatestGitTimestamp(...candidatePaths)
  );
  eleventyConfig.addNunjucksGlobal("gitLastModifiedDate", (...candidatePaths) => {
    const isoString = readLatestGitTimestamp(...candidatePaths);
    return isoString ? isoString.slice(0, 10) : null;
  });
  eleventyConfig.addNunjucksGlobal("gitLastModifiedLabel", (...candidatePaths) =>
    formatDateLabel(readLatestGitTimestamp(...candidatePaths))
  );

  function latestIsoString(...candidateTimestamps) {
    let latestTimestamp = null;
    for (const isoString of candidateTimestamps) {
      if (
        isoString &&
        (!latestTimestamp || new Date(isoString) > new Date(latestTimestamp))
      ) {
        latestTimestamp = isoString;
      }
    }
    return latestTimestamp;
  }

  // Per-entry freshness for the data-driven owner and stay pages. The history
  // walk (first-parent ordering, shallow-clone degradation, batched blob reads)
  // lives in scripts/seo/seo-page-history.js so the enforcement suite can
  // exercise it against controlled fixture repositories.
  //
  // Deliberately NOT included when page-specific history exists: page-related
  // overlays or shared template/data timestamps. Measured against the real
  // data, both can re-flatten generated page families and recreate the exact
  // bug this change exists to fix. A sibling card's title tweak, template edit,
  // or family-wide data touch is not a meaningful change to THIS page's primary
  // content, which is what sitemap lastmod signals. Release/build proof covers
  // shared rendering changes; this helper keeps generated SEO page dates
  // page-content-specific.
  const { buildSeoPageHistory: buildSeoPageEntryHistory } =
    require("./scripts/seo/seo-page-history.js");
  let seoPageHistory = null;

  function getSeoPageHistory() {
    if (!seoPageHistory) {
      seoPageHistory = buildSeoPageEntryHistory({ cwd: root, warn: console.warn });
    }
    return seoPageHistory;
  }

  function seoPageTimestamp(group, slug, ...fallbackPaths) {
    const history = getSeoPageHistory();
    const entryTimestamp = history.get(`${group}/${slug}`);
    const governanceTimestamp = group === "vacationer"
      ? readLatestGitSearchTimestamp(`"${slug}"`, "src/_data/seoGovernance.js")
      : null;
    const ownerProofTimestamp = group === "owner"
      ? readLatestGitTimestamp(
        fallbackPaths.filter((candidatePath) => candidatePath === "src/_data/ownerProofAssets.json")
      )
      : null;
    const pageSpecificTimestamp = latestIsoString(
      entryTimestamp,
      governanceTimestamp,
      ownerProofTimestamp
    );

    return (
      pageSpecificTimestamp ||
      readLatestGitTimestamp(SEO_PAGES_PATH, ...fallbackPaths)
    );
  }

  eleventyConfig.addNunjucksGlobal("seoPageLastModifiedIso", (group, slug, ...fallbackPaths) =>
    seoPageTimestamp(group, slug, ...fallbackPaths)
  );
  eleventyConfig.addNunjucksGlobal("seoPageLastModifiedDate", (group, slug, ...fallbackPaths) => {
    const isoString = seoPageTimestamp(group, slug, ...fallbackPaths);
    return isoString ? isoString.slice(0, 10) : null;
  });
  eleventyConfig.addNunjucksGlobal("seoPageLastModifiedLabel", (group, slug, ...fallbackPaths) =>
    formatDateLabel(seoPageTimestamp(group, slug, ...fallbackPaths))
  );

  // Pass through static assets (preserves current design)
  eleventyConfig.addPassthroughCopy("images");
  eleventyConfig.addPassthroughCopy("css");
  eleventyConfig.addPassthroughCopy({ "src/css": "css" });
  eleventyConfig.addPassthroughCopy("js");
  eleventyConfig.addPassthroughCopy("hero-optimized.jpg");
  eleventyConfig.addPassthroughCopy("hero-mobile.jpg");
  eleventyConfig.addPassthroughCopy("*.png");
  eleventyConfig.addPassthroughCopy("*.webp");
  eleventyConfig.addPassthroughCopy("*.avif");
  eleventyConfig.addPassthroughCopy("_headers");
  eleventyConfig.addPassthroughCopy({ "src/_redirects": "_redirects" });
  eleventyConfig.addPassthroughCopy({ "src/llms.txt": "llms.txt" });
  eleventyConfig.addPassthroughCopy({ "src/robots.txt": "robots.txt" });
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.ignores.add("src/guides/anna-maria-island-vacation-cost-guide-2026/**");
  eleventyConfig.ignores.add("src/guides/best-time-to-visit-anna-maria-island/**");

  eleventyConfig.on("eleventy.after", () => {
    const root = process.cwd();
    for (const [source, target] of [
      [path.join(root, "src", "_redirects"), path.join(root, "_site", "_redirects")],
      [path.join(root, "src", "llms.txt"), path.join(root, "_site", "llms.txt")],
      [path.join(root, "src", "robots.txt"), path.join(root, "_site", "robots.txt")]
    ]) {
      if (fs.existsSync(source)) {
        fs.copyFileSync(source, target);
      }
    }
  });
  
  // Watch for changes during development
  eleventyConfig.addWatchTarget("./_data/");
  
  // Simple title filter - just appends site name if not already there
  eleventyConfig.addFilter("seoTitle", function(title) {
    if (!title) return "Seascape Vacations | Florida Gulf Coast Vacation Rentals";
    if (title.includes("Seascape")) return title;
    return `${title} | Seascape Vacations`;
  });
  
  // Simple description filter - provides fallback
  eleventyConfig.addFilter("seoDescription", function(description) {
    if (!description) return "Luxury vacation rentals on Florida's Gulf Coast. Book direct and save.";
    return description;
  });

  eleventyConfig.addFilter("stripHtml", function(input) {
    return String(input || "")
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  });

  eleventyConfig.addFilter("json", function(input) {
    return JSON.stringify(input || null);
  });

  eleventyConfig.addFilter("imgProxy", function(url, width = 800) {
    return toHostawayCdn(url, width, 82);
  });

  eleventyConfig.addTransform("entitySchemaCoverage", function(content, outputPath) {
    if (!outputPath || !outputPath.endsWith(".html")) {
      return content;
    }

    const relativeOutputPath = outputPath.split(path.sep).join("/").replace(/^.*\/_site/, "");
    if (!ENTITY_COVERAGE_OUTPUT_PATHS.has(relativeOutputPath)) {
      return content;
    }

    if (hasEntityCoverageSchema(content)) {
      return content;
    }

    return content.replace(
      /<\/head>/i,
      `<script type="application/ld+json">${ORGANIZATION_ENTITY_SCHEMA}</script></head>`
    );
  });

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data"
    },
    templateFormats: ["njk", "html", "md"],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk"
  };
};
