"use strict";
// Writes waterline/tokens.css with @kind annotations and _ds_manifest.json.
// Split out of build.js so that file stays under the staged-file size gate.
const fs = require("fs");
const path = require("path");

module.exports = function paneManifest({ OUT, tokensCss, cards, today, commit, write }) {
  // The Design System pane reads _ds_manifest.json for its card index and token list.
  // The app rebuilds it from @dsCard markers on its own self-check, but a DesignSync push
  // does not trigger that, so a stale manifest keeps showing deleted cards as "file not
  // found". Emit it here from the same data the cards were built from.
  // Claude Design's token vocabulary: color | spacing | radius | shadow | font | other.
  const tokenKind = (name, value) => {
    if (/radius/.test(name)) return "radius";
    if (/shadow/.test(name) || /shadow/.test(value)) return "shadow";
    if (/^#|^rgba?\(/.test(value)) return "color";
    if (/font|-h1$|-size$|-lh$|-ls$|weight/.test(name) || /'/.test(value)) return "font";
    if (/px|em|%/.test(value)) return "spacing";
    return "other";
  };
  // Claude Design reads a trailing `/* @kind x */` on a token line for its Tokens panel; emit it
  // here so nobody hand-edits the generated file to add it.
  const tokensCssAnnotated = tokensCss.replace(/^(\s*--wl-[a-z0-9-]+:)([^;]+);(.*)$/gm, (line, name, value, rest) => {
    if (/@kind/.test(rest)) return line;
    return `${name}${value}; /* @kind ${tokenKind(name.replace(/[:\s]/g, ""), value.trim())} */${rest ? " " + rest.trim() : ""}`;
  });
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
};
