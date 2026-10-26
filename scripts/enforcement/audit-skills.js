#!/usr/bin/env node
// Read-only skill audit (`npm run audit:skills`), added 2026-10-25.
//
// Answers one question per repo-local skill: is it pulling its weight?
// For every skill in `.agents/skills/` and `.claude/skills/` it reports
// usage in Claude and Codex over a window, whether Claude can reach it
// (`skillOverrides` in ~/.claude/settings.json), its last git change,
// description health, and file pointers that no longer exist. It then
// gives a KEEP / WATCH / CHANGE / RETIRE? verdict.
//
// Usage data lives on Sawyer's Mac, not in this repo. When a source is
// missing (CI, a fresh machine) that column reads UNAVAILABLE and no
// skill is marked RETIRE? on it: a broken sensor is not an empty set.
// The script writes nothing; it prints Markdown, or JSON with --json.
//
//   npm run audit:skills -- [--days 90] [--json]

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const REPO_ROOT = path.resolve(__dirname, "..", "..");
const SKILL_ROOTS = [path.join(".agents", "skills"), path.join(".claude", "skills")];
const DESCRIPTION_CAP = 220;
// A thread or session that opens this many distinct skills is reviewing
// the library, not working with one; same rule as ~/.claude/STATE.md.
const LIBRARY_SCAN_THRESHOLD = 10;
const RETIRE_MIN_AGE_DAYS = 30;
const SKILL_PATH_RE = /skills\/([a-z0-9][a-z0-9-]*)\/SKILL\.md/g;
const PAGING_VERB_RE = /(^|[\s'"(;|&])(cat|sed|head|tail|nl|less|more|bat)\s/;
const POINTER_RE = /`((?:src|docs|scripts|tests|plugins|\.agents|\.claude)\/[^`\s*<>{}]+)`/g;

function parseArgs(argv) {
  const args = { days: 90, json: false };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === "--json") args.json = true;
    else if (argv[i] === "--days") args.days = Number(argv[++i]);
  }
  if (!Number.isFinite(args.days) || args.days <= 0) {
    throw new Error("--days must be a positive number");
  }
  return args;
}

function readFrontmatter(text) {
  const match = /^---\n([\s\S]*?)\n---/.exec(text);
  const fields = {};
  if (!match) return fields;
  for (const line of match[1].split("\n")) {
    const kv = /^([a-z-]+):\s*(.*)$/.exec(line);
    if (kv) fields[kv[1]] = kv[2].replace(/^["']|["']$/g, "");
  }
  return fields;
}

function inventory(repoRoot) {
  const skills = new Map();
  for (const root of SKILL_ROOTS) {
    const abs = path.join(repoRoot, root);
    if (!fs.existsSync(abs)) continue;
    for (const name of fs.readdirSync(abs)) {
      const skillFile = path.join(abs, name, "SKILL.md");
      if (!fs.existsSync(skillFile)) continue;
      const entry = skills.get(name) || { name, surfaces: [], dir: path.join(root, name) };
      entry.surfaces.push(root.startsWith(".agents") ? "agents" : "claude");
      if (!entry.text) {
        entry.text = fs.readFileSync(skillFile, "utf8");
        // Prefer the canonical .agents path for git history.
        entry.dir = path.join(root, name);
      }
      skills.set(name, entry);
    }
  }
  return skills;
}

function lastChange(repoRoot, dir) {
  try {
    const out = execFileSync("git", ["log", "-1", "--format=%cs", "--", dir], {
      cwd: repoRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"]
    }).trim();
    return out || null;
  } catch {
    return null;
  }
}

function brokenPointers(repoRoot, text) {
  const broken = new Set();
  for (const match of text.matchAll(POINTER_RE)) {
    const target = match[1].replace(/[#:].*$/, "").replace(/[.,)]+$/, "");
    if (!fs.existsSync(path.join(repoRoot, target))) broken.add(target);
  }
  return [...broken];
}

function readOverrides(settingsPath) {
  try {
    return JSON.parse(fs.readFileSync(settingsPath, "utf8")).skillOverrides || {};
  } catch {
    return null;
  }
}

// Counts distinct units (threads or sessions) per skill, plus the
// "focused" subset that touched fewer than LIBRARY_SCAN_THRESHOLD skills.
function tally(unitSkills, known) {
  const counts = {};
  for (const skills of unitSkills.values()) {
    const focused = skills.size < LIBRARY_SCAN_THRESHOLD;
    for (const name of skills) {
      if (!known.has(name)) continue;
      counts[name] = counts[name] || { all: 0, focused: 0 };
      counts[name].all += 1;
      if (focused) counts[name].focused += 1;
    }
  }
  return counts;
}

function codexUsage(dbPath, sinceMs, known) {
  if (!fs.existsSync(dbPath)) return null;
  let rows;
  try {
    rows = execFileSync(
      "sqlite3",
      [
        "-readonly",
        "-separator",
        "\t",
        dbPath,
        "select thread_id, json_extract(item_json,'$.command') from thread_items " +
          `where item_type='commandExecution' and created_at_ms >= ${Math.floor(sinceMs)} ` +
          "and item_json like '%SKILL.md%';"
      ],
      { encoding: "utf8", maxBuffer: 256 * 1024 * 1024, stdio: ["ignore", "pipe", "ignore"] }
    );
  } catch {
    return null;
  }
  const threads = new Map();
  for (const line of rows.split("\n")) {
    const tab = line.indexOf("\t");
    if (tab < 0) continue;
    const command = line.slice(tab + 1);
    if (!PAGING_VERB_RE.test(command)) continue;
    const thread = line.slice(0, tab);
    for (const match of command.matchAll(SKILL_PATH_RE)) {
      if (!threads.has(thread)) threads.set(thread, new Set());
      threads.get(thread).add(match[1]);
    }
  }
  return tally(threads, known);
}

function claudeSkillNames(record) {
  const names = [];
  const content = record && record.message && record.message.content;
  if (!Array.isArray(content)) return names;
  for (const block of content) {
    if (!block || block.type !== "tool_use" || !block.input) continue;
    if (block.name === "Skill" && typeof block.input.skill === "string") {
      names.push(block.input.skill.split(":").pop());
    } else if (block.name === "Read" && typeof block.input.file_path === "string") {
      for (const match of block.input.file_path.matchAll(SKILL_PATH_RE)) names.push(match[1]);
    }
  }
  return names;
}

function claudeUsage(projectsDir, sinceMs, known) {
  if (!fs.existsSync(projectsDir)) return null;
  const sessions = new Map();
  for (const project of fs.readdirSync(projectsDir)) {
    const projectDir = path.join(projectsDir, project);
    let files;
    try {
      files = fs.readdirSync(projectDir).filter((f) => f.endsWith(".jsonl"));
    } catch {
      continue;
    }
    for (const file of files) {
      const full = path.join(projectDir, file);
      if (fs.statSync(full).mtimeMs < sinceMs) continue;
      const text = fs.readFileSync(full, "utf8");
      if (!text.includes('"Skill"') && !text.includes("SKILL.md")) continue;
      for (const line of text.split("\n")) {
        if (!line.includes('"Skill"') && !line.includes("SKILL.md")) continue;
        let record;
        try {
          record = JSON.parse(line);
        } catch {
          continue;
        }
        if (record.timestamp && Date.parse(record.timestamp) < sinceMs) continue;
        for (const name of claudeSkillNames(record)) {
          if (!sessions.has(full)) sessions.set(full, new Set());
          sessions.get(full).add(name);
        }
      }
    }
  }
  return tally(sessions, known);
}

function daysSince(isoDate, now) {
  if (!isoDate) return null;
  return Math.floor((now - Date.parse(isoDate)) / 86400000);
}

// Pure verdict so the rules are testable without a Mac's usage data.
function verdict(row) {
  const reasons = [];
  if (row.reachable === false) reasons.push("disabled in Claude skillOverrides");
  // The cap and trigger rules bind the canonical .agents skills; Claude-only
  // third-party skills stay verbatim at their pinned upstream commit.
  if (row.canonical && row.descriptionLength > DESCRIPTION_CAP) {
    reasons.push(`description ${row.descriptionLength} > ${DESCRIPTION_CAP} chars`);
  }
  if (row.canonical && !row.hasTrigger) reasons.push("description has no 'Use when/for' trigger");
  if (row.brokenPointers.length) reasons.push(`missing paths: ${row.brokenPointers.join(", ")}`);
  if (reasons.length) return { verdict: "CHANGE", reasons };

  const sensorsUp = row.claude !== null && row.codex !== null;
  const focused = (row.claude ? row.claude.focused : 0) + (row.codex ? row.codex.focused : 0);
  const all = (row.claude ? row.claude.all : 0) + (row.codex ? row.codex.all : 0);
  if (!sensorsUp) return { verdict: "KEEP", reasons: ["usage UNAVAILABLE; no retirement call"] };
  if (all === 0 && (row.ageDays === null || row.ageDays >= RETIRE_MIN_AGE_DAYS)) {
    return { verdict: "RETIRE?", reasons: ["no use in Claude or Codex this window; confirm with Sawyer's intent before deleting"] };
  }
  if (focused < 3) return { verdict: "WATCH", reasons: [`only ${focused} focused uses`] };
  return { verdict: "KEEP", reasons: [] };
}

function audit({ repoRoot = REPO_ROOT, days = 90, home = os.homedir(), now = Date.now() } = {}) {
  const sinceMs = now - days * 86400000;
  const skills = inventory(repoRoot);
  const known = new Set(skills.keys());
  const overrides = readOverrides(path.join(home, ".claude", "settings.json"));
  const claude = claudeUsage(path.join(home, ".claude", "projects"), sinceMs, known);
  const codex = codexUsage(path.join(home, ".codex", "thread_history_1.sqlite"), sinceMs, known);

  const rows = [...skills.values()]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((skill) => {
      const fm = readFrontmatter(skill.text);
      const description = fm.description || "";
      const changed = lastChange(repoRoot, skill.dir);
      const row = {
        name: skill.name,
        surfaces: skill.surfaces.join("+"),
        canonical: skill.surfaces.includes("agents"),
        reachable: overrides === null ? null : overrides[skill.name] !== "off",
        explicitOnly: fm["disable-model-invocation"] === "true",
        descriptionLength: description.length,
        hasTrigger: /\buse (when|for|to|on)\b/i.test(description),
        lastChange: changed,
        ageDays: daysSince(changed, now),
        brokenPointers: brokenPointers(repoRoot, skill.text),
        claude: claude === null ? null : claude[skill.name] || { all: 0, focused: 0 },
        codex: codex === null ? null : codex[skill.name] || { all: 0, focused: 0 }
      };
      return { ...row, ...verdict(row) };
    });

  return {
    generatedAt: new Date(now).toISOString(),
    windowDays: days,
    sensors: {
      claudeTranscripts: claude === null ? "UNAVAILABLE" : "ok",
      codexThreads: codex === null ? "UNAVAILABLE" : "ok",
      skillOverrides: overrides === null ? "UNAVAILABLE" : "ok"
    },
    rows
  };
}

function cell(usage) {
  return usage === null ? "UNAVAILABLE" : `${usage.all} (${usage.focused})`;
}

function toMarkdown(report) {
  const lines = [
    `# Skill audit — last ${report.windowDays} days`,
    "",
    `Generated ${report.generatedAt}. Sensors: Claude transcripts ${report.sensors.claudeTranscripts}, ` +
      `Codex threads ${report.sensors.codexThreads}, skillOverrides ${report.sensors.skillOverrides}.`,
    "Usage cells are `sessions (focused)`; focused excludes sessions that opened 10+ skills.",
    "RETIRE? is a proposal for Sawyer, never an instruction to delete.",
    "",
    "| skill | surfaces | Claude | Codex | last change | verdict | why |",
    "|---|---|---|---|---|---|---|"
  ];
  for (const row of report.rows) {
    lines.push(
      `| ${row.name} | ${row.surfaces} | ${cell(row.claude)} | ${cell(row.codex)} | ` +
        `${row.lastChange || "?"} | ${row.verdict} | ${row.reasons.join("; ")} |`
    );
  }
  return lines.join("\n");
}

if (require.main === module) {
  const args = parseArgs(process.argv.slice(2));
  const report = audit({ days: args.days });
  process.stdout.write(args.json ? `${JSON.stringify(report, null, 2)}\n` : `${toMarkdown(report)}\n`);
}

module.exports = { audit, verdict, tally, claudeSkillNames, brokenPointers, readFrontmatter, toMarkdown };
