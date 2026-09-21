#!/usr/bin/env node
"use strict";

/*
 * design-sync build — generate the Claude Design bundle for the Waterline system.
 *
 * WHY THIS EXISTS
 * The Claude Design project "Seascape Vacations Design System" is what Claude Design
 * builds from when it mocks a Seascape surface. It went stale (pre-Waterline teal/gold,
 * Playfair, pill buttons). This script regenerates it from repo truth so the two never
 * drift by hand: DESIGN.md's Waterline block, the live guest CSS, the self-hosted fonts
 * and the real rendered markup of the shared shell and guest components.
 *
 * WHAT IT PRODUCES (into --out, default .design-sync/out, gitignored)
 *   SKILL.md, README.md            entrypoints Claude Design reads first (templates/)
 *   styles.css                     token entry point -> waterline/tokens.css
 *   waterline/tokens.css           generated from DESIGN.md front matter
 *   waterline/fonts.css + fonts/   self-hosted Poppins + Instrument Serif
 *   waterline/*.css                verbatim copies of the live guest stylesheets
 *   waterline/DESIGN.md            verbatim copy of DESIGN.md (visual law)
 *   waterline/design-review-workflow.md, waterline/writing-style-guide.md
 *   preview/*.html                 self-contained cards for the Design System pane,
 *                                  built from the REAL built HTML of the site
 *   _sync-manifest.json            exact writes + deletes for the DesignSync push
 *
 * USAGE
 *   npm run build                                  # or eleventy to a temp dir
 *   node scripts/design/design-sync/build.js --site _site [--out .design-sync/out]
 *   node scripts/design/design-sync/render-check.js   # Playwright proof of every card
 *
 * The push itself is done with the DesignSync tool from Claude Code (list -> finalize_plan
 * -> write_files/delete_files) using _sync-manifest.json. Re-run after any PR that touches
 * DESIGN.md, src/css/{base,guest,arrival,catalog}.css or the guest partials.
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const {
  LIVE_ORIGIN,
  absolutize,
  annotateTokenCss,
  extract,
  loadWaterline,
  parseUiIcons,
  requireScenePhoto,
  resolveOutDir,
  stripFontFace,
  tokenKind,
} = require("./lib");

const ROOT = path.resolve(__dirname, "../../..");
const args = process.argv.slice(2);
const argValue = (flag, fallback) => {
  const i = args.indexOf(flag);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};
const SITE = path.resolve(ROOT, argValue("--site", "_site"));
// The bundle folder is wiped on every build, so it must stay inside the ignored
// .design-sync/ tree; `--out ..` or an absolute path elsewhere is refused.
const { OUT } = resolveOutDir(ROOT, argValue("--out", ".design-sync/out"));
const LIVE = LIVE_ORIGIN;

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}
function readSite(rel) {
  const file = path.join(SITE, rel);
  if (!fs.existsSync(file)) {
    throw new Error(`Built page missing: ${file}. Build the site first (npm run build or eleventy --output).`);
  }
  return fs.readFileSync(file, "utf8");
}
function write(rel, content) {
  const file = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
  writes.push(rel);
}
function copy(relSrc, relOut) {
  const file = path.join(OUT, relOut);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.copyFileSync(path.join(ROOT, relSrc), file);
  writes.push(relOut);
}

const writes = [];
const cards = [];

/* ---------------------------------------------------------------- source truth */
const designMd = read("DESIGN.md");
const wl = loadWaterline(designMd);
const C = wl.colors;
const T = wl.typography;
let commit = "unknown";
try {
  commit = execSync("git rev-parse --short HEAD", { cwd: ROOT }).toString().trim();
} catch (_) {
  /* not a git checkout; fine */
}
const today = new Date().toISOString().slice(0, 10);

/* ---------------------------------------------------------------- css */
const baseCss = read("src/css/base.css");
const guestCss = stripFontFace(read("src/css/guest.css"));
const arrivalCss = read("src/css/arrival.css");
const catalogCss = read("src/css/catalog.css");

const fonts = [
  ["src/assets/fonts/homepage/poppins-400-latin.woff2", "Poppins", 400, "normal"],
  ["src/assets/fonts/homepage/poppins-500-latin.woff2", "Poppins", 500, "normal"],
  ["src/assets/fonts/homepage/poppins-600-latin.woff2", "Poppins", 600, "normal"],
  ["src/assets/fonts/homepage/poppins-700-latin.woff2", "Poppins", 700, "normal"],
  ["src/assets/fonts/guest/instrument-serif.woff2", "Instrument Serif", 400, "normal"],
  ["src/assets/fonts/guest/instrument-serif-italic.woff2", "Instrument Serif", 400, "italic"],
];
// `prefix` is the path from the consuming file to waterline/fonts/.
function fontFace(prefix) {
  return fonts
    .map(([src, family, weight, style]) =>
      `@font-face{font-family:'${family}';font-style:${style};font-weight:${weight};font-display:swap;src:url('${prefix}${path.basename(src)}') format('woff2')}`
    )
    .join("\n");
}

const tokensCss = `/* Generated by scripts/design/design-sync/build.js from DESIGN.md (waterline block)
   at ${today}, commit ${commit}. Do not edit by hand; edit DESIGN.md and re-run the build. */
:root{
  --wl-paper:${C.paper};   /* canvas: sun-warmed paper */
  --wl-ink:${C.ink};       /* text, primary controls, deep marine */
  --wl-citron:${C.citron}; /* selected scene + CTA over photos/dark; never small text on paper */
  --wl-muted:${C.muted};   /* supporting text, hover fill */
  --wl-clay:${C.clay};     /* accent, <em>, active nav, focus ring */
  --wl-rule:${C.rule};     /* 1px rules and borders */
  --wl-soft:${C.soft};     /* quiet solid surface (booking panel) */
  --wl-font-display:'${T.display.fontFamily}',Georgia,serif;
  --wl-font-body:${T.body.fontFamily},sans-serif;
  --wl-display-weight:${T.display.fontWeight};
  --wl-display-lh:${T.display.lineHeight};
  --wl-display-ls:${T.display.letterSpacing};
  --wl-h1:${T.display.h1};
  --wl-body-size:${T.body.fontSize};
  --wl-body-lh:${T.body.lineHeight};
  --wl-label-size:${T.label.fontSize};
  --wl-label-ls:${T.label.letterSpacing};
  --wl-radius-button:${wl.rounded.button};
  --wl-control-min:48px; /* buttons; 44px is the mobile floor (F2) */
}
${fontFace("fonts/")}
`;

/* ---------------------------------------------------------------- card factory */
const chromeCss = `
.ds-doc{padding:32px 36px 40px}
.ds-eyebrow{font:500 12px/1.4 Poppins,sans-serif;letter-spacing:.13em;text-transform:uppercase;color:${C.muted};margin:0 0 10px}
.ds-title{font:400 30px/1.12 'Instrument Serif',Georgia,serif;letter-spacing:-.02em;color:${C.ink};margin:0 0 8px}
.ds-note{font:13px/1.65 Poppins,sans-serif;color:${C.muted};max-width:640px;margin:0 0 24px}
.ds-note strong{color:${C.ink};font-weight:500}
.ds-frame{position:relative;border:1px solid ${C.rule};background:${C.paper};overflow:hidden}
.ds-caption{font:12px/1.5 Poppins,sans-serif;color:${C.muted};margin:8px 0 24px}
.ds-grid{display:grid;gap:12px}
.ds-sw{min-height:124px;padding:14px;display:flex;flex-direction:column;justify-content:space-between;border:1px solid ${C.rule}}
.ds-sw b{font:400 20px 'Instrument Serif',serif;letter-spacing:-.01em}
.ds-sw small{font:12px/1.45 Poppins,sans-serif;display:block}
.ds-row{display:flex;gap:16px;flex-wrap:wrap;align-items:center}
.ds-spec{font:12px/1.5 Poppins,sans-serif;color:${C.muted};min-width:170px}
.ds-line{display:grid;grid-template-columns:190px 1fr;gap:24px;align-items:baseline;padding:18px 0;border-bottom:1px solid ${C.rule}}
.ds-line:last-child{border-bottom:0}
.ds-rule{height:1px;background:${C.rule};margin:24px 0}
`;

function card({ file, group, name, subtitle, viewport, css = [], bodyClass = "guest-site", body, title, eyebrow, note }) {
  const [w, h] = viewport;
  const head = `<!DOCTYPE html>
<!-- @dsCard group="${group}" name="${name}" subtitle="${subtitle}" viewport="${w}x${h}" -->
<html lang="en">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${name}</title>
<style>
${fontFace("../waterline/fonts/")}
${css.join("\n")}
${chromeCss}
</style>
</head>
<body class="${bodyClass}" data-guest-version="design-sync">`;
  const chrome = title
    ? `<div class="ds-doc"><p class="ds-eyebrow">${eyebrow || group}</p><h2 class="ds-title">${title}</h2>${note ? `<p class="ds-note">${note}</p>` : ""}${body}</div>`
    : body;
  write(`preview/${file}`, `${head}\n${chrome}\n</body></html>\n`);
  cards.push({ path: `preview/${file}`, group, name, subtitle, viewport: `${w}x${h}` });
}

/* ---------------------------------------------------------------- built pages */
const home = readSite("index.html");
const catalog = readSite("properties/index.html");
const property = readSite("properties/the-oasis/index.html");

const headerPaper = absolutize(extract(catalog, "g-header"));
const headerHome = absolutize(extract(home, "g-header"));
const footer = absolutize(extract(home, "g-footer"));
const homeTrip = absolutize(extract(home, "g-home-trip"));
const postcards = absolutize(extract(home, "g-postcards"));
const arrival = absolutize(extract(home, "g-arrival"));
const catalogCard = absolutize(extract(catalog, "catalog-card"));
const booking = absolutize(extract(property, "g-booking"));
const mobileBooking = absolutize(extract(property, "g-mobile-booking")).replace(/\shidden(?=[\s>])/, "");
const scenePhoto = requireScenePhoto(home, LIVE);

/* ---------------------------------------------------------------- bundle files */
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

const stamp = (s) => s.replace(/\{\{SYNC_DATE\}\}/g, today).replace(/\{\{COMMIT\}\}/g, commit);
write("SKILL.md", stamp(fs.readFileSync(path.join(__dirname, "templates/SKILL.md"), "utf8")));
write("README.md", stamp(fs.readFileSync(path.join(__dirname, "templates/README.md"), "utf8")));
write("styles.css", `/* Design-system token entry point. Waterline is the only current system (${today}). */\n@import url("waterline/tokens.css");\n`);
write("waterline/tokens.css", tokensCss);
write("waterline/fonts.css", `/* Self-hosted faces, same files the site ships. */\n${fontFace("fonts/")}\n`);
for (const [src] of fonts) copy(src, `waterline/fonts/${path.basename(src)}`);
copy("src/assets/fonts/guest/OFL.txt", "waterline/fonts/OFL-instrument-serif.txt");
copy("DESIGN.md", "waterline/DESIGN.md");
copy("docs/process/design-review-workflow.md", "waterline/design-review-workflow.md");
copy("docs/style/writing-style-guide.md", "waterline/writing-style-guide.md");
write("waterline/base.css", baseCss);
write("waterline/guest.css", `/* Verbatim src/css/guest.css minus @font-face (see fonts.css). */\n${guestCss}`);
write("waterline/arrival.css", arrivalCss);
write("waterline/catalog.css", catalogCss);
write("waterline/shell.html", `<!-- Real shared shell as built at ${commit}. -->\n${headerPaper}\n<main id="main"><!-- page --></main>\n${footer}\n`);

/* ---------------------------------------------------------------- cards */
const GUEST = [baseCss, guestCss];
const swatch = (hex, name, role, dark) =>
  `<div class="ds-sw" style="background:${hex};color:${dark ? "#fff" : C.ink}"><small>${name}</small><div><b>${hex}</b><small>${role}</small></div></div>`;

card({
  file: "colors-brand.html",
  group: "Colors",
  name: "Colors — Waterline palette",
  subtitle: "Paper · ink · citron · muted · clay · rule · soft",
  viewport: [760, 520],
  css: GUEST,
  title: "Seven colours, each with one job",
  note: `Mirrors the <strong>waterline</strong> block in DESIGN.md. Ink on paper clears 10.14:1. Citron is a surface or accent, never small text on paper. Clay is the only warm accent: <em>italic emphasis</em>, active nav, the focus ring.`,
  body: `<div class="ds-grid" style="grid-template-columns:repeat(4,1fr)">
${swatch(C.paper, "Paper", "canvas for every guest route", false)}
${swatch(C.ink, "Ink", "text, primary buttons, dark bands", true)}
${swatch(C.citron, "Citron", "selected scene, CTA over photos/dark", false)}
${swatch(C.muted, "Muted", "supporting text, button hover", true)}
${swatch(C.clay, "Clay", "accent, em, active link, focus ring", true)}
${swatch(C.rule, "Rule", "1px rules, borders, dividers", false)}
${swatch(C.soft, "Soft", "quiet solid surface (booking panel)", false)}
<div class="ds-sw" style="background:#fff"><small>White</small><div><b>#FFFFFF</b><small>button text on ink; postcard stock is #FFFCF4</small></div></div>
</div>`,
});

card({
  file: "colors-retired.html",
  group: "Colors",
  name: "Retired colours (do not use)",
  subtitle: "Pre-Waterline teal, gold and cream · Playfair",
  viewport: [760, 300],
  css: GUEST,
  title: "The old palette is retired",
  note: `These survive only as non-clickable accents on the 51 legacy guide routes and the owner pages until each is migrated. <strong>Do not build a new surface from anything here.</strong> The gold pill CTA measured 2.25:1 white-on-gold and is gone from every button.`,
  body: `<div class="ds-grid" style="grid-template-columns:repeat(6,1fr);opacity:.55">
${swatch("#5F8A8B", "Teal (brand)", "retired", true)}
${swatch("#3D5C5D", "Teal dark", "retired", true)}
${swatch("#C9A962", "Gold", "retired CTA", false)}
${swatch("#F5EED6", "Cream", "retired canvas", false)}
${swatch("#3A3A3A", "Stone", "retired text", true)}
<div class="ds-sw" style="background:#fff"><small>Playfair Display</small><div><b style="font-family:Georgia,serif">Aa</b><small>retired display face; Instrument Serif replaces it</small></div></div>
</div>`,
});

card({
  file: "type-display.html",
  group: "Type",
  name: "Type — Display (Instrument Serif)",
  subtitle: "h1 clamp(46px,5.4vw,78px) · h2 · h3 · caption · quote",
  viewport: [900, 760],
  css: [...GUEST, arrivalCss],
  title: "Instrument Serif, regular only, set large and tight",
  note: `Weight 400, letter-spacing -0.025em, line-height 1.12. Italic carries emphasis and takes clay through <code>em</code>. Large, compact display lines are deliberate; factual text stays readable.`,
  body: `<div class="ds-line"><div class="ds-spec">h1 · clamp(46,5.4vw,78)<br>homepage arrival goes to 166px</div><h1 style="margin:0">Make yourself <em>at home.</em></h1></div>
<div class="ds-line"><div class="ds-spec">h2 · clamp(30,3.3vw,46)</div><h2 style="margin:0">Six real homes. One phone number.</h2></div>
<div class="ds-line"><div class="ds-spec">h3 · 28px<br>postcard title 30px</div><h3 style="margin:0">Dockside Dreams</h3></div>
<div class="ds-line"><div class="ds-spec">scene caption h2 · 37px<br>white over the photo</div><div style="background:${C.ink};padding:18px 22px"><p class="g-label" style="color:#fff;margin:0 0 6px">In the collection · Bradenton, Florida</p><h2 style="color:#fff;font-size:37px;margin:0">The Oasis</h2></div></div>
<div class="ds-line"><div class="ds-spec">review quote · 22/1.35</div><div class="g-review-grid" style="border:0;margin:0"><figure style="border:0;padding:0"><blockquote><p>The pool was the whole trip for the kids. We never left the backyard.</p></blockquote><figcaption>Guest review, Bradenton Pool Home</figcaption></figure></div></div>`,
});

card({
  file: "type-body.html",
  group: "Type",
  name: "Type — Body, labels and controls (Poppins)",
  subtitle: "Body 15/1.65 · label 12 caps .13em · control 500 14 · small 13",
  viewport: [900, 560],
  css: GUEST,
  title: "Poppins does the practical work",
  note: `Body 15px / 1.65 in ink. Labels are 12px uppercase Poppins 500 with .13em tracking in muted; that is the eyebrow pattern and the only tracking in the system. No text renders below 12px anywhere (floor F1).`,
  body: `<div class="ds-line"><div class="ds-spec">.g-label · eyebrow</div><p class="g-label" style="margin:0">Your time on the coast</p></div>
<div class="ds-line"><div class="ds-spec">body · 15/1.65</div><p style="margin:0;max-width:560px">Seascape is a small, owner-operated collection of homes in Bradenton and Sarasota. Choose the home, understand the details that could change your choice, and arrive at the booking page with dates and guest count intact.</p></div>
<div class="ds-line"><div class="ds-spec">.g-small · 13/1.65 muted</div><p class="g-small" style="margin:0">Availability, fees and cancellation terms are confirmed on our secure booking page.</p></div>
<div class="ds-line"><div class="ds-spec">nav link · 14px<br>active = clay + underline</div><nav class="g-nav" style="gap:28px"><a href="#">Our homes</a><a href="#" aria-current="page">Explore the coast</a><a href="#">About Seascape</a></nav></div>
<div class="ds-line"><div class="ds-spec">.g-inline-link · 14/500 underline</div><a class="g-inline-link" href="#">See every home <span aria-hidden="true">&rarr;</span></a></div>
<div class="ds-line"><div class="ds-spec">form label · 12px .05em</div><div><label style="display:block;font-size:12px;letter-spacing:.05em;margin-bottom:8px">Arrival</label><input type="date" style="height:46px;border:0;border-bottom:1px solid ${C.muted};background:transparent;color:${C.ink};border-radius:0;padding:6px 0;font:inherit"></div></div>`,
});

card({
  file: "buttons.html",
  group: "Components",
  name: "Buttons",
  subtitle: "Ink primary · citron on dark · paper on legacy teal · 4px · 48px min",
  viewport: [900, 640],
  css: [...GUEST, `.ds-dark{background:${C.ink};padding:28px}.ds-dark .g-button{background:${C.citron};color:${C.ink};border-color:${C.citron}}.ds-dark .g-button:hover{background:#c3d97a;color:${C.ink}}
.ds-teal{background:linear-gradient(135deg,#5F8A8B,#203F40);padding:28px}.ds-teal .g-button{background:${C.paper};color:${C.ink};border:1px solid ${C.ink}}
.ds-hover{background:${C.muted}!important}.ds-focus{outline:3px solid ${C.clay};outline-offset:4px}`],
  title: "One button, three measured treatments",
  note: `Radius 4px, never a pill. 14px/24px padding, min-height 48px (44px mobile floor). Poppins 500 14px. Hover fills with muted, no lift, no shadow, no shine. Focus is a 3px clay outline offset 4px. <strong>Pick the treatment by measured contrast on its surface, not by eye.</strong>`,
  body: `<p class="ds-caption">Ink with white text on paper, white and photos (10.14:1 on cream). Rest · hover · focus.</p>
<div class="ds-row"><a class="g-button btn-brand" href="#">Find my home</a><a class="g-button btn-brand ds-hover" href="#">Find my home</a><a class="g-button btn-brand ds-focus" href="#">Find my home</a><button class="g-button btn-brand" type="submit">Check dates &amp; total</button></div>
<div class="ds-rule"></div>
<p class="ds-caption">Citron with ink text only where ink loses its own surface: homepage header over the scene photo, the two sticky CTA bars, the near-black owner hero.</p>
<div class="ds-dark ds-row"><a class="g-button btn-brand" href="#">Find your home <span aria-hidden="true">&nearr;</span></a><a class="g-button btn-brand" href="#">Check dates</a></div>
<div class="ds-rule"></div>
<p class="ds-caption">Paper with ink text and a 1px ink hairline on the legacy teal bands (.hero, .cta-section, .cta-shell). Paper clears every gradient stop at 3.45:1; ink and citron do not.</p>
<div class="ds-teal ds-row"><a class="g-button" href="#">Get your free rental estimate</a></div>
<div class="ds-rule"></div>
<p class="ds-caption">Secondary intent is a text link, not a second button.</p>
<div class="ds-row"><a class="g-inline-link" href="#">Compare all six homes <span aria-hidden="true">&rarr;</span></a></div>`,
});

card({
  file: "nav.html",
  group: "Components",
  name: "Guest header",
  subtitle: "Paper state (catalog, property, guides) · over-photo state (homepage)",
  viewport: [1280, 560],
  css: [...GUEST, arrivalCss],
  bodyClass: "guest-site",
  body: `<div class="ds-doc" style="padding:24px 0 0"><p class="ds-eyebrow" style="padding:0 36px">Components · Guest header</p><h2 class="ds-title" style="padding:0 36px">One shell on every page</h2><p class="ds-note" style="padding:0 36px">Floor F5: every built page has exactly one <code>.g-header</code> and one <code>.g-footer</code>. 92px tall on paper, 76px on mobile. The header CTA jumps to the trip form; the phone number is a real link.</p></div>
<p class="ds-caption" style="padding:0 36px">Paper state</p>
<div class="ds-frame" style="border-left:0;border-right:0">${headerPaper}</div>
<p class="ds-caption" style="padding:0 36px;margin-top:20px">Homepage state: absolute over the scene photo, white text, citron CTA</p>
<div class="ds-frame g-homepage" style="height:190px;border-left:0;border-right:0;background:${C.ink} url('${scenePhoto}') center 60%/cover">${headerHome}</div>`,
});

card({
  file: "nav-mobile.html",
  group: "Components",
  name: "Guest header — mobile menu",
  subtitle: "393px · menu open · 44px hit boxes",
  viewport: [393, 520],
  css: [...GUEST, `.g-mobile-menu[hidden]{display:block!important}`],
  body: `${headerPaper.replace('aria-expanded="false"', 'aria-expanded="true"')}<div style="padding:300px 20px 20px"><p class="g-small">Menu shown open. Every link, button and input on mobile has a 44&times;44px hit box (floor F2).</p></div>`,
});

card({
  file: "form-fields.html",
  group: "Components",
  name: "Trip form (dates + guests)",
  subtitle: "Homepage #home-trip section · underline inputs · native date pickers",
  viewport: [1180, 300],
  css: [...GUEST, arrivalCss],
  body: `<div class="g-wrap">${homeTrip}</div>`,
});

card({
  file: "booking-panel.html",
  group: "Components",
  name: "Property booking panel",
  subtitle: "Sticky aside on soft surface · same trip form, property-scoped",
  viewport: [460, 620],
  css: GUEST,
  body: `<div style="padding:20px">${booking}</div>`,
});

card({
  file: "sticky-cta.html",
  group: "Components",
  name: "Mobile sticky booking bar",
  subtitle: "393px · fixed bottom · must not cover form, nav or content",
  viewport: [393, 200],
  css: GUEST,
  body: `<div style="padding:20px 20px 90px"><p class="g-label">Property page, mobile</p><p class="g-small">The bar appears once the booking panel scrolls out of view. Its button is ink on paper here; it becomes citron only over dark surfaces.</p></div>${mobileBooking}`,
});

card({
  file: "property-card.html",
  group: "Components",
  name: "Catalog card",
  subtitle: "Real photo · specs · reason to choose · ink CTA · rule below",
  viewport: [1100, 480],
  css: [...GUEST, catalogCss],
  body: `<div class="catalog-page" style="padding-top:24px"><div class="catalog-grid">${catalogCard}</div></div>`,
});

card({
  file: "postcard-collection.html",
  group: "Components",
  name: "Postcard collection",
  subtitle: "Six homes, shallow fan on desktop, snap list on mobile",
  viewport: [1280, 520],
  css: [...GUEST, arrivalCss, `.g-postcards{animation:none!important}`],
  body: `<div class="g-wrap" style="padding-top:36px"><section class="g-collection g-section" style="padding:0">${postcards}</section></div>`,
});

card({
  file: "scene-hero.html",
  group: "Components",
  name: "Homepage arrival scene",
  subtitle: "Full-bleed real photo · named home · manual scene picker · never auto-rotates",
  viewport: [1280, 900],
  css: [...GUEST, arrivalCss],
  bodyClass: "guest-site g-homepage",
  body: `${headerHome}${arrival}`,
});

card({
  file: "footer.html",
  group: "Components",
  name: "Guest footer",
  subtitle: "Wordmark · contact · explore · where we are · legal",
  viewport: [1280, 420],
  css: GUEST,
  body: footer,
});

card({
  file: "logo.html",
  group: "Brand",
  name: "Wordmark and logo",
  subtitle: "Text wordmark in the shell · PNG marks on paper and ink",
  viewport: [760, 360],
  css: GUEST,
  title: "The wordmark is type, not an image",
  note: `The shell sets <em>seascape</em> in Instrument Serif 30px with VACATIONS in Poppins 500 12px tracked .14em. The PNG logo is for email, documents and social, never inside the site header.`,
  body: `<div class="ds-grid" style="grid-template-columns:1fr 1fr">
<div class="ds-frame" style="padding:28px;display:flex;flex-direction:column;gap:24px;align-items:flex-start"><a class="g-wordmark" href="#" style="color:${C.ink}">seascape<span>VACATIONS</span></a><img src="${LIVE}/logo-optimized.png" alt="Seascape Vacations logo" style="height:64px;width:auto"></div>
<div class="ds-frame" style="padding:28px;background:${C.ink};display:flex;flex-direction:column;gap:24px;align-items:flex-start"><a class="g-wordmark" href="#" style="color:#fff">seascape<span>VACATIONS</span></a><img src="${LIVE}/logo-white-optimized.png" alt="Seascape Vacations logo, white" style="height:64px;width:auto"></div>
</div>`,
});

card({
  file: "radii.html",
  group: "Spacing",
  name: "Radii and surfaces",
  subtitle: "4px controls · square photos · 1px rules · quiet solid surfaces",
  viewport: [760, 300],
  css: GUEST,
  title: "Almost nothing is rounded",
  note: `Buttons and inputs take 4px. Photos are real rectangles, never simulated rooms. Cards are separated by 1px rules, not shadows; the postcard stock is the one lifted surface and its shadow is ink at 11%.`,
  body: `<div class="ds-row" style="align-items:flex-end">
<div class="ds-sw" style="border-radius:4px;background:${C.ink};color:#fff;min-height:96px"><small>Control</small><b>4px</b></div>
<div class="ds-sw" style="border-radius:0;min-height:96px"><small>Photo · card</small><b>0</b></div>
<div class="ds-sw" style="border-radius:0;background:${C.soft};min-height:96px"><small>Panel (soft)</small><b>0 + rule</b></div>
<div class="ds-sw" style="border-radius:0;background:#FFFCF4;border:0;box-shadow:0 20px 32px #173d421c;min-height:96px"><small>Postcard</small><b>shadow</b></div>
<div class="ds-sw" style="border-radius:50%;width:96px;min-height:96px;align-items:center;justify-content:center;border-color:${C.ink}"><b>Seal</b></div>
</div>`,
});

card({
  file: "spacing.html",
  group: "Spacing",
  name: "Layout rhythm",
  subtitle: "1280 wrap · 76/50 sections · 92/76 header · 18/14 form gaps",
  viewport: [760, 360],
  css: GUEST,
  title: "Wide, calm, ruled",
  note: `Content reaches 1280px (<code>min(1280px, 100% - 80px)</code>), 48px gutters under 1050px, 40px on phones. Sections breathe 76px desktop and 50px mobile. Rules do the separating.`,
  body: `<div class="ds-line"><div class="ds-spec">.g-wrap</div><div>min(1280px, 100% − 80px), centred</div></div>
<div class="ds-line"><div class="ds-spec">.g-section</div><div>76px top and bottom · 50px on mobile</div></div>
<div class="ds-line"><div class="ds-spec">.g-header</div><div>92px tall · 76px on mobile · 4.5vw side padding</div></div>
<div class="ds-line"><div class="ds-spec">Form and grid gaps</div><div>18px desktop · 14–16px mobile</div></div>
<div class="ds-line"><div class="ds-spec">Controls</div><div>inputs 46px (44px mobile) · buttons min 48px · 44px is the floor</div></div>
<div class="ds-line"><div class="ds-spec">Test widths</div><div>360 · 375 · 393 · tablet · 1280 desktop · no horizontal scroll at any (F3)</div></div>`,
});

card({
  file: "rules-floors.html",
  group: "Rules",
  name: "Floors F1–F6, truth and photography",
  subtitle: "The contract every change must leave true",
  viewport: [900, 700],
  css: GUEST,
  title: "Design law, enforced by tests",
  note: `These are enforced in <code>tests/visual/design-floors.spec.js</code> and the enforcement scripts. A mock that breaks one is not approvable, however good it looks. Full text in <strong>waterline/DESIGN.md</strong>.`,
  body: `<div class="ds-grid" style="grid-template-columns:1fr 1fr;gap:0 40px">
<div>
<p class="g-label">Floors</p>
<div class="ds-line" style="grid-template-columns:36px 1fr"><b>F1</b><div>No visible text below 12px, desktop or mobile, including eyebrows.</div></div>
<div class="ds-line" style="grid-template-columns:36px 1fr"><b>F2</b><div>At 393px every link, button, input, select and summary has a 44×44px hit box.</div></div>
<div class="ds-line" style="grid-template-columns:36px 1fr"><b>F3</b><div>No horizontal scroll at 360, 375 or 393px.</div></div>
<div class="ds-line" style="grid-template-columns:36px 1fr"><b>F4</b><div>Homepage white-over-photo text reaches 4.5:1 (under 24px) or 3:1 (24px+) on every scene.</div></div>
<div class="ds-line" style="grid-template-columns:36px 1fr"><b>F5</b><div>Exactly one shared header and one shared footer per page.</div></div>
<div class="ds-line" style="grid-template-columns:36px 1fr"><b>F6</b><div>Hub pages linked from the shell stay linked from at least 70% of pages.</div></div>
</div>
<div>
<p class="g-label">Truth and photography</p>
<div class="ds-line" style="grid-template-columns:1fr"><div>Only a real photograph of the named home may illustrate it. No generated, retouched or substituted rooms. A missing image shows a neutral named unavailable state.</div></div>
<div class="ds-line" style="grid-template-columns:1fr"><div>Facts, layouts and policies come from canonical property data. Unknown is not false. Quotes and cancellation terms come from the Hostaway checkout.</div></div>
<div class="ds-line" style="grid-template-columns:1fr"><div>Never claim universal savings, flexible cancellation, ratings, review counts or response times without evidence. Capacity matching is not availability.</div></div>
<div class="ds-line" style="grid-template-columns:1fr"><div>Bradenton mainland is not Anna Maria Island. Only Dockside Dreams has the waterfront dock.</div></div>
<div class="ds-line" style="grid-template-columns:1fr"><div>Motion: browser-native only, never required, never auto-rotating, reduced-motion path complete. No popup interrupts the guest journey; a sticky action never covers the form.</div></div>
</div></div>`,
});

// Icons: every SVG the site's ui-icon partial can render, so the card is the real set.
const icons = parseUiIcons(read("src/_includes/partials/ui-icon.njk"));
card({
  file: "iconography.html",
  group: "Brand",
  name: "Iconography",
  subtitle: `${icons.length} inline SVG icons from ui-icon.njk · currentColor · no emoji`,
  viewport: [900, 640],
  css: [...GUEST, `.ds-icons{display:grid;grid-template-columns:repeat(8,1fr);gap:14px 8px}.ds-icons div{display:flex;flex-direction:column;align-items:center;gap:8px;font-size:12px;color:${C.muted};text-align:center}.ds-icons .ui-icon{font-size:26px;color:${C.ink}}`],
  title: "One line-icon set, drawn in the site",
  note: `Every icon is an inline SVG from <code>src/_includes/partials/ui-icon.njk</code>, 24px viewBox, round caps, 1.85 stroke (the arrow is 1.3), <code>currentColor</code>. No icon font, no emoji, no gold stars.`,
  body: `<div class="ds-icons">${icons
    .map((icon) => `<div><span class="ui-icon" aria-hidden="true" style="display:inline-flex;align-items:center;justify-content:center;line-height:1">${icon.svg}</span>${icon.name}</div>`)
    .join("")}</div>`,
});

card({
  file: "voice.html",
  group: "Brand",
  name: "Voice samples",
  subtitle: "Stays · guide · owner · banned",
  viewport: [760, 420],
  css: [...GUEST, `.ds-v{display:grid;grid-template-columns:110px 1fr;gap:16px;align-items:baseline;padding:16px 0;border-bottom:1px solid ${C.rule}}.ds-v:last-child{border-bottom:0}.ds-v s{color:${C.muted}}`],
  title: "A local friend who knows the coast",
  note: `"We" for Seascape, "you" for the reader. Sentence case. Named places, minutes and real numbers instead of adjectives. Rules in <code>waterline/writing-style-guide.md</code>.`,
  body: `<div class="ds-v"><p class="g-label" style="margin:0">Stays</p><p style="margin:0">Five bedrooms, a private pool and room for 16, eight minutes from Coquina Beach.</p></div>
<div class="ds-v"><p class="g-label" style="margin:0">Guide</p><p style="margin:0">Skip the tourist traps on Bridge Street and head to the Sandbar instead.</p></div>
<div class="ds-v"><p class="g-label" style="margin:0">Owner</p><p style="margin:0">Send the listing link or address and a sentence on what feels off. A real person reads it and replies, usually within 48 hours.</p></div>
<div class="ds-v"><p class="g-label" style="margin:0;color:${C.clay}">Banned</p><p style="margin:0"><s>A hidden gem nestled along the coast, curated for unforgettable memories.</s></p></div>`,
});

/* ---------------------------------------------------------------- pane manifest */
// The Design System pane reads _ds_manifest.json for its card index and token list.
// The app rebuilds it from @dsCard markers on its own self-check, but a DesignSync push
// does not trigger that, so a stale manifest keeps showing deleted cards as "file not
// found". Emit it here from the same data the cards were built from.
// Claude Design's token vocabulary: color | spacing | radius | shadow | font | other.
// Claude Design reads a trailing `/* @kind x */` on a token line for its Tokens panel; emit it
// here so nobody hand-edits the generated file to add it.
const tokensCssAnnotated = annotateTokenCss(tokensCss);
fs.writeFileSync(path.join(OUT, "waterline/tokens.css"), tokensCssAnnotated);
const tokens = [...tokensCss.matchAll(/^\s*(--wl-[a-z0-9-]+):([^;]+);/gm)].map((m) => ({
  name: m[1],
  value: m[2].trim(),
  kind: tokenKind(m[1], m[2].trim()),
  definedIn: "waterline/tokens.css",
}));
write(
  "_ds_manifest.json",
  JSON.stringify(
    {
      namespace: "SeascapeVacationsDesignSystem_57d1b4",
      components: [],
      startingPoints: [],
      cards,
      templates: [],
      globalCssPaths: ["styles.css", "waterline/tokens.css"],
      tokens,
      themes: [],
      fonts: [],
      brandFonts: [
        { family: "Instrument Serif", status: "ok", tokens: ["--wl-font-display"], path: "waterline/tokens.css" },
        { family: "Poppins", status: "ok", tokens: ["--wl-font-body"], path: "waterline/tokens.css" },
      ],
      source: "design-sync",
      syncedAt: today,
      commit,
    },
    null,
    2
  )
);

/* ---------------------------------------------------------------- deletes */
// Legacy cards with no Waterline equivalent. They contradict the current system
// (gold pills, Playfair numerals, 20px cards) and must leave the pane. The full
// project was exported to a zip before the first sync (see README).
const deletes = [
  // Files Claude Design adds inside the project when a mock is run from its chat.
  // The system is generated; mocks live in their own design project (see README).
  "waterline/components/Button.jsx",
  "waterline/components/Button.d.ts",
  "waterline/components/button.html",
  "waterline/tokens.html",
  "live-mockup/Property Management Waterline.html",
  "live-mockup/Property Management Waterline - Desktop & Mobile.html",
  "preview/badge-gps-chip.html",
  "preview/badges.html",
  "preview/colors-gradients.html",
  "preview/colors-neutral.html",
  "preview/colors-warm.html",
  "preview/component-postcard-cta.html",
  "preview/editorial-issue-meta.html",
  "preview/numerals-stat-arrow.html",
  "preview/property-card-a-editorial.html",
  "preview/property-card-b-price-anchored.html",
  "preview/property-card-c-hotel-group.html",
  "preview/property-card-d-gallery.html",
  "preview/property-card-e-availability.html",
  "preview/property-card-f-list.html",
  "preview/review-card.html",
  "preview/shadows.html",
  "preview/spec-live-availability.html",
  "preview/stats-bar.html",
  "preview/type-drop-cap.html",
  "preview/type-numerals.html",
];

fs.writeFileSync(
  path.join(OUT, "_sync-manifest.json"),
  JSON.stringify({ generatedAt: new Date().toISOString(), commit, site: SITE, writes, deletes }, null, 2)
);

console.log(`design-sync bundle: ${writes.length} files to write, ${deletes.length} to delete -> ${OUT}`);
