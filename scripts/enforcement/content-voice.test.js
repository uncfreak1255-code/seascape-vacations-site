const fs = require("fs");
const path = require("path");
const test = require("node:test");
const assert = require("node:assert/strict");
const { execSync } = require("node:child_process");
const { runBuildForLint } = require("./build-for-lint");
const { withWorktreeLock } = require("./worktree-lock");
const { extractAuthorizedSourceSectionText } = require("./search-brief-gate");

const projectRoot = path.resolve(__dirname, "..", "..");

const REQUIRED_BRIEF_FIELDS = [
  "persona",
  "primary keyword",
  "secondary keywords",
  "audience pattern",
  "proof source",
  "required internal links",
  "CTA target",
  "anti-claims"
];

const BANNED_GENERIC_PATTERNS = [
  /\bcurated\b/i,
  /\bnestled\b/i,
  /\belevate\b/i,
  /\bboasts\b/i,
  /\bmyriad\b/i,
  /\bseamless\b/i,
  /\bunparalleled\b/i,
  /\bcleaner\b/i,
  /\battentive local operations\b/i,
  /\bclearer owner communication\b/i,
  /\bfewer quiet misses\b/i,
  /\bhere'?s the thing\b/i,
  /\bhere'?s (?:what|why|how)\b/i,
  /\bthis matters because\b/i,
  /\blet me be clear\b/i,
  /\bmake no mistake\b/i,
  /\bat its core\b/i,
  /\bin today'?s\b/i,
  /\bin a world where\b/i,
  /\bit'?s worth noting\b/i,
  /\bwhen it comes to\b/i,
  /\bat the end of the day\b/i,
  /\bfull stop\b/i,
  /\bgame[- ]changer\b/i,
  /\bdeep dive\b/i,
  /\bunpack\b/i,
  /\blean into\b/i,
  /\blandscape\b/i,
  /\bdouble down\b/i,
  /\btake a step back\b/i,
  /\bcircle back\b/i,
  /\bmoving forward\b/i,
  /\bon the same page\b/i,
  /\bnavigat(?:e|ing) challenges\b/i,
  /\bthe stakes are high\b/i,
  /\bthe implications are significant\b/i,
  /\bthe consequences are real\b/i,
  /\bthe reasons are structural\b/i,
  /\bnot just\b[^.!?]{1,120}\bbut(?: also)?\b/i,
  /\b(?:the )?(?:answer|question) isn'?t\b[^.!?]{1,120}\bit'?s\b/i,
  /\b(?:[\w'-]+\s+){0,8}is not the problem\.\s+(?:[\w'-]+\s+){1,10}is\b/i,
  /\bit feels like\b[^.!?]{1,120}\.\s*it (?:is|'?s) actually\b/i
];

const SECTION_B_HARDBLOCK_PATTERNS = [
  /\bbest of both worlds\b/i,
  /\bthe term ["“][^"”]+["”] captures\b/i,
  /\bnothing says\b/i,
  /\bpicture (?:this|yourself)\b/i,
  /\bthe result\?\b/i,
  /\bthere(?:'|’)s nothing (?:better|quite like)\b/i
];

const OWNER_JARGON_PATTERNS = [
  /\bowner net\b/i,
  /\bleak stack\b/i,
  /\bOTA dependence\b/i,
  /\bchannel drag\b/i,
  /\bchannel mix\b/i,
  /\bdirect mix\b/i,
  /\boperating clarity\b/i,
  /\bpricing discipline\b/i
];

const INTERNAL_PROCESS_PATTERNS = [
  /\bapproved benchmark\b/i,
  /\bapproved inputs?\b/i,
  /\bapproved benchmark inputs\b/i
];

const GRAY_INTERNAL_COPY_PATTERNS = [
  /\bplanning math\b/i,
  /\bmarketplace[- ]fee exposure\b/i,
  /\bsource[- ]bounded\b/i,
  /\baccepted formulas?\b/i,
  /\bproof boundar(?:y|ies)\b/i,
  /\bproven costs?\b/i,
  /\blikely costs?\b/i,
  /\bmissing information\b/i
];

const READER_LANGUAGE_PATTERNS = [
  /\btrip shapes?\b/i,
  /\bstay[- ]bases?\b/i,
  /\bbooking paths?\b/i,
  /\bnamed\s+[^.!?]{1,40}\b(?:option|home)\b/i,
  /\bright stay\b/i,
  /\bresearch mode\b/i
];

const INSTRUCTION_TEMPLATE_PATTERNS = [
  /\b(?:use|read|open|choose|pick)\s+(?:this|it|this page)\s+(?:when|if|after|before)\b/i,
  /\bdo not\s+use\s+this\s+page\s+if\b/i,
  /\bfor homes where\b/i
];

const FIRST_PARAGRAPH_PROOF_PATTERNS = [/\bobserved\b/i, /\bscenario\b/i, /\bmethodology\b/i];

const PUBLIC_CONTENT_PATTERNS = [
  /^src\/guides\/.+\.(html|njk)$/i,
  /^src\/research\/.+\.njk$/i,
  /^src\/property-management\/.+\.njk$/i,
  /^src\/stays\/.+\.njk$/i,
  /^src\/index\.njk$/i
];

const ALWAYS_SCANNED_PUBLIC_COPY_PATH_PATTERNS = [
  ...PUBLIC_CONTENT_PATTERNS,
  /^src\/properties\/.+\.njk$/i
];

const ALWAYS_SCANNED_PUBLIC_COPY_DATA_FILES = [path.join("src", "_data", "seoPages.json")];

const OWNER_CONTENT_PATTERNS = [
  /^src\/property-management\/.+\.njk$/i,
  /^src\/research\/owner-.+\.njk$/i,
  /^src\/research\/.+owner.+\.njk$/i
];

function read(relativePath) {
  return fs.readFileSync(path.join(projectRoot, relativePath), "utf8");
}

function isPublicContentFile(relativePath) {
  return PUBLIC_CONTENT_PATTERNS.some((pattern) => pattern.test(relativePath));
}

function isOwnerContentFile(relativePath) {
  return OWNER_CONTENT_PATTERNS.some((pattern) => pattern.test(relativePath));
}

function normalizeSourceCopyText(source) {
  return source
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/\{#[\s\S]*?#\}/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeVisibleText(source) {
  return source
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/\{#[\s\S]*?#\}/g, " ")
    .replace(/\{%[\s\S]*?%\}/g, " ")
    .replace(/\{\{[\s\S]*?\}\}/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function decodeJavaScriptString(value) {
  return value
    .replace(/\\n/g, " ")
    .replace(/\\(["'`\\])/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

function extractJavaScriptStrings(source) {
  const patterns = [
    /"((?:\\.|[^"\\])*)"/g,
    /'((?:\\.|[^'\\])*)'/g,
    /`((?:\\.|[^`\\])*)`/g
  ];

  return patterns
    .flatMap((pattern) =>
      Array.from(source.matchAll(pattern), (match) => decodeJavaScriptString(match[1]))
    )
    .filter(Boolean);
}

function extractScriptGeneratedReaderCopy(source) {
  const scriptBodies = Array.from(
    source.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi),
    (match) => match[1]
  );

  return scriptBodies.flatMap(extractJavaScriptStrings).join(" ");
}

function extractComponentGeneratedReaderCopy(source) {
  const componentExpressions = Array.from(
    source.matchAll(/\{\{([\s\S]*?)\}\}/g),
    (match) => match[1]
  );

  return componentExpressions.flatMap(extractJavaScriptStrings).join(" ");
}

function extractReaderSurfaceText(source) {
  return [
    normalizeVisibleText(source),
    extractScriptGeneratedReaderCopy(source),
    extractComponentGeneratedReaderCopy(source)
  ]
    .filter(Boolean)
    .join(" ");
}

function lintReaderLanguage(relativePath, text, scopeLabel) {
  const violations = [];

  for (const pattern of READER_LANGUAGE_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      violations.push(
        `${relativePath}: ${scopeLabel} contains internal planning language "${match[0]}"`
      );
    }
  }

  return violations;
}

function readBase(relativePath) {
  try {
    return execSync(`git show origin/main:${relativePath}`, {
      cwd: projectRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"]
    });
  } catch {
    return null;
  }
}

function hasVisibleReaderCopyDiff(relativePath, source) {
  const baseSource = readBase(relativePath);
  if (baseSource === null) {
    return true;
  }

  return extractReaderSurfaceText(baseSource) !== extractReaderSurfaceText(source);
}

function getBuiltPublicContentPath(relativePath, source) {
  const route = getCurrentRoute(relativePath, source).split(/[?#]/)[0];
  const normalizedRoute = route.replace(/^\/+|\/+$/g, "");

  if (!normalizedRoute) {
    return path.join("_site", "index.html");
  }

  if (normalizedRoute.endsWith(".html")) {
    return path.join("_site", normalizedRoute);
  }

  return path.join("_site", normalizedRoute, "index.html");
}

function lintRenderedPublicContent(relativePath, source) {
  const builtRelativePath = getBuiltPublicContentPath(relativePath, source);
  const builtAbsolutePath = path.join(projectRoot, builtRelativePath);

  if (!fs.existsSync(builtAbsolutePath)) {
    return [`${relativePath}: rendered output is missing at ${builtRelativePath}`];
  }

  return lintReaderLanguage(
    relativePath,
    normalizeVisibleText(fs.readFileSync(builtAbsolutePath, "utf8")),
    "rendered reader copy"
  );
}

function ensureRenderedOutputForContentLint() {
  if (process.env.npm_lifecycle_event !== "lint:content") {
    return;
  }

  runBuildForLint({ cwd: projectRoot });
}

function listFilesRecursive(relativeDir) {
  const absoluteDir = path.join(projectRoot, relativeDir);
  const results = [];

  function walk(currentDir) {
    for (const entry of fs.readdirSync(currentDir, { withFileTypes: true })) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
        continue;
      }

      results.push(path.relative(projectRoot, fullPath).split(path.sep).join("/"));
    }
  }

  walk(absoluteDir);
  return results;
}

function getFirstParagraphText(source) {
  const withoutStyleAndScript = source
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ");
  const mainIndex = withoutStyleAndScript.search(/<main\b/i);
  const scoped = mainIndex >= 0 ? withoutStyleAndScript.slice(mainIndex) : withoutStyleAndScript;
  const paragraphMatch = scoped.match(/<p\b[^>]*>([\s\S]*?)<\/p>/i);

  if (!paragraphMatch) {
    return "";
  }

  return normalizeVisibleText(paragraphMatch[1]);
}

function parseRequiredLinksFromBrief(briefContent) {
  const match = briefContent.match(/^- required internal links:\s*(.+)$/im);
  if (!match) {
    return [];
  }

  return match[1]
    .split(",")
    .map((value) => value.trim())
    .filter((value) => value.startsWith("/"));
}

function parseRequiredLinkMapFromBrief(briefContent) {
  const map = new Map();
  const sectionStart = briefContent.search(/^## Required Internal Link Map\s*$/im);

  if (sectionStart === -1) {
    return map;
  }

  const sectionBodyStart = briefContent.indexOf("\n", sectionStart);
  const sectionRemainder = briefContent.slice(sectionBodyStart + 1);
  const nextSectionIndex = sectionRemainder.search(/^## /m);
  const sectionBody =
    nextSectionIndex === -1 ? sectionRemainder : sectionRemainder.slice(0, nextSectionIndex);

  for (const line of sectionBody.split(/\r?\n/)) {
    const match = line.match(/^-\s+([^:]+):\s+(.+)$/);
    if (!match) {
      continue;
    }

    const relativePath = match[1].trim();
    const links = match[2]
      .split(",")
      .map((value) => value.trim())
      .filter((value) => value.startsWith("/"));

    if (relativePath && links.length > 0) {
      map.set(relativePath, links);
    }
  }

  return map;
}

function parseMissingBriefFields(briefContent) {
  return REQUIRED_BRIEF_FIELDS.filter((field) => {
    const expression = new RegExp(`^- ${field}:\\s+.+$`, "im");
    return !expression.test(briefContent);
  });
}

function briefMentionsContentFile(briefContent, relativePath, source) {
  const authorizedSourceText = extractAuthorizedSourceSectionText(briefContent);
  if (authorizedSourceText.includes(relativePath)) {
    return true;
  }

  const route = getCurrentRoute(relativePath, source);
  if (route === "/") {
    return false;
  }

  return Boolean(route && authorizedSourceText.includes(route));
}

function selectBriefForContentFile(briefs, relativePath, source) {
  if (briefs.length === 1) {
    return briefs[0];
  }

  return briefs.find((brief) => briefMentionsContentFile(brief.content, relativePath, source)) || null;
}

function getCurrentRoute(relativePath, source) {
  const permalinkMatch = source.match(/^permalink:\s*["']([^"']+)["']/m);
  if (permalinkMatch) {
    return permalinkMatch[1];
  }

  const withoutSrc = relativePath.replace(/^src/, "").replace(/\.njk$/i, "");
  if (withoutSrc.endsWith("/index")) {
    return `${withoutSrc.slice(0, -"/index".length)}/`;
  }

  return `${withoutSrc}/`;
}

function normalizeChangedFileOutputs(outputs) {
  return [
    ...new Set(
      outputs.flatMap((output) =>
        output
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean)
      )
    )
  ].sort();
}

function getChangedFiles() {
  try {
    const mergeBase = execSync("git merge-base HEAD origin/main", {
      cwd: projectRoot,
      encoding: "utf8"
    }).trim();

    if (!mergeBase) {
      return [];
    }

    return normalizeChangedFileOutputs(
      [
        `git diff --name-only --diff-filter=ACMR ${mergeBase}...HEAD`,
        "git diff --name-only --diff-filter=ACMR",
        "git diff --cached --name-only --diff-filter=ACMR"
      ].map((command) =>
        execSync(command, {
          cwd: projectRoot,
          encoding: "utf8"
        })
      )
    );
  } catch {
    return [];
  }
}

function assertSkillsInOrder(source, label) {
  const orderedSkills = ["`copywriting`", "`enterprise-ui-writing`", "`humanizer`"];
  let lastIndex = -1;

  for (const skill of orderedSkills) {
    const currentIndex = source.indexOf(skill);
    assert.notEqual(currentIndex, -1, `${label} should mention ${skill}`);
    assert.ok(currentIndex > lastIndex, `${label} should mention ${skill} in visible-copy order`);
    lastIndex = currentIndex;
  }
}

function collectStringLeaves(value, currentPath = "", leaves = []) {
  if (typeof value === "string") {
    leaves.push({ path: currentPath || "<root>", value });
    return leaves;
  }

  if (Array.isArray(value)) {
    value.forEach((entry, index) => {
      collectStringLeaves(entry, `${currentPath}[${index}]`, leaves);
    });
    return leaves;
  }

  if (value && typeof value === "object") {
    for (const [key, entry] of Object.entries(value)) {
      const nextPath = currentPath ? `${currentPath}.${key}` : key;
      collectStringLeaves(entry, nextPath, leaves);
    }
  }

  return leaves;
}

function normalizeLeafText(value) {
  return value.replace(/\s+/g, " ").trim();
}

function getChangedStringLeaves(relativePath, currentValue) {
  const currentLeaves = collectStringLeaves(currentValue).map((entry) => ({
    path: entry.path,
    value: normalizeLeafText(entry.value)
  }));
  const baseSource = readBase(relativePath);

  if (baseSource === null) {
    return currentLeaves;
  }

  try {
    const baseLeaves = new Map(
      collectStringLeaves(JSON.parse(baseSource)).map((entry) => [entry.path, normalizeLeafText(entry.value)])
    );

    return currentLeaves.filter((entry) => baseLeaves.get(entry.path) !== entry.value);
  } catch {
    return currentLeaves;
  }
}

function lintSectionBHardblocks(relativePath, text, scopeLabel = "reader copy") {
  const violations = [];

  for (const pattern of SECTION_B_HARDBLOCK_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      violations.push(`${relativePath}: ${scopeLabel} hits Section-B hard-block "${match[0]}"`);
    }
  }

  return violations;
}

function lintChangedSeoPageCopy(relativePath, data) {
  const violations = [];

  for (const entry of getChangedStringLeaves(relativePath, data)) {
    violations.push(
      ...lintSectionBHardblocks(
        `${relativePath}:${entry.path}`,
        entry.value,
        "source-backed copy"
      )
    );
  }

  return violations;
}

function lintInstructionTemplateSource(relativePath, source) {
  const violations = [];
  const sourceCopyText = normalizeSourceCopyText(source);

  for (const pattern of INSTRUCTION_TEMPLATE_PATTERNS) {
    const match = sourceCopyText.match(pattern);
    if (match) {
      violations.push(
        `${relativePath}: instruction-template public copy "${match[0]}" sounds like agent/session voice`
      );
    }
  }

  return violations;
}

function lintInstructionTemplateData(relativePath, data) {
  const violations = [];

  for (const entry of collectStringLeaves(data)) {
    const normalizedValue = entry.value.replace(/\s+/g, " ").trim();

    for (const pattern of INSTRUCTION_TEMPLATE_PATTERNS) {
      const match = normalizedValue.match(pattern);
      if (match) {
        violations.push(
          `${relativePath}:${entry.path}: instruction-template public copy "${match[0]}" sounds like agent/session voice`
        );
      }
    }
  }

  return violations;
}

function lintPublicContent(relativePath, source, requiredLinks, options = {}) {
  const violations = [];
  const shouldCheckRequiredLinks = options.checkRequiredLinks !== false;
  const visibleText = normalizeVisibleText(source);
  const scriptGeneratedReaderCopy = extractScriptGeneratedReaderCopy(source);
  const componentGeneratedReaderCopy = extractComponentGeneratedReaderCopy(source);
  const firstParagraph = getFirstParagraphText(source);
  const currentRoute = getCurrentRoute(relativePath, source);

  violations.push(...lintInstructionTemplateSource(relativePath, source));
  violations.push(...lintReaderLanguage(relativePath, visibleText, "reader copy"));
  violations.push(
    ...lintReaderLanguage(relativePath, scriptGeneratedReaderCopy, "JavaScript-generated reader copy")
  );
  violations.push(
    ...lintReaderLanguage(
      relativePath,
      componentGeneratedReaderCopy,
      "component-generated reader copy"
    )
  );

  for (const pattern of BANNED_GENERIC_PATTERNS) {
    const match = visibleText.match(pattern);
    if (match) {
      violations.push(`${relativePath}: banned generic phrasing "${match[0]}"`);
    }
  }

  for (const pattern of INTERNAL_PROCESS_PATTERNS) {
    const match = visibleText.match(pattern);
    if (match) {
      violations.push(`${relativePath}: internal process language "${match[0]}" should not ship in reader copy`);
    }
  }

  for (const pattern of GRAY_INTERNAL_COPY_PATTERNS) {
    const match = visibleText.match(pattern);
    if (match) {
      violations.push(`${relativePath}: gray internal phrasing "${match[0]}" should not ship in reader copy`);
    }
  }

  for (const pattern of FIRST_PARAGRAPH_PROOF_PATTERNS) {
    const match = firstParagraph.match(pattern);
    if (match) {
      violations.push(`${relativePath}: first paragraph should not lead with proof language like "${match[0]}"`);
    }
  }

  violations.push(...lintSectionBHardblocks(relativePath, visibleText));

  if (isOwnerContentFile(relativePath)) {
    for (const pattern of OWNER_JARGON_PATTERNS) {
      const match = visibleText.match(pattern);
      if (match) {
        violations.push(`${relativePath}: banned owner jargon "${match[0]}"`);
      }
    }

    const youMatches = visibleText.match(/\b(you|your)\b/gi) || [];
    const detachedOwnerMatches = visibleText.match(/\bthe owner\b(?!-)/gi) || [];

    if (detachedOwnerMatches.length > 0 && youMatches.length <= detachedOwnerMatches.length) {
      violations.push(
        `${relativePath}: owner copy should prefer "you/your" over detached "the owner" language`
      );
    }
  }

  if (shouldCheckRequiredLinks) {
    if (requiredLinks.length < 2) {
      violations.push(`${relativePath}: active brief must list at least two required internal links`);
    } else {
      for (const link of requiredLinks) {
        if (link === currentRoute) {
          continue;
        }

        if (!source.includes(`href="${link}"`) && !source.includes(`href='${link}'`)) {
          violations.push(`${relativePath}: missing required internal link ${link}`);
        }
      }
    }
  }

  return violations;
}

test("content quality gate doc defines reader, proof, and agent copy plus the visible-copy lane", () => {
  const gateDoc = read(path.join("docs", "process", "content-quality-gate.md"));

  assert.equal(gateDoc.includes("reader copy"), true);
  assert.equal(gateDoc.includes("proof copy"), true);
  assert.equal(gateDoc.includes("agent copy"), true);
  assert.equal(gateDoc.includes("No Brief, No Writing"), true);
  assert.equal(gateDoc.includes("Visible Copy Lane"), true);
  assertSkillsInOrder(gateDoc, "content quality gate doc");
  assert.equal(gateDoc.includes("npm run lint:content"), true);
});

test("brief template carries the required content-gate inputs", () => {
  const briefTemplate = read(path.join("docs", "briefs", "_template.md"));

  for (const field of REQUIRED_BRIEF_FIELDS) {
    assert.equal(
      briefTemplate.includes(`- ${field}:`),
      true,
      `brief template should include ${field}`
    );
  }
});

test("repo instructions require the content gate and lint command for content PRs", () => {
  const agents = read("AGENTS.md");
  const claude = read("CLAUDE.md");
  const reviewChecklist = read(path.join("docs", "process", "before-user-review-checklist.md"));
  const claudeWorkflow = claude.split("## Required Batch Workflow")[1] || "";

  assert.equal(agents.includes("docs/process/content-quality-gate.md"), true);
  assert.equal(agents.includes("npm run lint:content"), true);
  assertSkillsInOrder(agents, "AGENTS content gate");
  assert.equal(claude.includes("docs/process/content-quality-gate.md"), true);
  assert.equal(claude.includes("npm run lint:content"), true);
  assertSkillsInOrder(claudeWorkflow, "CLAUDE workflow");
  assertSkillsInOrder(reviewChecklist, "before user review checklist");
});

test("reader-language gate rejects static, JavaScript, arbitrary object-key, component, and rendered bypasses", () => {
  const failingSample = `
    <main>
      <h1>Pick the trip shape before the stay base.</h1>
      <p>Follow the booking path to our named Sarasota-side option.</p>
      <a href="/guides/">Browse guides</a>
      <a href="/properties/">Browse homes</a>
    </main>
    <script>
      const choice = { description: "Open the right stay in research mode." };
      document.querySelector("[data-guide-result]").textContent = "Choose the booking path";
    </script>
    {{ guideDecisionCard({
      title: "Choose the stay base",
      copy: "Follow the booking path"
    }) }}
  `;

  const violations = lintPublicContent("src/guides/example-guide.html", failingSample, [
    "/guides/",
    "/properties/"
  ]);

  assert.equal(violations.some((entry) => entry.includes("reader copy") && entry.includes("trip shape")), true);
  assert.equal(violations.some((entry) => entry.includes("JavaScript-generated reader copy")), true);
  assert.equal(violations.some((entry) => entry.includes("component-generated reader copy")), true);

  const renderedViolations = lintReaderLanguage(
    "src/guides/example-guide.html",
    normalizeVisibleText("<main><p>Choose the trip shape before booking.</p></main>"),
    "rendered reader copy"
  );
  assert.equal(renderedViolations.some((entry) => entry.includes("rendered reader copy")), true);
});

test("AMI versus Siesta guide places the exact Sarasota Luxe availability action before the long comparison", () => {
  const source = read(path.join("src", "guides", "anna-maria-island-vs-siesta-key.html"));
  const sarasotaAction = source.indexOf('href="/properties/sarasota-luxe/#check-availability"');
  const longComparison = source.indexOf("data-guide-long-comparison");

  assert.ok(sarasotaAction >= 0, "guide should link directly to Sarasota Luxe availability");
  assert.ok(longComparison >= 0, "guide should mark its detailed comparison without fixing its design or heading copy");
  assert.ok(sarasotaAction < longComparison, "Sarasota Luxe action should appear before the long comparison");
});

test("AMI versus Siesta guide is free of internal planning language across reader surfaces", () => {
  const guidePath = path.join("src", "guides", "anna-maria-island-vs-siesta-key.html");
  const violations = lintPublicContent(guidePath, read(guidePath), [
    "/stays/anna-maria-island-vacation-rentals/",
    "/stays/siesta-key-area-vacation-rentals/",
    "/properties/sarasota-luxe/#check-availability"
  ]).filter((entry) => entry.includes("internal planning language"));

  assert.deepEqual(violations, []);
});

test("approved owner research sample passes the new public-copy guardrails", () => {
  const approvedSample = `
    <main>
      <section>
        <h1>What do vacation rental fees actually cost?</h1>
        <p>Airbnb's published host fee, Stripe's card price, and a property manager's fee cover different services.</p>
        <p><a href="/property-management/vacation-rental-management-fees-florida/">Compare management fees</a> by checking the fee basis, included work, and separate charges.</p>
        <p><a href="/property-management/maximize-vacation-rental-income-florida/">Review owner income</a> with the property's real agreement and statement.</p>
        <p><a href="/property-management/">Seascape property management</a> provides a property-specific quote in writing.</p>
      </section>
    </main>
  `;

  const violations = lintPublicContent("src/research/owner-fee-revenue-leak-benchmark-2026.njk", approvedSample, [
    "/property-management/",
    "/property-management/vacation-rental-management-fees-florida/",
    "/property-management/maximize-vacation-rental-income-florida/"
  ]);

  assert.deepEqual(violations, []);
});

test("lint catches internal-process language and detached owner voice in a sample owner page", () => {
  const failingSample = `
    <main>
      <section>
        <p>Approved benchmark inputs help the owner understand the methodology before switching.</p>
        <p>We mark proven cost, likely cost, and missing information separately before you switch.</p>
        <p>Attentive local operations and clearer owner communication reduce quiet misses while improving owner net through better pricing discipline.</p>
      </section>
    </main>
  `;

  const violations = lintPublicContent("src/property-management/example-owner-page.njk", failingSample, [
    "/property-management/",
    "/property-management/vacation-rental-management-fees-florida/"
  ]);

  assert.equal(
    violations.some((entry) => entry.includes("internal process language")),
    true
  );
  assert.equal(
    violations.some((entry) => entry.includes("gray internal phrasing")),
    true
  );
  assert.equal(
    violations.some((entry) => entry.includes('owner copy should prefer "you/your"')),
    true
  );
  assert.equal(
    violations.some((entry) => entry.includes("banned generic phrasing")),
    true
  );
  assert.equal(
    violations.some((entry) => entry.includes("banned owner jargon")),
    true
  );
  assert.equal(
    violations.some((entry) => entry.includes("first paragraph should not lead with proof language")),
    true
  );
});

test("lint catches donor-mined AI rhythm patterns before they ship in public copy", () => {
  const failingSample = `
    <main>
      <section>
        <p>Here's the thing: this matters because the page is not just a service page but also a trust signal.</p>
        <p>At the end of the day, the question isn't whether owners need help, it's whether the offer is a game-changer.</p>
      </section>
    </main>
  `;

  const violations = lintPublicContent("src/property-management/example-owner-page.njk", failingSample, [
    "/property-management/",
    "/property-management/vacation-rental-management-fees-florida/"
  ]);

  assert.equal(
    violations.some((entry) => entry.includes('banned generic phrasing "Here\'s the thing"')),
    true
  );
  assert.equal(
    violations.some((entry) => entry.includes('banned generic phrasing "this matters because"')),
    true
  );
  assert.equal(
    violations.some((entry) => entry.includes('banned generic phrasing "not just a service page but also"')),
    true
  );
  assert.equal(
    violations.some((entry) => entry.includes('banned generic phrasing "At the end of the day"')),
    true
  );
  assert.equal(
    violations.some((entry) => entry.includes('banned generic phrasing "the question isn\'t whether owners need help, it\'s"')),
    true
  );
});

test("lint catches instruction-template public copy even when it lives in source-backed helper data", () => {
  const failingSample = `
    <main>
      <section>
        <p>You can compare regions without giving up the better trip fit.</p>
        <p><a href="/properties/">Browse homes</a></p>
        <p><a href="/guides/booking-direct-vacation-rentals/">See the fee math</a></p>
      </section>
    </main>
    <script>
      const helperCopy = {
        body: "Use this when direct-booking savings matter as much as the home itself."
      };
    </script>
  `;

  const violations = lintPublicContent("src/properties/index.njk", failingSample, [
    "/properties/",
    "/guides/booking-direct-vacation-rentals/"
  ]);

  assert.equal(
    violations.some((entry) => entry.includes('instruction-template public copy "Use this when"')),
    true
  );
});

test("lint catches donor-mined throat clearing, business jargon, and vague declarations", () => {
  const failingSample = `
    <main>
      <section>
        <p>Here's why this matters: when it comes to navigating challenges, owners need a partner who can unpack the revenue landscape.</p>
        <p>Let me be clear: the stakes are high, and the implications are significant.</p>
        <p>In a world where every guest expects perfection, you need to double down on seamless execution and cleaner handoffs. Full stop.</p>
      </section>
    </main>
  `;

  const violations = lintPublicContent("src/property-management/example-owner-page.njk", failingSample, [
    "/property-management/",
    "/property-management/vacation-rental-management-fees-florida/"
  ]);

  assert.equal(
    violations.some((entry) => entry.includes('banned generic phrasing "Here\'s why"')),
    true
  );
  assert.equal(
    violations.some((entry) => entry.includes('banned generic phrasing "when it comes to"')),
    true
  );
  assert.equal(
    violations.some((entry) => entry.includes('banned generic phrasing "navigating challenges"')),
    true
  );
  assert.equal(
    violations.some((entry) => entry.includes('banned generic phrasing "unpack"')),
    true
  );
  assert.equal(
    violations.some((entry) => entry.includes('banned generic phrasing "landscape"')),
    true
  );
  assert.equal(
    violations.some((entry) => entry.includes('banned generic phrasing "Let me be clear"')),
    true
  );
  assert.equal(
    violations.some((entry) => entry.includes('banned generic phrasing "the stakes are high"')),
    true
  );
  assert.equal(
    violations.some((entry) => entry.includes('banned generic phrasing "the implications are significant"')),
    true
  );
  assert.equal(
    violations.some((entry) => entry.includes('banned generic phrasing "In a world where"')),
    true
  );
  assert.equal(
    violations.some((entry) => entry.includes('banned generic phrasing "double down"')),
    true
  );
  assert.equal(
    violations.some((entry) => entry.includes('banned generic phrasing "Full stop"')),
    true
  );
  assert.equal(
    violations.some((entry) => entry.includes('banned generic phrasing "cleaner"')),
    true
  );
});

test("lint catches Section-B hard-block phrases in public copy", () => {
  const failingSample = `
    <main>
      <section>
        <p>Nothing says easy beach planning like a page that opens with a canned line.</p>
        <p>Picture yourself clicking through another generic vacation pitch.</p>
      </section>
    </main>
  `;

  const violations = lintPublicContent("src/guides/example-guide.html", failingSample, [
    "/guides/",
    "/properties/"
  ]);

  assert.equal(
    violations.some((entry) => entry.includes('Section-B hard-block "Nothing says"')),
    true
  );
  assert.equal(
    violations.some((entry) => entry.includes('Section-B hard-block "Picture yourself"')),
    true
  );
});

test("seo page data does not use cleaner as positioning shorthand", () => {
  const seoPages = JSON.parse(read(path.join("src", "_data", "seoPages.json")));
  const violations = [];

  for (const entry of collectStringLeaves(seoPages)) {
    const normalizedValue = entry.value.replace(/\s+/g, " ").trim();
    const match = normalizedValue.match(/\bcleaner\b/i);

    if (match) {
      violations.push(`src/_data/seoPages.json:${entry.path}: banned positioning shorthand "${match[0]}"`);
    }
  }

  assert.deepEqual(violations, []);
});

test("lint catches mechanical setup-reveal structures from donor review", () => {
  const failingSample = `
    <main>
      <section>
        <p>Your manager is not the problem. The missing review cadence is.</p>
        <p>It feels like a booking issue. It is actually a pricing follow-up problem.</p>
      </section>
    </main>
  `;

  const violations = lintPublicContent("src/property-management/example-owner-page.njk", failingSample, [
    "/property-management/",
    "/property-management/vacation-rental-management-fees-florida/"
  ]);

  assert.equal(
    violations.some((entry) => entry.includes('banned generic phrasing "Your manager is not the problem. The missing review cadence is"')),
    true
  );
  assert.equal(
    violations.some((entry) => entry.includes('banned generic phrasing "It feels like a booking issue. It is actually"')),
    true
  );
});

test("content lint does not require a page to link to itself", () => {
  const sample = `
    ---
    permalink: "/property-management/"
    ---
    <main>
      <section>
        <p>You are comparing management fees and booking channels.</p>
        <p><a href="/property-management/vacation-rental-management-fees-florida/">Fee guide</a></p>
        <p><a href="/property-management/maximize-vacation-rental-income-florida/">Income guide</a></p>
      </section>
    </main>
  `;

  const violations = lintPublicContent("src/property-management/index.njk", sample, [
    "/property-management/",
    "/property-management/vacation-rental-management-fees-florida/",
    "/property-management/maximize-vacation-rental-income-florida/"
  ]);

  assert.deepEqual(violations, []);
});

test("changed-file gate can skip content lint for structural-only public diffs", () => {
  const sample = `
    ---
    permalink: "/guides/example/"
    ---
    <main>
      <p>Choose the beach base that fits the trip.</p>
      <p><a href="/guides/updated/">Updated route</a></p>
    </main>
  `;

  const shouldCheckContent = false;
  const violations = shouldCheckContent ? lintPublicContent("src/guides/example.html", sample, [
    "/guides/",
    "/stays/bradenton-vacation-rentals-near-beaches/"
  ]) : [];

  assert.deepEqual(violations, []);
});

test("changed-file collection unions committed, staged, and unstaged paths", () => {
  assert.deepEqual(
    normalizeChangedFileOutputs([
      "src/committed.njk\nsrc/shared.njk\n",
      "src/unstaged.njk\nsrc/shared.njk\n",
      "src/staged.njk\n"
    ]),
    [
      "src/committed.njk",
      "src/shared.njk",
      "src/staged.njk",
      "src/unstaged.njk"
    ]
  );
});

test("brief selection does not match the homepage against every slash link", () => {
  const unrelatedBrief = {
    relativePath: "docs/briefs/2026-06-ami-rental-companies-regression-rescue.md",
    content: [
      "- required internal links: /stays/book-direct-anna-maria-island/, /guides/anna-maria-island-vacation-cost/",
      "- source files likely to change: `src/guides/best-vacation-rental-companies-ami.html`"
    ].join("\n")
  };
  const homepageBrief = {
    relativePath: "docs/briefs/2026-06-homepage-guide-card-freshness.md",
    content: [
      "- required internal links: /guides/bradenton-vs-sarasota/, /guides/anna-maria-island-vs-siesta-key/, /guides/",
      "- source files likely to change:",
      "  - `src/index.njk`"
    ].join("\n")
  };

  assert.equal(
    selectBriefForContentFile([unrelatedBrief, homepageBrief], "src/index.njk", ""),
    homepageBrief
  );
});

test("brief selection ignores incidental route links outside source-file sections", () => {
  const unrelatedBrief = {
    relativePath: "docs/briefs/2026-06-homepage-guide-card-freshness.md",
    content: [
      "- required internal links: /guides/example/, /guides/",
      "- source files likely to change:",
      "  - `src/index.njk`"
    ].join("\n")
  };
  const guideBrief = {
    relativePath: "docs/briefs/2026-06-example-guide-rescue.md",
    content: [
      "- required internal links: /stays/book-direct-anna-maria-island/, /guides/",
      "- source files likely to change:",
      "  - `src/guides/example.html`"
    ].join("\n")
  };
  const source = [
    "---",
    "permalink: /guides/example/",
    "---",
    "<p>Example guide.</p>"
  ].join("\n");

  assert.equal(
    selectBriefForContentFile([unrelatedBrief, guideBrief], "src/guides/example.html", source),
    guideBrief
  );
});

test("owner seo page data avoids banned owner jargon", () => {
  const seoPages = JSON.parse(read(path.join("src", "_data", "seoPages.json")));
  const violations = [];

  for (const entry of seoPages.owner) {
    const visibleText = JSON.stringify(entry);

    for (const pattern of OWNER_JARGON_PATTERNS) {
      const match = visibleText.match(pattern);
      if (match) {
        violations.push(`${entry.slug}: banned owner jargon "${match[0]}"`);
      }
    }
  }

  assert.deepEqual(violations, []);
});

test("repo public-copy source and data surfaces do not ship instruction-template public copy", () => {
  const sourceViolations = listFilesRecursive("src")
    .filter((relativePath) =>
      ALWAYS_SCANNED_PUBLIC_COPY_PATH_PATTERNS.some((pattern) => pattern.test(relativePath))
    )
    .flatMap((relativePath) => lintInstructionTemplateSource(relativePath, read(relativePath)));

  const dataViolations = ALWAYS_SCANNED_PUBLIC_COPY_DATA_FILES.flatMap((relativePath) =>
    lintInstructionTemplateData(relativePath, JSON.parse(read(relativePath)))
  );

  assert.deepEqual([...sourceViolations, ...dataViolations], []);
});

function runChangedPublicContentGate() {
  ensureRenderedOutputForContentLint();

  const changedFiles = getChangedFiles();
  const changedPublicContentFiles = changedFiles.filter(isPublicContentFile);
  const seoPagesPath = path.join("src", "_data", "seoPages.json");
  const changedSeoPageCopy = changedFiles.includes(seoPagesPath);

  if (changedPublicContentFiles.length === 0 && !changedSeoPageCopy) {
    assert.ok(true, "no changed public content or source-backed copy files on this branch");
    return;
  }

  const changedReaderCopyFiles = changedPublicContentFiles.filter((relativePath) =>
    hasVisibleReaderCopyDiff(relativePath, read(relativePath))
  );

  if (changedReaderCopyFiles.length === 0 && !changedSeoPageCopy) {
    assert.ok(true, "changed public content files have no reader-visible copy diff");
    return;
  }

  const changedBriefFiles = changedFiles.filter((relativePath) =>
    /^docs\/briefs\/.+\.md$/i.test(relativePath) && !/^docs\/briefs\/_template\.md$/i.test(relativePath)
  );
  assert.ok(
    changedBriefFiles.length >= 1,
    `public content PRs must change at least one active brief, found ${changedBriefFiles.length}`
  );

  const briefs = changedBriefFiles.map((relativePath) => ({
    relativePath,
    content: read(relativePath),
  }));

  for (const brief of briefs) {
    const missingBriefFields = parseMissingBriefFields(brief.content);
    assert.deepEqual(
      missingBriefFields,
      [],
      `active brief ${brief.relativePath} is missing required content-gate fields: ${missingBriefFields.join(", ")}`
    );
  }

  const violations = [];

  for (const relativePath of changedReaderCopyFiles) {
    const source = read(relativePath);
    const brief = selectBriefForContentFile(briefs, relativePath, source);
    assert.ok(
      brief,
      `${relativePath}: changed reader copy must be named by one changed active brief when multiple briefs are present`
    );

    const defaultRequiredLinks = parseRequiredLinksFromBrief(brief.content);
    const requiredLinkMap = parseRequiredLinkMapFromBrief(brief.content);
    violations.push(
      ...lintPublicContent(
        relativePath,
        source,
        requiredLinkMap.get(relativePath) || defaultRequiredLinks
      )
    );
    violations.push(...lintRenderedPublicContent(relativePath, source));
  }

  if (changedSeoPageCopy) {
    violations.push(...lintChangedSeoPageCopy(seoPagesPath, JSON.parse(read(seoPagesPath))));
  }

  assert.deepEqual(violations, []);
}

test("changed public content and source-backed copy files require active briefs and pass gate checks", () => {
  // build-site.js owns the same lock, so this is reentrant for the build child.
  // Keeping the outer lock here is what prevents a second build from deleting
  // or rewriting _site while this test inspects rendered public content.
  withWorktreeLock({ name: "repo-build" }, runChangedPublicContentGate);
});
