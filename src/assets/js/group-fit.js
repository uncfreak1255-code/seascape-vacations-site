/* Group-fit planner: who is coming -> which home fits, bed by bed.
 * Sentence parsing lives in group-fit-party.js (loaded first).
 * Deterministic over property truth (guestFacts.sleeping, pets, poolHeat,
 * capacity thresholds). The only interpretation step is parseParty(); it is a
 * local parser with a replaceable hook (SeascapeGroupFit.parse) so a typed
 * model judgment can take over messy sentences later without touching the
 * bed logic. Never states availability or price. Progressive enhancement: the
 * guests <select> and the trip form remain the complete no-script path. */
(function (root, factory) {
  'use strict';
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.SeascapeGroupFit = api;
  if (typeof document !== 'undefined' && document.querySelector) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { api.mount(document); });
    else api.mount(document);
  }
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';
  var partyApi = (typeof require === 'function' && typeof module === 'object') ? require('./group-fit-party.js') : (typeof window !== 'undefined' ? window.SeascapeGroupFitParty : globalThis.SeascapeGroupFitParty);
  var parseParty = partyApi.parseParty, describeParty = partyApi.describeParty;
  var num = partyApi.num, NUM = partyApi.NUM;
  /* ---------- beds ---------- */
  var ORDER = ['king', 'queen', 'full', 'bunk-queen', 'bunk-full', 'sofa', 'bunk-twin', 'twin', 'trundle'];
  function unit(room, kind, cap, label, top) { return { room: room, kind: kind, cap: cap, label: label, top: !!top, rank: ORDER.indexOf(kind), used: [] }; }
  function parseBeds(roomText, index) {
    var text = String(roomText || '').toLowerCase();
    var room = (text.match(/^(bedroom \d+)/) || [])[1] || ('room ' + (index + 1));
    room = room.replace(/^\w/, function (c) { return c.toUpperCase(); });
    text = text.replace(/^bedroom \d+:\s*/, '');
    var out = [];
    text.split(/\s*(?:,|\band\b|\bplus\b|\bwith\b)\s*/).forEach(function (phrase) {
      if (!phrase) return;
      var n = num((phrase.match(new RegExp('^' + NUM + '\\b')) || [])[1]) || 1;
      var i;
      if (/crib/.test(phrase)) { for (i = 0; i < n; i += 1) out.push(unit(room, 'crib', 0, 'crib')); return; }
      if (/twin-over-full/.test(phrase)) { for (i = 0; i < n; i += 1) { out.push(unit(room, 'bunk-full', 2, 'bottom full bunk')); out.push(unit(room, 'bunk-twin', 1, 'top twin bunk', true)); } return; }
      if (/full-over-full/.test(phrase)) { for (i = 0; i < n; i += 1) { out.push(unit(room, 'bunk-full', 2, 'bottom full bunk')); out.push(unit(room, 'bunk-full', 2, 'top full bunk', true)); } return; }
      if (/twin-over-twin/.test(phrase)) { for (i = 0; i < n; i += 1) { out.push(unit(room, 'bunk-twin', 1, 'bottom twin bunk')); out.push(unit(room, 'bunk-twin', 1, 'top twin bunk', true)); } return; }
      if (/queen/.test(phrase) && /bunk/.test(phrase)) { for (i = 0; i < n; i += 1) out.push(unit(room, 'bunk-queen', 2, 'queen bunk')); return; }
      if (/trundle/.test(phrase)) { for (i = 0; i < n; i += 1) out.push(unit(room, 'trundle', 1, 'twin trundle')); return; }
      if (/sleeper sofa|sofa bed|sofa-bed|pull-?out/.test(phrase)) { for (i = 0; i < n; i += 1) out.push(unit(room, 'sofa', 2, /sleeper sofa/.test(phrase) ? 'sleeper sofa' : 'sofa bed')); return; }
      if (/\bking\b/.test(phrase)) { for (i = 0; i < n; i += 1) out.push(unit(room, 'king', 2, 'king bed')); return; }
      if (/\bqueen\b/.test(phrase)) { for (i = 0; i < n; i += 1) out.push(unit(room, 'queen', 2, 'queen bed')); return; }
      if (/\bfull\b|\bdouble\b/.test(phrase)) { for (i = 0; i < n; i += 1) out.push(unit(room, 'full', 2, 'full bed')); return; }
      if (/\btwin\b|\bsingle\b/.test(phrase)) { for (i = 0; i < n; i += 1) out.push(unit(room, 'twin', 1, 'twin bed')); return; }
    });
    return out;
  }
  function homeBeds(home) { var all = []; (home.sleeping || []).forEach(function (r, i) { all = all.concat(parseBeds(r, i)); }); return all; }

  /* ---------- assignment ---------- */
  function people(p) {
    var list = [];
    var i;
    for (i = 0; i < p.couples; i += 1) list.push({ kind: 'couple', size: 2, label: 'Couple ' + (i + 1) });
    for (i = 0; i < p.adults; i += 1) list.push({ kind: 'adult', size: 1, label: 'Adult ' + (i + 1) });
    p.kids.slice().sort(function (a, b) { return (b === null ? -1 : b) - (a === null ? -1 : a); }).forEach(function (age, j) { list.push({ kind: 'kid', size: 1, age: age, label: age === null ? 'Child ' + (j + 1) : 'Child, ' + age }); });
    for (i = 0; i < p.infants; i += 1) list.push({ kind: 'infant', size: 0, label: 'Infant ' + (i + 1) });
    return list;
  }
  function free(beds, kinds, slots, noTop) { return beds.filter(function (b) { return kinds.indexOf(b.kind) !== -1 && b.cap - b.used.length >= slots && !(noTop && b.top); }).sort(function (a, b) { return a.rank - b.rank || a.used.length - b.used.length; })[0]; }
  function place(bed, person, note) { bed.used.push(person); person.bed = bed; if (note) person.note = note; }
  function assign(party, home) {
    var beds = homeBeds(home);
    var list = people(party);
    var unplaced = [];
    list.filter(function (x) { return x.kind === 'couple'; }).forEach(function (c) {
      var b = free(beds, ['king', 'queen', 'full', 'bunk-queen'], 2) || free(beds, ['bunk-full', 'sofa'], 2);
      if (b) place(b, c, b.kind === 'sofa' ? 'on a sleeper sofa' : (b.kind === 'bunk-full' ? 'on a bottom bunk' : '')); else unplaced.push(c);
    });
    var singles = list.filter(function (x) { return x.kind === 'adult'; });
    singles.forEach(function (a) {
      var b = beds.filter(function (x) { return ['king', 'queen', 'full', 'bunk-queen'].indexOf(x.kind) !== -1 && x.used.length === 0; }).sort(function (x, y) { return x.rank - y.rank; })[0];
      if (b) place(b, a, ''); else a.pending = true;
    });
    singles.filter(function (a) { return a.pending; }).forEach(function (a) {
      var shareable = beds.filter(function (x) { return ['king', 'queen', 'full', 'bunk-queen'].indexOf(x.kind) !== -1 && x.used.length === 1 && x.used[0].kind === 'adult'; }).sort(function (x, y) { return x.rank - y.rank; })[0];
      var b = shareable || free(beds, ['twin', 'bunk-full'], 1) || free(beds, ['sofa', 'trundle', 'bunk-twin'], 1);
      if (b) place(b, a, shareable ? 'sharing a ' + b.label : (b.kind === 'sofa' ? 'on a sleeper sofa' : 'in the bunk room')); else unplaced.push(a);
    });
    list.filter(function (x) { return x.kind === 'kid'; }).forEach(function (k) {
      var young = k.age !== null && k.age < 6;
      var b = free(beds, ['bunk-twin', 'twin', 'trundle'], 1, young) || free(beds, ['bunk-full', 'bunk-queen', 'sofa'], 1, young) || free(beds, ['full', 'queen', 'king'], 1, young);
      if (!b && young) { var parents = beds.filter(function (x) { return x.used.length && x.used[0].kind !== 'kid' && x.cap >= 2; }).sort(function (x, y) { return x.rank - y.rank; })[0]; if (parents) { parents.used.push(k); k.bed = parents; k.note = 'with ' + parents.used[0].label; return; } }
      if (b) place(b, k, b.used.length > 0 ? 'sharing a ' + b.label : ''); else unplaced.push(k);
    });
    var cribs = beds.filter(function (b) { return b.kind === 'crib'; });
    var infantsNeedingCrib = 0;
    list.filter(function (x) { return x.kind === 'infant'; }).forEach(function (inf, i) { if (cribs[i]) place(cribs[i], inf); else infantsNeedingCrib += 1; });
    var rooms = [];
    beds.forEach(function (b) {
      if (!b.used.length) return;
      var r = rooms.filter(function (x) { return x.room === b.room; })[0];
      if (!r) { r = { room: b.room, lines: [] }; rooms.push(r); }
      r.lines.push(b.used.map(function (x) { return x.label + (x.note ? ' (' + x.note + ')' : ''); }).join(' and ') + ' · ' + b.label);
    });
    var total = party.total;
    var capacity = Number(home.guests || 0);
    var verdict = 'fits';
    if (total === 0) verdict = 'empty';
    else if (capacity && total > capacity) verdict = 'over';
    else if (unplaced.length || (home.confirmGuestsAbove && total > home.confirmGuestsAbove)) verdict = 'confirm';
    var notes = [];
    if (verdict === 'over') notes.push({ kind: 'capacity', text: 'This home hosts up to ' + capacity + ' guests; your group is ' + total + '. Compare the collection or ask about two homes.' });
    else if (unplaced.length) notes.push({ kind: 'beds', text: 'The listed beds sleep ' + (total - unplaced.length) + ' of your ' + total + '. Ask us how the rest of the group sleeps before booking.' });
    if (home.confirmGuestsAbove && total > home.confirmGuestsAbove) notes.push({ kind: 'confirm', text: 'Groups above ' + home.confirmGuestsAbove + ' guests: confirm the group size with us before booking.' });
    if (home.extraGuestsAbove && total > home.extraGuestsAbove) notes.push({ kind: 'fee', text: 'Additional-guest charges apply above ' + home.extraGuestsAbove + ' guests. Include everyone when checking the total.' });
    var shared = list.filter(function (x) { return x.note && /sharing/.test(x.note); }).length;
    var sofa = list.filter(function (x) { return x.note && /sofa/.test(x.note); }).length;
    var adultsInBunks = list.filter(function (x) { return x.kind !== 'kid' && x.note && /bunk/.test(x.note); }).length;
    var petBlocked = party.pet && home.pets && home.pets.status === 'no' ? 1 : 0;
    var boatMiss = party.boat && (home.amenities || []).indexOf('dock') === -1 ? 1 : 0;
    if (party.pet) notes.push({ kind: 'pet', text: home.pets && home.pets.text ? home.pets.text : 'Ask us about pets before booking.' , status: home.pets && home.pets.status });
    if (party.crib) notes.push({ kind: 'crib', text: cribs.length ? (cribs.length + (cribs.length === 1 ? ' crib is listed' : ' cribs are listed') + ' for this home.') : 'No crib is listed for this home. Bring a travel crib or ask us.' });
    if (infantsNeedingCrib && cribs.length) notes.push({ kind: 'crib', text: 'More infants than listed cribs. Ask us.' });
    if (party.mobility) notes.push({ kind: 'access', text: 'We have not published step and access details for this home. Ask us before booking.' });
    if (party.boat) notes.push({ kind: 'boat', text: (home.amenities || []).indexOf('dock') !== -1 ? 'This home has a private dock. Send your boat size with your dates so we can confirm it fits.' : 'No dock at this home. Ask us about trailer parking before booking.' });
    if (home.poolHeat) notes.push({ kind: 'pool', text: home.poolHeat });
    return { slug: home.slug, name: home.name, verdict: verdict, total: total, capacity: capacity, rooms: rooms, unplaced: unplaced.map(function (x) { return x.label; }), notes: notes, shared: shared, sofa: sofa, adultsInBunks: adultsInBunks, petBlocked: petBlocked, boatMiss: boatMiss, beds: beds.length };
  }
  function rank(party, homes) {
    var order = { fits: 0, confirm: 1, over: 2, empty: 3 };
    return homes.map(function (h) { return assign(party, h); }).sort(function (a, b) {
      return order[a.verdict] - order[b.verdict] || (a.petBlocked - b.petBlocked) || (a.boatMiss - b.boatMiss) || (a.sofa - b.sofa) || (a.adultsInBunks - b.adultsInBunks) || (a.shared - b.shared) || ((a.capacity - a.total) - (b.capacity - b.total)) || a.name.localeCompare(b.name);
    });
  }

  /* ---------- DOM ---------- */
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function track(name, extras) {
    try { var t = window.SeascapeConversionTracking; if (t && t.trackEvent) t.trackEvent(name, extras || {}); } catch (e) { /* tracking is optional */ }
  }
  function renderResult(r, opts) {
    var verdictText = { fits: 'Fits', confirm: 'Fits, confirm with us', over: 'Over capacity', empty: '' }[r.verdict];
    var html = '<article class="g-fit-home g-fit-' + r.verdict + '">';
    html += '<header><h3>' + esc(r.name) + '</h3><span class="g-fit-verdict">' + esc(verdictText) + '</span></header>';
    html += '<p class="g-small">Up to ' + r.capacity + ' guests · your group is ' + r.total + '</p>';
    if (r.rooms.length) {
      html += '<details' + (opts.open ? ' open' : '') + '><summary>Who sleeps where</summary><ul class="g-fit-rooms">';
      r.rooms.forEach(function (room) { html += '<li><strong>' + esc(room.room) + '</strong>' + room.lines.map(function (l) { return '<span>' + esc(l) + '</span>'; }).join('') + '</li>'; });
      if (r.unplaced.length) html += '<li class="g-fit-unplaced"><strong>No listed bed</strong><span>' + esc(r.unplaced.join(', ')) + '</span></li>';
      html += '</ul></details>';
    }
    if (r.notes.length) { html += '<ul class="g-fit-notes">' + r.notes.map(function (n) { return '<li class="g-fit-note-' + n.kind + '">' + esc(n.text) + '</li>'; }).join('') + '</ul>'; }
    if (opts.link) html += '<a class="g-inline-link" href="' + esc(opts.link) + '">See ' + esc(r.name) + ' <span aria-hidden="true">→</span></a>';
    html += '</article>';
    return html;
  }
  function mount(doc) {
    var roots = doc.querySelectorAll('[data-group-fit]');
    Array.prototype.forEach.call(roots, function (rootEl) {
      var dataEl = rootEl.querySelector('script[type="application/json"]');
      var homes;
      try { homes = JSON.parse(dataEl.textContent); } catch (e) { return; }
      var form = rootEl.querySelector('form'); var input = rootEl.querySelector('input[type="text"]'); var out = rootEl.querySelector('[data-group-fit-results]'); var echo = rootEl.querySelector('[data-group-fit-echo]');
      if (!form || !input || !out) return;
      rootEl.hidden = false;
      var single = homes.length === 1;
      var store = (function () { try { return window.sessionStorage; } catch (e) { return null; } })();
      var remembered = store && store.getItem('seascape_party');
      if (remembered && !input.value) input.value = remembered;
      function run(fromMemory) {
        var party = api.parse(input.value);
        if (store) { try { if (input.value.trim()) store.setItem('seascape_party', input.value.trim()); } catch (e) { /* storage full or blocked */ } }
        if (echo) echo.textContent = party.total ? 'We read that as: ' + describeParty(party) + '.' + (party.adults >= 2 && !party.couples ? ' Couples? Say "2 couples" and we pair the king beds.' : '') : (input.value.trim() ? 'Tell us how many adults and children, and we will match the beds.' : '');
        if (!party.total) { out.innerHTML = ''; return; }
        var results = rank(party, homes);
        out.innerHTML = results.map(function (r) { return renderResult(r, { open: single, link: single ? '' : ('/properties/' + r.slug + '/?guests=' + Math.min(party.total, 17)) }); }).join('');
        if (!single) {
          var fits = results.filter(function (r) { return r.verdict !== 'over'; }).length;
          out.insertAdjacentHTML('afterbegin', '<p class="g-fit-summary">' + (fits ? fits + ' of ' + results.length + ' homes fit ' + party.total + ' guests.' : 'No single home hosts ' + party.total + ' guests. Ask us about two homes near each other.') + '</p>');
        }
        var guestsSelect = doc.querySelector(rootEl.dataset.guestsSelect || '#trip-guests');
        if (guestsSelect && party.total) { var v = String(Math.min(party.total, 17)); if (Array.prototype.some.call(guestsSelect.options, function (o) { return o.value === v; })) guestsSelect.value = v; }
        if (!fromMemory) track('group_fit_submit', { adults: party.adultsTotal, children: party.kids.length, infants: party.infants, pet: party.pet ? 1 : 0, total: party.total, scope: single ? homes[0].slug : 'collection', top_verdict: results[0].verdict });
      }
      form.addEventListener('submit', function (e) { e.preventDefault(); run(false); });
      if (remembered) run(true);
    });
  }
  var api = { parseBeds: parseBeds, parseParty: parseParty, parse: parseParty, describeParty: describeParty, assign: assign, rank: rank, mount: mount };
  return api;
});
