"use strict";

/**
 * computeOverall(dimScores, rubric, copy) -> {overall, perDimension, pass, autoFails}
 *
 * - perDimension normalized = clamp(score,0,max)/max
 * - overall = round( sum(normalized*weight) * 100 )
 * - autoFails: case-insensitive substring/word match of autoFailPatterns against copy
 * - pass = (overall >= rubric.passFloor) && autoFails.length === 0
 */
/**
 * escapeRegexMeta(str) -> string with regex metacharacters escaped
 */
function escapeRegexMeta(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function computeOverall(dimScores, rubric, copy = "") {
  const perDimension = rubric.dimensions.map((dim) => {
    const raw = dimScores[dim.id] !== undefined ? dimScores[dim.id] : 0;
    const clamped = Math.max(0, Math.min(raw, dim.max));
    // Defensive guard: if max <= 0, treat normalized as 0 to avoid division issues
    const normalized = dim.max > 0 ? clamped / dim.max : 0;
    return {
      id: dim.id,
      raw,
      normalized,
      weight: dim.weight,
    };
  });

  const weightedSum = perDimension.reduce((sum, d) => sum + d.normalized * d.weight, 0);
  const overall = Math.round(weightedSum * 100);

  // Check autoFail patterns using word-boundary matching (case-insensitive)
  // Uses lookaround assertions so patterns with hyphens (e.g. "game-changer") work correctly.
  const autoFails = [];
  if (Array.isArray(rubric.autoFailPatterns) && copy) {
    for (const pattern of rubric.autoFailPatterns) {
      const escaped = escapeRegexMeta(pattern);
      const re = new RegExp("(?<![A-Za-z0-9])" + escaped + "(?![A-Za-z0-9])", "i");
      if (re.test(copy)) {
        autoFails.push(pattern);
      }
    }
  }

  const pass = overall >= rubric.passFloor && autoFails.length === 0;

  return { overall, perDimension, pass, autoFails };
}

module.exports = { computeOverall };
