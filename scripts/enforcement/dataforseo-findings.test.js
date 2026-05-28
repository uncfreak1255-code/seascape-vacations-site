const fs = require("fs");
const os = require("os");
const path = require("path");
const test = require("node:test");
const assert = require("node:assert/strict");

const {
  buildDomainIndex,
  classifyIntent,
  importFindings,
  parseTask,
  slugify,
} = require("../seo/import-dataforseo-findings");

function writeJson(filePath, payload) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(payload, null, 2)}\n`);
}

function fixturePayload(keyword = "vacation rentals near anna maria island") {
  return {
    status_code: 20000,
    tasks: [
      {
        status_code: 20000,
        cost: 0.002,
        data: {
          keyword,
          tag: "fixture",
        },
        result: [
          {
            keyword,
            datetime: "2026-05-16 22:25:41 +00:00",
            check_url: "https://www.google.com/search?q=fixture",
            item_types: ["organic", "local_pack"],
            items: [
              {
                type: "organic",
                rank_group: 1,
                rank_absolute: 1,
                domain: "www.annamaria.com",
                title: "Anna Maria Vacations",
                url: "https://www.annamaria.com/",
              },
              {
                type: "organic",
                rank_group: 2,
                rank_absolute: 2,
                domain: "seascape-vacations.com",
                title: "Seascape Vacations",
                url: "https://seascape-vacations.com/stays/anna-maria-island-vacation-rentals/",
              },
              {
                type: "local_pack",
                rank_group: 1,
                rank_absolute: 3,
                domain: "seabreezevacation.com",
                title: "SeaBreeze Vacation",
                url: "https://seabreezevacation.com/",
              },
            ],
          },
        ],
      },
    ],
  };
}

test("slugify creates stable keyword file names", () => {
  assert.equal(slugify("Vacation Rentals Near Anna Maria Island"), "vacation-rentals-near-anna-maria-island");
});

test("classifyIntent separates guest, owner, guide, and brand queries", () => {
  assert.equal(classifyIntent("vacation rentals near anna maria island"), "guest booking");
  assert.equal(classifyIntent("vacation rental management Sarasota"), "owner-management");
  assert.equal(classifyIntent("Anna Maria Island vs Siesta Key"), "guide/research");
  assert.equal(classifyIntent("seascape vacations bradenton"), "local brand");
});

test("parseTask extracts Seascape visibility and competitor angles", () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "dataforseo-finding-"));
  const rawPath = path.join(tmpDir, "call-1.json");
  writeJson(rawPath, fixturePayload());

  const finding = parseTask(rawPath);

  assert.equal(finding.keyword, "vacation rentals near anna maria island");
  assert.equal(finding.seascape_visibility.length, 1);
  assert.equal(finding.competitors.length, 2);
  assert.equal(finding.competitors[0].domain, "www.annamaria.com");
  assert.equal(finding.competitors[1].angle, "map pack/local operator");
});

test("domain index rolls competitor domains across queries", () => {
  const index = buildDomainIndex([
    {
      keyword: "query one",
      competitors: [
        { domain: "example.com", angle: "local inventory" },
        { domain: "ota.com", angle: "OTA/directory" },
      ],
    },
    {
      keyword: "query two",
      competitors: [
        { domain: "example.com", angle: "local inventory" },
      ],
    },
  ]);

  assert.equal(index[0].domain, "example.com");
  assert.equal(index[0].query_count, 2);
  assert.deepEqual(index[0].queries, ["query one", "query two"]);
});

test("importFindings writes durable keyword, domain, and index files with the analytics gate", () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "dataforseo-import-"));
  const inputDir = path.join(tmpDir, "raw");
  const outputDir = path.join(tmpDir, "seo-findings");
  const receiptPath = path.join(tmpDir, "receipt.json");
  writeJson(path.join(inputDir, "call-1.json"), fixturePayload());
  writeJson(receiptPath, {
    receipt_id: "REC-FIXTURE",
    latest_gsc_data_date: "2026-05-26",
    reread_status: "blocked by freshness",
    next_branch: "hold-and-reread",
    date_or_window: {
      window_start: "2026-05-21",
      window_end: "2026-05-27",
    },
    site_work_gate: {
      status: "blocked",
      label: "`blocked` - GSC export freshness does not cover the requested window.",
    },
  });

  const result = importFindings({
    inputDir,
    outputDir,
    analyticsReceipt: receiptPath,
    check: false,
  });

  assert.equal(result.keyword_count, 1);
  assert.ok(fs.existsSync(path.join(outputDir, "README.md")));
  assert.ok(fs.existsSync(path.join(outputDir, "keywords", "vacation-rentals-near-anna-maria-island.md")));
  assert.ok(fs.existsSync(path.join(outputDir, "domains", "index.json")));

  const finding = fs.readFileSync(path.join(outputDir, "keywords", "vacation-rentals-near-anna-maria-island.md"), "utf8");
  assert.match(finding, /hold site edits; keep researching until analytics\/GSC gate opens/);
  assert.match(finding, /This finding is research memory only/);
});
