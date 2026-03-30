<!-- /autoplan restore point: /Users/sawbeck/.gstack/projects/uncfreak1255-code-seascape-vacations-site/codex-seo-full-audit-2026-03-30-autoplan-restore-20260330-142910.md -->
# Seascape SEO Strategy + 90-Day Roadmap

Date: 2026-03-30
Source inputs: March 30 full SEO/GSC audit, March 2026 content-priority work, live GSC page/query data, current site architecture

## Strategic Call

Stop treating this like a page-production problem.

For the next 90 days, the SEO strategy should be:
1. consolidate authority across every discoverability surface
2. improve click yield on owner pages already ranking
3. strengthen owner and stay money-page systems
4. tighten the homepage brand/performance layer
5. only then expand page volume

If you reverse that order, you will keep manufacturing more low-leverage surface area.

## Execution Model

This is not a "publish six pages" roadmap.

This is a shared-system roadmap across:
- discoverability surfaces: `src/_redirects`, `src/sitemap.njk`, `src/llms.txt`, live internal links
- commercial templates: `src/stays/stays.njk`, `src/property-management/property-management.njk`
- shared page data: `src/_data/seoPages.json`
- enforcement: `scripts/enforcement/*.test.js`, `scripts/recovery/assert-build-output.js`, `scripts/enforcement/verify-release.js`
- homepage runtime: `src/index.njk`

If those systems do not change together, the same SEO regressions will keep coming back in slightly different clothes.

## What The Site Should Optimize For

### Primary business goals

1. More owner-acquisition clicks from pages already ranking
2. More direct-booking visibility on the stay pages with real inventory fit
3. More authority compounding from the comparison-guide cluster

### Baseline

| Metric | Current baseline |
|---|---:|
| GSC clicks / 28 days | `376` |
| GSC impressions / 28 days | `66,154` |
| GSC CTR | `0.57%` |
| GSC average position | `7.9` |
| Legacy `.html` pages still drawing traffic | `44` clicks / `7,749` impressions |
| `bradenton-vs-sarasota` cluster split | `80` clicks / `27,675` impressions across 3 URLs |
| Owner fee page | `2` clicks / `1,558` impressions / `0.13%` CTR |
| AMI beachfront stay page | `2` clicks / `1,889` impressions / `0.11%` CTR |

## Competitive Read

### Where Seascape is already strong

- Comparison and "which is better" SERPs are a real wedge.
- Those SERPs are not owned exclusively by giant OTAs.
- Seascape’s local-expertise format can win there because the site already publishes stronger direct answers than most generic travel fluff.

### Where Seascape is still weak

- Beachfront and broader stay-category SERPs are more inventory-heavy and more operator-driven.
- Owner-management and fee SERPs lean on proof, benchmarks, and trust signals. Generic local-service copy is not enough.

### Practical competitor takeaway

- Use the comparison cluster as the traffic and authority engine.
- Use owner proof pages as the owner-acquisition conversion layer.
- Use a smaller number of stronger stay landers instead of many thin ones.

## Site-Structure Strategy

### Guest side

1. Comparison guides
2. Area / destination guides
3. Stay category pages
4. Individual property pages

Flow:
- comparison guide -> destination guide -> stay category -> property page -> booking path

### Owner side

1. `/property-management/` hub
2. service/location pages
3. economics / fee / licensing / VRBO service pages
4. proof assets and benchmark pages

Flow:
- guide or market-report page -> owner proof page -> service/location page -> contact / owner CTA

### Internal-link rule

Every winning guide should feed a money page.

That means:
- comparison guides should link to the most relevant stay page and the most relevant destination guide
- owner/economics guides should link to the most relevant property-management service page
- market-report and operator-education pages should strengthen the owner cluster, not float alone

## Content Priorities

### Tier 1: Fix pages already earning impressions

1. `/property-management/vacation-rental-management-fees-florida/`
2. `/property-management/vacation-rental-management-licensing-florida/`
3. `/property-management/vrbo-management-services-florida/`
4. `/stays/anna-maria-island-vacation-rentals/`
5. `/stays/anna-maria-island-beachfront-rentals/`
6. `/guides/bradenton-vs-sarasota/`

### Tier 2: Consolidate or refresh high-leverage legacy pages

1. `is-anna-maria-island-worth-visiting`
2. `best-time-visit-anna-maria-island`
3. `srq-airport-to-anna-maria-island`
4. `florida-gulf-coast-vacation-rental-market-report-2026`

These pages still attract search demand on old `.html` versions. That is not a content gap. That is unfinished consolidation work.

## Execution Constraints

1. `src/_data/seoPages.json` is the main collision point. Owner and stay rewrites should not pretend to be safely parallel unless that file is split first.
2. Canonical cleanup is not done when redirects are updated. It is done when redirects, sitemap, `llms.txt`, and live source links all agree.
3. Do not burn Netlify previews on wording-only fragments. Batch meaningful SEO work into fewer deploys.
4. No high-intent page rewrite ships without matching enforcement updates.
5. The owner cluster needs one reusable proof asset. If proof stays ad hoc, CTR work will drift back into generic brochure copy.

## 90-Day Roadmap

### Phase 1: Consolidation + Guardrails (Weeks 1-2)

1. Audit canonical winners across redirects, sitemap, `llms.txt`, nav/footer links, and priority guide source links
2. Kill legacy URL discoverability beyond the redirects
3. Fix the broken `anna-maria-city` metadata and add a metadata-integrity test
4. Wire the new metadata check into `npm run verify:release`
5. Rewrite titles and descriptions for the owner fee, licensing, and VRBO pages already ranking on page one

### Phase 2: Owner Proof + CTR (Weeks 3-5)

1. Publish one benchmark/proof asset the owner cluster can cite
2. Rebuild `/property-management/vacation-rental-management-fees-florida/` around cited proof and clearer click motive
3. Rebuild `/property-management/vacation-rental-management-licensing-florida/` and `/property-management/vrbo-management-services-florida/` with the same proof system
4. Add reviewer/date/source treatment where it materially strengthens owner-intent trust
5. Improve guide-to-owner-page internal linking from the market-report and operator-education pages

### Phase 3: Stay Money-Page Rebuild (Weeks 6-8)

1. Expand `/stays/anna-maria-island-vacation-rentals/` into a real category lander
2. Expand `/stays/anna-maria-island-beachfront-rentals/` as an honest near-AMI value page, not faux beachfront positioning
3. Add required-module enforcement for the two priority stay pages
4. Improve guide-to-stay internal linking from the comparison pages already winning impressions

### Phase 4: Homepage Performance + Authority Pass (Weeks 9-10)

1. Tighten homepage LCP and preserve deferred third-party loading
2. Standardize image sizing and lazy-loading behavior on critical templates
3. Roll out reviewer/date/Person treatment where it improves top guides and owner pages
4. Add homepage perf-sensitive smoke coverage to the enforcement layer

### Phase 5: Controlled Expansion Gate (Weeks 11-13)

Only after the first four phases:
1. Decide which new page opportunities still deserve build time
2. Expand the comparison cluster only where the site already has proof of traction and the new page clearly feeds a money page
3. Defer expansion if legacy attribution, owner CTR, or homepage LCP still lag

## Required Tests And Guardrails

1. Add `scripts/enforcement/metadata-integrity.test.js`
   - Assert valid title, description, canonical, and OG head tags on priority guides and money pages
   - Fail on broken quotes, empty content, and malformed attributes
2. Extend `scripts/enforcement/owner-acquisition.test.js`
   - Assert the fee, licensing, and VRBO pages keep proof-backed snippet framing and the revenue-review CTA
3. Add `scripts/enforcement/stay-money-pages.test.js`
   - Assert the two priority AMI pages keep required sections, canonical/schema truth, and value-tradeoff positioning
4. Extend guide-routing coverage
   - Assert top comparison and operator pages link to the intended owner/stay money pages using canonical URLs
5. Add a homepage performance smoke test
   - Assert critical hero preload behavior, deferred analytics loading, and critical image dimension truth
6. Update `npm run verify:release`
   - New guardrails should block deploys, not live as optional tests

## KPI Targets

| Metric | Current | 90-day target | 180-day target |
|---|---:|---:|---:|
| Overall GSC CTR | `0.57%` | `0.80%+` | `1.00%+` |
| Legacy `.html` impressions | `7,749` | cut by `50%+` | near-zero on priority pages |
| Owner fee page CTR | `0.13%` | `0.50%+` | `1.00%+` |
| AMI beachfront page average position | `39.8` | under `25` | under `15` |
| Homepage mobile LCP | `7.2s` | under `3.5s` | under `2.5s` |

## Weekly Content Calendar

### Week 1

- Canonical winner audit across redirects, sitemap, `llms.txt`, and source links
- `anna-maria-city` metadata fix
- metadata-integrity test scaffold

### Week 2

- Release-gate wiring for metadata integrity
- owner snippet rewrite pass for fee/licensing/VRBO pages
- reindex queue for cleaned canonical URLs

### Week 3

- Publish the shared owner proof/benchmark asset
- Rebuild the fee page around cited proof

### Week 4

- Rebuild licensing + VRBO pages with the same proof system
- Add guide-to-owner-page internal links from the highest-leverage operator content

### Week 5

- Verify owner CTR/query movement in GSC after the owner-cluster deploy
- Extend owner acquisition tests for snippet/proof assertions

### Week 6

- Rebuild `/stays/anna-maria-island-vacation-rentals/`

### Week 7

- Rebuild `/stays/anna-maria-island-beachfront-rentals/`
- Add stay-money-page enforcement coverage

### Week 8

- Improve guide-to-stay routing from the highest-value comparison pages
- Re-check stay-page query movement and indexation status

### Week 9

- Homepage performance pass
- homepage-performance smoke test

### Week 10

- reviewer/date/Person treatment on the strongest guides and owner pages
- critical template image-delivery cleanup

### Weeks 11-13

- Expansion only if the consolidation, owner CTR, and stay money-page metrics actually move

## What To Stop Doing

- Stop defaulting to new-page volume as the answer.
- Stop broad metadata polishing on pages with no impressions.
- Stop treating all stay pages as equally important.
- Stop assuming a page is "fine" because it is indexed.
- Stop splitting owner and stay work into fake-independent tasks when both depend on `src/_data/seoPages.json`.
- Stop shipping high-intent SEO changes without matching enforcement updates.

## Decision Rule For New SEO Work

Before creating or heavily expanding a page, ask:

1. Is there already a version of this page or topic getting impressions?
2. Is the current problem identity, click yield, or topical depth?
3. Does fixing that page strengthen a money page or just add another URL?
4. Can the current enforcement layer catch the most likely regression?

If the answer to the third question is "it mostly adds another URL," do not build it yet.

If the answer to the fourth question is "no," add the guardrail before shipping the page change.

## AUTOPLAN INTAKE

- Base branch detected: `main`
- Restore point: `/Users/sawbeck/.gstack/projects/uncfreak1255-code-seascape-vacations-site/codex-seo-full-audit-2026-03-30-autoplan-restore-20260330-142910.md`
- UI scope: `no`
- Why UI scope is `no`: the roadmap mentions pages and forms, but the actual work is content, template, redirect, metadata, schema, and performance work. There is no net-new component system, state model, or interaction design plan to review.
- Outside voices: attempted a Codex CEO challenge, but it did not return a clean final critique inside the time budget. Claude subagent review was not run because this session did not include explicit user approval for delegated subagents. This review therefore proceeds in single-reviewer mode and marks outside voices as unavailable instead of pretending consensus exists.
- Context actually read for this review: `CLAUDE.md`, `git log --oneline -30`, `git diff --stat main...HEAD`, this roadmap, the March 30 audit docs, `src/index.njk`, `src/stays/stays.njk`, `src/property-management/property-management.njk`, `src/_data/seoPages.json`, `src/_data/site.json`, `src/_data/seoGovernance.js`, `src/_data/staysPages.js`, `scripts/enforcement/seo-structure.test.js`, `scripts/enforcement/owner-acquisition.test.js`, `scripts/enforcement/guide-conversion.test.js`, `scripts/enforcement/verify-release.js`, and `scripts/recovery/assert-build-output.js`.

## Decision Audit Trail

| # | Phase | Decision | Principle | Rationale | Rejected |
|---|-------|----------|-----------|-----------|----------|
| 1 | CEO | Lock the review to `SELECTIVE_EXPANSION` | P1, P2 | The strategic direction is right, but the roadmap is missing guardrails and sequencing. It needs selective additions, not a restart. | `HOLD_SCOPE`, which would preserve under-specified execution risk |
| 2 | CEO | Treat this as an authority-consolidation and click-yield program, not a page-volume program | P1 | GSC already shows ranking pages with poor click capture and legacy URLs still earning impressions. More pages first would compound leakage. | Net-new page expansion before cleanup |
| 3 | CEO | Add a metadata QA gate and release-gate coverage | P2, P5 | `src/guides/anna-maria-city.html` already proves a single broken meta tag can ship. Manual cleanup is not enough. | One-off copy sweeps with no enforcement |
| 4 | CEO | Add one reusable owner proof asset to feed the fee, licensing, and VRBO pages | P1, P2 | The owner pages already rank. What they lack is proof density and snippet motive, not indexability. | Three isolated copy rewrites with no shared proof source |
| 5 | CEO | Defer broad off-site entity and digital PR work from the first 90 days | P3, P4 | On-site leaks are still obvious in canonicals, metadata QA, and money-page depth. Off-site work now would dilute the direct bottleneck. | Full entity campaign in the same quarter |
| 6 | Design | Skip design review | P5 | The roadmap has no meaningful UI-state or interaction-design surface. Forcing a design pass here would be fake completeness. | Running `/plan-design-review` off false positives like `form` and `view` |
| 7 | Eng | Treat `src/_data/seoPages.json` as the main sequencing bottleneck | P5, P3 | Owner and stay money-page work both land in the same monolithic data source. Parallel editing there is merge-conflict bait. | Pretending owner and stay rewrites are independent streams |
| 8 | Eng | Require new enforcement for metadata integrity, owner/stay money-page requirements, and homepage performance-sensitive markup | P1, P2 | Existing tests are good, but they do not catch malformed meta attributes, weak money-page module regressions, or homepage runtime drift. | Relying on `npm test` as-is |
| 9 | Eng | Keep deferred items inline in this plan instead of creating a new `TODOS.md` | P3, P5 | This repo does not have `TODOS.md` and already uses `docs/status/`. Inventing a second tracker would create drift. | Creating a brand-new repo-level TODO file just to satisfy the review ritual |
| 10 | Eng | Continue in single-reviewer mode instead of aborting on unavailable outside voices | P6 | The user asked for `/autoplan`. Tooling limitations are not a reason to leave the plan unreviewed. | Aborting the pipeline |

## CEO Review

### 0A. Premise Challenge

| Premise | Verdict | Evidence | What changes |
|---|---|---|---|
| The site does not need more indexed pages first | Accept | The audit found `44` clicks and `7,749` impressions still landing on legacy `.html` URLs, plus page-one owner URLs with near-zero CTR. | Keep consolidation first. |
| The comparison-guide cluster should be the authority engine | Accept with condition | `bradenton-vs-sarasota` is already the strongest nonbrand asset, but guide monetization still depends on harder linking into stay and owner pages. Existing guide conversion tests focus on stay links, not owner-cluster reinforcement. | Treat guide traffic as a feeder system, not a win by itself. |
| Rebuilding the stay money pages can materially help direct-booking SEO | Accept with constraint | The current stay templates are indexed and already have image/schema plumbing, but `anna-maria-island-beachfront-rentals` is still a thin, weakly differentiated page for a brutal SERP. | Rebuild them as value-explicit near-AMI category landers, not faux beachfront clones. |
| Owner pages are mainly a copy problem | Partial | The fee, licensing, and VRBO pages rank already. The missing layer is proof, sourcing, and snippet motive, not just word count. | Build one shared proof asset and cite it across the cluster. |
| The four phases can run like mostly separate page batches | Reject | Canonical cleanup, metadata QA, internal linking, shared templates, and `src/_data/seoPages.json` all cut across those phases. | Reframe execution as shared-system workstreams with staged priorities. |

### Premise Gate

This session mode does not support inline plan-mode prompts, so the pipeline continued under one assumption: the audit premises above are directionally right. If you reject that assumption, do not approve as-is at the final gate. Override the premise first.

### 0B. Existing Code Leverage

| Sub-problem | Existing code already in place | What that means |
|---|---|---|
| Canonical convergence and discovery cleanup | `src/_redirects`, `src/sitemap.njk`, `scripts/enforcement/seo-structure.test.js`, `scripts/enforcement/validate-redirect-targets.js`, `scripts/enforcement/validate-internal-links.js` | This is not a spreadsheet exercise. It belongs in source and enforcement. |
| Stay money pages | `src/stays/stays.njk`, `src/_data/seoPages.json`, `src/_data/staysPages.js`, `scripts/recovery/assert-build-output.js` | No new route system is needed. The work is deeper data plus selective template strengthening. |
| Owner proof pages | `src/property-management/property-management.njk`, `src/property-management/index.njk`, `scripts/enforcement/owner-acquisition.test.js` | The proof-first owner pattern already exists. The roadmap should exploit it harder. |
| Guide monetization | `src/_includes/partials/guide-conversion-kit.njk`, `scripts/enforcement/guide-conversion.test.js` | The guide-to-stay bridge exists. The missing layer is stronger guide-to-owner reinforcement and better destination-to-money-page routing. |
| GEO/entity hygiene | `src/_includes/partials/organization-schema.njk`, `src/_data/site.json`, guide/article schema blocks in templates | The site has schema coverage, but thin `sameAs` and org-only authorship keep the credibility layer soft. |
| Homepage performance | `src/index.njk`, shared site header partials, static assets, live Lighthouse process | This is a source-level optimization pass, not a platform migration. |

### 0C. Dream State Mapping

```text
CURRENT
  Split URL identity
  + thin stay money pages
  + ranking owner pages with weak click motive
  + comparison traffic only partially monetized
  + homepage LCP dragging the brand layer

THIS PLAN, AS ORIGINALLY WRITTEN
  Better priorities than "make more pages"
  but still framed like page scheduling
  and under-specifies guardrails, shared proof, and sequencing

12-MONTH IDEAL
  One canonical story per topic
  -> comparison guides compound authority
  -> destination/stay pages convert direct-booking demand
  -> owner proof pages win owner-intent SERPs
  -> reusable proof asset feeds the whole owner cluster
  -> tests stop metadata/canonical regressions before deploy
  -> homepage stops acting like the slowest brand touchpoint
```

### 0C-bis. Implementation Alternatives

| Approach | What it does | Effort | Risk | Why it wins or loses |
|---|---|---:|---:|---|
| A. Keep the roadmap exactly as written | Run the four phases in sequence with page-level tasks | Medium | High | Loses. The priorities are good, but the execution model hides shared-template and QA risk. |
| B. Go back to page expansion | Build more guides and stay pages now, hope authority compounds later | High | Very high | Loses badly. This is how you create more URLs that inherit the same current leakage. |
| C. Consolidation + proof + guardrails first, then controlled expansion | Keep the roadmap's core order, but add enforcement, shared proof, and explicit sequencing | Medium | Medium | Wins. It fixes the actual bottlenecks without pretending the site needs a rewrite. |

### 0D. Mode-Specific Analysis

`SELECTIVE_EXPANSION` is the right mode because the roadmap is directionally correct and structurally incomplete.

Add to scope now:
- Metadata integrity enforcement for high-intent pages and high-traffic guides
- One reusable owner proof asset with cited benchmarks and snippet-ready facts
- Explicit sequencing around `src/_data/seoPages.json`, shared templates, and deploy batching
- A real engineering test plan for the canonical, owner, stay, and homepage workstreams

Do not add now:
- Broad new page programs
- Large off-site entity/distribution campaigns
- A data-model refactor just to make `seoPages.json` prettier
- A sitewide redesign

### 0E. Temporal Interrogation

| Time horizon | What looks true | What actually happens |
|---|---|---|
| Hour 1 | "This is mostly copy and metadata." | False comfort. The first real step is mapping every discoverability surface and shared file touched by the cleanup. |
| Hour 6 | Canonicals and titles are updated | If tests are not extended at the same time, the next content sweep can re-break them. |
| Week 2 | Owner pages look better | If the proof source is still ad hoc, the cluster drifts back into generic brochure copy. |
| Month 2 | Stay pages are longer | Length alone does not win. The copy has to explain why off-island or near-island inventory is still the better booking decision for this audience. |
| Month 6 | More pages are live | That will look foolish if legacy attribution, owner CTR, and homepage LCP still have not moved. |

### 0F. Mode Selection

Mode confirmed: `SELECTIVE_EXPANSION`

Why not `HOLD_SCOPE`:
- Because the roadmap currently under-specifies the QA and proof layer enough to make implementation fragile.

Why not `SCOPE_EXPANSION`:
- Because the site has not yet earned more surface area. It has to stop leaking authority first.

### CEO Dual Voices

- Codex: attempted, no usable final verdict returned inside the time budget
- Claude subagent: not run in this session

CEO DUAL VOICES — CONSENSUS TABLE:
═══════════════════════════════════════════════════════════════
  Dimension                           Claude  Codex  Consensus
  ──────────────────────────────────── ─────── ─────── ─────────
  1. Premises valid?                  N/A     N/A     single-reviewer
  2. Right problem to solve?          N/A     N/A     single-reviewer
  3. Scope calibration correct?       N/A     N/A     single-reviewer
  4. Alternatives explored enough?    N/A     N/A     single-reviewer
  5. Competitive risks covered?       N/A     N/A     single-reviewer
  6. 6-month trajectory sound?        N/A     N/A     single-reviewer
═══════════════════════════════════════════════════════════════

### Section 1: Architecture Review

The roadmap hides the real architecture. The work is not "rewrite six pages." The work is:
- discovery surfaces, which live in `src/_redirects`, `src/sitemap.njk`, `src/llms.txt`, and guide bodies
- two shared commercial templates, `src/stays/stays.njk` and `src/property-management/property-management.njk`
- one shared content store, `src/_data/seoPages.json`
- one homepage runtime layer, `src/index.njk`
- the enforcement layer under `scripts/enforcement/` and `scripts/recovery/`

That matters because a bad plan here produces copy drafts that ship without guardrails, while the same regressions keep reappearing.

### Section 2: Error & Rescue Map

| Failure | Likely trigger | Rescue |
|---|---|---|
| Legacy URLs keep drawing impressions after cleanup | Redirects fixed, but sitemap or live internal links still leak old paths | Grep all discoverability surfaces, rebuild, then request indexing only after one clean deploy |
| Owner pages still rank but do not get clicks | Titles/meta rewritten without adding proof or stronger commercial motive | Add the shared owner proof asset first, then rewrite snippet copy around that proof |
| Stay pages get longer but not stronger | More paragraphs, same weak positioning | Force each rebuilt stay page to answer inventory fit, distance tradeoff, and value-vs-on-island comparison |
| Metadata errors reappear | Manual edits to raw guide HTML with no structural validation | Add metadata-integrity tests to enforcement, not just visual checks |
| Homepage perf pass quietly breaks tracking or booking handoff | Scripts moved or assets changed with no smoke verification | Keep live smoke plus explicit QA routes in the eng test plan |

### Section 3: Security & Threat Model

I checked the roadmap against the actual public surface. There is no major auth or privilege-boundary change in this plan, so there is no new classic security blocker here.

The real trust risk is factual integrity. If owner proof stats or benchmark claims are added without source discipline, the site becomes legally and commercially sloppy. The fix is not a security library. It is sourced proof blocks and enforcement around where those facts are used.

### Section 4: Data Flow & Interaction Edge Cases

The most dangerous hidden dependency is `src/_data/seoPages.json`. It feeds both stay and owner clusters. That means:
- one malformed field can break many pages
- one merge conflict can silently drop unrelated array entries
- one "simple" copy pass can change schema, titles, CTAs, FAQs, and GEO intros across multiple page families

There is also a route edge case in `src/_data/staysPages.js`, which filters out rehomed pages with `!page.rehomeTo`. Any future cleanup that adds or removes `rehomeTo` changes route generation, not just content.

### Section 5: Code Quality Review

The weak spot is not the templates. It is the fragile source mix.

`src/guides/anna-maria-city.html` ships as a single-line raw HTML file with a broken description attribute right in the head. That is the exact kind of file that makes "quick SEO edits" regress later.

Do not solve that by refactoring the whole guide system now. Solve it by putting integrity tests around the fragile surfaces you actually edit in this batch.

### Section 6: Test Review

The repo already has more SEO enforcement than most small sites:
- `scripts/enforcement/seo-structure.test.js` guards canonical, redirect, sitemap, and stale-path behavior
- `scripts/enforcement/owner-acquisition.test.js` protects owner-page proof and CTA structure
- `scripts/enforcement/guide-conversion.test.js` protects guide conversion plumbing
- `scripts/recovery/assert-build-output.js` checks rendered output and some markup truths

What the roadmap still misses:
- no test that fails on malformed meta attributes like the broken `anna-maria-city` description
- no explicit money-page requirements test for the rebuilt stay pages
- no owner-cluster test for snippet/proof-source discipline
- no homepage guardrail for perf-sensitive asset and third-party changes beyond broad output assertions

### Section 7: Performance Review

The homepage performance pass is too isolated in the original roadmap. It belongs later than canonical cleanup, yes, but not as an afterthought. The homepage is still the slowest important page on the site, and it sets brand trust for both guest and owner traffic.

The inner templates already do several right things, including responsive Hostaway image preloads and non-blocking font patterns. The homepage needs the same discipline applied to its hero/media/runtime path.

### Section 8: Observability & Debuggability Review

The good news: measurement plumbing exists. This machine has GSC MCP access, there is a BigQuery export, and the repo already has live smoke patterns.

The roadmap still needs one operating rule: each phase should name the exact GSC/inspection checks that confirm the phase worked. Otherwise the plan turns into "ship changes, hope queries move."

### Section 9: Deployment & Rollout Review

This repo already has a release gate, guarded worktree rules, and a user preference to avoid burning unnecessary Netlify previews. The roadmap should respect that.

That means batching related SEO changes into fewer meaningful deploys:
- one consolidation deploy
- one owner/stay money-page deploy, if the shared data work can stay coherent
- one homepage performance deploy

Do not fragment this into a string of preview-burning micro PRs.

### Section 10: Long-Term Trajectory Review

If this plan succeeds, the next quarter is not "build lots more pages." The next quarter is:
- scale the proven comparison formats
- extend the owner proof system
- keep compounding guide-to-money-page routing

If this plan fails, the most likely reason is that the site keeps editing raw HTML pages and giant JSON payloads by hand without enough QA. That is the long-term technical debt signal to watch.

### Section 11: Design & UX Review

Skipped. I checked for real UI scope and did not find it. The roadmap is about SEO execution, not new interface design.

### Accepted Scope (added to this plan)

1. Add a metadata-integrity test and wire it into the release gate.
2. Treat the owner proof asset as a first-class deliverable, not a "maybe if time allows."
3. Make the execution plan explicit about shared-file sequencing, especially `src/_data/seoPages.json`.
4. Move from "rewrite these pages" language to "change these systems and prove them with tests" language.

### Deferred Inline Instead Of `TODOS.md`

`TODOS.md` does not exist in this repo. Deferred work is recorded here to avoid inventing a second tracker.

Deferred:
- Broad off-site entity expansion
- New comparison-cluster volume beyond the already-proven wedge
- Data-model refactor of `seoPages.json`
- Any design-system or sitewide UI refresh

### NOT in Scope

- Replatforming the site
- Rewriting all guide sources into a new authoring format
- Expanding into a large new pSEO program
- Solving every EEAT/entity issue in one quarter

### What Already Exists

The reusable pieces are already there:
- owner proof-first template and CTA plumbing
- stay template with image/schema scaffolding
- guide conversion kit
- redirect/sitemap/link validation
- release verification entrypoint

The plan should stand on top of those, not route around them.

### Dream State Delta

If the revised roadmap lands cleanly, the site gets:
- one cleaner URL identity layer
- stronger snippet and proof capture on owner pages already ranking
- stronger direct-booking money pages without pretending Seascape has beachfront inventory it does not own
- a release process that catches broken metadata before live deploy

What it still does not solve:
- broader entity/distribution presence
- a less fragile authoring system for raw guide HTML
- long-term scale for many more commercial landing pages

### Failure Modes Registry

| Severity | Failure mode | Why it happens | What prevents it |
|---|---|---|---|
| High | Canonical cleanup is partial and Google keeps splitting attribution | Internal discoverability surfaces are not cleaned together | One canonical sweep plus validation plus reindex list |
| High | Stay page rewrite becomes fake beachfront positioning | The team chases query wording instead of actual product fit | Force near-AMI value positioning in copy and FAQ structure |
| High | Owner proof copy becomes generic again | No shared proof source exists | Shared owner benchmark/proof asset |
| Medium | Roadmap burns preview deploys on copy-only fragments | Tasks are split too finely | Batch by workstream, not by sentence-level change |
| Medium | Metadata regressions keep shipping | Raw guide HTML is fragile | Add enforcement around meta integrity |
| Medium | Team assumes ranking equals success | No phase-level KPI checks are named | Tie each phase to specific GSC and inspection reads |

### Completion Summary

| Area | Verdict | What has to change before implementation |
|---|---|---|
| Strategic direction | Pass | Keep consolidation first |
| Scope calibration | Pass with changes | Add QA, proof asset, and sequencing rules |
| Competitive realism | Pass with warning | Stay pages must sell the value tradeoff, not cosplay as beachfront supply |
| Money-page leverage | Pass | Owner and stay work should be treated as the commercial core |
| Execution clarity | Needs revision | Convert the page-schedule framing into shared-system workstreams |
| Long-term trajectory | Pass with warning | Expansion only after attribution and click yield actually move |

## Design Review

Skipped, no meaningful UI scope detected.

## Eng Review

### Step 0: Scope Challenge

This roadmap is not six page edits. It is one shared-system change set with four execution lanes:

| Lane | Primary files | Real complexity |
|---|---|---|
| Consolidation + discoverability | `src/_redirects`, `src/sitemap.njk`, `src/llms.txt`, priority guide source files, `scripts/enforcement/seo-structure.test.js` | Medium. Easy to describe, easy to half-finish. |
| Owner money pages | `src/property-management/property-management.njk`, `src/property-management/index.njk`, `src/_data/seoPages.json`, `scripts/enforcement/owner-acquisition.test.js` | Medium-high because of shared data and proof dependencies. |
| Stay money pages | `src/stays/stays.njk`, `src/_data/seoPages.json`, `src/_data/staysPages.js`, `scripts/recovery/assert-build-output.js` | Medium-high because of shared template/data blast radius. |
| Homepage performance | `src/index.njk`, homepage assets, shared header styles/partials, live smoke process | Medium. Lower coupling than the page-data work, but higher verification burden. |

The hidden complexity is that the owner lane and stay lane both touch the same `src/_data/seoPages.json` file. That is why the original roadmap's clean weekly buckets are misleading.

### Eng Dual Voices

- Codex: no usable final output returned in time
- Claude subagent: not run in this session

ENG DUAL VOICES — CONSENSUS TABLE:
═══════════════════════════════════════════════════════════════
  Dimension                           Claude  Codex  Consensus
  ──────────────────────────────────── ─────── ─────── ─────────
  1. Architecture sound?              N/A     N/A     single-reviewer
  2. Test coverage sufficient?        N/A     N/A     single-reviewer
  3. Performance risks addressed?     N/A     N/A     single-reviewer
  4. Security threats covered?        N/A     N/A     single-reviewer
  5. Error paths handled?             N/A     N/A     single-reviewer
  6. Deployment risk manageable?      N/A     N/A     single-reviewer
═══════════════════════════════════════════════════════════════

### 1. Architecture Review

```text
SEO / GSC PRIORITIES
        |
        v
  Roadmap execution
        |
        +-------------------------+
        |                         |
        v                         v
Discovery layer              Commercial page layer
`_redirects`                 `seoPages.json`
`sitemap.njk`                /            \
`llms.txt`                  /              \
guide source links         v                v
        |            `property-management`  `stays`
        |            template + hub         template + staysPages.js
        |                   \               /
        +--------------------\-------------/
                              v
                        Enforcement layer
          `seo-structure.test.js`, `owner-acquisition.test.js`,
          `guide-conversion.test.js`, `assert-build-output.js`,
          `verify-release.js`
                              |
                              v
                        Deploy + GSC recrawl
```

Architecture verdict:
- Reuse the current templates. Do not invent new page systems.
- Strengthen enforcement at the source and rendered-output layers.
- Serialize or carefully partition `seoPages.json` work. That file is the collision zone.

### 2. Code Quality Review

Specific risks in the current codebase:
- `src/guides/anna-maria-city.html` proves raw single-line guide HTML is easy to break in ways that basic tests miss.
- `src/stays/stays.njk` and `src/property-management/property-management.njk` already carry large inline schema and inline styling blocks. The plan should avoid page-specific exceptions that make those templates fork mentally.
- `scripts/enforcement/verify-release.js` runs good structural checks, but it does not yet know what "SEO snippet integrity" means.

Engineering recommendation:
- Do not refactor architecture in this batch.
- Do add narrow, explicit tests that lock the changed behavior.

### 3. Test Review

Test framework detected:
- Repo tests run through `node --test scripts/enforcement/*.test.js`
- Build/output verification runs through `scripts/recovery/assert-build-output.js`
- There is no dedicated browser E2E harness in this repo today

#### Test Diagram

| Flow / codepath | Files touched | Existing coverage | Gap | Required test |
|---|---|---|---|---|
| Legacy alias -> canonical winner -> no stale internal source links | `src/_redirects`, `src/sitemap.njk`, guide sources, `src/llms.txt` | Strong redirect/sitemap coverage in `seo-structure.test.js`, link validation in `verify:links` | Priority-page source surfaces can still leak old URLs or near-duplicates | Extend `scripts/enforcement/seo-structure.test.js` with a priority canonical winner list and a source-surface assertion set for the known legacy families |
| High-intent guide metadata integrity | raw guide `.html` files including `src/guides/anna-maria-city.html` | Partial title/description checks for selected guides | No test fails on malformed meta quote/attribute breakage | Add `scripts/enforcement/metadata-integrity.test.js` that parses priority page heads and fails on broken description/title/canonical/og attributes |
| Owner page snippet/proof layer | `src/_data/seoPages.json`, `src/property-management/property-management.njk`, `src/property-management/index.njk` | Strong CTA/proof-shape tests in `owner-acquisition.test.js` | No requirement that high-intent owner pages keep proof source hooks and snippet-worthy meta copy | Extend `scripts/enforcement/owner-acquisition.test.js` with title/meta/proof-source assertions for fee, licensing, and VRBO pages |
| Stay money-page rebuild | `src/_data/seoPages.json`, `src/stays/stays.njk`, related image partials | Existing route/noindex/schema/image assertions | No money-page module requirements for the two priority AMI pages | Add `scripts/enforcement/stay-money-pages.test.js` for required sections, positioning language, FAQ presence, and image/schema invariants |
| Guide -> money-page routing | priority guide `.html` files, guide conversion partial | `guide-conversion.test.js` covers stay links on priority guides | No explicit owner-cluster routing requirement from top operator/comparison content | Extend `scripts/enforcement/guide-conversion.test.js` or `scripts/enforcement/indexation-link-graph.test.js` with owner-link requirements for selected guides and reports |
| Homepage perf-sensitive markup and third-party loading | `src/index.njk`, homepage assets | `assert-build-output.js` checks some assets and external URLs | No dedicated regression test for hero preload, third-party deferral ordering, or oversized header/logo regressions | Add `scripts/enforcement/homepage-performance-smoke.test.js` for hero preload presence, deferred analytics insertion pattern, and critical image dimension assertions |

#### Test Requirements To Add To The Plan

1. **CRITICAL**: `scripts/enforcement/metadata-integrity.test.js`
   - Assert each priority page has a syntactically valid `<title>`, description, canonical, `og:title`, and `og:description`
   - Fail on unmatched quotes, duplicate metas, or empty content values

2. **CRITICAL**: extend `scripts/enforcement/owner-acquisition.test.js`
   - Assert the fee, licensing, and VRBO pages keep non-generic title/meta framing
   - Assert those pages expose proof-source hooks or cited benchmark fields once added

3. **CRITICAL**: `scripts/enforcement/stay-money-pages.test.js`
   - Assert the AMI vacation rentals and AMI beachfront pages keep required modules:
     - value-tradeoff framing
     - inventory proof / matching properties
     - FAQs
     - canonical slash route
     - image/schema integrity

4. Extend guide conversion or link-graph coverage
   - Assert the highest-value comparison and owner-education guides link into the correct money pages using canonical URLs

5. Add homepage perf smoke assertions
   - Assert hero preloads remain present
   - Assert analytics stays deferred
   - Assert critical images stay dimensioned where expected

Test plan artifact written to:
- `/Users/sawbeck/.gstack/projects/uncfreak1255-code-seascape-vacations-site/sawbeck-codex-seo-full-audit-2026-03-30-eng-review-test-plan-20260330-143430.md`

### 4. Performance Review

Performance risk is concentrated in one place, the homepage.

What I checked:
- `src/index.njk` already defers Meta Pixel, GA4, and EmailJS until after load
- inner commercial templates already preload responsive Hostaway images and use non-blocking font loading
- rendered-output assertions already care about some homepage asset truths

What is still missing from the roadmap:
- explicit ownership of the hero media path
- a regression check that the perf pass does not quietly reintroduce render-blocking weight
- a QA step that rereads homepage LCP after the performance deploy instead of assuming the source change worked

### NOT in Scope

- Splitting `src/_data/seoPages.json` into a new content architecture in this batch
- Adding a full browser automation or Lighthouse CI harness to the repo
- Refactoring all raw guide HTML sources
- Rebuilding the entire homepage experience instead of tightening the performance layer

### What Already Exists

- Node-based enforcement and recovery tests
- release gate entrypoint via `npm run verify:release`
- owner and guide conversion tracking/events
- reusable owner and stay templates
- live smoke patterns and GSC verification paths

The implementation plan should assume those stay in place and get extended, not replaced.

### Failure Modes

| Severity | Failure mode | Detection | Mitigation |
|---|---|---|---|
| High | `seoPages.json` merge conflict or silent data loss | diff review plus failed route/content assertions | serialize owner and stay data edits or isolate by careful branch order |
| High | Metadata bug ships again on a priority guide | new metadata-integrity test | treat head markup as test-protected, not eyeballed |
| High | Stay page rewrite improves word count but not query fit | manual SERP review plus required-module tests | force value-tradeoff copy and inventory honesty |
| Medium | Homepage perf pass breaks tracking or CTA behavior | QA artifact plus live smoke | verify user-critical flows after perf deploy |
| Medium | Guide routing keeps feeding traffic into weak pages | guide link-graph assertions | add explicit owner/stay routing requirements for top guides |
| Medium | Preview-token burn from fragmented rollout | worktree/PR discipline | batch by workstream, not by small copy task |

### Worktree Parallelization Strategy

Recommended lanes:

1. Lane A, consolidation + enforcement
   - `src/_redirects`
   - `src/sitemap.njk`
   - `src/llms.txt`
   - priority guide sources
   - enforcement tests

2. Lane B, owner cluster
   - `src/property-management/property-management.njk`
   - `src/property-management/index.njk`
   - owner slice of `src/_data/seoPages.json`
   - `scripts/enforcement/owner-acquisition.test.js`

3. Lane C, stay cluster
   - `src/stays/stays.njk`
   - vacationer slice of `src/_data/seoPages.json`
   - `src/_data/staysPages.js`
   - stay recovery/enforcement tests

4. Lane D, homepage performance
   - `src/index.njk`
   - homepage assets/styles
   - perf smoke assertions

Constraint:
- Lanes B and C both touch `src/_data/seoPages.json`. Unless that file is split first, do not pretend they are safely parallel. Run them sequentially or keep edits tightly partitioned.

### Completion Summary

| Area | Verdict | Required change before implementation |
|---|---|---|
| File-level scope clarity | Pass with changes | Convert the roadmap into shared-system workstreams |
| Template reuse | Pass | Reuse current templates, no architecture detour |
| Test plan quality | Needs revision | Add the missing enforcement/tests listed above |
| Deployment safety | Pass with warning | Batch related SEO changes into fewer deploys |
| Performance planning | Needs revision | Make homepage perf a measured workstream, not a vague later step |

## Cross-Phase Themes

1. The roadmap was right about priorities and wrong about execution shape.
2. Shared files matter more than the individual page list. `src/_data/seoPages.json`, the two commercial templates, and the discovery surfaces are the real blast radius.
3. Proof has to become reusable infrastructure. If it stays page-by-page prose, owner CTR will drift back to weak.
4. The next unit of work is not "publish more." It is "stop leaking and start compounding."

## GSTACK REVIEW REPORT

| Review | Trigger | Why | Runs | Status | Findings |
|--------|---------|-----|------|--------|----------|
| CEO Review | `/plan-ceo-review` | Scope & strategy | 1 | issues_open | roadmap direction passes, execution model needs revision |
| Codex Review | `/codex review` | Independent 2nd opinion | 0 | unavailable | attempted CEO challenge did not return a usable final review |
| Eng Review | `/plan-eng-review` | Architecture & tests (required) | 1 | issues_open | shared-file sequencing and missing test coverage are the main blockers |
| Design Review | `/plan-design-review` | UI/UX gaps | 0 | skipped | no meaningful UI scope |

**VERDICT:** REVIEWED, NOT YET APPROVED. The plan is worth executing after the premise set is confirmed and the added QA/proof/sequencing requirements are accepted.
