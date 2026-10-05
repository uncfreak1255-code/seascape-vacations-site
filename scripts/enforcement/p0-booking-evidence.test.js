const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '../..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const report = 'src/research/gulf-coast-vacation-booking-trends-2026.njk';
const retiredStats = /545|1,492|\$1\.7M|\$686|\$499|\b87%|\b82%|\b27%|\b74[- ]day|\b62[- ]day|7\.5 guests|Market Peaked|market dominance/i;

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
