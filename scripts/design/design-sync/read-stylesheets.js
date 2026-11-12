// Reads every sheet listed in stylesheets.js; guest.css loses its @font-face
// blocks (fonts.css carries them) and trip-sheet.css gains trip-sheet-cards.css,
// matching the built _site/css/trip-sheet.css (eleventy.config.js).
// inlined(name) throws for an unlisted sheet.
const stylesheets = require("./stylesheets");

const stripFontFace = (css) => css.replace(/@font-face\s*\{[^}]*\}\n?/g, "");

module.exports = function readStylesheets(read) {
  const sheets = Object.fromEntries(stylesheets.map((name) => [name, read(`src/css/${name}.css`)]));
  sheets.guest = stripFontFace(sheets.guest);
  sheets["trip-sheet"] = `${sheets["trip-sheet"]}\n${read("src/css/trip-sheet-cards.css")}`;
  const inlined = (name) => sheets[name] ?? (() => { throw new Error(`stylesheets.js must list "${name}": the preview cards inline it.`); })();
  return { sheets, inlined };
};
