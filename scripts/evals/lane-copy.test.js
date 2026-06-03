const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");

const { collectLaneCopies } = require(path.resolve(__dirname, "lib/lane-copy.js"));

test("collectLaneCopies: extracts configured owner entries from seoPages data", () => {
  const lane = {
    dataSources: [
      {
        path: "src/_data/seoPages.json",
        arrayPath: "owner",
        labelKey: "slug",
        onlySlugs: ["vacation-rental-management-fees-florida"],
      },
    ],
  };
  const raw = JSON.stringify({
    stays: [
      {
        slug: "anna-maria-island-vacation-rentals",
        intro: "Stay copy should not enter the owner lane.",
      },
    ],
    owner: [
      {
        slug: "vacation-rental-management-fees-florida",
        proofAssetKey: "gulf-coast-owner-benchmark-2026",
        intro: "Owners compare fees against what they actually keep.",
        relatedPages: ["vacation-rental-licensing-florida"],
        marketReality: {
          body: "<p>Marketplace costs and direct bookings change owner margin.</p>",
        },
      },
      {
        slug: "vacation-rental-cleaning-services",
        intro: "Cleaning-service owner copy is not a money-page eval target.",
      },
    ],
  });

  const result = collectLaneCopies(lane, "src/_data/seoPages.json", raw);

  assert.equal(result.length, 1);
  assert.equal(
    result[0].label,
    "src/_data/seoPages.json#vacation-rental-management-fees-florida"
  );
  assert.match(result[0].copy, /Owners compare fees/);
  assert.match(result[0].copy, /direct bookings change owner margin/);
  assert.doesNotMatch(result[0].copy, /vacation-rental-management-fees-florida/);
  assert.doesNotMatch(result[0].copy, /gulf-coast-owner-benchmark/);
  assert.doesNotMatch(result[0].copy, /vacation-rental-licensing-florida/);
  assert.doesNotMatch(result[0].copy, /Stay copy/);
  assert.doesNotMatch(result[0].copy, /Cleaning-service/);
});

test("collectLaneCopies: default path extracts one plain file target", () => {
  const result = collectLaneCopies(
    {},
    "src/property-management/index.njk",
    "<h1>Owner revenue review</h1>"
  );

  assert.deepEqual(result, [
    {
      label: "src/property-management/index.njk",
      copy: "Owner revenue review",
    },
  ]);
});
