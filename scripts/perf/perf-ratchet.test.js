"use strict";

const fs = require("fs");
const os = require("os");
const path = require("path");
const test = require("node:test");
const assert = require("node:assert/strict");
const { execFileSync } = require("child_process");

const SCRIPT = path.resolve(__dirname, "perf-ratchet.js");

function lhr(route, { script, stylesheet }) {
  return JSON.stringify({
    requestedUrl: `http://localhost${route}`,
    finalDisplayedUrl: `http://localhost${route}`,
    audits: {
      "resource-summary": {
        details: {
          items: [
            { resourceType: "script", transferSize: script },
            { resourceType: "stylesheet", transferSize: stylesheet },
            { resourceType: "image", transferSize: 400000 },
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

test("uses the median across runs so one noisy run neither passes nor fails alone", () => {
  const { reportsDir, baselineFile } = fixture({
    reports: [
      lhr("/", { script: 15000, stylesheet: 14000 }),
      lhr("/", { script: 15000, stylesheet: 14000 }),
      lhr("/", { script: 99999, stylesheet: 14000 }),
    ],
    baseline: BASE,
  });
  assert.equal(run(["--reports", reportsDir, "--baseline", baselineFile]).status, 0);

  const low = fixture({
    reports: [
      lhr("/", { script: 1, stylesheet: 14000 }),
      lhr("/", { script: 20000, stylesheet: 14000 }),
      lhr("/", { script: 20000, stylesheet: 14000 }),
    ],
    baseline: BASE,
  });
  assert.equal(run(["--reports", low.reportsDir, "--baseline", low.baselineFile]).status, 1);
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
