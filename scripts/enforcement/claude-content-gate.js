#!/usr/bin/env node
// Claude Code Stop hook: deterministic content-voice gate.
//
// Runs `npm run lint:content` when Claude tries to end a turn. If the voice
// lint fails, the hook exits 2 so Claude Code blocks the stop and feeds the
// failure back into the session to fix before finishing. This makes the
// Release Gate's voice check fire automatically instead of relying on the
// agent (or a human) to remember to run it.
//
// Loop guard: Stop hooks can re-trigger themselves. If we are already inside a
// stop-hook retry (`stop_hook_active`) and the lint still fails, we allow the
// stop and surface a loud warning rather than blocking forever.

const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const projectRoot = path.resolve(__dirname, "..", "..");

function readPayload() {
  try {
    const raw = fs.readFileSync(0, "utf8");
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

const payload = readPayload();

const result = spawnSync("npm", ["run", "--silent", "lint:content"], {
  cwd: projectRoot,
  encoding: "utf8"
});

if (result.status === 0) {
  process.exit(0);
}

const output = `${result.stdout || ""}${result.stderr || ""}`.trim();

if (payload.stop_hook_active) {
  process.stderr.write(
    "WARNING: content voice gate (npm run lint:content) is STILL failing after a " +
      "retry. Allowing the turn to end to avoid an infinite loop, but the content " +
      "is NOT clean. Re-run `npm run lint:content` and fix the violations:\n\n" +
      output +
      "\n"
  );
  process.exit(0);
}

process.stderr.write(
  "Content voice gate failed (`npm run lint:content`). Fix the violations below " +
    "before finishing this turn:\n\n" +
    output +
    "\n"
);
process.exit(2);
