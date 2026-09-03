"use strict";

const FORBIDDEN_SUBSTRINGS = [
  "HOSTAWAY",
  "NETLIFY_AUTH",
  "MAILCHIMP",
  "DISCORD_TOKEN",
  "BEGIN ",
];

function parseCloudEnvironment(text) {
  if (typeof text !== "string" || text.trim() === "") {
    throw new Error("environment.json must be non-empty JSON");
  }

  const parsed = JSON.parse(text);
  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("environment.json must be a JSON object");
  }

  if (typeof parsed.install !== "string" || parsed.install.trim() === "") {
    throw new Error("environment.json install must be a non-empty string");
  }

  if (!/\bnpm ci\b/.test(parsed.install)) {
    throw new Error("environment.json install must run npm ci");
  }

  if (
    Array.isArray(parsed.repositoryDependencies) &&
    parsed.repositoryDependencies.length > 0
  ) {
    throw new Error("site cloud env must not declare repositoryDependencies");
  }

  const blob = JSON.stringify(parsed);
  for (const needle of FORBIDDEN_SUBSTRINGS) {
    if (blob.includes(needle)) {
      throw new Error(`environment.json must not contain ${needle}`);
    }
  }

  return parsed;
}

function assertDockerfilePinsNvmrc(dockerfileText, nvmrcText) {
  const nodeVersion = String(nvmrcText || "").trim();
  if (!nodeVersion) {
    throw new Error(".nvmrc must name a Node version");
  }

  const dockerfile = String(dockerfileText || "").trim();
  if (!dockerfile) {
    throw new Error(".cursor/Dockerfile must be non-empty");
  }

  const fromMatch = dockerfile.match(/^FROM\s+node:([^\s]+)/m);
  if (!fromMatch) {
    throw new Error(".cursor/Dockerfile must start from an official node image");
  }

  const [imageVersion] = fromMatch[1].split("-");
  if (imageVersion !== nodeVersion) {
    throw new Error(
      `.cursor/Dockerfile node ${imageVersion} must match .nvmrc ${nodeVersion}`,
    );
  }
}

module.exports = {
  parseCloudEnvironment,
  assertDockerfilePinsNvmrc,
};
