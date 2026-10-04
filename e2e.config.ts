import type { E2EConfig } from "e2e";
import { web } from "@e2e-dev/web";

export default {
  tests: ["tests/e2e/**/*.e2e.ts"],
  workers: 1,
  retries: 0,
  targets: [
    {
      name: "desktop-chromium",
      engine: web({
        browser: "chromium",
        viewport: { width: 1440, height: 900 },
      }),
      app: {
        url: "http://127.0.0.1:0",
        readyUrl: "http://127.0.0.1:{port}/__health",
        command: {
          executable: process.execPath,
          args: [
            "scripts/enforcement/serve-static.js",
            "--port",
            "{port}",
            "--root",
            "_site",
          ],
          log: ".e2e/site.log",
        },
      },
    },
    {
      name: "mobile-chromium",
      engine: web({
        browser: "chromium",
        viewport: { width: 390, height: 844 },
      }),
      app: {
        url: "http://127.0.0.1:0",
        readyUrl: "http://127.0.0.1:{port}/__health",
        command: {
          executable: process.execPath,
          args: [
            "scripts/enforcement/serve-static.js",
            "--port",
            "{port}",
            "--root",
            "_site",
          ],
          log: ".e2e/site.log",
        },
      },
    },
  ],
} satisfies E2EConfig;
