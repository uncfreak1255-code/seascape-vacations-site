#!/usr/bin/env node
"use strict";

// Byte-size ratchet over the Lighthouse reports that `lhci autorun` writes.
//
// The static budgets in lighthouserc.js / config/perf-budget.json are ceilings
// with a lot of headroom (script 100 KB against ~7-15 KB shipped). This gate
// pins each budgeted route to the bytes it ships today, so a PR can lower a
// route's script or stylesheet bytes but not raise them without saying why.
//
//   node scripts/perf/perf-ratchet.js                 check (exit 1 on growth)
//   node scripts/perf/perf-ratchet.js --update        write measured values,
//                                                     refuses to raise any
//   node scripts/perf/perf-ratchet.js --update --allow-raise "<reason>"
//
// Values are the median across runs, per route, of the summed uncompressed
// resourceSize of every 200 script / stylesheet request in the
// network-requests audit. Uncompressed body bytes are a function of the
// committed source alone; transferSize is not, because it counts response
// headers and compression, which differ between the Mac runner and a local
// run (+879 bytes on the homepage for the same commit, PR #617 run 1).
// LCP, CLS and TBT stay ceilings in lighthouserc.js because they vary run to
// run.
//
// The pull_request workflow builds the merge of the branch with current main,
// so seed or update the baseline on a tree that already contains origin/main.
// A baseline seeded on a stale base fails in CI with main's growth, not the
// PR's (PR #617 run 2: guest.js +3562 bytes that had landed on main).

const fs = require("fs");
const path = require("path");

// key: the name in the baseline file. requestType: Lighthouse's resourceType
// for the matching rows of the network-requests audit.
const METRICS = [
  { key: "script", requestType: "Script" },
  { key: "stylesheet", requestType: "Stylesheet" },
];

function parseArgs(argv) {
  const args = {
    reports: ".lighthouseci",
    baseline: "config/perf-ratchet.json",
    update: false,
    allowRaise: null,
  };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--reports") args.reports = argv[++i];
    else if (arg === "--baseline") args.baseline = argv[++i];
    else if (arg === "--update") args.update = true;
    else if (arg === "--allow-raise") args.allowRaise = argv[++i];
    else throw new Error(`perf-ratchet: unknown argument ${arg}`);
  }
  if (args.allowRaise !== null && !args.allowRaise) {
    throw new Error("perf-ratchet: --allow-raise needs a reason");
  }
  if (args.allowRaise !== null && !args.update) {
    throw new Error("perf-ratchet: --allow-raise only applies with --update");
  }
  return args;
}

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
}

function readJsonIfExists(file) {
  return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) : null;
}

function readMeasured(reportsDir) {
  if (!fs.existsSync(reportsDir)) {
    throw new Error(`perf-ratchet: reports directory ${reportsDir} does not exist`);
  }
  const files = fs.readdirSync(reportsDir).filter((f) => /^lhr-.*\.json$/.test(f));
  if (files.length === 0) {
    throw new Error(`perf-ratchet: no lhr-*.json reports in ${reportsDir}; run lhci autorun first`);
  }
  const samples = {};
  for (const file of files) {
    const lhr = JSON.parse(fs.readFileSync(path.join(reportsDir, file), "utf8"));
    const url = lhr.finalDisplayedUrl || lhr.requestedUrl;
    if (!url) throw new Error(`perf-ratchet: ${file} has no requestedUrl`);
    const route = new URL(url).pathname;
    const items = lhr.audits?.["network-requests"]?.details?.items;
    if (!Array.isArray(items)) {
      throw new Error(`perf-ratchet: ${file} has no network-requests audit for ${route}`);
    }
    const bucket = (samples[route] ??= Object.fromEntries(METRICS.map((m) => [m.key, []])));
    for (const metric of METRICS) {
      let total = 0;
      for (const item of items) {
        if (item.resourceType !== metric.requestType || item.statusCode !== 200) continue;
        if (typeof item.resourceSize !== "number") {
          throw new Error(`perf-ratchet: ${file} request ${item.url} has no resourceSize`);
        }
        total += item.resourceSize;
      }
      bucket[metric.key].push(total);
    }
  }
  const measured = {};
  for (const [route, bucket] of Object.entries(samples)) {
    measured[route] = Object.fromEntries(METRICS.map((m) => [m.key, median(bucket[m.key])]));
  }
  return measured;
}

function readBaseline(file) {
  const parsed = readJsonIfExists(file);
  if (!parsed) {
    throw new Error(`perf-ratchet: baseline ${file} is missing; run with --update to seed it`);
  }
  if (!parsed.routes || Object.keys(parsed.routes).length === 0) {
    throw new Error(`perf-ratchet: baseline ${file} has no routes; run with --update to seed it`);
  }
  return parsed;
}

// Every route/metric pair where the measured value differs from the baseline,
// as { route, metric, from, to }. Callers split on the sign of to - from.
function deltas(measured, baseline) {
  const out = [];
  for (const [route, values] of Object.entries(measured)) {
    for (const { key: metric } of METRICS) {
      const from = baseline.routes?.[route]?.[metric];
      if (typeof from === "number" && values[metric] !== from) {
        out.push({ route, metric, from, to: values[metric] });
      }
    }
  }
  return out;
}

function check(measured, baseline) {
  const failures = [];
  for (const route of Object.keys(baseline.routes)) {
    if (!measured[route]) {
      failures.push(`no Lighthouse report for ${route}; is it still in lighthouserc.js?`);
      continue;
    }
    for (const { key: metric } of METRICS) {
      if (typeof baseline.routes[route][metric] !== "number") {
        failures.push(`baseline for ${route} has no ${metric} value`);
      }
    }
  }
  for (const route of Object.keys(measured)) {
    if (!baseline.routes[route]) {
      failures.push(`no baseline for ${route}; run npm run perf:ratchet:update and commit it`);
    }
  }
  const changed = deltas(measured, baseline);
  for (const d of changed.filter((d) => d.to > d.from)) {
    failures.push(`${d.route} ${d.metric} ${d.to} > baseline ${d.from} (+${d.to - d.from} bytes)`);
  }
  const tightenable = changed
    .filter((d) => d.to < d.from)
    .map((d) => `${d.route} ${d.metric} ${d.to} < baseline ${d.from}`);
  return { failures, tightenable };
}

function update(measured, baselineFile, allowRaise) {
  const existing = readJsonIfExists(baselineFile) || { routes: {} };
  const raises = deltas(measured, existing).filter((d) => d.to > d.from);
  if (raises.length > 0 && !allowRaise) {
    const lines = raises.map((r) => `  ${r.route} ${r.metric} ${r.from} -> ${r.to}`);
    throw new Error(
      `perf-ratchet: refusing to raise the baseline without --allow-raise "<reason>":\n${lines.join("\n")}`
    );
  }
  const date = new Date().toISOString().slice(0, 10);
  const next = {
    routes: Object.fromEntries(
      Object.keys(measured).sort().map((route) => [route, measured[route]])
    ),
    raises: [
      ...(existing.raises || []),
      ...raises.map((r) => ({ ...r, reason: allowRaise, date })),
    ],
  };
  fs.mkdirSync(path.dirname(baselineFile), { recursive: true });
  fs.writeFileSync(baselineFile, JSON.stringify(next, null, 2) + "\n");
  return { routes: Object.keys(next.routes).length, raises: raises.length };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const measured = readMeasured(args.reports);

  if (args.update) {
    const result = update(measured, args.baseline, args.allowRaise);
    console.log(
      `perf-ratchet: wrote ${args.baseline} (${result.routes} routes, ${result.raises} raises recorded)`
    );
    return 0;
  }

  const baseline = readBaseline(args.baseline);
  const { failures, tightenable } = check(measured, baseline);
  if (failures.length > 0) {
    console.error("perf-ratchet: FAIL");
    for (const line of failures) console.error(`  ${line}`);
    console.error(
      '  lower the bytes, or run: npm run perf:ratchet:update -- --allow-raise "<reason>"'
    );
    return 1;
  }
  console.log(`perf-ratchet: PASS (${Object.keys(baseline.routes).length} routes at or under baseline)`);
  if (tightenable.length > 0) {
    console.log("perf-ratchet: baseline can be tightened, run npm run perf:ratchet:update and commit:");
    for (const line of tightenable) console.log(`  ${line}`);
  }
  return 0;
}

if (require.main === module) {
  try {
    process.exitCode = main();
  } catch (err) {
    console.error(err.message);
    process.exitCode = 1;
  }
}

module.exports = { check, deltas, median, readMeasured, update, METRICS };
