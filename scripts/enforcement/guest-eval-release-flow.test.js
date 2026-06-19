const fs = require("fs");
const path = require("path");
const test = require("node:test");
const assert = require("node:assert/strict");

const projectRoot = path.resolve(__dirname, "..", "..");

test("guest eval runs inside the release safety flow", () => {
  const releaseGate = fs.readFileSync(
    path.join(projectRoot, "scripts", "enforcement", "verify-release.js"),
    "utf8"
  );

  assert.match(releaseGate, /label:\s*"eval:guest"/);
  assert.match(releaseGate, /args:\s*\["run", "eval:guest"\]/);
});
