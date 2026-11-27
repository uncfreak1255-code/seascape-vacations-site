"use strict";

// Palette-widening integrity for design-lint. Lives next to design-lint.js so
// that file can stay under the staged-file size gate.

function createPaletteIntegrity(deps) {
  const {
    PALETTE_SOURCE_FILES,
    ALWAYS_ALLOWED_HEX,
    HEX_RE,
    normalizeHex,
    read,
    readSourceAtRef,
    resolveMergeBase,
    styleContextOf,
  } = deps;

  function paletteUsageFiles(files, touched, changedPaletteSources) {
    return [
      ...new Set([
        ...files.filter((rel) => touched.has(rel)),
        ...(changedPaletteSources.length ? PALETTE_SOURCE_FILES.filter((rel) => rel !== "DESIGN.md") : []),
      ]),
    ];
  }

  function paletteUsesAddedHexes(source, addedHexes, rel) {
    const used = new Set((styleContextOf(source, rel).match(HEX_RE) || []).map(normalizeHex));
    return [...addedHexes].filter((hex) => used.has(hex));
  }

  function checkPaletteIntegrity(touched, baseRef, { files }) {
    const changedPaletteSources = PALETTE_SOURCE_FILES.filter((rel) => touched.has(rel));
    if (!changedPaletteSources.length) {
      return [];
    }

    const mergeBase = resolveMergeBase(baseRef);
    if (!mergeBase) {
      return [
        `palette source(s) changed (${changedPaletteSources.join(", ")}) but the merge base ` +
          `against ${baseRef} could not be resolved, so the widening cannot be audited.`,
      ];
    }

    const baseAllowed = new Set([...ALWAYS_ALLOWED_HEX].map(normalizeHex));
    for (const rel of PALETTE_SOURCE_FILES) {
      const source = readSourceAtRef(mergeBase, rel);
      if (!source) {
        continue;
      }
      for (const match of source.match(HEX_RE) || []) {
        baseAllowed.add(normalizeHex(match));
      }
    }

    const addedHexes = new Set();
    for (const rel of PALETTE_SOURCE_FILES) {
      let source;
      try {
        source = read(rel);
      } catch {
        continue;
      }
      for (const match of source.match(HEX_RE) || []) {
        const norm = normalizeHex(match);
        if (!baseAllowed.has(norm)) {
          addedHexes.add(norm);
        }
      }
    }

    if (!addedHexes.size) {
      return [];
    }

    const failures = [];
    for (const rel of paletteUsageFiles(files, touched, changedPaletteSources)) {
      // Waterline sheets may use a DESIGN.md token added in the same change.
      if (rel.startsWith("src/css/") && rel.endsWith(".css")) continue;
      let source;
      try {
        source = read(rel);
      } catch {
        continue;
      }
      const abused = paletteUsesAddedHexes(source, addedHexes, rel);
      if (abused.length) {
        failures.push(
          `${rel} uses ${abused.join(", ")}, legalized in this same branch by ` +
            `${changedPaletteSources.join(", ")}. Use an existing palette value, or land the ` +
            "palette change on its own and let it be reviewed as a design decision."
        );
      }
    }

    return failures;
  }

  return { paletteUsageFiles, paletteUsesAddedHexes, checkPaletteIntegrity };
}

module.exports = { createPaletteIntegrity };
