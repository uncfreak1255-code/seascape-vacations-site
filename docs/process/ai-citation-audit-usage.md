# AI Citation Audit Usage

Use this when the task touches Seascape's AI-search surfaces or when someone
asks why Seascape is or is not getting cited in AI/search answers.

This is a routing and proof doc. It is not permission to add a new local skill,
copy a donor agent pack into the repo, or claim AI wins from schema alone.

## Read Order

1. `AGENTS.md`
2. `CLAUDE.md`
3. `docs/status/current-state.md`
4. `docs/status/next-batch.md`
5. this file
6. the active brief, if one exists
7. the task-relevant source file

## When To Use

- the user asks for current AI citation visibility, mention gaps, or why a
  competitor is getting cited
- the task changes `src/llms.txt`, `src/ai-discovery.json.njk`, `src/robots.txt`,
  or citation-oriented source notes/modules
- a comparison, listicle, research, or direct-booking page is being hardened
  for AI selection
- a review or closeout is using phrases like `citation-ready`,
  `AI-search-ready`, `AI answer fit`, or `best X`

## Ownership Split

- `seascape-vacations-site` owns page source, `src/llms.txt`,
  `src/ai-discovery.json.njk`, `src/robots.txt`, schema, internal links, and
  deploy readiness
- `seascape-analytics` owns current citation/mention measurement, prompt packs,
  receipts, and attribution proof
- `seascape-hub` owns durable strategy/canon only after reviewed evidence
- off-site entity or distribution surfaces are not site truth until the live URL
  exists and is verified

## Do Not Use This To

- claim schema caused AI citations
- claim AI citations caused bookings, owner demand, or revenue
- open random GEO page volume while `docs/status/next-batch.md` is blocked
- move measurement logic into this repo
- install donor agent packs locally instead of translating the useful checklist

## Audit Types

### 1. Site-Lane Audit

Use this when shaping or reviewing source changes in this repo.

Check:

- `src/llms.txt`
- `src/ai-discovery.json.njk`
- `src/robots.txt` when crawler allowance or discovery is part of the claim
- the target route's intro, proof notes, source notes, internal links, and CTA
- the relevant enforcement commands

Output:

- what changed in source
- which visible route or machine-readable surface now supports the claim
- what remains analytics-only or unproven

### 2. Analytics-Lane Audit

Use this when the user wants a current answer about mentions or citations on
ChatGPT, Claude, Gemini, Perplexity, or another live AI surface.

Requirements:

- use real current platform checks or a current analytics receipt
- keep the prompt set fixed and date-stamped
- separate cited URL from mentioned brand
- record the result in `seascape-analytics`

This repo may consume the receipt. It does not become the receipt.

## Current-Proof Rules

- For fast-moving AI platform behavior, use a current live check or an
  analytics-owned receipt. Older reports are context, not current proof.
- Always separate:
  - cited URL
  - mentioned brand
  - retrieval surface
  - referral click
  - conversion

## Site-Lane Checklist

- Does the active AI-search or experiment brief name a hypothesis, primary
  event, guardrail event, entry criteria, readback window, and decision rule?
- Does the first paragraph answer the decision fast enough to stand alone?
- Are methodology and source notes below the hook instead of buried in the lead?
- If the page compares companies or destinations, is the treatment fair enough
  to stay credible if Seascape were removed?
- Can each quotable fact be traced to visible proof or a source note?
- Are `llms.txt`, `ai-discovery.json`, schema, and route copy aligned on the
  same canonical target and claim boundary?
- If the change is invisible, is that called out plainly in review instead of
  making Sawyer infer it from page screenshots?

## Minimum Verification

For machine-readable AI-surface changes:

```bash
node --test scripts/enforcement/ai-discovery-schema.test.js
npm run verify:jsonld
npm run verify:links
```

For visible route changes, also run the relevant subset of:

- `npm run build`
- route smoke checks
- `docs/process/design-review-workflow.md` when layout, hierarchy, or other
  meaningful visual treatment changed
- desktop and mobile screenshots when the route is headed to review or merge

## Review Handoff

State:

- whether the proof is visible route copy, a machine-readable surface, or
  analytics-only
- the exact files and routes changed
- the exact verification run
- what is still unproven

## Stop Conditions

- `docs/status/next-batch.md` is blocking expansion and the task is drifting
  into broad AI-search volume
- the work needs latest citation numbers but no current analytics receipt or
  live prompt check exists; use `docs/runbooks/stale-analytics-receipt.md`
  instead of guessing from stale proof
- the claim depends on off-site mentions that are not live yet
- the only "proof" is schema or `llms.txt` without a credible page behind it
