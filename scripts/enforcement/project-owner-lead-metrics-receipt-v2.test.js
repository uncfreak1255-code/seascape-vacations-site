const assert = require("node:assert/strict");
const crypto = require("crypto");
const fs = require("fs");
const os = require("os");
const path = require("path");
const test = require("node:test");

const projector = require("./project-owner-lead-metrics-receipt-v2");

function v1Receipt(overrides = {}) {
  return {
    receipt_id: "REC-20260817-SITE-OWNER-LEAD-METRICS",
    owning_repo: "seascape-vacations-site",
    source_path: "netlify/functions/owner-lead-metrics.js",
    verification_command: "node scripts/enforcement/emit-hub-verification-receipt.js owner-lead-metrics",
    date_or_window: "2026-08-17T01:00:00.000Z",
    proof_type: "measurement",
    claim_ids: ["CLM-OWNER-MEASUREMENT-PATH-LIVE"],
    stale_after: "2026-08-31",
    summary: "The live measurement surface does not prove booked teardowns.",
    promotion_target: ["projects/claim-freshness-registry.md"],
    details: {
      total_submissions: 1,
      intentionally_unprojected: "raw owner receipt details stay in V1 only",
    },
    ...overrides,
  };
}

function writeSource(filePath, receipt = v1Receipt()) {
  const content = Buffer.from(`${JSON.stringify(receipt, null, 2)}\n`, "utf8");
  fs.writeFileSync(filePath, content);
  return content;
}

function fixturePaths() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "site-owner-lead-v2-"));
  return {
    root,
    source: path.join(root, "owner-lead-metrics-v1.json"),
    projection: path.join(root, "owner-lead-metrics-v2.jsonl"),
    disable: path.join(root, "owner-lead-metrics-v2-disable.json"),
  };
}

test("projects one allowlisted envelope without V1 details", () => {
  const receipt = v1Receipt();
  const projection = projector.buildV2Projection(receipt, {
    sourceSha256: "a".repeat(64),
    recordedAt: new Date("2026-08-17T02:00:00.000Z"),
  });

  assert.deepEqual(new Set(Object.keys(projection)), projector.V2_FIELDS);
  assert.equal(projection.schema_version, "2");
  assert.equal(projection.claim_id, "CLM-OWNER-MEASUREMENT-PATH-LIVE");
  assert.equal(projection.owner_repo, "seascape-vacations-site");
  assert.equal(projection.source_path, "netlify/functions/owner-lead-metrics.js");
  assert.equal(projection.source_sha256, "a".repeat(64));
  assert.equal(projection.observed_at, "2026-08-17T01:00:00.000Z");
  assert.equal(projection.status, "active");
  assert.equal(projection.redaction_class, "public");
  assert.equal(projection.action_boundary, projector.ACTION_BOUNDARY);
  assert.equal("details" in projection, false);
  assert.equal("summary" in projection, false);
});

test("writes a sidecar then disables only that sidecar with a receipt", () => {
  const paths = fixturePaths();
  const sourceBytes = writeSource(paths.source);

  const written = projector.main([
    "--input", paths.source,
    "--output", paths.projection,
    "--recorded-at", "2026-08-17T02:00:00Z",
  ]);
  assert.equal(written.projection_status, "written");
  assert.equal(written.record_count, 1);
  assert.deepEqual(fs.readFileSync(paths.source), sourceBytes);
  assert.equal(fs.existsSync(paths.projection), true);

  const disabled = projector.main([
    "--input", paths.source,
    "--output", paths.projection,
    "--disable",
    "--disable-receipt", paths.disable,
    "--recorded-at", "2026-08-17T03:00:00Z",
  ]);
  const receipt = JSON.parse(fs.readFileSync(paths.disable, "utf8"));
  assert.equal(disabled.projection_status, "disabled");
  assert.equal(disabled.projection_removed, true);
  assert.deepEqual(fs.readFileSync(paths.source), sourceBytes);
  assert.equal(fs.existsSync(paths.projection), false);
  assert.equal(receipt.projection_status, "disabled");
  assert.equal(receipt.source_preserved, true);
  assert.equal(receipt.source_sha256, crypto.createHash("sha256").update(sourceBytes).digest("hex"));
});

test("refuses a wrong owner before writing a projection", () => {
  const paths = fixturePaths();
  writeSource(paths.source, v1Receipt({ owning_repo: "seascape-ops" }));

  assert.throws(
    () => projector.main(["--input", paths.source, "--output", paths.projection]),
    /owner/,
  );
  assert.equal(fs.existsSync(paths.projection), false);
});

test("refuses an unapproved claim before writing a projection", () => {
  const paths = fixturePaths();
  writeSource(paths.source, v1Receipt({ claim_ids: ["CLM-NOT-APPROVED"] }));

  assert.throws(
    () => projector.main(["--input", paths.source, "--output", paths.projection]),
    /claim IDs/,
  );
  assert.equal(fs.existsSync(paths.projection), false);
});

test("refuses a receipt identifier that does not match its observation date", () => {
  const paths = fixturePaths();
  writeSource(paths.source, v1Receipt({ receipt_id: "REC-20260816-SITE-OWNER-LEAD-METRICS" }));

  assert.throws(
    () => projector.main(["--input", paths.source, "--output", paths.projection]),
    /receipt ID/,
  );
  assert.equal(fs.existsSync(paths.projection), false);
});

test("refuses invalid source and caller calendar dates before writing", () => {
  const invalidSource = fixturePaths();
  writeSource(invalidSource.source, v1Receipt({ date_or_window: "2026-02-31T01:00:00.000Z" }));
  assert.throws(
    () => projector.main(["--input", invalidSource.source, "--output", invalidSource.projection]),
    /date_or_window/,
  );
  assert.equal(fs.existsSync(invalidSource.projection), false);

  const invalidCaller = fixturePaths();
  writeSource(invalidCaller.source);
  assert.throws(
    () => projector.main([
      "--input", invalidCaller.source,
      "--output", invalidCaller.projection,
      "--recorded-at", "2026-02-31T01:00:00.000Z",
    ]),
    /recorded_at/,
  );
  assert.equal(fs.existsSync(invalidCaller.projection), false);

  const invalidStaleAfter = fixturePaths();
  writeSource(invalidStaleAfter.source, v1Receipt({ stale_after: "2026-02-31" }));
  assert.throws(
    () => projector.main(["--input", invalidStaleAfter.source, "--output", invalidStaleAfter.projection]),
    /stale_after/,
  );
  assert.equal(fs.existsSync(invalidStaleAfter.projection), false);
});

test("expired V1 evidence is projected as historical", () => {
  const projection = projector.buildV2Projection(v1Receipt({ stale_after: "2026-08-16" }), {
    sourceSha256: "b".repeat(64),
    recordedAt: new Date("2026-08-17T02:00:00.000Z"),
  });
  assert.equal(projection.status, "historical");
});

test("refuses disable without a receipt and preserves the source", () => {
  const paths = fixturePaths();
  const sourceBytes = writeSource(paths.source);

  assert.throws(
    () => projector.main(["--input", paths.source, "--output", paths.projection, "--disable"]),
    /requires --disable-receipt/,
  );
  assert.deepEqual(fs.readFileSync(paths.source), sourceBytes);
  assert.equal(fs.existsSync(paths.projection), false);
});

test("refuses to delete an unrelated projection file", () => {
  const paths = fixturePaths();
  const sourceBytes = writeSource(paths.source);
  fs.writeFileSync(paths.projection, '{"not":"a projection"}\n');

  assert.throws(
    () => projector.main([
      "--input", paths.source,
      "--output", paths.projection,
      "--disable",
      "--disable-receipt", paths.disable,
    ]),
    /unexpected field set/,
  );
  assert.deepEqual(fs.readFileSync(paths.source), sourceBytes);
  assert.equal(fs.existsSync(paths.projection), true);
  assert.equal(fs.existsSync(paths.disable), false);
});

test("existing disable receipt blocks removal before the sidecar is touched", () => {
  const paths = fixturePaths();
  writeSource(paths.source);
  projector.main([
    "--input", paths.source,
    "--output", paths.projection,
    "--recorded-at", "2026-08-17T02:00:00Z",
  ]);
  fs.writeFileSync(paths.disable, "existing receipt\n");

  assert.throws(
    () => projector.main([
      "--input", paths.source,
      "--output", paths.projection,
      "--disable",
      "--disable-receipt", paths.disable,
      "--recorded-at", "2026-08-17T03:00:00Z",
    ]),
    /EEXIST/,
  );
  assert.equal(fs.existsSync(paths.projection), true);
  assert.equal(fs.readFileSync(paths.disable, "utf8"), "existing receipt\n");
});

test("the existing V1 emitter does not enable the shadow projector", () => {
  const emitter = fs.readFileSync(path.join(__dirname, "emit-hub-verification-receipt.js"), "utf8");
  assert.equal(emitter.includes("project-owner-lead-metrics-receipt-v2"), false);
});
