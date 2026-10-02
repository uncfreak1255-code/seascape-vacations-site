const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const TRIP_MEMORY_KEY = 'seascape_trip';
function memory(initial) {
  const values = new Map(initial === undefined ? [] : [[TRIP_MEMORY_KEY, typeof initial === 'string' ? initial : JSON.stringify(initial)]]);
  return { values, getItem: key => values.has(key) ? values.get(key) : null, setItem: (key, value) => { values.set(key, String(value)); }, removeItem: key => { values.delete(key); } };
}
function blockedStorage() {
  const fail = () => { throw new Error('storage blocked'); };
  return { getItem: fail, setItem: fail, removeItem: fail };
}
function runtime(search = '', links = [], options = {}) {
  const location = new URL('https://seascape-vacations.com' + (options.pathname || '/guides/bradenton-vs-sarasota/') + search);
  const listeners = {};
  const history = { state: null, replaceState: (_state, _title, url) => { location.href = new URL(url, location.href).href; } };
  const window = { location, history, crypto: { randomUUID: () => 'aaaaaaaa-aaaa-4aaa-8aaa-abcdefabcdef' } };
  if (options.storage) window.localStorage = options.storage;
  const document = { readyState: 'loading', addEventListener: (name, fn) => { listeners[name] = fn; }, querySelectorAll: selector => selector === 'a[href]' ? links : [] };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../../src/assets/js/conversion-tracking.js'), 'utf8'), { window, document, URL, URLSearchParams, Intl });
  return { api: window.SeascapeConversionTracking, init: () => listeners.DOMContentLoaded(), location };
}
function link(href) { return { get href() { return href; }, set href(value) { href = value; }, getAttribute: () => href, setAttribute: (_, value) => { href = value; } }; }
const trip = '?arrive=2099-12-05&depart=2099-12-12&guests=8';

test('guide and stay detours retain dates and guests without copying private query fields', () => {
  const links = [link('/stays/fishing-vacation-rentals-bradenton/'), link('/properties/dockside-dreams/'), link('/guides/'), link('/'), link('/property-management/'), link('https://example.com/guides/'), link('#map')];
  runtime(trip + '&email=private@example.com', links).init();
  for (const item of links.slice(0, 4)) {
    const url = new URL(item.getAttribute(), 'https://seascape-vacations.com');
    assert.equal(url.searchParams.get('arrive'), '2099-12-05');
    assert.equal(url.searchParams.get('depart'), '2099-12-12');
    assert.equal(url.searchParams.get('guests'), '8');
    assert.equal(url.searchParams.has('email'), false);
  }
  assert.equal(new URL(links[4].getAttribute()).search, '');
  assert.equal(links[5].getAttribute(), 'https://example.com/guides/');
  assert.equal(new URL(links[6].getAttribute()).search, trip + '&email=private@example.com');
});

test('shared navigation retains the approved SAVE50 campaign allowlist only', () => {
  const links = [link('/properties/'), link('/stays/bradenton-vacation-rentals-near-beaches/')];
  runtime(trip + '&promo=save50&utm_source=mailchimp&utm_medium=email&utm_content=welcome&sv_session_id=secret&email=private@example.com', links).init();
  for (const item of links) {
    const url = new URL(item.getAttribute());
    assert.equal(url.searchParams.get('promo'), 'save50');
    assert.equal(url.searchParams.get('utm_source'), 'mailchimp');
    assert.equal(url.searchParams.get('utm_medium'), 'email');
    assert.equal(url.searchParams.get('utm_campaign'), 'save50_welcome');
    assert.equal(url.searchParams.get('utm_content'), 'welcome');
    assert.equal(url.searchParams.has('sv_session_id'), false);
    assert.equal(url.searchParams.has('email'), false);
  }
});

test('checkout receives Hostaway public date names and the selected guest count', () => {
  const url = new URL(runtime(trip).api.buildBookingEngineHandoffUrl('https://book.seascape-vacations.com/listings/206016'));
  assert.equal(url.searchParams.get('start'), '2099-12-05');
  assert.equal(url.searchParams.get('end'), '2099-12-12');
  assert.equal(url.searchParams.get('numberOfGuests'), '8');
  assert.equal(url.searchParams.get('property_slug'), 'dockside-dreams');
});

test('explicit destination dates and guests win as a pair over the current trip', () => {
  for (const dates of ['start=2099-11-01&end=2099-11-08', 'startingDate=2099-11-01&endingDate=2099-11-08']) {
    const url = new URL(runtime(trip).api.buildBookingEngineHandoffUrl('https://book.seascape-vacations.com/listings/206016?' + dates + '&numberOfGuests=4'));
    assert.equal(url.searchParams.get('start'), '2099-11-01');
    assert.equal(url.searchParams.get('end'), '2099-11-08');
    assert.equal(url.searchParams.get('numberOfGuests'), '4');
    assert.equal(url.searchParams.has('startingDate'), false);
    assert.equal(url.searchParams.has('endingDate'), false);
  }
});

test('Blue House listing 589288 resolves to blue-house on checkout and shortlist', () => {
  const checkout = new URL(runtime(trip).api.buildBookingEngineHandoffUrl('https://book.seascape-vacations.com/listings/589288'));
  assert.equal(checkout.searchParams.get('property_slug'), 'blue-house');

  const shortlist = runtime('?compare=blue-house,unknown-home,dockside-dreams').api.readTripParams(
    new URLSearchParams('compare=blue-house,unknown-home,dockside-dreams')
  );
  assert.equal(shortlist.compare, 'blue-house,dockside-dreams');
});

test('invalid, partial, reversed, impossible and past trip dates are never passed to checkout', () => {
  for (const query of ['arrive=2099-12-05', 'arrive=2099-12-12&depart=2099-12-05', 'arrive=2099-02-30&depart=2099-03-04', 'arrive=2020-12-05&depart=2020-12-12']) {
    const url = new URL(runtime('?' + query + '&guests=8oops').api.buildBookingEngineHandoffUrl('https://book.seascape-vacations.com/listings/206016'));
    assert.equal(url.searchParams.has('start'), false);
    assert.equal(url.searchParams.has('end'), false);
    assert.equal(url.searchParams.has('numberOfGuests'), false);
  }
});

const remembered = { arrive: '2099-12-05', depart: '2099-12-12', guests: '8' };
function stored(storage) { return JSON.parse(storage.getItem(TRIP_MEMORY_KEY)); }

test('a trip in the page address is remembered as dates and guest count only', () => {
  const storage = memory();
  runtime(trip + '&area=sarasota&compare=dockside-dreams&promo=save50&email=private@example.com', [], { storage });
  const saved = stored(storage);
  assert.deepEqual(Object.keys(saved).sort(), ['arrive', 'depart', 'guests', 'saved']);
  assert.deepEqual({ arrive: saved.arrive, depart: saved.depart, guests: saved.guests }, remembered);
  assert.equal(typeof saved.saved, 'number');
  assert.deepEqual([...storage.values.keys()], [TRIP_MEMORY_KEY]);
});

test('a remembered trip is restored to guest pages that arrive without one', () => {
  for (const pathname of ['/', '/properties/', '/properties/dockside-dreams/', '/guides/bradenton-vs-sarasota/', '/stays/fishing-vacation-rentals-bradenton/', '/about-us/']) {
    const links = [link('/properties/the-oasis/')];
    const page = runtime('?utm_source=newsletter', links, { pathname, storage: memory({ ...remembered, saved: Date.now() }) });
    assert.equal(page.location.pathname, pathname);
    assert.equal(page.location.search, '?utm_source=newsletter&arrive=2099-12-05&depart=2099-12-12&guests=8', pathname);
    page.init();
    const url = new URL(links[0].getAttribute());
    assert.equal(url.searchParams.get('arrive'), '2099-12-05');
    assert.equal(url.searchParams.get('guests'), '8');
    assert.equal(url.searchParams.has('utm_source'), false);
  }
});

test('the page address wins over a remembered trip, including a rejected one', () => {
  const storage = memory({ ...remembered, saved: Date.now() });
  const newer = runtime('?arrive=2099-11-01&depart=2099-11-08&guests=4', [], { storage });
  assert.equal(newer.location.search, '?arrive=2099-11-01&depart=2099-11-08&guests=4');
  assert.deepEqual({ arrive: stored(storage).arrive, depart: stored(storage).depart, guests: stored(storage).guests }, { arrive: '2099-11-01', depart: '2099-11-08', guests: '4' });

  // A malformed inbound link shows its own error state and must not erase or be replaced by the remembered trip.
  for (const query of ['?arrive=2020-12-05&depart=2020-12-12', '?arrive=2099-12-05', '?guests=8oops', '?checkin=2099-02-30&checkout=2099-03-04']) {
    const kept = memory({ ...remembered, saved: Date.now() });
    const page = runtime(query, [], { storage: kept });
    assert.equal(page.location.search, query);
    assert.equal(stored(kept).arrive, '2099-12-05');
  }

  // A shared shortlist keeps the sender's homes: the recipient's remembered dates must not filter it.
  const shortlist = runtime('?compare=dockside-dreams,the-oasis', [], { pathname: '/properties/', storage: memory({ ...remembered, saved: Date.now() }) });
  assert.equal(shortlist.location.search, '?compare=dockside-dreams,the-oasis');
  const area = runtime('?area=sarasota', [], { pathname: '/properties/', storage: memory({ ...remembered, saved: Date.now() }) });
  assert.equal(area.location.search, '?area=sarasota&arrive=2099-12-05&depart=2099-12-12&guests=8');
});

test('owner and other non-guest pages never receive a remembered trip', () => {
  for (const pathname of ['/property-management/', '/property-management/revenue-review/', '/privacy/', '/cookies/']) {
    const page = runtime('', [], { pathname, storage: memory({ ...remembered, saved: Date.now() }) });
    assert.equal(page.location.search, '', pathname);
  }
});

test('past, expired, malformed and unexpected remembered values are not restored', () => {
  const day = 24 * 60 * 60 * 1000;
  const rejected = [
    { arrive: '2020-12-05', depart: '2020-12-12', guests: '', saved: Date.now() },
    { ...remembered, saved: Date.now() - 31 * day },
    { ...remembered },
    { ...remembered, saved: 'yesterday' },
    { arrive: '2099-12-12', depart: '2099-12-05', guests: '0', saved: Date.now() },
    { arrive: '<script>', depart: '2099-12-12', guests: 'eight', saved: Date.now() },
    '{not json',
    'null',
    '"2099-12-05"',
    '[]'
  ];
  for (const value of rejected) {
    const page = runtime('', [], { pathname: '/properties/', storage: memory(value) });
    assert.equal(page.location.search, '', JSON.stringify(value));
  }
  // Past dates drop out; a still-valid guest count is kept.
  const guestsOnly = runtime('', [], { pathname: '/properties/', storage: memory({ arrive: '2020-12-05', depart: '2020-12-12', guests: '6', saved: Date.now() }) });
  assert.equal(guestsOnly.location.search, '?guests=6');
  // Only the three trip fields are ever copied out of storage.
  const extra = runtime('', [], { pathname: '/', storage: memory({ ...remembered, saved: Date.now(), email: 'private@example.com', area: 'sarasota' }) });
  assert.equal(extra.location.search, '?arrive=2099-12-05&depart=2099-12-12&guests=8');
});

test('trip edits replace the remembered trip and clearing the trip forgets it', () => {
  const storage = memory({ ...remembered, saved: Date.now() });
  const page = runtime('', [], { pathname: '/properties/', storage });
  page.api.rememberTrip({ arrive: '2099-10-01', depart: '2099-10-04', guests: '2', email: 'private@example.com', area: 'sarasota' });
  assert.deepEqual(Object.keys(stored(storage)).sort(), ['arrive', 'depart', 'guests', 'saved']);
  assert.equal(stored(storage).arrive, '2099-10-01');
  page.api.rememberTrip({ arrive: '', depart: '', guests: '2' });
  assert.deepEqual({ arrive: stored(storage).arrive, depart: stored(storage).depart, guests: stored(storage).guests }, { arrive: '', depart: '', guests: '2' });
  page.api.rememberTrip({ arrive: '', depart: '', guests: '' });
  assert.equal(storage.getItem(TRIP_MEMORY_KEY), null);
  assert.equal(runtime('', [], { pathname: '/', storage }).location.search, '');
});

test('pages keep working when browser storage is missing or blocked', () => {
  for (const storage of [undefined, blockedStorage()]) {
    const links = [link('/properties/dockside-dreams/')];
    const page = runtime(trip, links, { storage });
    page.init();
    page.api.rememberTrip(remembered);
    assert.equal(new URL(links[0].getAttribute()).searchParams.get('arrive'), '2099-12-05');
    assert.equal(runtime('', [], { pathname: '/properties/', storage }).location.search, '');
  }
});
