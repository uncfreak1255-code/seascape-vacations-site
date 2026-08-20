const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const assert = require("node:assert/strict");

const root = path.resolve(__dirname, "..", "..");

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

const briefPath = "docs/briefs/2026-08-search-content-rescue.md";
const weatherPath = "src/guides/anna-maria-island-weather.html";
const marketPath = "src/guides/florida-gulf-coast-vacation-rental-market-report-2026.html";
const bestTimePath = "src/guides/best-time-visit-anna-maria-island.html";
const srqPath = "src/guides/srq-airport-to-anna-maria-island.html";

test("multi-route brief names every route decision and every authorized search source", () => {
  const brief = read(briefPath);

  for (const marker of [
    "`/guides/anna-maria-island-weather/` | 34 clicks / 6,514 impressions / 0.52% CTR / 7.09 position",
    "`/guides/florida-gulf-coast-vacation-rental-market-report-2026/` | 4 / 1,663 / 0.24% / 6.01",
    "`/guides/best-time-visit-anna-maria-island/` | 57 / 8,277 / 0.69% / 4.56",
    "`/guides/srq-airport-to-anna-maria-island/` | 17 / 4,843 / 0.35% / 6.09",
    "`/guides/is-anna-maria-island-worth-visiting/` | 11 / 2,512 / 0.44% / 3.10",
    "`/guides/bradenton-vs-sarasota/` | 31 / 3,823 / 0.81% / 4.06",
    "`hold - completed Gate 0 decision`",
  ]) {
    assert.match(brief, new RegExp(marker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }

  for (const sourcePath of [weatherPath, marketPath, bestTimePath, srqPath]) {
    assert.match(brief, new RegExp(`^- ${sourcePath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "m"));
  }
});

test("weather guide uses named NOAA proxies and removes expired or unsafe claims", () => {
  const source = read(weatherPath);

  for (const required of [
    '"dateModified": "2026-08-19"',
    "Sarasota-Bradenton Airport",
    "USW00012871",
    "Port Manatee",
    "8726384",
    "Rain days ≥0.01 in",
    "/terms/#cancellations",
    ">cancellation guidance</a>",
    "hard-topped vehicle or fully enclosed building",
    "June 1 through November 30",
  ]) {
    assert.match(source, new RegExp(required.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }

  for (const staleOrUnsafe of [
    "Right now (March–April 2026)",
    "Spring break season runs March 7–April 18",
    "inventory is limited at this writing",
    "last major hurricane to affect the area was Ian in 2022",
    "flexible cancellation policies during hurricane season",
    "Modern forecasting gives 5-7 days of advance warning",
    "accept getting wet",
    "Save 10-15%",
    "30-50% off peak prices",
    "30-40% from peak season",
  ]) {
    assert.doesNotMatch(source, new RegExp(staleOrUnsafe.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"));
  }
});

test("market page is labeled as a fixed historical portfolio benchmark", () => {
  const source = read(marketPath);

  for (const required of [
    "Bradenton-Sarasota Vacation Rental Benchmark 2026",
    '"dateModified": "2026-08-19"',
    "545 confirmed bookings",
    "1,492 reservation records",
    "five Bradenton and Sarasota homes",
    "June 2022 through March 2026",
    "/research/gulf-coast-vacation-booking-trends-2026/",
    "historical portfolio benchmark",
  ]) {
    assert.match(source, new RegExp(required.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"));
  }

  for (const unsupported of [
    "post-pandemic booking surge has normalized",
    "increasingly strict",
    "Waterfront premium",
    "Set peak pricing before the 74-day booking window",
    "Book Direct & Skip OTA Fees",
    "current market read",
  ]) {
    assert.doesNotMatch(source, new RegExp(unsupported.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"));
  }
});

test("accepted snippet rescues match the current query decisions", () => {
  const bestTime = read(bestTimePath);
  const srq = read(srqPath);

  const bestTimeMeta = "Compare all 12 months for typical weather, Gulf water, crowds, and storm season. See why May and November often balance comfort and trip timing.";
  assert.match(bestTime, new RegExp(bestTimeMeta.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  assert.match(bestTime, /<title>Best Time to Visit Anna Maria Island: May and November<\/title>/);
  assert.match(bestTime, /"dateModified": "2026-07-28"/);
  assert.match(bestTime, /Updated July 2026/);

  const srqTitle = "SRQ Airport to Anna Maria Island: Drive Time, Cost & Options";
  const srqMeta = "Compare rental car, rideshare, taxi, shuttle, and bus options from SRQ to Anna Maria Island, with drive times and the best bridge route for each town.";
  assert.match(srq, new RegExp(`<title>${srqTitle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}</title>`));
  assert.match(srq, new RegExp(srqMeta.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  assert.match(srq, /"dateModified": "2026-08-19"/);
  assert.match(srq, /Reviewed August 19, 2026/);
  assert.match(srq, /<strong>August 2026 review:<\/strong>/);
  assert.doesNotMatch(srq, /Reviewed June 2026|June 2026 review:/);
  assert.doesNotMatch(srq, /Save 10-15%/i);
});
