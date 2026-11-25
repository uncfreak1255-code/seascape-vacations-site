const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../..');
const pages = JSON.parse(fs.readFileSync(path.join(root, 'src/_data/seoPages.json'))).vacationer;
const guide = fs.readFileSync(path.join(root, 'src/guides/anna-maria-island-area-guide/index.html'), 'utf8');

test('near-AMI collection is mainland Bradenton without a blanket beach drive promise', () => {
  const page = pages.find(p => p.slug === 'vacation-rentals-near-anna-maria-island');
  assert.deepEqual(page.matchingProperties, ['dockside-dreams', 'the-oasis', 'river-house', 'bradenton-pool-home']);
  assert.match(page.intro, /mainland Bradenton/);
  assert.doesNotMatch(page.intro + page.driveTimeLabel + page.faqs[0].answer, /10.15|14 minutes|Sarasota/);
  assert.match(page.valueComparison.find(r => r.label === 'Drive to Gulf beaches').us, /bridge traffic/);
});

test('pool party and group answers prohibit events and include visitor capacity', () => {
  const page = pages.find(p => p.slug === 'anna-maria-island-homes-with-pool');
  for (const q of ['Can I host a pool party or event at my rental?', 'What size groups can your AMI pool homes accommodate?']) {
    const answer = page.faqs.find(f => f.question === q).answer;
    assert.match(answer, /[Pp]arties and events are not permitted/);
    assert.match(answer, /including visitors/);
  }
});

test('AMI area cards use native dates anchors with one tracking owner', () => {
  assert.equal((guide.match(/<a class="property-card"/g) || []).length, 3);
  assert.doesNotMatch(guide, /class="property-card" data-card-link=/);
  for (const slug of ['dockside-dreams', 'the-oasis', 'river-house']) {
    assert.ok(guide.includes(`href="/properties/${slug}/#check-availability" data-track-event="guide_property_check_dates_click" data-guide-slug="anna-maria-island-area-guide" data-property-slug="${slug}" data-placement="area_guide_property_card"`));
  }
  assert.match(guide, /href="\/stays\/vacation-rentals-near-anna-maria-island\/" data-track-event="guide_book_direct_click" data-guide-slug="anna-maria-island-area-guide" data-placement="sticky_book_bar"/);
  assert.match(guide, /class="btn btn-gold" href="\/stays\/vacation-rentals-near-anna-maria-island\/" data-track-event="guide_book_direct_click" data-guide-slug="anna-maria-island-area-guide" data-placement="mobile_cta_bar"/);
});

test('AMI locality copy does not imply walkable mainland homes or unsupported pet policies', () => {
  const faq = [...guide.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
    .map(m => JSON.parse(m[1])).find(p => p['@type'] === 'FAQPage');
  // Site #1016: the FAQPage questions never appeared on the page, so the markup was dropped.
  assert.equal(faq, undefined, 'no FAQPage markup for questions the page does not show');
  assert.match(guide, /These featured homes are in mainland Bradenton\. Plan to drive to Anna Maria Island beaches/);
  assert.doesNotMatch(guide, /Many Seascape Vacations properties are within walking or biking distance/);
  for (const fact of pages.find(p => p.slug === 'vacation-rentals-near-anna-maria-island').propertyFacts) assert.equal(fact.time, 'Check route');
});
