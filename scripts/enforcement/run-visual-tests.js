#!/usr/bin/env node

const path = require("node:path");
const { spawn } = require("node:child_process");
const { closeServer, startStaticServer } = require("./serve-static");

const projectRoot = path.resolve(__dirname, "..", "..");
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const playwrightCli = require.resolve("@playwright/test/cli");

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

async function runBuild(setActiveChild) {
  const child = spawnChild(npmCommand, ["run", "build"], {
    env: {
      ...process.env,
      SEASCAPE_VISUAL_TEST: "1",
    },
  });
  setActiveChild(child);
  const result = await waitForChild(child);
  setActiveChild(null);

  if (result.signal) {
    throw new Error(`Visual build exited from signal ${result.signal}`);
  }

  return result.code;
}

async function runPlaywright(baseUrl, extraArgs, setActiveChild) {
  const child = spawnChild(process.execPath, [playwrightCli, "test", ...extraArgs], {
    env: {
      ...process.env,
      PLAYWRIGHT_VISUAL_BASE_URL: baseUrl,
      SEASCAPE_VISUAL_TEST: "1",
    },
  });
  setActiveChild(child);
  const result = await waitForChild(child);
  setActiveChild(null);
  return result;
}

async function main() {
  let activeChild = null;
  let closing = false;
  let started;

  const shutdown = async (exitCode) => {
    if (closing) {
      return;
    }

    closing = true;

    if (activeChild && activeChild.exitCode === null) {
      activeChild.kill("SIGTERM");
      await waitForChild(activeChild).catch(() => {});
      activeChild = null;
    }

    if (started) {
      await closeServer(started.server).catch(() => {});
    }

    process.exit(exitCode);
  };

  process.once("SIGINT", () => {
    void shutdown(130);
  });
  process.once("SIGTERM", () => {
    void shutdown(143);
  });

  try {
    const buildExitCode = await runBuild((child) => {
      activeChild = child;
    });
    if (buildExitCode !== 0) {
      process.exit(buildExitCode);
      return;
    }

    started = await startStaticServer({
      host: "127.0.0.1",
      port: 0,
      root: "_site",
    });

    const result = await runPlaywright(started.url, process.argv.slice(2), (child) => {
      activeChild = child;
    });
    await shutdown(result.signal ? 1 : result.code);
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    await shutdown(1);
  }
}

if (require.main === module) {
  void main();
}
