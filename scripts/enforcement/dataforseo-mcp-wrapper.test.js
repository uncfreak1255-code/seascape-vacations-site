const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const projectRoot = path.join(__dirname, "..", "..");

test("project DataForSEO MCP config uses the local wrapper without inline credentials", () => {
  const configPath = path.join(projectRoot, ".mcp.json");
  const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
  const server = config.mcpServers?.dataforseo;

  assert.ok(server, "expected a dataforseo MCP server entry");
  assert.equal(server.command, "./scripts/mcp/dataforseo-mcp.sh");
  assert.deepEqual(server.args, []);

  const env = server.env || {};
  assert.equal(env.ENABLED_MODULES, "SERP,KEYWORDS_DATA,DATAFORSEO_LABS,BACKLINKS,DOMAIN_ANALYTICS,AI_OPTIMIZATION,BUSINESS_DATA");
  assert.equal(env.DATAFORSEO_FULL_RESPONSE, "false");
  assert.equal(env.DATAFORSEO_SIMPLE_FILTER, "false");
  assert.equal(Object.hasOwn(env, "DATAFORSEO_USERNAME"), false);
  assert.equal(Object.hasOwn(env, "DATAFORSEO_PASSWORD"), false);
});

test("DataForSEO MCP wrapper loads secrets from Keychain and exposes a no-API check mode", () => {
  const scriptPath = path.join(projectRoot, "scripts", "mcp", "dataforseo-mcp.sh");
  const script = fs.readFileSync(scriptPath, "utf8");

  assert.match(script, /security find-generic-password/);
  assert.match(script, /DATAFORSEO_KEYCHAIN_SERVICE/);
  assert.match(script, /--check/);
  assert.match(script, /exec npx -y "\$DATAFORSEO_MCP_PACKAGE"/);
  assert.doesNotMatch(script, /echo "\$DATAFORSEO_(USERNAME|PASSWORD)"/);
  assert.doesNotMatch(script, /DATAFORSEO_(USERNAME|PASSWORD)=.+your_/);
});

test("package exposes the project DataForSEO no-API check", () => {
  const packagePath = path.join(projectRoot, "package.json");
  const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8"));

  assert.equal(packageJson.scripts["dataforseo:mcp:check"], "./scripts/mcp/dataforseo-mcp.sh --check");
});
