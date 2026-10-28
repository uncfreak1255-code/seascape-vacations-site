const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync } = require("child_process");
const { assertNoSettlingPageEdits, settlingEntries, LEDGER_PATH } = require("./page-settle-gate");

const NOW = new Date("2026-11-01T12:00:00Z");

// Fixture repos must not inherit a commit hook's GIT_DIR or GIT_INDEX_FILE, which
// would point these git calls at the real repository.
const FIXTURE_ENV = Object.fromEntries(
  Object.entries(process.env).filter(([key]) => !key.startsWith("GIT_"))
);

function ledger(shipped) {
  return JSON.stringify({
    settleDays: 28,
    pages: [{ route: "/guides/a/", sources: ["src/guides/a.html"], pr: 1, shipped }],
  });
}

function makeRepo(shipped = "2026-10-25") {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "settle-gate-"));
  const git = (...args) =>
    execFileSync("git", args, { cwd: dir, env: FIXTURE_ENV, encoding: "utf8" });
  git("init", "-q", "-b", "main");
  git("config", "user.email", "test@example.com");
  git("config", "user.name", "test");
  fs.mkdirSync(path.join(dir, "src/guides"), { recursive: true });
  fs.mkdirSync(path.join(dir, "docs/status"), { recursive: true });
  fs.writeFileSync(path.join(dir, "src/guides/a.html"), "<title>A</title>\n");
  fs.writeFileSync(path.join(dir, "src/guides/b.html"), "<title>B</title>\n");
  fs.writeFileSync(path.join(dir, LEDGER_PATH), ledger(shipped));
  git("add", ".");
  git("commit", "-q", "-m", "base");
  git("branch", "base");
  const run = (range = "base") => assertNoSettlingPageEdits({ range, cwd: dir, env: FIXTURE_ENV, now: NOW });
  return { dir, git, run };
}

test("settle window is shipped date plus settleDays", () => {
  const entries = JSON.parse(ledger("2026-10-25"));
  assert.equal(settlingEntries(entries, NOW).length, 1);
  assert.equal(settlingEntries(entries, new Date("2026-11-22T00:00:00Z")).length, 0);
});

test("fails an edit to a settling page and names it", () => {
  const { dir, git, run } = makeRepo();
  fs.writeFileSync(path.join(dir, "src/guides/a.html"), "<title>A again</title>\n");
  git("commit", "-q", "-am", "retitle");
  assert.throws(() => run(), /\/guides\/a\/ \(PR #1, shipped 2026-10-25\) settles until 2026-11-22[\s\S]*Settle-Override/);
  assert.throws(() => run("base...HEAD"), /settles until/);
});

test("passes other pages, an expired window, and an acknowledged override", () => {
  const { dir, git, run } = makeRepo();
  fs.writeFileSync(path.join(dir, "src/guides/b.html"), "<title>B again</title>\n");
  git("commit", "-q", "-am", "edit b");
  assert.equal(run().status, "passed");

  fs.writeFileSync(path.join(dir, "src/guides/a.html"), "<title>A fixed</title>\n");
  git("commit", "-q", "-am", "fix a\n\nSettle-Override: wrong ferry fact");
  assert.equal(run().status, "acknowledged");

  const expired = makeRepo("2026-09-01");
  fs.writeFileSync(path.join(expired.dir, "src/guides/a.html"), "<title>A later</title>\n");
  expired.git("commit", "-q", "-am", "later edit");
  assert.equal(expired.run().status, "passed");
});

test("the PR that adds an entry is not blocked by it", () => {
  const { dir, git, run } = makeRepo();
  fs.writeFileSync(path.join(dir, LEDGER_PATH), JSON.stringify({ settleDays: 28, pages: [] }));
  git("commit", "-q", "-am", "empty ledger");
  git("branch", "-f", "base");
  fs.writeFileSync(path.join(dir, "src/guides/a.html"), "<title>A shipped</title>\n");
  fs.writeFileSync(path.join(dir, LEDGER_PATH), ledger("2026-10-31"));
  git("commit", "-q", "-am", "ship a and record it");
  assert.equal(run().status, "passed");
});

test("an entry with no shipped date yet holds nothing", () => {
  const unpublished = { settleDays: 28, pages: [{ route: "/guides/a/", sources: ["src/guides/a.html"], pr: 2, shipped: "" }] };
  assert.equal(settlingEntries(unpublished, NOW).length, 0);
  assert.throws(() => settlingEntries(JSON.parse(ledger("soon")), NOW), /invalid shipped date "soon"/);
});

test("a branch cut before a hold landed on main is still held", () => {
  const { dir, git } = makeRepo();
  fs.writeFileSync(path.join(dir, LEDGER_PATH), JSON.stringify({ settleDays: 28, pages: [] }));
  git("commit", "-q", "-am", "empty ledger");
  git("checkout", "-q", "-b", "topic");
  fs.writeFileSync(path.join(dir, "src/guides/a.html"), "<title>A from old branch</title>\n");
  git("commit", "-q", "-am", "edit a");
  git("checkout", "-q", "main");
  fs.writeFileSync(path.join(dir, LEDGER_PATH), ledger("2026-10-25"));
  git("commit", "-q", "-am", "hold a");
  const gate = (range) => assertNoSettlingPageEdits({ range, cwd: dir, env: FIXTURE_ENV, now: NOW });
  assert.throws(() => gate("main...topic"), /\/guides\/a\/ .*settles until/);
});
