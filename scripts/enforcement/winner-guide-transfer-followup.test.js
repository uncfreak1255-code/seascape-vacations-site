const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '../..');

function readGuide(filename) {
  return fs.readFileSync(path.join(ROOT, 'src', 'guides', filename), 'utf8');
}

function countTrackedChoices(block) {
  return [...block.matchAll(/data-track-event="guide_book_direct_click"/g)].length;
}

function assertTrackedChoice(block, { href, slug, label }) {
  const payload =
    `href="${href}" data-track-event="guide_book_direct_click" ` +
    `data-guide-slug="${slug}" data-track-label="${label}"`;

  assert.ok(block.includes(payload), `missing tracked choice payload: ${payload}`);
}

test('Bradenton vs Sarasota presents two tracked stay bases directly after the comparison', () => {
  const source = readGuide('bradenton-vs-sarasota.html');
  const block = source.match(
    /<aside\b[^>]*data-transfer-choice="bradenton-vs-sarasota-stay-base"[\s\S]*?<\/aside>/,
  )?.[0];

  assert.ok(block, 'missing Bradenton vs Sarasota transfer decision');
  assert.match(
    source,
    /<div class="compare-table-wrap"[^>]*>[\s\S]*?<\/table><\/div>\s*<aside\b[^>]*data-transfer-choice="bradenton-vs-sarasota-stay-base"/,
  );
  assert.equal(countTrackedChoices(block), 2);
  assertTrackedChoice(block, {
    href: '/stays/bradenton-vacation-rentals-near-beaches/',
    slug: 'bradenton-vs-sarasota',
    label: 'Bottom Bradenton homes near AMI beaches',
  });
  assertTrackedChoice(block, {
    href: '/stays/siesta-key-area-vacation-rentals/',
    slug: 'bradenton-vs-sarasota',
    label: 'Bottom Siesta Key area stays',
  });
});

test('Siesta vs AMI families presents two tracked stay bases directly after the comparison', () => {
  const source = readGuide('siesta-key-vs-anna-maria-island-families.html');
  const block = source.match(
    /<div\b[^>]*data-transfer-choice="siesta-vs-ami-family-stay-base"[\s\S]*?<\/div>/,
  )?.[0];

  assert.ok(block, 'missing Siesta vs AMI family transfer decision');
  assert.match(
    source,
    /<table class="compare-table">[\s\S]*?<\/table>\s*<div\b[^>]*data-transfer-choice="siesta-vs-ami-family-stay-base"/,
  );
  assert.equal(countTrackedChoices(block), 2);
  assertTrackedChoice(block, {
    href: '/stays/anna-maria-island-vacation-rentals/',
    slug: 'siesta-key-vs-anna-maria-island-families',
    label: 'Post-table Anna Maria Island family stays',
  });
  assertTrackedChoice(block, {
    href: '/stays/siesta-key-area-vacation-rentals/',
    slug: 'siesta-key-vs-anna-maria-island-families',
    label: 'Post-table Siesta Key family stays',
  });
  assert.doesNotMatch(source, /<h2>Looking for Family Vacation Rentals\?<\/h2>/);
});
