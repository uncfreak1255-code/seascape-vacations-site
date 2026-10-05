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
