const path = require("path");
const test = require("node:test");
const assert = require("node:assert/strict");
const { ownerHubBody } = require("./recovery-smoke-owner-hub-fixture");

const projectRoot = path.resolve(__dirname, "..", "..");
const smokeScriptPath = path.join(projectRoot, "scripts", "recovery", "assert-live-smoke.js");

function loadSmokeModule() {
  delete require.cache[require.resolve(smokeScriptPath)];
  return require(smokeScriptPath);
}

function ownerTarget(smoke) {
  const target = smoke.targets.find((entry) => entry.path === "/property-management/");
  assert.notEqual(target, undefined, "expected property-management to stay in the smoke target list");
  return target;
}

test("property-management smoke requires the heard-about select and AI prompt", () => {
  const smoke = loadSmokeModule();
  const target = ownerTarget(smoke);
  const { HEARD_ABOUT_INCLUDES } = require("../recovery/validate-owner-live-surface");
  assert.ok(HEARD_ABOUT_INCLUDES.length > 0);

  assert.doesNotThrow(() => {
    smoke.validateTargetResponse(target, {
      statusCode: 200,
      location: null,
      body: ownerHubBody()
    });
  });

  assert.throws(
    () => smoke.validateTargetResponse(target, { statusCode: 200, location: null, body: "" }),
    /missing the Waterline owner offer surface|empty copy/
  );

  const missingSelect = ownerHubBody().replace('<select name="heard_about">', "<select>");
  assert.throws(
    () => smoke.validateTargetResponse(target, { statusCode: 200, location: null, body: missingSelect }),
    /heard-about/
  );

  const missingPrompt = ownerHubBody().replace('name="heard_about_prompt"', "removed-prompt");
  assert.throws(
    () => smoke.validateTargetResponse(target, { statusCode: 200, location: null, body: missingPrompt }),
    /heard-about/
  );

  const missingLabel = ownerHubBody().replace("How did you hear about us? (optional)", "Source");
  assert.throws(
    () => smoke.validateTargetResponse(target, { statusCode: 200, location: null, body: missingLabel }),
    /heard-about/
  );
});
