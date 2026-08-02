"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const repoRoot = path.resolve(__dirname, "..", "..");

test("repo settings do not register response-blocking Stop hooks", () => {
  const settings = JSON.parse(
    fs.readFileSync(path.join(repoRoot, ".claude", "settings.json"), "utf8"),
  );

  assert.deepEqual(settings.hooks?.Stop || [], []);
});
