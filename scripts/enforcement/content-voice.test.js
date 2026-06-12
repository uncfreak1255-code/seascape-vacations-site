const fs = require("fs");
const path = require("path");
const test = require("node:test");
const assert = require("node:assert/strict");
const { execSync } = require("node:child_process");

const projectRoot = path.resolve(__dirname, "..", "..");
const PLAYBOOK_PATH = "docs/style/codex-page-writing-playbook.md";

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

  return normalizeVisibleText(baseSource) !== normalizeVisibleText(source);
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
    .filter(Boolean);
}

function parseMissingBriefFields(briefContent) {
  return REQUIRED_BRIEF_FIELDS.filter((field) => {
    const expression = new RegExp(`^- ${field}:\\s+.+$`, "im");
    return !expression.test(briefContent);
  });
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

function getChangedFiles() {
  try {
    const mergeBase = execSync("git merge-base HEAD origin/main", {
      cwd: projectRoot,
      encoding: "utf8"
    }).trim();

    if (!mergeBase) {
      return [];
    }

    const output = execSync(`git diff --name-only --diff-filter=ACMR ${mergeBase}...HEAD`, {
      cwd: projectRoot,
      encoding: "utf8"
    }).trim();

    if (!output) {
      return [];
    }

    return output
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
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
  const firstParagraph = getFirstParagraphText(source);
  const currentRoute = getCurrentRoute(relativePath, source);

  violations.push(...lintInstructionTemplateSource(relativePath, source));

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
  assert.equal(gateDoc.includes(PLAYBOOK_PATH), true);
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

test("workflow docs and agent cards treat instruction-template public copy as a blocker", () => {
  const gateDoc = read(path.join("docs", "process", "content-quality-gate.md"));
  const reviewChecklist = read(path.join("docs", "process", "before-user-review-checklist.md"));
  const pageBuilder = read(path.join(".claude", "agents", "page-builder.md"));
  const voiceEditor = read(path.join(".claude", "agents", "voice-editor.md"));
  const releaseGate = read(path.join(".claude", "agents", "release-gate.md"));

  assert.equal(gateDoc.includes("Use this when"), true);
  assert.equal(gateDoc.includes(PLAYBOOK_PATH), true);
  assert.equal(reviewChecklist.includes("Use this when"), true);
  assert.equal(pageBuilder.includes("session prompts"), true);
  assert.equal(pageBuilder.includes(PLAYBOOK_PATH), true);
  assert.equal(voiceEditor.includes("Use this when"), true);
  assert.equal(voiceEditor.includes(PLAYBOOK_PATH), true);
  assert.equal(releaseGate.includes("npm run lint:content"), true);
  assert.equal(releaseGate.includes("Voice Editor pass"), true);
});

test("approved owner research sample passes the new public-copy guardrails", () => {
  const approvedSample = `
    <main>
      <section>
        <h1>Your management fee is only part of the picture.</h1>
        <p>Most owners compare 15%, 20%, and 25% management fees and stop there.</p>
        <p><a href="/property-management/vacation-rental-management-fees-florida/">Management fee</a> is only one part of what you actually keep.</p>
        <p>That is why <a href="/property-management/maximize-vacation-rental-income-florida/">booking channels</a> belong in the conversation.</p>
        <p><a href="/property-management/">Seascape property management</a> starts with a revenue teardown, not a generic service list.</p>
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
        <p>In a world where every guest expects perfection, you need to double down on seamless execution. Full stop.</p>
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

test("changed public content files require one active brief and pass brief-linked checks", () => {
  const changedFiles = getChangedFiles();
  const changedPublicContentFiles = changedFiles.filter(isPublicContentFile);

  if (changedPublicContentFiles.length === 0) {
    assert.ok(true, "no changed public content files on this branch");
    return;
  }

  const changedReaderCopyFiles = changedPublicContentFiles.filter((relativePath) =>
    hasVisibleReaderCopyDiff(relativePath, read(relativePath))
  );

  if (changedReaderCopyFiles.length === 0) {
    assert.ok(true, "changed public content files have no reader-visible copy diff");
    return;
  }

  const changedBriefFiles = changedFiles.filter((relativePath) => /^docs\/briefs\/.+\.md$/i.test(relativePath));
  assert.equal(
    changedBriefFiles.length,
    1,
    `public content PRs must change exactly one active brief, found ${changedBriefFiles.length}`
  );

  const briefContent = read(changedBriefFiles[0]);
  const missingBriefFields = parseMissingBriefFields(briefContent);
  assert.deepEqual(
    missingBriefFields,
    [],
    `active brief is missing required content-gate fields: ${missingBriefFields.join(", ")}`
  );

  const requiredLinks = parseRequiredLinksFromBrief(briefContent);
  const violations = [];

  for (const relativePath of changedReaderCopyFiles) {
    const source = read(relativePath);
    violations.push(
      ...lintPublicContent(relativePath, source, requiredLinks)
    );
  }

  assert.deepEqual(violations, []);
});
