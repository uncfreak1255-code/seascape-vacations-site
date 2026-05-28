#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const PROJECT_ROOT = path.resolve(__dirname, "..", "..");
const DEFAULT_INPUT_DIR = path.join(PROJECT_ROOT, "workspace", "dataforseo-phase1-raw");
const DEFAULT_OUTPUT_DIR = path.join(PROJECT_ROOT, "seo-findings");
const SEASCAPE_DOMAIN = "seascape-vacations.com";

function usage(message = null) {
  if (message) console.error(message);
  console.error(
    [
      "Usage: import-dataforseo-findings.js [--input-dir <path>] [--output-dir <path>]",
      "       [--analytics-receipt <path>] [--check]",
    ].join("\n")
  );
  process.exit(1);
}

function parseArgs(argv = process.argv.slice(2)) {
  const args = {
    inputDir: DEFAULT_INPUT_DIR,
    outputDir: DEFAULT_OUTPUT_DIR,
    analyticsReceipt: "",
    check: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--input-dir") {
      args.inputDir = argv[++index] || "";
    } else if (arg === "--output-dir") {
      args.outputDir = argv[++index] || "";
    } else if (arg === "--analytics-receipt") {
      args.analyticsReceipt = argv[++index] || "";
    } else if (arg === "--check") {
      args.check = true;
    } else {
      usage(`Unknown argument: ${arg}`);
    }
  }

  if (!args.inputDir || !args.outputDir) usage("--input-dir and --output-dir are required");
  return args;
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function slugify(value) {
  return String(value || "unknown")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "unknown";
}

function mdCell(value) {
  return String(value ?? "")
    .replace(/\|/g, "\\|")
    .replace(/\r?\n/g, " ")
    .trim();
}

function itemUrl(item) {
  return item.url || item.check_url || "";
}

function itemDomain(item) {
  if (item.domain) return item.domain;
  const url = itemUrl(item);
  if (!url) return "";
  try {
    return new URL(url).hostname;
  } catch {
    return "";
  }
}

function isSeascapeItem(item) {
  return itemDomain(item).replace(/^www\./, "") === SEASCAPE_DOMAIN;
}

function isOrganicLike(item) {
  return ["organic", "featured_snippet", "local_pack", "hotels_pack"].includes(item.type);
}

function classifyIntent(keyword) {
  const normalized = String(keyword || "").toLowerCase();
  if (/management|owner|airbnb|vrbo/.test(normalized)) return "owner-management";
  if (/guide|best time|vs|things to do|where to stay/.test(normalized)) return "guide/research";
  if (/seascape/.test(normalized)) return "local brand";
  if (/book direct|vacation rentals|rentals|beachfront|pool/.test(normalized)) return "guest booking";
  return "unknown";
}

function competitorAngle(item) {
  const domain = itemDomain(item);
  const title = String(item.title || "").toLowerCase();
  const text = `${domain} ${title}`.toLowerCase();
  if (/airbnb|vrbo|booking|tripadvisor|vacasa/.test(text)) return "OTA/directory";
  if (item.type === "local_pack") return "map pack/local operator";
  if (/annamaria|ami|seabreeze|anchor|vacationrentals|locals/.test(text)) return "local inventory";
  if (/gulfislands|mapquest|facebook/.test(text)) return "entity/local citation";
  if (/management|owner/.test(text)) return "owner service";
  return "organic competitor";
}

function recommendedAction({ keyword, seascapeItems, competitors, itemTypes, analyticsGate }) {
  if (analyticsGate?.status === "blocked") {
    return "hold site edits; keep researching until analytics/GSC gate opens";
  }
  if (seascapeItems.length === 0) return "evaluate page angle and internal links before copy work";
  if (itemTypes.includes("local_pack")) return "local/entity work and GBP alignment";
  if (competitors.some((item) => competitorAngle(item) === "OTA/directory")) {
    return "direct-booking trust proof and sharper comparison framing";
  }
  if (/vacation rentals near anna maria island/i.test(keyword)) return "tighten properties/stays angle after proof gate opens";
  return "monitor; no page change from this SERP alone";
}

function parseTask(filePath) {
  const raw = readJson(filePath);
  const task = raw.tasks?.[0] || {};
  const result = task.result?.[0] || {};
  const items = Array.isArray(result.items) ? result.items : [];
  const keyword = result.keyword || task.data?.keyword || path.basename(filePath, ".json");
  const itemTypes = Array.isArray(result.item_types) ? result.item_types : [];
  const organicLike = items.filter(isOrganicLike);
  const seascapeItems = organicLike.filter(isSeascapeItem);
  const competitors = organicLike
    .filter((item) => !isSeascapeItem(item))
    .filter((item) => itemDomain(item) || item.title)
    .slice(0, 8);

  return {
    source_file: path.relative(PROJECT_ROOT, filePath),
    keyword,
    slug: slugify(keyword),
    intent: classifyIntent(keyword),
    datetime: result.datetime || null,
    tag: task.data?.tag || null,
    status_code: task.status_code || raw.status_code || null,
    cost: task.cost ?? raw.cost ?? null,
    check_url: result.check_url || null,
    item_types: itemTypes,
    seascape_visibility: seascapeItems.map((item) => ({
      type: item.type,
      rank_group: item.rank_group ?? null,
      rank_absolute: item.rank_absolute ?? null,
      title: item.title || itemDomain(item),
      url: itemUrl(item) || null,
    })),
    competitors: competitors.map((item) => ({
      type: item.type,
      rank_group: item.rank_group ?? null,
      rank_absolute: item.rank_absolute ?? null,
      domain: itemDomain(item) || null,
      title: item.title || itemDomain(item),
      url: itemUrl(item) || null,
      angle: competitorAngle(item),
    })),
  };
}

function readAnalyticsGate(receiptPath) {
  if (!receiptPath) {
    return {
      status: "unknown",
      label: "No analytics receipt supplied; do not treat findings as site-work authorization.",
    };
  }
  const receipt = readJson(receiptPath);
  return {
    status: receipt.site_work_gate?.status || "unknown",
    label: receipt.site_work_gate?.label || "Analytics receipt did not include site_work_gate.label.",
    latest_gsc_data_date: receipt.latest_gsc_data_date || null,
    window_start: receipt.date_or_window?.window_start || null,
    window_end: receipt.date_or_window?.window_end || null,
    next_branch: receipt.next_branch || null,
    reread_status: receipt.reread_status || null,
    receipt_id: receipt.receipt_id || null,
  };
}

function renderKeywordFinding(finding, analyticsGate) {
  const competitorRows = finding.competitors.length
    ? finding.competitors
        .map((item) => `| ${mdCell(item.type)} | ${item.rank_group ?? ""} | ${mdCell(item.domain)} | ${mdCell(item.angle)} | ${mdCell(item.title)} | ${mdCell(item.url)} |`)
        .join("\n")
    : "| none |  |  |  |  |  |";

  const seascapeRows = finding.seascape_visibility.length
    ? finding.seascape_visibility
        .map((item) => `| ${mdCell(item.type)} | ${item.rank_group ?? ""} | ${item.rank_absolute ?? ""} | ${mdCell(item.title)} | ${mdCell(item.url)} |`)
        .join("\n")
    : "| absent |  |  |  |  |";

  const action = recommendedAction({
    keyword: finding.keyword,
    seascapeItems: finding.seascape_visibility,
    competitors: finding.competitors,
    itemTypes: finding.item_types,
    analyticsGate,
  });

  return `# ${finding.keyword}

## Gate 0

- target keyword/query family: ${finding.keyword}
- searcher intent: ${finding.intent}
- current Seascape URL: ${finding.seascape_visibility[0]?.url || "missing page or absent from captured SERP"}
- current GSC/GA4 decision gate: ${analyticsGate.label}
- top visible competitors or SERP types: ${finding.competitors.slice(0, 3).map((item) => item.domain || item.title).join(", ") || "none captured"}
- Seascape gap: ${finding.seascape_visibility.length ? "visible in captured SERP; compare competitor angles before page edits" : "not visible in captured SERP"}
- recommended action: ${action}

## Seascape Visibility

| type | rank_group | rank_absolute | title | url |
|---|---:|---:|---|---|
${seascapeRows}

## Competitors

| type | rank_group | domain | angle | title | url |
|---|---:|---|---|---|---|
${competitorRows}

## Source

- raw file: \`${finding.source_file}\`
- observed at: ${finding.datetime || "unknown"}
- DataForSEO tag: ${finding.tag || "unknown"}
- item types: ${finding.item_types.join(", ") || "none"}
- check URL captured: ${finding.check_url ? "yes" : "no"}

## Proof Boundary

This finding is research memory only. It does not authorize visible content,
metadata, schema, or internal-link edits while the analytics gate is blocked.
`;
}

function renderIndex(findings, analyticsGate) {
  const rows = findings
    .map((finding) => {
      const topCompetitors = finding.competitors.slice(0, 3).map((item) => item.domain || item.title).join(", ");
      return `| [${finding.keyword}](keywords/${finding.slug}.md) | ${finding.intent} | ${finding.seascape_visibility.length ? "visible" : "absent"} | ${topCompetitors || "none"} |`;
    })
    .join("\n");

  return `# SEO Findings

Durable research memory for Seascape SEO, GEO, and AI-search work.

## Current Proof Gate

- analytics receipt: ${analyticsGate.receipt_id || "not supplied"}
- site work gate: ${analyticsGate.label}
- reread status: ${analyticsGate.reread_status || "unknown"}
- next branch: ${analyticsGate.next_branch || "unknown"}
- GSC latest data date: ${analyticsGate.latest_gsc_data_date || "unknown"}
- decision window: ${analyticsGate.window_start || "unknown"} to ${analyticsGate.window_end || "unknown"}

## Imported Keyword Findings

| query | intent | Seascape captured visibility | top captured competitors |
|---|---|---|---|
${rows || "| none |  |  |  |"}

## Operating Rule

Use these files to remember query, SERP, and competitor evidence across Codex
sessions. Do not use them as proof that content changes are allowed. Site edits
still require \`docs/status/next-batch.md\` to move off blocked freshness and
direct-booking/revenue claims still require analytics proof.
`;
}

function buildDomainIndex(findings) {
  const domains = new Map();
  for (const finding of findings) {
    for (const competitor of finding.competitors) {
      if (!competitor.domain) continue;
      const current = domains.get(competitor.domain) || {
        domain: competitor.domain,
        query_count: 0,
        queries: [],
        angles: new Set(),
      };
      current.query_count += 1;
      current.queries.push(finding.keyword);
      current.angles.add(competitor.angle);
      domains.set(competitor.domain, current);
    }
  }
  return [...domains.values()]
    .map((entry) => ({
      domain: entry.domain,
      query_count: entry.query_count,
      queries: [...new Set(entry.queries)].sort(),
      angles: [...entry.angles].sort(),
    }))
    .sort((a, b) => b.query_count - a.query_count || a.domain.localeCompare(b.domain));
}

function collectFindings(inputDir) {
  return fs
    .readdirSync(inputDir)
    .filter((file) => file.endsWith(".json"))
    .sort()
    .map((file) => parseTask(path.join(inputDir, file)));
}

function writeIfChanged(filePath, contents, check) {
  const current = fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8") : null;
  if (current === contents) return false;
  if (check) throw new Error(`${path.relative(PROJECT_ROOT, filePath)} is not up to date`);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, contents);
  return true;
}

function importFindings(options) {
  const inputDir = path.resolve(options.inputDir);
  const outputDir = path.resolve(options.outputDir);
  const analyticsGate = readAnalyticsGate(options.analyticsReceipt ? path.resolve(options.analyticsReceipt) : "");
  const findings = collectFindings(inputDir);
  const changed = [];

  for (const finding of findings) {
    const outPath = path.join(outputDir, "keywords", `${finding.slug}.md`);
    if (writeIfChanged(outPath, renderKeywordFinding(finding, analyticsGate), options.check)) {
      changed.push(path.relative(PROJECT_ROOT, outPath));
    }
  }

  const indexPath = path.join(outputDir, "README.md");
  if (writeIfChanged(indexPath, renderIndex(findings, analyticsGate), options.check)) {
    changed.push(path.relative(PROJECT_ROOT, indexPath));
  }

  const domainPath = path.join(outputDir, "domains", "index.json");
  const domainJson = `${JSON.stringify(buildDomainIndex(findings), null, 2)}\n`;
  if (writeIfChanged(domainPath, domainJson, options.check)) {
    changed.push(path.relative(PROJECT_ROOT, domainPath));
  }

  const latestPath = path.join(outputDir, "latest-run.json");
  const latestJson = `${JSON.stringify({
    generated_from_latest_observed_at: findings
      .map((finding) => finding.datetime)
      .filter(Boolean)
      .sort()
      .at(-1) || null,
    input_dir: path.relative(PROJECT_ROOT, inputDir),
    analytics_gate: analyticsGate,
    keyword_count: findings.length,
    keywords: findings.map((finding) => finding.keyword),
  }, null, 2)}\n`;
  if (writeIfChanged(latestPath, latestJson, options.check)) {
    changed.push(path.relative(PROJECT_ROOT, latestPath));
  }

  return {
    output_dir: path.relative(PROJECT_ROOT, outputDir),
    keyword_count: findings.length,
    changed,
    analytics_gate: analyticsGate,
  };
}

if (require.main === module) {
  try {
    const result = importFindings(parseArgs());
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

module.exports = {
  buildDomainIndex,
  classifyIntent,
  collectFindings,
  importFindings,
  parseTask,
  slugify,
};
