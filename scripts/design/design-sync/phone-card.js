"use strict";
// The phone surfaces card: real header, catalog card and trip form at 393px with
// the live trip-sheet.css, whose 700px-and-narrower blocks carry the phone rules
// in docs/design/cards-and-phone-surfaces.md. Split out of build.js so that file
// stays under the staged-file size gate.
module.exports = function phoneCard({ card, GUEST, catalogCss, catalogCardCss, tripSheetCss, headerPaper, catalogCard, homeTrip, arrivalCss }) {
  card({
    file: "phone-surfaces.html",
    group: "Components",
    name: "Phone surfaces (700px and narrower)",
    subtitle: "393px · white canvas · 16px photos · 12px controls · pill toggles",
    viewport: [393, 1160],
    css: [...GUEST, arrivalCss, catalogCss, catalogCardCss, tripSheetCss],
    body: `${headerPaper}
<div class="g-wrap" style="padding:20px 0"><p class="g-label">Phones, 700px and narrower</p><p class="g-small">White canvas, 16px photo corners, 12px buttons and fields, pill toggles and chips; the search pill, Compare and the header phone button sit on a soft shadow ring. Rules in waterline/cards-and-phone-surfaces.md; CSS in waterline/trip-sheet.css.</p></div>
<div class="catalog-page"><div class="catalog-grid">${catalogCard}</div></div>
<div class="g-wrap">${homeTrip}</div>`,
  });
};
