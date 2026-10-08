const fs = require("fs");
const path = require("path");
const test = require("node:test");
const assert = require("node:assert/strict");

const projectRoot = path.resolve(__dirname, "..", "..");
const catalog = require("../../src/_data/properties-fallback.json");
const WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve"];
const NUMBER = "(?:one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|\\d+)";
// Phrases that state the size of the whole portfolio. Subset counts such as
// "six homes with a hot tub" are facts about specific homes and are not matched.
const TOTAL_COUNT_PATTERNS = [
  new RegExp(`\\b(?:manages?|all|of our|of the|one of)\\s+${NUMBER}\\s+(?:[\\w-]+\\s+){0,2}(?:homes|houses)\\b`, "i"),
  new RegExp(`\\b${NUMBER}[- ]home operator\\b`, "i"),
  new RegExp(`\\b${NUMBER}\\s+homes\\.\\s+One local team`, "i"),
  new RegExp(`\\bone of ${NUMBER}, not one of`, "i")
];
const SOURCE_EXTENSIONS = new Set([".njk", ".html", ".md", ".js"]);

function sourceFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return entry.name === "images" ? [] : sourceFiles(full);
    return SOURCE_EXTENSIONS.has(path.extname(entry.name)) ? [full] : [];
  });
}

test("no template or guide hardcodes the portfolio size", () => {
  const offenders = [];
  for (const file of sourceFiles(path.join(projectRoot, "src"))) {
    const text = fs.readFileSync(file, "utf8");
    for (const pattern of TOTAL_COUNT_PATTERNS) {
      const match = text.match(pattern);
      if (match) offenders.push(`${path.relative(projectRoot, file)}: "${match[0]}"`);
    }
  }
  assert.deepEqual(offenders, [], "Use the numberWord filter on the properties list, or drop the number");
});

test("the property-management page states the catalog size it is built from", () => {
  const built = path.join(projectRoot, "_site", "property-management", "index.html");
  assert.ok(fs.existsSync(built), "run npm run build first; _site/property-management/index.html is missing");
  const html = fs.readFileSync(built, "utf8");
  const word = WORDS[catalog.length];
  assert.ok(word, `catalog length ${catalog.length} has no number word; extend numberWord`);
  assert.match(html, new RegExp(`${word[0].toUpperCase()}${word.slice(1)} homes\\. One local team\\.`));
  assert.match(html, new RegExp(`See all ${word} homes`));
});
