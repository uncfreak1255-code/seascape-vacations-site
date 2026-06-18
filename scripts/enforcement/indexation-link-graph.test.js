const fs = require("fs");
const path = require("path");
const test = require("node:test");
const assert = require("node:assert/strict");

const projectRoot = path.resolve(__dirname, "..", "..");

test("guide sources stop linking to the retired hurricane-preparedness stay path", () => {
  for (const sourcePath of [
    path.join(projectRoot, "src", "guides", "best-time-visit-anna-maria-island.html"),
    path.join(projectRoot, "src", "guides", "booking-direct-vacation-rentals.html")
  ]) {
    const source = fs.readFileSync(sourcePath, "utf8");
    assert.equal(source.includes("/stays/hurricane-preparedness-guide/"), false);
    assert.equal(source.includes("/guides/hurricane-preparedness-florida-vacation/"), true);
  }
});

test("guides hub surfaces the stranded guide and stay clusters instead of capping them", () => {
  const guidesHub = fs.readFileSync(path.join(projectRoot, "src", "guides", "index.njk"), "utf8");

  for (const marker of [
    "/guides/spring-break-activities-bradenton-anna-maria-island/",
    "/guides/fishing-guide-anna-maria-sarasota/",
    "/guides/where-to-stay-near-anna-maria-island/",
    "/guides/florida-gulf-coast-vacation-rental-market-report-2026/",
    "/guides/holmes-beach/",
    "/services/concierge-services/",
    "vacation-rentals-with-elevator",
    "week-long-vacation-rentals-florida"
  ]) {
    assert.equal(guidesHub.includes(marker), true, `guides hub missing ${marker}`);
  }

  assert.equal(
    guidesHub.includes("holmes-beach-vacation-rentals"),
    false,
    "guides hub should not keep surfacing the retired Holmes Beach stay slug"
  );

  assert.equal(guidesHub.includes("loop.index <= 10"), false);
  assert.equal(guidesHub.includes("loop.index <= 5"), false);
  assert.equal(guidesHub.includes("loop.index <= 3"), false);
});

test("owner hub links to the long-tail owner pages that were previously orphaned", () => {
  const ownerHub = fs.readFileSync(path.join(projectRoot, "src", "property-management", "index.njk"), "utf8");

  for (const marker of [
    "/property-management/new-vacation-rental-owner-guide-florida/",
    "/property-management/increase-vacation-rental-bookings/",
    "/property-management/vacation-rental-cleaning-services-florida/",
    "/property-management/vacation-rental-guest-screening/",
    "/property-management/vacation-rental-insurance-florida/",
    "/property-management/vacation-rental-taxes-florida/",
    "/property-management/buy-vacation-rental-property-florida/"
  ]) {
    assert.equal(ownerHub.includes(marker), true, `owner hub missing ${marker}`);
  }
});

test("remaining orphan guides, stays, and owner scenarios are routed into the hub pages", () => {
  const guidesHub = fs.readFileSync(path.join(projectRoot, "src", "guides", "index.njk"), "utf8");
  const ownerHub = fs.readFileSync(path.join(projectRoot, "src", "property-management", "index.njk"), "utf8");

  for (const marker of [
    "/guides/anna-maria-island-noise-ordinance-guide/",
    "/guides/bradenton-insider-guide/",
    "/guides/snowbirds-guide-extended-stays-florida/",
    "5-bedroom-vacation-rentals-florida",
    "vacation-rentals-sleeps-16-florida",
    "vacation-rentals-with-outdoor-grill"
  ]) {
    assert.equal(guidesHub.includes(marker), true, `guides hub still missing ${marker}`);
  }

  for (const marker of [
    "/property-management/sell-vacation-rental-property-florida/",
    "/property-management/switch-from-airbnb-self-manage/",
    "/property-management/vacation-rental-interior-design-florida/",
    "/property-management/vacation-rental-licensing-florida/",
    "/property-management/vacation-rental-maintenance-florida/",
    "/property-management/vacation-rental-management-siesta-key/",
    "/property-management/vacation-rental-photography-florida/",
    "/property-management/vrbo-management-services-florida/",
    "/property-management/condo-rental-management-florida/"
  ]) {
    assert.equal(ownerHub.includes(marker), true, `owner hub still missing ${marker}`);
  }
});

test("strong guide pages link to the selected indexation rescue targets", () => {
  const marketReport = fs.readFileSync(
    path.join(projectRoot, "src", "guides", "florida-gulf-coast-vacation-rental-market-report-2026.html"),
    "utf8"
  );
  const bradentonVsSarasota = fs.readFileSync(
    path.join(projectRoot, "src", "guides", "bradenton-vs-sarasota.html"),
    "utf8"
  );
  const thingsToDoBradenton = fs.readFileSync(
    path.join(projectRoot, "src", "guides", "things-to-do-bradenton-fl.html"),
    "utf8"
  );

  for (const marker of [
    "/property-management/condo-rental-management-florida/",
    "/property-management/vacation-rental-maintenance-florida/",
    "/property-management/vacation-rental-insurance-florida/"
  ]) {
    assert.equal(marketReport.includes(marker), true, `market report missing ${marker}`);
  }

  for (const marker of [
    "/stays/vacation-rentals-sleeps-12-florida/",
    "/stays/vacation-rentals-with-elevator/"
  ]) {
    assert.equal(bradentonVsSarasota.includes(marker), true, `Bradenton vs Sarasota missing ${marker}`);
  }

  for (const marker of [
    "/stays/canal-homes-with-boat-dock/",
    "/stays/vacation-rentals-with-game-room/"
  ]) {
    assert.equal(thingsToDoBradenton.includes(marker), true, `things to do Bradenton missing ${marker}`);
  }
});

test("stay hub exists and child stay pages link back to it", () => {
  const staysHub = fs.readFileSync(path.join(projectRoot, "src", "stays", "index.njk"), "utf8");
  const staysTemplate = fs.readFileSync(path.join(projectRoot, "src", "stays", "stays.njk"), "utf8");

  for (const marker of [
    "Destination collections",
    "Use-case collections",
    '/stays/{{ page.slug }}/',
    'page.destination == section.key',
    "/properties/",
    "/guides/where-to-stay-near-anna-maria-island/"
  ]) {
    assert.equal(staysHub.includes(marker), true, `stay hub missing ${marker}`);
  }

  assert.equal(staysTemplate.includes('href="/stays/"'), true, "stay template should link back to the /stays/ hub");
  assert.equal(staysTemplate.includes('"name": "Stay Collections"'), true, "stay breadcrumb schema should include the hub");
});
