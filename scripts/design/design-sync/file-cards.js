#!/usr/bin/env node
"use strict";

/*
 * design-sync file-cards: convert the bundle's preview cards into the layout of the
 * published Claude Design system artifact, and keep only the cards that changed.
 *
 * The bundle (build.js) writes preview/<card>.html with an @dsCard line 2 and
 * fonts at ../waterline/. The published system keeps each card at
 * components/<Name>/preview.html, with its own @dsCard header on line 1 (the
 * artifact's sizing, which differs from the bundle's viewport) and fonts at
 * ../../waterline/. Filing those by hand was the step most likely to go wrong.
 *
 * USAGE
 *   node scripts/design/design-sync/file-cards.js --live <dir> --dest <dir> [--out .design-sync/out]
 *     --live  a folder holding the published project's components/<Name>/preview.html
 *             (read them back from the artifact first)
 *     --dest  where changed cards are written, as components/<Name>/preview.html
 *     --site  the built site (default _site) that holds the photos the cards show
 *     --new   also file mapped cards the artifact does not have yet; each gets a header
 *             built from its bundle @dsCard line (group, subtitle, viewport size).
 *             Without it a missing live copy is an error, so a forgotten read-back
 *             never looks like a new card.
 *   The artifact's preview frame loads no image from another site, so photos the bundle
 *   links on seascape-vacations.com/images/ are rewritten to ../../images/ and copied from
 *   the built site to <dest>/images/, to be published beside the cards.
 *   Prints which cards changed, which were created, which were unchanged and which
 *   bundle cards are not filed.
 */

const fs = require("fs");
const path = require("path");
const { LIVE } = require("./markup");

const LIVE_IMAGES = `${LIVE}/images/`;

// Bundle card file stem -> published component name.
const CARD_MAP = Object.freeze({
  "property-card": "CatalogCard",
  "postcard-collection": "PostcardCollection",
  "phone-surfaces": "PhoneSurfaces",
  nav: "GuestHeader",
  "nav-mobile": "GuestHeaderMobile",
  footer: "GuestFooter",
  "form-fields": "TripForm",
  "scene-hero": "ArrivalScene",
  "sticky-cta": "StickyBookingBar",
  logo: "Wordmark",
  "rules-floors": "Floors",
  buttons: "Button",
  "booking-panel": "BookingPanel",
  iconography: "Iconography",
  voice: "Voice",
  // Catalog patterns no page uses yet (#1041 item 3), one component per viewport.
  "island-locator": "IslandLocator",
  "island-locator-phone": "IslandLocatorPhone",
  "fact-strip": "FactStrip",
  "fact-strip-phone": "FactStripPhone",
  "fact-panel": "FactPanel",
  "fact-panel-phone": "FactPanelPhone",
  disclosure: "Disclosure",
  "disclosure-phone": "DisclosurePhone",
  "photo-lightbox": "PhotoLightbox",
  "photo-lightbox-mid": "PhotoLightboxMid",
  "photo-lightbox-phone": "PhotoLightboxPhone",
});

// Bundle cards with no published component (the published system keeps them under
// archived/). A bundle card in neither list is an error, so a new card is never
// dropped without someone choosing where it goes.
const NOT_FILED = Object.freeze([
  "colors-brand",
  "colors-retired",
  "type-display",
  "type-body",
  "radii",
  "spacing",
]);

function publishedPath(stem) {
  const name = CARD_MAP[stem];
  if (!name) throw new Error(`No published component for bundle card "${stem}"`);
  return `components/${name}/preview.html`;
}

// Bundle card + the published card's line 1 header -> the card as it should be published.
function fileCard(bundleHtml, publishedHeader) {
  if (!/^<!--\s*@dsCard\b/.test(publishedHeader)) {
    throw new Error(`Published header is not an @dsCard line: ${publishedHeader.slice(0, 80)}`);
  }
  const lines = bundleHtml.split("\n");
  const kept = lines.filter((line) => !/^<!--\s*@dsCard\b/.test(line));
  if (kept.length !== lines.length - 1) {
    throw new Error(`Bundle card must carry exactly one @dsCard line; found ${lines.length - kept.length}`);
  }
  return [publishedHeader, ...kept]
    .join("\n")
    .replace(/(?<!\.\.\/)\.\.\/waterline\//g, "../../waterline/")
    .split(LIVE_IMAGES)
    .join("../../images/");
}

// Site-relative paths (images/...) of the photos a filed card shows.
function cardImages(html) {
  const found = new Set();
  for (const m of html.matchAll(/\.\.\/\.\.\/(images\/[^"'\s),?#&]+)/g)) {
    // A photo is copied from the built site; a ".." segment would reach outside it.
    if (m[1].split("/").includes("..")) throw new Error(`Photo path leaves images/: ${m[1]}`);
    found.add(m[1]);
  }
  return [...found].sort();
}

// The opening-synced stamp changes on every build; a card with no other change is not republished.
function stripSyncStamp(html) {
  return html.replace(/data-opening-synced="[^"]*"/g, 'data-opening-synced=""');
}

function differsOnlyBySyncStamp(a, b) {
  return a !== b && stripSyncStamp(a) === stripSyncStamp(b);
}

// A card the artifact does not have yet: build its published header from the bundle's
// @dsCard line. The bundle's viewport ("WxH") becomes the artifact's width and height.
function headerForNewCard(bundleHtml) {
  const line = bundleHtml.split("\n").find((l) => /^<!--\s*@dsCard\b/.test(l));
  if (!line) throw new Error("Bundle card has no @dsCard line");
  const attr = (key) => {
    const m = new RegExp(`\\b${key}="([^"]*)"`).exec(line);
    return m ? m[1] : undefined;
  };
  const viewport = /^(\d+)x(\d+)$/.exec(attr("viewport") || "");
  if (!viewport) throw new Error(`Bundle @dsCard line has no WxH viewport: ${line.slice(0, 120)}`);
  const parts = [`group="${attr("group") || "Components"}"`, `height=${viewport[2]}`, `width=${viewport[1]}`];
  const subtitle = attr("subtitle");
  if (subtitle) parts.push(`subtitle="${subtitle}"`);
  return `<!-- @dsCard ${parts.join(" ")} -->`;
}

// Pure planning step: what to write, given bundle and live contents.
// bundle: { stem: html }, live: { componentPath: html }.
// allowNew files a mapped card with no live copy as created instead of failing.
function planFiling(bundle, live, { allowNew = false } = {}) {
  const result = { changed: [], created: [], unchanged: [], notFiled: [] };
  for (const stem of Object.keys(bundle).sort()) {
    if (NOT_FILED.includes(stem)) {
      result.notFiled.push(stem);
      continue;
    }
    if (!CARD_MAP[stem]) {
      throw new Error(`Bundle card "${stem}" is in neither CARD_MAP nor NOT_FILED in file-cards.js`);
    }
    const target = publishedPath(stem);
    const current = live[target];
    if (current === undefined) {
      if (!allowNew) {
        throw new Error(`Live copy of ${target} is missing; read it back from the artifact first, or pass --new for a component the artifact does not have yet`);
      }
      result.created.push({ path: target, html: fileCard(bundle[stem], headerForNewCard(bundle[stem])) });
      continue;
    }
    const filed = fileCard(bundle[stem], current.split("\n")[0]);
    if (filed === current || differsOnlyBySyncStamp(filed, current)) {
      result.unchanged.push(target);
    } else {
      result.changed.push({ path: target, html: filed });
    }
  }
  return result;
}

function main(argv) {
  const value = (flag) => {
    const i = argv.indexOf(flag);
    return i >= 0 ? argv[i + 1] : undefined;
  };
  const root = path.resolve(__dirname, "../../..");
  const out = path.resolve(root, value("--out") || ".design-sync/out");
  const liveDir = value("--live");
  const dest = value("--dest");
  const site = path.resolve(root, value("--site") || "_site");
  if (!liveDir || !dest) {
    throw new Error("Usage: file-cards.js --live <dir> --dest <dir> [--out .design-sync/out] [--site _site] [--new]");
  }
  // A leftover card from an earlier run would be published as if it had changed.
  if (fs.existsSync(dest) && fs.readdirSync(dest).length > 0) {
    throw new Error(`--dest ${dest} is not empty; pass a new or empty folder`);
  }
  const previewDir = path.join(out, "preview");
  const bundle = {};
  for (const file of fs.readdirSync(previewDir).filter((f) => f.endsWith(".html"))) {
    bundle[file.replace(/\.html$/, "")] = fs.readFileSync(path.join(previewDir, file), "utf8");
  }
  const live = {};
  for (const stem of Object.keys(CARD_MAP)) {
    const target = publishedPath(stem);
    const file = path.join(liveDir, target);
    if (fs.existsSync(file)) live[target] = fs.readFileSync(file, "utf8");
  }
  // The artifact always has published cards, so an empty --live is a wrong or missing
  // read-back; with --new it would otherwise refile every card with a bundle header.
  if (Object.keys(live).length === 0) {
    throw new Error(`--live ${liveDir} holds no components/<Name>/preview.html; read the cards back from the artifact first`);
  }
  const plan = planFiling(bundle, live, { allowNew: argv.includes("--new") });
  const written = [...plan.changed, ...plan.created];
  const images = [...new Set(written.flatMap(({ html }) => cardImages(html)))].sort();
  const missing = images.filter((rel) => !fs.existsSync(path.join(site, rel)));
  if (missing.length > 0) {
    throw new Error(`Photos missing from ${site} (run npm run build first): ${missing.join(", ")}`);
  }
  for (const { path: rel, html } of written) {
    const file = path.join(dest, rel);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, html);
  }
  for (const rel of images) {
    fs.mkdirSync(path.dirname(path.join(dest, rel)), { recursive: true });
    fs.copyFileSync(path.join(site, rel), path.join(dest, rel));
  }
  plan.images = images;
  console.log(`Changed (written to ${dest}): ${plan.changed.map((c) => c.path).join(", ") || "none"}`);
  console.log(`Created (new components, written to ${dest}): ${plan.created.map((c) => c.path).join(", ") || "none"}`);
  console.log(`Photos copied to ${path.join(dest, "images")}: ${images.length}`);
  console.log(`Unchanged: ${plan.unchanged.length}`);
  console.log(`Not filed (no published component): ${plan.notFiled.join(", ") || "none"}`);
  return plan;
}

if (require.main === module) {
  try {
    main(process.argv.slice(2));
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

module.exports = { CARD_MAP, NOT_FILED, publishedPath, fileCard, cardImages, headerForNewCard, differsOnlyBySyncStamp, planFiling, main };
