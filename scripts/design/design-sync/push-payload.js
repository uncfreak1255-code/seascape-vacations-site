"use strict";

// Turns the bundle's writes and deletes into the exact DesignSync arguments, so a
// sync never hand-assembles them. DesignSync limits: at most 256 entries in a
// finalize_plan list or write_files call; localPath is relative
// to the plan's localDir; every call after list_projects needs projectId.

const PROJECT_NAME = "Seascape Vacations Design System";
const LIMIT = 256;

function buildPushPayload({ outDir, writes, deletes }) {
  if (writes.length > LIMIT || deletes.length > LIMIT) {
    throw new Error(`DesignSync plan lists are capped at ${LIMIT} entries; use globs in push-payload.js.`);
  }
  const files = writes.map((rel) => ({ path: rel, localPath: rel }));
  return {
    projectName: PROJECT_NAME,
    localDir: outDir,
    finalizePlan: { writes: [...writes], deletes: [...deletes] },
    writeFiles: { files },
  };
}

function pushRecipe(push, payloadPath) {
  return [
    `DesignSync push, arguments in ${payloadPath} (load the tool with ToolSearch "select:DesignSync" if deferred):`,
    `  1. list_projects: take the projectId of "${push.projectName}". Then list_files(projectId).`,
    `  2. finalize_plan(projectId, localDir, writes, deletes) from finalizePlan. Keep only the deletes`,
    `     that list_files shows; pass [] when none remain.`,
    `  3. write_files(projectId, planId, files) with writeFiles.files (${push.writeFiles.files.length} files).`,
    `     If any deletes remained, delete_files(projectId, planId, paths) with them.`,
  ].join("\n");
}

module.exports = { buildPushPayload, pushRecipe, LIMIT };
