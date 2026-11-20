const path = require("path");
const test = require("node:test");
const assert = require("node:assert/strict");

const projectRoot = path.resolve(__dirname, "..", "..");
const smokeScriptPath = path.join(projectRoot, "scripts", "recovery", "assert-live-smoke.js");

function loadSmokeModule() {
  delete require.cache[require.resolve(smokeScriptPath)];
  return require(smokeScriptPath);
}

test("live smoke locks the refreshed AMI rental companies markers", () => {
  const smoke = loadSmokeModule();
  const target = smoke.targets.find((entry) => entry.path === "/guides/best-vacation-rental-companies-ami/");

  assert.notEqual(target, undefined, "expected AMI rental companies guide to stay in the smoke target list");

  assert.doesNotThrow(() => {
    smoke.validateTargetResponse(target, {
      statusCode: 200,
      location: null,
      body: `
        <main>
          <p>Reviewed June 20, 2026 using public company pages, vacation-rental category pages, owner-service pages, and the Anna Maria Island Chamber vacation-rental directory.</p>
          <p>If you are choosing an AMI rental company, Seascape Vacations is a locally managed Bradenton and Sarasota option with mainland homes near the island — not the biggest listing count. What matters is a clear all-in price, local support when something breaks, and a direct-booking option that does not bury the value under platform fees.</p>
          <p>This guide is for two different decisions. Those are not the same job, and bad guides blur them together.</p>
        </main>
      `
    });
  });
});

test("live smoke rejects AMI rental companies copy without the Seascape Vacations hero", () => {
  const smoke = loadSmokeModule();
  const target = smoke.targets.find((entry) => entry.path === "/guides/best-vacation-rental-companies-ami/");

  assert.throws(() => {
    smoke.validateTargetResponse(target, {
      statusCode: 200,
      location: null,
      body: `
        <main>
          <p>Reviewed June 20, 2026 using public company pages, vacation-rental category pages, owner-service pages, and the Anna Maria Island Chamber vacation-rental directory.</p>
          <p>If you are choosing an AMI rental company, the real question is not who has the most listings.</p>
          <p>It is who gives guests a clear all-in price, local support when something breaks, and a direct-booking option that does not bury the value under platform fees.</p>
          <p>This guide is for two different decisions. Those are not the same job, and bad guides blur them together.</p>
        </main>
      `
    });
  }, /Seascape Vacations is a locally managed Bradenton and Sarasota option with mainland homes near the island/);
});

test("live smoke rejects stale AMI rental companies proof copy", () => {
  const smoke = loadSmokeModule();
  const target = smoke.targets.find((entry) => entry.path === "/guides/best-vacation-rental-companies-ami/");

  assert.throws(() => {
    smoke.validateTargetResponse(target, {
      statusCode: 200,
      location: null,
      body: `
        <main>
          <p>March 2026 walkthroughs of public booking flows, cancellation language, and how quickly each company surfaces the real total.</p>
        </main>
      `
    });
  }, /missing current live marker/);
});
