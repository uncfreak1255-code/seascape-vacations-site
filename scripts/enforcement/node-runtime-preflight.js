const fs = require("node:fs");
const path = require("node:path");

const PROJECT_ROOT = path.resolve(__dirname, "..", "..");
// The locked Eleventy CLI, relative to the repo root (the build's working directory).
const ELEVENTY_CLI = "node_modules/@11ty/eleventy/cmd.cjs";

// Fail fast before a build or proof chain when the runtime cannot work.
// Without this, a missing node_modules left `npx @11ty/eleventy` stuck on a
// registry lookup and the build sat silent; a Node major that differs from
// .nvmrc makes `npm ci` reject the lockfile (2026-11-20, Node 22 vs 24).
// CI and Netlify pick Node themselves, so there a version mismatch only warns.
function isSet(value) {
  return Boolean(value) && !["0", "false"].includes(String(value).toLowerCase());
}

function checkNodeRuntime({
  projectRootDir = PROJECT_ROOT,
  nodeVersion = process.versions.node,
  env = process.env
} = {}) {
  const errors = [];
  const warnings = [];

  const nvmrcPath = path.join(projectRootDir, ".nvmrc");
  const pinned = fs.existsSync(nvmrcPath)
    ? fs.readFileSync(nvmrcPath, "utf8").trim().replace(/^v/, "")
    : "";
  if (pinned && pinned.split(".")[0] !== String(nodeVersion).split(".")[0]) {
    const message =
      `Node ${nodeVersion} is running; this repo pins Node ${pinned} in .nvmrc. ` +
      `Switch with \`nvm use\` (or put that version first on PATH), then run \`npm ci\`.`;
    if (isSet(env.CI) || isSet(env.NETLIFY)) {
      warnings.push(message);
    } else {
      errors.push(message);
    }
  }

  if (!fs.existsSync(path.join(projectRootDir, ELEVENTY_CLI))) {
    errors.push(
      `node_modules is missing or incomplete (no ${ELEVENTY_CLI}). ` +
        `Run \`npm ci\`${pinned ? ` with Node ${pinned}` : ""} first.`
    );
  }

  return { errors, warnings };
}

function assertNodeRuntime({ log = console.warn, ...options } = {}) {
  const { errors, warnings } = checkNodeRuntime(options);
  for (const warning of warnings) {
    log(`node-runtime-preflight: warning: ${warning}`);
  }
  if (errors.length > 0) {
    throw new Error(`node-runtime-preflight:\n- ${errors.join("\n- ")}`);
  }
}

module.exports = {
  ELEVENTY_CLI,
  checkNodeRuntime,
  assertNodeRuntime
};
