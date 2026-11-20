const path = require("path");
const test = require("node:test");
const assert = require("node:assert/strict");
const { FEE_PASSAGE, ownerHubBody } = require("./recovery-smoke-owner-hub-fixture");

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

  const currentOwnerHubBody = ownerHubBody({
    extraMain: '<a href="/property-management/vacation-rental-management-sarasota/">Sarasota</a>'
  });

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
  const minifiedOwnerHubBody = ownerHubBody({ formName: "'owner-revenue-teardown'" });

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

  const eightHomesOwnerHubBody = ownerHubBody();
  const fiveHomesOwnerHubBody = eightHomesOwnerHubBody
    .replace("Eight homes. One local team.", "Five homes. One local team.")
    .replace("Why an eight-home operator", "Why a five-home operator");

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

test("property-management smoke rejects the Why a eight-home typo", () => {
  const smoke = loadSmokeModule();
  const target = smoke.targets.find((entry) => entry.path === "/property-management/");
  const body = ownerHubBody({ whyTitle: "Why a eight-home operator" });
  assert.throws(() => {
    smoke.validateTargetResponse(target, { statusCode: 200, location: null, body });
  }, /property-management hub is missing the Waterline owner offer surface/);
});

test("property-management smoke rejects a duplicate Owners header link", () => {
  const smoke = loadSmokeModule();
  const target = smoke.targets.find((entry) => entry.path === "/property-management/");
  const body = ownerHubBody({
    prefix: '<a class="g-header-owners" href="/property-management/">Owners</a>'
  });
  assert.throws(() => {
    smoke.validateTargetResponse(target, { statusCode: 200, location: null, body });
  }, /g-header-owners/);
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
          <h2>Is Seascape a local alternative to Vacasa or Evolve?</h2>
      <p>Seascape Vacations is an owner-operated vacation rental manager</p>
      <a href="#owner-cta" data-placement="local-alternative">Request your 48-hour revenue review</a>
      <h1>Know what your home earned <em>and what needs attention.</em></h1>
          <p>Many homes. One local team.</p>
          <a href="#owner-cta">Get my review</a>
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
      body: ownerHubBody({ includeForm: false })
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


test("owner smoke rejects a missing local-alternative answer and tracked action", () => {
  const fs = require("fs");
  const smoke = loadSmokeModule();
  const target = smoke.targets.find(entry => entry.path === "/property-management/");
  const body = fs.readFileSync(path.join(projectRoot, "_site/property-management/index.html"), "utf8");
  assert.doesNotThrow(() => smoke.validateTargetResponse(target, { statusCode: 200, body }));
  for (const stale of [
    body.replaceAll("Is Seascape a local alternative to Vacasa or Evolve?", "removed answer"),
    body.replace(/data-placement=["']local-alternative["']/g, "removed-tracking")
  ]) {
    assert.throws(() => smoke.validateTargetResponse(target, { statusCode: 200, body: stale }), /local-alternative/);
  }
});

test("owner live-smoke fee-number scan fails closed on empty copy and planted figures", () => {
  const {
    assertNoPublishedFeeNumbers
  } = require("../recovery/validate-owner-live-surface");
  const feePassage = `<p>${FEE_PASSAGE}</p>`;
  assert.throws(() => assertNoPublishedFeeNumbers(""), /empty copy/);
  assert.throws(() => assertNoPublishedFeeNumbers("   "), /empty copy/);
  assert.throws(() => assertNoPublishedFeeNumbers("<script>12%</script>"), /empty copy/);
  assert.throws(
    () => assertNoPublishedFeeNumbers("<p>The management fee is 12% of net rent.</p>"),
    /fee percentage or dollar amount/
  );
  assert.throws(
    () => assertNoPublishedFeeNumbers("<p>There is a $99 monthly minimum.</p>"),
    /fee percentage or dollar amount/
  );
  assert.doesNotThrow(() =>
    assertNoPublishedFeeNumbers("<p>Seascape charges a share of your home's net rent.</p>")
  );
  assert.throws(
    () =>
      assertNoPublishedFeeNumbers(
        `${feePassage}<script type="application/ld+json">{"@type":"FAQPage","mainEntity":[{"@type":"Question","name":"How much does Seascape charge?","acceptedAnswer":{"@type":"Answer","text":"The management fee is 12% of net rent."}}]}</script>`
      ),
    /JSON-LD/
  );
  assert.throws(
    () =>
      assertNoPublishedFeeNumbers(
        `${feePassage}<meta name="description" content="Seascape charges 12% of net rent.">`
      ),
    /meta description/
  );
  assert.throws(
    () =>
      assertNoPublishedFeeNumbers(
        `${feePassage}<meta property="og:description" content="Seascape charges a $99 monthly minimum.">`
      ),
    /meta description/
  );
  assert.doesNotThrow(() =>
    assertNoPublishedFeeNumbers(
      `${feePassage}<p>Airbnb's own host fee is separate: Airbnb says most listings on its single-fee structure pay 15.5%.</p>`
    )
  );
  assert.doesNotThrow(() =>
    assertNoPublishedFeeNumbers(
      `${feePassage}<script type="application/ld+json">{"@type":"FAQPage","mainEntity":[{"@type":"Question","name":"What about Airbnb?","acceptedAnswer":{"@type":"Answer","text":"Airbnb's own host fee is separate: Airbnb says most listings on its single-fee structure pay 15.5%."}}]}</script>`
    )
  );
});

test("owner smoke requires the no-number fee passage and rejects a published percentage", () => {
  const smoke = loadSmokeModule();
  const target = smoke.targets.find(entry => entry.path === "/property-management/");
  const body = ownerHubBody();
  assert.doesNotThrow(() => smoke.validateTargetResponse(target, { statusCode: 200, body }));
  const missingLabel = body.replace("How our management fee works", "Pricing");
  assert.throws(
    () => smoke.validateTargetResponse(target, { statusCode: 200, body: missingLabel }),
    /management fee/
  );
  const numbered = body.replace(
    "We quote your exact fee after looking at your home.",
    "Vacation rental management from 17%. We quote your exact fee after looking at your home."
  );
  assert.throws(
    () => smoke.validateTargetResponse(target, { statusCode: 200, body: numbered }),
    /stale live marker/
  );
  const percent = body.replace(
    "We quote your exact fee after looking at your home.",
    "The management fee is 12% of net rent. We quote your exact fee after looking at your home."
  );
  assert.throws(
    () => smoke.validateTargetResponse(target, { statusCode: 200, body: percent }),
    /fee percentage or dollar amount/
  );
  const dollars = body.replace(
    "We quote your exact fee after looking at your home.",
    "There is a $99 monthly minimum. We quote your exact fee after looking at your home."
  );
  assert.throws(
    () => smoke.validateTargetResponse(target, { statusCode: 200, body: dollars }),
    /fee percentage or dollar amount/
  );
  const schemaOnly = `${body}<script type="application/ld+json">{"@type":"FAQPage","mainEntity":[{"@type":"Question","name":"How much does Seascape charge to manage a vacation rental?","acceptedAnswer":{"@type":"Answer","text":"The management fee is 12% of net rent."}}]}</script>`;
  assert.throws(
    () => smoke.validateTargetResponse(target, { statusCode: 200, body: schemaOnly }),
    /JSON-LD/
  );
  const airbnbHostFee = `${body}<p>Airbnb's own host fee is separate: Airbnb says most listings on its single-fee structure pay 15.5%.</p>`;
  assert.doesNotThrow(() => smoke.validateTargetResponse(target, { statusCode: 200, body: airbnbHostFee }));
  const namedQuote = body.replace(
    "We quote your exact fee after looking at your home.",
    "We quote your exact fee after looking at your home. Patrick quotes your exact fee after looking at your home."
  );
  assert.throws(
    () => smoke.validateTargetResponse(target, { statusCode: 200, body: namedQuote }),
    /stale live marker/
  );
  const oldChannels = body.replace(
    "listing on Airbnb, Vrbo, Google, our direct website and more",
    "listing on Airbnb, Vrbo and our own booking site"
  );
  assert.throws(
    () => smoke.validateTargetResponse(target, { statusCode: 200, body: oldChannels }),
    /missing current live marker|stale live marker/
  );
  const oldTaxes = body.replace(
    "tourism and sales taxes remitted for you",
    "county taxes remitted"
  );
  assert.throws(
    () => smoke.validateTargetResponse(target, { statusCode: 200, body: oldTaxes }),
    /missing current live marker|stale live marker/
  );
});
