"use strict";

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");

const {
  allowEmptyState,
  findProveRedTest,
  refuseSkip,
  skipMessage
} = require("./fail-closed");
const { runGitKitFallback } = require("./git-kit-fallback");
const { main: validateAvailabilityMain } = require("./validate-properties-availability-output");

const AREA_DIR = __dirname;
const PROJECT_ROOT = path.resolve(__dirname, "..", "..");
const NODE = process.execPath;

function readAreaFiles() {
  return fs
    .readdirSync(AREA_DIR)
    .filter((name) => name.endsWith(".js"))
    .map((name) => ({
      name,
      path: path.join(AREA_DIR, name),
      source: fs.readFileSync(path.join(AREA_DIR, name), "utf8")
    }));
}

function runLintEvals() {
  return spawnSync(NODE, [path.join(PROJECT_ROOT, "scripts", "evals", "lint-evals.js")], {
    cwd: PROJECT_ROOT,
    encoding: "utf8",
    env: { ...process.env, ANTHROPIC_API_KEY: "" }
  });
}

test("unnamed skip throws instead of exiting 0", () => {
  assert.throws(() => refuseSkip(), /fail-closed|cannot skip-as-pass/);
  assert.throws(() => refuseSkip("", ""), /cannot skip-as-pass/);
  assert.throws(
    () => allowEmptyState({}),
    /fail-closed: empty-state skip is missing owner; cannot skip-as-pass/
  );
});

test("empty-state skip without a prove-red test throws", () => {
  assert.throws(
    () =>
      allowEmptyState({
        owner: "proof-gate.js",
        reason: "could not resolve HEAD"
      }),
    /missing proveRedTest; cannot skip-as-pass/
  );
});

test("empty-state skip with a missing prove-red test name throws", () => {
  assert.throws(
    () =>
      allowEmptyState({
        owner: "proof-gate.js",
        reason: "could not resolve HEAD",
        proveRedTest: "this prove-red test does not exist"
      }),
    /names missing prove-red test/
  );
});

test("empty areaDir with no test files refuses the same as a missing prove-red test", () => {
  const emptyArea = fs.mkdtempSync(path.join(os.tmpdir(), "fail-closed-empty-area-"));
  try {
    assert.equal(fs.readdirSync(emptyArea).filter((name) => name.endsWith(".test.js")).length, 0);
    assert.throws(
      () =>
        allowEmptyState({
          owner: "proof-gate.js",
          reason: "no working-tree changes",
          proveRedTest: "clean tree is a no-op: does not spend 30s proving nothing changed",
          areaDir: emptyArea
        }),
      /names missing prove-red test/
    );
  } finally {
    fs.rmSync(emptyArea, { recursive: true, force: true });
  }
});

test("every allowEmptyState proveRedTest exists in the same area", () => {
  const pattern = /allowEmptyState\(\s*\{[\s\S]*?proveRedTest:\s*["']([^"']+)["']/g;
  for (const file of readAreaFiles()) {
    if (file.name === "fail-closed.test.js") {
      continue;
    }
    for (const match of file.source.matchAll(pattern)) {
      assert.ok(
        findProveRedTest(match[1]),
        `${file.name} names missing prove-red test "${match[1]}"`
      );
    }
  }
});

test("named legitimate empty state is allowed only when its prove-red test exists", () => {
  const allowed = allowEmptyState({
    owner: "proof-gate.js",
    reason: "no working-tree changes",
    proveRedTest: "clean tree is a no-op: does not spend 30s proving nothing changed"
  });
  assert.equal(allowed.skipped, true);
  assert.ok(findProveRedTest(allowed.proveRedTest));
});

test("enforcement skip paths cannot fail-open without the helper", () => {
  for (const file of readAreaFiles()) {
    if (file.name === "fail-closed.js" || file.name === "fail-closed.test.js") {
      continue;
    }
    if (!file.name.endsWith(".test.js")) {
      assert.doesNotMatch(
        file.source,
        /fail-open/i,
        `${file.name} still documents a fail-open skip`
      );
      assert.doesNotMatch(
        file.source,
        /allowing stop/,
        `${file.name} still allows stop on infrastructure failure`
      );
    } else {
      assert.doesNotMatch(
        file.source,
        /assert\.ok\(\s*true\s*(?:,|;)/,
        `${file.name} still uses assert.ok(true) as a skip-as-pass`
      );
    }
    if (/\b(?:refuseSkip|allowEmptyState)\s*\(/.test(file.source)) {
      assert.match(
        file.source,
        /require\(["']\.\/fail-closed(?:\.js)?["']\)/,
        `${file.name} uses the helper without requiring fail-closed`
      );
    }
  }
});

test("safe-commit without -m fails", () => {
  assert.throws(
    () =>
      runGitKitFallback("safe-commit", ["--stage-source"], {
        kitDir: fs.mkdtempSync(path.join(os.tmpdir(), "fail-closed-no-msg-")),
        spawn: { stdio: "pipe", cwd: PROJECT_ROOT }
      }),
    /git-kit-fallback\.js: safe-commit requires -m <message>; cannot skip-as-pass/
  );
});

test("merge-check without the Mac kit fails", () => {
  assert.throws(
    () =>
      runGitKitFallback("merge-check", [], {
        kitDir: fs.mkdtempSync(path.join(os.tmpdir(), "fail-closed-no-kit-")),
        spawn: { stdio: "pipe" }
      }),
    /git-kit-fallback\.js: merge-check cannot skip-as-pass without the Mac git kit/
  );
});

test("lint:evals with no key fails", () => {
  const result = runLintEvals();
  assert.notEqual(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stderr, /scripts\/evals\/lint-evals\.js: ANTHROPIC_API_KEY is missing; cannot skip-as-pass/);
});

test("missing availability HTML fails", () => {
  const previous = process.env.PROPERTIES_AVAILABILITY_OUTPUT_PATH;
  process.env.PROPERTIES_AVAILABILITY_OUTPUT_PATH = "/tmp/fail-closed-missing-properties.html";
  try {
    assert.throws(
      () => validateAvailabilityMain(),
      /validate-properties-availability-output\.js: missing .* cannot skip-as-pass/
    );
  } finally {
    if (previous === undefined) {
      delete process.env.PROPERTIES_AVAILABILITY_OUTPUT_PATH;
    } else {
      process.env.PROPERTIES_AVAILABILITY_OUTPUT_PATH = previous;
    }
  }
});

test("failed git merge-base can no longer pass via a vacuous assert", () => {
  const source = fs.readFileSync(path.join(AREA_DIR, "content-voice.test.js"), "utf8");
  const start = source.indexOf("function resolveContentLintMergeBase");
  const end = source.indexOf("function getChangedFiles");
  assert.notEqual(start, -1, "content-voice must keep resolveContentLintMergeBase");
  assert.notEqual(end, -1, "content-voice must keep getChangedFiles after merge-base");
  const resolver = source.slice(start, end);
  assert.match(resolver, /refuseSkip\(\s*["']content-voice["']/);
  assert.doesNotMatch(resolver, /assert\.ok\(\s*true/);

  const emptyBin = fs.mkdtempSync(path.join(os.tmpdir(), "fail-closed-no-merge-base-"));
  assert.throws(
    () => {
      try {
        require("node:child_process").execSync("git merge-base HEAD origin/main", {
          cwd: PROJECT_ROOT,
          encoding: "utf8",
          env: { ...process.env, PATH: emptyBin }
        });
      } catch (error) {
        refuseSkip("content-voice", `git merge-base HEAD origin/main failed. ${error.message}`);
      }
      throw new Error("vacuous assert reached after a failed merge-base");
    },
    (error) => {
      assert.match(error.message, /content-voice: git merge-base HEAD origin\/main failed/);
      assert.match(error.message, /cannot skip-as-pass/);
      return true;
    }
  );
  assert.match(skipMessage("content-voice", "git merge-base HEAD origin/main failed"), /cannot skip-as-pass/);
});
