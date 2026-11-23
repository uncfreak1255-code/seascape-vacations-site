"use strict";
// Cards for catalog pieces no page uses yet (docs/design/component-patterns.md).
// Each renders the piece's real partial from src/_includes with fixture data, so the
// card is the markup a page would get. Split out of build.js for the size gate.
const partialEnv = require("./partial-env");

module.exports = function patternCards({ card, read, inlined }) {
  const env = partialEnv();
  const island = JSON.parse(read("src/_data/islandOutline.json"));
  const { places } = JSON.parse(read("scripts/design/design-sync/island-places.fixture.json"));
  const facts = JSON.parse(read("scripts/design/design-sync/fact-strip.fixture.json"));
  const prose = JSON.parse(read("scripts/design/design-sync/disclosure.fixture.json"));
  const imports = '{% import "partials/island-locator.njk" as isl %}{% import "partials/fact-strip.njk" as fs %}{% import "partials/disclosure.njk" as dsc %}';
  const render = (call, data) => env.renderString(imports + call, { island, places, ...data });

  // A planning guide's body classes and sheets, in the order the guide layout loads them.
  const guide = [inlined("planning-guide"), inlined("guest")];
  const shared = { group: "Components", bodyClass: "guest-shell planning-guide" };

  const islCss = [...guide, inlined("island-locator"), ".ds-isl{padding:24px 20px;max-width:544px}.ds-isl h2{margin:32px 0 8px;font:500 12px/1.4 Poppins,sans-serif;letter-spacing:.13em;text-transform:uppercase;color:#52676A}.ds-isl p{margin:0 0 16px;font-size:14px;line-height:1.5;color:#52676A}.ds-isl-row{display:flex;gap:24px}"];
  const islBody = `<main><div class="ds-isl">
<h2>Key map</h2><p>Opens a guide about places. Each name links to its section.</p>
${render("{{ isl.islandMap(island, places) }}")}
<h2>Inset</h2><p>One place lit, beside that place's facts. Shown for places 01 and 03.</p>
<div class="ds-isl-row">${render("{{ isl.islandInset(island, places, 1) }}")}${render("{{ isl.islandInset(island, places, 3) }}")}</div>
</div></main>`;
  card({ ...shared, css: islCss, body: islBody, file: "island-locator.html", name: "Island locator", subtitle: "Explored · no page uses it yet · static markup, no script", viewport: [1200, 1220] });
  card({ ...shared, css: islCss, body: islBody, file: "island-locator-phone.html", name: "Island locator (phone)", subtitle: "393px · the key becomes rows beside the island", viewport: [393, 900] });

  // Fact strip and disclosure: each sample sits in a guide section, under its numeral and heading,
  // in the guide's own column, so the guide's rules and the piece's meet as they would on a page.
  // The card chrome owns .ds-note and loads after a card's own css, so the sample label has its own class.
  const sampleNote = ".ds-sample-note{margin:0;padding:32px 0 12px;font:500 12px/1.4 Poppins,sans-serif;letter-spacing:.13em;text-transform:uppercase;color:#52676A}";
  const stripCss = [...guide, inlined("fact-strip"), sampleNote];
  const panelCss = [...guide, inlined("island-locator"), inlined("fact-strip"), sampleNote];
  const step = (n, title, note, inner) => `${note ? `<p class="ds-sample-note">${note}</p>` : ""}<section class="pg-step" id="pg-${n}"><p class="pg-num">0${n}</p><h2>${title}</h2>${inner}</section>`;
  const strip = (key) => render("{{ fs.factStrip(f) }}", { f: facts[key] });
  const panel = (key, own) => render(`{% call fs.factPanel(f) %}{{ isl.islandInset(island, places, ${own}) }}{% endcall %}`, { f: facts[key] });
  const column = (inner) => `<main><div class="pg-body"><div class="pg-steps">${inner}</div></div></main>`;
  const stripBody = column(`
${step(1, "Bean Point Beach: The Locals-only find", "Strip · three facts", strip("three"))}
${step(4, "Holmes Beach", "Strip · two facts", strip("two"))}
${step(5, "Bradenton Beach", "Strip · one fact", strip("one"))}`);
  const panelBody = column(`
${step(1, "Bean Point Beach: The Locals-only find", "Panel · a figure beside three facts", panel("three", 1))}
${step(4, "Holmes Beach", "Panel · two facts, one holding a link", panel("linked", 4))}
${step(5, "Bradenton Beach", "Panel · one fact", panel("one", 5))}`);
  const unused = "Explored · no page uses it yet · static markup, no script";
  card({ ...shared, css: stripCss, body: stripBody, file: "fact-strip.html", name: "Fact strip", subtitle: unused, viewport: [1200, 1265] });
  card({ ...shared, css: stripCss, body: stripBody, file: "fact-strip-phone.html", name: "Fact strip (phone)", subtitle: "393px · facts stack as ruled rows", viewport: [393, 1367] });
  card({ ...shared, css: panelCss, body: panelBody, file: "fact-panel.html", name: "Fact strip, panel form", subtitle: unused, viewport: [1200, 1760] });
  card({ ...shared, css: panelCss, body: panelBody, file: "fact-panel-phone.html", name: "Fact strip, panel form (phone)", subtitle: "393px · rows beside the figure", viewport: [393, 1607] });

  // Disclosure: the row under a section's facts, holding that section's prose. The first two
  // sections follow each other with no label between, so the second one's rule closes the first
  // one's row. The second row is opened here, in the card; the partial always prints a closed row.
  const dscCss = [...panelCss, inlined("disclosure")];
  const more = (key, args = "") => render(`{% call dsc.disclosure(label${args}) %}{{ body | safe }}{% endcall %}`, { label: prose.label, body: prose[key] });
  const opened = (html) => {
    const out = html.replace("<details ", "<details open ");
    if (out === html) throw new Error("disclosure card: the macro printed no <details> to open");
    return out;
  };
  const dscBody = column(`
${step(1, "Bean Point Beach: The Locals-only find", "Ends a section, under a fact panel · closed, then open", panel("three", 1) + more("beanPoint", ", ends=true"))}
${step(4, "Holmes Beach", "", panel("linked", 4) + opened(more("holmes", ", ends=true")))}
${step(5, "Bradenton Beach", "Inside a section · keeps its bottom rule", strip("one") + more("bradenton"))}`);
  card({ ...shared, css: dscCss, body: dscBody, file: "disclosure.html", name: "Disclosure", subtitle: "Explored · no page uses it yet · native details, no script", viewport: [1200, 1768] });
  card({ ...shared, css: dscCss, body: dscBody, file: "disclosure-phone.html", name: "Disclosure (phone)", subtitle: "393px · the whole row is the target", viewport: [393, 1861] });
};
