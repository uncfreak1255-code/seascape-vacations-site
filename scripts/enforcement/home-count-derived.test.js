const fs = require("fs");
const path = require("path");
const test = require("node:test");
const assert = require("node:assert/strict");
const {
  TOTAL_COUNT_PATTERNS,
  catalogHomeCountHeading,
  catalogHomeCountWord,
  homeOperator,
  indefiniteArticle,
  numberWord
} = require("./home-count-word");

const projectRoot = path.resolve(__dirname, "..", "..");
const SOURCE_EXTENSIONS = new Set([".njk", ".html", ".md", ".js"]);

function sourceFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return entry.name === "images" ? [] : sourceFiles(full);
    return SOURCE_EXTENSIONS.has(path.extname(entry.name)) ? [full] : [];
  });
}

test("numberWord accepts 0-12 and rejects anything else", () => {
  assert.equal(numberWord(0), "zero");
  assert.equal(numberWord(7), "seven");
  assert.equal(numberWord(12), "twelve");
  assert.throws(() => numberWord(13), /0 to 12/);
  assert.throws(() => numberWord("7"), /0 to 12/);
  assert.throws(() => numberWord(), /0 to 12/);
});

test("homeOperator uses an before vowel-sound count words", () => {
  assert.equal(indefiniteArticle("eight"), "an");
  assert.equal(indefiniteArticle("eleven"), "an");
  assert.equal(indefiniteArticle("one"), "a");
  assert.equal(indefiniteArticle("seven"), "a");
  assert.equal(homeOperator("eight"), "an eight-home operator");
  assert.equal(homeOperator("seven"), "a seven-home operator");
});

test("portfolio-size patterns catch leftover total-count shapes and spare subset facts", () => {
  const joined = (text) => TOTAL_COUNT_PATTERNS.some((pattern) => pattern.test(text));
  assert.equal(joined("our own seven homes"), true);
  assert.equal(joined("We manage 5 Gulf Coast vacation homes"), true);
  assert.equal(joined("Seascape Vacations manages 5 Gulf Coast properties"), true);
  assert.equal(joined("Seven homes. One local team."), true);
  assert.equal(joined("Hot tub heat is included at the five established homes"), false);
  assert.equal(joined("Your comparison has three homes"), false);
  assert.equal(joined(""), false);
});

test("no template or guide hardcodes the portfolio size", () => {
  const offenders = [];
  for (const file of sourceFiles(path.join(projectRoot, "src"))) {
    const text = fs.readFileSync(file, "utf8");
    // permalink: false pages are never rendered, so their copy is not reader-visible.
    if (/^---\r?\n(?:(?!---)[\s\S])*?^permalink:\s*false\s*$/m.test(text)) continue;
    for (const pattern of TOTAL_COUNT_PATTERNS) {
      const match = text.match(pattern);
      if (match) offenders.push(`${path.relative(projectRoot, file)}: "${match[0]}"`);
    }
  }
  assert.deepEqual(offenders, [], "Use the numberWord filter on the properties list, or drop the number");
});

// src/llms.txt is copied as-is, so it cannot use the numberWord filter and the
// template scan above skips it. Any portfolio size it states must match the catalog.
test("llms.txt states the catalog home count", () => {
  const text = fs.readFileSync(path.join(projectRoot, "src", "llms.txt"), "utf8");
  const count = require("../../src/_data/properties-fallback.json").length;
  const word = catalogHomeCountWord();
  for (const pattern of TOTAL_COUNT_PATTERNS) {
    const match = text.match(pattern);
    if (!match) continue;
    assert.match(match[0], new RegExp(`\\b(?:${word}|${count})\\b`, "i"), `src/llms.txt says "${match[0]}"; the catalog has ${word} homes`);
  }
});

test("the property-management page states the catalog size it is built from", () => {
  const built = path.join(projectRoot, "_site", "property-management", "index.html");
  assert.ok(fs.existsSync(built), "run npm run build first; _site/property-management/index.html is missing");
  const html = fs.readFileSync(built, "utf8");
  const word = catalogHomeCountWord();
  assert.match(html, new RegExp(`${catalogHomeCountHeading().replace(".", "\\.")}`));
  assert.match(html, new RegExp(`See all ${word} homes`));
  assert.match(html, new RegExp(`our own ${word} homes`));
  assert.match(html, new RegExp(`Why ${homeOperator(word)}`));
  assert.doesNotMatch(html, /Why a eight-home operator/);
});
