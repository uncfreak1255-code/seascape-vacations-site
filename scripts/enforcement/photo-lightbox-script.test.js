// The photo lightbox's script (docs/design/photo-lightbox.md), run against the markup its own
// partial prints. Markup and stylesheet: photo-lightbox.test.js. No browser here; the real-browser
// run is tests/visual/photo-lightbox.spec.js, which the required checks do not run.
const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const { read, sample, render, parse, page, lightbox } = require('./photo-lightbox-page');

const script = read('src/assets/js/photo-lightbox.js');

test('state: a room starts at its first photo, and stepping wraps across every room', () => {
  const counts = [4, 4, 4, 1];
  assert.deepEqual(lightbox.pickRoom(counts, 2), { room: 2, photo: 8 });
  assert.deepEqual(lightbox.pickPhoto(counts, 7), { room: 1, photo: 7 });
  assert.deepEqual(lightbox.pickPhoto(counts, 12), { room: 3, photo: 12 });
  assert.deepEqual(lightbox.stepPhoto(counts, 3, 1), { room: 1, photo: 4 });
  assert.deepEqual(lightbox.stepPhoto(counts, 12, 1), { room: 0, photo: 0 });
  assert.deepEqual(lightbox.stepPhoto(counts, 0, -1), { room: 3, photo: 12 });
  assert.deepEqual(lightbox.nextRoom(counts, 3), { room: 0, photo: 0 });
  assert.deepEqual(lightbox.stepPhoto([1], 0, 1), { room: 0, photo: 0 });
});

test('the opener stays hidden until the script can open the dialog, then opens it as a modal', () => {
  const { opener, calls, dialog } = page();
  assert.equal(opener.hidden, false);
  opener.fire('click');
  assert.deepEqual(calls, ['showModal'], 'show() would leave the page behind it live, with no Escape and no focus return');
  dialog.open = true;
  opener.fire('click');
  assert.deepEqual(calls, ['showModal'], 'an open dialog is not opened twice');

  assert.equal(page({ modal: false }).opener.hidden, true, 'no showModal in this browser');
  assert.equal(page({ data: { ...sample, rooms: [] } }).opener.hidden, true, 'no dialog was printed');
  const orphan = parse('<button data-plb-open="missing" hidden>All photos</button>');
  lightbox.start(orphan);
  assert.equal(orphan.querySelector('button').hidden, true);
});

test('the script does nothing on a page with no lightbox, or with no document', () => {
  assert.doesNotThrow(() => vm.runInNewContext(script, {}));
  assert.doesNotThrow(() => vm.runInNewContext(script, { document: { querySelectorAll() { return []; } } }));
});

test('the script reads only hooks the partial prints, and runs no animation of its own', () => {
  const html = render(sample);
  const code = script.replace(/\/\/.*$/gm, '');
  const hooks = [...new Set(code.match(/data-plb-[a-z-]+/g))].filter((hook) => hook !== 'data-plb-open');
  assert.ok(hooks.length >= 9);
  for (const hook of hooks) assert.ok(html.includes(` ${hook}`), `${hook} is not in the partial's markup`);
  // The canvas's motion is not built: docs/design/photo-lightbox.md, "Motion record".
  assert.doesNotMatch(code, /animate\(|requestAnimationFrame|setTimeout|classList/);
});

test('picking a room shows its photos, names the next room and returns the feed to its top', () => {
  const { all, at, pressed, hidden, current } = page({ wide: false });
  const feed = at('[data-plb-feed]');
  feed.scrollTop = 400;
  all('[data-plb-room]')[2].querySelector('span').fire('click');
  assert.equal(pressed(), 'false,false,true,false');
  assert.equal(hidden(), 'true,true,false,true');
  assert.equal(at('[data-plb-next-room]').textContent, 'Next: Bath');
  assert.equal(feed.scrollTop, 0);
  at('[data-plb-next-room]').fire('click');
  assert.equal(pressed(), 'false,false,false,true');
  assert.equal(at('[data-plb-next-room]').textContent, 'Next: Outside');
  at('[data-plb-next-room]').fire('click');
  assert.equal(pressed(), 'true,false,false,false');
  assert.deepEqual(current(), [], 'a feed has no picked photo');
});

test('in the feed a photo is a plain link to its file, and the arrow keys are left alone', () => {
  const { all, dialog, pressed, stage } = page({ wide: false });
  const before = stage();
  assert.equal(all('[data-plb-photo]')[1].querySelector('img').fire('click'), false);
  assert.equal(dialog.fire('keydown', { key: 'ArrowRight' }), false);
  assert.deepEqual(stage(), before);
  assert.equal(pressed(), 'true,false,false,false');
});

test('beside the stage a small photo picks the large one; a modified click still opens the file', () => {
  const { all, opener, current, stage } = page({ wide: true });
  const photos = all('[data-plb-photo]');
  opener.fire('click');
  assert.deepEqual(current(), ['Pool and patio at dusk']);
  assert.equal(photos[2].querySelector('img').fire('click'), true);
  assert.deepEqual(current(), ['Dock seating']);
  const truth = sample.rooms[0].photos[2];
  assert.deepEqual(stage(), {
    href: truth.src,
    image: { src: truth.src, srcset: truth.srcset, sizes: '(min-width: 900px) calc(100vw - 400px), 1px', alt: truth.alt, width: String(truth.width), height: String(truth.height), loading: 'lazy', decoding: 'async' },
    label: 'Dock seating',
    position: '3 of 4 in Outside · photo 3 of 13',
  });
  for (const key of ['metaKey', 'ctrlKey', 'shiftKey', 'altKey']) assert.equal(photos[1].fire('click', { [key]: true }), false, key);
  assert.equal(photos[1].fire('click', { button: 1 }), false, 'middle click');
  assert.deepEqual(current(), ['Dock seating']);
});

test('beside the stage the arrows and step buttons walk every photo, and the room follows', () => {
  const { all, dialog, opener, pressed, hidden, current, stage } = page({ wide: true });
  opener.fire('click');
  assert.equal(dialog.fire('keydown', { key: 'ArrowLeft' }), true);
  assert.deepEqual(current(), ['Bathroom']);
  assert.equal(pressed(), 'false,false,false,true');
  assert.equal(hidden(), 'true,true,true,false');
  assert.equal(stage().position, '1 of 1 in Bath · photo 13 of 13');
  all('[data-plb-step]')[1].querySelector('svg').fire('click');
  assert.deepEqual(current(), ['Pool and patio at dusk']);
  assert.equal(pressed(), 'true,false,false,false');
  all('[data-plb-step]')[0].fire('click');
  assert.deepEqual(current(), ['Bathroom']);
  assert.equal(dialog.fire('keydown', { key: 'ArrowRight', metaKey: true }), false, 'a browser shortcut is left alone');
  assert.equal(dialog.fire('keydown', { key: 'Enter' }), false);
  all('[data-plb-room]')[1].fire('click');
  assert.deepEqual(current(), ['Living room'], 'a room starts at its first photo');
  assert.equal(stage().position, '1 of 4 in Living · photo 5 of 13');
});

test('a window that changes layout with the dialog open is redrawn: the room on show takes the stage', () => {
  const { all, dialog, opener, view, layout, current, stage } = page({ wide: false });
  const untouched = stage();
  opener.fire('click');
  all('[data-plb-room]')[2].fire('click');
  assert.deepEqual(stage(), untouched, 'a feed leaves the large photo alone');
  layout.wide = true;
  view.fire('resize');
  assert.deepEqual(current(), [sample.rooms[2].photos[0].label]);
  assert.equal(stage().position, '1 of 4 in Bedrooms · photo 9 of 13');
  assert.equal(stage().href, sample.rooms[2].photos[0].src);
  layout.wide = false;
  view.fire('resize');
  assert.deepEqual(current(), [], 'back in the feed no photo is the picked one');
  dialog.open = false;
  layout.wide = true;
  view.fire('resize');
  assert.deepEqual(current(), [], 'a closed dialog is drawn when it next opens');
  opener.fire('click');
  assert.deepEqual(current(), [sample.rooms[2].photos[0].label]);
});
