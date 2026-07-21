#!/usr/bin/env node

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const FAMILY_ALIASES = {
  auto: "auto",
  comparison: "comparison",
  compare: "comparison",
  "field-journal": "field-journal",
  journal: "field-journal",
  planning: "planning",
  planner: "planning",
  "destination-overview": "destination-overview",
  destination: "destination-overview",
  overview: "destination-overview",
  page: "site-page",
  "site-page": "site-page",
};

const DESIGN_FAMILIES = {
  comparison: {
    id: "comparison",
    label: "Comparison guide",
    decision: "Help a traveler choose between two places with decisive, side-by-side evidence.",
    shape: "A strong verdict, comparable decision axes, flexible photography, and optional map or travel-time artifacts.",
    capabilities: ["interface-direction", "visual-artifact"],
  },
  "field-journal": {
    id: "field-journal",
    label: "Field journal guide",
    decision: "Help a traveler understand what a place or season actually feels like on the ground.",
    shape: "Observation-led editorial pacing, strong photography, local callouts, and a memorable field-note moment.",
    capabilities: ["interface-direction", "imagery-art-direction"],
  },
  planning: {
    id: "planning",
    label: "Planning guide",
    decision: "Help a traveler finish a trip-planning task with low cognitive load.",
    shape: "A clear sequence, checklist or itinerary structure, and optional timeline, map, or comparison artifact.",
    capabilities: ["interface-direction", "visual-artifact"],
  },
  "destination-overview": {
    id: "destination-overview",
    label: "Destination overview guide",
    decision: "Help a traveler orient to an area and decide what deserves attention first.",
    shape: "Map-led orientation, editorial browsing, varied photo rhythm, and clear next-step paths.",
    capabilities: ["interface-direction", "visual-artifact", "imagery-art-direction"],
  },
  "site-page": {
    id: "site-page",
    label: "General Seascape page",
    decision: "Help the visitor make the page's primary decision with a distinctive Seascape-native hierarchy.",
    shape: "Use the page job and existing family patterns to set the hierarchy; do not force a guide template.",
    capabilities: ["interface-direction"],
  },
};

const KNOWN_DONORS = {
  "frontend-design": {
    capabilities: ["interface-direction"],
    baseScore: 100,
  },
  visualize: {
    capabilities: ["visual-artifact"],
    baseScore: 100,
  },
  "sites-building": {
    capabilities: ["standalone-prototype"],
    baseScore: 55,
    explicitOnly: true,
  },
};

const SKIP_DIRECTORIES = new Set([
  ".git",
  "node_modules",
  "fixtures",
  "tests",
  "evals",
  "legacy",
  ".marketplace-plugin-source-staging",
  ".remote-plugin-install-staging",
]);

function cleanScalar(value) {
  return String(value || "")
    .trim()
    .replace(/^['"]|['"]$/g, "")
    .replace(/[\u0000-\u001f\u007f]+/g, " ")
    .replace(/\s+/g, " ")
    .slice(0, 500);
}

function parseFrontmatter(text) {
  const block = text.match(/^---\s*\r?\n([\s\S]*?)\r?\n---/);
  if (!block) return { name: "", description: "" };

  const field = (name) => {
    const match = block[1].match(new RegExp(`^${name}:\\s*(.+)$`, "m"));
    return cleanScalar(match ? match[1] : "");
  };

  return {
    name: field("name"),
    description: field("description"),
  };
}

function defaultPluginRoots(homeDir = os.homedir()) {
  const roots = [
    {
      root: path.join(homeDir, ".codex", "plugins", "cache"),
      source: "codex-plugin-cache",
      sourcePriority: 30,
    },
    {
      root: path.join(homeDir, ".claude", "plugins", "cache"),
      source: "claude-plugin-cache",
      sourcePriority: 20,
    },
  ];

  const directRoot = path.join(homeDir, ".codex", "plugins");
  if (fs.existsSync(directRoot)) {
    for (const entry of fs.readdirSync(directRoot, { withFileTypes: true })) {
      if (!entry.isDirectory() || entry.name === "cache" || entry.name.startsWith(".")) {
        continue;
      }
      roots.push({
        root: path.join(directRoot, entry.name),
        source: "codex-local-plugin",
        sourcePriority: 40,
      });
    }
  }

  const extraRoots = (process.env.SEASCAPE_DESIGN_PLUGIN_ROOTS || "")
    .split(path.delimiter)
    .map((value) => value.trim())
    .filter(Boolean);
  for (const root of extraRoots) {
    roots.push({ root, source: "configured-plugin-root", sourcePriority: 10 });
  }

  return roots.filter((entry) => fs.existsSync(entry.root));
}

function findSkillFiles(root, limit = 2500) {
  const files = [];
  const pending = [root];

  while (pending.length && files.length < limit) {
    const current = pending.pop();
    let entries;
    try {
      entries = fs.readdirSync(current, { withFileTypes: true });
    } catch {
      continue;
    }

    for (const entry of entries) {
      if (files.length >= limit) break;
      const entryPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        if (!SKIP_DIRECTORIES.has(entry.name)) pending.push(entryPath);
      } else if (entry.isFile() && entry.name === "SKILL.md") {
        files.push(entryPath);
      }
    }
  }

  return files;
}

function inferCapabilities(name, description) {
  const haystack = `${name} ${description}`.toLowerCase();
  const capabilities = [];

  if (
    /(frontend[- ]design|web[- ]design|website[- ]design|product[- ]design|ui[- ]design|ux[- ]design|design[- ]system)/.test(
      haystack
    )
    || /(visual design|web(?:site)? design|interface design|product design|aesthetic direction|visual hierarchy|typography (?:and|with) layout)/.test(
      haystack
    )
  ) {
    capabilities.push("interface-direction");
  }
  if (
    /(visuali[sz]ation|data viz|interactive tool)/.test(haystack)
    || /\b(charts?|graphs?|maps?|diagrams?)\b/.test(haystack)
  ) {
    capabilities.push("visual-artifact");
  }
  if (/(image generation|photoshoot|photograph|moodboard|art direction|scene explorer|shot explorer)/.test(haystack)) {
    capabilities.push("imagery-art-direction");
  }
  if (/(build websites|website builder|frontend app builder|standalone site|prototype)/.test(haystack)) {
    capabilities.push("standalone-prototype");
  }
  if (/(visual qa|design review|design parity|accessibility audit|screenshot review)/.test(haystack)) {
    capabilities.push("rendered-qa");
  }

  return [...new Set(capabilities)];
}

function classifySkill(skill) {
  const name = skill.name.toLowerCase();
  if (
    !/^[a-z0-9][a-z0-9:_-]{0,100}$/.test(name)
    || name.startsWith("artifact-template-")
    || name === "sites-hosting"
  ) {
    return null;
  }

  const known = KNOWN_DONORS[name] || null;
  const isFigma = name.startsWith("figma-") || name === "figma";
  const isImageGenerator = /(imagegen|image-gen|image-generator|photoshoot)/.test(name)
    || /(generate|creat)(?:e|ing)? images?/.test(skill.description.toLowerCase());
  const capabilities = known
    ? known.capabilities
    : inferCapabilities(name, skill.description);
  if (isFigma && !capabilities.includes("interface-direction")) {
    capabilities.push("interface-direction");
  }
  if (isImageGenerator && !capabilities.includes("imagery-art-direction")) {
    capabilities.push("imagery-art-direction");
  }
  if (!capabilities.length) return null;

  const isHiggsfield = name.startsWith("higgsfield-");
  const highConfidenceName = /(?:^|[-:])(frontend|web|website|product|ui|ux|visual)[-:]design(?:$|[-:])/.test(name)
    || /(visuali[sz]|chart|diagram|map|moodboard|imagegen|photoshoot)/.test(name);
  return {
    ...skill,
    capabilities,
    baseScore: known
      ? known.baseScore
      : highConfidenceName || isFigma || isHiggsfield || isImageGenerator
        ? 65
        : 35,
    explicitOnly: Boolean(
      known?.explicitOnly || isFigma || isHiggsfield || isImageGenerator
    ),
  };
}

function discoverDesignDonors(options = {}) {
  const roots = options.roots || defaultPluginRoots(options.homeDir);
  const candidates = [];
  let scannedSkillFiles = 0;

  for (const rootEntry of roots) {
    for (const skillPath of findSkillFiles(rootEntry.root, options.limitPerRoot)) {
      scannedSkillFiles += 1;
      let metadata;
      try {
        metadata = parseFrontmatter(fs.readFileSync(skillPath, "utf8"));
      } catch {
        continue;
      }
      const candidate = classifySkill({
        ...metadata,
        path: cleanScalar(skillPath),
        source: rootEntry.source,
        sourcePriority: rootEntry.sourcePriority || 0,
      });
      if (candidate) candidates.push(candidate);
    }
  }

  const deduped = new Map();
  for (const candidate of candidates) {
    const previous = deduped.get(candidate.name);
    const candidateRank = candidate.baseScore + candidate.sourcePriority;
    const previousRank = previous ? previous.baseScore + previous.sourcePriority : -1;
    if (!previous || candidateRank > previousRank) deduped.set(candidate.name, candidate);
  }

  return {
    roots: roots.map((entry) => ({ root: entry.root, source: entry.source })),
    scannedSkillFiles,
    candidates: [...deduped.values()].sort((a, b) => a.name.localeCompare(b.name)),
  };
}

function inferFamily(taskText) {
  const text = taskText.toLowerCase();
  if (/(\bvs\.?\b|versus|compare|comparison|which (?:is|place)|better for)/.test(text)) {
    return "comparison";
  }
  if (/(field journal|field report|on the ground|month[- ]by[- ]month|best time|season|weather)/.test(text)) {
    return "field-journal";
  }
  if (/(itinerary|checklist|trip plan|planner|packing|getting there|how to|day trip)/.test(text)) {
    return "planning";
  }
  if (/(area guide|destination guide|things to do|neighbou?rhood|beaches|restaurants|where to stay)/.test(text)) {
    return "destination-overview";
  }
  return "site-page";
}

function resolveFamily(taskText, requestedFamily = "auto") {
  const normalized = FAMILY_ALIASES[String(requestedFamily || "auto").toLowerCase()];
  if (!normalized) {
    throw new Error(
      `Unknown design family: ${requestedFamily}. Use comparison, field-journal, planning, destination-overview, site-page, or auto.`
    );
  }
  return DESIGN_FAMILIES[normalized === "auto" ? inferFamily(taskText) : normalized];
}

function explicitCapabilitySignals(taskText) {
  const text = taskText.toLowerCase();
  const signals = new Set();
  if (/(figma|design file|component library)/.test(text)) signals.add("figma");
  if (/(photo|image|imagery|moodboard|art direction|scene|shot)/.test(text)) {
    signals.add("imagery-art-direction");
  }
  if (/(prototype|standalone|microsite)/.test(text)) signals.add("standalone-prototype");
  return signals;
}

function routeDesignTask(taskText, options = {}) {
  const family = resolveFamily(taskText, options.requestedFamily);
  const discovery = options.discovery || discoverDesignDonors(options);
  const explicitSignals = explicitCapabilitySignals(taskText);
  const required = new Set(family.capabilities);

  const ranked = discovery.candidates
    .map((candidate) => {
      const overlap = candidate.capabilities.filter((capability) => required.has(capability));
      const explicitlyUseful =
        (candidate.name.startsWith("figma-") && explicitSignals.has("figma"))
        || candidate.capabilities.some((capability) => explicitSignals.has(capability));
      if (!overlap.length && !explicitlyUseful) return null;
      if (candidate.explicitOnly && !explicitlyUseful) return null;

      return {
        ...candidate,
        matchedCapabilities: [...new Set([...overlap, ...candidate.capabilities.filter((capability) => explicitSignals.has(capability))])],
        score:
          candidate.baseScore
          + candidate.sourcePriority
          + overlap.length * 25
          + (explicitlyUseful ? 20 : 0),
      };
    })
    .filter(Boolean)
    .filter((candidate) => candidate.score >= 100)
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));

  const selected = [];
  const covered = new Set();
  for (const candidate of ranked) {
    const addsCoverage = candidate.matchedCapabilities.some(
      (capability) => !covered.has(capability)
    );
    if (!addsCoverage) continue;
    selected.push(candidate);
    candidate.matchedCapabilities.forEach((capability) => covered.add(capability));
    if (selected.length >= 4) break;
  }

  return {
    family,
    authorities: ["DESIGN.md", "seascape-design-specialist", "seascape-design-critic"],
    selectedDonors: selected.map((candidate) => ({
      name: candidate.name,
      path: candidate.path,
      source: candidate.source,
      capabilities: candidate.capabilities,
      matchedCapabilities: candidate.matchedCapabilities,
      score: candidate.score,
    })),
    scannedSkillFiles: discovery.scannedSkillFiles,
    roots: discovery.roots,
    guard:
      "Discovered donors are optional metadata matches. Invoke one only when it is available in the current agent session; otherwise treat it as a candidate reference. Never auto-install, copy, or promote a donor.",
  };
}

function formatRoute(route) {
  const donors = route.selectedDonors.length
    ? route.selectedDonors
        .map(
          (donor) =>
            `- ${donor.name} [${donor.matchedCapabilities.join(", ")}] (${donor.source})\n  ${donor.path}`
        )
        .join("\n")
    : "- No matching local plugin donor found. Use the repo-local design pair by itself.";

  return [
    `Design family: ${route.family.label} (${route.family.id})`,
    `Visitor decision: ${route.family.decision}`,
    `Suggested shape: ${route.family.shape}`,
    `Plugin skill metadata scanned: ${route.scannedSkillFiles}`,
    "Selected optional donors:",
    donors,
    `Guard: ${route.guard}`,
  ].join("\n");
}

function parseCliArgs(argv) {
  const options = { family: "auto", json: false };
  const taskParts = [];
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--json") {
      options.json = true;
    } else if (arg === "--family") {
      options.family = argv[index + 1] || "";
      index += 1;
    } else if (arg.startsWith("--family=")) {
      options.family = arg.slice("--family=".length);
    } else {
      taskParts.push(arg);
    }
  }
  return { taskText: taskParts.join(" ").trim(), options };
}

function main() {
  const { taskText, options } = parseCliArgs(process.argv.slice(2));
  if (!taskText) {
    console.error(
      'Usage: node scripts/design/design-donor-router.js "<design task>" [--family <family>] [--json]'
    );
    process.exit(1);
  }
  const route = routeDesignTask(taskText, { requestedFamily: options.family });
  process.stdout.write(options.json ? `${JSON.stringify(route, null, 2)}\n` : `${formatRoute(route)}\n`);
}

if (require.main === module) main();

module.exports = {
  DESIGN_FAMILIES,
  classifySkill,
  defaultPluginRoots,
  discoverDesignDonors,
  findSkillFiles,
  formatRoute,
  inferFamily,
  parseCliArgs,
  parseFrontmatter,
  resolveFamily,
  routeDesignTask,
};
