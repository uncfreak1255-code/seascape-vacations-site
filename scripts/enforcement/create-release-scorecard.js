#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

function parseArgs(argv) {
  const options = {
    outDir: "artifacts/release-scorecard",
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--out-dir") {
      options.outDir = argv[index + 1] || options.outDir;
      index += 1;
      continue;
    }

    if (arg === "--help") {
      console.log(
        "Usage: node scripts/enforcement/create-release-scorecard.js [--out-dir <path>]"
      );
      process.exit(0);
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return options;
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    stdio: "inherit",
    ...options,
  });

  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const projectRoot = path.resolve(__dirname, "..", "..");
  const outDir = path.resolve(projectRoot, options.outDir);
  const verifyReceiptPath = path.join(outDir, "verify-release.receipt.json");
  const visualProofDir = path.join(outDir, "visual-proof");

  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });

  run("node", [
    "scripts/enforcement/verify-release.js",
    "--receipt",
    verifyReceiptPath,
  ], {
    cwd: projectRoot,
  });

  run("node", [
    "scripts/enforcement/capture-visual-proof.js",
    "--out-dir",
    visualProofDir,
  ], {
    cwd: projectRoot,
  });

  run("node", [
    "scripts/enforcement/generate-release-scorecard.js",
    "--receipt",
    verifyReceiptPath,
    "--visual-proof",
    path.join(visualProofDir, "receipt.json"),
    "--out-dir",
    outDir,
  ], {
    cwd: projectRoot,
  });
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}
