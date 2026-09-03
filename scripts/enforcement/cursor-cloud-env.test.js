"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const {
  assertDockerfilePinsNvmrc,
  parseCloudEnvironment,
} = require("./cursor-cloud-env");

const repoRoot = path.resolve(__dirname, "..", "..");
const envPath = path.join(repoRoot, ".cursor", "environment.json");
const dockerfilePath = path.join(repoRoot, ".cursor", "Dockerfile");
const nvmrcPath = path.join(repoRoot, ".nvmrc");

test("empty environment.json fails closed", () => {
  assert.throws(() => parseCloudEnvironment(""), /non-empty JSON/);
  assert.throws(() => parseCloudEnvironment("   \n"), /non-empty JSON/);
});

test("environment.json without npm ci install fails closed", () => {
  assert.throws(() => parseCloudEnvironment("{}"), /install must be a non-empty string/);
  assert.throws(
    () => parseCloudEnvironment('{"install":"npm install"}'),
    /must run npm ci/,
  );
});

test("environment.json rejects sibling-repo access and secret-shaped keys", () => {
  assert.throws(
    () =>
      parseCloudEnvironment(
        JSON.stringify({
          install: "npm ci",
          repositoryDependencies: ["github.com/uncfreak1255-code/seascape-ops"],
        }),
      ),
    /repositoryDependencies/,
  );
  assert.throws(
    () =>
      parseCloudEnvironment(
        JSON.stringify({ install: "npm ci", note: "HOSTAWAY_API_KEY" }),
      ),
    /HOSTAWAY/,
  );
});

test("committed cloud env is a single-repo site machine with pinned Node", () => {
  const env = parseCloudEnvironment(fs.readFileSync(envPath, "utf8"));
  assert.equal(env.name, "seascape-vacations-site");
  assert.equal(env.build?.dockerfile, "Dockerfile");
  assert.equal(env.enable_testing, true);
  assertDockerfilePinsNvmrc(
    fs.readFileSync(dockerfilePath, "utf8"),
    fs.readFileSync(nvmrcPath, "utf8"),
  );
});
