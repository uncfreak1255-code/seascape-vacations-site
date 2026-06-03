const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");

const { buildReleaseScorecard, buildProofIndex } = require("./release-scorecard");

test("buildProofIndex groups desktop and mobile proof by route", () => {
  const proofIndex = buildProofIndex({
    projects: {
      "desktop-chromium": [
        { route: "/", slug: "home", screenshot: "visual-proof/desktop-chromium/home.png" },
      ],
      "mobile-chromium": [
        { route: "/", slug: "home", screenshot: "visual-proof/mobile-chromium/home.png" },
      ],
    },
  });

  assert.deepEqual(proofIndex, [
    {
      route: "/",
      slug: "home",
      screenshots: {
        "desktop-chromium": "visual-proof/desktop-chromium/home.png",
        "mobile-chromium": "visual-proof/mobile-chromium/home.png",
      },
    },
  ]);
});

test("buildReleaseScorecard renders a passing markdown and html report with proof links", () => {
  const repoRoot = fs.mkdtempSync(path.join(os.tmpdir(), "release-scorecard-repo-"));
  const outDir = path.join(repoRoot, "artifacts", "release-scorecard");
  const releaseReceiptPath = path.join(outDir, "verify-release.receipt.json");
  const visualProofReceiptPath = path.join(outDir, "visual-proof", "receipt.json");

  const result = buildReleaseScorecard({
    releaseReceipt: {
      repo_root: repoRoot,
      git: {
        branch: "codex/scorecard-proof-reports",
        range: "origin/main...HEAD",
      },
      path_assertions: [
        { label: "netlify build truth", status: "passed", duration_ms: 0, command: "", error: "" },
      ],
      checks: [
        {
          label: "verify:release",
          status: "passed",
          duration_ms: 1250,
          command: "npm run verify:release",
          error: "",
        },
      ],
      summary: {
        verdict: "pass",
      },
    },
    visualProofReceipt: {
      projects: {
        "desktop-chromium": [
          {
            route: "/",
            slug: "home",
            screenshot: "artifacts/release-scorecard/visual-proof/desktop-chromium/home.png",
          },
        ],
        "mobile-chromium": [
          {
            route: "/",
            slug: "home",
            screenshot: "artifacts/release-scorecard/visual-proof/mobile-chromium/home.png",
          },
        ],
      },
    },
    releaseReceiptPath,
    visualProofReceiptPath,
    outputDir: outDir,
  });

  assert.equal(result.receipt.summary.verdict, "pass");
  assert.match(result.markdown, /# Release Scorecard/);
  assert.match(result.markdown, /Review the diff and attach this scorecard/);
  assert.match(result.markdown, /\| \/ \| \[desktop\]\(visual-proof\/desktop-chromium\/home\.png\)/);
  assert.match(result.html, /<table>/);
  assert.match(result.html, /visual-proof\/receipt\.json/);
  assert.match(result.html, /visual-proof\/desktop-chromium\/home\.png/);
});

test("buildReleaseScorecard surfaces the first failure as the next action", () => {
  const outDir = fs.mkdtempSync(path.join(os.tmpdir(), "release-scorecard-fail-"));
  const result = buildReleaseScorecard({
    releaseReceipt: {
      repo_root: "/repo",
      git: {
        branch: "codex/scorecard-proof-reports",
        range: "origin/main...HEAD",
      },
      path_assertions: [],
      checks: [
        {
          label: "verify:jsonld",
          status: "failed",
          duration_ms: 45,
          command: "npm run verify:jsonld",
          error: "exit 1",
        },
      ],
      summary: {
        verdict: "fail",
      },
    },
    outputDir: outDir,
  });

  assert.equal(result.receipt.summary.verdict, "fail");
  assert.equal(result.receipt.summary.next_action, "Fix failing gate: verify:jsonld");
  assert.match(result.markdown, /Fix failing gate: verify:jsonld/);
  assert.match(result.html, /verify:jsonld/);
});
