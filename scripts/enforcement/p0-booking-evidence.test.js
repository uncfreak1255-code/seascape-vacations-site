const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '../..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const report = 'src/research/gulf-coast-vacation-booking-trends-2026.njk';
const retiredStats = /545|1,492|\$1\.7M|\$686|\$499|\b87%|\b82%|\b27%|\b74[- ]day|\b62[- ]day|7\.5 guests|Market Peaked|market dominance/i;

test('family beach copy and FAQ schema do not promise safer water or reduced supervision', () => {
  const s = read('src/guides/siesta-key-vs-anna-maria-island-families.html');
  assert.doesNotMatch(s, /no (?:rip )?currents|AMI (?:is safer|wins on water safety)|Anna Maria Island is safer|requires more (?:water )?supervision|relax while they play|nature's kiddie pool|0-2 (?:ft|feet) for 30\+ yards|5 feet average for 100\+ yards/i);
  assert.match(s, /Rip currents can occur at either beach/i);
  assert.match(s, /follow (?:posted )?flags and lifeguard instructions/i);
  assert.match(s, /closely supervise children/i);
  const schemas = [...s.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]));
  const faq = schemas.find((schema) => schema.mainEntity?.['@type'] === 'FAQPage').mainEntity.mainEntity;
  const safety = faq.find((question) => question.name.startsWith('Which beach is safer'));
  assert.match(safety.acceptedAnswer.text, /Rip currents can occur at either beach/i);
  assert.match(safety.acceptedAnswer.text, /closely supervise children/i);
});

test('near-island accommodation copy and schema do not promise blanket lower prices', () => {
  const s = read('src/guides/where-to-stay-near-anna-maria-island/index.html');
  assert.doesNotMatch(s, /for less money|at lower prices|significantly more expensive|best vacation rental value in the entire AMI area/i);
  assert.match(s, /complete checkout totals for the same dates and guest count/i);
  const schemas = [...s.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]));
  const faq = schemas.find((schema) => schema['@type'] === 'FAQPage');
  const stay = faq.mainEntity.find((question) => question.name === 'Is it better to stay on Anna Maria Island or nearby?');
  assert.match(stay.acceptedAnswer.text, /complete checkout totals for the same dates and guest count/i);
});

test('booking report and its feeder withhold numbers without reviewed underlying evidence', () => {
  for (const p of [report, 'src/guides/florida-gulf-coast-vacation-rental-market-report-2026.html']) {
    const s = read(p);
    assert.doesNotMatch(s, retiredStats, p);
    assert.match(s, /archived reservation export/i, p);
    assert.match(s, /inclusion rules/i, p);
    assert.match(s, /reviewed calculations/i, p);
    assert.match(s, /not a Florida Gulf Coast market average|cannot establish.*market average/i, p);
    assert.match(s, /June 2022 through March 2026/, p);
    assert.match(s, /href="\/properties\/"|href="\/property-management\/#owner-cta"/, p);
  }
});

test('withdrawn benchmark does not claim a verified sample or available method in schema or body', () => {
  const s = read('src/guides/florida-gulf-coast-vacation-rental-market-report-2026.html');
  const schemas = [...s.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]));
  const article = schemas.find((schema) => schema['@type'] === 'Article');
  const faq = schemas.find((schema) => schema['@type'] === 'FAQPage');
  assert.match(article.description, /findings are withheld/i);
  assert.doesNotMatch(JSON.stringify(faq), /from five|figures describe|verified (?:sample|dataset)/i);
  assert.doesNotMatch(s, /value of this small dataset|records the fixed dataset and method|Historical portfolio signals/i);
  assert.match(s, /explains why earlier numeric findings are withheld/i);
});

test('every generated stay record rejects unsupported price advantages and automatic discounts', () => {
  const { assertNoUnsourcedPriceAdvantages, readSourcedClaims } = require('./sourced-claims');
  const pages = JSON.parse(read('src/_data/seoPages.json')).vacationer;
  assert.ok(pages.length > 0, 'generated stay data is present');
  assert.doesNotThrow(() => assertNoUnsourcedPriceAdvantages(pages, readSourcedClaims()));
});

test('unseen synonym plants fail as typed hits, not as a listed fixture', () => {
  const {
    assertNoUnsourcedPriceAdvantages,
    assertSavingsSourced,
    coversHit,
    parseClaimHits,
    readSourcedClaims,
    scanSavingsHitsInText,
    scanStaySavingsHits
  } = require('./sourced-claims');
  const claims = readSourcedClaims();
  const pages = JSON.parse(read('src/_data/seoPages.json')).vacationer;

  const percent = [15, 40];
  const word = ['fif', 'teen'].join('');
  const reduced = ['red', 'uced'].join('');
  const skipIsland = ['skip', ' the ', 'island ', 'markup'].join('');
  const plants = {
    reduced: `${percent[0]}% ${reduced}`,
    wordSave: ['save ', word, ' percent'].join(''),
    skip: skipIsland,
    orMore: `${percent[1]}% or more`
  };

  const reducedHits = scanSavingsHitsInText(`Guests pay ${plants.reduced} versus the island.`, 'src/guides/hidden-plant.html');
  const wordHits = scanSavingsHitsInText(`Book direct and ${plants.wordSave} on the same dates.`, 'src/guides/hidden-plant.html');
  const orMoreHits = scanSavingsHitsInText(`Shoulder weeks run ${plants.orMore} on the same home.`, 'src/guides/hidden-plant.html');
  const skipHits = parseClaimHits(`Guests can ${plants.skip} by staying in Bradenton.`);

  assert.equal(reducedHits[0].kind, 'percent-comparative');
  assert.equal(wordHits[0].kind, 'percent-comparative');
  assert.equal(orMoreHits[0].kind, 'percent-comparative');
  assert.equal(skipHits[0].kind, 'qualitative-price-advantage');
  assert.match(skipHits[0].subject, /markup/);

  assert.throws(
    () => assertSavingsSourced(reducedHits, claims),
    /sourcedClaims\.json is missing a sourced-claim row/
  );
  assert.throws(
    () => assertSavingsSourced(wordHits, claims),
    /sourcedClaims\.json is missing a sourced-claim row/
  );
  assert.throws(
    () => assertSavingsSourced(orMoreHits, claims),
    /sourcedClaims\.json is missing a sourced-claim row/
  );
  assert.throws(
    () => assertNoUnsourcedPriceAdvantages(
      [...pages, { slug: 'hidden-plant-skip', intro: `Guests can ${plants.skip} by staying in Bradenton.` }],
      claims
    ),
    /sourcedClaims\.json is missing a sourced-claim row/
  );

  const costsLess = ['usu', 'ally costs less'].join('');
  const itsCheaper = ['It', "'s cheaper"].join('');
  const withoutFees = ['without ', 'the extra ', 'platform fees'].join('');
  const costHits = parseClaimHits(`Mainland stays ${costsLess} than island condos.`);
  const cheaperHits = parseClaimHits(`${itsCheaper} than splitting hotel rooms.`);
  const withoutHits = parseClaimHits(`Book direct ${withoutFees}.`);
  const lowerTotal = ['low', 'er total'].join('');
  const directBookTotal = ['low', 'er direct-book total'].join('');
  const allInTotal = ['high', 'er all-in total'].join('');
  const totalHits = parseClaimHits(`Guests see a ${lowerTotal} on the same dates.`);
  const directBookHits = parseClaimHits(`Book direct for a ${directBookTotal}.`);
  const allInHits = parseClaimHits(`Direct stays post a ${allInTotal}.`);
  assert.equal(costHits[0].kind, 'qualitative-price-advantage');
  assert.match(costHits[0].match, /costs less/i);
  assert.equal(cheaperHits[0].kind, 'qualitative-price-advantage');
  assert.match(cheaperHits[0].match, /cheaper/i);
  assert.equal(withoutHits[0].kind, 'qualitative-price-advantage');
  assert.match(withoutHits[0].match, /platform fees/i);
  assert.equal(totalHits[0].kind, 'qualitative-price-advantage');
  assert.match(totalHits[0].match, /lower total/i);
  assert.equal(directBookHits[0].kind, 'qualitative-price-advantage');
  assert.match(directBookHits[0].match, /direct-book total/i);
  assert.equal(allInHits[0].kind, 'qualitative-price-advantage');
  assert.match(allInHits[0].match, /all-in total/i);

  const sharedNegation = parseClaimHits('The total does not include taxes, but guests get better rates.');
  assert.match(sharedNegation.map((hit) => hit.match).join(','), /better rates/i);
  const negatedClaim = parseClaimHits('This does not establish better rates for the same dates.');
  assert.equal(negatedClaim.length, 0);
  const negatedRange = parseClaimHits('A last-minute booking does not establish a higher or lower rate.');
  assert.equal(negatedRange.length, 0);

  const saveNextSentence = scanSavingsHitsInText(
    'Save this guide. A 15% occupancy tax applies.',
    'src/guides/hidden-plant.html'
  );
  assert.equal(saveNextSentence.length, 0);
  const avoidNextSentence = parseClaimHits('Avoid traffic. Platform fees are displayed separately.');
  assert.equal(avoidNextSentence.length, 0);

  const ratesAreLower = ['Rates are low', 'er than Airbnb'].join('');
  const priceIsHigher = ['The price is high', 'er'].join('');
  const deepestDiscounts = ['deep', 'est discounts'].join('');
  const higherDiscounts = ['high', 'er discounts'].join('');
  const copulaHits = parseClaimHits(ratesAreLower);
  const priceHits = parseClaimHits(priceIsHigher);
  const deepestHits = parseClaimHits(`Guests see the ${deepestDiscounts} on the same dates.`);
  const higherDiscountHits = parseClaimHits(`Direct stays post ${higherDiscounts}.`);
  assert.equal(copulaHits[0].kind, 'qualitative-price-advantage');
  assert.match(copulaHits[0].match, /rates are lower/i);
  assert.equal(priceHits[0].kind, 'qualitative-price-advantage');
  assert.match(priceHits[0].match, /price is higher/i);
  assert.equal(deepestHits[0].kind, 'qualitative-price-advantage');
  assert.match(deepestHits[0].match, /deepest discounts/i);
  assert.equal(higherDiscountHits[0].kind, 'qualitative-price-advantage');
  assert.match(higherDiscountHits[0].match, /higher discounts/i);

  const ratesBelow = ['Rates bel', 'ow Airbnb'].join('');
  const pricesBelow = ['prices bel', 'ow marketplace totals'].join('');
  const significantDiscounts = ['Signifi', 'cant discounts'].join('');
  const belowHits = parseClaimHits(ratesBelow);
  const pricesBelowHits = parseClaimHits(`Mainland ${pricesBelow}.`);
  const magnitudeHits = parseClaimHits(`${significantDiscounts} apply.`);
  assert.equal(belowHits[0].kind, 'qualitative-price-advantage');
  assert.match(belowHits[0].match, /rates below/i);
  assert.equal(pricesBelowHits[0].kind, 'qualitative-price-advantage');
  assert.match(pricesBelowHits[0].match, /prices below/i);
  assert.equal(magnitudeHits[0].kind, 'qualitative-price-advantage');
  assert.match(magnitudeHits[0].match, /significant discounts/i);

  const beachfrontPremium = ['beach', 'front premium'].join('');
  const addressPremium = ['addr', 'ess premium'].join('');
  const nightlyPremiums = ['on-island ', 'nightly premiums'].join('');
  const fewerFees = ['few', 'er extra fees'].join('');
  const keepsFeesOut = ['keeps ', 'platform fees out'].join('');
  const beachfrontHits = parseClaimHits(`Guests skip the ${beachfrontPremium}.`);
  const addressHits = parseClaimHits(`Mainland stays avoid the ${addressPremium}.`);
  const nightlyHits = parseClaimHits(`Bradenton skips ${nightlyPremiums}.`);
  const fewerHits = parseClaimHits(`Direct booking means ${fewerFees}.`);
  const keepOutHits = parseClaimHits(`Booking here ${keepsFeesOut}.`);
  assert.equal(beachfrontHits[0].kind, 'qualitative-price-advantage');
  assert.match(beachfrontHits[0].match, /beachfront premium/i);
  assert.equal(addressHits[0].kind, 'qualitative-price-advantage');
  assert.match(addressHits[0].match, /address premium/i);
  assert.equal(nightlyHits[0].kind, 'qualitative-price-advantage');
  assert.match(nightlyHits[0].match, /on-island nightly premiums/i);
  assert.equal(fewerHits[0].kind, 'qualitative-price-advantage');
  assert.match(fewerHits[0].match, /fewer extra fees/i);
  assert.equal(keepOutHits[0].kind, 'qualitative-price-advantage');
  assert.match(keepOutHits[0].match, /keeps platform fees out/i);

  const staySave = ['Stay longer and ', 'save'].join('');
  const moreSave = ['the more you ', 'save per night'].join('');
  const saveGap = ['Guests save on seven-night winter stays ', '15%'].join('');
  const beachfrontMarkup = ['beach', 'front markup'].join('');
  const islandMarkup = ['isl', 'and markup'].join('');
  const payMore = ['pay ', 'more to stay'].join('');
  const beatPaying = ['beat ', 'paying more'].join('');
  const payUp = ['pay ', 'up for'].join('');
  const priciest = ['the pric', 'iest option'].join('');
  const affordableCompared = ['affordable com', 'pared to hotels'].join('');
  const wellBelow = ['well bel', 'ow hotel'].join('');
  const lowerRate = ['lower', '-rate season'].join('');
  const staySaveHits = parseClaimHits(staySave);
  const moreSaveHits = parseClaimHits(moreSave);
  const saveGapHits = parseClaimHits(saveGap);
  const beachfrontMarkupHits = parseClaimHits(`Guests skip the ${beachfrontMarkup}.`);
  const islandMarkupHits = parseClaimHits(`Mainland stays avoid the ${islandMarkup}.`);
  const payMoreHits = parseClaimHits(`Guests ${payMore}.`);
  const beatPayingHits = parseClaimHits(`Guests ${beatPaying}.`);
  const payUpHits = parseClaimHits(`Guests ${payUp} an island address.`);
  const priciestHits = parseClaimHits(priciest);
  const affordableHits = parseClaimHits(affordableCompared);
  const wellBelowHits = parseClaimHits(wellBelow);
  const lowerRateHits = parseClaimHits(`Book the ${lowerRate}.`);
  assert.equal(staySaveHits[0].kind, 'qualitative-price-advantage');
  assert.match(staySaveHits[0].match, /\bsave\b/i);
  assert.equal(moreSaveHits[0].kind, 'qualitative-price-advantage');
  assert.match(moreSaveHits[0].match, /\bsave\b/i);
  assert.equal(saveGapHits[0].kind, 'percent-comparative');
  assert.match(saveGapHits[0].match, /save on seven-night winter stays 15%/i);
  assert.equal(beachfrontMarkupHits[0].kind, 'qualitative-price-advantage');
  assert.match(beachfrontMarkupHits[0].match, /beachfront markup/i);
  assert.equal(islandMarkupHits[0].kind, 'qualitative-price-advantage');
  assert.match(islandMarkupHits[0].match, /island markup/i);
  assert.equal(payMoreHits[0].kind, 'qualitative-price-advantage');
  assert.match(payMoreHits[0].match, /pay more/i);
  assert.equal(beatPayingHits[0].kind, 'qualitative-price-advantage');
  assert.match(beatPayingHits[0].match, /paying more/i);
  assert.equal(payUpHits[0].kind, 'qualitative-price-advantage');
  assert.match(payUpHits[0].match, /pay up/i);
  assert.equal(priciestHits[0].kind, 'qualitative-price-advantage');
  assert.match(priciestHits[0].match, /priciest option/i);
  assert.equal(affordableHits[0].kind, 'qualitative-price-advantage');
  assert.match(affordableHits[0].match, /affordable compared/i);
  assert.equal(wellBelowHits[0].kind, 'qualitative-price-advantage');
  assert.match(wellBelowHits[0].match, /well below/i);
  assert.equal(lowerRateHits[0].kind, 'qualitative-price-advantage');
  assert.match(lowerRateHits[0].match, /lower-rate/i);
  assert.equal(parseClaimHits('Save this guide for later.').length, 0);
  assert.equal(parseClaimHits('without paying for more space than you need').length, 0);
  const cueBefore = ['This option is the ', 'priciest'].join('');
  const perNightMath = ['low', 'er per-night math'].join('');
  const saveTime = ['Save ', 'time with self check-in'].join('');
  const saveRoom = ['Save ', 'room for dessert'].join('');
  const saveFavorites = ['Save ', 'your favorites'].join('');
  const cueBeforeHits = parseClaimHits(cueBefore);
  const mathHits = parseClaimHits(perNightMath);
  assert.equal(cueBeforeHits[0].kind, 'qualitative-price-advantage');
  assert.match(cueBeforeHits[0].match, /option is the priciest/i);
  assert.equal(mathHits[0].kind, 'qualitative-price-advantage');
  assert.match(mathHits[0].match, /lower per-night math/i);
  assert.equal(parseClaimHits(saveTime).length, 0);
  assert.equal(parseClaimHits(saveRoom).length, 0);
  assert.equal(parseClaimHits(saveFavorites).length, 0);
  const saveWater = ['Save ', 'water with low-flow fixtures'].join('');
  const saveEnergy = ['Save ', 'energy by closing the doors'].join('');
  const saveTrip = ['Save ', 'your trip for later'].join('');
  assert.equal(parseClaimHits(saveWater).length, 0);
  assert.equal(parseClaimHits(saveEnergy).length, 0);
  assert.equal(parseClaimHits(saveTrip).length, 0);
  const lowerCost = ['low', 'er cost'].join('');
  const lowestCost = ['low', 'est cost'].join('');
  const flattenCost = ['flatten the per-night ', 'cost'].join('');
  const lowerCostHits = parseClaimHits(lowerCost);
  const lowestCostHits = parseClaimHits(lowestCost);
  const flattenHits = parseClaimHits(flattenCost);
  assert.equal(lowerCostHits[0].kind, 'qualitative-price-advantage');
  assert.match(lowerCostHits[0].match, /lower cost/i);
  assert.equal(lowestCostHits[0].kind, 'qualitative-price-advantage');
  assert.match(lowestCostHits[0].match, /lowest cost/i);
  assert.equal(flattenHits[0].kind, 'qualitative-price-advantage');
  assert.match(flattenHits[0].match, /flatten the per-night cost/i);

  const fieldBridge = scanStaySavingsHits([{
    slug: 'hidden-bridge',
    heading: 'Book 15%',
    body: 'less on the same dates.'
  }]);
  assert.equal(fieldBridge.length, 0);
  const stayPercent = scanStaySavingsHits([{
    slug: 'hidden-plant-percent',
    intro: 'Direct stays run 15% less on the same dates.'
  }]);
  assert.equal(stayPercent[0].slug, 'hidden-plant-percent');
  assert.throws(
    () => assertSavingsSourced(stayPercent, claims),
    /sourcedClaims\.json is missing a sourced-claim row for 15% less in hidden-plant-percent/
  );

  const withoutPaying = ['without paying true beach', 'front pricing'].join('');
  const bareDifference = ['The difference between channel totals is ', '15%'].join('');
  const similarRate = ['more space at a sim', 'ilar nightly rate'].join('');
  const sameSpend = ['a full home for the sa', 'me spend'].join('');
  const withoutPayingHits = parseClaimHits(withoutPaying);
  const differenceHits = parseClaimHits(bareDifference);
  const similarHits = parseClaimHits(similarRate);
  const spendHits = parseClaimHits(sameSpend);
  assert.equal(withoutPayingHits[0].kind, 'qualitative-price-advantage');
  assert.match(withoutPayingHits[0].match, /without paying true beachfront pricing/i);
  assert.equal(differenceHits[0].kind, 'percent-comparative');
  assert.match(differenceHits[0].match, /difference between channel totals is 15%/i);
  assert.equal(similarHits[0].kind, 'qualitative-price-advantage');
  assert.match(similarHits[0].match, /similar nightly rate/i);
  assert.equal(spendHits[0].kind, 'qualitative-price-advantage');
  assert.match(spendHits[0].match, /same spend/i);
  assert.equal(parseClaimHits('Compare the same dates before booking.').length, 0);

  const started = Date.now();
  scanSavingsHitsInText(read('src/_data/seoPages.json'), 'src/_data/seoPages.json');
  assert.ok(Date.now() - started < 2000, 'qualitative scan must stay near-linear on stay JSON');

  const splitHeading = ['Plan low', 'er'].join('');
  const splitSubheading = ['Rate', ' options'].join('');
  assert.equal(parseClaimHits(splitHeading).length, 0);
  assert.equal(parseClaimHits(splitSubheading).length, 0);
  assert.doesNotThrow(() =>
    assertNoUnsourcedPriceAdvantages(
      [...pages, { slug: 'hidden-plant-fields', heading: splitHeading, subheading: splitSubheading }],
      claims
    )
  );

  assert.equal(
    coversHit(
      { file: 'src/guides/hidden-plant.html', quote: 'better rates', expires: '2027-12-31' },
      { slug: 'hidden-plant-skip', match: 'better rates', excerpt: 'better rates' }
    ),
    false
  );
  assert.equal(
    coversHit(
      { slug: 'hidden-plant-skip', quote: 'better rates', expires: '2027-12-31' },
      { slug: 'hidden-plant-skip', match: 'better rates', excerpt: 'better rates' }
    ),
    true
  );
});

test('never-seen price-cue phrasing fails without changing the matcher', () => {
  const {
    assertClaimCandidatesCovered,
    collectPriceClaimCandidates,
    parseClaimHits,
    readSourcedClaims,
    scanSrcClaimCandidates
  } = require('./sourced-claims');
  const phrase = ['pay a ', 'fraction of the OTA price'].join('');
  assert.equal(parseClaimHits(phrase).length, 0, 'typed matcher stays unchanged');
  const hits = collectPriceClaimCandidates(`Guests ${phrase}.`).map((hit) => ({
    ...hit,
    file: 'src/guides/hidden-plant.html'
  }));
  assert.equal(hits[0].kind, 'price-cue-candidate');
  assert.match(hits[0].excerpt, /fraction of the OTA price/i);
  assert.throws(
    () => assertClaimCandidatesCovered(hits, readSourcedClaims()),
    /sourcedClaims\.json is missing a sourced-claim row or .*claimCandidateBaseline/
  );

  const insideMacro = collectPriceClaimCandidates(
    `{{ guideConversionKit({ copy: "Guests ${phrase}." }) }}`
  );
  assert.equal(insideMacro[0].kind, 'price-cue-candidate');
  assert.match(insideMacro[0].excerpt, /fraction of the OTA price/i);
  assert.throws(
    () => assertClaimCandidatesCovered(
      insideMacro.map((hit) => ({ ...hit, file: 'src/guides/hidden-plant.html' })),
      readSourcedClaims()
    ),
    /sourcedClaims\.json is missing a sourced-claim row or .*claimCandidateBaseline/
  );

  const scanned = scanSrcClaimCandidates();
  assert.ok(
    scanned.some((hit) => /without platform fees leading the decision/i.test(hit.excerpt)),
    'quoted copy inside guideConversionKit is a candidate'
  );
  assert.ok(
    scanned.some((hit) =>
      hit.file === 'src/_includes/partials/guide-conversion-kit.njk' &&
      /no platform service fees on the final price/i.test(hit.excerpt)
    ),
    'guest partial defaults are candidates'
  );

  const jsonLd = collectPriceClaimCandidates(
    `<script type="application/ld+json">{"description":"Guests ${phrase}."}</script>`
  );
  assert.equal(jsonLd[0].kind, 'price-cue-candidate');
  assert.match(jsonLd[0].excerpt, /fraction of the OTA price/i);
  const jsonLdUnquoted = collectPriceClaimCandidates(
    `<script type=application/ld+json>{"description":"Guests ${phrase}."}</script>`
  );
  assert.equal(jsonLdUnquoted[0].kind, 'price-cue-candidate');
  const jsonLdSpaced = collectPriceClaimCandidates(
    `<script type = "application/ld+json">{"description":"Guests ${phrase}."}</script>`
  );
  assert.equal(jsonLdSpaced[0].kind, 'price-cue-candidate');
  const jsonLdProfile = collectPriceClaimCandidates(
    `<script type="application/ld+json;profile=http://www.w3.org/ns/json-ld#frame">{"description":"Guests ${phrase}."}</script>`
  );
  assert.equal(jsonLdProfile[0].kind, 'price-cue-candidate');
  assert.match(jsonLdProfile[0].excerpt, /fraction of the OTA price/i);
  assert.equal(
    collectPriceClaimCandidates(`<script>window.note = "Guests ${phrase}.";</script>`).length,
    0
  );
  assert.throws(
    () => assertClaimCandidatesCovered(
      jsonLd.map((hit) => ({ ...hit, file: 'src/guides/hidden-plant.html' })),
      readSourcedClaims()
    ),
    /sourcedClaims\.json is missing a sourced-claim row or .*claimCandidateBaseline/
  );

  const frontmatter = collectPriceClaimCandidates(
    `---\npageDescription: "Guests ${phrase}."\npermalink: /guides/hidden-plant/\n---\n<p>Plain body copy with no price words.</p>`
  );
  assert.equal(frontmatter[0].kind, 'price-cue-candidate');
  assert.match(frontmatter[0].excerpt, /fraction of the OTA price/i);

  const folded = collectPriceClaimCandidates(
    `---\npageDescription: >-\n  Guests ${phrase}.\npermalink: /guides/hidden-plant/\n---\n<p>Plain body copy with no price words.</p>`
  );
  assert.equal(folded[0].kind, 'price-cue-candidate');
  assert.match(folded[0].excerpt, /fraction of the OTA price/i);

  const htmlMeta = collectPriceClaimCandidates(
    `<title>Guide</title><meta name="description" content="Guests ${phrase}."><p>Plain body copy with no price words.</p>`
  );
  assert.equal(htmlMeta[0].kind, 'price-cue-candidate');
  assert.match(htmlMeta[0].excerpt, /fraction of the OTA price/i);
  const spacedMeta = collectPriceClaimCandidates(
    `<title>Guide</title><meta name = "description" content = "Guests ${phrase}."><p>Plain body copy about beach parking.</p>`
  );
  assert.equal(spacedMeta[0].kind, 'price-cue-candidate');
  assert.match(spacedMeta[0].excerpt, /fraction of the OTA price/i);
  const unquotedMeta = collectPriceClaimCandidates(
    `<title>Guide</title><meta name=description content="Guests ${phrase}."><p>Plain body copy about beach parking.</p>`
  );
  assert.equal(unquotedMeta[0].kind, 'price-cue-candidate');
  assert.match(unquotedMeta[0].excerpt, /fraction of the OTA price/i);
  const apostropheMeta = collectPriceClaimCandidates(
    `<title>Guide</title><meta name="description" content="You'll pay a ${phrase}."><p>Plain body copy about beach parking.</p>`
  );
  assert.equal(apostropheMeta[0].kind, 'price-cue-candidate');
  assert.match(apostropheMeta[0].excerpt, /fraction of the OTA price/i);

  const splitArgs = collectPriceClaimCandidates(
    '{{ kit({ heading: "Need more space", cta: "Check rates" }) }}'
  );
  assert.equal(splitArgs.length, 0, 'separate quoted macro args do not form a synthetic claim');

  const altPlant = collectPriceClaimCandidates(
    `<img alt="Guests ${phrase}." src="/images/hidden-plant.jpg">`
  );
  assert.equal(altPlant[0].kind, 'price-cue-candidate');
  assert.match(altPlant[0].excerpt, /fraction of the OTA price/i);
  assert.throws(
    () => assertClaimCandidatesCovered(
      altPlant.map((hit) => ({ ...hit, file: 'src/guides/hidden-plant.html' })),
      readSourcedClaims()
    ),
    /sourcedClaims\.json is missing a sourced-claim row or .*claimCandidateBaseline/
  );

  const commentPlant = collectPriceClaimCandidates(
    `{# Guests ${phrase}. #}<p>Plain body copy about beach parking.</p>`
  );
  assert.equal(commentPlant.length, 0, 'Nunjucks comments are not guest copy');

  const plantedArg = collectPriceClaimCandidates(
    `{{ kit({ heading: "Need more space", cta: "Guests ${phrase}." }) }}`
  );
  assert.equal(plantedArg[0].kind, 'price-cue-candidate');
  assert.match(plantedArg[0].excerpt, /fraction of the OTA price/i);

  const os = require('node:os');
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'claim-site-scan-'));
  fs.mkdirSync(path.join(tmp, 'src/_data'), { recursive: true });
  fs.writeFileSync(
    path.join(tmp, 'src/_data/site.json'),
    JSON.stringify({ description: `Guests ${phrase}.` })
  );
  const siteHits = scanSrcClaimCandidates(tmp);
  assert.ok(
    siteHits.some((hit) => hit.file === 'src/_data/site.json' && /fraction of the OTA price/i.test(hit.excerpt)),
    'public site.json strings are scanned'
  );

  const saveWithoutPrice = collectPriceClaimCandidates(
    'Book direct and save 15 percent on the same dates.'
  );
  assert.equal(
    saveWithoutPrice.length,
    0,
    'percent without a price/cost/fee/rate term is outside the candidate contract'
  );
  const saveWithPrice = collectPriceClaimCandidates(
    'Book direct and save 15 percent on the OTA price.'
  );
  assert.equal(saveWithPrice[0].kind, 'price-cue-candidate');
  assert.equal(parseClaimHits('Book direct and save 15 percent on the same dates.').length, 0);
});

test('concatenated template literals preserve claims and independent argument boundaries', () => {
  const { assertClaimCandidatesCovered, collectPriceClaimCandidates } = require('./sourced-claims');
  const templates = [
    '{{ "Guests pay half " + "the OTA price." }}',
    '{{ "Guests pay " ~ "half " ~ "the OTA price." }}',
    '{{ kit({ copy: "Guests pay half" + " the OTA price." }) }}',
    '{% set copy = "Guests pay half " ~ "the OTA price." %}'
  ];
  for (const source of templates) {
    const hits = collectPriceClaimCandidates(source);
    assert.equal(hits.length, 1, source);
    assert.equal(hits[0].excerpt, 'Guests pay half the OTA price');
    assert.throws(() => assertClaimCandidatesCovered(hits, []), /missing a sourced-claim row/);
  }
  assert.equal(
    collectPriceClaimCandidates('{{ kit({ heading: "Need " + "more space", cta: "Check " ~ "rates" }) }}').length,
    0,
    'concatenation within an argument must not join independent arguments'
  );
});

test('public input and textarea placeholders require sourced claim coverage', () => {
  const { assertClaimCandidatesCovered, collectPriceClaimCandidates } = require('./sourced-claims');
  for (const source of [
    '<input placeholder="Pay half the platform fee">',
    "<textarea placeholder='Pay half the platform fee'></textarea>"
  ]) {
    const hits = collectPriceClaimCandidates(source);
    assert.equal(hits.length, 1, source);
    assert.equal(hits[0].excerpt, 'Pay half the platform fee');
    assert.throws(() => assertClaimCandidatesCovered(hits, []), /missing a sourced-claim row/);
  }
});

test('abbreviated comparisons retain claims without crossing real sentence boundaries', () => {
  const { assertClaimCandidatesCovered, collectPriceClaimCandidates, parseClaimHits } = require('./sourced-claims');
  const comparison = 'Our rates vs. Airbnb are lower.';
  const candidates = collectPriceClaimCandidates(comparison);
  assert.equal(candidates.length, 1);
  assert.equal(candidates[0].excerpt, 'Our rates vs. Airbnb are lower');
  assert.throws(() => assertClaimCandidatesCovered(candidates, []), /missing a sourced-claim row/);
  assert.ok(parseClaimHits(comparison).length > 0, 'the typed parser retains the comparison too');
  assert.ok(parseClaimHits('It is cheaper vs. Airbnb.').length > 0);
  for (const source of [
    'Check rates vs. Airbnb. Lower your luggage weight.',
    'Check rates vs. Airbnb! Lower your luggage weight.',
    'Check rates vs. Airbnb? Lower your luggage weight.'
  ]) {
    assert.equal(collectPriceClaimCandidates(source).length, 0, source);
    assert.equal(parseClaimHits(source).length, 0, source);
  }
});

test('Bradenton-Sarasota dining comparison uses current menus in body and FAQ schema', () => {
  const s = read('src/guides/bradenton-vs-sarasota-restaurants/index.html');
  assert.doesNotMatch(s, /\$\d|Generally yes\. Expect to spend|Average Dinner|better atmosphere, lower prices|lowest rate|No platform fees|reasonable prices|Not cheap|Cheap Eats|happy hour deals|full dinner price tag|Stay in Bradenton for the value/i);
  const faq = [...s.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
    .map((m) => JSON.parse(m[1])).find((schema) => schema['@type'] === 'FAQPage');
  const answer = faq.mainEntity.find((q) => q.name === 'Are Bradenton restaurants cheaper than Sarasota?').acceptedAnswer.text;
  assert.match(answer, /Compare current menus/);
  assert.ok(s.includes(`<p>${answer}</p>`), 'visible answer matches FAQ schema');
});

test('leftover live price claims stay in the grandfathered baseline as suspected-claim', () => {
  const { loadClaimBaseline } = require('./sourced-claims');
  const review = read('docs/reviews/2026-10-price-cue-suspected-claims.md');
  const leftovers = [
    "Here's the math: A $350/night rental listed on Airbnb for a 7-night stay: Airbnb service fee: ~$350 (14% of subtotal) Cleaning fee: $250 (often inflated on OTAs) Total through Airbnb: $3,050 Same property booked directly with the property manager: Timing also affects cost—our guide to the best time to visit Anna Maria Island breaks down rental rates by month",
    'A waterfront 3-bedroom that costs $450/night in March might run $250–$300/night in early fall',
    'Lunch is better value than dinner — Many waterfront restaurants offer the same views and similar menus at lunch for significantly lower prices',
    'Consider weekly stays — Most vacation rentals offer lower per-night rates for 7+ night stays versus short weekend trips',
    'Prices can drop $50-$150 per ticket during flash sales Whether you fly or drive, the journey to Anna Maria Island is straightforward'
  ];
  const { rows } = loadClaimBaseline();
  for (const sentence of leftovers) {
    const row = rows.find((entry) => entry.sentence === sentence);
    assert.ok(row, `expected baseline row for leftover: ${sentence.slice(0, 80)}`);
    assert.equal(row.tag, 'suspected-claim');
    assert.match(review, new RegExp(sentence.slice(0, 40).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
});

test('booking and cost guides compare complete quotes without fixed savings or fabricated trip totals', () => {
  for (const p of [
    'src/guides/booking-direct-vacation-rentals.html',
    'src/guides/anna-maria-island-vacation-cost.html',
    'src/guides/anna-maria-island-vs-longboat-key.html',
    'src/research/real-cost-florida-beach-vacation-bradenton-sarasota-ami-2026.njk'
  ]) {
    const s = read(p);
    assert.doesNotMatch(s, /\$[\d,]+|\b10[-–]15%|\b20[-–]40%|\b30[-–]40%/, p);
    assert.match(s, /complete checkout total/i, p);
    assert.doesNotMatch(s, /Good deals|at mainland prices|No platform fees|best value|lowest rate/i, p);
    assert.match(s, /<table\b/, `${p}: retain the comparison structure`);
  }
  const data = JSON.stringify(JSON.parse(read('src/_data/seoPages.json')));
  assert.doesNotMatch(data, /10[-–]15%|\$25[-–]\$50|\$25[-–]\$60|\$200-\$550 direct/);
  assert.match(data, /\$40\/day|\$40 per day/, 'verified pool heat charge remains');
});

test('area and long-stay comparisons do not invent accommodation averages or monthly budgets', () => {
  for (const slug of ['anna-maria-island-area-guide', 'siesta-key-area-guide', 'longboat-key-area-guide', 'bradenton-area-guide']) {
    const s = read(`src/guides/${slug}/index.html`);
    assert.match(s, /Compare current quotes/, slug);
    assert.doesNotMatch(s, /Avg(?: Vacation)? Rental Rate|\$[\d,]+[-–]\$[\d,]+\/night/, slug);
  }
  const snowbird = read('src/guides/snowbirds-guide-extended-stays-florida.html');
  assert.doesNotMatch(snowbird, /\$[\d,]+/);
  assert.match(snowbird, /Monthly Snowbird Budget Checklist/);
  assert.match(snowbird, /complete checkout total/);
  const comparison = read('src/guides/anna-maria-island-vs-clearwater-beach.html');
  assert.doesNotMatch(comparison, /Avg\. Hotel\/Night|\$250–\$400|\$200–\$500/);
});

test('dependent tools are noindexed and cannot calculate or embed withdrawn figures', () => {
  for (const slug of ['florida-gulf-coast-vacation-cost-calculator-2026', 'gulf-coast-vacation-rental-chart-pack-2026']) {
    const s = read(`src/research/${slug}.njk`);
    assert.match(s, /name="robots" content="noindex, follow"/);
    assert.match(s, /seoIndexable: false/);
    assert.match(s, /figures are withdrawn/i);
    assert.doesNotMatch(s, retiredStats);
    assert.doesNotMatch(s, /nightly:\s*248|feeLow|totalEstimate|<img[^>]+images\/research\//);
    assert.doesNotMatch(read('src/research/index.njk'), new RegExp(`href="/research/${slug}/"`));
  }
  for (const f of fs.readdirSync(path.join(root, 'images/research'))) {
    const s = read(`images/research/${f}`);
    assert.match(s, /figures withdrawn/i);
    assert.doesNotMatch(s, retiredStats);
  }
});

// These copies occur in list items, tables and FAQ JSON as well as paragraphs.
test('destination and airport comparisons do not retain fixed savings in alternate markup', () => {
  for (const p of [
    'src/guides/bradenton-vs-tampa-vacation-rentals.html',
    'src/guides/holmes-beach-vs-bradenton-beach.html',
    'src/guides/is-anna-maria-island-worth-visiting.html',
    'src/guides/where-to-stay-near-anna-maria-island/index.html',
    'src/guides/flights-to-anna-maria-island/index.html'
  ]) {
    assert.doesNotMatch(read(p), /\$[\d,]+|\b(?:10[-–]15|10[-–]20|15[-–]30|20[-–]30|30[-–]40|16)%/, p);
  }
});

const quoteBoilerplate =
  /Compare current flight, baggage and ground-transport quotes for your route and dates\./g;

function visibleText(html) {
  return String(html || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&ndash;|&#8211;|&mdash;|&#8212;/g, '-')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/\s*-\s*/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractFaqJsonLd(source) {
  const scripts = source.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g) || [];
  for (const script of scripts) {
    const raw = script.replace(/^<script[^>]*>/, '').replace(/<\/script>$/, '');
    const parsed = JSON.parse(raw);
    if (parsed['@type'] === 'FAQPage') {
      return parsed.mainEntity;
    }
  }
  throw new Error('FAQPage JSON-LD is missing');
}

function extractVisibleFaq(source) {
  const faqStart = source.indexOf('<h2>Frequently Asked Questions</h2>');
  assert.ok(faqStart >= 0, 'visible FAQ heading is missing');
  const faqEnd = source.indexOf('<div class="guide-cta">', faqStart);
  const faqHtml = source.slice(faqStart, faqEnd > faqStart ? faqEnd : undefined);
  const blocks = [...faqHtml.matchAll(/<h3>([\s\S]*?)<\/h3>\s*<p>([\s\S]*?)<\/p>/g)];
  assert.ok(blocks.length > 0, 'visible FAQ answers are missing');
  return blocks.map((match) => ({
    question: visibleText(match[1]),
    answer: visibleText(match[2])
  }));
}

for (const guidePath of [
  'src/guides/family-vacation-anna-maria-island.html',
  '_site/guides/family-vacation-anna-maria-island/index.html'
]) {
  test(`family safety FAQ gives practical guidance without unsupported crime or safety claims: ${guidePath}`, () => {
    const source = read(guidePath);
    const visible = extractVisibleFaq(source);
    const schema = extractFaqJsonLd(source);
    const question = 'Is Anna Maria Island safe for families?';
    const safety = visible.find((entry) => entry.question === question);
    const schemaSafety = schema.find((entry) => entry.name === question);
    assert.ok(safety, 'visible family safety FAQ is missing');
    assert.ok(schemaSafety, 'family safety FAQPage entry is missing');
    for (const answer of [safety.answer, schemaSafety.acceptedAnswer.text]) {
      assert.doesNotMatch(answer, /\bcrime\b|\bsafest\b|\bsafer\b|\b(?:very|completely|perfectly|entirely|totally) safe\b|^Yes[.!]/i);
      assert.match(answer, /Manatee Public Beach/);
      assert.match(answer, /Coquina Beach/);
      assert.match(answer, /lifeguard on duty/);
      assert.match(answer, /posted warnings/);
      assert.match(answer, /current water conditions/);
      assert.match(answer, /supervise children closely/);
      assert.match(answer, /Conditions can change/);
    }
  });

  test(`family guide keeps every visible FAQ identical to FAQPage: ${guidePath}`, () => {
    const source = read(guidePath);
    const visible = extractVisibleFaq(source);
    const schema = extractFaqJsonLd(source).map((entry) => ({
      question: visibleText(entry.name),
      answer: visibleText(entry.acceptedAnswer.text)
    }));
    assert.equal(visible.length, 3, 'retain all three visible family FAQs');
    assert.deepEqual(schema, visible);
  });
}

test('flights guide keeps distinct numbered tips and question-specific FAQs after savings removal', () => {
  const source = read('src/guides/flights-to-anna-maria-island/index.html');
  const leftoverBoilerplate = source.match(quoteBoilerplate) || [];
  assert.equal(
    leftoverBoilerplate.length,
    0,
    `generic quote boilerplate still appears ${leftoverBoilerplate.length} times`
  );

  const tip3 = source.indexOf('<strong>3.');
  const tip4 = source.indexOf('<strong>4.');
  const tip5 = source.indexOf('<strong>5.');
  const tip6 = source.indexOf('<strong>6.');
  assert.ok(tip3 > 0 && tip3 < tip4 && tip4 < tip5 && tip5 < tip6, 'tips must stay numbered 3, 4, 5, 6 in order');
  assert.match(source, /<strong>4\.\s*Confirm Southwest's bag rules for your fare\.<\/strong>/);
  assert.match(source, /southwest\.com/i);
  assert.match(source, /appears on Google Flights and Kayak/i);
  assert.doesNotMatch(source, /does not appear on Google Flights|two checked bags per person are included/i);
  assert.match(source, /<strong>5\.\s*Consider a PIE open-jaw\.<\/strong>/);
  assert.match(source, /open-jaw/i);

  const jsonFaqs = extractFaqJsonLd(source);
  const visibleFaqs = extractVisibleFaq(source);
  assert.equal(visibleFaqs.length, jsonFaqs.length, 'visible FAQ count must match FAQPage JSON-LD');

  for (const jsonFaq of jsonFaqs) {
    const visibleFaq = visibleFaqs.find((faq) => faq.question === jsonFaq.name);
    assert.ok(visibleFaq, `visible FAQ missing for ${jsonFaq.name}`);
    assert.equal(
      visibleFaq.answer,
      visibleText(jsonFaq.acceptedAnswer.text),
      `visible FAQ answer must match JSON-LD for ${jsonFaq.name}`
    );
  }

  const rentalCar = visibleFaqs.find((faq) => /Do I need a rental car/i.test(faq.question));
  assert.ok(rentalCar, 'rental-car FAQ is missing');
  assert.match(rentalCar.answer, /Most visitors rent a car/i);
  assert.match(rentalCar.answer, /island trolley/i);
  assert.doesNotMatch(rentalCar.answer, quoteBoilerplate);

  const tampaOrSrq = visibleFaqs.find((faq) => /Tampa or Sarasota/i.test(faq.question));
  assert.match(tampaOrSrq.answer, /Fly into SRQ/i);
  assert.match(tampaOrSrq.answer, /Fly into TPA/i);

  const uber = visibleFaqs.find((faq) => /Uber/i.test(faq.question));
  assert.match(uber.answer, /rideshare app/i);

  const cheapest = visibleFaqs.find((faq) => /cheapest/i.test(faq.question));
  assert.match(cheapest.answer, /September and October/i);
});

test('worth-visiting metadata matches the quote-based cost body', () => {
  const source = read('src/guides/is-anna-maria-island-worth-visiting.html');
  assert.doesNotMatch(source, /7-night costs for a family of four/i);

  const description = source.match(/<meta name="description" content="([^"]+)"/);
  const og = source.match(/<meta property="og:description" content="([^"]+)"/);
  const twitter = source.match(/<meta name="twitter:description" content="([^"]+)"/);
  assert.ok(description && og && twitter, 'description, og:description, and twitter:description must exist');
  assert.equal(description[1], og[1]);
  assert.equal(description[1], twitter[1]);
  assert.match(description[1], /scorecard/i);
  assert.match(description[1], /quote/i);
  assert.doesNotMatch(description[1], /7-night|family of four/i);
});

test('deployment smoke rejects withdrawn counts without matching the Seascape phone number', () => {
  const { validateTargetResponse } = require('../recovery/assert-live-smoke');
  const target = { path: '/research/gulf-coast-vacation-booking-trends-2026/', status: 200 };
  const body = read('_site/research/gulf-coast-vacation-booking-trends-2026/index.html');
  assert.match(body, /9417048545/);
  assert.doesNotThrow(() => validateTargetResponse(target, { statusCode: 200, body }));
  for (const count of ['545', '1,492']) {
    assert.throws(() => validateTargetResponse(target, { statusCode: 200, body: body + `<p>${count} reservations</p>` }), /withdrawn reservation counts/);
  }
});

test('family stay page safety FAQ gives practical guidance without unsupported crime or safety claims', () => {
  const stayPath = '_site/stays/family-vacation-rentals-anna-maria-island/index.html';
  const source = read(stayPath);
  assert.doesNotMatch(source, /safest vacation destinations|low crime|explore the island safely/i);
  const question = 'Is Anna Maria Island safe for families?';
  const schema = extractFaqJsonLd(source).find((entry) => entry.name === question);
  assert.ok(schema, 'family stay page safety FAQPage entry is missing');
  for (const answer of [schema.acceptedAnswer.text, visibleText(source.match(/Is Anna Maria Island safe for families\?[\s\S]*?<\/(?:p|div)>/)[0])]) {
    assert.match(answer, /lifeguard on duty/);
    assert.match(answer, /posted warnings/);
    assert.match(answer, /supervise children closely/);
  }
});
