---
name: content-quality-rubric
description: Use when scoring information gain and AI-citation extractability of Seascape guide, stay, or research copy.
---

# Content Quality Rubric

Assess information gain and extractability after the visible-copy lane in
`docs/process/content-quality-gate.md` and a passing `npm run lint:content`,
before Voice Editor or human review. Owner proof claims remain with
`owner-proof-integrity`; this rubric assumes factual proof has been checked.

This is advisory: return specific fixes, not a merge block or CI score.
The rationale is in `docs/research/2026-06-13-ai-seo-stack-audit.md`.

## The rubric

Score each dimension `strong` / `weak` / `missing` and name the specific fix.
Do not reduce the page to a single number; the fixes are the output.

1. **Information gain vs the SERP.** Does the page add proprietary data,
   first-hand Gulf Coast operating experience, or unique local judgment beyond
   what competitors already published? Recommend a verified Seascape-specific
   observation, rate check, or local judgment where it adds value.
2. **Answer-first extractability.** Is the real decision answered in the first
   ~200 words, in a block that stands alone if lifted into an AI answer or
   snippet?
3. **Scannable structure for AEO.** Comparative or financial content uses a
   table, not prose. Multi-part answers use short, self-contained blocks or
   lists. Declarative sentences over meandering ones. The final voice pass may
   not have dissolved these (see the content gate's reconciliation rule).
4. **Named-source statistical density.** Each citable stat traces to an approved
   proof asset and can stand alone in one sentence without extra internal
   explanation. Prefer first-party proof where it exists.
5. **E-E-A-T signals.** Named author with a real role, a visible review/updated
   date, and transparent sourcing. Guide and research pages should show who
   stands behind the call.
6. **Freshness.** `dateModified` reflects a real update and the content reflects the current
   season, rate window, or market read — not a stale snapshot.
7. **Entity + destination clarity.** The page makes clear who Seascape is, what
   page family the route belongs to, and what conversion step comes next, with
   the brief's named internal links present (not footer-only routing).
8. **Voice + proof boundary intact.** Reads in Seascape's operator voice, not
   role-card or session voice; the guest/owner proof boundary is not blurred;
   no owner-economics jargon leaking into guest copy (or vice versa).

## Output

Return:
- a per-dimension read (`strong` / `weak` / `missing`)
- the two or three highest-leverage fixes, written as concrete edits
- one line on the biggest citation/ranking risk if the page ships unchanged

Lead with the fixes and distinguish citation hypotheses from measured results.

## Boundaries

- Advisory, not enforced. Do not add a CI block, a score threshold, or a new
  collector from this skill.
- Harvest criteria are adapted from public donor rubrics (the QRG/passage-
  citability framing in `claude-seo`, the category scorecard in
  `geo-optimizer-skill`) as donor references only — do not install those packs.
- AI-citation *monitoring* (did an answer engine actually cite us) is not this
  skill's job and does not belong in this repo; that proof surface lives in
  `seascape-analytics`.
- This is one advisory skill, not a pack. Keep it singular; do not let it grow
  into a GEO/AEO operating system.

## Escalation

If the same gap shows up across multiple content batches (for example, answers
buried past the first 200 words, or comparison prose that should be tables),
that is the evidence bar for a small deterministic check modeled on the
zero-dependency `lint:content` pattern. Open that as its own `repo-dev-setup` review
decision; do not pre-build it.
