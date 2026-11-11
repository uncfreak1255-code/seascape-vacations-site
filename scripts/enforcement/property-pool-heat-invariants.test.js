const test = require("node:test");
const assert = require("node:assert/strict");

const fallbackProperties = require("../../src/_data/properties-fallback.json");
const seoPages = require("../../src/_data/seoPages.json");
const { applyStayFacts } = require("../../src/_data/stayFacts");

function allSeoPages() {
  return Object.values(seoPages).flat();
}

const POOL_HEAT_MENTION = /\b(?:pool[- ]heat(?:ing)?|heated pools?|heat(?:ing)? (?:the |your |a )?pool)\b/i;

function stringLeaves(value) {
  if (typeof value === "string") return [value.replace(/<[^>]+>/g, " ")];
  if (!value || typeof value !== "object") return [];
  return Object.values(value).flatMap(stringLeaves);
}

function assertPoolHeatPolicy(text, name) {
  assert.match(text, /\$40\s*(?:\/\s*night|per night)\b/i, `${name}: $40 per night`);
  assert.match(text, /before arrival[^.!?]*(?:whole|entire) stay/i, `${name}: before-arrival whole stay`);
  assert.match(text, /after arrival[^.!?]*all (?:the )?remaining nights/i, `${name}: after-arrival remaining nights`);
  assert.match(text, /approved long[- ]stay flat rates[^.!?]*apply/i, `${name}: preserve approved flat rates`);
  assert.match(text, /individual nights cannot be selected/i, `${name}: no night picking`);
  assert.match(text, /inclusions already confirmed in your reservation messages are honored/i, `${name}: preserve confirmed reservation terms`);
  assert.match(text, /confirm the nights, total charge, payment instructions and heating start time/i, `${name}: confirmation before treating the add-on as arranged`);
  assert.match(text, /late-day requests or mid-stay requests on an approved long-stay rate[^.!?]*individually before payment/i, `${name}: unresolved billing stays under individual review`);
  assert.match(text, /request alone does not turn on the heat/i, `${name}: no automatic activation promise`);
}

// The owner of The Coastal stopped charging for pool heat (Sawyer, 2026-11-11). Every other home keeps the $40 rule.
function assertCoastalPoolHeatPolicy(text) {
  assert.match(text, /no charge for pool heat at The Coastal/i, "coastal-stay: no pool-heat charge");
  assert.match(text, /contact us to arrange it and confirm the heating start time/i, "coastal-stay: arrange with us");
  assert.match(text, /request alone does not turn on the heat/i, "coastal-stay: no automatic activation promise");
  assert.match(text, /water temperature depends on the weather/i, "coastal-stay: no temperature promise");
  assert.doesNotMatch(text, /\$\s*\d|\b(?:per night|per day|\/\s*night|\/\s*day)\b/i, "coastal-stay: no dollar amount in the heat policy");
  assert.doesNotMatch(text, /\b(?:refund|always|automatic(?:ally)?|guarantee[ds]?)\b/i, "coastal-stay: no refund, always-on or guarantee claim");
  assert.doesNotMatch(text, /\b(?:long-stay|before arrival|after arrival|remaining nights|individual nights)\b/i, "coastal-stay: no other-home billing rules");
}

function assertPoolHeatClaims(strings, name) {
  for (const text of strings) {
    for (const sentence of text.split(/[.!?]/).filter((part) => POOL_HEAT_MENTION.test(part))) {
      assert.doesNotMatch(sentence, /\/\s*day\b|per day|\bfive established homes\b|\bthose five homes\b/i, name);
      assert.doesNotMatch(sentence, /\b(?:included|free)\b/i, `${name}: pool heat is an extra`);
      if (name === "coastal-stay") assert.doesNotMatch(sentence, /\$\s*\d/, `${name}: Coastal pool heat has no price`);
      for (const rate of sentence.matchAll(/\$(\d+(?:\.\d+)?)\s*(?:\/\s*night|per night)\b/gi)) {
        assert.equal(Number(rate[1]), 40, `${name}: pool-heat nightly rate`);
      }
    }
  }
}

test("pool heat follows the same nightly and arrival rules at every home and stay entry", () => {
  for (const property of fallbackProperties) {
    const policy = property.guestFacts?.poolHeat || "";
    if (property.slug === "relaxing-oasis") {
      // Its existing, separately approved reservation terms are retained during catalog onboarding.
      assert.match(policy, /Already-confirmed heat-included reservations keep that inclusion/);
      assert.match(policy, /optional at \$40 per booked night for the whole stay/);
      continue;
    }
    if (property.slug === "coastal-stay") {
      assertCoastalPoolHeatPolicy(policy);
    } else {
      assertPoolHeatPolicy(policy, property.slug);
      assert.match(policy, /\$40 per night at every managed home except The Coastal, where there is no charge\./, `${property.slug}: the $40 rule names The Coastal exception`);
      assert.doesNotMatch(policy, /\b(?:included|free|five established homes)\b|\/\s*day\b|per day/i, property.slug);
    }
    assertPoolHeatClaims(stringLeaves(property), property.slug);
  }

  const pages = allSeoPages().filter((page) => stringLeaves(page).some((text) => POOL_HEAT_MENTION.test(text)));
  assert.ok(pages.length > 0, "pool-heat stay entries must be checked");
  for (const page of pages) {
    const rendered = applyStayFacts(structuredClone(page), fallbackProperties);
    const strings = stringLeaves(rendered);
    assertPoolHeatPolicy(strings.join(" "), page.slug);
    for (const text of strings) {
      assert.doesNotMatch(text, /every managed home(?! except The Coastal)/i, `${page.slug}: "every managed home" must not cover The Coastal`);
    }
    assertPoolHeatClaims(strings, page.slug);
  }
});
