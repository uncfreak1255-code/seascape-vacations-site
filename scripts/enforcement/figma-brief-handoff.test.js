const fs = require("fs");
const os = require("os");
const path = require("path");
const test = require("node:test");
const assert = require("node:assert/strict");

const {
  buildFigmaBriefReport,
  isEmptyPageOneTarget,
  renderFigmaBriefReport
} = require("./figma-brief-handoff");

const projectRoot = path.resolve(__dirname, "..", "..");

function writeTempRoot(files) {
  const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), "seascape-figma-brief-"));
  for (const [relativePath, contents] of Object.entries(files)) {
    const absolutePath = path.join(rootDir, relativePath);
    fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
    fs.writeFileSync(absolutePath, contents, "utf8");
  }
  return rootDir;
}

test("isEmptyPageOneTarget only blocks the known empty Page 1 state", () => {
  assert.equal(
    isEmptyPageOneTarget({
      topLevelPages: [{ id: "0:1", name: "Page 1" }],
      pageProbe: {
        nodeId: "0:1",
        name: "Page 1",
        visibleChildNames: []
      }
    }),
    true
  );

  assert.equal(
    isEmptyPageOneTarget({
      topLevelPages: [{ id: "0:1", name: "Owner Benchmark Exploration" }],
      pageProbe: {
        nodeId: "0:1",
        name: "Owner Benchmark Exploration",
        visibleChildNames: ["00 Brief + Decision Rails", "B - Leak Stack First"]
      }
    }),
    false
  );
});

test("current fee-guide integrity rescue does not depend on the retired Figma exploration", () => {
  const briefPath = path.join(
    projectRoot,
    "docs",
    "briefs",
    "2026-05-owner-fee-revenue-leak-benchmark.md"
  );
  const brief = fs.readFileSync(briefPath, "utf8");
  const report = buildFigmaBriefReport({
    rootDir: projectRoot,
    all: true
  });
  const benchmark = report.results.find(
    (result) => result.brief.relativePath === "docs/briefs/2026-05-owner-fee-revenue-leak-benchmark.md"
  );

  assert.match(brief, /Integrity Rescue/);
  assert.doesNotMatch(brief, /Figma capture:/);
  assert.equal(benchmark, undefined);
});

test("empty Page 1 briefs fail loud with the exact proof still required", () => {
  const rootDir = writeTempRoot({
    "docs/briefs/figma-mcp-state.json": JSON.stringify(
      {
        checkedAt: "2026-05-16",
        source: "live figma mcp",
        targets: [
          {
            briefPath: "docs/briefs/test-brief.md",
            label: "Blocked Brief",
            fileKey: "blockedKey",
            url: "https://www.figma.com/design/blockedKey?node-id=1-2",
            topLevelPages: [{ id: "0:1", name: "Page 1" }],
            pageProbe: {
              nodeId: "0:1",
              name: "Page 1",
              width: 0,
              height: 0,
              visibleChildNames: []
            }
          }
        ]
      },
      null,
      2
    ),
    "docs/briefs/test-brief.md": `# Brief: blocked

- Figma capture: \`https://www.figma.com/design/blockedKey?node-id=1-2\`
- Figma frames: \`Blocked Desktop\`, \`Blocked Mobile\`
`
  });

  const report = buildFigmaBriefReport({ rootDir, all: true });
  const output = renderFigmaBriefReport(report);

  assert.equal(report.issueCount, 1);
  assert.match(output, /empty `Page 1`/);
  assert.match(output, /Blocked Desktop/);
  assert.match(output, /Figma proof:/);
});

test("new Figma captures without a saved MCP snapshot fail until the repo knows the target", () => {
  const rootDir = writeTempRoot({
    "docs/briefs/figma-mcp-state.json": JSON.stringify(
      {
        checkedAt: "2026-05-16",
        source: "live figma mcp",
        targets: []
      },
      null,
      2
    ),
    "docs/briefs/test-brief.md": `# Brief: unknown

- Figma capture: \`https://www.figma.com/design/newKey?node-id=1-2\`
- Figma frames: \`Fresh Desktop\`
`
  });

  const report = buildFigmaBriefReport({ rootDir, all: true });

  assert.equal(report.issueCount, 1);
  assert.match(report.results[0].issues[0], /No saved Figma MCP state exists/);
});
