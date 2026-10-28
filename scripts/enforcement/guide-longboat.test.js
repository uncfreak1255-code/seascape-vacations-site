const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '../..');
const source = fs.readFileSync(path.join(root, 'src/guides/anna-maria-island-vs-longboat-key.html'), 'utf8');

test('Longboat comparison represents verified grocery and transit options', () => {
  // Independent facts: Publix store1432; MCAT Route5; Town Breeze page.
  assert.match(source, /Publix at (?:the )?Shoppes of Bay Isles/);
  assert.match(source, /365 days a year/);
  assert.match(source, /Breeze OnDemand/);
  assert.doesNotMatch(source, /No full grocery|no public transit|trolley[^<.]{0,100}(?:during peak season|during season)/i);
});

test('Longboat comparison corrects location and removes unsafe certainty', () => {
  assert.match(source, /Waterfront Restaurant in the (?:city|City) of Anna Maria/);
  assert.doesNotMatch(source, /Waterfront Restaurant in Holmes Beach|Both islands affected equally|Usually late summer \(Aug-Oct\)|you access it from AMI|Shallow sandbars/i);
  assert.match(source, /North Shore Road/);
  assert.match(source, /conditions can differ between beaches/);
});

test('Longboat retains the approved ledger, source icons and original conversion tracking', () => {
  assert.match(source, /extends "layouts\/guide-decision-ledger\.njk"/);
  assert.match(source, /uiIcon\("info"\)/);
  assert.match(source, /data-track-event="guide_book_direct_click" data-guide-slug="anna-maria-island-vs-longboat-key"/);
  assert.doesNotMatch(source, /<style\b|\bstyle=|data-prototype-ui|preview-toolbar/);
  for (const href of ['/properties/dockside-dreams/','/properties/the-oasis/','/properties/river-house/','/properties/sarasota-luxe/','/properties/','/stays/bradenton-waterfront-vacation-rentals/','/stays/family-vacation-rentals-anna-maria-island/']) assert.ok(source.includes(`href="${href}"`), href);
});
