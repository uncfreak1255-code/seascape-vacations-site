const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
test('homepage progressively enhances the complete property list into approved A', () => {
  const source = fs.readFileSync('src/index.njk', 'utf8');
  assert.match(source, /data-home-deck/);
  assert.match(source, /data-deck-explore/);
  assert.match(source, /data-ts-strip/);
  assert.match(source, /partials\/card-rating.njk/);
  assert.match(source, /Compare our homes/);
});
test('deck controls are manual, scoped and progressively enhanced', () => {
  const js = fs.readFileSync('src/assets/js/home-deck.js', 'utf8');
  assert.doesNotMatch(js, /setInterval|touchmove|preventDefault\(\).*scroll/);
  assert.match(js, /prefers-reduced-motion/);
  assert.match(js, /ts-filtered/);
  assert.match(js, /ResizeObserver/);
});
