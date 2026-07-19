// Skills-divergence gate (eng-review decision D16, 2026-07-19).
//
// This repo keeps two repo-local skill dirs: `.agents/skills/` and
// `.claude/skills/`. Any skill directory that exists in one but not the
// other must be declared, with a reason, in `.agents/skills-divergence.json`.
// The gate fails on any UNDECLARED divergence and on any STALE manifest
// entry (a declared divergence that no longer exists).
//
// Scope rule: directories only. A skill is a directory, or a symlink that
// resolves to a directory (`.claude/skills/*` are symlinks into
// `.agents/skills/*` by design — see `.claude/skills/README.md`). Loose files
// such as `.claude/skills/README.md` are documentation, not skills, and are
// ignored. A broken symlink counts as ABSENT, so it surfaces as an
// undeclared divergence and fails the gate — the README forbids broken
// symlinks here.

const fs = require("node:fs");
const path = require("node:path");

const AGENTS_SKILLS_DIR = path.join(".agents", "skills");
const CLAUDE_SKILLS_DIR = path.join(".claude", "skills");
const MANIFEST_PATH = path.join(".agents", "skills-divergence.json");
const VALID_SIDES = [".agents", ".claude"];

function listSkillDirs(absoluteDir) {
  return fs
    .readdirSync(absoluteDir, { withFileTypes: true })
    .filter((entry) => {
      if (entry.isDirectory()) return true;
      if (!entry.isSymbolicLink()) return false;
      try {
        // statSync follows symlinks; throws on broken links.
        return fs.statSync(path.join(absoluteDir, entry.name)).isDirectory();
      } catch {
        return false;
      }
    })
    .map((entry) => entry.name)
    .sort();
}

function validateManifestEntries(entries) {
  const errors = [];
  const seen = new Set();

  for (const [index, entry] of (entries || []).entries()) {
    const label = `manifest entry ${index}`;

    if (!entry || typeof entry !== "object") {
      errors.push(`${label}: must be an object with skill, only_in, reason`);
      continue;
    }

    const skill = typeof entry.skill === "string" ? entry.skill.trim() : "";
    if (!skill) {
      errors.push(`${label}: "skill" must be a non-empty string`);
      continue;
    }

    if (!VALID_SIDES.includes(entry.only_in)) {
      errors.push(
        `${label} (${skill}): "only_in" must be one of ${VALID_SIDES.join(", ")}`
      );
    }

    const reason = typeof entry.reason === "string" ? entry.reason.trim() : "";
    if (!reason) {
      errors.push(`${label} (${skill}): "reason" must be a non-empty string`);
    }

    const key = `${skill}::${entry.only_in}`;
    if (seen.has(key)) {
      errors.push(`${label} (${skill}): duplicate declaration for ${entry.only_in}`);
    }
    seen.add(key);
  }

  return errors;
}

function compareSkillSets({ agentsSkills, claudeSkills, manifestEntries }) {
  const agents = new Set(agentsSkills);
  const claude = new Set(claudeSkills);

  const actual = [];
  for (const skill of [...agents].sort()) {
    if (!claude.has(skill)) actual.push({ skill, only_in: ".agents" });
  }
  for (const skill of [...claude].sort()) {
    if (!agents.has(skill)) actual.push({ skill, only_in: ".claude" });
  }

  const declaredKeys = new Set(
    (manifestEntries || []).map((entry) => `${entry.skill}::${entry.only_in}`)
  );
  const actualKeys = new Set(actual.map((item) => `${item.skill}::${item.only_in}`));

  const undeclared = actual.filter(
    (item) => !declaredKeys.has(`${item.skill}::${item.only_in}`)
  );
  const stale = (manifestEntries || [])
    .filter((entry) => !actualKeys.has(`${entry.skill}::${entry.only_in}`))
    .map((entry) => ({ skill: entry.skill, only_in: entry.only_in }));

  return {
    undeclared,
    stale,
    ok: undeclared.length === 0 && stale.length === 0
  };
}

function loadManifest(repoRoot) {
  const manifestFile = path.join(repoRoot, MANIFEST_PATH);
  if (!fs.existsSync(manifestFile)) {
    return { entries: [], errors: [`missing manifest: ${MANIFEST_PATH}`] };
  }

  let parsed;
  try {
    parsed = JSON.parse(fs.readFileSync(manifestFile, "utf8"));
  } catch (error) {
    return {
      entries: [],
      errors: [`unreadable manifest ${MANIFEST_PATH}: ${error.message}`]
    };
  }

  const entries = Array.isArray(parsed.divergences) ? parsed.divergences : null;
  if (!entries) {
    return {
      entries: [],
      errors: [`manifest ${MANIFEST_PATH} must have a "divergences" array`]
    };
  }

  return { entries, errors: validateManifestEntries(entries) };
}

function runCheck(repoRoot) {
  const agentsSkills = listSkillDirs(path.join(repoRoot, AGENTS_SKILLS_DIR));
  const claudeSkills = listSkillDirs(path.join(repoRoot, CLAUDE_SKILLS_DIR));
  const manifest = loadManifest(repoRoot);

  const comparison = compareSkillSets({
    agentsSkills,
    claudeSkills,
    manifestEntries: manifest.entries
  });

  return {
    ...comparison,
    manifestErrors: manifest.errors,
    ok: comparison.ok && manifest.errors.length === 0
  };
}

function main() {
  const repoRoot = path.resolve(__dirname, "..", "..");
  const result = runCheck(repoRoot);

  for (const message of result.manifestErrors) {
    console.error(`[SKILLS-DIVERGENCE] manifest error: ${message}`);
  }
  for (const item of result.undeclared) {
    console.error(
      `[SKILLS-DIVERGENCE] undeclared divergence: "${item.skill}" exists only in ${item.only_in}/skills — declare it with a reason in ${MANIFEST_PATH}`
    );
  }
  for (const item of result.stale) {
    console.error(
      `[SKILLS-DIVERGENCE] stale manifest entry: "${item.skill}" (only_in ${item.only_in}) no longer diverges — remove it from ${MANIFEST_PATH}`
    );
  }

  if (!result.ok) {
    process.exit(1);
  }
  console.log(
    "[SKILLS-DIVERGENCE] ok: .agents/skills and .claude/skills divergence fully declared"
  );
}

if (require.main === module) {
  main();
}

module.exports = {
  compareSkillSets,
  validateManifestEntries,
  listSkillDirs,
  loadManifest,
  runCheck,
  MANIFEST_PATH
};
