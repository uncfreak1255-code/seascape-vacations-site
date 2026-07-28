"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const { buildSeoPageHistory } = require("../seo/seo-page-history.js");

// Git hooks export GIT_DIR / GIT_INDEX_FILE / GIT_WORK_TREE, which would make
// every git command inside a fixture temp repo operate on the OUTER repository
// ("fatal: this operation must be run in a work tree"). Strip inherited GIT_*
// so fixtures behave identically under `node --test` and under the pre-commit
// hook.
const CLEAN_ENV = Object.fromEntries(
  Object.entries(process.env).filter(([key]) => !key.startsWith("GIT_"))
);

// Fixture-repo tests. The rendered-sitemap checks in
// sitemap-lastmod-discrimination.test.js prove the wiring; these prove the
// resolver itself against CONTROLLED history, so correctness does not depend on
// production data happening to stay date-diverse. Review finding on #489: a
// production-data assertion can be satisfied by a broken resolver whenever the
// real dates line up, so the resolver needs fixtures it cannot luck through.

const SEO_REL = "src/_data/seoPages.json";

function git(cwd, ...args) {
  return execFileSync("git", args, {
    cwd,
    encoding: "utf8",
    env: {
      ...CLEAN_ENV,
      GIT_AUTHOR_NAME: "fixture",
      GIT_AUTHOR_EMAIL: "fixture@test",
      GIT_COMMITTER_NAME: "fixture",
      GIT_COMMITTER_EMAIL: "fixture@test",
    },
  }).trim();
}

function commitDoc(repo, doc, message, isoDate) {
  fs.mkdirSync(path.join(repo, path.dirname(SEO_REL)), { recursive: true });
  fs.writeFileSync(path.join(repo, SEO_REL), JSON.stringify(doc, null, 2));
  git(repo, "add", "-A");
  execFileSync("git", ["commit", "-q", "-m", message], {
    cwd: repo,
    encoding: "utf8",
    env: {
      ...CLEAN_ENV,
      GIT_AUTHOR_NAME: "fixture",
      GIT_AUTHOR_EMAIL: "fixture@test",
      GIT_COMMITTER_NAME: "fixture",
      GIT_COMMITTER_EMAIL: "fixture@test",
      GIT_AUTHOR_DATE: isoDate,
      GIT_COMMITTER_DATE: isoDate,
    },
  });
}

function makeRepo() {
  const repo = fs.mkdtempSync(path.join(os.tmpdir(), "seo-history-fixture-"));
  git(repo, "init", "-q", "-b", "main");
  return repo;
}

function doc(ownerEntries, vacationerEntries = []) {
  return { owner: ownerEntries, vacationer: vacationerEntries };
}

test("per-entry dates come from the commit that changed that entry", () => {
  const repo = makeRepo();
  try {
    commitDoc(
      repo,
      doc([{ slug: "alpha", title: "A1" }, { slug: "beta", title: "B1" }]),
      "initial",
      "2026-01-10T10:00:00Z"
    );
    commitDoc(
      repo,
      doc([{ slug: "alpha", title: "A2" }, { slug: "beta", title: "B1" }]),
      "edit alpha only",
      "2026-02-20T10:00:00Z"
    );

    const history = buildSeoPageHistory({ cwd: repo });
    assert.equal(history.get("owner/alpha").slice(0, 10), "2026-02-20");
    assert.equal(history.get("owner/beta").slice(0, 10), "2026-01-10");
  } finally {
    fs.rmSync(repo, { recursive: true, force: true });
  }
});

test("an entry present since the first commit dates from that first commit", () => {
  const repo = makeRepo();
  try {
    commitDoc(repo, doc([{ slug: "alpha", title: "A1" }]), "initial", "2026-01-10T10:00:00Z");
    commitDoc(
      repo,
      doc([{ slug: "alpha", title: "A1" }, { slug: "beta", title: "B1" }]),
      "add beta",
      "2026-03-05T10:00:00Z"
    );

    const history = buildSeoPageHistory({ cwd: repo });
    assert.equal(history.get("owner/alpha").slice(0, 10), "2026-01-10");
    assert.equal(history.get("owner/beta").slice(0, 10), "2026-03-05");
  } finally {
    fs.rmSync(repo, { recursive: true, force: true });
  }
});

test("sibling branch commits do not cross-contaminate dates (first-parent walk)", () => {
  // Review finding on #489: consecutive rows of a plain `git log -- <path>` are
  // not necessarily parent and child. Two sibling branches each edit a different
  // entry; a naive consecutive-row diff attributes one branch's change to the
  // other branch's timestamp. The first-parent walk must date both entries at
  // the merge (when they reached the deployed branch), never at the sibling.
  const repo = makeRepo();
  try {
    commitDoc(
      repo,
      doc([{ slug: "alpha", title: "A1" }, { slug: "beta", title: "B1" }]),
      "initial",
      "2026-01-10T10:00:00Z"
    );

    git(repo, "checkout", "-q", "-b", "side");
    commitDoc(
      repo,
      doc([{ slug: "alpha", title: "A-side" }, { slug: "beta", title: "B1" }]),
      "side edits alpha",
      "2026-02-01T10:00:00Z"
    );

    git(repo, "checkout", "-q", "main");
    commitDoc(
      repo,
      doc([{ slug: "alpha", title: "A1" }, { slug: "beta", title: "B-main" }]),
      "main edits beta",
      "2026-02-15T10:00:00Z"
    );

    execFileSync(
      "git",
      ["merge", "-q", "--no-ff", "side", "-m", "merge side"],
      {
        cwd: repo,
        encoding: "utf8",
        env: {
          ...CLEAN_ENV,
          GIT_AUTHOR_NAME: "fixture",
          GIT_AUTHOR_EMAIL: "fixture@test",
          GIT_COMMITTER_NAME: "fixture",
          GIT_COMMITTER_EMAIL: "fixture@test",
          GIT_AUTHOR_DATE: "2026-03-01T10:00:00Z",
          GIT_COMMITTER_DATE: "2026-03-01T10:00:00Z",
        },
      }
    );

    const history = buildSeoPageHistory({ cwd: repo });
    // alpha changed on the side branch; on the first-parent chain it lands at
    // the merge. It must NOT pick up the sibling mainline commit's 02-15 date.
    assert.equal(history.get("owner/alpha").slice(0, 10), "2026-03-01");
    // beta changed on the mainline and must keep its own commit date.
    assert.equal(history.get("owner/beta").slice(0, 10), "2026-02-15");
  } finally {
    fs.rmSync(repo, { recursive: true, force: true });
  }
});

test("a shallow clone degrades to an empty map instead of fabricating dates", () => {
  // Review finding on #489: with truncated history the walk sees one revision
  // and would stamp every entry with the tip date while looking healthy. The
  // resolver must refuse and let callers fall back to per-file dates.
  const repo = makeRepo();
  const cloneParent = fs.mkdtempSync(path.join(os.tmpdir(), "seo-history-shallow-"));
  try {
    commitDoc(repo, doc([{ slug: "alpha", title: "A1" }]), "initial", "2026-01-10T10:00:00Z");
    commitDoc(repo, doc([{ slug: "alpha", title: "A2" }]), "edit", "2026-02-20T10:00:00Z");

    const shallow = path.join(cloneParent, "shallow");
    execFileSync(
      "git",
      ["clone", "-q", "--depth", "1", `file://${repo}`, shallow],
      { encoding: "utf8", env: CLEAN_ENV }
    );

    const warnings = [];
    const history = buildSeoPageHistory({ cwd: shallow, warn: (m) => warnings.push(m) });
    assert.equal(history.size, 0, "shallow history must not produce fabricated dates");
    assert.equal(history.degraded, true);
    assert.equal(warnings.length, 1);
    assert.match(warnings[0], /shallow/i);
  } finally {
    fs.rmSync(repo, { recursive: true, force: true });
    fs.rmSync(cloneParent, { recursive: true, force: true });
  }
});

test("vacationer entries resolve under their own group key", () => {
  const repo = makeRepo();
  try {
    commitDoc(
      repo,
      doc([{ slug: "shared-slug", title: "owner v1" }], [{ slug: "shared-slug", title: "stay v1" }]),
      "initial",
      "2026-01-10T10:00:00Z"
    );
    commitDoc(
      repo,
      doc([{ slug: "shared-slug", title: "owner v1" }], [{ slug: "shared-slug", title: "stay v2" }]),
      "edit the stay entry only",
      "2026-04-01T10:00:00Z"
    );

    const history = buildSeoPageHistory({ cwd: repo });
    assert.equal(history.get("owner/shared-slug").slice(0, 10), "2026-01-10");
    assert.equal(history.get("vacationer/shared-slug").slice(0, 10), "2026-04-01");
  } finally {
    fs.rmSync(repo, { recursive: true, force: true });
  }
});
