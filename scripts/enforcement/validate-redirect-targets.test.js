const fs = require("fs");
const path = require("path");
const test = require("node:test");
const assert = require("node:assert/strict");

const projectRoot = path.resolve(__dirname, "..", "..");
const redirectsPath = path.join(projectRoot, "src", "_redirects");

test("redirect targets file exists", () => {
  assert.equal(fs.existsSync(redirectsPath), true, "src/_redirects must exist");
});

test("no redirect targets point to known-dead stay pages", () => {
  const content = fs.readFileSync(redirectsPath, "utf8");
  const deadTargets = [
    "/stays/paddleboarding-vacation-rentals-florida/",
    "/stays/riverwalk-bradenton-vacation-rentals/",
    "/stays/birdwatching-vacation-rentals-florida/",
    "/stays/sunset-cruise-vacation-rentals-bradenton/",
    "/contact/"
  ];

  const lines = content.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const parts = trimmed.split(/\s+/);
    if (parts.length < 3) continue;
    const target = parts[1];
    for (const dead of deadTargets) {
      assert.notEqual(
        target, dead,
        `redirect target "${target}" is a known dead page (found in _redirects)`
      );
    }
  }
});

test("no redirect targets use .html when slash canonical exists", () => {
  const content = fs.readFileSync(redirectsPath, "utf8");
  const lines = content.split("\n");
  const htmlTargets = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const parts = trimmed.split(/\s+/);
    if (parts.length < 3) continue;
    const target = parts[1];
    // Only flag guide .html targets (travel-spot-guide and city redirects)
    if (target.startsWith("/guides/") && target.endsWith(".html")) {
      htmlTargets.push(target);
    }
  }

  assert.equal(
    htmlTargets.length, 0,
    `Found ${htmlTargets.length} guide redirect target(s) using .html instead of slash canonical: ${htmlTargets.slice(0, 3).join(", ")}`
  );
});

test("validator script exists and is valid JavaScript", () => {
  const validatorPath = path.join(projectRoot, "scripts", "enforcement", "validate-redirect-targets.js");
  assert.equal(fs.existsSync(validatorPath), true, "validate-redirect-targets.js must exist");

  // Verify it can be required without error
  assert.doesNotThrow(() => {
    // Just check the file is parseable, don't execute main()
    const content = fs.readFileSync(validatorPath, "utf8");
    new Function(content.replace(/main\(\);?\s*$/, ""));
  });
});
