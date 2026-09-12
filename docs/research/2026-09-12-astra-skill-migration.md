# Existing Skill Migration for GPT-6 Astra — 2026-09-12

## Basis and scope

Requested by Sawyer. Basis: [OpenAI, Rethinking skills and prompts for GPT-6 Astra](https://developers.openai.com/blog/rethinking-skills-and-prompts-for-gpt-6-astra), read before the skill audit.
Apply task-specific selection, conditional references, and outcome-based guidance
while preserving real constraints and compatibility with other models.

Mutation owner: this Codex session, branch `codex/astra-skill-migration`, isolated
worktree `.worktrees/astra-skill-migration`, base `4e600cbe` (origin/main at start).
No public site source, model defaults, runtime, provider caches, or release
configuration changes are part of this migration.

Inventory: sixteen active canonical roots and sixteen identical plugin copies;
Claude's sixteen entries are symlinks. All 32 canonical files at the base were
inspected, including references, three eval files, four UI metadata files, and
the link analyzer. Plugin contents were verified byte-for-byte against those
sources. The retired archive has 46 roots and 84 supporting files, also audited.

## Main findings before editing

- Descriptions mixed task triggers with broad topics, synonyms, and workflow rules.
- The largest roots carried generic SaaS interviews, catalogs, examples, quotas,
  and fixed report formats even for narrow requests.
- Design roots repeated intake and donor details already owned by the studio.
- Conditional references were often present but not effectively used by roots.
- Several evals rewarded reading a generic marketing-context file, exact report
  headings, or mandatory sequencing rather than the requested outcome.
- The FAQ eval conflicted with the root's existing eligibility restriction.
- Short truth, intake, and batch skills mainly contain real domain requirements.
  Their strict language is not evidence of unnecessary scaffolding.

## Per-skill changes

Counts include frontmatter and blank lines, for the canonical root; each plugin
copy has the same counts. Reduction was not an acceptance target.

| Skill | Before | After | Migration decision |
| --- | ---: | ---: | --- |
| `accessibility` | 541 | 36 | Route criterion coverage, component examples, and manual proof separately; remove global-install recipe and broken retired-skill link. |
| `content-quality-rubric` | 101 | 75 | Keep all eight scoring dimensions and advisory status; remove repeated rationale and unsupported certainty about ranking/citation outcomes. |
| `design-review` | 55 | 38 | Replace an eight-step itinerary with evidence and completion contracts; move control-specific capture details to interaction-proof.md. |
| `internal-link-targeting` | 49 | 43 | Mostly unchanged. Keep analyzer, priority rules, exclusions, target fit, and four output fields; remove duplicate workflow list. |
| `next-batch-gate` | 86 | 67 | Keep status values, attack-lane evidence, freshness limits, and output; remove repeated decision flow and common-block restatements. |
| `owner-outbound-batch` | 99 | 88 | Mostly unchanged. Keep permission evidence, private-data limits, refusal cases, no-draft/no-send rules, and separate-message authority. |
| `owner-proof-integrity` | 42 | 37 | Mostly unchanged. Keep asset-before-copy dependency, proof integrity, and release check; replace generic reading sequence with completion. |
| `owner-reply-intake` | 88 | 88 | Almost unchanged. Shorter description and one heading; retain classifications, fixtures, refusal order, and exact write region. |
| `page-cro` | 186 | 44 | Keep seven diagnostic lenses; remove fixed ordering, generic role prompt, repeated questions, and mandatory report headings; disclose page patterns. |
| `property-truth-regeneration` | 51 | 53 | Mostly unchanged. Real data dependencies justify the regeneration/check sequence; remove generic reread and add completion. |
| `schema-markup` | 199 | 50 | Keep factual JSON-LD, eligibility restrictions, analytics ownership, and validation; remove generic tech-stack interview and duplicate schema catalog. |
| `seascape-design-critic` | 108 | 36 | Keep four verdicts and strict taste bar; replace report template and repeated prohibitions with required findings and next gate. |
| `seascape-design-specialist` | 121 | 46 | Preserve donor scan, critic-before-direction, 2–3 alternatives, approvals and implementation handoff; point to existing studio details. |
| `serp-ctr-title-rewrite` | 44 | 37 | Mostly unchanged. Preserve live SERP input, freshness hold, three options, scoring, primary/fallback, and intent constraint. |
| `site-architecture` | 357 | 51 | Replace generic business interview and quotas with route constraints and scoped deliverables; use existing pattern/template references. |
| `web-design-guidelines` | 33 | 18 | Keep explicit-only invocation; route the duplicate review contract through design-review without another automatic pass. |

## Progressive disclosure

New supporting files:

- `accessibility/references/component-patterns.md`: retained component examples
  from the former root, loaded for the affected component. Corrected the large
  text threshold units from pixels to points per
  [W3C contrast guidance](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)
  and clarified native keyboard use.
- `accessibility/references/manual-checks.md`: retained manual checks, interaction
  expectations, screen-reader shortcuts, and reporting details, loaded for
  interactive behavior or a full manual audit.
- `design-review/references/interaction-proof.md`: control-specific before/after
  evidence, loaded only for the interaction claim.
- `page-cro/references/page-patterns.md`: homepage, landing, pricing, feature,
  guide, and form lenses, loaded by page job.

Existing WCAG, schema, architecture, diagram, and experiment references remain
available. Architecture roots no longer duplicate their catalogs. The specialist
uses the existing design studio for donor choices and packet details. Generic
reference examples are explicitly subordinate to repo design and proof rules.
No extra skill, model router, planner, or approval layer was introduced.

## Preserved requirements and behavior changes

Preserved: design critic orchestration and four verdicts; alternatives after a
weak concept; optional donor tools and metadata-only discovery; approved-design
fidelity; model routing in unchanged owning docs; owner permission, no-send and
no-draft boundaries; private contact data protections; Hub validation and exact
register region; property source-before-generation; batch/CTR freshness gates;
content and rendered checks; analytics ownership; explicit-only invocation for
web-design-guidelines; release and irreversible-action authority.

Intentional changes: narrower automatic selection, flexible analysis order,
conditional reference loading, scoped architecture output instead of duplicate
formats, and completion through authorized fixes. Generic click/menu/link quotas
are now heuristics. Optional Figma no longer requires an unsolicited decision
on every rendered review. Rubric language no longer asserts that a structure
will cause rankings or citations; dateModified means a real update. FAQ evals
now reinforce the existing restriction instead of contradicting it. Removed
routine global tool installation from accessibility guidance.

The active eval files retain their scenarios but assess outcomes and boundaries
instead of the removed scaffolding. Existing enforcement tests now assert narrow
selection terms and follow the disclosed donor reference while preserving the
critic gate. UI metadata and the link analyzer are unchanged.

## Retired archive

All 46 archived skills remain unchanged and inactive. They contain historical
SaaS/marketing workflows, duplicated SEO guidance, dated platform claims, and
missing old tools/integration references. The archived web-quality shell analyzer
also accumulates state inside a pipeline subshell. These are historical defects,
not active runtime failures. Editing or reactivating the archive would confuse
the preserved snapshot with the current sixteen-skill authority.

## Verification and limits

- Focused skill, design orchestration, owner-intake, and status contracts: 37/37 pass.
- Active metadata, eval JSON, and local Markdown reference targets: pass.
- Canonical/plugin bytes and Claude symlink parity: pass.
- `npm run lint:content`: 22/22 pass.
- `NETLIFY=true npm run verify:release`: all checks pass, including a fresh build,
  922/922 tests, property drift, design lint, redirects, recovery, internal links,
  and JSON-LD validation. The first sandboxed suite hit a localhost bind denial;
  the affected fixture and full verifier passed with local-server permission.
- Separate Terra review inspected the complete intended patch, including new
  references, against base `4e600cbe`: no actionable material findings. The review
  retained the same source-only proof limits noted below.

These are source and contract checks. The bundled behavioral scenarios were
reviewed and updated, not executed against paid model APIs. This migration does
not establish measured skill-selection accuracy, token savings, or model-quality
parity. Fresh-session behavior and plugin-cache installation are not claimed.
