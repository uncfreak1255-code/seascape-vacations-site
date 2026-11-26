const test = require("node:test");
const assert = require("node:assert/strict");

const { extractAuthorizedSourceSectionText } = require("./search-brief-gate");

// Which lines of a brief name the source files its PR may change (#1084).

test("a source-files heading section counts its top-level bullets, up to the next heading", () => {
  const brief = `# Brief: Example

## Source Files Changed In This Batch

- \`src/index.njk\` (the hero copy)
- \`src/_data/seoPages.json\`

### Notes

- \`src/guides/notes-only.html\` is named here only as context.

## Boundary Proof

- \`src/guides/example.html\` was read, not changed.
`;
  const section = extractAuthorizedSourceSectionText(brief);

  assert.equal(section.includes("src/index.njk"), true);
  assert.equal(section.includes("src/_data/seoPages.json"), true);
  assert.equal(section.includes("src/guides/notes-only.html"), false);
  assert.equal(section.includes("src/guides/example.html"), false);
});

test("a source-files bullet still counts only its indented children", () => {
  const brief = `# Brief: Example

## Page Builder Tasks

- source files likely to change:
  - \`src/index.njk\`
- proof source: \`src/guides/example.html\`
`;
  const section = extractAuthorizedSourceSectionText(brief);

  assert.equal(section.includes("src/index.njk"), true);
  assert.equal(section.includes("src/guides/example.html"), false);
});

test("a nested source-files bullet does not end its heading section", () => {
  const brief = "## Source Files Changed\n\n- source files likely to change:\n  - `src/a.njk`\n- `src/b.njk`\n\n## Next\n\n- `src/c.njk`\n";
  const section = extractAuthorizedSourceSectionText(brief);

  assert.equal(section.includes("src/a.njk"), true);
  assert.equal(section.includes("src/b.njk"), true);
  assert.equal(section.includes("src/c.njk"), false);
});

test("a # line inside a code fence does not end the section", () => {
  const brief = "## Source Files Changed\n\n```sh\n# build first\nnpm run build\n```\n\n- `src/b.njk`\n\n## Next\n\n- `src/c.njk`\n";
  const section = extractAuthorizedSourceSectionText(brief);

  assert.equal(section.includes("src/b.njk"), true);
  assert.equal(section.includes("src/c.njk"), false);
});

test("a matching subheading owns its section and prose under it", () => {
  const brief = "## Tasks\n\n### Source files changed\n\nThe hero copy lives in `src/index.njk`.\n\n### Notes\n\n- `src/c.njk`\n";
  const section = extractAuthorizedSourceSectionText(brief);

  assert.equal(section.includes("src/index.njk"), true);
  assert.equal(section.includes("src/c.njk"), false);
});
