#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const projectRoot = path.resolve(__dirname, "..", "..");

const files = {
  doc: path.join(projectRoot, "docs", "status", "ami-vs-siesta-readback.md"),
  brief: path.join(projectRoot, "docs", "briefs", "2026-06-ami-vs-siesta-transfer-batch.md"),
  source: path.join(projectRoot, "src", "guides", "anna-maria-island-vs-siesta-key.html"),
  packageJson: path.join(projectRoot, "package.json")
};

function read(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function assertIncludes(label, content, expected) {
  if (!content.includes(expected)) {
    throw new Error(`${label} must include: ${expected}`);
  }
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function assertTrackedShortcut(block, href, trackLabel) {
  const linkPattern = new RegExp(
    `<a\\b(?=[^>]*href="${escapeRegExp(href)}")(?=[^>]*data-track-event="guide_book_direct_click")(?=[^>]*data-track-label="${escapeRegExp(trackLabel)}")[^>]*>`,
    "s"
  );

  if (!linkPattern.test(block)) {
    throw new Error(
      `Stay-base shortcut must keep guide_book_direct_click tracking for ${trackLabel}`
    );
  }
}

function main() {
  const doc = read(files.doc);
  const brief = read(files.brief);
  const source = read(files.source);
  const packageJson = JSON.parse(read(files.packageJson));

  [
    "Status: pending first 7 complete days after deploy",
    "Route: `/guides/anna-maria-island-vs-siesta-key/`",
    "Source PR: #397",
    "Merge commit: `8f1b84cf18a19fd13e2131aa82fa4755f7e6c3c0`",
    "Primary event: `guide_book_direct_click`",
    "GSC clicks | 25",
    "GSC impressions | 2502",
    "GA4 sessions | 104",
    "guide transfer events | 0",
    "seascape-analytics",
    "first 7 complete days after the production deploy"
  ].forEach((expected) => assertIncludes("docs/status/ami-vs-siesta-readback.md", doc, expected));

  [
    "readback window: first 7 complete days after deploy",
    "guide_book_direct_click",
    "25` GSC clicks, `2502` impressions, `104` GA4 sessions, and `0` guide transfer events"
  ].forEach((expected) =>
    assertIncludes("docs/briefs/2026-06-ami-vs-siesta-transfer-batch.md", brief, expected)
  );

  [
    'data-transfer-choice="ami-vs-siesta-stay-base"',
    "Stay-base shortcut Anna Maria Island vacation rentals",
    "Stay-base shortcut Bradenton homes near AMI beaches",
    "Stay-base shortcut Siesta Key area stays",
    "Verdict Anna Maria Island vacation rentals",
    "Verdict Bradenton homes near AMI beaches",
    "Verdict Siesta Key area stays",
    "Verdict Anna Maria Island beachfront rentals"
  ].forEach((expected) => assertIncludes("src/guides/anna-maria-island-vs-siesta-key.html", source, expected));

  const shortcutBlockMatch = source.match(
    /<div class="verdict-card" data-transfer-choice="ami-vs-siesta-stay-base">[\s\S]*?<\/div>/
  );
  if (!shortcutBlockMatch) {
    throw new Error("AMI vs Siesta stay-base shortcut block is missing");
  }

  const shortcutBlock = shortcutBlockMatch[0];
  [
    [
      "/stays/anna-maria-island-vacation-rentals/",
      "Stay-base shortcut Anna Maria Island vacation rentals"
    ],
    [
      "/stays/bradenton-vacation-rentals-near-beaches/",
      "Stay-base shortcut Bradenton homes near AMI beaches"
    ],
    [
      "/stays/siesta-key-area-vacation-rentals/",
      "Stay-base shortcut Siesta Key area stays"
    ]
  ].forEach(([href, trackLabel]) => assertTrackedShortcut(shortcutBlock, href, trackLabel));

  [
    [
      "/stays/anna-maria-island-vacation-rentals/",
      "Verdict Anna Maria Island vacation rentals"
    ],
    [
      "/stays/bradenton-vacation-rentals-near-beaches/",
      "Verdict Bradenton homes near AMI beaches"
    ],
    [
      "/stays/siesta-key-area-vacation-rentals/",
      "Verdict Siesta Key area stays"
    ],
    [
      "/stays/anna-maria-island-beachfront-rentals/",
      "Verdict Anna Maria Island beachfront rentals"
    ]
  ].forEach(([href, trackLabel]) => assertTrackedShortcut(source, href, trackLabel));

  assertIncludes(
    "package.json scripts.verify:ami-vs-siesta-readback",
    packageJson.scripts?.["verify:ami-vs-siesta-readback"] || "",
    "scripts/enforcement/assert-ami-vs-siesta-readback-gate.js"
  );

  console.log("AMI vs Siesta readback gate OK: source markers and pending readback receipt are present.");
}

if (require.main === module) {
  main();
}
