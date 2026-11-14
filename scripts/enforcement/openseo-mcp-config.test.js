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
  "get_project_context",
  "update_project_context",
  "list_reports",
  "get_report",
  "list_report_templates",
  "save_report",
  "get_ai_visibility_tracker",
  "get_ai_visibility_run",
  "get_ai_visibility_results",
  "get_ai_visibility_answer",
  "get_ai_visibility_sources",
  "get_ai_visibility_trend",
  "estimate_ai_visibility_cost",
  "export_ai_visibility_data",
  "list_google_analytics_properties",
  "list_search_console_sites",
  "get_google_analytics_measurement_health",
  "get_google_analytics_organic_landing_pages",
  "get_google_analytics_page_performance",
  "get_google_analytics_key_events",
  "get_google_analytics_organic_overview",
  "get_google_analytics_traffic_acquisition",
  "get_google_analytics_ecommerce_performance",
  "get_google_analytics_site_search",
  "get_google_analytics_audience_breakdown",
  "get_search_opportunities",
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
  "set_report_sharing",
  "delete_report",
  "run_rank_tracker",
  "run_site_audit",
  "run_ai_visibility_check",
  "save_ai_visibility_tracker",
  "set_ai_visibility_schedule",
  "explore_prompt",
  "research_ai_visibility_prompts",
  "generate_ai_visibility_prompts",
  "set_google_analytics_property",
  "set_search_console_site",
  "submit_indexnow_urls",
];

test("OpenSEO MCP config is optional, local, approval-gated, and bounded", () => {
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
