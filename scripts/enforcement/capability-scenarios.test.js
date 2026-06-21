const test = require("node:test");
const assert = require("node:assert/strict");

const { SCENARIOS } = require("./capability-scenarios");

test("capability scenarios cover the major site capability families", () => {
  assert.equal(SCENARIOS.length, 8);

  const requiredCapabilities = [
    /homepage/i,
    /property/i,
    /stay/i,
    /guide/i,
    /owner/i,
    /conversion/i,
    /AI discovery|schema/i,
    /redirects|internal links|sitemap/i
  ];

  const capabilityText = SCENARIOS.map((scenario) => `${scenario.name} ${scenario.capability}`).join("\n");

  for (const pattern of requiredCapabilities) {
    assert.match(capabilityText, pattern);
  }
});

test("each capability scenario defines pass-fail criteria and evidence checks", () => {
  for (const scenario of SCENARIOS) {
    assert.match(scenario.id, /^S\d{2}$/);
    assert.ok(scenario.name);
    assert.ok(scenario.capability);
    assert.ok(scenario.userStory);
    assert.ok(Array.isArray(scenario.successCriteria), `${scenario.id} missing success criteria`);
    assert.ok(scenario.successCriteria.length >= 2, `${scenario.id} needs clear criteria`);
    assert.ok(Array.isArray(scenario.checks), `${scenario.id} missing checks`);
    assert.ok(scenario.checks.length >= 1, `${scenario.id} needs at least one check`);

    for (const scenarioCheck of scenario.checks) {
      assert.ok(scenarioCheck.label, `${scenario.id} has an unlabeled check`);
      assert.equal(typeof scenarioCheck.fn, "function", `${scenario.id} check ${scenarioCheck.label} is not executable`);
    }
  }
});
