"use strict";
// Cards for catalog pieces no page uses yet (docs/design/component-patterns.md).
// Each renders the piece's real partial from src/_includes with fixture data, so the
// card is the markup a page would get. Split out of build.js for the size gate.
const path = require("path");
const nunjucks = require("nunjucks");

module.exports = function patternCards({ card, read, inlined }) {
  const env = new nunjucks.Environment(new nunjucks.FileSystemLoader(path.resolve(__dirname, "../../../src/_includes")), { autoescape: true });
  const island = JSON.parse(read("src/_data/islandOutline.json"));
  const { places } = JSON.parse(read("scripts/design/design-sync/island-places.fixture.json"));
  const render = (call) => env.renderString(`{% import "partials/island-locator.njk" as isl %}${call}`, { island, places });

  // A planning guide's body classes and sheets, in the order the guide layout loads them.
  const css = [inlined("planning-guide"), inlined("guest"), inlined("island-locator"), ".ds-isl{padding:24px 20px;max-width:504px}.ds-isl h2{margin:32px 0 8px;font:500 12px/1.4 Poppins,sans-serif;letter-spacing:.13em;text-transform:uppercase;color:#52676A}.ds-isl p{margin:0 0 16px;font-size:14px;line-height:1.5;color:#52676A}.ds-isl-row{display:flex;gap:24px}"];
  const body = `<main><div class="ds-isl">
<h2>Key map</h2><p>Opens a guide about places. Each name links to its section.</p>
${render("{{ isl.islandMap(island, places) }}")}
<h2>Inset</h2><p>One place lit, beside that place's facts. Shown for places 01 and 03.</p>
<div class="ds-isl-row">${render("{{ isl.islandInset(island, places, 1) }}")}${render("{{ isl.islandInset(island, places, 3) }}")}</div>
</div></main>`;
  const shared = { group: "Components", css, bodyClass: "guest-shell planning-guide", body };
  card({ ...shared, file: "island-locator.html", name: "Island locator", subtitle: "Explored · no page uses it yet · static markup, no script", viewport: [1200, 1200] });
  card({ ...shared, file: "island-locator-phone.html", name: "Island locator (phone)", subtitle: "393px · the key becomes rows beside the island", viewport: [393, 900] });
};
