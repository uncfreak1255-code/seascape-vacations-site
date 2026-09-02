---
name: content-quality-rubric
description: Score Seascape guide, stay, or research copy for information gain and AI-citation extractability after the content gate. Advisory only; does not block merge.
---

# Content Quality Rubric

Use this as the positive complement to `docs/process/content-quality-gate.md`.
The content gate is a negative gate: it blocks slop, fabricated stats, and
instruction-template copy. It scores nothing positive, so a draft can pass
`npm run lint:content` clean and still be a derivative, citation-invisible
restatement of competitor content. This rubric closes that gap.

It is **advisory**. It returns a read plus specific fixes; it is not a CI gate
and does not block a merge. Promote any part of it to a deterministic check
(see `Escalation`) only when the same finding repeats across batches — the
repo's "repeated site-specific need + smoke-tested win" bar.

## When to use

- Drafting or reviewing `reader copy` on a guide, stay, or research route — the
  routes that get ranked under the information-gain era and cited by AI answer
  engines.
- After `copywriting` → `enterprise-ui-writing` → `humanizer` and after
  `npm run lint:content` is green, before asking for a Voice Editor or human
  pass.
- Not for owner money pages' proof claims — `owner-proof-integrity` still owns
  those; this rubric assumes the proof is already correct and asks whether the
  page is *citable and differentiated*.

## Authority

- Audit + rationale: `docs/research/2026-06-13-ai-seo-stack-audit.md`
- Negative gate it complements: `docs/process/content-quality-gate.md`
  (`## SEO, GEO, And AEO Checks` and the Visible Copy Lane)
- Voice + proof: `docs/style/voice.md`, `docs/style/banned-patterns.md`,
  `src/_data/ownerProofAssets.json`

## The rubric

Score each dimension `strong` / `weak` / `missing` and name the specific fix.
Do not reduce the page to a single number; the fixes are the output.

1. **Information gain vs the SERP.** Does the page add proprietary data,
   first-hand Gulf Coast operating experience, or unique local judgment beyond
   what competitors already published? A page that only restates known facts is
   penalized under the information-gain signal. Fix by adding a Seascape-specific
   observation, rate check, or local call competitors cannot copy.
2. **Answer-first extractability.** Is the real decision answered in the first
   ~200 words, in a block that stands alone if lifted into an AI answer or
   snippet? Bury the answer and the page loses citations.
3. **Scannable structure for AEO.** Comparative or financial content uses a
   table, not prose. Multi-part answers use short, self-contained blocks or
   lists. Declarative sentences over meandering ones. The `humanizer` pass may
   not have dissolved these (see the content gate's reconciliation rule).
4. **Named-source statistical density.** Each citable stat traces to an approved
   proof asset and can stand alone in one sentence without extra internal
   explanation. Quoting someone else's stat gets *them* cited, not Seascape —
   prefer first-party proof where it exists.
5. **E-E-A-T signals.** Named author with a real role, a visible review/updated
   date, and transparent sourcing. Guide and research pages should show who
   stands behind the call.
6. **Freshness.** `dateModified` is current and the content reflects the current
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

Lead with the fixes. A clean rubric score that ships derivative copy is a
failure; a `weak` score with three sharp fixes is the win.

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
zero-dependency `lint:content` pattern. Open that as its own `agent-surface-audit`
decision; do not pre-build it.
