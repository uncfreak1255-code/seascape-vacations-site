"use strict";

const fs = require("node:fs");
const { execFileSync } = require("node:child_process");

function isDocumentation(file) {
  return ["AGENTS.md", "CLAUDE.md", "README.md"].includes(file) ||
    (/^docs\/.+\.md$/.test(file) && !/[\r\n]/.test(file));
}

function shouldRunLighthouse(eventName, event, cwd = process.cwd()) {
  if (eventName !== "pull_request") return true;
  const { base, head } = event.pull_request || {};
  if (![base?.sha, head?.sha].every((sha) => /^[a-f0-9]{40}$/.test(sha || ""))) {
    throw new Error("Performance scope requires the PR's full base and head SHAs");
  }
  const git = (args) => execFileSync("git", args, { cwd, encoding: "utf8" });
  // Inspect what this job actually builds, including any newer base changes.
  git(["merge-base", "--is-ancestor", head.sha, "HEAD"]);
  // Disabling rename detection includes the old source path when moved into docs.
  const files = git(["diff", "--no-renames", "--name-only", "-z", base.sha, "HEAD", "--"])
    .split("\0").filter(Boolean);
  return files.length === 0 || files.some((file) => !isDocumentation(file));
}

if (require.main === module) {
  try {
    const eventName = process.env.GITHUB_EVENT_NAME;
    const event = eventName === "pull_request"
      ? JSON.parse(fs.readFileSync(process.env.GITHUB_EVENT_PATH, "utf8")) : {};
    const run = shouldRunLighthouse(eventName, event);
    if (!process.env.GITHUB_OUTPUT) throw new Error("GITHUB_OUTPUT is required");
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `run_lighthouse=${run}\n`);
    console.log(run ? "Full Lighthouse and byte-size checks required" : "Documentation-only PR; required performance check reports without Lighthouse");
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

module.exports = { shouldRunLighthouse };
