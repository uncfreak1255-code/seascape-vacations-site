#!/usr/bin/env node

const path = require("node:path");
const { spawn } = require("node:child_process");
const { closeServer, startStaticServer } = require("./serve-static");
const { withWorktreeLock } = require("./worktree-lock");

const projectRoot = path.resolve(__dirname, "..", "..");
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
  const child = spawnChild(process.execPath, ["scripts/enforcement/build-site.js"], {
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
  let interruptedExitCode;
  let started;

  const interrupt = (exitCode) => {
    interruptedExitCode ??= exitCode;
    if (activeChild && activeChild.exitCode === null && activeChild.signalCode === null) {
      activeChild.kill("SIGTERM");
    }
  };
  const onSigint = () => interrupt(130);
  const onSigterm = () => interrupt(143);
  process.once("SIGINT", onSigint);
  process.once("SIGTERM", onSigterm);

  try {
    // The browser reads this build until its server closes. Nested builds
    // inherit ownership; unrelated builds must wait for the entire inspection.
    const exitCode = await withWorktreeLock(
      { name: "repo-build", repoRootDir: projectRoot },
      async () => {
        try {
          const buildExitCode = await runBuild((child) => {
            activeChild = child;
          });
          if (interruptedExitCode !== undefined || buildExitCode !== 0) {
            return interruptedExitCode ?? buildExitCode;
          }

          started = await startStaticServer({
            host: "127.0.0.1",
            port: 0,
            root: "_site",
          });
          if (interruptedExitCode !== undefined) return interruptedExitCode;

          const result = await runPlaywright(started.url, process.argv.slice(2), (child) => {
            activeChild = child;
          });
          return interruptedExitCode ?? (result.signal ? 1 : result.code);
        } finally {
          if (started) await closeServer(started.server);
        }
      }
    );
    process.exitCode = interruptedExitCode ?? exitCode;
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = interruptedExitCode ?? 1;
  } finally {
    process.removeListener("SIGINT", onSigint);
    process.removeListener("SIGTERM", onSigterm);
  }
}

if (require.main === module) {
  void main();
}
