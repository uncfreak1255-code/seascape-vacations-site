#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const { buildReleaseScorecard } = require("./release-scorecard");

function parseArgs(argv) {
  const options = {
    outDir: "artifacts/release-scorecard",
    receiptPath: "",
    visualProofPath: "",
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--out-dir") {
      options.outDir = argv[index + 1] || options.outDir;
      index += 1;
      continue;
    }

    if (arg === "--receipt") {
      options.receiptPath = argv[index + 1] || "";
      index += 1;
      continue;
    }

    if (arg === "--visual-proof") {
      options.visualProofPath = argv[index + 1] || "";
      index += 1;
      continue;
    }

    if (arg === "--help") {
      console.log(
        "Usage: node scripts/enforcement/generate-release-scorecard.js --receipt <release-receipt.json> [--visual-proof <visual-proof-receipt.json>] [--out-dir <path>]"
      );
      process.exit(0);
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  if (!options.receiptPath) {
    throw new Error("--receipt is required");
  }

  return options;
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function ensureDirectory(targetDir) {
  fs.mkdirSync(targetDir, { recursive: true });
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const projectRoot = path.resolve(__dirname, "..", "..");
  const outDir = path.resolve(projectRoot, options.outDir);
  const releaseReceiptPath = path.resolve(projectRoot, options.receiptPath);
  const visualProofPath = options.visualProofPath
    ? path.resolve(projectRoot, options.visualProofPath)
    : "";

  ensureDirectory(outDir);

  const result = buildReleaseScorecard({
    releaseReceipt: readJson(releaseReceiptPath),
    visualProofReceipt: visualProofPath ? readJson(visualProofPath) : null,
    releaseReceiptPath,
    visualProofReceiptPath: visualProofPath,
    outputDir: outDir,
  });

  const markdownPath = path.join(outDir, "scorecard.md");
  const htmlPath = path.join(outDir, "scorecard.html");
  const receiptPath = path.join(outDir, "receipt.json");

  fs.writeFileSync(markdownPath, `${result.markdown}\n`);
  fs.writeFileSync(htmlPath, `${result.html}\n`);
  fs.writeFileSync(receiptPath, `${JSON.stringify(result.receipt, null, 2)}\n`);

  console.log(`[release-scorecard] markdown: ${path.relative(projectRoot, markdownPath)}`);
  console.log(`[release-scorecard] html: ${path.relative(projectRoot, htmlPath)}`);
  console.log(`[release-scorecard] receipt: ${path.relative(projectRoot, receiptPath)}`);
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}
