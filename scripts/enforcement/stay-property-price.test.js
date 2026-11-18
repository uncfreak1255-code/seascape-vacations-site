const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const nunjucks = require("nunjucks");

const root = path.resolve(__dirname, "../..");
const env = new nunjucks.Environment(
  new nunjucks.FileSystemLoader(path.join(root, "src/_includes"))
);

test("stay cards show a starting price only for positive rates", () => {
  const render = (price) => env.render("partials/stay-property-price.njk", { property: { price } });
  assert.match(render(450), /From \$450\/night/);
  for (const price of [0, null, undefined, -1]) {
    assert.match(render(price), /Check rates for your dates/);
    assert.doesNotMatch(render(price), /\/night/);
  }
});

const guide = path.join(root, "_site/stays/vacation-rentals-with-pool-and-hot-tub/index.html");
test("built pool guide does not advertise zero-dollar nightly rates", { skip: !fs.existsSync(guide) }, () => {
  const html = fs.readFileSync(guide, "utf8");
  assert.doesNotMatch(html, /From \$0(?:\.00)?\/night/);
  const blocks = [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)];
  const offers = blocks.flatMap(([, raw]) => {
    const data = JSON.parse(raw);
    return (data["@graph"] || [data]).flatMap((node) =>
      (node.itemListElement || []).map((entry) => entry.item?.offers).filter(Boolean));
  });
  assert.ok(offers.length > 0, "positive-price offers should still be present");
  assert.ok(offers.every((offer) => Number(offer.price) > 0), "no zero-dollar schema offers");
});
