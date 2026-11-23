// The photo lightbox (docs/design/photo-lightbox.md): its macro's markup and its stylesheet's rules.
// Its script: photo-lightbox-script.test.js. No browser here; the real-browser run is
// tests/visual/photo-lightbox.spec.js, which the required checks do not run.
const test = require('node:test');
const assert = require('node:assert/strict');
const assertStateMotionOnly = require('./css-motion');
const { read, sample, render, shot, parse, page } = require('./photo-lightbox-page');

const css = read('src/css/photo-lightbox.css').replace(/\/\*[\s\S]*?\*\//g, '');

test('the dialog is a native dialog named by its title, with Close as a dialog form and first control', () => {
  const { dialog } = page();
  assert.equal(dialog.tag, 'dialog');
  assert.ok(!('open' in dialog.attrs), 'the script opens it as a modal; the markup never does');
  assert.equal(dialog.getElementById(dialog.attrs['aria-labelledby']).textContent, 'Dockside Dreams');
  assert.equal(dialog.querySelector('h2').attrs.id, dialog.attrs['aria-labelledby']);
  // showModal() focuses the autofocus control. Without it a short window, where the frame scrolls,
  // gives focus to the frame.
  const inOrder = (node) => node.children.flatMap((child) => (child.tag === '#text' ? [] : [child, ...inOrder(child)]));
  const first = inOrder(dialog).find((node) => node.tag === 'button' || node.tag === 'a');
  assert.equal(first.textContent, 'Close');
  assert.deepEqual(inOrder(dialog).filter((node) => 'autofocus' in node.attrs).map((node) => node.textContent), ['Close']);
  assert.equal(first.parent.tag, 'form');
  assert.equal(first.parent.attrs.method, 'dialog');
  assert.ok(!('type' in first.attrs), 'a submit button closes the dialog with no script');
});

test('rooms are pressed buttons, each room one group of photos, only the first on show', () => {
  const { all, at, pressed, hidden } = page();
  assert.equal(at('[role]').attrs['aria-label'], 'Rooms');
  assert.deepEqual(all('[data-plb-room]').map((room) => room.textContent), ['Outside 4 photos', 'Living 4 photos', 'Bedrooms 4 photos', 'Bath 1 photo']);
  assert.equal(pressed(), 'true,false,false,false');
  assert.equal(hidden(), 'false,true,true,true');
  assert.deepEqual(all('[data-plb-panel]').map((panel) => `${panel.attrs.role}:${panel.attrs['aria-label']}`), ['group:Outside photos', 'group:Living photos', 'group:Bedrooms photos', 'group:Bath photos']);
  assert.deepEqual(all('[data-plb-room]').map((room) => room.attrs['data-plb-next']), ['Next: Living', 'Next: Bedrooms', 'Next: Bath', 'Next: Outside']);
  assert.equal(at('[data-plb-next-room]').textContent, 'Next: Living');
});

test('every photo links its full-size file and loads lazily, with the caller\'s sizes', () => {
  const { all, at } = page();
  const photos = all('[data-plb-photo]');
  const truth = sample.rooms.flatMap((room) => room.photos);
  assert.equal(photos.length, 13);
  photos.forEach((photo, i) => {
    const image = photo.querySelector('img');
    assert.equal(photo.tag, 'a');
    assert.equal(photo.attrs.href, truth[i].src);
    assert.equal(image.attrs.alt, truth[i].alt);
    assert.equal(image.attrs.srcset, truth[i].srcset);
    assert.equal(image.attrs.loading, 'lazy');
    assert.ok(image.attrs.sizes && image.attrs.width && image.attrs.height);
  });
  assert.equal(photos[0].attrs['data-plb-position'], '1 of 4 in Outside · photo 1 of 13');
  assert.equal(photos[12].attrs['data-plb-position'], '1 of 1 in Bath · photo 13 of 13');
  assert.equal(photos[5].parent.querySelector('p').textContent, 'Kitchen 2 of 4');
  const stage = at('[data-plb-stage]');
  assert.equal(stage.querySelector('img').attrs.loading, 'lazy', 'a phone never lays the stage out, so never fetches its photo');
  assert.equal(stage.querySelector('a').attrs.href, truth[0].src);
  assert.equal(at('[data-plb-stage-position]').attrs['aria-live'], 'polite');
  assert.deepEqual(all('[data-plb-step]').map((step) => `${step.attrs['data-plb-step']}:${step.attrs['aria-label']}`), ['-1:Previous photo', '1:Next photo']);
});

test('the caller\'s words are escaped, and the partial\'s own words are its control labels', () => {
  const html = render({ id: 'x', title: 'A & <B>', eyebrow: 'E "1"', rooms: [{ name: 'R<1>', photos: [shot(1, { alt: 'A "q" & <i>', label: 'L & <1>' })] }, { name: 'R2', photos: [shot(2), shot(3)] }] });
  assert.ok(html.includes('<h2 class="plb-title" id="x-title">A &amp; &lt;B&gt;</h2>'));
  assert.ok(html.includes('alt="A &quot;q&quot; &amp; &lt;i&gt;"'));
  assert.ok(html.includes('data-plb-label="L &amp; &lt;1&gt;"'));
  assert.ok(html.includes('aria-label="R&lt;1&gt; photos"'));
  const words = parse(html).textContent.replace(/\s+/g, ' ').trim();
  assert.equal(words, 'E "1" A & <B> Close R<1> 1 photo R2 2 photos L & <1> 1 of 1 Label 2 1 of 2 Label 3 2 of 2 Next: R2 L & <1> 1 of 1 in R<1> · photo 1 of 3');
});

test('no id, no title or no photo: no markup. A room or photo missing a required part is left out', () => {
  const rooms = [{ name: 'One', photos: [shot(1)] }];
  assert.equal(render({ title: 'T', rooms }), '');
  assert.equal(render({ id: 'x', rooms }), '');
  assert.equal(render({ id: 'x', title: 'T' }), '');
  assert.equal(render({ id: 'x', title: 'T', rooms: [{ name: 'One', photos: [] }, { name: 'Two' }] }), '');
  assert.equal(render({ id: 'x', title: 'T', rooms: [{ photos: [shot(1)] }, { name: 'Two', photos: [{ src: '/p/2.webp' }, { alt: 'no file' }] }] }), '');
  const doc = parse(render({ id: 'x', title: 'T', rooms: [{ name: 'One', photos: [shot(1), { alt: 'no file' }, shot(2)] }, { photos: [shot(3)] }, { name: 'Three', photos: [shot(4)] }] }));
  assert.deepEqual(doc.querySelectorAll('[data-plb-room]').map((room) => room.textContent), ['One 2 photos', 'Three 1 photo']);
  assert.deepEqual(doc.querySelectorAll('[data-plb-photo]').map((photo) => photo.attrs['data-plb-position']), ['1 of 2 in One · photo 1 of 3', '2 of 2 in One · photo 2 of 3', '1 of 1 in Three · photo 3 of 3']);
});

test('one room: no room switcher and no Next button. One photo: no step buttons. No srcset: no sizes', () => {
  const one = parse(render({ id: 'x', title: 'T', rooms: [{ name: 'Only', photos: [shot(1), shot(2)] }] }));
  assert.equal(one.querySelectorAll('[data-plb-room]').length, 0);
  assert.equal(one.querySelector('[data-plb-next-room]'), null);
  assert.equal(one.querySelectorAll('[data-plb-step]').length, 2);
  const single = parse(render({ id: 'x', title: 'T', rooms: [{ name: 'Only', photos: [shot(1)] }] }));
  assert.equal(single.querySelectorAll('[data-plb-step]').length, 0);
  assert.ok(!('sizes' in single.querySelector('[data-plb-photo]').querySelector('img').attrs));
  assert.ok(!('width' in single.querySelector('[data-plb-photo]').querySelector('img').attrs));
});

// Text checks on the stylesheet from here down.
const ruleBody = (selector) => (css.match(new RegExp(`(?:^|\\})\\s*${selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')} \\{([^}]*)\\}`)) || [])[1];

test('the stylesheet never sets display on the dialog, and every rule stays inside it', () => {
  assert.ok(ruleBody('.plb'));
  assert.doesNotMatch(ruleBody('.plb'), /display/, 'the browser hides a closed dialog with display');
  const selectors = [...css.replace(/@media[^{]*\{/g, '').matchAll(/([^{}]+)\{[^{}]*\}/g)].flatMap(([, list]) => list.split(',').map((s) => s.trim()));
  assert.ok(selectors.length > 40);
  for (const selector of selectors) assert.match(selector, /^(\.plb( |$)|:root:has\(\.plb\[open\]\)$)/, selector);
  // Two classes outrank a host page's `.guest-site h2`, `.guest-site p` and `.guest-site button`.
  for (const selector of selectors.filter((s) => /^\.plb \.plb-(title|eyebrow|caption|button|room|step)\b/.test(s))) assert.ok(selector.split('.').length >= 3);
});

test('the page stays still behind the dialog, the stage is laid out only on a wide screen, and its photo shows whole', () => {
  assert.match(ruleBody(':root:has(.plb[open])'), /overflow: hidden/);
  const wide = css.indexOf('@media (min-width: 900px)');
  const off = css.indexOf('.plb .plb-stage { display: none; }');
  // The script reads "is the stage laid out" to tell a feed from the wide layout.
  assert.ok(off > 0 && off < wide, 'off by default, before the wide layout turns it on');
  assert.match(css.slice(wide), /\.plb \.plb-stage \{ grid-area: stage; display: flex;/);
  assert.match(css.slice(wide), /\.plb \.plb-stage-photo img \{[^}]*object-fit: contain; \}/);
  // 120px: a phone on its side (393px tall) fits, so only the feed scrolls. Measured in the browser spec.
  assert.match(css, /"feed feed" minmax\(120px, 1fr\)/);
});

test('the focus ring is the shared one and replaces the picked photo\'s ring', () => {
  const focus = css.indexOf('.plb :focus-visible { outline: 3px solid #A4533E; outline-offset: 4px; }');
  const picked = css.indexOf('.plb [aria-current="true"] { outline: 2px solid #173D42; outline-offset: 2px; }');
  assert.ok(picked > 0 && focus > picked, 'equal weight, so the later rule wins: keep the focus ring after the picked ring');
});

test('a phone gets the phone surface: white canvas, 16px photos with the inner outline, pill rooms', () => {
  const phone = css.match(/@media \(max-width: 700px\) \{([\s\S]*?)\n\}/)[1];
  assert.match(phone, /\.plb \{ background: white; \}/);
  assert.match(phone, /\.plb \.plb-photo, \.plb \.plb-photo img \{ border-radius: 16px; \}/);
  assert.match(phone, /outline: 1px solid oklch\(0 0 0 \/ \.1\); outline-offset: -1px;/);
  assert.match(phone, /\.plb \.plb-rooms \{[^}]*border-radius: 999px/);
  assert.match(phone, /\.plb \.plb-next \.plb-button \{ border-radius: 12px; font-size: 16px; \}/);
  assert.match(css, /@media \(min-width: 900px\) \{\s*\.plb \.plb-frame \{ grid-template: "head stage"/);
});

// The canvas Sawyer picked also had a sliding room pill, photos rising in, a fading large photo,
// scroll snapping and a hidden scrollbar. docs/design/pattern-motion.md lets pattern motion ship
// only after he selects it from a working preview; docs/design/photo-lightbox.md records it.
test('the stylesheet ships no pattern motion, no shadow, and switches its press and hover off under reduced motion', () => {
  assertStateMotionOnly(css, ['.plb .plb-button', '.plb .plb-room', '.plb .plb-step']);
  assert.doesNotMatch(css, /box-shadow|scroll-snap|scrollbar|opacity/);
});
