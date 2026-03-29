const fs = require("fs");
const { spawnSync } = require("child_process");
const {
  findForbiddenPublicRuntimePaths,
  findForbiddenSourcePaths,
  findPlaceholderAnalyticsPaths
} = require("./lib");
const { withWorktreeLock } = require("./worktree-lock");

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    stdio: "inherit",
    ...options
  });

  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
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
    range: "origin/main...HEAD"
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
    }
  }

  return parsed;
}

function getChangedFiles(range) {
  if (!range) {
    return [];
  }

  const output = capture("git", ["diff", "--name-only", "--diff-filter=ACMR", range]);
  return output ? output.split("\n").filter(Boolean) : [];
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

function main() {
  const args = parseArgs(process.argv.slice(2));

  try {
    assertNetlifyBuildTruth();
    assertNoForbiddenSourceChanges(args.range);
    assertNoPlaceholderAnalytics();
    assertNoForbiddenPublicRuntime();
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }

  if (args.pathsOnly) {
    console.log("verify-release: path checks passed");
    return;
  }

  withWorktreeLock({ name: "repo-build" }, () => {
    run("npm", ["test"]);
    run("npm", ["run", "build"]);
    run("npm", ["run", "verify:recovery:p0"]);
    run("npm", ["run", "verify:recovery:guides"]);
    run("npm", ["run", "verify:recovery:remediation"]);
    run("npm", ["run", "verify:links"]);
    run("npm", ["run", "verify:jsonld"]);
    run("npm", ["run", "verify:redirects"]);

    console.log("verify-release: all checks passed");
  });
}

main();
