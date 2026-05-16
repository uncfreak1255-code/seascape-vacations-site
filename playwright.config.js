const path = require("node:path");
const { defineConfig, devices } = require("@playwright/test");

const isCI = Boolean(process.env.CI);

module.exports = defineConfig({
  testDir: "./tests/visual",
  fullyParallel: false,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  workers: 1,
  reporter: isCI
    ? [["github"], ["html", { open: "never" }]]
    : [["list"], ["html", { open: "never" }]],
  expect: {
    timeout: 10_000,
    toHaveScreenshot: {
      animations: "disabled",
      caret: "hide",
      scale: "css",
      maxDiffPixels: 100,
      stylePath: path.join(__dirname, "tests", "visual", "screenshot.css"),
      pathTemplate: "{testDir}/__screenshots__{/projectName}/{testFilePath}/{arg}{ext}",
    },
  },
  use: {
    baseURL: "http://127.0.0.1:4173",
    colorScheme: "light",
    reducedMotion: "reduce",
    screenshot: "only-on-failure",
    trace: "on-first-retry",
    video: "off",
  },
  webServer: {
    command: "npm run build && node scripts/enforcement/serve-static.js --root _site --port 4173",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: !isCI,
    stdout: "ignore",
    stderr: "pipe",
    timeout: 120_000,
  },
  projects: [
    {
      name: "desktop-chromium",
      use: {
        browserName: "chromium",
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: "mobile-chromium",
      use: {
        ...devices["Pixel 5"],
      },
    },
  ],
});
