// Content-gate brief fields shared by the content lint and `npm run check:brief`.
const REQUIRED_BRIEF_FIELDS = [
  "persona",
  "primary keyword",
  "secondary keywords",
  "audience pattern",
  "proof source",
  "required internal links",
  "CTA target",
  "anti-claims"
];

function parseRequiredLinksFromBrief(briefContent) {
  const match = briefContent.match(/^- required internal links:\s*(.+)$/im);
  if (!match) {
    return [];
  }

  return match[1]
    .split(",")
    .map((value) => value.trim())
    .filter((value) => value.startsWith("/"));
}

function parseMissingBriefFields(briefContent) {
  return REQUIRED_BRIEF_FIELDS.filter((field) => {
    const expression = new RegExp(`^- ${field}:\\s+.+$`, "im");
    return !expression.test(briefContent);
  });
}

module.exports = {
  REQUIRED_BRIEF_FIELDS,
  parseMissingBriefFields,
  parseRequiredLinksFromBrief,
};
