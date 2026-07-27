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

  // Per-entry freshness for the data-driven owner and stay pages.
  //
  // gitLastModifiedDate() resolves the mtime of whole FILES. Every owner page is
  // generated from the same three files, so all 27 owner URLs emitted one
  // identical <lastmod>, and all 58 stay URLs another. Editing one page bumped
  // every sibling's date by the same amount, which tells a crawler nothing about
  // which page actually changed.
  //
  // This resolves the last commit that touched each entry's own JSON, by walking
  // the history of seoPages.json once and comparing serialized entries between
  // consecutive revisions. One pass, memoized for the whole build.
  const SEO_PAGES_PATH = "src/_data/seoPages.json";
  const SEO_PAGE_GROUPS = ["owner", "vacationer"];
  let seoPageHistory = null;

  // Resolve many git objects in a single subprocess. `git cat-file --batch`
  // takes one revision spec per line on stdin and replies with
  // "<oid> <type> <size>\n<contents>\n" per hit, or "<spec> missing\n".
  // Returns contents positionally, with null for anything missing.
  function readBlobBatch(specs) {
    if (!specs.length) {
      return [];
    }

    let stdout;
    try {
      stdout = execFileSync("git", ["cat-file", "--batch"], {
        cwd: root,
        input: `${specs.join("\n")}\n`,
        maxBuffer: 512 * 1024 * 1024,
      });
    } catch {
      return specs.map(() => null);
    }

    const results = [];
    let cursor = 0;
    for (let index = 0; index < specs.length; index += 1) {
      const newline = stdout.indexOf(0x0a, cursor);
      if (newline === -1) {
        results.push(null);
        continue;
      }

      const header = stdout.toString("utf8", cursor, newline);
      if (header.endsWith(" missing")) {
        results.push(null);
        cursor = newline + 1;
        continue;
      }

      const size = Number.parseInt(header.slice(header.lastIndexOf(" ") + 1), 10);
      if (!Number.isFinite(size)) {
        results.push(null);
        cursor = newline + 1;
        continue;
      }

      const start = newline + 1;
      results.push(stdout.toString("utf8", start, start + size));
      cursor = start + size + 1; // trailing newline after contents
    }

    return results;
  }

  function seoPageEntryMap(doc) {
    const entries = new Map();
    for (const group of SEO_PAGE_GROUPS) {
      for (const entry of doc?.[group] || []) {
        if (entry?.slug) {
          entries.set(`${group}/${entry.slug}`, JSON.stringify(entry));
        }
      }
    }
    return entries;
  }

  function buildSeoPageHistory() {
    const history = new Map();

    // Walking all 64 revisions of a 480KB JSON file costs several seconds of
    // build time. Load the current entry set so the walk can stop as soon as
    // every live slug has a date, instead of parsing history nothing reads.
    let pending = null;
    try {
      pending = new Set(
        seoPageEntryMap(JSON.parse(fs.readFileSync(path.join(root, SEO_PAGES_PATH), "utf8"))).keys()
      );
    } catch {
      pending = null;
    }

    let log;
    try {
      log = execFileSync("git", ["log", "--format=%H %cI", "--", SEO_PAGES_PATH], {
        cwd: root,
        encoding: "utf8",
        maxBuffer: 16 * 1024 * 1024,
      }).trim();
    } catch {
      return history;
    }
    if (!log) {
      return history;
    }

    const revisions = log.split("\n").map((line) => {
      const splitAt = line.indexOf(" ");
      return { sha: line.slice(0, splitAt), iso: line.slice(splitAt + 1) };
    });

    // Fetch every revision's blob through ONE `git cat-file --batch` process.
    // Spawning `git show` per revision costs ~100ms each inside the loaded
    // Eleventy process (vs ~9ms standalone), which added ~6s to the build.
    const blobs = readBlobBatch(revisions.map((revision) => `${revision.sha}:${SEO_PAGES_PATH}`));

    // Newest to oldest. An entry's lastmod is the newest revision in which its
    // serialized JSON differs from the revision immediately older than it.
    let newer = null;
    for (let index = 0; index < revisions.length; index += 1) {
      const revision = revisions[index];
      let doc;
      try {
        doc = JSON.parse(blobs[index]);
      } catch {
        continue;
      }

      const older = seoPageEntryMap(doc);
      if (newer) {
        for (const [key, value] of newer.entries.entries()) {
          if (older.get(key) !== value && !history.has(key)) {
            history.set(key, newer.iso);
            if (pending) pending.delete(key);
          }
        }
      }
      newer = { entries: older, iso: revision.iso };

      if (pending && pending.size === 0) {
        break;
      }
    }

    // Anything unchanged since it first appeared dates from the oldest revision.
    if (newer) {
      for (const key of newer.entries.keys()) {
        if (!history.has(key)) {
          history.set(key, newer.iso);
        }
      }
    }

    return history;
  }

  function seoPageTimestamp(group, slug) {
    if (!seoPageHistory) {
      seoPageHistory = buildSeoPageHistory();
    }
    return seoPageHistory.get(`${group}/${slug}`) || null;
  }

  eleventyConfig.addNunjucksGlobal("seoPageLastModifiedIso", (group, slug, ...fallbackPaths) =>
    seoPageTimestamp(group, slug) || readLatestGitTimestamp(...fallbackPaths)
  );
  eleventyConfig.addNunjucksGlobal("seoPageLastModifiedDate", (group, slug, ...fallbackPaths) => {
    const isoString = seoPageTimestamp(group, slug) || readLatestGitTimestamp(...fallbackPaths);
    return isoString ? isoString.slice(0, 10) : null;
  });
  eleventyConfig.addNunjucksGlobal("seoPageLastModifiedLabel", (group, slug, ...fallbackPaths) =>
    formatDateLabel(seoPageTimestamp(group, slug) || readLatestGitTimestamp(...fallbackPaths))
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
