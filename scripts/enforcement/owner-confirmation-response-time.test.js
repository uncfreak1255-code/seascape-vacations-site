const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const { buildOwnerConfirmationEmail } = require("../../netlify/functions/_owner-lead-confirmation");

// Sawyer approved this wording on agent-issues#77 (2026-11-18): the owner email
// promises human follow-up no more firmly than the thank-you page does.
test("owner confirmation email says follow-up usually comes within 48 hours", () => {
  const { text } = buildOwnerConfirmationEmail({ name: "Pat Owner", email: "pat@example.com" }, {});
  assert.match(text, /A real person at Seascape will follow up, usually within 48 hours\./);
  assert.doesNotMatch(text, /follow up within 48 hours/);

  const thankYou = fs.readFileSync(
    path.join(__dirname, "../../src/property-management/revenue-review-requested.njk"),
    "utf8"
  );
  assert.match(thankYou, /will follow up, usually within 48 hours\./);
});
