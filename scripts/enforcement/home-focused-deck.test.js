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
test('homepage postcard extras defer src until strip interaction', () => {
  const source = fs.readFileSync('src/index.njk', 'utf8');
  assert.match(source, /<img class="ts-extra" data-src="/);
  assert.doesNotMatch(source, /<img class="ts-extra"[^>]*\ssrc="/);
  assert.match(source, /loading="\{\{ 'eager' if loop.first else 'lazy' \}\}"/);
  const home = fs.readFileSync('_site/index.html', 'utf8');
  const extras = [...home.matchAll(/<img class="ts-extra"[^>]*>/g)].map((match) => match[0]);
  assert.equal(extras.length, 32);
  extras.forEach((tag) => {
    assert.match(tag, /\sdata-src="/);
    assert.doesNotMatch(tag, /\ssrc="/);
  });
  assert.match(home, /<img data-property-photo="dockside-dreams"[^>]*\ssrc="/);
  assert.match(home, /<img data-property-photo="dockside-dreams"[^>]*loading="eager"/);
});
