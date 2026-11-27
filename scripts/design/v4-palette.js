"use strict";

const yaml = require("js-yaml");

const RETIRED_HEX = new Set(
  [
    "#d6eb85",
    "#a4533e",
    "#c9a962",
    "#b8943a",
    "#e8d5a3",
    "#f5eed6",
    "#ebe4cc",
    "#faf7ee",
  ].map((hex) => hex.toLowerCase())
);

function createV4Palette({ HEX_RE, ALWAYS_ALLOWED_HEX, normalizeHex, read }) {
  function sanctionedHexesFromDesignMd(content) {
    const fm = (String(content || "").match(/^---\n([\s\S]*?)\n---/) || [])[1];
    if (!fm) return [];
    const doc = yaml.load(fm) || {};
    const colors = (doc.system && doc.system.colors) || {};
    const hexes = [];
    for (const value of Object.values(colors)) {
      for (const match of String(value).match(HEX_RE) || []) hexes.push(match);
    }
    return hexes;
  }

  function paletteHexesFromSource(rel, source) {
    if (rel === "DESIGN.md") return sanctionedHexesFromDesignMd(source);
    return source.match(HEX_RE) || [];
  }

  function buildPaletteAllowlist() {
    const allowed = new Set([...ALWAYS_ALLOWED_HEX].map(normalizeHex));
    try {
      for (const hex of sanctionedHexesFromDesignMd(read("DESIGN.md"))) {
        allowed.add(normalizeHex(hex));
      }
    } catch {
      // Missing DESIGN.md leaves only always-allowed hexes (fail-closed).
    }
    return allowed;
  }

  function skipPaletteConsumer(rel) {
    return rel === "DESIGN.md" || (rel.startsWith("src/css/") && rel.endsWith(".css"));
  }

  return {
    RETIRED_HEX,
    sanctionedHexesFromDesignMd,
    paletteHexesFromSource,
    buildPaletteAllowlist,
    skipPaletteConsumer,
  };
}

module.exports = { createV4Palette, RETIRED_HEX };
