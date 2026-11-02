"use strict";
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");

function privateDirectory(env) {
  const runtime = env.SEASCAPE_RUNTIME_HOME || path.join(os.homedir(), "Library", "Application Support", "seascape-ops");
  const directory = path.join(runtime, "state", "staging", "owner-intelligence");
  fs.mkdirSync(directory, { recursive: true, mode: 0o700 });
  const real = fs.realpathSync(directory);
  for (let current = real; ; current = path.dirname(current)) {
    if (fs.existsSync(path.join(current, ".git"))) throw new Error("private_state_inside_repository");
    if (path.dirname(current) === current) break;
  }
  fs.chmodSync(real, 0o700);
  return real;
}

function savePrivate(directory, name, value) {
  const target = path.join(directory, name);
  // Atomic replacement; never follow an existing symlink to a permissive file.
  const temporary = path.join(directory, "." + name + "." + process.pid);
  const fd = fs.openSync(temporary, "wx", 0o600);
  try { fs.writeFileSync(fd, JSON.stringify(value, null, 2) + "\n"); }
  finally { fs.closeSync(fd); }
  fs.renameSync(temporary, target);
}

function readPrivate(directory, name) {
  const file = path.join(directory, name);
  const stat = fs.lstatSync(file);
  if (!stat.isFile() || stat.isSymbolicLink() || (stat.mode & 0o077) !== 0) {
    throw new Error("private_input_permissions_require_review");
  }
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

module.exports = { privateDirectory, savePrivate, readPrivate };
