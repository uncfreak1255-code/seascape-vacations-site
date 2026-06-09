# Indexing + Indexability Forensic — 2026-06-06

Outside-strategist audit of the reported ranking drop and the "wait and reread"
loop. This report records the diagnosis, what was verified against build truth,
what shipped, and the decisions still owed to the operator.

## How truth was determined

Two AI reads (this audit and a Codex read) disagreed on one finding. The
dispute was settled by promoting it to the highest-authority artifact, not by
who argued more confidently. The authority ladder used here:

1. **Enforcement tests** (`scripts/enforcement/*.test.js`) — encode deliberate,
   locked decisions. Check these first.
2. **Rendered build output** (`npm run build`, then read `_site/`) — the actual
   truth of what ships.
3. **Live GSC / analytics** — what Google actually did.
4. **Reasoning / opinion** — lowest authority; must yield to 1–3.

Every confident claim in this engagement (this audit, the Codex read, and a
voice-system sub-audit) had at least one piece that failed verification. The
rule that held: no recommendation ships without a proof gate.

## Findings

### 1. The "indexing collapse" is mostly healthy pruning, not a penalty
Indexed pages fell 227 -> 162 (-29%) May 3 -> Jun 3. But over the same window
clicks rose 233 -> 300 (+29%) and CTR doubled (0.4% -> 0.8%). Pages that left
the index took zero clicks with them. **Do not force-reindex them.** Export the
dropped-URL list (GSC > Indexing > Pages) and rescue only pages with real
clicks, inbound links, or owner value.

### 2. The real ranking loss is one page, and it is competitive
`/guides/bradenton-vs-sarasota/` — the biggest click engine on the site — fell
#1 -> #5 as Zachos Realty and midflorida.com overtook it. This is a
freshness/competitive loss on the existing winner, not a deindexing event.
**Defend the existing page** (freshness + title/meta), do not build a second
comparison page.

### 3. Chronic debt: a dual guide-source system, but contained
Guide source is split across 37 loose `src/guides/*.html` files and 17
`src/guides/<slug>/index.html` folders. The build maps both to clean
trailing-slash URLs and `_site/guides/` emits no stray `.html`. Legacy `.html`,
slash, and root `/area-guide-*.html` variants are already 301'd in
`src/_redirects`. This is **unfinished canonical cleanup, not architectural
collapse** — Codex's framing is the fair one. Keep finishing it; do not panic.

### 4. Two commercial pages were noindexed — one correctly, one is a decision
- `/guides/vacation-rental-income-anna-maria/` renders `noindex`. **This is
  intentional and correct.** It is locked by `owner-proof-clean.test.js`: the
  guide carried unsupported revenue claims (third-party data citations, "gold
  mine" language) and was deliberately demoted, routing owner intent to
  `/research/owner-fee-revenue-leak-benchmark-2026/`. Do not "rescue" it.
- `/stays/summer-vacation-rentals-florida-gulf-coast/` renders `noindex` via
  `staysNoindexSlugs`, **yet the June rank-tracker names it the top July
  seasonal target.** A noindexed page cannot rank. This is an unresolved
  contradiction between two repo artifacts — see Decisions below.

### 5. Owner money pages are low-impression, not just low-CTR
The latest cluster read shows owner_money at ~75 combined impressions, 0 clicks.
The bottleneck is visibility/ranking, not only snippet framing. Holding
`owner-ctr-rewrite-round-2` until impressions clear the gate is defensible, not
paralysis.

## What shipped in this batch

- **`scripts/enforcement/sitemap-indexability-contract.test.js`** — a
  build-truth guard with two checks:
  1. every URL in the rendered `_site/sitemap.xml` must render without
     `noindex`;
  2. every URL in the sitemap must be self-canonical.
  This is the check that was missing when the AMI income guide shipped
  noindexed-but-in-sitemap and had to be cleaned up by hand in #247. It passes
  on the current build (locking the clean state) and was verified to bite on a
  real noindex page. It reuses the existing `rendered-route-contract` helpers.
- **`docs/status/open-risks.md`** — corrected the false "indexing alarm"
  framing and recorded the collision class and the summer-page decision.
- **This report.**

## What was deliberately NOT changed, and why

- The income guide noindex — correct and test-locked.
- `docs/status/next-batch.md` reread status — contract-locked and generated from
  the analytics receipt; not hand-edited here.
- The voice/content lint — a sub-audit proposed adding `fee stack`, `rate
  power`, `OTA drag`, `the home`, `leakage` as banned patterns. Verified against
  source: `fee stack` appears 10× in effective guest guide copy; the others are
  natural English or fine in context. Owner-jargon lint is context-scoped on
  purpose. A blunt global rule would break good copy. Not changed.

## Decisions owed to the operator

1. **Summer seasonal page:** build out and index
   `/stays/summer-vacation-rentals-florida-gulf-coast/` before July, or stop the
   rank-tracker/`content-priorities` from chasing a suppressed page.
2. **bradenton-vs-sarasota defense:** authorize a freshness + title/meta rescue
   on the existing page (runs through the brief + voice gate).
3. **Freshness gate scope:** confirm the gate blocks *new expansion and impact
   claims* only — not winner-page defense, canonical cleanup, or legacy residue.
   This batch proceeded on that basis.

## Voice/content system — verdict and roadmap

The editorial system is genuinely strong (banned-pattern lint, the no-brief-no-
writing contract, and the blocking owner-copy eval are better than most agencies
run). Real gaps remain, to be sequenced as their own verified batches — not
crammed in:

1. Title/meta length + SERP-snippet linting (audit current titles first; many
   will be out of range, so fix-then-enforce, not enforce-then-break).
2. Readability / grade-level floor on guest and owner copy.
3. Internal-link density + orphan detection generalized from the existing
   `indexation-link-graph` checks.
4. Claim-source verification (numeric claims must cite a named proof asset).
5. Visible author byline / E-E-A-T on priority guides (meta author exists; copy
   byline + credentials do not).
