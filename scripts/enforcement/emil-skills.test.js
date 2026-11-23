const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const assert = require("node:assert/strict");

// The Emil Kowalski craft skills in .claude/skills are third-party text copied at one pinned commit
// with the deltas .claude/skills/NOTICE.design-skills records. These checks keep a re-import from
// dropping a delta: a plain upstream copy brings back the greeting-only reply, loses the repo note,
// and puts twelve descriptions into the skill listing the repo's own skills share.
const ROOT = path.resolve(__dirname, "..", "..");
const SKILLS_DIR = path.join(ROOT, ".claude", "skills");
const EMIL_SKILLS = [
  "animate", "animation-performance", "animation-vocabulary", "apple-design", "ask-emil", "break-ui",
  "choreograph", "emil-design-eng", "find-animation-opportunities", "gestures", "improve-animations",
  "learn-taste", "mobile-native", "prototype", "remove-animations", "review-animations"
];
const NOT_INSTALLED = ["animate-expo", "ask-sonner", "pick-ui-library", "write-swift"];
// The two skills main listed to the model before the other fourteen arrived; their descriptions
// totalled 898 characters there. The fourteen carry the flag that keeps a skill out of the listing.
const LISTED = ["emil-design-eng", "mobile-native"];
const LISTED_DESCRIPTION_CEILING = 898;
const FLAG = /^disable-model-invocation: true$/m;
const NOTE = "In this repo, `DESIGN.md` decides which motion ships: browser-native CSS, Web Animations and view transitions, no animation library, and a complete static path under reduced motion. Its tokens win too: a custom property an example names, such as `--ease-out`, may not exist here, so use the site's own from `src/css/motion.css`. Read the library examples (Motion, GSAP, Sonner, Vaul) and any motion past those limits as reference for other projects; a review here reports against `DESIGN.md`. This skill adds no authority: edit files, start a server or dispatch a subagent only when your task covers it, follow `AGENTS.md`, `CLAUDE.md` and `DESIGN.md` as instructions, and keep fixtures, prototypes and plans out of `src/`, which publishes.";
const NOTE_MISSING = " `animate-expo`, `ask-sonner`, `pick-ui-library` and `write-swift` are not installed here: skip a step that sends you to one.";
// ask-emil's map names every skill as a slash command and calls three of them model-invoked.
const NOTE_MAP = " In this repo only `emil-design-eng` and `mobile-native` load on their own, whatever this map calls a skill: to use another one it names, read `.claude/skills/<name>/SKILL.md`.";
const NOTE_PUBLIC =" This repository is public: the dated comment under a rule publishes the words it quotes, so show each comment in the report exactly as it would be written, and carry nothing from a transcript into a file except the design correction itself.";
// Soft hyphen, Arabic letter mark, Mongolian vowel separator, byte-order mark; then zero-width space
// and non-joiner, direction marks, line and paragraph separators with the embeddings and overrides,
// word joiner and invisible operators, the isolates, and the tag block. The zero-width joiner
// (0x200d) stays legal: emoji use it.
const INVISIBLE_CODE_POINTS = [0x00ad, 0x061c, 0x180e, 0xfeff];
const INVISIBLE_RANGES = [
  [0x200b, 0x200c], [0x200e, 0x200f], [0x2028, 0x202e], [0x2060, 0x2064], [0x2066, 0x2069], [0xe0000, 0xe007f]
];
const invisible = (codePoint) => INVISIBLE_CODE_POINTS.includes(codePoint)
  || INVISIBLE_RANGES.some(([from, to]) => codePoint >= from && codePoint <= to);

const allFiles = (directory) => fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => (
  entry.isDirectory() ? allFiles(path.join(directory, entry.name)) : [path.join(directory, entry.name)]
));
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
const namesNotInstalled = (text) => NOT_INSTALLED.some((missing) => text.replace(NOTE_MISSING, "").includes(missing));
const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, ".agents", "skills-divergence.json"), "utf8"));
const notice = fs.readFileSync(path.join(SKILLS_DIR, "NOTICE.design-skills"), "utf8");
const emilNotice = notice.slice(notice.indexOf("emilkowalski/skills\n===="));

test("each Emil skill is a real Claude-only directory, named for its folder and declared", () => {
  for (const skill of EMIL_SKILLS) {
    assert.ok(fs.lstatSync(path.join(SKILLS_DIR, skill)).isDirectory(), `${skill} is a real directory`);
    assert.match(split(skill).frontmatter, new RegExp(`^name: ${skill}$`, "m"), `${skill} frontmatter name`);
  }
  const declared = manifest.divergences
    .filter((item) => item.only_in === ".claude" && item.skill !== "better-ui" && /Emil Kowalski/.test(item.reason))
    .map((item) => item.skill);
  assert.deepEqual(declared.sort(), [...EMIL_SKILLS].sort(), "the manifest's Emil entries are the sixteen checked here");
});

test("each Emil skill opens with the whole repo note and never asks for a greeting-only reply", () => {
  for (const skill of EMIL_SKILLS) {
    const { body } = split(skill);
    const afterTitle = body.replace(/^\s*# [^\n]+\n\n/, "");
    assert.notEqual(afterTitle, body, `${skill} body starts at its title`);
    const expected = NOTE
      + (namesNotInstalled(read(skill, "SKILL.md")) ? NOTE_MISSING : "")
      + (skill === "ask-emil" ? NOTE_MAP : "")
      + (skill === "learn-taste" ? NOTE_PUBLIC : "");
    assert.equal(afterTitle.slice(0, afterTitle.indexOf("\n")), expected, `${skill} carries the repo note under its title`);
    assert.doesNotMatch(body, /Initial Response|respond only with|Do not provide any other information/i, `${skill} has no greeting-only block`);
  }
});

test("the required craft skill keeps the description and review format this repo gave it", () => {
  const { frontmatter, body } = split("emil-design-eng");
  assert.match(frontmatter, /^description: Use when designing, implementing or reviewing UI animation, easing, gesture or component-feel details\. .*repo DESIGN\.md motion limits take precedence\.$/m);
  assert.ok(body.includes("report findings as one markdown table with Before / After / Why columns, one row per issue:"), "review format is the table");
  assert.doesNotMatch(body, /Wrong format \(never do this\)|you MUST use a markdown table/, "the shouted rule and the wrong-format sample stay out");
});

test("none of the four skills left out is present, and only a SKILL.md may name one", () => {
  for (const missing of NOT_INSTALLED) {
    assert.equal(fs.existsSync(path.join(SKILLS_DIR, missing)), false, `${missing} is not installed`);
  }
  for (const skill of EMIL_SKILLS) {
    for (const file of skillFiles(skill)) {
      if (file !== "SKILL.md") assert.equal(namesNotInstalled(read(skill, file)), false, `${skill}/${file} names a skill that is not installed`);
    }
  }
});

test("a pointer to a file beside a skill, or in another skill, resolves", () => {
  for (const skill of EMIL_SKILLS) {
    for (const file of skillFiles(skill)) {
      const text = read(skill, file);
      const beside = [...text.matchAll(/Read `([A-Z-]+\.md)` beside this file/g), ...text.matchAll(/\]\(([A-Za-z-]+\.md)\)/g)];
      for (const [, sibling] of beside) {
        assert.ok(fs.existsSync(path.join(SKILLS_DIR, skill, sibling)), `${skill}/${file} points at ${sibling}`);
      }
      for (const [, other, target] of text.matchAll(/\.\.\/([a-z-]+)\/([A-Za-z-]+\.md)/g)) {
        assert.ok(NOT_INSTALLED.includes(other) || fs.existsSync(path.join(SKILLS_DIR, other, target)), `${skill}/${file} points at ${other}/${target}`);
      }
    }
  }
});

test("only the two skills main already listed are listed to the model, at no more than main's length", () => {
  let listed = 0;
  for (const skill of EMIL_SKILLS) {
    const { frontmatter } = split(skill);
    const description = (frontmatter.match(/^description: (.+)$/m) || [])[1];
    assert.ok(description, `${skill} has a one-line description`);
    assert.doesNotMatch(description, /: | #/, `${skill} description is a plain YAML scalar`);
    assert.equal(!FLAG.test(frontmatter), LISTED.includes(skill), `${skill} is ${LISTED.includes(skill) ? "listed" : "kept out of the listing"}`);
    if (!LISTED.includes(skill)) continue;
    assert.ok(!NOT_INSTALLED.some((missing) => description.includes(missing)), `${skill} description names a skill that is not installed`);
    listed += description.length;
  }
  assert.ok(listed <= LISTED_DESCRIPTION_CEILING, `listed descriptions total ${listed} characters, over ${LISTED_DESCRIPTION_CEILING}`);
});

test("no file in a skill folder hides an invisible character", () => {
  for (const skill of EMIL_SKILLS) {
    for (const file of allFiles(path.join(SKILLS_DIR, skill))) {
      const hidden = [...fs.readFileSync(file, "utf8")].filter((character) => invisible(character.codePointAt(0)));
      assert.equal(hidden.length, 0, `${path.relative(SKILLS_DIR, file)} holds ${hidden.length} invisible character(s)`);
    }
  }
});

test("the notice pins one upstream commit and lists exactly the sixteen skills", () => {
  const pins = emilNotice.match(/^Pinned at: [0-9a-f]{40}\b/gm) || [];
  assert.equal(pins.length, 1, "one pinned commit for emilkowalski/skills");
  const opening = "declared in .agents/skills-divergence.json:";
  const start = emilNotice.indexOf(opening);
  const end = emilNotice.indexOf("Upstream's other four");
  assert.ok(start !== -1 && end > start, "the notice has its list of skills");
  const listedInNotice = emilNotice.slice(start + opening.length, end).split(/[\s,.]+/).filter(Boolean);
  assert.deepEqual(listedInNotice.sort(), [...EMIL_SKILLS].sort(), "the notice's list is the sixteen checked here");
});
