#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const { spawn } = require("node:child_process");
const { chromium, devices } = require("@playwright/test");
const { closeServer, startStaticServer } = require("./serve-static");
const { moneyRoutes } = require("../../tests/visual/routes");
const { gotoMarketingRoute, prepareFullPageScreenshot } = require("../../tests/visual/test-helpers");

const projectRoot = path.resolve(__dirname, "..", "..");
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";

function parseArgs(argv) {
  const options = {
    outDir: "artifacts/visual-proof",
    baseUrl: "",
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--out-dir") {
      options.outDir = argv[index + 1] || options.outDir;
      index += 1;
      continue;
    }

    if (arg === "--base-url") {
      options.baseUrl = argv[index + 1] || "";
      index += 1;
      continue;
    }

    if (arg === "--help") {
      console.log("Usage: node scripts/enforcement/capture-visual-proof.js [--out-dir <path>] [--base-url <url>]");
      process.exit(0);
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return options;
}

function spawnChild(command, args, options) {
  return spawn(command, args, {
    cwd: projectRoot,
    stdio: "inherit",
    ...options,
  });
}

function waitForChild(child) {
  return new Promise((resolve, reject) => {
    child.on("error", reject);
    child.on("exit", (code, signal) => {
      resolve({
        code: code ?? 1,
        signal,
      });
    });
  });
}

async function runBuild() {
  const child = spawnChild(npmCommand, ["run", "build"], {
    env: {
      ...process.env,
      SEASCAPE_VISUAL_TEST: "1",
    },
  });

  const result = await waitForChild(child);
  if (result.signal) {
    throw new Error(`visual proof build exited from signal ${result.signal}`);
  }

  if (result.code !== 0) {
    throw new Error(`visual proof build failed with exit code ${result.code}`);
  }
}

function ensureCleanDirectory(targetDir) {
  fs.rmSync(targetDir, { recursive: true, force: true });
  fs.mkdirSync(targetDir, { recursive: true });
}

function relativeFromRoot(filePath) {
  return path.relative(projectRoot, filePath).replace(/\\/g, "/");
}

async function captureViewportBundle({ outDir, baseUrl, projectName, contextOptions }) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    baseURL: baseUrl,
    colorScheme: "light",
    reducedMotion: "reduce",
    ...contextOptions,
  });

  const page = await context.newPage();
  const outputDir = path.join(outDir, projectName);
  fs.mkdirSync(outputDir, { recursive: true });

  const captures = [];

  try {
    for (const routeConfig of moneyRoutes) {
      await gotoMarketingRoute(page, routeConfig);
      await prepareFullPageScreenshot(page);

      const screenshotPath = path.join(outputDir, `${routeConfig.slug}.png`);
      await page.screenshot({
        path: screenshotPath,
        fullPage: true,
      });

      captures.push({
        route: routeConfig.path,
        slug: routeConfig.slug,
        screenshot: relativeFromRoot(screenshotPath),
      });

      console.log(`[visual-proof] captured ${projectName}/${routeConfig.slug}.png`);
    }
  } finally {
    await context.close();
    await browser.close();
  }

  return captures;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const outDir = path.resolve(projectRoot, args.outDir);
  ensureCleanDirectory(outDir);

  const usingExternalBaseUrl = Boolean(args.baseUrl);
  let server;
  let baseUrl = args.baseUrl;

  try {
    if (!usingExternalBaseUrl) {
      await runBuild();
      const started = await startStaticServer({
        host: "127.0.0.1",
        port: 0,
        root: "_site",
      });
      server = started.server;
      baseUrl = started.url;
    }

    const desktopCaptures = await captureViewportBundle({
      outDir,
      baseUrl,
      projectName: "desktop-chromium",
      contextOptions: {
        viewport: { width: 1440, height: 900 },
      },
    });

    const mobileCaptures = await captureViewportBundle({
      outDir,
      baseUrl,
      projectName: "mobile-chromium",
      contextOptions: {
        ...devices["Pixel 5"],
      },
    });

    const receipt = {
      receipt_type: "visual_proof_bundle",
      generated_at: new Date().toISOString(),
      source: "scripts/enforcement/capture-visual-proof.js",
      base_url: baseUrl,
      routes_captured: moneyRoutes.map((route) => route.path),
      projects: {
        "desktop-chromium": desktopCaptures,
        "mobile-chromium": mobileCaptures,
      },
    };

    const receiptPath = path.join(outDir, "receipt.json");
    fs.writeFileSync(receiptPath, `${JSON.stringify(receipt, null, 2)}\n`);
    console.log(`[visual-proof] receipt: ${relativeFromRoot(receiptPath)}`);
  } finally {
    if (server) {
      await closeServer(server).catch(() => {});
    }
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
}
