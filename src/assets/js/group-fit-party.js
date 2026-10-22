/* Group-fit planner: sentence -> party. The one interpretation step in the
 * planner, kept apart from the bed logic so a typed model judgment can replace
 * parseParty() later without touching how beds are assigned. Never reads
 * property data. */
(function (root, factory) {
  'use strict';
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.SeascapeGroupFitParty = api;
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';
  var WORDS = { a: 1, an: 1, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16 };
  var NUM = '(\\d{1,2}|a|an|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen)';
  function num(s) { s = String(s || '').toLowerCase(); return /^\d+$/.test(s) ? Number(s) : (WORDS[s] || 0); }
  function clamp(n) { return Math.max(0, Math.min(40, n || 0)); }

  /* ---------- party ---------- */
  function parseParty(input) {
    var text = String(input || '').toLowerCase().replace(/&/g, ' and ').replace(/\+/g, ' and ').replace(/\s+/g, ' ').trim();
    var p = { adults: 0, couples: 0, kids: [], infants: 0, pet: false, petNote: '', mobility: false, boat: false, crib: false, text: text };
    if (!text) return finish(p);
    var m;
    var re = function (pattern) { return new RegExp(pattern, 'g'); };
    var explicitAdults = false;
    while ((m = re(NUM + '\\s+couples?\\b').exec(text))) { p.couples += num(m[1]); text = text.replace(m[0], ' '); }
    if (/\b(my (husband|wife|partner|spouse) and (i|me)|(me|i) and my (husband|wife|partner|spouse)|the two of us|just us two)\b/.test(text)) { p.couples += 1; }
    else if (/\ba couple\b/.test(text) && !/\ba couple of\b/.test(text)) { p.couples += 1; }
    while ((m = re(NUM + '\\s+(adults?|grown-?ups?|grownups?)\\b').exec(text))) { p.adults += num(m[1]); explicitAdults = true; text = text.replace(m[0], ' '); }
    while ((m = re(NUM + '\\s+(toddlers?)\\b').exec(text))) { for (var t = 0; t < num(m[1]); t += 1) p.kids.push(2); text = text.replace(m[0], ' '); }
    while ((m = re(NUM + '\\s+(kids?|children|child|teens?|teenagers?|boys?|girls?|little ones?|youngsters?)\\b').exec(text))) { for (var k = 0; k < num(m[1]); k += 1) p.kids.push(null); text = text.replace(m[0], ' '); }
    while ((m = re(NUM + '?\\s*(babies|baby|infants?|newborns?)\\b').exec(text))) { p.infants += num(m[1]) || 1; text = text.replace(m[0], ' '); }
    /* ages: "ages 2, 6 and 9", "(2, 6, 9)", "a 4 year old", "4yo" */
    var ages = [];
    var ageList = text.match(/\bages?\s*(?:are|of|:)?\s*((?:\d{1,2}\s*(?:,|and|\/|\s)\s*)*\d{1,2})/);
    if (ageList) { ageList[1].split(/[^\d]+/).forEach(function (a) { if (a) ages.push(Number(a)); }); }
    var parenRe = re('\\((\\d{1,2}(?:\\s*(?:,|and)\\s*\\d{1,2})+)\\)');
    while ((m = parenRe.exec(text))) { m[1].split(/[^\d]+/).forEach(function (a) { if (a) ages.push(Number(a)); }); }
    var yearRe = re('\\b(\\d{1,2})\\s*(?:-|\\s)?(?:year|yr|y)s?[\\s-]*(?:old|o)\\b');
    while ((m = yearRe.exec(text))) { ages.push(Number(m[1])); }
    ages = ages.filter(function (a) { return a >= 0 && a <= 17; });
    if (ages.length) {
      var unknown = p.kids.filter(function (a) { return a === null; }).length;
      if (p.kids.length === 0) { p.kids = ages.slice(); }
      else { var ai = 0; p.kids = p.kids.map(function (a) { return a === null && ai < ages.length ? ages[ai++] : a; }); if (ages.length > unknown) { ages.slice(unknown).forEach(function (a) { p.kids.push(a); }); } }
    }
    /* named adults when no explicit adult count */
    if (!explicitAdults) {
      var named = 0;
      if (/\bgrandparents\b|\bin-?laws\b|\bmy parents\b|\bour parents\b/.test(text)) named += 2;
      else if (/\bgrandma\b|\bgrandmother\b|\bnana\b|\bgrandpa\b|\bgrandfather\b|\bmy mom\b|\bmy dad\b|\bmy mother\b|\bmy father\b|\bmother-in-law\b|\bfather-in-law\b/.test(text)) named += 1;
      p.adults += named;
    }
    if (p.adults + p.couples + p.kids.length + p.infants === 0) {
      var bare = text.match(new RegExp(NUM + '\\s*(?:people|persons?|guests|of us|total|in total|adults? and kids|travellers|travelers)\\b')) || text.match(new RegExp('\\b' + NUM + '\\b'));
      if (bare) p.adults = num(bare[1]);
    }
    if (/\b(dogs?|puppy|puppies|pets?|cats?|kitten)\b/.test(text)) { p.pet = true; var w = text.match(/(\d{1,3})\s*(?:lb|lbs|pounds?)\b/); p.petNote = (/\b(small|little|tiny)\b/.test(text) && !w ? 'small ' : '') + (/\bcats?\b|\bkitten\b/.test(text) ? 'cat' : 'dog') + (w ? ' of about ' + w[1] + ' lb' : ''); }
    if (/\b(wheelchair|walker|stairs?|steps?|mobility|accessib|handicap|cane|hip|knee)\b/.test(text)) p.mobility = true;
    if (/\b(boat|trailer|jet ?skis?|center console|kayaks?|rv)\b/.test(text)) p.boat = true;
    if (/\b(crib|pack ?n ?play|pack and play|travel cot|cot)\b/.test(text) || p.infants > 0) p.crib = true;
    return finish(p);
    function finish(q) {
      q.adults = clamp(q.adults); q.couples = clamp(q.couples); q.infants = clamp(q.infants); q.kids = q.kids.slice(0, 40);
      q.adultsTotal = q.adults + q.couples * 2; q.total = q.adultsTotal + q.kids.length + q.infants;
      return q;
    }
  }
  function describeParty(p) {
    var bits = [];
    if (p.couples) bits.push(p.couples + (p.couples === 1 ? ' couple' : ' couples'));
    if (p.adults) bits.push(p.adults + (p.adults === 1 ? ' adult' : ' adults'));
    if (p.kids.length) { var known = p.kids.filter(function (a) { return a !== null; }); bits.push(p.kids.length + (p.kids.length === 1 ? ' child' : ' children') + (known.length ? ' (' + (known.length === 1 ? 'age ' : 'ages ') + known.join(', ') + ')' : '')); }
    if (p.infants) bits.push(p.infants + (p.infants === 1 ? ' infant' : ' infants'));
    if (p.pet) bits.push('a ' + (p.petNote || 'pet'));
    return bits.length ? bits.join(', ') : 'nobody yet';
  }

  return { parseParty: parseParty, describeParty: describeParty, num: num, NUM: NUM };
});
