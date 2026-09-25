"use strict";

const fs = require("fs");
const os = require("os");
const path = require("path");
const test = require("node:test");
const assert = require("node:assert/strict");
const { execFileSync } = require("child_process");

const SCRIPT = path.resolve(__dirname, "perf-ratchet.js");

function lhr(route, { script, stylesheet, inlineScript = 0 }) {
  // Split each total across two requests so the sum, not one row, is measured.
  const half = (n) => [Math.floor(n / 2), n - Math.floor(n / 2)];
  const [s1, s2] = half(script);
  const [c1, c2] = half(stylesheet);
  const pageUrl = `http://localhost${route}`;
  return JSON.stringify({
    requestedUrl: pageUrl,
    finalDisplayedUrl: pageUrl,
    audits: {
      // Lighthouse files inline executable script under the document URL.
      "script-treemap-data": {
        details: {
          nodes: [
            { name: pageUrl, resourceBytes: inlineScript },
            { name: "http://localhost/a.js", resourceBytes: s1 },
          ],
        },
      },
      "network-requests": {
        details: {
          items: [
            { url: "http://localhost/a.js", resourceType: "Script", statusCode: 200, resourceSize: s1, transferSize: s1 + 300 },
            { url: "http://localhost/b.js", resourceType: "Script", statusCode: 200, resourceSize: s2, transferSize: s2 + 300 },
            { url: "http://localhost/gone.js", resourceType: "Script", statusCode: 404, resourceSize: 5000, transferSize: 5300 },
            { url: "http://localhost/a.css", resourceType: "Stylesheet", statusCode: 200, resourceSize: c1, transferSize: c1 + 300 },
            { url: "http://localhost/b.css", resourceType: "Stylesheet", statusCode: 200, resourceSize: c2, transferSize: c2 + 300 },
            { url: "http://localhost/hero.jpg", resourceType: "Image", statusCode: 200, resourceSize: 400000, transferSize: 400300 },
          ],
        },
      },
    },
  });
}

function fixture({ reports, baseline }) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "perf-ratchet-"));
  const reportsDir = path.join(tmp, ".lighthouseci");
  fs.mkdirSync(reportsDir);
  reports.forEach((body, i) => {
    fs.writeFileSync(path.join(reportsDir, `lhr-${1000 + i}.json`), body);
  });
  fs.writeFileSync(path.join(reportsDir, "lhr-9999.html"), "<html></html>");
  const baselineFile = path.join(tmp, "perf-ratchet.json");
  if (baseline !== undefined) {
    fs.writeFileSync(baselineFile, JSON.stringify(baseline, null, 2) + "\n");
  }
  return { reportsDir, baselineFile };
}

function run(args) {
  try {
    const out = execFileSync("node", [SCRIPT, ...args], { encoding: "utf8" });
    return { status: 0, output: out };
  } catch (err) {
    return { status: err.status, output: (err.stdout || "") + (err.stderr || "") };
  }
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

const BASE = { routes: { "/": { script: 15000, stylesheet: 14000 } } };

test("passes when every route is at or under its baseline", () => {
  const { reportsDir, baselineFile } = fixture({
    reports: [lhr("/", { script: 15000, stylesheet: 14000 })],
    baseline: BASE,
  });
  const r = run(["--reports", reportsDir, "--baseline", baselineFile]);
  assert.equal(r.status, 0, r.output);
});

test("fails and names the route, metric and both numbers when a route grows", () => {
  const { reportsDir, baselineFile } = fixture({
    reports: [lhr("/", { script: 15001, stylesheet: 14000 })],
    baseline: BASE,
  });
  const r = run(["--reports", reportsDir, "--baseline", baselineFile]);
  assert.equal(r.status, 1, r.output);
  assert.match(r.output, /\/ script 15001 > baseline 15000/);
});

test("passes when a route shrinks and says the baseline can be tightened", () => {
  const { reportsDir, baselineFile } = fixture({
    reports: [lhr("/", { script: 12000, stylesheet: 14000 })],
    baseline: BASE,
  });
  const r = run(["--reports", reportsDir, "--baseline", baselineFile]);
  assert.equal(r.status, 0, r.output);
  assert.match(r.output, /perf:ratchet:update/);
  assert.deepEqual(readJson(baselineFile), BASE, "check mode must not write");
});

test("uses the maximum across runs, so growth seen in any one run fails", () => {
  // Bytes are deterministic for a static site, so a single run that ships
  // more is a real change (a script that only sometimes loads), not noise.
  // A median would let a 1-of-3 growth pass (adversarial review, 2026-09-24).
  const { reportsDir, baselineFile } = fixture({
    reports: [
      lhr("/", { script: 15000, stylesheet: 14000 }),
      lhr("/", { script: 15000, stylesheet: 14000 }),
      lhr("/", { script: 15001, stylesheet: 14000 }),
    ],
    baseline: BASE,
  });
  const r = run(["--reports", reportsDir, "--baseline", baselineFile]);
  assert.equal(r.status, 1, r.output);
  assert.match(r.output, /\/ script 15001 > baseline 15000/);

  const low = fixture({
    reports: [
      lhr("/", { script: 1, stylesheet: 14000 }),
      lhr("/", { script: 15000, stylesheet: 14000 }),
      lhr("/", { script: 15000, stylesheet: 14000 }),
    ],
    baseline: BASE,
  });
  assert.equal(run(["--reports", low.reportsDir, "--baseline", low.baselineFile]).status, 0);
});

test("counts inline executable script bytes from the treemap document node", () => {
  // Inline <script> never appears in network-requests, so the external sum
  // alone read PASS on a page that grew inline (adversarial review, 2026-09-24).
  const { reportsDir, baselineFile } = fixture({
    reports: [lhr("/", { script: 15000, stylesheet: 14000, inlineScript: 1 })],
    baseline: BASE,
  });
  const r = run(["--reports", reportsDir, "--baseline", baselineFile]);
  assert.equal(r.status, 1, r.output);
  assert.match(r.output, /\/ script 15001 > baseline 15000/);
});

test("fails loudly when a report lacks the script-treemap-data audit", () => {
  const body = JSON.parse(lhr("/", { script: 15000, stylesheet: 14000 }));
  delete body.audits["script-treemap-data"];
  const { reportsDir, baselineFile } = fixture({ reports: [JSON.stringify(body)], baseline: BASE });
  const r = run(["--reports", reportsDir, "--baseline", baselineFile]);
  assert.equal(r.status, 1, r.output);
  assert.match(r.output, /no script-treemap-data audit for \//);
});

test("fails loudly when a baselined route has no report", () => {
  const { reportsDir, baselineFile } = fixture({
    reports: [lhr("/other/", { script: 1, stylesheet: 1 })],
    baseline: BASE,
  });
  const r = run(["--reports", reportsDir, "--baseline", baselineFile]);
  assert.equal(r.status, 1, r.output);
  assert.match(r.output, /no Lighthouse report for \//);
});

test("fails loudly when a measured route has no baseline entry", () => {
  const { reportsDir, baselineFile } = fixture({
    reports: [
      lhr("/", { script: 15000, stylesheet: 14000 }),
      lhr("/new/", { script: 1, stylesheet: 1 }),
    ],
    baseline: BASE,
  });
  const r = run(["--reports", reportsDir, "--baseline", baselineFile]);
  assert.equal(r.status, 1, r.output);
  assert.match(r.output, /no baseline for \/new\//);
});

test("fails loudly when the baseline file is missing or has no routes", () => {
  const missing = fixture({ reports: [lhr("/", { script: 1, stylesheet: 1 })] });
  const r1 = run(["--reports", missing.reportsDir, "--baseline", missing.baselineFile]);
  assert.equal(r1.status, 1, r1.output);
  assert.match(r1.output, /perf-ratchet\.json/);

  const empty = fixture({ reports: [lhr("/", { script: 1, stylesheet: 1 })], baseline: { routes: {} } });
  const r2 = run(["--reports", empty.reportsDir, "--baseline", empty.baselineFile]);
  assert.equal(r2.status, 1, r2.output);
});

test("fails loudly when a report lacks the network-requests audit or a request lacks resourceSize", () => {
  const noAudit = JSON.parse(lhr("/", { script: 100, stylesheet: 200 }));
  delete noAudit.audits["network-requests"];
  const a = fixture({ reports: [JSON.stringify(noAudit)], baseline: BASE });
  const r1 = run(["--reports", a.reportsDir, "--baseline", a.baselineFile]);
  assert.equal(r1.status, 1, r1.output);
  assert.match(r1.output, /no network-requests audit for \//);

  const noSize = JSON.parse(lhr("/", { script: 100, stylesheet: 200 }));
  delete noSize.audits["network-requests"].details.items[0].resourceSize;
  const b = fixture({ reports: [JSON.stringify(noSize)], baseline: BASE });
  const r2 = run(["--reports", b.reportsDir, "--baseline", b.baselineFile]);
  assert.equal(r2.status, 1, r2.output);
  assert.match(r2.output, /a\.js has no resourceSize/);
});

test("measures uncompressed body bytes of 200 responses only, never transferSize", () => {
  // Fixture: transferSize is +300 per request and a 404 script carries 5000 bytes.
  // A baseline equal to the exact resourceSize sum passes only if both are ignored.
  const { reportsDir, baselineFile } = fixture({
    reports: [lhr("/", { script: 15000, stylesheet: 14000 })],
    baseline: BASE,
  });
  const r = run(["--reports", reportsDir, "--baseline", baselineFile]);
  assert.equal(r.status, 0, r.output);
  assert.doesNotMatch(r.output, /tightened/);
});

test("fails loudly when there are no reports at all", () => {
  const { reportsDir, baselineFile } = fixture({ reports: [], baseline: BASE });
  const r = run(["--reports", reportsDir, "--baseline", baselineFile]);
  assert.equal(r.status, 1, r.output);
  assert.match(r.output, /no lhr-\*\.json/);
});

test("--update lowers the baseline to the measured values", () => {
  const { reportsDir, baselineFile } = fixture({
    reports: [lhr("/", { script: 12000, stylesheet: 13000 })],
    baseline: BASE,
  });
  const r = run(["--reports", reportsDir, "--baseline", baselineFile, "--update"]);
  assert.equal(r.status, 0, r.output);
  assert.deepEqual(readJson(baselineFile).routes["/"], { script: 12000, stylesheet: 13000 });
});

test("--update refuses to raise a baseline without --allow-raise", () => {
  const { reportsDir, baselineFile } = fixture({
    reports: [lhr("/", { script: 16000, stylesheet: 14000 })],
    baseline: BASE,
  });
  const r = run(["--reports", reportsDir, "--baseline", baselineFile, "--update"]);
  assert.equal(r.status, 1, r.output);
  assert.match(r.output, /--allow-raise/);
  assert.deepEqual(readJson(baselineFile), BASE, "refused update must not write");
});

test("--update --allow-raise <reason> raises and records the reason", () => {
  const { reportsDir, baselineFile } = fixture({
    reports: [lhr("/", { script: 16000, stylesheet: 14000 })],
    baseline: BASE,
  });
  const r = run([
    "--reports", reportsDir, "--baseline", baselineFile,
    "--update", "--allow-raise", "date picker ships a calendar widget",
  ]);
  assert.equal(r.status, 0, r.output);
  const written = readJson(baselineFile);
  assert.equal(written.routes["/"].script, 16000);
  assert.equal(written.raises.length, 1);
  assert.equal(written.raises[0].route, "/");
  assert.equal(written.raises[0].metric, "script");
  assert.equal(written.raises[0].from, 15000);
  assert.equal(written.raises[0].to, 16000);
  assert.equal(written.raises[0].reason, "date picker ships a calendar widget");
  assert.match(written.raises[0].date, /^\d{4}-\d{2}-\d{2}$/);
});

test("--update seeds a missing baseline file from the reports", () => {
  const { reportsDir, baselineFile } = fixture({
    reports: [lhr("/", { script: 100, stylesheet: 200 })],
  });
  const r = run(["--reports", reportsDir, "--baseline", baselineFile, "--update"]);
  assert.equal(r.status, 0, r.output);
  assert.deepEqual(readJson(baselineFile).routes, { "/": { script: 100, stylesheet: 200 } });
});
