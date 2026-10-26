// Fails a release range that edits a page still settling after a published SEO
// change, unless a commit in the range carries a "Settle-Override: <reason>"
// trailer. Rankings take weeks to respond, so a second edit inside the window
// makes the first one impossible to evaluate. The ledger is read at the range
// base, so the PR that ships a change and adds its entry is not blocked.
const { spawnSync } = require("child_process");
const { logRangeFor } = require("./assertion-removal-gate");

const LEDGER_PATH = "docs/status/page-ledger.json";
const TRAILER_PATTERN = /^Settle-Override:\s*\S.*$/im;
const DAY_MS = 24 * 60 * 60 * 1000;

function git(args, cwd, env) {
  return spawnSync("git", args, { cwd, env, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
}

function capture(args, cwd, env) {
  const result = git(args, cwd, env);
  if (result.status !== 0) {
    throw new Error(result.stderr || `git ${args.join(" ")} failed`);
  }
  return result.stdout;
}

function baseRevFor(range, cwd, env) {
  const value = String(range || "").trim();
  if (value.includes("...")) {
    const [left, right] = value.split("...");
    return capture(["merge-base", left || "HEAD", right || "HEAD"], cwd, env).trim();
  }
  if (value.includes("..")) {
    return value.split("..")[0] || "HEAD";
  }
  return capture(["merge-base", value, "HEAD"], cwd, env).trim();
}

function readLedgerAt(rev, cwd, env) {
  const result = git(["show", `${rev}:${LEDGER_PATH}`], cwd, env);
  if (result.status !== 0) {
    return { settleDays: 0, pages: [] };
  }
  return JSON.parse(result.stdout);
}

function settlingEntries(ledger, now) {
  const settleDays = Number(ledger.settleDays) || 0;
  return (ledger.pages || [])
    .map((entry) => {
      const shipped = Date.parse(`${entry.shipped}T00:00:00Z`);
      if (Number.isNaN(shipped)) {
        throw new Error(`${LEDGER_PATH}: ${entry.route} has an invalid shipped date "${entry.shipped}"`);
      }
      return { ...entry, until: new Date(shipped + settleDays * DAY_MS) };
    })
    .filter((entry) => now < entry.until);
}

function assertNoSettlingPageEdits({ range, cwd = process.cwd(), env = process.env, now = new Date() } = {}) {
  if (!range) {
    throw new Error("page settle gate requires a non-empty range");
  }

  const settling = settlingEntries(readLedgerAt(baseRevFor(range, cwd, env), cwd, env), now);
  if (settling.length === 0) {
    return { status: "passed", touched: [] };
  }

  const changed = new Set(
    capture(["diff", "--name-only", "--no-renames", range], cwd, env).split("\n").filter(Boolean)
  );
  const touched = settling.filter((entry) => (entry.sources || []).some((source) => changed.has(source)));
  if (touched.length === 0) {
    return { status: "passed", touched: [] };
  }

  const messages = capture(["log", "--format=%B", logRangeFor(range)], cwd, env);
  if (TRAILER_PATTERN.test(messages)) {
    return { status: "acknowledged", touched: touched.map((entry) => entry.route) };
  }

  const lines = touched.map(
    (entry) =>
      `- ${entry.route} (PR #${entry.pr}, shipped ${entry.shipped}) settles until ${entry.until
        .toISOString()
        .slice(0, 10)}`
  );
  throw new Error(
    [
      "This range edits pages still settling after a published SEO change:",
      ...lines,
      "Wait for the window to end, or, for a real break (wrong fact, broken page, a rescue the",
      'readback supports), add a commit trailer "Settle-Override: <reason>" and say so in the PR body.',
    ].join("\n")
  );
}

module.exports = {
  LEDGER_PATH,
  assertNoSettlingPageEdits,
  baseRevFor,
  settlingEntries,
};
