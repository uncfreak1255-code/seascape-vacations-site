# Required Batch Workflow

Choose the route before starting work. Both routes retain the content,
source-truth, measurement, design and publication requirements in `AGENTS.md`.

## Existing-guide accuracy repairs

Use one lead plus one read-only targeted reviewer when an approved brief repairs
facts, numerical consistency, existing FAQ/schema parity or source attribution
on an existing guide, with search intent, routing and layout unchanged. This
route is for an authorized repair; it does not select a new growth batch.

1. The lead reads the active brief, affected source, authoritative facts,
   existing tests, content gate and all three `docs/style/` sources. Resolve
   contradictions in the brief against its named source before editing.
2. The lead works in the guarded task checkout, completes **Draft the copy**,
   **Remove internal wording**, then **Check voice and specificity**, and edits
   only the repair and its required supporting files. Run the affected proof
   and required Site checks.
3. One targeted reviewer independently checks the actual before/after diff,
   source facts, prose/data/FAQ/schema consistency, voice, scope and proof.
   The reviewer performs the Voice Editor and Release Gate responsibilities
   together and returns an explicit copy verdict plus check results. Use the
   existing Release Gate card or an equivalent native read-only reviewer;
   this route introduces no new persona or model default.
4. The lead repairs findings. Recheck the affected material and required
   checks before the normal source-publication lane. Deployment and measured
   impact retain their existing authority and evidence gates.

If the task changes search intent, routing, layout, adds a page or becomes a
meaningful rescue, use the batch lane below and its required specialist work.
Tiny fixes retain the no-fanout route in `docs/process/skill-policy.md`.

## SEO batch lane

Use this lane for new guides, growth decisions, search-intent/routing changes
and meaningful rescues. The five responsibilities may need separate specialists.

1. Search Operator runs the proof lane and attack lane for one named query family.
2. Search Operator records the attack receipt. `hold` is incomplete unless the
   attack status is `completed` or `none found after named checks`.
3. SEO Architect turns that receipt into content, routing, and design/format
   strategy. New guides and meaningful visual rescues invoke
   `seascape-design-specialist` before Page Builder work.
4. One cluster gets chosen and one brief gets written or updated in
   `docs/briefs/` only after that strategy exists.
5. Work starts on `codex/<batch>` in `.worktrees/<batch>`.
6. Page Builder reads the active brief, `docs/process/content-quality-gate.md`, `docs/style/voice.md`, `docs/style/banned-patterns.md`, and `docs/style/approved-examples.md`, then completes **Draft the copy** for changed reader copy.
7. Page Builder edits source and only the docs needed to support that batch.
8. Page Builder rewrites any sentence that still sounds like a role card, session note, or helper instruction before it lands in source.
9. Voice Editor checks **Remove internal wording** and then **Check voice and specificity** against the same brief and content gate. Page Builder makes any requested rewrites; Voice Editor stays read-only.
10. Release Gate runs `npm run lint:content` and requires a visible-copy voice pass before the rest of verification.
11. Publish source through the owning closeout lane; deploy only under its
    existing authorization and runtime-proof requirements.
12. Reread after the crawl window instead of inventing a new batch too early.

See also `docs/process/five-roles.md` for who owns each step, and the "Reading
Order For SEO Work" section in `CLAUDE.md`.
