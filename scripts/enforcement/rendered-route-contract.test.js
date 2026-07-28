const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");

const {
  assertRequiredHeadTags,
  buildRouteContract,
  extractHeadTags,
  extractJsonLdObjects,
  extractRoutePathFacts,
  extractTrackedEvents,
  extractVisibleBodyText,
  readBuiltRoute,
  readRouteSource,
  routePathFromSourcePath
} = require("./rendered-route-contract");

const projectRoot = path.resolve(__dirname, "..", "..");

const SAMPLE_HTML = `
<!doctype html>
<html lang="en">
<head>
  <title>Sample Guide Title</title>
  <meta name="description" content="Sample guide's description.">
  <meta name="author" content="Sawyer Beckett, Seascape Vacations">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="https://seascape-vacations.com/guides/sample-guide/">
  <meta property="og:url" content="https://seascape-vacations.com/guides/sample-guide/">
  <meta property="og:title" content="Sample OG Title">
  <meta property="og:description" content="Sample OG description.">
  <meta name="twitter:title" content="Sample Twitter Title">
  <meta name="twitter:description" content="Sample Twitter description.">
  <script type="application/ld+json">
    {"@context":"https://schema.org","@type":"Article","headline":"Hidden source of truth"}
  </script>
  <script type="application/ld+json">
    [{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[]}]
  </script>
  <style>.guardrail { display: none; }</style>
  <script>const hiddenCopy = "review intake";</script>
</head>
<body>
  <!-- benchmark inputs -->
  <a href="/stays/sample/" data-track-event="guide_book_direct_click" data-agent-note="canonical">Browse stays</a>
  <form data-track-form="email_capture" data-form-submit-event="email_capture_submit"></form>
  <p>Reader-visible guide copy &amp; details.</p>
  <div>{{ leakedTemplateMarker }}</div>
</body>
</html>`;

test("extractHeadTags reads primary, Open Graph, Twitter, canonical, and robots tags", () => {
  assert.deepEqual(extractHeadTags(SAMPLE_HTML), {
    title: "Sample Guide Title",
    description: "Sample guide's description.",
    author: "Sawyer Beckett, Seascape Vacations",
    canonical: "https://seascape-vacations.com/guides/sample-guide/",
    robots: "index, follow",
    ogUrl: "https://seascape-vacations.com/guides/sample-guide/",
    ogTitle: "Sample OG Title",
    ogDescription: "Sample OG description.",
    twitterTitle: "Sample Twitter Title",
    twitterDescription: "Sample Twitter description."
  });
});

test("extractVisibleBodyText excludes head, code, comments, styles, and attributes", () => {
  const text = extractVisibleBodyText(SAMPLE_HTML);

  assert.match(text, /Browse stays Reader-visible guide copy & details/);
  assert.doesNotMatch(text, /source of truth|guardrail|review intake|benchmark inputs|canonical/);
});

test("extractJsonLdObjects parses single objects and arrays from JSON-LD blocks", () => {
  assert.deepEqual(
    extractJsonLdObjects(SAMPLE_HTML).map((object) => object["@type"]),
    ["Article", "BreadcrumbList"]
  );
});

test("extractTrackedEvents reads link and form tracking events without inventing names", () => {
  assert.deepEqual(extractTrackedEvents(SAMPLE_HTML), [
    "guide_book_direct_click",
    "email_capture_submit"
  ]);
});

test("extractRoutePathFacts classifies route families and slugs", () => {
  assert.deepEqual(extractRoutePathFacts("/guides/sample-guide/"), {
    isHomepage: false,
    isGuide: true,
    isStay: false,
    isOwner: false,
    isProperty: false,
    slug: "sample-guide"
  });

  assert.deepEqual(extractRoutePathFacts("/"), {
    isHomepage: true,
    isGuide: false,
    isStay: false,
    isOwner: false,
    isProperty: false,
    slug: "home"
  });
});

test("buildRouteContract returns the small route fact Interface", () => {
  const contract = buildRouteContract({
    html: SAMPLE_HTML,
    routePath: "/guides/sample-guide/",
    sourcePath: "src/guides/sample-guide.html"
  });

  assert.equal(contract.routePath, "/guides/sample-guide/");
  assert.equal(contract.sourcePath, "src/guides/sample-guide.html");
  assert.equal(contract.head.title, "Sample Guide Title");
  assert.equal(contract.jsonLdBlocks.length, 2);
  assert.deepEqual(contract.jsonLdObjects.map((object) => object["@type"]), ["Article", "BreadcrumbList"]);
  assert.deepEqual(contract.jsonLdParseErrors, []);
  assert.deepEqual(contract.trackedEvents, ["guide_book_direct_click", "email_capture_submit"]);
  assert.match(contract.visibleBodyText, /Reader-visible guide copy & details/);
  assert.deepEqual(contract.templateLeakMarkers, ["{{"]);
  assert.deepEqual(contract.standaloneShellMarkers, []);
  assert.equal(contract.pathFacts.isGuide, true);
});

test("buildRouteContract keeps source contracts readable when template JSON-LD is not parseable yet", () => {
  const contract = buildRouteContract({
    html: `
      <title>Templated Route</title>
      <script type="application/ld+json">
        {"@context":"https://schema.org","name":{{ title | dump }}}
      </script>
    `,
    routePath: "/guides/templated/"
  });

  assert.equal(contract.jsonLdBlocks.length, 1);
  assert.deepEqual(contract.jsonLdObjects, []);
  assert.equal(contract.jsonLdParseErrors.length, 1);
  assert.match(contract.jsonLdParseErrors[0].message, /Expected property name|Unexpected token/);
});

test("assertRequiredHeadTags fails loud with route context", () => {
  assert.throws(
    () => assertRequiredHeadTags({ routePath: "/broken/", head: { title: "Only title" } }),
    /\/broken\/ missing required head tag: description/
  );
});

test("routePathFromSourcePath maps source files to public routes", () => {
  assert.equal(routePathFromSourcePath("src/index.njk"), "/");
  assert.equal(routePathFromSourcePath("src/guides/bradenton-vs-sarasota.html"), "/guides/bradenton-vs-sarasota/");
  assert.equal(routePathFromSourcePath("src/properties/dockside-dreams/index.njk"), "/properties/dockside-dreams/");
});

test("readRouteSource builds a source contract for a current guide", () => {
  const contract = readRouteSource(projectRoot, "src/guides/bradenton-vs-sarasota.html");

  assert.equal(contract.routePath, "/guides/bradenton-vs-sarasota/");
  assert.equal(contract.sourcePath, "src/guides/bradenton-vs-sarasota.html");
  assert.equal(contract.head.title, "Bradenton vs Sarasota: Which Is Better for Vacation?");
  assert.equal(contract.head.canonical, "https://seascape-vacations.com/guides/bradenton-vs-sarasota/");
  assert.equal(contract.pathFacts.isGuide, true);
});

test("readBuiltRoute builds a route contract after the site is built", () => {
  const builtProperties = path.join(projectRoot, "_site", "properties", "index.html");
  if (!fs.existsSync(builtProperties)) {
    assert.fail("_site/properties/index.html missing. Run npm run build before this built-route assertion.");
  }

  const contract = readBuiltRoute(projectRoot, "/properties/");

  assert.equal(contract.routePath, "/properties/");
  assert.equal(contract.pathFacts.isProperty, true);
  assertRequiredHeadTags(contract);
  assert.equal(contract.templateLeakMarkers.length, 0);
  assert.equal(contract.standaloneShellMarkers.length, 0);
});
