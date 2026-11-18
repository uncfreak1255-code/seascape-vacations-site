"use strict";

// Stay-hub and Bradenton head-term checks split out of assert-build-output.js.

function assertStayHubAndBradentonHeadTerm({ expectContains }) {
  expectContains("_site/stays/index.html", "Stay Collections");
  expectContains("_site/stays/index.html", 'href="/stays/anna-maria-island-vacation-rentals/"');
  expectContains("_site/stays/index.html", 'href="/stays/bradenton-vacation-rentals-near-beaches/"');
  expectContains("_site/stays/index.html", 'href="/stays/bradenton-vacation-rentals/"');
  expectContains("_site/stays/bradenton-vacation-rentals/index.html", "Seascape Vacations");
  expectContains(
    "_site/sitemap.xml",
    "<loc>https://seascape-vacations.com/stays/bradenton-vacation-rentals/</loc>"
  );
  expectContains("_site/sitemap.xml", "<loc>https://seascape-vacations.com/stays/</loc>");
  expectContains("_site/stays/anna-maria-island-vacation-rentals/index.html", 'class="g-header"');
  expectContains("_site/stays/anna-maria-island-vacation-rentals/index.html", 'class="g-wordmark"');
}

module.exports = { assertStayHubAndBradentonHeadTerm };
