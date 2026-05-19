const fs = require("fs");
const path = require("path");
const test = require("node:test");
const assert = require("node:assert/strict");
const { execSync } = require("node:child_process");

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
  /\battentive local operations\b/i,
  /\bclearer owner communication\b/i,
  /\bfewer quiet misses\b/i
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

const FIRST_PARAGRAPH_PROOF_PATTERNS = [/\bobserved\b/i, /\bscenario\b/i, /\bmethodology\b/i];

const PUBLIC_CONTENT_PATTERNS = [
  /^src\/guides\/.+\.(html|njk)$/i,
  /^src\/research\/.+\.njk$/i,
  /^src\/property-management\/.+\.njk$/i,
  /^src\/stays\/.+\.njk$/i,
  /^src\/index\.njk$/i
];

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

function lintPublicContent(relativePath, source, requiredLinks) {
  const violations = [];
  const visibleText = normalizeVisibleText(source);
  const firstParagraph = getFirstParagraphText(source);
  const currentRoute = getCurrentRoute(relativePath, source);

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

  return violations;
}

test("content quality gate doc defines reader, proof, and agent copy plus the no-brief rule", () => {
  const gateDoc = read(path.join("docs", "process", "content-quality-gate.md"));

  assert.equal(gateDoc.includes("reader copy"), true);
  assert.equal(gateDoc.includes("proof copy"), true);
  assert.equal(gateDoc.includes("agent copy"), true);
  assert.equal(gateDoc.includes("No Brief, No Writing"), true);
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

  assert.equal(agents.includes("docs/process/content-quality-gate.md"), true);
  assert.equal(agents.includes("npm run lint:content"), true);
  assert.equal(claude.includes("docs/process/content-quality-gate.md"), true);
  assert.equal(claude.includes("npm run lint:content"), true);
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

test("changed public content files require one active brief and pass brief-linked checks", () => {
  const changedFiles = getChangedFiles();
  const changedPublicContentFiles = changedFiles.filter(isPublicContentFile);

  if (changedPublicContentFiles.length === 0) {
    assert.ok(true, "no changed public content files on this branch");
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

  for (const relativePath of changedPublicContentFiles) {
    const source = read(relativePath);
    violations.push(...lintPublicContent(relativePath, source, requiredLinks));
  }

  assert.deepEqual(violations, []);
});
