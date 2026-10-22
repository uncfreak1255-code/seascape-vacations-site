"use strict";

// Group-fit planner: party parsing and bed assignment stay truthful to
// src/_data property facts. Phrasings mirror how guests actually write in
// pre-booking inquiries ("4 adults and 3 kids", "my husband and I", ages in
// parentheses). The planner never states availability or price.

const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");

const fit = require(path.join(__dirname, "..", "..", "src", "assets", "js", "group-fit.js"));
const fallback = require(path.join(__dirname, "..", "..", "src", "_data", "properties-fallback.json"));
const list = Array.isArray(fallback) ? fallback : fallback.properties || Object.values(fallback);
const homes = list.map((p) => ({
  slug: p.slug,
  name: p.name,
  guests: p.guests,
  amenities: p.amenities || [],
  sleeping: (p.guestFacts && p.guestFacts.sleeping) || [],
  pets: p.guestFacts && p.guestFacts.pets,
  poolHeat: p.guestFacts && p.guestFacts.poolHeat,
  extraGuestsAbove: p.guestFacts && p.guestFacts.extraGuestsAbove,
  confirmGuestsAbove: p.guestFacts && p.guestFacts.confirmGuestsAbove,
}));
const bySlug = (slug) => homes.find((h) => h.slug === slug);

test("a couple consumes two spaces and young children never overflow occupied beds", () => {
  const r = fit.assign(fit.parseParty("2 couples and 5 kids (2, 3, 4, 5, 5)"), bySlug("coastal-stay"));
  assert.equal(r.verdict, "confirm");
  assert.equal(r.unplaced.length, 2);
  assert.ok(r.notes.some(n => n.kind === "beds" && /sleep 7 of your 9/.test(n.text)));
  for (const room of r.rooms) for (const line of room.lines) {
    assert.ok(!(/Couple/.test(line) && /Child/.test(line)), line);
  }
});

test("bed shortfall counts both members of an unplaced couple", () => {
  const home = { slug: "fixture", name: "Fixture", guests: 6, sleeping: ["Bedroom 1: one king bed"] };
  const r = fit.assign(fit.parseParty("2 couples"), home);
  assert.equal(r.verdict, "confirm");
  assert.ok(r.notes.some(n => n.kind === "beds" && /sleep 2 of your 4/.test(n.text)));
});

test("every listed bedroom parses into at least one bed, and a bed shortfall against capacity is surfaced as a confirm note, not hidden", () => {
  for (const home of homes) {
    let sleepers = 0;
    home.sleeping.forEach((room, i) => {
      const beds = fit.parseBeds(room, i);
      assert.ok(beds.length > 0, `${home.name}: "${room}" produced no beds`);
      sleepers += beds.reduce((n, b) => n + b.cap, 0);
    });
    const full = fit.assign(fit.parseParty(`${home.guests} adults`), home);
    if (sleepers >= home.guests) {
      assert.notEqual(full.verdict, "over", `${home.name}: capacity group should not be over`);
    } else {
      assert.equal(full.verdict, "confirm", `${home.name}: beds sleep ${sleepers} < capacity ${home.guests}, must ask`);
      assert.ok(full.notes.some((n) => n.kind === "beds"), `${home.name}: shortfall note missing`);
    }
  }
});

test("bed phrases map to the right units", () => {
  const kinds = (s) => fit.parseBeds(s, 0).map((b) => b.kind + ":" + b.cap).join(",");
  assert.equal(kinds("Bedroom 1: two twin-over-full bunk beds"), "bunk-full:2,bunk-twin:1,bunk-full:2,bunk-twin:1");
  assert.equal(kinds("two twin-over-twin bunk beds"), "bunk-twin:1,bunk-twin:1,bunk-twin:1,bunk-twin:1");
  assert.equal(kinds("Bedroom 4: one full-over-full bunk with a twin trundle, plus a sleeper sofa"), "bunk-full:2,bunk-full:2,trundle:1,sofa:2");
  assert.equal(fit.parseBeds("Bedroom 2: one queen bed and one sofa bed", 0).map((b) => b.label).join(","), "queen bed,sofa bed");
  assert.equal(kinds("Bedroom 3: one king bed and a crib"), "king:2,crib:0");
  assert.equal(kinds("Bedroom 4: three queen beds in a bunk configuration"), "bunk-queen:2,bunk-queen:2,bunk-queen:2");
  assert.equal(kinds("Bedroom 1: one king bed with ensuite bathroom"), "king:2");
});

test("guest phrasings parse into the party they describe", () => {
  const cases = [
    ["4 adults and 3 kids", { adultsTotal: 4, kids: 3, infants: 0, pet: false }],
    ["We will be 6 adults", { adultsTotal: 6, kids: 0 }],
    ["2 couples and 4 children (3, 6, 9, 12)", { adultsTotal: 4, kids: 4, ages: [3, 6, 9, 12] }],
    ["My husband and I, our 2 kids ages 4 and 7, and a small dog", { adultsTotal: 2, kids: 2, ages: [4, 7], pet: true }],
    ["three couples plus grandma", { adultsTotal: 7, kids: 0 }],
    ["8 of us", { adultsTotal: 8 }],
    ["2 adults, 1 toddler and a baby", { adultsTotal: 2, kids: 1, infants: 1, crib: true }],
    ["5 adults, my mom uses a walker", { adultsTotal: 5, mobility: true }],
    ["4 adults and 2 teens, bringing our boat", { adultsTotal: 4, kids: 2, boat: true }],
    ["", { total: 0 }],
  ];
  for (const [text, want] of cases) {
    const p = fit.parseParty(text);
    for (const key of Object.keys(want)) {
      if (key === "kids") assert.equal(p.kids.length, want.kids, `${text}: kids`);
      else if (key === "ages") assert.deepEqual(p.kids.filter((a) => a !== null).sort((a, b) => a - b), want.ages, `${text}: ages`);
      else assert.equal(p[key], want[key], `${text}: ${key}`);
    }
  }
});

test("a family of 4 adults and 3 kids fits Dockside Dreams with adults in kings and kids in the bunk room", () => {
  const r = fit.assign(fit.parseParty("4 adults and 3 kids (5, 8, 11)"), bySlug("dockside-dreams"));
  assert.equal(r.verdict, "fits");
  assert.equal(r.unplaced.length, 0);
  const bunkRoom = r.rooms.find((x) => x.room === "Bedroom 1");
  assert.ok(bunkRoom, "kids should land in the bunk room");
  assert.ok(bunkRoom.lines.every((l) => /Child/.test(l)), "only children in the bunk room");
  assert.ok(r.notes.some((n) => n.kind === "pool"), "pool heat terms are restated from property truth");
});

test("a 16-guest group fits The Oasis and is flagged for additional-guest charges above 12", () => {
  const r = fit.assign(fit.parseParty("8 adults and 8 kids"), bySlug("the-oasis"));
  assert.equal(r.verdict, "fits");
  assert.equal(r.unplaced.length, 0);
  assert.ok(r.notes.some((n) => n.kind === "fee" && /above 12/.test(n.text)));
});

test("Sarasota Luxe asks for confirmation above 8 guests and does not place anyone over 12", () => {
  assert.equal(fit.assign(fit.parseParty("10 adults"), bySlug("sarasota-luxe")).verdict, "confirm");
  const over = fit.assign(fit.parseParty("13 adults"), bySlug("sarasota-luxe"));
  assert.equal(over.verdict, "over");
  assert.ok(over.notes.some((n) => n.kind === "capacity"));
});

test("pet answers come from each home's own policy text, never invented", () => {
  const party = fit.parseParty("2 adults and a 20 lb dog");
  const dockside = fit.assign(party, bySlug("dockside-dreams")).notes.find((n) => n.kind === "pet");
  const oasis = fit.assign(party, bySlug("the-oasis")).notes.find((n) => n.kind === "pet");
  assert.equal(dockside.text, bySlug("dockside-dreams").pets.text);
  assert.equal(oasis.text, bySlug("the-oasis").pets.text);
});

test("unknowns are stated as unknown: access details and dock availability", () => {
  const party = fit.parseParty("4 adults, grandpa can't do stairs, we have a boat");
  const dockside = fit.assign(party, bySlug("dockside-dreams"));
  const river = fit.assign(party, bySlug("river-house"));
  assert.ok(dockside.notes.some((n) => n.kind === "access" && /not published/.test(n.text)));
  assert.ok(dockside.notes.some((n) => n.kind === "boat" && /private dock/.test(n.text)));
  assert.ok(river.notes.some((n) => n.kind === "boat" && /No dock/.test(n.text)));
});

test("ranking puts homes that fit ahead of homes that need confirmation and over-capacity homes", () => {
  const ranked = fit.rank(fit.parseParty("5 couples and 4 kids"), homes);
  const order = ranked.map((r) => r.verdict);
  const firstOver = order.indexOf("over");
  assert.ok(firstOver === -1 || order.slice(firstOver).every((v) => v === "over"), "over-capacity homes sort last");
  assert.equal(ranked[0].verdict === "fits" || ranked[0].verdict === "confirm", true);
});

test("no result text ever states availability or a price", () => {
  const ranked = fit.rank(fit.parseParty("3 adults and 2 kids and a dog"), homes);
  const text = JSON.stringify(ranked);
  // Property truth may itself quote an optional-extra fee (pool heat); the planner adds no number of its own.
  const ownText = ranked.map((r) => r.notes.filter((n) => n.kind !== "pool" && n.kind !== "pet").map((n) => n.text).join(" ")).join(" ") + JSON.stringify(ranked.map((r) => r.rooms));
  assert.doesNotMatch(ownText, /\bavailable\b|\$\d|\bper night\b|\bnightly\b/i);
});

test("a child under 6 is never assigned a top bunk", () => {
  for (const home of homes) {
    const r = fit.assign(fit.parseParty("2 adults, 1 toddler and a 4 year old"), home);
    const lines = r.rooms.flatMap((x) => x.lines);
    for (const line of lines) {
      if (/Child, [2-5]\b/.test(line)) assert.doesNotMatch(line, /top /, `${home.name}: ${line}`);
    }
  }
});

test("a confirm note never prints an undefined threshold", () => {
  for (const home of homes) {
    for (const text of ["10 adults", "11 adults", "12 adults", "16 adults"]) {
      const r = fit.assign(fit.parseParty(text), home);
      for (const n of r.notes) assert.doesNotMatch(n.text, /undefined|null|NaN/, `${home.name}: ${n.text}`);
    }
  }
});
