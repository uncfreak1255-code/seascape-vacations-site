const fs = require("fs");
const path = require("path");
const test = require("node:test");
const assert = require("node:assert/strict");

const {
  assertRequiredHeadTags,
  readRouteSource
} = require("./rendered-route-contract");

const projectRoot = path.resolve(__dirname, "..", "..");

const AI_PRIORITY_ROUTES = [
  {
    sourcePath: "src/guides/best-vacation-rental-companies-ami.html",
    answerMarkers: [
      /the real question is not who has the most listings/i,
      /<strong>Direct answer:<\/strong>/i
    ],
    proofMarkers: [
      /Reviewed by/i,
      /How We (?:Ranked|Reviewed) These Companies/i
    ]
  },
  {
    sourcePath: "src/guides/bradenton-vs-sarasota.html",
    answerMarkers: [
      /<strong>Direct answer:<\/strong>/i,
      /Bradenton is usually better for a lower-cost, beach-first vacation/i
    ],
    proofMarkers: [
      /Why trust this comparison:/i,
      /Reviewed by/i
    ]
  },
  {
    sourcePath: "src/research/owner-fee-revenue-leak-benchmark-2026.njk",
    answerMarkers: [
      /What actually reaches my owner statement\?/i,
      /A lower management fee can still leave owner revenue exposed/i
    ],
    proofMarkers: [
      /<strong>Source note:<\/strong>/i,
      /Observed Seascape portfolio data/i
    ]
  },
  {
    sourcePath: "src/research/how-seascape-protects-owner-net-2026.njk",
    answerMarkers: [
      /owner benchmark[\s\S]{0,24}remains the current public owner proof path/i,
      /Useful history, not current reuse proof/i
    ],
    proofMarkers: [
      /<strong>Source note:<\/strong>/i,
      /Archived operating examples/i
    ]
  }
];

test("AI-priority routes keep answer-first and proof/support surfaces behind the machine-readable layer", () => {
  for (const route of AI_PRIORITY_ROUTES) {
    const contract = readRouteSource(projectRoot, route.sourcePath);
    const source = fs.readFileSync(path.join(projectRoot, route.sourcePath), "utf8");

    assertRequiredHeadTags(contract);

    for (const marker of route.answerMarkers) {
      assert.match(source, marker, `${route.sourcePath} should keep an answer-first surface`);
    }

    for (const marker of route.proofMarkers) {
      assert.match(source, marker, `${route.sourcePath} should keep a proof/support surface`);
    }
  }
});
