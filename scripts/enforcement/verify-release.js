const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const {
  findForbiddenPublicRuntimePaths,
  findForbiddenSourcePaths,
  findPlaceholderAnalyticsPaths
} = require("./lib");
const { assertValidFigmaBriefHandoffs } = require("./figma-brief-handoff");
const { assertRepoHtmlCachePolicyConsistency } = require("./release-cache-policy");
const { assertSearchDecisionBriefContract } = require("./search-brief-gate");
const { withWorktreeLock } = require("./worktree-lock");
const {
  assertOwnerBenchmarkProof,
  assertFreshOwnerOperatorProof,
  readOwnerBenchmarkProofAsset,
  readOwnerOperatorProofAssets
} = require("./owner-proof-freshness");
const { normalizeReleaseChecks } = require("./release-scorecard");

function run(command, args, options = {}) {
  const startedAt = process.hrtime.bigint();
  const result = spawnSync(command, args, {
    encoding: "utf8",
    ...options
  });

  if (result.stdout) {
    process.stdout.write(result.stdout);
  }

  if (result.stderr) {
    process.stderr.write(result.stderr);
  }

  return {
    command,
    args,
    durationMs: Number(process.hrtime.bigint() - startedAt) / 1e6,
    status: Number.isInteger(result.status) ? result.status : 1,
    signal: result.signal || "",
  };
}

function capture(command, args, options = {}) {
  const result = spawnSync(command, args, {
    encoding: "utf8",
    ...options
  });

  if (result.status !== 0) {
    const stderr = (result.stderr || "").trim();
    throw new Error(stderr || `Command failed: ${command} ${args.join(" ")}`);
  }

  return (result.stdout || "").trim();
}

function parseArgs(argv) {
  const parsed = {
    pathsOnly: false,
    range: "origin/main...HEAD",
    receiptPath: ""
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--paths-only") {
      parsed.pathsOnly = true;
      continue;
    }

    if (arg === "--range") {
      parsed.range = argv[index + 1];
      index += 1;
      continue;
    }

    if (arg === "--receipt") {
      parsed.receiptPath = argv[index + 1] || "";
      index += 1;
    }
  }

  return parsed;
}

function designLintBaseFromRange(range) {
  const candidate = String(range || "").trim();
  if (!candidate) {
    throw new Error("verify-release requires a non-empty range for design lint");
  }

  const threeDotIndex = candidate.indexOf("...");
  const twoDotIndex = candidate.indexOf("..");
  const separatorIndex = threeDotIndex > 0 ? threeDotIndex : twoDotIndex > 0 ? twoDotIndex : -1;
  return separatorIndex === -1 ? candidate : candidate.slice(0, separatorIndex);
}

function getChangedFiles(range) {
  if (!range) {
    return [];
  }

  const output = capture("git", ["diff", "--name-only", "--diff-filter=ACMR", range]);
  return output ? output.split("\n").filter(Boolean) : [];
}

function currentGitValue(args) {
  return capture("git", args);
}

function assertNetlifyBuildTruth() {
  const contents = fs.readFileSync("netlify.toml", "utf8");

  if (!contents.includes('publish = "_site"')) {
    throw new Error('netlify.toml must publish "_site"');
  }

  if (!contents.includes('command = "npm run build"')) {
    throw new Error('netlify.toml must build with "npm run build"');
  }
}

function assertCachePolicyTruth() {
  assertRepoHtmlCachePolicyConsistency();
}

function assertNoForbiddenSourceChanges(range) {
  const changedFiles = getChangedFiles(range);
  const violations = findForbiddenSourcePaths(changedFiles);

  if (!violations.length) {
    return;
  }

  const message = [
    "Release gate blocked: forbidden legacy-source paths changed.",
    "Move the change into repo-owned source paths instead:",
    ...violations.map((file) => `- ${file}`)
  ].join("\n");

  throw new Error(message);
}

function assertNoPlaceholderAnalytics() {
  const violations = findPlaceholderAnalyticsPaths("src");

  if (!violations.length) {
    return;
  }

  const message = [
    "Release gate blocked: placeholder GA analytics ids remain in source.",
    "Replace G-XXXXXXXXXX with the real site.analytics.ga4MeasurementId in:",
    ...violations.map((file) => `- ${file}`)
  ].join("\n");

  throw new Error(message);
}

function assertNoForbiddenPublicRuntime() {
  const violations = findForbiddenPublicRuntimePaths("src");

  if (!violations.length) {
    return;
  }

  const message = [
    "Release gate blocked: public source still references forbidden runtime dependencies.",
    "Use repo-owned images and local data sources instead:",
    ...violations.map((file) => `- ${file}`)
  ].join("\n");

  throw new Error(message);
}

function assertValidFigmaBriefs(range) {
  assertValidFigmaBriefHandoffs({ range });
}

function buildReceipt({ args, pathAssertions, checks }) {
  const combinedChecks = normalizeReleaseChecks({
    path_assertions: pathAssertions,
    checks,
  });
  const failedChecks = combinedChecks.filter((check) => check.status !== "passed");

  return {
    receipt_type: "release_verification",
    generated_at: new Date().toISOString(),
    source: "scripts/enforcement/verify-release.js",
    repo_root: process.cwd(),
    git: {
      branch: currentGitValue(["branch", "--show-current"]),
      head: currentGitValue(["rev-parse", "HEAD"]),
      range: args.range,
    },
    path_assertions: pathAssertions,
    checks,
    summary: {
      verdict: failedChecks.length > 0 ? "fail" : "pass",
      total_checks: combinedChecks.length,
      failed_checks: failedChecks.length,
      first_failure: failedChecks[0] ? failedChecks[0].label : "",
    }
  };
}

function writeReceipt(receiptPath, payload) {
  if (!receiptPath) {
    return;
  }

  const targetPath = path.resolve(receiptPath);
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  fs.writeFileSync(targetPath, `${JSON.stringify(payload, null, 2)}\n`);
}

function recordAssertion(pathAssertions, label, fn) {
  try {
    fn();
    pathAssertions.push({
      label,
      status: "passed",
      command: "",
      duration_ms: 0,
      error: "",
    });
  } catch (error) {
    pathAssertions.push({
      label,
      status: "failed",
      command: "",
      duration_ms: 0,
      error: error.message,
    });
    throw error;
  }
}

function buildCommandSteps(range) {
  return [
    { label: "property:truth:check", command: "npm", args: ["run", "property:truth:check"] },
    { label: "build", command: "npm", args: ["run", "build"] },
    { label: "test", command: "npm", args: ["run", "test:unit"] },
    {
      label: "lint:design",
      command: "npm",
      args: ["run", "lint:design", "--", "--base", designLintBaseFromRange(range)],
    },
    { label: "verify:redirects", command: "npm", args: ["run", "verify:redirects"] },
    { label: "verify:recovery:p0", command: "npm", args: ["run", "verify:recovery:p0"] },
    { label: "verify:recovery:guides", command: "npm", args: ["run", "verify:recovery:guides"] },
    { label: "verify:recovery:remediation", command: "npm", args: ["run", "verify:recovery:remediation"] },
    { label: "verify:links", command: "npm", args: ["run", "verify:links"] },
    { label: "verify:jsonld", command: "npm", args: ["run", "verify:jsonld"] },
  ];
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const pathAssertions = [];
  const checks = [];
  const commandSteps = buildCommandSteps(args.range);

  try {
    recordAssertion(pathAssertions, "netlify build truth", assertNetlifyBuildTruth);
    recordAssertion(pathAssertions, "cache policy truth", assertCachePolicyTruth);
    recordAssertion(pathAssertions, "forbidden source paths", () =>
      assertNoForbiddenSourceChanges(args.range)
    );
    recordAssertion(pathAssertions, "placeholder analytics", assertNoPlaceholderAnalytics);
    recordAssertion(pathAssertions, "forbidden public runtime", assertNoForbiddenPublicRuntime);
    recordAssertion(pathAssertions, "search decision brief gate", () =>
      assertSearchDecisionBriefContract({ range: args.range })
    );
    recordAssertion(pathAssertions, "valid figma brief handoffs", () =>
      assertValidFigmaBriefs(args.range)
    );
    recordAssertion(pathAssertions, "fresh owner operator proof", () =>
      assertFreshOwnerOperatorProof(readOwnerOperatorProofAssets())
    );
    recordAssertion(pathAssertions, "fresh owner published pricing", () =>
      assertOwnerBenchmarkProof(readOwnerBenchmarkProofAsset())
    );
  } catch (error) {
    writeReceipt(args.receiptPath, buildReceipt({ args, pathAssertions, checks }));
    console.error(error.message);
    process.exit(1);
  }

  if (args.pathsOnly) {
    writeReceipt(args.receiptPath, buildReceipt({ args, pathAssertions, checks }));
    console.log("verify-release: path checks passed");
    return;
  }

  try {
    withWorktreeLock({ name: "repo-build" }, () => {
      for (const step of commandSteps) {
        const result = run(step.command, step.args);
        checks.push({
          label: step.label,
          status: result.status === 0 ? "passed" : "failed",
          command: [step.command, ...step.args].join(" "),
          duration_ms: result.durationMs,
          error:
            result.status === 0
              ? ""
              : result.signal
                ? `signal ${result.signal}`
                : `exit ${result.status}`,
        });

        if (result.status !== 0) {
          throw new Error(
            result.signal
              ? `${step.label} failed from signal ${result.signal}`
              : `${step.label} failed with exit code ${result.status}`
          );
        }
      }
    });
  } catch (error) {
    writeReceipt(args.receiptPath, buildReceipt({ args, pathAssertions, checks }));
    console.error(error.message);
    process.exit(1);
  }

  writeReceipt(args.receiptPath, buildReceipt({ args, pathAssertions, checks }));
  console.log("verify-release: all checks passed");
}

if (require.main === module) {
  main();
}

module.exports = { parseArgs, designLintBaseFromRange, buildCommandSteps };
