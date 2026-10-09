const WORDS = [
  "zero",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
  "eleven",
  "twelve"
];
const NUMBER = "(?:one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|\\d+)";
const HOME_COUNT_WORD = `(?:${WORDS.join("|")})`;

// Phrases that state the size of the whole portfolio. Subset counts such as
// "six homes with a hot tub" or "the five established homes" are facts about
// specific homes and are not matched.
const TOTAL_COUNT_PATTERNS = [
  new RegExp(
    `\\b(?:manages?|all|of our|of the|one of)\\s+${NUMBER}\\s+(?:[\\w-]+\\s+){0,2}(?:homes|houses)\\b`,
    "i"
  ),
  new RegExp(`\\bour own\\s+${NUMBER}\\s+homes\\b`, "i"),
  new RegExp(
    `\\bmanage[sd]?\\s+${NUMBER}(?:\\s+[\\w-]+){0,4}\\s+(?:homes|houses|properties)\\b`,
    "i"
  ),
  new RegExp(`\\b${NUMBER}[- ]home operator\\b`, "i"),
  new RegExp(`\\b${NUMBER}\\s+homes\\.\\s+One local team`, "i"),
  new RegExp(`\\bone of ${NUMBER}, not one of`, "i")
];

function numberWord(count) {
  if (!Number.isInteger(count) || WORDS[count] == null) {
    throw new Error(`numberWord needs an integer from 0 to 12, got ${count}`);
  }
  return WORDS[count];
}

function catalogHomeCountWord(catalog = require("../../src/_data/properties-fallback.json")) {
  return numberWord(catalog.length);
}

function catalogHomeCountHeading(catalog) {
  const word = catalogHomeCountWord(catalog);
  return `${word[0].toUpperCase()}${word.slice(1)} homes. One local team.`;
}

function ownerOfferCountPatterns() {
  return {
    heading: new RegExp(`\\b${HOME_COUNT_WORD} homes\\. One local team\\.`, "i"),
    operator: new RegExp(`Why a ${HOME_COUNT_WORD}-home operator`, "i")
  };
}

module.exports = {
  WORDS,
  TOTAL_COUNT_PATTERNS,
  numberWord,
  catalogHomeCountWord,
  catalogHomeCountHeading,
  ownerOfferCountPatterns
};
