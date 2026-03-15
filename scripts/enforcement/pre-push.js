const fs = require("fs");
const { spawnSync } = require("child_process");
const { isProtectedPush, parsePushRefs } = require("./lib");

function run(command, args) {
  const result = spawnSync(command, args, {
    stdio: "inherit"
  });

  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}

function main() {
  const stdin = fs.readFileSync(0, "utf8");
  const refs = parsePushRefs(stdin);
  const range = "origin/main...HEAD";

  if (!refs.length) {
    process.exit(0);
  }

  run("node", ["scripts/enforcement/verify-release.js", "--paths-only", "--range", range]);

  if (isProtectedPush(refs)) {
    console.log("pre-push: protected main push detected, running release verification");
    run("node", ["scripts/enforcement/verify-release.js", "--range", range]);
  }
}

main();
