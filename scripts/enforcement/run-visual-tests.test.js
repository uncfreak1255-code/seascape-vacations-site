const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawn, spawnSync } = require("node:child_process");
const { setTimeout: delay } = require("node:timers/promises");
const { test } = require("node:test");

async function waitUntil(predicate, detail) {
  const deadline = Date.now() + 10000;
  while (!predicate()) {
    assert.ok(Date.now() < deadline, detail);
    await delay(20);
  }
}

function fixture(t, options = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "visual-run-lock-"));
  const scripts = path.join(root, "scripts/enforcement");
  fs.mkdirSync(scripts, { recursive: true });
  for (const file of ["run-visual-tests.js", "worktree-lock.js", "serve-static.js"]) {
    fs.copyFileSync(path.join(__dirname, file), path.join(scripts, file));
  }
  fs.writeFileSync(path.join(scripts, "build-site.js"), `
    const fs = require("node:fs");
    const { withWorktreeLock } = require("./worktree-lock");
    withWorktreeLock({ repoRootDir: process.cwd() }, () => {
      if (process.env.BUILD_FAILURE) { process.exitCode = 7; return; }
      fs.mkdirSync("_site", { recursive: true });
      fs.writeFileSync("_site/index.html", "visual fixture");
    });
  `);
  const cli = path.join(root, "node_modules/@playwright/test");
  fs.mkdirSync(cli, { recursive: true });
  fs.writeFileSync(path.join(cli, "cli.js"), `
    const fs = require("node:fs");
    const { setTimeout: delay } = require("node:timers/promises");
    process.on("SIGTERM", () => {
      fs.writeFileSync("child-stopped", "yes");
      process.exit(0);
    });
    (async () => {
      const url = process.env.PLAYWRIGHT_VISUAL_BASE_URL;
      const response = await fetch(url);
      if (await response.text() !== "visual fixture") throw new Error("wrong build");
      fs.writeFileSync("browser-ready", JSON.stringify({ url, pid: process.pid }));
      while (!fs.existsSync("finish-browser")) await delay(20);
      const after = await fetch(url);
      if (await after.text() !== "visual fixture") throw new Error("site replaced during browser run");
      process.exitCode = Number(process.env.BROWSER_EXIT || 0);
    })().catch(error => { console.error(error); process.exitCode = 1; });
  `);
  const env = { ...process.env, ...options };
  // The fixture represents a separate worktree, even inside verify:release.
  delete env.SEASCAPE_WORKTREE_LOCK_REPO_BUILD;
  const child = spawn(process.execPath, [path.join(scripts, "run-visual-tests.js")], {
    cwd: root, env, stdio: ["ignore", "pipe", "pipe"],
  });
  let output = "";
  child.stdout.on("data", chunk => { output += chunk; });
  child.stderr.on("data", chunk => { output += chunk; });
  const ended = new Promise((resolve, reject) => {
    child.once("error", reject);
    child.once("exit", (code, signal) => resolve({ code, signal }));
  });
  t.after(async () => {
    fs.writeFileSync(path.join(root, "finish-browser"), "");
    if (child.exitCode === null && child.signalCode === null) child.kill("SIGTERM");
    await ended;
    fs.rmSync(root, { recursive: true, force: true });
  });
  return { root, scripts, env, child, ended, output: () => output };
}

function competingBuild(f) {
  return spawnSync(process.execPath, ["-e", `
    const fs = require("node:fs");
    const { withWorktreeLock } = require(${JSON.stringify(path.join(f.scripts, "worktree-lock.js"))});
    try {
      withWorktreeLock({ repoRootDir: process.cwd(), waitTimeoutMs: 0 }, () => {
        fs.writeFileSync("_site/index.html", "competing build");
      });
    } catch (error) {
      console.error(error.message);
      process.exitCode = 2;
    }
  `], { cwd: f.root, env: f.env, encoding: "utf8", timeout: 5000 });
}

for (const ending of ["success", "failure", "SIGINT", "SIGTERM"]) {
  test(`visual runner protects served output and releases resources after ${ending}`, { timeout: 20000 }, async t => {
    const f = fixture(t, { BROWSER_EXIT: ending === "failure" ? "9" : "0" });
    const ready = path.join(f.root, "browser-ready");
    await waitUntil(() => fs.existsSync(ready) || f.child.exitCode !== null,
      "browser did not start");
    assert.ok(fs.existsSync(ready), f.output());
    const { url, pid } = JSON.parse(fs.readFileSync(ready, "utf8"));
    const competing = competingBuild(f);
    assert.equal(competing.status, 2, "a competing build must be blocked while the browser reads _site");
    assert.match(competing.stderr, /Another repo-wide build/);
    assert.equal(await (await fetch(url)).text(), "visual fixture");

    if (ending.startsWith("SIG")) f.child.kill(ending);
    else fs.writeFileSync(path.join(f.root, "finish-browser"), "");
    const result = await f.ended;
    const expected = { success: 0, failure: 9, SIGINT: 130, SIGTERM: 143 }[ending];
    assert.equal(result.code, expected, f.output());
    assert.equal(fs.existsSync(path.join(f.root, ".tmp/worktree-locks/repo-build.lock")), false,
      "runner must release its lock rather than leave a dead owner");
    assert.throws(() => process.kill(pid, 0), { code: "ESRCH" });
    await assert.rejects(fetch(url), /fetch failed/);
    if (ending.startsWith("SIG")) assert.ok(fs.existsSync(path.join(f.root, "child-stopped")));
    assert.equal(competingBuild(f).status, 0, "the next build must succeed after testing ends");
  });
}

test("visual runner releases its lock and preserves a failed build exit code", { timeout: 15000 }, async t => {
  const f = fixture(t, { BUILD_FAILURE: "1" });
  assert.equal((await f.ended).code, 7, f.output());
  assert.equal(fs.existsSync(path.join(f.root, "browser-ready")), false);
  assert.equal(fs.existsSync(path.join(f.root, ".tmp/worktree-locks/repo-build.lock")), false);
});
