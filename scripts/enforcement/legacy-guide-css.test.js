const fs = require("fs");
const path = require("path");
const test = require("node:test");
const assert = require("node:assert/strict");

const projectRoot = path.resolve(__dirname, "..", "..");

test("legacy guide sources do not reference the removed shared stylesheet asset path", () => {
  const springBreakGuide = fs.readFileSync(
    path.join(
      projectRoot,
      "src",
      "guides",
      "spring-break-activities-bradenton-anna-maria-island",
      "index.html"
    ),
    "utf8"
  );

  assert.equal(springBreakGuide.includes('/assets/css/style.css'), false);
});
