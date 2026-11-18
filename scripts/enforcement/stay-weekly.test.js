const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const read = p => fs.readFileSync(path.resolve(__dirname, '../..', p), 'utf8');
const route = '_site/stays/week-long-vacation-rentals-florida/index.html';

test('weekly guide binds the approved real photo, scoped enhancement and no-JS booking fallback', () => {
  const html = read(route);
  assert.match(html, /data-weekly-guide/);
  assert.match(html, /\/images\/homes\/dockside-dreams\/02\.webp/);
  assert.match(html, /href="https:\/\/book\.seascape-vacations\.com\/listings\/206016"[^>]+data-weekly-open/);
  assert.match(html, /data-weekly-handoff[^>]*data-track-event="guide_property_check_dates_click"[^>]*data-placement="weekly_booking_dialog"/);
  assert.match(html, /4 bedrooms · Up to 12 guests/);
  assert.match(html, /Make room for beach days and pool days/);
  assert.match(html, /<dialog[^>]+data-max-guests="12"/);
  assert.equal((html.match(/<details class="sv-faq"/g) || []).length, 6);
  assert.doesNotMatch(html, /Preview only|Dates are not checked in this preview|data-sv-variant/);
  assert.doesNotMatch(read('_site/stays/anna-maria-island-vacation-rentals/index.html'), /data-weekly-guide|stay-weekly\.(?:css|js)/);
});

test('weekly booking uses existing tracking, trip state and capacity guard, never claims live availability', () => {
  const js = read('src/assets/js/stay-weekly.js');
  assert.match(js, /buildBookingEngineHandoffUrl/);
  assert.match(js, /handoff\.click\(\)/);
  assert.match(js, /rememberTrip/);
  assert.match(js, /Number\(guests\.value\) > maxGuests/);
  assert.match(js, /event\.stopPropagation\(\)/);
  assert.match(js, /prefers-reduced-motion: reduce/);
  assert.doesNotMatch(js, /fetch\(|\/checkout\//);
  assert.match(read('src/css/stay-weekly.css'), /prefers-reduced-motion:reduce/);
});
