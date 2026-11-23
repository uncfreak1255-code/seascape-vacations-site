"use strict";
// One Nunjucks setup for rendering a catalog piece's partial outside Eleventy, so the
// preview cards and each piece's test render it with the same options (Eleventy's
// defaults: eleventy.config.js sets none).
const path = require("path");
const nunjucks = require("nunjucks");

module.exports = () => new nunjucks.Environment(new nunjucks.FileSystemLoader(path.resolve(__dirname, "../../../src/_includes")), { autoescape: true });
