const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const assert = require("node:assert/strict");

// The Emil Kowalski craft skills in .claude/skills are third-party text copied at one pinned commit
// with the deltas .claude/skills/NOTICE.design-skills records. These checks keep a re-import from
// dropping a delta: a plain upstream copy brings back the greeting-only reply, loses the DESIGN.md
// note, and adds several thousand characters to the skill listing every session pays for.
const ROOT = path.resolve(__dirname, "..", "..");
const SKILLS_DIR = path.join(ROOT, ".claude", "skills");
const EMIL_SKILLS = [
  "animate", "animation-performance", "animation-vocabulary", "apple-design", "ask-emil", "break-ui",
  "choreograph", "emil-design-eng", "find-animation-opportunities", "gestures", "improve-animations",
  "learn-taste", "mobile-native", "prototype", "remove-animations", "review-animations"
];
const NOT_INSTALLED = ["animate-expo", "ask-sonner", "pick-ui-library", "write-swift"];
const NOTE_LAW = "In this repo, `DESIGN.md` decides which motion ships: browser-native CSS, Web Animations and view transitions, no animation library, and a complete static path under reduced motion.";
const NOTE_AUTHORITY = "This skill adds no authority: edit files, start a server or dispatch a subagent only when your task covers it, follow `AGENTS.md`, `CLAUDE.md` and `DESIGN.md` as instructions, and keep fixtures, prototypes and plans out of `src/`, which publishes.";
const NOTE_MISSING = "`animate-expo`, `ask-sonner`, `pick-ui-library` and `write-swift` are not installed here";
const NOTE_PUBLIC = "This repository is public: the dated comment under a rule publishes the words it quotes";
// Claude Code lists each auto-invoked skill's description in every session, inside one shared budget.
// The descriptions this repo wrote stay at its 220-character cap; mobile-native keeps upstream's.
const LISTED_DESCRIPTION_BUDGET = 3000;
const DESCRIPTION_CAP = 220;
const UPSTREAM_DESCRIPTION = ["mobile-native"];
// Soft hyphen, zero-width space and non-joiner, direction marks and overrides, word joiner and the
// invisible operators, byte-order mark. The zero-width joiner (0x200d) stays legal: emoji use it.
const INVISIBLE_CODE_POINTS = [
  0x00ad, 0x200b, 0x200c, 0x200e, 0x200f, 0x202a, 0x202b, 0x202c, 0x202d, 0x202e,
  0x2060, 0x2061, 0x2062, 0x2063, 0x2064, 0xfeff
];

const skillFiles = (skill) => fs.readdirSync(path.join(SKILLS_DIR, skill), { withFileTypes: true })
  .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
  .map((entry) => entry.name);
const read = (skill, file) => fs.readFileSync(path.join(SKILLS_DIR, skill, file), "utf8");
const split = (skill) => {
  const text = read(skill, "SKILL.md");
  const end = text.indexOf("\n---\n", 4);
  assert.ok(text.startsWith("---\n") && end !== -1, `${skill} has frontmatter`);
  return { frontmatter: text.slice(4, end + 1), body: text.slice(end + 5) };
};
const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, ".agents", "skills-divergence.json"), "utf8"));
const notice = fs.readFileSync(path.join(SKILLS_DIR, "NOTICE.design-skills"), "utf8");
const emilNotice = notice.slice(notice.indexOf("emilkowalski/skills\n===="));

test("each Emil skill is a real Claude-only directory, named for its folder and declared", () => {
  for (const skill of EMIL_SKILLS) {
    assert.ok(fs.lstatSync(path.join(SKILLS_DIR, skill)).isDirectory(), `${skill} is a real directory`);
    assert.match(split(skill).frontmatter, new RegExp(`^name: ${skill}$`, "m"), `${skill} frontmatter name`);
    const entry = manifest.divergences.find((item) => item.skill === skill);
    assert.ok(entry && entry.only_in === ".claude", `${skill} is declared Claude-only`);
  }
});

test("each Emil skill opens with the repo note and never asks for a greeting-only reply", () => {
  for (const skill of EMIL_SKILLS) {
    const { body } = split(skill);
    const afterTitle = body.replace(/^\s*# [^\n]+\n\n/, "");
    assert.notEqual(afterTitle, body, `${skill} body starts at its title`);
    const note = afterTitle.slice(0, afterTitle.indexOf("\n"));
    assert.ok(note.startsWith(NOTE_LAW), `${skill} states the DESIGN.md motion law under its title`);
    assert.ok(note.includes(NOTE_AUTHORITY), `${skill} says it adds no authority`);
    if (skill === "learn-taste") assert.ok(note.includes(NOTE_PUBLIC), "learn-taste says the repository is public");
    assert.doesNotMatch(body, /Initial Response|respond only with|Do not provide any other information/i, `${skill} has no greeting-only block`);
  }
});

test("the required craft skill keeps the description and review format this repo gave it", () => {
  const { frontmatter, body } = split("emil-design-eng");
  assert.match(frontmatter, /^description: Use when designing, implementing or reviewing UI animation, easing, gesture or component-feel details\. .*repo DESIGN\.md motion limits take precedence\.$/m);
  assert.ok(body.includes("report findings as one markdown table with Before / After / Why columns, one row per issue:"), "review format is the table");
  assert.doesNotMatch(body, /Wrong format \(never do this\)|you MUST use a markdown table/, "the shouted rule and the wrong-format sample stay out");
});

test("none of the four skills left out is present, and a skill that names one says so", () => {
  for (const missing of NOT_INSTALLED) {
    assert.equal(fs.existsSync(path.join(SKILLS_DIR, missing)), false, `${missing} is not installed`);
  }
  for (const skill of EMIL_SKILLS) {
    for (const file of skillFiles(skill)) {
      const text = read(skill, file);
      if (!NOT_INSTALLED.some((missing) => text.replace(NOTE_MISSING, "").includes(missing))) continue;
      assert.equal(file, "SKILL.md", `${skill}/${file} names a skill that is not installed`);
      assert.ok(text.includes(NOTE_MISSING), `${skill} names a skill that is not installed and says so`);
    }
  }
});

test("a pointer to a file or skill beside a skill resolves", () => {
  for (const skill of EMIL_SKILLS) {
    for (const file of skillFiles(skill)) {
      const text = read(skill, file);
      for (const [, sibling] of text.matchAll(/Read `([A-Z-]+\.md)` beside this file/g)) {
        assert.ok(fs.existsSync(path.join(SKILLS_DIR, skill, sibling)), `${skill}/${sibling} exists`);
      }
      for (const [, other] of text.matchAll(/\.\.\/([a-z-]+)\/[A-Z-]+\.md/g)) {
        assert.ok(NOT_INSTALLED.includes(other) || fs.existsSync(path.join(SKILLS_DIR, other)), `${skill}/${file} points at ${other}`);
      }
    }
  }
});

test("the descriptions Claude lists every session stay inside their budget", () => {
  let listed = 0;
  for (const skill of EMIL_SKILLS) {
    const { frontmatter } = split(skill);
    const description = (frontmatter.match(/^description: (.+)$/m) || [])[1];
    assert.ok(description, `${skill} has a one-line description`);
    assert.ok(!NOT_INSTALLED.some((missing) => description.includes(missing)), `${skill} description names a skill that is not installed`);
    if (/^disable-model-invocation: true$/m.test(frontmatter)) continue;
    listed += description.length;
    if (UPSTREAM_DESCRIPTION.includes(skill)) continue;
    assert.ok(description.length <= DESCRIPTION_CAP, `${skill} description is ${description.length} characters, over ${DESCRIPTION_CAP}`);
  }
  assert.ok(listed <= LISTED_DESCRIPTION_BUDGET, `auto-invoked descriptions total ${listed} characters, over ${LISTED_DESCRIPTION_BUDGET}`);
});

test("no skill file hides an invisible character", () => {
  for (const skill of EMIL_SKILLS) {
    for (const file of skillFiles(skill)) {
      const hidden = [...read(skill, file)].filter((character) => INVISIBLE_CODE_POINTS.includes(character.codePointAt(0)));
      assert.equal(hidden.length, 0, `${skill}/${file} holds ${hidden.length} invisible character(s)`);
    }
  }
});

test("the notice pins one upstream commit and names all sixteen skills", () => {
  const pins = emilNotice.match(/^Pinned at: [0-9a-f]{40}\b/gm) || [];
  assert.equal(pins.length, 1, "one pinned commit for emilkowalski/skills");
  for (const skill of EMIL_SKILLS) {
    assert.match(emilNotice, new RegExp(`(^|[\\s,(])${skill}[,.\\s)]`, "m"), `the notice names ${skill}`);
  }
});
