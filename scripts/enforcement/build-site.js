const fs = require("fs");
const { spawnSync } = require("child_process");
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

function buildSite() {
  fs.rmSync("_site", { recursive: true, force: true });
  run(process.execPath, ["scripts/cache/sync-hostaway-build-cache.js"]);
  run("npx", ["@11ty/eleventy"]);
  run(process.execPath, ["scripts/enforcement/validate-properties-availability-output.js"]);
}

function main() {
  withWorktreeLock({ name: "repo-build" }, () => {
    buildSite();
  });
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
  buildSite,
  main
};
