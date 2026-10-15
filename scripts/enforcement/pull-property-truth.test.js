const fs = require("fs");
const os = require("os");
const path = require("path");
const test = require("node:test");
const assert = require("node:assert/strict");

const {
  applyPropertyTruth,
  fetchWithRetry,
  normalizeHostawayListing,
  restoreLastGood,
  writeJsonAtomic
} = require("../../scripts/pull-property-truth");
const { listingIdBySlug } = require("./listing-id-owned");

test("normalizeHostawayListing maps explicit Hostaway fields and sums bathroom split fields", () => {
  const normalized = normalizeHostawayListing(
    {
      id: 487798,
      name: "Bradenton Pool Home",
      city: "Bradenton",
      bedrooms: 3,
      bathrooms: 3,
      guestBathrooms: 0.5,
      personCapacity: 10,
      listingPrice: 250,
      listingImages: [{ url: "https://hostaway-platform.s3.us-west-2.amazonaws.com/example.jpg" }],
      description: "Structured description wins.",
      status: "active"
    },
    { "Bradenton Pool Home": "bradenton-pool-home" }
  );

  assert.equal(normalized.slug, "bradenton-pool-home");
  assert.equal(normalized.listingId, "487798");
  assert.equal(normalized.id, "487798");
  assert.equal(normalized.source.listingId, "487798");
  assert.equal(normalized.bathrooms, 3.5);
  assert.equal(normalized.specs, "3 BR · 3.5 BA · Sleeps 10");
  assert.equal(normalized.source.provenance.bathrooms, "bathrooms + guestBathrooms");
  assert.match(normalized.source.provenance.price, /operational fallback only/);
  assert.match(normalized.source.provenance.description, /not parsed for amenity facts/);
  assert.deepEqual(normalized.amenities, []);
});

test("normalizeHostawayListing fails when the Hostaway row has no numeric id", () => {
  assert.throws(
    () => normalizeHostawayListing({ name: "The Coastal" }, { "The Coastal": "coastal-stay" }),
    /Hostaway listing The Coastal is missing numeric id/
  );
});

test("writeJsonAtomic leaves existing output intact when temp write fails", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "seascape-truth-"));
  const outputPath = path.join(dir, "properties-fallback.json");
  fs.writeFileSync(outputPath, "{\"ok\":true}\n");
  fs.mkdirSync(`${outputPath}.tmp`, { recursive: true });

  assert.throws(() => writeJsonAtomic(outputPath, [{ ok: false }]));
  assert.equal(fs.readFileSync(outputPath, "utf8"), "{\"ok\":true}\n");
});

test("applyPropertyTruth supports dry-run diffs, snapshots, last-good backups, and restore", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "seascape-truth-"));
  const outputPath = path.join(dir, "properties-fallback.json");
  const snapshotDir = path.join(dir, "snapshots");
  const lastGoodPath = path.join(dir, "last-good.json");
  const current = [{ slug: "old-home", name: "Old Home", listingId: "1" }];
  const next = [{ slug: "dockside-dreams", name: "Dockside Dreams", listingId: "206016" }];
  fs.writeFileSync(outputPath, `${JSON.stringify(current, null, 2)}\n`);

  const dryRun = applyPropertyTruth({
    properties: next,
    rawPayload: { result: next },
    outputPath,
    snapshotDir,
    lastGoodPath,
    dryRun: true,
    now: "2026-05-11T12:00:00.000Z"
  });

  assert.equal(dryRun.changed, true);
  assert.equal(dryRun.wroteOutput, false);
  assert.equal(JSON.parse(fs.readFileSync(outputPath, "utf8"))[0].slug, "old-home");
  assert.ok(fs.existsSync(dryRun.snapshotPath));
  assert.match(dryRun.diff, /-\s+"slug": "old-home"/);
  assert.match(dryRun.diff, /\+\s+"slug": "dockside-dreams"/);

  const writeRun = applyPropertyTruth({
    properties: next,
    rawPayload: { result: next },
    outputPath,
    snapshotDir,
    lastGoodPath,
    dryRun: false,
    now: "2026-05-11T12:01:00.000Z"
  });

  assert.equal(writeRun.wroteOutput, true);
  assert.equal(JSON.parse(fs.readFileSync(outputPath, "utf8"))[0].slug, "dockside-dreams");
  assert.equal(JSON.parse(fs.readFileSync(lastGoodPath, "utf8"))[0].slug, "old-home");

  restoreLastGood({ outputPath, lastGoodPath });
  const restored = JSON.parse(fs.readFileSync(outputPath, "utf8"))[0];
  assert.equal(restored.slug, "old-home");
  assert.equal(restored.listingId, "1");
});

test("applyPropertyTruth fails when a written row omits listingId", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "seascape-truth-"));
  const outputPath = path.join(dir, "properties-fallback.json");
  const snapshotDir = path.join(dir, "snapshots");
  const lastGoodPath = path.join(dir, "last-good.json");
  const omitted = [{ slug: "coastal-stay", id: "coastal-stay", name: "The Coastal" }];

  assert.throws(
    () => applyPropertyTruth({
      properties: omitted,
      rawPayload: { result: omitted },
      outputPath,
      snapshotDir,
      lastGoodPath,
      now: "2026-10-15T12:00:00.000Z"
    }),
    /src\/_data\/properties-fallback\.json row coastal-stay is missing listingId/
  );
  assert.equal(fs.existsSync(outputPath), false);
});

test("applyPropertyTruth migrates Hostaway id onto listingId before write", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "seascape-truth-"));
  const outputPath = path.join(dir, "properties-fallback.json");
  const snapshotDir = path.join(dir, "snapshots");
  const lastGoodPath = path.join(dir, "last-good.json");
  const hostawayRow = {
    slug: "coastal-stay",
    id: "599394",
    name: "The Coastal",
    source: { listingId: "599394" }
  };

  const writeRun = applyPropertyTruth({
    properties: [hostawayRow],
    rawPayload: { result: [hostawayRow] },
    outputPath,
    snapshotDir,
    lastGoodPath,
    now: "2026-10-15T12:02:00.000Z"
  });

  assert.equal(writeRun.wroteOutput, true);
  const written = JSON.parse(fs.readFileSync(outputPath, "utf8"));
  assert.equal(written[0].listingId, "599394");
  assert.deepEqual(listingIdBySlug(written), { "coastal-stay": "599394" });
});

test("restoreLastGood migrates pre-migration last-good listingId from the current catalog", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "seascape-truth-"));
  const outputPath = path.join(dir, "properties-fallback.json");
  const lastGoodPath = path.join(dir, "last-good.json");
  fs.writeFileSync(
    outputPath,
    `${JSON.stringify([{ slug: "coastal-stay", listingId: "599394", name: "The Coastal" }], null, 2)}\n`
  );
  fs.writeFileSync(
    lastGoodPath,
    `${JSON.stringify([{ slug: "coastal-stay", id: "coastal-stay", name: "The Coastal" }], null, 2)}\n`
  );

  restoreLastGood({ outputPath, lastGoodPath });
  const restored = JSON.parse(fs.readFileSync(outputPath, "utf8"));
  assert.equal(restored[0].listingId, "599394");
  assert.deepEqual(listingIdBySlug(restored), { "coastal-stay": "599394" });
});

test("fetchWithRetry backs off on Hostaway rate limits", async () => {
  const calls = [];
  const response = await fetchWithRetry("https://api.hostaway.com/v1/listings", {
    fetchImpl: async () => {
      calls.push(Date.now());
      if (calls.length === 1) {
        return { ok: false, status: 429, text: async () => "rate limited" };
      }
      return { ok: true, status: 200, json: async () => ({ result: [] }) };
    },
    sleep: async () => {},
    retries: 2
  });

  assert.deepEqual(response, { result: [] });
  assert.equal(calls.length, 2);
});
