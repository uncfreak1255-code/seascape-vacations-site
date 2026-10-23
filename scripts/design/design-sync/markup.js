"use strict";
/**
 * Markup helpers for the design-sync build: pull a component out of built HTML
 * and point its root-relative URLs at the live site. Split out of build.js so
 * that file stays under the staged-file size gate.
 */

const LIVE = "https://seascape-vacations.com";

// Returns the first element whose class attribute starts with `cls`, with balanced tags.
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

// Root-relative URLs -> live site, so cards show the approved photography.
function absolutize(html) {
  return html
    .replace(/(src|href|poster)="\//g, `$1="${LIVE}/`)
    .replace(/srcset="([^"]*)"/g, (_, v) => `srcset="${v.replace(/(^|,\s*)\//g, `$1${LIVE}/`)}"`);
}

module.exports = { LIVE, extract, absolutize };
