const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const PHONE_WIDTH = 700;

function stripComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, '');
}

function mediaMatchesPhone(prelude, width = PHONE_WIDTH) {
  const max = [...prelude.matchAll(/max-width:\s*(\d+)px/g)].map((match) => Number(match[1]));
  const min = [...prelude.matchAll(/min-width:\s*(\d+)px/g)].map((match) => Number(match[1]));
  if (max.some((value) => width > value)) return false;
  if (min.some((value) => width < value)) return false;
  return true;
}

function walkCss(css, onRule, mediaStack = []) {
  let index = 0;
  const source = stripComments(css);
  while (index < source.length) {
    const nextBrace = source.indexOf('{', index);
    if (nextBrace === -1) break;
    const prelude = source.slice(index, nextBrace).trim();
    let depth = 1;
    let cursor = nextBrace + 1;
    while (cursor < source.length && depth > 0) {
      const character = source[cursor];
      if (character === '{') depth += 1;
      else if (character === '}') depth -= 1;
      cursor += 1;
    }
    const body = source.slice(nextBrace + 1, cursor - 1);
    if (prelude.startsWith('@media')) {
      walkCss(body, onRule, mediaStack.concat(prelude));
    } else if (prelude && !prelude.startsWith('@')) {
      onRule(prelude, body, mediaStack);
    }
    index = cursor;
  }
}

function applyDeclaration(declarations, property, value) {
  declarations[property] = value;
  // `overflow` resets overflow-x/y in the cascade; keep that so the old phone
  // carousel's overflow-x:auto cannot leak past a later overflow:visible list.
  if (property === 'overflow' && value && !/\s/.test(value)) {
    declarations['overflow-x'] = value;
    declarations['overflow-y'] = value;
  }
}

function parseDeclarations(body) {
  const declarations = {};
  for (const part of body.split(';')) {
    const separator = part.indexOf(':');
    if (separator === -1) continue;
    const property = part.slice(0, separator).trim();
    const value = part.slice(separator + 1).trim();
    if (property) applyDeclaration(declarations, property, value);
  }
  return declarations;
}

function cascadeDeclarations(css, predicate) {
  const declarations = {};
  walkCss(css, (prelude, body, mediaStack) => {
    if (!mediaStack.every((query) => mediaMatchesPhone(query))) return;
    const matches = prelude.split(',').some((selector) => predicate(selector.trim()));
    if (!matches) return;
    Object.assign(declarations, parseDeclarations(body));
  });
  return declarations;
}

function isPostcardList(selector) {
  return /(^|[\s>+~])\.g-postcards(?![\w-])/.test(selector);
}

function isReadyHomepageCard(selector) {
  return /(^|[\s>+~])\.g-postcard(?!s)(?![\w-])/.test(selector)
    && selector.includes('.g-home')
    && selector.includes('.hd-ready');
}

function assertPhoneHomeCardsStacked(html, css) {
  if (!html) {
    throw new Error('built homepage HTML is required');
  }
  if (!css) {
    throw new Error('built homepage CSS is required');
  }

  if (!/\bdata-home-deck\b/.test(html) || !html.includes('g-postcards')) {
    throw new Error('built homepage must include the home-deck card list');
  }
  const cards = html.match(/<article class="g-postcard"/g) || [];
  if (cards.length < 2) {
    throw new Error(`phone homepage must render multiple home cards, found ${cards.length}`);
  }

  const list = cascadeDeclarations(css, isPostcardList);
  if (Object.keys(list).length === 0) {
    throw new Error('phone homepage CSS must scope a stacked .g-home .g-postcards list');
  }
  const overflow = `${list['overflow-x'] || ''} ${list.overflow || ''}`;
  const snap = list['scroll-snap-type'] || '';
  const flow = list['grid-auto-flow'] || '';
  if (/\bauto\b/.test(overflow) || /^x\b/.test(snap) || flow === 'column') {
    throw new Error('phone homepage cards must not use a horizontal scroll container or carousel deck');
  }
  if (list.display !== 'grid' && flow !== 'row') {
    throw new Error('phone homepage cards must be a vertical stacked list');
  }
  const columns = list['grid-template-columns'] || '';
  if (/repeat\(/.test(columns) || (!/minmax\(0,\s*1fr\)/.test(columns) && columns !== '1fr')) {
    throw new Error('phone homepage cards must stack in a single column');
  }

  const card = cascadeDeclarations(css, isReadyHomepageCard);
  if (card.position === 'absolute') {
    throw new Error('phone homepage cards must not use the overlay single-home deck');
  }
}

function stylesheetHrefs(html) {
  return [...html.matchAll(/<link\b[^>]*>/gi)]
    .map((match) => match[0])
    .filter((tag) => /rel=["']stylesheet["']/i.test(tag))
    .map((tag) => {
      const href = tag.match(/href=["']([^"']+)["']/i);
      return href ? href[1].replace(/\?.*$/, '') : null;
    })
    .filter(Boolean);
}

function builtHomepageCss(html) {
  return stylesheetHrefs(html)
    .map((href) => fs.readFileSync(path.join('_site', href.replace(/^\//, '')), 'utf8'))
    .join('\n');
}

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
  assert.match(js, /function showingList\(\) \{ return phone\.matches \|\| open; \}/);
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

test('built homepage at phone width stacks home cards as a vertical list', () => {
  const home = fs.readFileSync('_site/index.html', 'utf8');
  assertPhoneHomeCardsStacked(home, builtHomepageCss(home));
});

test('a horizontal homepage carousel fails the phone stack contract', () => {
  const stackedHtml = '<div data-home-deck><div class="g-postcards"><article class="g-postcard"></article><article class="g-postcard"></article></div></div>';
  const stackedCss = '@media(max-width:700px){.g-home .g-postcards{display:grid;grid-auto-flow:row;grid-template-columns:minmax(0,1fr);overflow:visible;scroll-snap-type:none}}';
  assertPhoneHomeCardsStacked(stackedHtml, stackedCss);

  assert.throws(() => assertPhoneHomeCardsStacked('', stackedCss), /built homepage HTML is required/);
  assert.throws(() => assertPhoneHomeCardsStacked(stackedHtml, ''), /built homepage CSS is required/);
  assert.throws(
    () => assertPhoneHomeCardsStacked('<main>no deck</main>', stackedCss),
    /home-deck card list/
  );
  assert.throws(
    () => assertPhoneHomeCardsStacked(
      '<div data-home-deck><div class="g-postcards"><article class="g-postcard"></article></div></div>',
      stackedCss
    ),
    /multiple home cards/
  );
  assert.throws(
    () => assertPhoneHomeCardsStacked(
      stackedHtml,
      '@media(max-width:700px){.g-home .g-postcards{display:flex;overflow-x:auto;scroll-snap-type:x mandatory;grid-auto-flow:column}}'
    ),
    /horizontal scroll container or carousel deck/
  );
  assert.throws(
    () => assertPhoneHomeCardsStacked(
      stackedHtml,
      `${stackedCss}.g-home .hd-ready .g-postcard{position:absolute;left:50%;width:420px}`
    ),
    /overlay single-home deck/
  );
});
