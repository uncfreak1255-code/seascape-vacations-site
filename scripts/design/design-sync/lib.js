"use strict";

const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");

const LIVE_ORIGIN = "https://seascape-vacations.com";
const MIN_UI_ICONS = 10;

function resolveOutDir(root, outArg) {
  const OUT = path.resolve(root, outArg);
  const SYNC_ROOT = path.join(root, ".design-sync");
  if (!(OUT === SYNC_ROOT || OUT.startsWith(SYNC_ROOT + path.sep))) {
    throw new Error(`--out must resolve inside ${SYNC_ROOT}; got ${OUT}`);
  }
  return { OUT, SYNC_ROOT };
}

function loadWaterline(designMd) {
  const frontMatter = (designMd.match(/^---\n([\s\S]*?)\n---/) || [])[1];
  if (!frontMatter) throw new Error("DESIGN.md has no YAML front matter");
  const parsed = yaml.load(frontMatter);
  const wl = parsed && parsed.waterline;
  if (!wl || !wl.colors || !wl.typography) {
    throw new Error("DESIGN.md front matter has no waterline block; refusing to build from legacy tokens.");
  }
  return wl;
}

function stripFontFace(css) {
  return css.replace(/@font-face\s*\{[^}]*\}\n?/g, "");
}

function extract(html, cls, nth = 0) {
  const open = new RegExp(`<([a-z][a-z0-9]*)\\b[^>]*class="${cls}[" ][^>]*>`, "g");
  let m;
  for (let i = 0; i <= nth; i += 1) {
    m = open.exec(html);
    if (!m) throw new Error(`Component .${cls} (#${nth}) not found in built HTML`);
  }
  const tag = m[1];
  const opener = new RegExp(`<${tag}\\b[^>]*>`, "g");
  const closer = new RegExp(`</${tag}>`, "g");
  let i = m.index + m[0].length;
  let depth = 1;
  while (depth > 0) {
    opener.lastIndex = i;
    closer.lastIndex = i;
    const o = opener.exec(html);
    const c = closer.exec(html);
    if (!c) throw new Error(`Unbalanced <${tag}> while extracting .${cls}`);
    if (o && o.index < c.index && !/\/>$/.test(o[0])) {
      depth += 1;
      i = o.index + o[0].length;
    } else {
      depth -= 1;
      i = c.index + c[0].length;
    }
  }
  return html.slice(m.index, i);
}

function absolutize(html, live = LIVE_ORIGIN) {
  return html
    .replace(/(src|href|poster)="\//g, `$1="${live}/`)
    .replace(/srcset="([^"]*)"/g, (_, v) => `srcset="${v.replace(/(^|,\s*)\//g, `$1${live}/`)}"`);
}

function requireScenePhoto(html, live = LIVE_ORIGIN) {
  const scenePhotoMatch = html.match(/class="g-scene-photo"[^>]*src="([^"]+)"/);
  if (!scenePhotoMatch) {
    throw new Error("Homepage scene photo not found in built HTML; the header-over-photo card needs it");
  }
  return absolutize(`src="${scenePhotoMatch[1]}"`, live).slice(5, -1);
}

function parseUiIcons(iconSource) {
  const icons = [...iconSource.matchAll(/\{% (?:el)?if name == "([a-z-]+)" %\}\s*(<svg[\s\S]*?<\/svg>)/g)]
    .map((m) => ({ name: m[1], svg: m[2] }))
    .filter((icon, index, all) => all.findIndex((other) => other.name === icon.name) === index);
  if (icons.length < MIN_UI_ICONS) {
    throw new Error(`ui-icon.njk yielded only ${icons.length} icons; the parser is broken`);
  }
  return icons;
}

function tokenKind(name, value) {
  if (/radius/.test(name)) return "radius";
  if (/shadow/.test(name) || /shadow/.test(value)) return "shadow";
  if (/^#|^rgba?\(/.test(value)) return "color";
  if (/font|-h1$|-size$|-lh$|-ls$|weight/.test(name) || /'/.test(value)) return "font";
  if (/px|em|%/.test(value)) return "spacing";
  return "other";
}

function annotateTokenCss(tokensCss) {
  return tokensCss.replace(/^(\s*--wl-[a-z0-9-]+:)([^;]+);(.*)$/gm, (line, name, value, rest) => {
    if (/@kind/.test(rest)) return line;
    return `${name}${value}; /* @kind ${tokenKind(name.replace(/[:\s]/g, ""), value.trim())} */${rest ? " " + rest.trim() : ""}`;
  });
}

function listPreviewCards(out) {
  const cards = fs.readdirSync(path.join(out, "preview")).filter((f) => f.endsWith(".html")).sort();
  if (!cards.length) throw new Error(`No preview cards in ${out}; run build.js first.`);
  return cards;
}

function clearRenderReceipt(out) {
  const receipt = path.join(out, "_render", "render-check.json");
  fs.rmSync(receipt, { force: true });
  return receipt;
}

module.exports = {
  LIVE_ORIGIN,
  MIN_UI_ICONS,
  annotateTokenCss,
  absolutize,
  clearRenderReceipt,
  extract,
  listPreviewCards,
  loadWaterline,
  parseUiIcons,
  requireScenePhoto,
  resolveOutDir,
  stripFontFace,
  tokenKind,
};
