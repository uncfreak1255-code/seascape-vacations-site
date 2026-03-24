const fs = require("fs");
const path = require("path");
const test = require("node:test");
const assert = require("node:assert/strict");

const projectRoot = path.resolve(__dirname, "..", "..");
const homepage = fs.readFileSync(path.join(projectRoot, "src", "index.njk"), "utf8");
const robots = fs.readFileSync(path.join(projectRoot, "src", "robots.txt"), "utf8");
const propertyPages = [
  "bradenton-pool-home",
  "dockside-dreams",
  "river-house",
  "sarasota-luxe",
  "the-oasis"
].map((slug) => ({
  slug,
  source: fs.readFileSync(path.join(projectRoot, "src", "properties", slug, "index.njk"), "utf8")
}));
const guideDir = path.join(projectRoot, "src", "guides");

function listGuideFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return listGuideFiles(fullPath);
    if (!fullPath.endsWith(".html")) return [];
    return [fullPath];
  });
}

const guideFiles = listGuideFiles(guideDir).map((fullPath) => ({
  path: path.relative(projectRoot, fullPath),
  source: fs.readFileSync(fullPath, "utf8")
}));

test("robots.txt stays within supported directives", () => {
  assert.equal(
    robots.includes("LLMs-txt:"),
    false,
    "robots.txt should not emit unsupported LLMs-txt directives"
  );
});

test("llms inventory only advertises live canonical URLs", () => {
  const llms = fs.readFileSync(path.join(projectRoot, "src", "llms.txt"), "utf8");
  const urls = Array.from(
    llms.matchAll(/\[[^\]]+\]\((https:\/\/seascape-vacations\.com[^)]+)\)/g),
    (match) => match[1]
  );

  assert.equal(llms.includes("/contact/"), false);
  assert.equal(llms.includes("/reviews/"), false);
  assert.equal(llms.includes("Bradenton vs Sarasota Vacation Rental Comparison"), false);

  const duplicateUrls = urls.filter((url, index) => urls.indexOf(url) !== index);
  assert.deepEqual(duplicateUrls, []);

  for (const url of urls) {
    const pathname = new URL(url).pathname;
    assert.equal(
      pathname.endsWith("/"),
      true,
      `${url} should use the canonical trailing-slash route`
    );
  }
});

test("homepage schema advertises a real searchable website target", () => {
  assert.equal(homepage.includes('"@type": "WebSite"'), true);
  assert.equal(homepage.includes('"@type": "SearchAction"'), true);
  assert.equal(
    homepage.includes('"urlTemplate": "https://seascape-vacations.com/properties/?area={search_term_string}"'),
    true
  );
  assert.equal(homepage.includes('"query-input": "required name=search_term_string"'), true);
});

test("homepage does not ship hidden FAQ schema without visible FAQ content", () => {
  assert.equal(
    homepage.includes('"@type": "FAQPage"'),
    false,
    "Homepage should not ship FAQPage schema unless the FAQ content is actually present on the page"
  );
});

test("properties catalog honors incoming area filters from homepage search and SearchAction", () => {
  const catalog = fs.readFileSync(path.join(projectRoot, "src", "properties", "index.njk"), "utf8");

  assert.equal(catalog.includes("new URLSearchParams(window.location.search)"), true);
  assert.equal(catalog.includes('params.get("area")'), true);
  assert.equal(catalog.includes('requestedArea.includes("anna-maria-island")'), true);
  assert.equal(catalog.includes('requestedArea.includes("sarasota")'), true);
  assert.equal(catalog.includes("const initialFilter ="), true);
  assert.equal(catalog.includes("applyFilter(initialFilter)"), true);
});

test("property pages with AggregateOffer do not also ship a stale priceRange", () => {
  for (const page of propertyPages) {
    if (!page.source.includes('"@type": "AggregateOffer"')) continue;
    assert.equal(
      page.source.includes('"priceRange"'),
      false,
      `${page.slug} should not mix AggregateOffer with a separate stale priceRange string`
    );
  }
});

test("property schema uses public Hostaway-backed reviews where available", () => {
  const expectations = [
    {
      file: path.join(projectRoot, "src", "properties", "dockside-dreams", "index.njk"),
      reviews: [
        ["Tracy Bunce", "2025-08-10", "We could not have been happier with our stay!"],
        ["Tyler Johnson", "2025-07-01", "Great house in a good neighborhood."],
        ["Heather Vozza", "2024-09-30", "This home was absolutely gorgeous and very clean!"]
      ]
    },
    {
      file: path.join(projectRoot, "src", "properties", "the-oasis", "index.njk"),
      reviews: [
        ["David Kohley", "2026-02-03", "House was very well stocked and plenty of room for everyone staying."],
        ["Anna Cannon", "2025-07-25", "Absolutely beautiful house, looks even bigger in person"],
        ["Joshua Rogers", "2025-07-19", "The house had everything we wanted!"]
      ]
    },
    {
      file: path.join(projectRoot, "src", "properties", "sarasota-luxe", "index.njk"),
      reviews: [
        ["Stanley Shake", "2025-09-29", "This house is absolutely beautiful"],
        ["ANN MARIE GIUDICE", "2025-04-29", "Amazing home near downtown."],
        ["Bryce Mewhorter", "2025-04-06", "Fantastic property, easy check in, very clean"]
      ]
    },
    {
      file: path.join(projectRoot, "src", "properties", "river-house", "index.njk"),
      reviews: [
        ["Andrew Coblentz", "2026-01-03", "We had a great time!"],
        ["Florian Lasserre", "2025-08-14", "Perfect location, very nice neighborhood"],
        ["Brittany Byrne", "2025-05-28", "Loved the convenience of this house!"]
      ]
    }
  ];

  for (const expectation of expectations) {
    const source = fs.readFileSync(expectation.file, "utf8");
    assert.equal(source.includes("TODO: Replace with real Hostaway reviews"), false);

    for (const [name, date, snippet] of expectation.reviews) {
      assert.equal(source.includes(name), true, `${path.basename(path.dirname(expectation.file))} missing ${name}`);
      assert.equal(source.includes(date), true, `${path.basename(path.dirname(expectation.file))} missing ${date}`);
      assert.equal(source.includes(snippet), true, `${path.basename(path.dirname(expectation.file))} missing review snippet ${snippet}`);
    }
  }
});

test("bradenton pool home does not claim structured review proof that is not public yet", () => {
  const source = fs.readFileSync(
    path.join(projectRoot, "src", "properties", "bradenton-pool-home", "index.njk"),
    "utf8"
  );

  assert.equal(source.includes("TODO: Replace with real Hostaway reviews"), false);
  assert.equal(source.includes('"@type": "Review"'), false);
  assert.equal(source.includes('"@type": "AggregateRating"'), false);
});

test("guide pages only claim Sawyer authorship when the page visibly supports it", () => {
  for (const guide of guideFiles) {
    const claimsSawyer =
      guide.source.includes('"author": {"@type": "Person", "name": "Sawyer Beck"') ||
      guide.source.includes('"author":{"@type":"Person","name":"Sawyer Beck"');

    if (!claimsSawyer) continue;

    const showsSawyer =
      guide.source.includes('meta name="author" content="Sawyer Beck"') ||
      guide.source.includes('data-guide-author="sawyer-beck"') ||
      guide.source.includes("By Sawyer Beck");

    assert.equal(
      showsSawyer,
      true,
      `${guide.path} claims Sawyer Beck in JSON-LD without visible page-level authorship support`
    );
  }
});
