const seoPages = require("./seoPages.json");

module.exports = seoPages.vacationer.filter((page) => !page.rehomeTo);
