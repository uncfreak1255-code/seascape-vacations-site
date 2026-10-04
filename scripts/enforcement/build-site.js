const fs = require("fs");
const { spawnSync } = require("child_process");
const { withWorktreeLock } = require("./worktree-lock");

function parseBuildArgs(argv = []) {
  return {
    serve: argv.includes("--serve")
  };
}

function eleventyArgs(options = {}) {
  return options.serve ? ["@11ty/eleventy", "--serve"] : ["@11ty/eleventy"];
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
  run("npx", eleventyArgs({ serve }));
  if (!serve) {
    run(process.execPath, ["scripts/enforcement/validate-properties-availability-output.js"]);
  }
}

function main(argv = process.argv.slice(2)) {
  const options = parseBuildArgs(argv);
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
