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
  eleventyConfig.addPassthroughCopy({ "src/_redirects": "_redirects" });
  eleventyConfig.addPassthroughCopy({ "src/llms.txt": "llms.txt" });
  eleventyConfig.addPassthroughCopy({ "src/robots.txt": "robots.txt" });
  eleventyConfig.addPassthroughCopy({ "src/guides": "guides" });
  
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

  eleventyConfig.addFilter("imgProxy", function(url, width = 800) {
    const clean = String(url || "").replace(/^https?:\/\//, "");
    return `https://images.weserv.nl/?url=${encodeURIComponent(clean)}&w=${width}&output=webp&q=82`;
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
