const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function runtime(search = '', links = []) {
  const location = new URL('https://seascape-vacations.com/guides/bradenton-vs-sarasota/' + search);
  const listeners = {};
  const window = { location, crypto: { randomUUID: () => 'aaaaaaaa-aaaa-4aaa-8aaa-abcdefabcdef' } };
  const document = { readyState: 'loading', addEventListener: (name, fn) => { listeners[name] = fn; }, querySelectorAll: selector => selector === 'a[href]' ? links : [] };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../../src/assets/js/conversion-tracking.js'), 'utf8'), { window, document, URL, URLSearchParams, Intl });
  return { api: window.SeascapeConversionTracking, init: () => listeners.DOMContentLoaded() };
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

test('invalid, partial, reversed, impossible and past trip dates are never passed to checkout', () => {
  for (const query of ['arrive=2099-12-05', 'arrive=2099-12-12&depart=2099-12-05', 'arrive=2099-02-30&depart=2099-03-04', 'arrive=2020-12-05&depart=2020-12-12']) {
    const url = new URL(runtime('?' + query + '&guests=8oops').api.buildBookingEngineHandoffUrl('https://book.seascape-vacations.com/listings/206016'));
    assert.equal(url.searchParams.has('start'), false);
    assert.equal(url.searchParams.has('end'), false);
    assert.equal(url.searchParams.has('numberOfGuests'), false);
  }
});
