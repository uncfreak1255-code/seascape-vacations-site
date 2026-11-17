const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const assert = require("node:assert/strict");

const source = fs.readFileSync(path.resolve(__dirname, "../../src/guides/best-waterfront-restaurants-with-boat-dock.html"), "utf8");
const text = (value) => value.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").trim();

test("dock-and-dine guide replaces demolished, closed and inland venues", () => {
  for (const obsolete of ["Seafood Shack", "Rod and Reel Pier", "Caddy's Bradenton"]) {
    assert.ok(!source.includes(obsolete), `${obsolete} must not be recommended for boat arrival`);
  }
  for (const replacement of ["Swordfish Grill &amp; Tiki Bar", "Riverhouse Waterfront Restaurant", "Dry Dock Waterfront Grill"]) {
    assert.ok(source.includes(`<h3>${replacement}</h3>`), `${replacement} must have a restaurant card`);
  }
});

test("comparison table covers the same restaurants without unverified depth promises", () => {
  const cards = [...source.matchAll(/<h3>(.*?)<\/h3>/g)].map((match) => text(match[1])).sort();
  const rows = [...source.matchAll(/<td data-label="Restaurant">(.*?)<\/td>/g)].map((match) => text(match[1])).sort();
  assert.equal(cards.length, 7);
  assert.deepEqual(rows, cards);
  assert.ok(!source.includes("Dock Depth"), "arrival advice must not promise an unverified depth");
});
