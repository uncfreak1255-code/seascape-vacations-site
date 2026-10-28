// Reads every sheet listed in stylesheets.js; guest.css loses its @font-face
// blocks (fonts.css carries them). inlined(name) throws for an unlisted sheet.
const stylesheets = require("./stylesheets");

const stripFontFace = (css) => css.replace(/@font-face\s*\{[^}]*\}\n?/g, "");

module.exports = function readStylesheets(read) {
  const sheets = Object.fromEntries(stylesheets.map((name) => [name, read(`src/css/${name}.css`)]));
  sheets.guest = stripFontFace(sheets.guest);
  const inlined = (name) => sheets[name] ?? (() => { throw new Error(`stylesheets.js must list "${name}": the preview cards inline it.`); })();
  return { sheets, inlined };
};
