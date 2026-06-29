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

function hasEntityCoverageSchema(content) {
  return /"@type"\s*:\s*"(Organization|LocalBusiness)"/.test(content);
}

module.exports = function(eleventyConfig) {
  const root = process.cwd();
  const gitTimestampCache = new Map();

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
