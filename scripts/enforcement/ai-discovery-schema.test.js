const fs = require("fs");
const path = require("path");
const test = require("node:test");
const assert = require("node:assert/strict");

const projectRoot = path.resolve(__dirname, "..", "..");

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

test("homepage schema advertises FAQ answers and a real searchable website target", () => {
  const homepage = fs.readFileSync(path.join(projectRoot, "src", "index.njk"), "utf8");

  assert.equal(homepage.includes('"@type": "FAQPage"'), true);
  assert.equal(homepage.includes('"@type": "WebSite"'), true);
  assert.equal(homepage.includes('"@type": "SearchAction"'), true);
  assert.equal(
    homepage.includes('"urlTemplate": "https://seascape-vacations.com/properties/?area={search_term_string}"'),
    true
  );
  assert.equal(homepage.includes('"query-input": "required name=search_term_string"'), true);
});

test("properties catalog honors incoming area filters from homepage search and SearchAction", () => {
  const catalog = fs.readFileSync(path.join(projectRoot, "src", "properties", "index.njk"), "utf8");

  assert.equal(catalog.includes("new URLSearchParams(window.location.search)"), true);
  assert.equal(catalog.includes('params.get("area")'), true);
  assert.equal(catalog.includes('requestedArea.includes("anna-maria-island")'), true);
  assert.equal(catalog.includes('requestedArea.includes("sarasota")'), true);
  assert.equal(catalog.includes('const initialFilter ='), true);
  assert.equal(catalog.includes("applyFilter(initialFilter)"), true);
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
