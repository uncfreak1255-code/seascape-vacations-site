"use strict";

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { TRACKER_ID } = require("./mapping");

// Local evidence only. Never creates state, takes a lock, contacts a provider,
// prints a policy reference/token, or establishes fresh provider access.
function inspectWriter(env = process.env, now = new Date().toISOString()) {
  const base = { liveAccessVerified: false, writesPerformed: false };
  const runtime = env.SEASCAPE_RUNTIME_HOME || path.join(os.homedir(), "Library", "Application Support", "seascape-ops");
  const directory = path.join(runtime, "state", "staging", "owner-intelligence");
  const file = path.join(directory, "approved-policy.json");
  if (!fs.existsSync(file)) return { ...base, status: "policy_unavailable" };
  let policy;
  try {
    // Refuse redirected/private inputs rather than following a symlink.
    for (let current = file; ; current = path.dirname(current)) {
      const stat = fs.lstatSync(current);
      if (stat.isSymbolicLink()) throw new Error("redirected_input");
      if (path.dirname(current) === current) break;
    }
    const stat = fs.lstatSync(file);
    if (!stat.isFile() || (stat.mode & 0o077) !== 0 || stat.size > 65536) throw new Error("private_input");
    policy = JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (_error) { return { ...base, status: "private_policy_unreadable" }; }
  const time = value => typeof value === "string" && /(?:Z|[+-]\d{2}:\d{2})$/.test(value) && Number.isFinite(Date.parse(value));
  if (policy?.trackerId !== TRACKER_ID || policy.approvedBy !== "Sawyer" ||
      typeof policy.approvalEvidence !== "string" || !policy.approvalEvidence.trim() ||
      typeof policy.singleWriterId !== "string" || !policy.singleWriterId.trim() ||
      !time(now) || !time(policy.approvedAt) || !time(policy.expiresAt) ||
      Date.parse(policy.approvedAt) > Date.parse(now) || Date.parse(policy.expiresAt) <= Date.parse(now) ||
      Date.parse(policy.expiresAt) - Date.parse(policy.approvedAt) > 86400000) {
    return { ...base, status: "policy_expired_or_invalid" };
  }
  if (!env.OWNER_INTELLIGENCE_WRITER_ID) return { ...base, status: "writer_identity_missing" };
  if (env.OWNER_INTELLIGENCE_WRITER_ID !== policy.singleWriterId) return { ...base, status: "writer_mismatch" };
  return { ...base, status: "local_binding_matches" };
}

module.exports = { inspectWriter };
