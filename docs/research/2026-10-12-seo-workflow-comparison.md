# Site SEO workflow comparison — 2026-10-12

Decision: retain one lead plus one targeted reviewer for source-backed
existing-guide accuracy repairs. This is one paired historical replay, not a
model benchmark or proof for every SEO task. The larger batch and design lanes
keep their existing requirements.

## Task and frozen controls

Replay the temperature reconciliation from Site PR #710 on the existing
best-time-to-visit guide: all monthly/prose/FAQ temperatures agree with the
weather guide's NOAA normals; table has all 12 months; source/proxy attribution
is clear; FAQ visible text equals JSON-LD; dates, CTA, layout and deferred text
remain within the brief. Season labels must consistently follow the supplied
Hub taxonomy. No rank, conversion or citation lift was tested.

Both trial worktrees used synthetic pre-fix HEAD
`71a2e0cc36ccf27716c89efe7956f7396e9ff4c7` and identical committed tree, with
instructions frozen from `4a9610802d049c9b80b03480be5319ef87bf8613`.
The same frozen brief, data source, native Claude Code 2.1.296,
`claude-sonnet-5-5`, high effort, permission/tool limits and empty MCP config
applied to both. Role-card models were normalized to isolate the workflow.
The five-role arm used five sequential existing role definitions; the candidate
used a lead plus targeted reviewer. Each arm allowed two repair rounds,
20 minutes of agent execution and $15 CLI-estimated usage. Both stayed within
these limits. Trials never published or deployed their page changes.

## Observed results

| Measure | Five roles | Lead + targeted reviewer |
| --- | ---: | ---: |
| Agent execution, including tools/checks/repairs | 8:19 | 5:28 |
| CLI-estimated usage | $2.33 | $1.45 |
| Initial material defects | 1 | 1 |
| Final material defects | 0 | 0 |
| Writer repair rounds | 1 | 1 |
| Coordinator acceptance clarifications | 1 | 1 |
| Coordinator manual source edits | 0 | 0 |
| Sawyer corrective messages | 0 | 0 |
| Agent sessions / CLI invocations | 5 / 6 | 2 / 4 |
| Output tokens | 54,662 | 36,923 |
| Cache-creation input tokens | 357,105 | 187,962 |
| Cache-read input tokens | 3,546,081 | 3,309,845 |
| Native permission denials (fallbacks included above) | 5 | 6 |

Candidate agent execution was 34.3% lower and estimated
CLI usage 37.7% lower. Quality and required
correction effort tied. The shared clarification resolved the brief's
preserve-existing-rate-wording versus authoritative-Hub-taxonomy tension;
both writers normalized the table and documented its categories.

Execution time sums CLI invocation wall time. First-start to last-finish clock
spans were 13:21 and 9:36; these include coordinator queue/scoring gaps and are
reported separately. Model latency, cache state, tool permissions and stochastic
output can vary. A single pair supplies initial task-class evidence, not a
repeatability estimate or a claim of less human supervision.

The dollar column is the native client estimate under the existing Claude Max
login, not observed incremental subscription billing. Resume reports are
cumulative; only their deltas were added. Common setup, independent scoring,
coordinator work and adoption validation are outside the comparative columns.
See [Claude Code's JSON/cost accounting](https://code.claude.com/docs/en/headless).

## Verification and exclusions

A source-derived scorer failed on the original six-row inconsistent page and
passed the repaired reference. It checked source-derived table values, FAQ
parity and preserved metadata/CTA/style constraints. A separate reviewer scored
anonymized initial/final outputs against the same brief and weather facts.
Both final outputs passed that review and the deterministic scorer. Native
release verification passed for both, including content lint, build, full unit
suite, links across 163 pages and 686 JSON-LD blocks. The five-role final suite
had 1,137 passing tests; the candidate added five regression cases to the
1,128-test baseline. Built-route reads confirmed changed values and preserved
CTA/date/schema contracts. No live business result was measured.

Two setup failures were corrected before winner selection: the changed-active-
brief fixture initially needed a replay annotation; the first Git baseline
contained the already-merged solution and contaminated a reviewer. Those runs
were invalidated. Both scored arms were restarted from the identical committed
broken page, so normal HEAD diffs represented the task. Excluded setup runs
used about $5.20 of additional CLI-estimated usage and 19:04 of agent execution;
these are retained as overhead, not counted as either arm's performance.

Local primary receipts: `~/Projects/seo-workflow-comparison-20261012/plan.json`,
`sealed-fixture-proof.json`, `results.json`, `score.py`, per-stage prompts,
JSONL trajectories, metadata and handoffs under `a/` and `b/`, anonymized source
under `blind/`, and excluded runs in `setup-pass-a/` and
`invalid-git-baseline-a/` / `invalid-git-baseline-b/`. These contain session-local
paths and usage telemetry and remain local. The replay task and normative
workflow decision are recorded here for repository consumers.

## Adoption proof

The canonical repair route lives in `docs/process/batch-workflow.md` and the
shared AGENTS/Claude pointers. Existing Release Gate performs the combined
review; the content gate still requires independent copy approval. No new
persona, plugin, model default or recurring process is needed. Required source,
content, design, measurement and release controls remain applicable.

Fresh native Codex and Claude loaded-guidance probes both chose the combined
reviewer for the approved weather/FAQ repair, the existing specialist/design
batch lane for a new-format guide, and no fanout for a tiny link correction.
Both retained independent copy approval, required Site proof and source/deploy
boundaries. The probes read the draft at7e7fdc72 and do not prove deployment.
The existing content/voice and status contract tests passed35/35; the complete
Site release verifier also passed. Local probe artifacts are
`fresh-codex-guidance.md`, `fresh-claude-guidance.json`,
`adoption-focused-tests.log` and `adoption-release.log` beside the trial receipts.

Source publication and owning-root alignment follow the normal current-head
review/CI/merge lane. Subsequent real tasks will show whether the result repeats;
this report makes no supervision claim.
