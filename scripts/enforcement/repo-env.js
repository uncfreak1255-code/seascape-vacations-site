const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const defaultProjectRoot = path.resolve(__dirname, "..", "..");

function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function resolveGitCommonRoot({ cwd = defaultProjectRoot, spawnSyncImpl = spawnSync } = {}) {
  const result = spawnSyncImpl("git", ["rev-parse", "--git-common-dir"], {
    cwd,
    encoding: "utf8"
  });

  if (!result || result.status !== 0) {
    return "";
  }

  const commonDir = normalizeText(result.stdout);
  if (!commonDir) {
    return "";
  }

  return path.dirname(path.resolve(cwd, commonDir));
}

function getEnvFileCandidates({
  projectRoot = defaultProjectRoot,
  cwd = projectRoot,
  spawnSyncImpl = spawnSync
} = {}) {
  const roots = [path.resolve(projectRoot)];
  const gitCommonRoot = resolveGitCommonRoot({ cwd, spawnSyncImpl });

  if (gitCommonRoot && !roots.includes(gitCommonRoot)) {
    roots.push(gitCommonRoot);
  }

  return roots.flatMap((root) => [
    path.join(root, ".secrets.env"),
    path.join(root, ".env")
  ]);
}

function readEnvFileValue(key, options = {}) {
  for (const candidate of getEnvFileCandidates(options)) {
    if (!fs.existsSync(candidate)) {
      continue;
    }

    const lines = fs.readFileSync(candidate, "utf8").split(/\r?\n/);
    for (let index = lines.length - 1; index >= 0; index -= 1) {
      const line = lines[index];
      if (!line.startsWith(`${key}=`)) {
        continue;
      }

      return normalizeText(line.slice(key.length + 1)).replace(/^['"]|['"]$/g, "");
    }
  }

  return "";
}

module.exports = {
  defaultProjectRoot,
  getEnvFileCandidates,
  readEnvFileValue,
  resolveGitCommonRoot
};
