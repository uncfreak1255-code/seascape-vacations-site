const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../..');
const read = name => fs.readFileSync(path.join(root, 'src/guides', name), 'utf8');

test('airport estimates identify one destination and agree across cards and table', () => {
  const source = read('how-to-get-to-anna-maria-island.html');
  assert.match(source, /Manatee Public Beach/);
  for (const [miles, minutes] of [[16, 35], [52, 75], [44, 65]]) {
    assert.ok(source.includes(`${miles} miles / about ${minutes} min`));
    assert.ok(source.includes(`<td>About ${miles} miles</td><td>About ${minutes} min</td>`));
  }
  assert.doesNotMatch(source, /just 25 minutes|20 miles \/ ~25|55 miles|60-75 min/);
  assert.match(source, /without traffic/);
  assert.match(source, /2026-11-16/);
});

test('named guide guarantees cannot survive in prose or structured answers', () => {
  const files = ['siesta-key-vs-anna-maria-island-families.html', 'dolphins-manatees-bradenton.html', 'things-to-do-bradenton-fl.html', 'srq-airport-to-anna-maria-island.html', 'flights-to-anna-maria-island/index.html', 'holmes-beach.html', 'siesta-key-beach-guide.html'];
  for (const file of files) assert.doesNotMatch(read(file), /rarely crowded|never crowded|PACKED|pose no danger|nearly guaranteed|guaranteed sightings|guaranteed parking|guaranteed availability/i, file);
  const wildlife = read('dolphins-manatees-bradenton.html');
  const answer = 'Manatees are wild animals. Watch from a distance, give them room to move, and never feed, touch or chase them. Keep children close and follow posted wildlife and boating rules.';
  assert.equal(wildlife.split(answer).length - 1, 2, 'visible and structured wildlife answers agree');
});
