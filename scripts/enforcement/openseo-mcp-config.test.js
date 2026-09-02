const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const projectRoot = path.join(__dirname, "..", "..");
const configPath = path.join(projectRoot, ".codex", "config.toml");

const expectedTools = [
  "whoami",
  "list_projects",
  "list_saved_keywords",
  "get_rank_tracker",
  "get_search_console_performance",
  "inspect_urls",
];

const blockedTools = [
  "research_keywords",
  "get_domain_overview",
  "get_domain_keyword_suggestions",
  "get_backlinks_overview",
  "get_serp_results",
  "get_ranked_keywords",
  "find_serp_competitors",
  "search_local_businesses",
  "get_local_serp_results",
  "get_google_business_questions",
  "get_keyword_metrics",
  "save_keywords",
];

test("OpenSEO MCP config is optional, local, approval-gated, and no-credit", () => {
  const config = fs.readFileSync(configPath, "utf8");
  const toolsBlock = config.match(/enabled_tools\s*=\s*\[([\s\S]*?)\]/);

  assert.match(config, /\[mcp_servers\.openseo\]/);
  assert.match(config, /url\s*=\s*"http:\/\/localhost:3001\/mcp"/);
  assert.match(config, /enabled\s*=\s*true/);
  assert.match(config, /required\s*=\s*false/);
  assert.match(config, /default_tools_approval_mode\s*=\s*"prompt"/);
  assert.ok(toolsBlock, "expected an OpenSEO enabled_tools allowlist");

  const tools = [...toolsBlock[1].matchAll(/"([a-z_]+)"/g)].map((match) => match[1]);
  assert.deepEqual(tools, expectedTools);

  for (const tool of blockedTools) {
    assert.equal(tools.includes(tool), false, `${tool} must remain outside the allowlist`);
  }
});
