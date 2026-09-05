#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const { spawn } = require("node:child_process");
const { chromium, devices } = require("@playwright/test");
const { closeServer, startStaticServer } = require("./serve-static");
const { moneyRoutes } = require("../../tests/visual/routes");
const { prepareFullPageScreenshot } = require("../../tests/visual/test-helpers");

const projectRoot = path.resolve(__dirname, "..", "..");
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";

function parseArgs(argv) {
  const options = {
    outDir: "artifacts/visual-proof",
    baseUrl: "",
    routes: [],
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

    if (arg === "--route") { options.routes.push(argv[++index]); continue; }

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
      SEASCAPE_VISUAL_TEST: "0",
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

async function captureViewportBundle({ outDir, baseUrl, projectName, contextOptions, routes }) {
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
    // Review proof uses the real network and clock. Only analytics is blocked to avoid test traffic.
    await context.route(/googletagmanager|google-analytics|connect\.facebook\.net/, route => route.abort());
    for (const routeConfig of routes) {
      const response = await page.goto(routeConfig.path, { waitUntil: "networkidle" });
      if (!response || response.status() !== 200) throw new Error(`Refusing proof for ${routeConfig.path}: HTTP ${response?.status()}`);
      await page.locator(routeConfig.readySelector || "main h1").first().waitFor({ state: "visible" });
      await prepareFullPageScreenshot(page);

      const screenshotPath = path.join(outputDir, `${routeConfig.slug}.png`);
      await page.screenshot({ path: path.join(outputDir, `${routeConfig.slug}-first-screen.png`) });
      await page.screenshot({
        path: screenshotPath,
        fullPage: true,
      });

      captures.push({
        route: routeConfig.path,
        slug: routeConfig.slug,
        screenshot: relativeFromRoot(screenshotPath),
        images: await page.locator("[data-property-photo]").evaluateAll(nodes => nodes.filter(node => node.getClientRects().length).map(node => ({property: node.dataset.propertyPhoto, src: node.currentSrc, loaded: node.naturalWidth > 0}))),
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
  const routes = args.routes.length ? args.routes.map(path => {
    const known = moneyRoutes.find(route => route.path === path);
    if (!known) throw new Error(`Unknown proof route: ${path}`);
    return known;
  }) : moneyRoutes;
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
      routes,
      projectName: "desktop-chromium",
      contextOptions: {
        viewport: { width: 1440, height: 900 },
      },
    });

    const mobileCaptures = await captureViewportBundle({
      outDir,
      baseUrl,
      routes,
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
      routes_captured: routes.map((route) => route.path),
      property_photos: "actual assets; missing photos fail capture",
      availability_and_pricing: "not mocked; page state at capture time, not a quote",
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
