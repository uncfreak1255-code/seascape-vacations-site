'use strict';
// For the catalog pieces' tests (docs/design/component-patterns.md): a piece's stylesheet may
// carry only the state feedback DESIGN.md gives every control, until Sawyer selects its pattern
// motion (docs/design/pattern-motion.md). A text reading of flat CSS, one @media level deep.
const assert = require('node:assert/strict');

const REDUCED = '@media (prefers-reduced-motion: reduce)';
const reducedRe = /@media \(prefers-reduced-motion: reduce\) \{((?:[^{}]*\{[^{}]*\})*)\s*\}/;
const STATE_PROPERTY = /^(transform|color|background-color|border-color)$/;
const rules = (text) => [...text.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(([, selector, body]) => ({
  selectors: selector.split(',').map((s) => s.trim()),
  transition: ((body.match(/(?:^|;)\s*transition\s*:\s*([^;]+)/) || [])[1] || '').trim(),
}));

// `selectors`: every selector allowed a transition, sorted, one rule each. Each transition names
// its properties (transform or a colour), and one reduced-motion block, placed after every
// transition so it wins the cascade, switches each off.
module.exports = function assertStateMotionOnly(source, selectors) {
  const css = source.replace(/\/\*[\s\S]*?\*\//g, '');
  assert.doesNotMatch(css, /@keyframes|animation(-[a-z-]+)?\s*:/, 'an entrance needs a recorded selection first: docs/design/pattern-motion.md');
  assert.doesNotMatch(css, /transition-[a-z-]+\s*:/, 'write a transition as the shorthand, which this check reads');

  assert.equal(css.split(REDUCED).length - 1, 1, 'expected one reduced-motion block');
  const block = css.match(reducedRe);
  assert.ok(block, 'the reduced-motion block holds flat rules only');
  assert.doesNotMatch(css.slice(block.index + block[0].length), /transition/, 'a transition after the reduced-motion block would outrank it');

  const off = rules(block[1]).filter((r) => r.transition === 'none').flatMap((r) => r.selectors);
  const moving = rules(css.replace(block[0], '')).filter((r) => r.transition && r.transition !== 'none');

  assert.deepEqual(moving.flatMap((r) => r.selectors).sort(), selectors, 'expected only the press and the hover colour, one rule per selector');
  for (const { selectors: own, transition } of moving) {
    // Commas inside cubic-bezier() do not separate transitions.
    for (const part of transition.split(/,(?![^(]*\))/)) {
      assert.match(part.trim().split(/\s+/)[0], STATE_PROPERTY, `${own}: name the property, transform or a colour only`);
    }
    for (const selector of own) assert.ok(off.includes(selector), `no "transition: none" under reduced motion for ${selector}`);
  }
};
