#!/usr/bin/env node

const crypto = require("crypto");
const fs = require("fs");
const os = require("os");
const path = require("path");

const OWNER_REPO = "seascape-vacations-site";
const SOURCE_PATH = "netlify/functions/owner-lead-metrics.js";
const CLAIM_ID = "CLM-OWNER-MEASUREMENT-PATH-LIVE";
const PRODUCER_ID = "site-owner-lead-metrics-v2-shadow";
const ACTION_BOUNDARY = "retrieval never authorizes a live action";
const ALLOWED_USES = ["read_only_answer", "evidence_draft"];
const ISO_TIMESTAMP_PATTERN = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d{1,3})?(Z|[+-]\d{2}:\d{2})$/;
const V2_FIELDS = new Set([
  "schema_version",
  "claim_id",
  "owner_repo",
  "source_path",
  "source_sha256",
  "producer_id",
  "proof_type",
  "observed_at",
  "recorded_at",
  "stale_after",
  "status",
  "redaction_class",
  "allowed_uses",
  "action_boundary",
]);

class ProjectionError extends Error {}

function sha256Bytes(content) {
  return crypto.createHash("sha256").update(content).digest("hex");
}

function hasValidCalendarDate(year, month, day) {
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function parseTimestamp(value, fieldName) {
  const match = typeof value === "string" ? ISO_TIMESTAMP_PATTERN.exec(value) : null;
  if (!match) {
    throw new ProjectionError(`${fieldName} must be an ISO-8601 timestamp with a timezone`);
  }
  const [, yearText, monthText, dayText, hourText, minuteText, secondText, timezone] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const hour = Number(hourText);
  const minute = Number(minuteText);
  const second = Number(secondText);
  const timezoneHour = timezone === "Z" ? 0 : Number(timezone.slice(1, 3));
  const timezoneMinute = timezone === "Z" ? 0 : Number(timezone.slice(4, 6));
  if (
    !hasValidCalendarDate(year, month, day) ||
    hour > 23 ||
    minute > 59 ||
    second > 59 ||
    timezoneHour > 23 ||
    timezoneMinute > 59
  ) {
    throw new ProjectionError(`${fieldName} must be an ISO-8601 timestamp with a timezone`);
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.valueOf())) {
    throw new ProjectionError(`${fieldName} must be an ISO-8601 timestamp with a timezone`);
  }
  return parsed;
}

function parseStaleAfter(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new ProjectionError("stale_after must be a V1 date");
  }
  const [year, month, day] = value.split("-").map(Number);
  if (!hasValidCalendarDate(year, month, day)) {
    throw new ProjectionError("stale_after must be a V1 date");
  }
  return new Date(`${value}T23:59:59.999Z`);
}

function readV1Source(inputPath) {
  const content = fs.readFileSync(inputPath);
  let source;
  try {
    source = JSON.parse(content);
  } catch {
    throw new ProjectionError("input must be a JSON V1 receipt");
  }
  if (!source || Array.isArray(source) || typeof source !== "object" || "schema_version" in source) {
    throw new ProjectionError("input must be an unchanged V1 receipt object");
  }
  return { content, source };
}

function validateV1Receipt(source, recordedAt) {
  if (source.owning_repo !== OWNER_REPO) {
    throw new ProjectionError("receipt owner is not seascape-vacations-site");
  }
  if (source.source_path !== SOURCE_PATH) {
    throw new ProjectionError("receipt source path is not the approved owner-lead metrics source");
  }
  if (source.proof_type !== "measurement") {
    throw new ProjectionError("receipt proof type is not measurement");
  }
  if (!Array.isArray(source.claim_ids) || source.claim_ids.length !== 1 || source.claim_ids[0] !== CLAIM_ID) {
    throw new ProjectionError("receipt claim IDs are not the approved owner-lead measurement claim");
  }
  const observedAt = parseTimestamp(source.date_or_window, "date_or_window");
  const expectedReceiptId = `REC-${observedAt.toISOString().slice(0, 10).replace(/-/g, "")}-SITE-OWNER-LEAD-METRICS`;
  if (source.receipt_id !== expectedReceiptId) {
    throw new ProjectionError("receipt ID is not the approved owner-lead metrics receipt");
  }
  const staleAfter = parseStaleAfter(source.stale_after);
  if (recordedAt < observedAt) {
    throw new ProjectionError("projection recorded_at cannot precede observed_at");
  }
  return { observedAt, staleAfter };
}

function statusFor({ staleAfter, recordedAt }) {
  return recordedAt >= staleAfter ? "historical" : "active";
}

function buildV2Projection(source, { sourceSha256, recordedAt }) {
  const { observedAt, staleAfter } = validateV1Receipt(source, recordedAt);
  return {
    schema_version: "2",
    claim_id: CLAIM_ID,
    owner_repo: OWNER_REPO,
    source_path: SOURCE_PATH,
    source_sha256: sourceSha256,
    producer_id: PRODUCER_ID,
    proof_type: "measurement",
    observed_at: observedAt.toISOString(),
    recorded_at: recordedAt.toISOString(),
    stale_after: staleAfter.toISOString(),
    status: statusFor({ staleAfter, recordedAt }),
    redaction_class: "public",
    allowed_uses: ALLOWED_USES,
    action_boundary: ACTION_BOUNDARY,
  };
}

function writeNewFile(targetPath, content) {
  const parent = path.dirname(targetPath);
  fs.mkdirSync(parent, { recursive: true });
  const tempDir = fs.mkdtempSync(path.join(parent, `.${path.basename(targetPath)}.`));
  const tempPath = path.join(tempDir, "content");
  try {
    const descriptor = fs.openSync(tempPath, "wx");
    try {
      fs.writeFileSync(descriptor, content);
      fs.fsyncSync(descriptor);
    } finally {
      fs.closeSync(descriptor);
    }
    fs.linkSync(tempPath, targetPath);
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
  const readback = fs.readFileSync(targetPath);
  if (!readback.equals(content)) {
    throw new Error(`projection readback mismatch: ${targetPath}`);
  }
  return sha256Bytes(readback);
}

function replaceFile(targetPath, content) {
  const parent = path.dirname(targetPath);
  fs.mkdirSync(parent, { recursive: true });
  const tempPath = path.join(parent, `.${path.basename(targetPath)}.${process.pid}.${crypto.randomUUID()}`);
  try {
    const descriptor = fs.openSync(tempPath, "wx");
    try {
      fs.writeFileSync(descriptor, content);
      fs.fsyncSync(descriptor);
    } finally {
      fs.closeSync(descriptor);
    }
    fs.renameSync(tempPath, targetPath);
  } finally {
    fs.rmSync(tempPath, { force: true });
  }
  const readback = fs.readFileSync(targetPath);
  if (!readback.equals(content)) {
    throw new Error(`disable receipt readback mismatch: ${targetPath}`);
  }
  return sha256Bytes(readback);
}

function writeProjection(outputPath, projection) {
  return writeNewFile(outputPath, Buffer.from(`${JSON.stringify(projection)}\n`, "utf8"));
}

function distinctPaths(...paths) {
  return new Set(paths.map((candidate) => path.resolve(candidate))).size === paths.length;
}

function assertExistingProjectionMatchesSource(outputPath, { sourceSha256 }) {
  let records;
  try {
    const lines = fs.readFileSync(outputPath, "utf8").split(/\r?\n/).filter(Boolean);
    records = lines.map((line) => JSON.parse(line));
  } catch {
    throw new ProjectionError("derived projection cannot be validated");
  }
  if (records.length !== 1 || !records[0] || typeof records[0] !== "object") {
    throw new ProjectionError("derived projection cannot be validated");
  }
  const record = records[0];
  if (Object.keys(record).length !== V2_FIELDS.size || Object.keys(record).some((key) => !V2_FIELDS.has(key))) {
    throw new ProjectionError("derived projection has an unexpected field set");
  }
  if (
    record.schema_version !== "2" ||
    record.claim_id !== CLAIM_ID ||
    record.owner_repo !== OWNER_REPO ||
    record.source_path !== SOURCE_PATH ||
    record.source_sha256 !== sourceSha256 ||
    record.producer_id !== PRODUCER_ID ||
    record.proof_type !== "measurement" ||
    record.redaction_class !== "public" ||
    JSON.stringify(record.allowed_uses) !== JSON.stringify(ALLOWED_USES) ||
    record.action_boundary !== ACTION_BOUNDARY ||
    !["active", "historical"].includes(record.status)
  ) {
    throw new ProjectionError("derived projection does not match the source receipt");
  }
  parseTimestamp(record.observed_at, "derived projection observed_at");
  parseTimestamp(record.recorded_at, "derived projection recorded_at");
  parseTimestamp(record.stale_after, "derived projection stale_after");
}

function disableReceiptContent({ sourceSha256, recordedAt, projectionStatus, projectionRemoved, sourcePreserved }) {
  return Buffer.from(`${JSON.stringify({
    kind: "seascape-knowledge-envelope-v2-disable-receipt",
    owner_repo: OWNER_REPO,
    source_path: SOURCE_PATH,
    source_sha256: sourceSha256,
    reason: "operator_requested_shadow_disable",
    recorded_at: recordedAt.toISOString(),
    projection_status: projectionStatus,
    projection_removed: projectionRemoved,
    source_preserved: sourcePreserved,
  }, null, 2)}\n`, "utf8");
}

function parseArgs(argv) {
  const args = { disable: false };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--disable") {
      args.disable = true;
      continue;
    }
    if (["--input", "--output", "--recorded-at", "--disable-receipt"].includes(argument)) {
      const value = argv[index + 1];
      if (!value || value.startsWith("--")) {
        throw new ProjectionError(`${argument} requires a value`);
      }
      args[argument.slice(2).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())] = value;
      index += 1;
      continue;
    }
    throw new ProjectionError(`unknown flag: ${argument}`);
  }
  if (!args.input || !args.output) {
    throw new ProjectionError("--input and --output are required");
  }
  if (args.disable && !args.disableReceipt) {
    throw new ProjectionError("--disable requires --disable-receipt");
  }
  if (!args.disable && args.disableReceipt) {
    throw new ProjectionError("--disable-receipt requires --disable");
  }
  return args;
}

function main(argv = process.argv.slice(2)) {
  const args = parseArgs(argv);
  const allPaths = [args.input, args.output];
  if (args.disableReceipt) {
    allPaths.push(args.disableReceipt);
  }
  if (!distinctPaths(...allPaths)) {
    throw new ProjectionError("input, projection, and disable receipt paths must differ");
  }
  const { content: sourceBefore, source } = readV1Source(args.input);
  const recordedAt = parseTimestamp(args.recordedAt || new Date().toISOString(), "recorded_at");
  const sourceSha256 = sha256Bytes(sourceBefore);
  const projection = buildV2Projection(source, { sourceSha256, recordedAt });

  if (!args.disable) {
    const projectionSha256 = writeProjection(args.output, projection);
    return {
      projection_status: "written",
      source_sha256: sourceSha256,
      projection_path: args.output,
      projection_sha256: projectionSha256,
      record_count: 1,
    };
  }

  let projectionRemoved = false;
  if (fs.existsSync(args.output)) {
    const stats = fs.lstatSync(args.output);
    if (!stats.isFile() || stats.isSymbolicLink()) {
      throw new ProjectionError("derived projection must be a regular file");
    }
    assertExistingProjectionMatchesSource(args.output, { sourceSha256 });
  }
  if (!fs.readFileSync(args.input).equals(sourceBefore)) {
    throw new ProjectionError("source receipt changed while disabling projection");
  }
  const pending = disableReceiptContent({
    sourceSha256,
    recordedAt,
    projectionStatus: "disable_pending",
    projectionRemoved: null,
    sourcePreserved: true,
  });
  writeNewFile(args.disableReceipt, pending);
  try {
    if (fs.existsSync(args.output)) {
      fs.unlinkSync(args.output);
      projectionRemoved = true;
    }
  } catch (error) {
    replaceFile(args.disableReceipt, disableReceiptContent({
      sourceSha256,
      recordedAt,
      projectionStatus: "disable_failed",
      projectionRemoved: false,
      sourcePreserved: fs.readFileSync(args.input).equals(sourceBefore),
    }));
    throw error;
  }
  const sourcePreserved = fs.readFileSync(args.input).equals(sourceBefore);
  const disableReceiptSha256 = replaceFile(args.disableReceipt, disableReceiptContent({
    sourceSha256,
    recordedAt,
    projectionStatus: sourcePreserved ? "disabled" : "source_changed",
    projectionRemoved,
    sourcePreserved,
  }));
  if (!sourcePreserved) {
    throw new ProjectionError("source receipt changed while disabling projection");
  }
  return {
    projection_status: "disabled",
    source_sha256: sourceSha256,
    source_preserved: true,
    projection_removed: projectionRemoved,
    disable_receipt_path: args.disableReceipt,
    disable_receipt_sha256: disableReceiptSha256,
  };
}

if (require.main === module) {
  try {
    process.stdout.write(`${JSON.stringify(main())}\n`);
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  }
}

module.exports = {
  ACTION_BOUNDARY,
  ALLOWED_USES,
  CLAIM_ID,
  OWNER_REPO,
  PRODUCER_ID,
  ProjectionError,
  SOURCE_PATH,
  V2_FIELDS,
  assertExistingProjectionMatchesSource,
  buildV2Projection,
  disableReceiptContent,
  main,
  parseArgs,
  readV1Source,
  sha256Bytes,
};
