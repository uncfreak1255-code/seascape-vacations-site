const path = require("path");
const test = require("node:test");
const assert = require("node:assert/strict");

const projectRoot = path.resolve(__dirname, "..", "..");
const scriptPath = path.join(projectRoot, "scripts", "recovery", "assert-live-entity-schema-coverage.js");

function loadModule() {
  delete require.cache[require.resolve(scriptPath)];
  return require(scriptPath);
}

test("live entity schema coverage script exports reusable helpers", () => {
  const coverage = loadModule();

  assert.equal(Array.isArray(coverage.requiredRoutes), true);
  assert.equal(coverage.requiredRoutes.length, 20);
  assert.equal(typeof coverage.extractJsonLdBlocks, "function");
  assert.equal(typeof coverage.analyzeEntityCoverage, "function");
  assert.equal(typeof coverage.run, "function");
});

test("analyzeEntityCoverage detects valid Organization coverage", () => {
  const coverage = loadModule();
  const html = `
    <html>
      <head>
        <script type="application/ld+json">
          {"@context":"https://schema.org","@type":"Organization","name":"Seascape Vacations"}
        </script>
      </head>
      <body>ok</body>
    </html>
  `;
  const result = coverage.analyzeEntityCoverage(html, "/guides/example/");

  assert.deepEqual(result.parseFailures, []);
  assert.equal(result.hasEntityCoverage, true);
});

test("analyzeEntityCoverage reports missing entity coverage", () => {
  const coverage = loadModule();
  const html = `
    <html>
      <head>
        <script type="application/ld+json">
          {"@context":"https://schema.org","@type":"Article","headline":"Example"}
        </script>
      </head>
      <body>ok</body>
    </html>
  `;
  const result = coverage.analyzeEntityCoverage(html, "/guides/example/");

  assert.deepEqual(result.parseFailures, []);
  assert.equal(result.hasEntityCoverage, false);
});

test("analyzeEntityCoverage reports JSON-LD parse failures", () => {
  const coverage = loadModule();
  const html = `
    <html>
      <head>
        <script type="application/ld+json">{ "broken": true </script>
      </head>
      <body>ok</body>
    </html>
  `;
  const result = coverage.analyzeEntityCoverage(html, "/guides/example/");

  assert.equal(result.parseFailures.length, 1);
  assert.equal(result.hasEntityCoverage, false);
});
