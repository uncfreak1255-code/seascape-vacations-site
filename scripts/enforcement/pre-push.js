const fs = require("fs");
const { spawnSync } = require("child_process");
const { findDeploySensitivePaths, isProtectedPush, parsePushRefs } = require("./lib");

function run(command, args) {
  const result = spawnSync(command, args, {
    stdio: "inherit"
  });

  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}

function capture(command, args) {
  const result = spawnSync(command, args, {
    encoding: "utf8"
  });

  if (result.status !== 0) {
    const stderr = (result.stderr || "").trim();
    throw new Error(stderr || `Command failed: ${command} ${args.join(" ")}`);
  }

  return (result.stdout || "").trim();
}

function getChangedFiles(range) {
  if (!range) {
    return [];
  }

  const output = capture("git", ["diff", "--name-only", "--diff-filter=ACMR", range]);
  return output ? output.split("\n").filter(Boolean) : [];
}

function buildVerificationPlan({ refs, changedFiles, range }) {
  const commands = [
    {
      command: "node",
      args: ["scripts/enforcement/verify-release.js", "--paths-only", "--range", range]
    }
  ];
  const deploySensitivePaths = findDeploySensitivePaths(changedFiles);
  let fullVerificationReason = null;

  if (isProtectedPush(refs)) {
    fullVerificationReason = "protected main push detected";
  } else if (deploySensitivePaths.length) {
    fullVerificationReason = "deploy-sensitive changes detected";
  }

  if (fullVerificationReason) {
    commands.push({
      command: "node",
      args: ["scripts/enforcement/verify-release.js", "--range", range]
    });
  }

  return {
    commands,
    deploySensitivePaths,
    fullVerificationReason
  };
}

function main() {
  const stdin = fs.readFileSync(0, "utf8");
  const refs = parsePushRefs(stdin);
  const range = "origin/main...HEAD";

  if (!refs.length) {
    process.exit(0);
  }

  const changedFiles = getChangedFiles(range);
  const plan = buildVerificationPlan({ refs, changedFiles, range });

  if (plan.fullVerificationReason) {
    console.log(`pre-push: ${plan.fullVerificationReason}, running release verification`);
    if (plan.deploySensitivePaths.length) {
      for (const file of plan.deploySensitivePaths) {
        console.log(`- ${file}`);
      }
    }
  }

  for (const step of plan.commands) {
    run(step.command, step.args);
  }
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

module.exports = {
  buildVerificationPlan,
  getChangedFiles,
  main
};
