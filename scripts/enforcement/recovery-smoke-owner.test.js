const path = require("path");
const test = require("node:test");
const assert = require("node:assert/strict");

const projectRoot = path.resolve(__dirname, "..", "..");
const smokeScriptPath = path.join(projectRoot, "scripts", "recovery", "assert-live-smoke.js");

function loadSmokeModule() {
  delete require.cache[require.resolve(smokeScriptPath)];
  return require(smokeScriptPath);
}

test("property-management smoke follows the current Waterline owner offer hub", () => {
  const smoke = loadSmokeModule();
  const target = smoke.targets.find((entry) => entry.path === "/property-management/");

  assert.notEqual(target, undefined, "expected property-management to stay in the smoke target list");

  const currentOwnerHubBody = `
    <main>
      <h1>Know what your home earned <em>and what needs attention.</em></h1>
      <p>Eight homes. One local team.</p>
      <a href="#owner-cta">Request your 48-hour revenue review</a>
      <form name="owner-revenue-teardown" method="POST"></form>
      <input type="checkbox" name="submitter_authority" value="owner_or_authorized_representative" required>
      I confirm I am the property owner or an authorized representative for this property.
      Owner statement, optional
      <h2>What we do for your home</h2>
      <h2>Why a eight-home operator</h2>
      <h2>The homes we manage</h2>
      <a href="/property-management/vacation-rental-management-sarasota/">Sarasota</a>
    </main>
  `;

  assert.doesNotThrow(() => {
    smoke.validateTargetResponse(target, {
      statusCode: 200,
      location: null,
      body: currentOwnerHubBody
    });
  });
});

test("property-management smoke accepts the live minified single-quoted form name", () => {
  const smoke = loadSmokeModule();
  const target = smoke.targets.find((entry) => entry.path === "/property-management/");
  const minifiedOwnerHubBody = `
    <main>
      <h1>Know what your home earned <em>and what needs attention.</em></h1>
      <p>Eight homes. One local team.</p>
      <a href="#owner-cta">Request your 48-hour revenue review</a>
      <form name='owner-revenue-teardown' method='POST'></form>
      <input type="checkbox" name="submitter_authority" value="owner_or_authorized_representative" required>
      I confirm I am the property owner or an authorized representative for this property.
      Owner statement, optional
      <h2>What we do for your home</h2>
      <h2>Why a eight-home operator</h2>
      <h2>The homes we manage</h2>
    </main>
  `;

  assert.doesNotThrow(() => {
    smoke.validateTargetResponse(target, {
      statusCode: 200,
      location: null,
      body: minifiedOwnerHubBody
    });
  });
});

test("property-management smoke rejects Five homes on a eight-row catalog (#705)", () => {
  const smoke = loadSmokeModule();
  const target = smoke.targets.find((entry) => entry.path === "/property-management/");
  const catalog = require(path.join(projectRoot, "src/_data/properties-fallback.json"));
  const { catalogHomeCountWord } = require("./home-count-word");

  assert.equal(catalog.length, 8);
  assert.equal(catalogHomeCountWord(), "eight");

  const eightHomesOwnerHubBody = `
    <main>
      <h1>Know what your home earned <em>and what needs attention.</em></h1>
      <p>Eight homes. One local team.</p>
      <a href="#owner-cta">Request your 48-hour revenue review</a>
      <form name="owner-revenue-teardown" method="POST"></form>
      <input type="checkbox" name="submitter_authority" value="owner_or_authorized_representative" required>
      I confirm I am the property owner or an authorized representative for this property.
      Owner statement, optional
      <h2>What we do for your home</h2>
      <h2>Why a eight-home operator</h2>
      <h2>The homes we manage</h2>
    </main>
  `;
  const fiveHomesOwnerHubBody = eightHomesOwnerHubBody
    .replace("Eight homes. One local team.", "Five homes. One local team.")
    .replace("Why a eight-home operator", "Why a five-home operator");

  assert.doesNotThrow(() => {
    smoke.validateTargetResponse(target, {
      statusCode: 200,
      location: null,
      body: eightHomesOwnerHubBody
    });
  });

  assert.throws(() => {
    smoke.validateTargetResponse(target, {
      statusCode: 200,
      location: null,
      body: fiveHomesOwnerHubBody
    });
  }, /property-management hub is missing the Waterline owner offer surface/);
});

test("property-management smoke rejects a non-number-word home count", () => {
  const smoke = loadSmokeModule();
  const target = smoke.targets.find((entry) => entry.path === "/property-management/");

  assert.throws(() => {
    smoke.validateTargetResponse(target, {
      statusCode: 200,
      location: null,
      body: `
        <main>
          <h1>Know what your home earned <em>and what needs attention.</em></h1>
          <p>Many homes. One local team.</p>
          <a href="#owner-cta">Request your 48-hour revenue review</a>
          <form name="owner-revenue-teardown" method="POST"></form>
          <input type="checkbox" name="submitter_authority" value="owner_or_authorized_representative" required>
          I confirm I am the property owner or an authorized representative for this property.
          Owner statement, optional
          <h2>What we do for your home</h2>
          <h2>Why a mystery-home operator</h2>
          <h2>The homes we manage</h2>
        </main>
      `
    });
  }, /property-management hub is missing the Waterline owner offer surface/);
});

test("property-management smoke fails when the owner form name is missing", () => {
  const smoke = loadSmokeModule();
  const target = smoke.targets.find((entry) => entry.path === "/property-management/");

  assert.throws(() => {
    smoke.validateTargetResponse(target, {
      statusCode: 200,
      location: null,
      body: `
        <main>
          <h1>Know what your home earned <em>and what needs attention.</em></h1>
      <p>Eight homes. One local team.</p>
          <a href="#owner-cta">Request your 48-hour revenue review</a>
          <h2>What we do for your home</h2>
          <h2>Why a eight-home operator</h2>
          <h2>The homes we manage</h2>
        </main>
      `
    });
  }, /property-management hub is missing the Waterline owner offer surface/);
});

test("property-management smoke rejects the retired explainer-hub surface", () => {
  const smoke = loadSmokeModule();
  const target = smoke.targets.find((entry) => entry.path === "/property-management/");

  assert.throws(() => {
    smoke.validateTargetResponse(target, {
      statusCode: 200,
      location: null,
      body: `
        <main>
          <h1>What Is Vacation Rental Property Management?</h1>
          <a href="/properties/">View All Properties</a>
        </main>
      `
    });
  }, /property-management hub is missing the Waterline owner offer surface/);
});
