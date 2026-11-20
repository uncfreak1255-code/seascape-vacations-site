const fs = require("fs");
const { spawnSync } = require("child_process");
const { withWorktreeLock } = require("./worktree-lock");
const { assertNodeRuntime, ELEVENTY_CLI } = require("./node-runtime-preflight");

function parseBuildArgs(argv = []) {
  return {
    serve: argv.includes("--serve")
  };
}

function eleventyArgs(options = {}) {
  // Run the locked local Eleventy with this Node. `npx` (even `npx --no`) hangs
  // on a registry lookup or runs a cached copy when node_modules is missing.
  return options.serve ? [ELEVENTY_CLI, "--serve"] : [ELEVENTY_CLI];
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    stdio: "inherit",
    ...options
  });

  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}

function buildSite(options = {}) {
  const serve = Boolean(options.serve);
  fs.rmSync("_site", { recursive: true, force: true });
  run(process.execPath, ["scripts/cache/sync-hostaway-build-cache.js"]);
  run(process.execPath, eleventyArgs({ serve }));
  if (!serve) {
    run(process.execPath, ["scripts/enforcement/validate-properties-availability-output.js"]);
  }
}

function main(argv = process.argv.slice(2)) {
  const options = parseBuildArgs(argv);
  assertNodeRuntime();
  withWorktreeLock({ name: "repo-build" }, () => {
    buildSite(options);
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
  parseBuildArgs,
  eleventyArgs,
  buildSite,
  main
};
