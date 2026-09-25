"use strict";

const http = require("http");
const path = require("path");
const test = require("node:test");
const assert = require("node:assert/strict");
const { execFile } = require("child_process");

const SCRIPT = path.resolve(__dirname, "pagespeed-insights-status.js");

// PageSpeed v5 returns a loadingExperience block even when CrUX has no
// field data for the URL; the block then carries only initial_url and an
// empty metrics object. Only a non-empty metrics object is field data.
function psiBody({ fieldMetrics, originMetrics }) {
  const body = {
    lighthouseResult: {
      categories: { performance: { score: 0.9 } },
      audits: {
        "largest-contentful-paint": { numericValue: 2000 },
        "cumulative-layout-shift": { numericValue: 0 },
        "total-blocking-time": { numericValue: 10 },
      },
    },
    loadingExperience: { initial_url: "https://example.test/", metrics: fieldMetrics },
  };
  if (originMetrics) {
    body.originLoadingExperience = { initial_url: "https://example.test/", metrics: originMetrics };
  }
  return body;
}

function withFakePsi(body, fn) {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      res.setHeader("content-type", "application/json");
      res.end(JSON.stringify(body));
    });
    server.listen(0, "127.0.0.1", async () => {
      const endpoint = `http://127.0.0.1:${server.address().port}/runPagespeed`;
      try {
        resolve(await fn(endpoint));
      } catch (err) {
        reject(err);
      } finally {
        server.close();
      }
    });
  });
}

function runScript(endpoint) {
  return new Promise((resolve) => {
    execFile(
      "node",
      [SCRIPT, "--route", "/"],
      { env: { ...process.env, PAGESPEED_API_ENDPOINT: endpoint, PAGESPEED_API_KEY: "" } },
      (err, stdout, stderr) => resolve({ code: err ? err.code : 0, stdout, stderr })
    );
  });
}

function runStrict(endpoint) {
  return new Promise((resolve) => {
    execFile(
      "node",
      [SCRIPT, "--route", "/", "--strict"],
      { env: { ...process.env, PAGESPEED_API_ENDPOINT: endpoint, PAGESPEED_API_KEY: "" } },
      (err, stdout, stderr) => resolve({ code: err ? err.code : 0, stdout, stderr })
    );
  });
}

test("a 200 response without a Lighthouse result is unavailable, and --strict exits 2", async () => {
  // Adversarial review 2026-09-24: HTML, arbitrary JSON, and PageSpeed's own
  // 200 + error envelope were all reported "available" with null metrics.
  const bodies = [
    { foo: "bar" },
    { error: { code: 500, message: "Backend Error" } },
  ];
  for (const body of bodies) {
    const r = await withFakePsi(body, runStrict);
    assert.equal(r.code, 2, `${JSON.stringify(body)}: ${r.stdout}${r.stderr}`);
    const [result] = JSON.parse(r.stdout).results;
    assert.equal(result.status, "unavailable");
    assert.equal(result.reason, "malformed_response");
    assert.equal(result.performance_score, undefined);
  }

  // A non-JSON body must take the same path.
  const html = await new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      res.setHeader("content-type", "text/html");
      res.end("<html><body>not json</body></html>");
    });
    server.listen(0, "127.0.0.1", async () => {
      try {
        resolve(await runStrict(`http://127.0.0.1:${server.address().port}/runPagespeed`));
      } catch (err) {
        reject(err);
      } finally {
        server.close();
      }
    });
  });
  assert.equal(html.code, 2, html.stdout + html.stderr);
  assert.equal(JSON.parse(html.stdout).results[0].reason, "malformed_response");
});

test("an empty field block is reported as no CrUX data", async () => {
  const r = await withFakePsi(psiBody({ fieldMetrics: {} }), runScript);
  assert.equal(r.code, 0, r.stderr);
  const [result] = JSON.parse(r.stdout).results;
  assert.equal(result.status, "available");
  assert.equal(result.crux_url_available, false);
  assert.equal(result.crux_origin_available, false);
});

test("real field metrics are reported as CrUX data, for URL and origin separately", async () => {
  const lcp = { LARGEST_CONTENTFUL_PAINT_MS: { percentile: 2500, category: "AVERAGE" } };
  const r = await withFakePsi(psiBody({ fieldMetrics: lcp, originMetrics: lcp }), runScript);
  assert.equal(r.code, 0, r.stderr);
  const [result] = JSON.parse(r.stdout).results;
  assert.equal(result.crux_url_available, true);
  assert.equal(result.crux_origin_available, true);

  const urlOnly = await withFakePsi(psiBody({ fieldMetrics: lcp }), runScript);
  assert.equal(JSON.parse(urlOnly.stdout).results[0].crux_origin_available, false);
});
