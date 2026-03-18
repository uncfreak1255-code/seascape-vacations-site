const fs = require("fs");
const path = require("path");

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

module.exports = function(eleventyConfig) {
  // Pass through static assets (preserves current design)
  eleventyConfig.addPassthroughCopy("images");
  eleventyConfig.addPassthroughCopy("css");
  eleventyConfig.addPassthroughCopy("js");
  eleventyConfig.addPassthroughCopy("*.jpg");
  eleventyConfig.addPassthroughCopy("*.png");
  eleventyConfig.addPassthroughCopy("*.webp");
  eleventyConfig.addPassthroughCopy("*.avif");
  eleventyConfig.addPassthroughCopy("netlify");
  eleventyConfig.addPassthroughCopy("_headers");
  eleventyConfig.addPassthroughCopy({ "_redirects": "_redirects" });
  eleventyConfig.addPassthroughCopy({ "llms.txt": "llms.txt" });
  eleventyConfig.addPassthroughCopy({ "robots.txt": "robots.txt" });
  eleventyConfig.addPassthroughCopy({ "src/guides": "guides" });

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
