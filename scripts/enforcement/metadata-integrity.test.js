const fs = require("fs");
const path = require("path");
const test = require("node:test");
const assert = require("node:assert/strict");

const projectRoot = path.resolve(__dirname, "..", "..");
const ownerData = require(path.join(projectRoot, "src", "_data", "seoPages.json")).owner;
const ownerProofAssets = require(path.join(projectRoot, "src", "_data", "ownerProofAssets.json"));
const {
  assertRequiredHeadTags,
  readRouteSource
} = require("./rendered-route-contract");

function readSource(...parts) {
  return fs.readFileSync(path.join(projectRoot, ...parts), "utf8");
}

function readSourceContract(...parts) {
  return readRouteSource(projectRoot, path.join(...parts));
}

test("anna-maria-city ships parseable primary head tags", () => {
  const contract = readSourceContract("src", "guides", "anna-maria-city.html");

  assertRequiredHeadTags(contract);
  assert.equal(contract.head.title, "Anna Maria City Guide & Vacation Rentals (2026)");
  assert.equal(
    contract.head.description,
    "Discover Anna Maria City at the northern tip of Anna Maria Island — secluded Bean Point, the historic Rod & Reel Pier, Pine Avenue shops, and vacation rentals. AMI's quietest gem."
  );
  assert.equal(contract.head.canonical, "https://seascape-vacations.com/guides/anna-maria-city/");
  assert.equal(contract.head.ogTitle, "Anna Maria City Guide & Vacation Rentals (2026)");
  assert.equal(contract.head.ogDescription, "AMI's quietest gem — Bean Point, Rod & Reel Pier, and true Old Florida.");
});

test("rainy-day guide answers current Sarasota and Bradenton rain intent", () => {
  const contract = readSourceContract("src", "guides", "rainy-day-activities-bradenton-sarasota.html");
  const source = readSource("src", "guides", "rainy-day-activities-bradenton-sarasota.html");

  assertRequiredHeadTags(contract);
  assert.equal(contract.head.title, "Rainy Day Activities in Sarasota & Bradenton");
  assert.equal(
    contract.head.description,
    "Rain in Sarasota or Bradenton? Compare indoor picks: Mote SEA, The Ringling, Sarasota Art Museum, arcades, shopping, and AMI backup plans."
  );
  assert.equal(contract.head.canonical, "https://seascape-vacations.com/guides/rainy-day-activities-bradenton-sarasota/");
  assert.equal(contract.head.ogTitle, contract.head.title);
  assert.equal(contract.head.ogDescription, contract.head.description);
  assert.equal(contract.head.twitterTitle, contract.head.title);
  assert.match(source, /<h1 class="guide-title">Rainy Day Activities in Sarasota & Bradenton<\/h1>/);
  assert.match(source, /"@type": "FAQPage"/);
  assert.match(source, /"dateModified": "2026-04-22"/);
  assert.match(source, /Mote Science Education Aquarium/);
  assert.match(source, /Sarasota Art Museum/);
  assert.match(source, /The Bishop Museum/);
  assert.match(source, /src="\/images\/sarasota-og\.jpg"/);
  assert.equal(source.includes("/images/ami-hero.webp"), false);
  assert.match(source, /href="\/stays\/bradenton-vacation-rentals-near-beaches\/"/);
  assert.match(source, /href="\/guides\/bradenton-vs-sarasota\/"/);
  assert.match(source, /href="\/guides\/anna-maria-island-vs-siesta-key\/"/);
});

test("winner guide snippets stay decision-forward without body rewrites", () => {
  const amiVsSiesta = readSource("src", "guides", "anna-maria-island-vs-siesta-key.html");
  const bradentonVsSarasota = readSource("src", "guides", "bradenton-vs-sarasota.html");
  const amiContract = readSourceContract("src", "guides", "anna-maria-island-vs-siesta-key.html");
  const bradentonContract = readSourceContract("src", "guides", "bradenton-vs-sarasota.html");

  assert.equal(amiContract.head.title, "Anna Maria Island vs Siesta Key: Which Beach Fits?");
  assert.equal(
    amiContract.head.description,
    "AMI fits quieter family beach days and easier parking; Siesta Key fits famous quartz sand, nightlife, and Sarasota dining. Compare the tradeoff."
  );
  assert.equal(amiContract.head.ogTitle, "Anna Maria Island vs Siesta Key: Which Beach Fits?");
  assert.match(
    amiVsSiesta,
    /<h1>Anna Maria Island vs Siesta Key<br>Beaches, Crowds, Parking, and Where to Stay<\/h1>/
  );
  assert.match(
    amiVsSiesta,
    /"headline": "Anna Maria Island vs Siesta Key: Which Beach Fits\?"/
  );
  assert.match(
    amiVsSiesta,
    /"dateModified": "2026-04-28T12:00:00-04:00"/
  );
  assert.match(
    amiVsSiesta,
    /Updated April 2026/
  );

  assert.equal(bradentonContract.head.title, "Bradenton vs Sarasota for Vacation: Which Base Wins?");
  assert.equal(
    bradentonContract.head.description,
    "Bradenton wins on AMI access, parking, and value; Sarasota wins on Siesta Key, dining, and arts. Compare beaches, cost, and where to stay."
  );
  assert.equal(bradentonContract.head.ogTitle, "Bradenton vs Sarasota for Vacation: Which Base Wins?");
  assert.match(
    bradentonVsSarasota,
    /<h1>Bradenton vs Sarasota:<br>Which Is Better for Vacation\?<\/h1>/
  );
  assert.match(
    bradentonVsSarasota,
    /"headline": "Bradenton vs Sarasota for Vacation: Which Base Wins\?"/
  );
  assert.match(
    bradentonVsSarasota,
    /"dateModified": "2026-05-09T12:00:00-04:00"/
  );
  assert.match(
    bradentonVsSarasota,
    /Updated May 2026/
  );
});

test("homepage and about page do not ship invented review totals or stale pricing trust claims", () => {
  const homepage = readSource("src", "index.njk");
  const about = readSource("src", "about-us", "index.njk");

  for (const staleClaim of [
    "Rated Excellent by 500+ Guests",
    "4.98 Airbnb Rating",
    "650+ 5-Star Reviews",
    "650+ five-star reviews"
  ]) {
    assert.equal(homepage.includes(staleClaim), false, `homepage should not include ${staleClaim}`);
    assert.equal(about.includes(staleClaim), false, `about page should not include ${staleClaim}`);
  }

  assert.equal(/"reviewCount"\s*:\s*500/.test(homepage), false, "homepage should not ship an invented 500-review count");
  assert.equal(
    /"priceRange"\s*:\s*"\$400-\$800\/night"/.test(homepage),
    false,
    "homepage should not ship a stale LocalBusiness priceRange"
  );
});

test("priority owner money-page metadata stays non-empty and query-aligned", () => {
  const feePage = ownerData.find((entry) => entry.slug === "vacation-rental-management-fees-florida");
  const licensingPage = ownerData.find((entry) => entry.slug === "vacation-rental-licensing-florida");
  const vrboPage = ownerData.find((entry) => entry.slug === "vrbo-management-services-florida");

  assert.ok(feePage, "fee page should exist");
  assert.ok(licensingPage, "licensing page should exist");
  assert.ok(vrboPage, "VRBO page should exist");

  assert.match(feePage.title, /fees/i);
  assert.equal(feePage.title, "Florida Vacation Rental Management Fees: What Owners Keep");
  assert.equal(
    feePage.description,
    "See Florida vacation rental management fees, marketplace booking costs, and when a lower percentage still leaves owners with less income."
  );
  assert.match(feePage.description, /marketplace booking costs/i);
  assert.match(feePage.description, /less income/i);

  assert.match(licensingPage.title, /DBPR/i);
  assert.equal(licensingPage.title, "Florida Vacation Rental License Rules: DBPR + County Risk");
  assert.equal(
    licensingPage.description,
    "DBPR is one layer. See Florida vacation rental license rules, county registration, tax setup, and launch risks before bookings go live."
  );
  assert.match(licensingPage.description, /DBPR/i);
  assert.match(licensingPage.description, /county/i);

  assert.match(vrboPage.title, /VRBO/i);
  assert.match(vrboPage.title, /owners/i);
  assert.match(vrboPage.description, /owners/i);
  assert.match(vrboPage.description, /Florida/i);
});

test("owner proof benchmark is promoted as the conquest asset", () => {
  const template = readSource("src", "property-management", "property-management.njk");
  const llms = readSource("src", "llms.txt");
  const benchmark = ownerProofAssets["gulf-coast-owner-benchmark-2026"];

  assert.equal(
    benchmark.benchmarkUrl,
    "/research/owner-fee-revenue-leak-benchmark-2026/"
  );
  assert.match(
    template,
    /href="{{ proofAsset\.benchmarkUrl }}"/,
    "owner template should link directly to the owner fee benchmark when proofAsset.benchmarkUrl exists"
  );
  assert.match(
    llms,
    /\[Owner Fee \+ Revenue Leak Benchmark\]\(https:\/\/seascape-vacations\.com\/research\/owner-fee-revenue-leak-benchmark-2026\/\)/
  );
});
