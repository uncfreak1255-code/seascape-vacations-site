const fs = require("fs");
const path = require("path");
const test = require("node:test");
const assert = require("node:assert/strict");

const projectRoot = path.resolve(__dirname, "..", "..");
const homepage = fs.readFileSync(path.join(projectRoot, "src", "index.njk"), "utf8");
const llms = fs.readFileSync(path.join(projectRoot, "src", "llms.txt"), "utf8");
const robots = fs.readFileSync(path.join(projectRoot, "src", "robots.txt"), "utf8");
const aiDiscovery = fs.readFileSync(path.join(projectRoot, "src", "ai-discovery.json.njk"), "utf8");
const aiWellKnown = fs.readFileSync(path.join(projectRoot, "src", ".well-known", "ai.txt.njk"), "utf8");
const aiSummary = fs.readFileSync(path.join(projectRoot, "src", "ai", "summary.json.njk"), "utf8");
const aiService = fs.readFileSync(path.join(projectRoot, "src", "ai", "service.json.njk"), "utf8");
const aiFaq = fs.readFileSync(path.join(projectRoot, "src", "ai", "faq.json.njk"), "utf8");
const seoPages = require(path.join(projectRoot, "src", "_data", "seoPages.json"));
const staysTemplate = fs.readFileSync(path.join(projectRoot, "src", "stays", "stays.njk"), "utf8");
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
const areaGuideFiles = [
  "src/guides/anna-maria-island-area-guide/index.html",
  "src/guides/bradenton-area-guide/index.html",
  "src/guides/bradenton-beach-area-guide/index.html",
  "src/guides/holmes-beach-area-guide/index.html",
  "src/guides/longboat-key-area-guide/index.html",
  "src/guides/sarasota-area-guide/index.html",
  "src/guides/siesta-key-area-guide/index.html"
].map((relativePath) => ({
  path: relativePath,
  source: fs.readFileSync(path.join(projectRoot, relativePath), "utf8")
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
    const isFileEndpoint = /\.(json|txt)$/.test(pathname);
    assert.equal(
      pathname.endsWith("/") || isFileEndpoint,
      true,
      `${url} should use the canonical route format`
    );
  }
});

test("AMI large-group page is source-managed and truthful about near-island location", () => {
  const page = seoPages.vacationer.find(
    (candidate) => candidate.slug === "large-group-vacation-rentals-anna-maria-island"
  );

  assert.ok(page, "AMI large-group stay page must live in src/_data/seoPages.json");
  assert.equal(page.title, "Large Group Vacation Rentals Near Anna Maria Island with Private Pools");
  assert.equal(page.h1, "Large Group Vacation Rentals Near Anna Maria Island with Private Pools");
  assert.equal(
    page.bluntAnswer,
    "These homes are in Bradenton, not on Anna Maria Island, but they are 10-15 minutes from AMI beaches and sleep 10-16 guests."
  );
  assert.deepEqual(page.matchingProperties, [
    "the-oasis",
    "dockside-dreams",
    "river-house",
    "bradenton-pool-home"
  ]);

  const serializedPage = JSON.stringify(page);
  for (const bannedClaim of [
    "largest private vacation rental on the island",
    "Anna Maria Island's largest",
    "owns and manages two of the largest private vacation rentals on the island"
  ]) {
    assert.equal(
      serializedPage.includes(bannedClaim),
      false,
      `AMI large-group page should not claim Bradenton homes are ${bannedClaim}`
    );
  }

  assert.equal(page.propertyFacts.length, 4);
  for (const property of page.propertyFacts) {
    assert.equal(property.city, "Bradenton", `${property.name} should declare the real city`);
    assert.match(property.bookingUrl, /^https:\/\/book\.seascape-vacations\.com\/listings\/\d+$/);
    assert.match(property.beachDistance, /(Beach|Anna Maria Island)/);
  }

  assert.equal(
    llms.includes("https://seascape-vacations.com/stays/large-group-vacation-rentals-anna-maria-island/"),
    true,
    "llms.txt should advertise the canonical AMI large-group page"
  );
});

test("AI discovery inventory answers proven buyer-intent misses without overclaiming island inventory", () => {
  const requiredPhrases = [
    "Sarasota private-pool vacation rental",
    "Bradenton private-pool rental near the beach",
    "Dockside Dreams private dock rental",
    "Book direct Bradenton/Sarasota vacation rental",
    "Sarasota vacation rental management",
    "Seascape's Bradenton homes are near Anna Maria Island"
  ];

  for (const phrase of requiredPhrases) {
    assert.equal(llms.includes(phrase), true, `llms.txt missing buyer-intent phrase: ${phrase}`);
  }

  const site = require(path.join(projectRoot, "src", "_data", "site.json"));
  assert.equal(
    site.description,
    "Locally managed private-pool vacation rentals in Bradenton and Sarasota, Florida, near Anna Maria Island, Siesta Key, and Lido Key beaches."
  );
  assert.equal(
    site.sameAsLinks.includes("https://www.bradentongulfislands.com/listing/seascape-vacations/"),
    true,
    "sameAsLinks should include the verified Bradenton Gulf Islands profile"
  );

  const nearAmiPoolPage = seoPages.vacationer.find(
    (candidate) => candidate.slug === "anna-maria-island-homes-with-pool"
  );
  const familyNearAmiPage = seoPages.vacationer.find(
    (candidate) => candidate.slug === "family-vacation-rentals-anna-maria-island"
  );
  const nearAmiPage = seoPages.vacationer.find(
    (candidate) => candidate.slug === "anna-maria-island-vacation-rentals"
  );

  assert.equal(nearAmiPoolPage.title, "Vacation Rentals Near Anna Maria Island with Private Pools");
  assert.equal(familyNearAmiPage.title, "Family Vacation Rentals Near Anna Maria Island");
  assert.equal(nearAmiPage.h1, "Vacation Rentals Near Anna Maria Island");

  for (const page of [nearAmiPoolPage, familyNearAmiPage, nearAmiPage]) {
    const serializedPage = JSON.stringify(page);
    assert.equal(
      serializedPage.includes("vacation rentals on Anna Maria Island"),
      false,
      `${page.slug} should say near Anna Maria Island when describing Seascape inventory`
    );
  }
});

test("AI discovery contract exposes proof-gated conversion surfaces", () => {
  assert.equal(homepage.includes('rel="alternate" type="application/json"'), true);
  assert.equal(homepage.includes("https://seascape-vacations.com/ai-discovery.json"), true);
  assert.equal(llms.includes("https://seascape-vacations.com/ai-discovery.json"), true);

  for (const marker of [
    '"guest_capture": ["email_capture_submit"]',
    '"booking_engine_handoff": ["booking_engine_handoff", "property_booking_page_click"]',
    '"owner_lead": ["owner_form_submit"]',
    '"source_context_parameters": ["source_context", "ai_platform", "referrer_host", "utm_source", "landing_page_path"]',
    "Seascape does not publish a current direct-booking revenue performance figure"
  ]) {
    assert.equal(aiDiscovery.includes(marker), true, `ai-discovery.json missing ${marker}`);
  }
});

test("AI endpoint layer advertises canonical summaries without replacing the main contract", () => {
  for (const endpoint of [
    "https://seascape-vacations.com/.well-known/ai.txt",
    "https://seascape-vacations.com/ai/summary.json",
    "https://seascape-vacations.com/ai/service.json",
    "https://seascape-vacations.com/ai/faq.json"
  ]) {
    const sourceEndpoint = endpoint.replace("https://seascape-vacations.com", "{{ site.url }}");
    assert.equal(aiDiscovery.includes(sourceEndpoint), true, `ai-discovery.json source missing ${sourceEndpoint}`);
    assert.equal(llms.includes(endpoint), true, `llms.txt missing ${endpoint}`);
  }

  assert.equal(aiWellKnown.includes("Primary machine-readable contract: {{ site.url }}/ai-discovery.json"), true);
  assert.equal(aiSummary.includes('"location_boundary"'), true);
  assert.equal(aiSummary.includes("do not describe Bradenton homes as on-island inventory"), true);
  assert.equal(aiService.includes('"performance_note"'), true);
  assert.equal(aiService.includes("Seascape does not publish a current direct-booking revenue performance figure"), true);
  assert.equal(aiFaq.includes('"questions"'), true);
  assert.equal(aiFaq.includes("Any future figure must be based on reviewed reservation data"), true);
});

test("AI endpoint layer builds the advertised machine-readable files", () => {
  for (const builtPath of [
    [".well-known", "ai.txt"],
    ["ai", "summary.json"],
    ["ai", "service.json"],
    ["ai", "faq.json"]
  ]) {
    assert.equal(fs.existsSync(path.join(projectRoot, "_site", ...builtPath)), true, `${builtPath.join("/")} should build`);
  }
});

test("stays template can render citation-ready property facts with booking offers", () => {
  assert.equal(staysTemplate.includes("seoPage.propertyFacts"), true);
  assert.equal(staysTemplate.includes('"@type": "Offer"'), true);
  assert.equal(staysTemplate.includes('"url": "{{ property.bookingUrl }}"'), true);
  assert.equal(staysTemplate.includes("Check direct dates"), true);
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

test("homepage brand signals stay consistent on title, visible hero copy, and website schema", () => {
  assert.match(
    homepage,
    /<title>Seascape Vacations \| Bradenton & Sarasota Vacation Rentals Near Anna Maria Island<\/title>/
  );
  assert.match(
    homepage,
    /<span>Seascape Vacations<\/span>/
  );
  assert.equal(
    homepage.includes('"alternateName": "seascape-vacations.com"'),
    true
  );
});

test("homepage does not ship hidden FAQ schema without visible FAQ content", () => {
  assert.equal(
    homepage.includes('"@type": "FAQPage"'),
    false,
    "Homepage should not ship FAQPage schema unless the FAQ content is actually present on the page"
  );
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

test("property pages no longer advertise an invented sitewide 420+ review total", () => {
  for (const page of propertyPages) {
    assert.equal(
      page.source.includes("Read all 420+ guest reviews"),
      false,
      `${page.slug} should not advertise a made-up cross-property review total`
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

test("guide schema avoids stale generic price ranges and fake destination review totals", () => {
  for (const guide of guideFiles) {
    assert.equal(
      guide.source.includes('"priceRange"'),
      false,
      `${guide.path} should not ship generic priceRange schema`
    );
  }

  for (const guide of areaGuideFiles) {
    assert.equal(
      guide.source.includes('"aggregateRating"'),
      false,
      `${guide.path} should not claim destination-level aggregate ratings`
    );
  }
});

test("guide pages only claim Sawyer authorship when the page visibly supports it", () => {
  for (const guide of guideFiles) {
    const claimsSawyer =
      guide.source.includes('"author": {"@type": "Person", "name": "Sawyer Beckett"') ||
      guide.source.includes('"author":{"@type":"Person","name":"Sawyer Beckett"');

    if (!claimsSawyer) continue;

    const showsSawyer =
      guide.source.includes('meta name="author" content="Sawyer Beckett"') ||
      guide.source.includes('data-guide-author="sawyer-beck"') ||
      guide.source.includes("By Sawyer Beckett");

    assert.equal(
      showsSawyer,
      true,
      `${guide.path} claims Sawyer Beckett in JSON-LD without visible page-level authorship support`
    );
  }
});

test("llms.txt avoids known dead targets and stale duplicate guide references", () => {
  for (const deadUrl of [
    "https://seascape-vacations.com/contact/",
    "https://seascape-vacations.com/reviews/",
    "https://seascape-vacations.com/book-direct/",
    "https://seascape-vacations.com/stays/book-direct-vs-airbnb-vrbo/",
    "https://seascape-vacations.com/stays/vacation-rentals-bradenton-florida/"
  ]) {
    assert.equal(llms.includes(deadUrl), false, `llms.txt should not point at dead URL ${deadUrl}`);
  }

  assert.equal(
    llms.includes("[Bradenton vs Sarasota Vacation Rental Comparison]"),
    false,
    "llms.txt should not duplicate the retired Bradenton vs Sarasota comparison label"
  );
  assert.equal(
    llms.includes("[Bradenton vs Sarasota](https://seascape-vacations.com/guides/bradenton-vs-sarasota):"),
    false,
    "llms.txt should use the canonical slash route for Bradenton vs Sarasota"
  );
});
