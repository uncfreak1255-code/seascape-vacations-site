# llms.txt home count repair

- lifecycle: active — one-line factual correction in `src/llms.txt` (issue #1012), under Sawyer's November 18 standing SEO rule (#1008).
- task scope: change the portfolio size stated in `src/llms.txt` from seven to eight, and add a test that keeps that line in step with the catalog. No other copy, layout, URL or schema change.
- persona: people who ask an AI assistant for a small local vacation rental manager in Bradenton or Sarasota
- primary keyword: none; this is an AI-summary accuracy repair, not a ranking change
- secondary keywords: none
- audience pattern: ask an AI assistant for a local manager, then open the property list or owner services page it cites
- required internal links: /properties/, /property-management/ (both already linked from `src/llms.txt`; unchanged)
- CTA target: unchanged; the existing property and owner-service links in `src/llms.txt`
- proof source: Hub `context/seascape-properties.md` on `origin/main` (read 2026-11-18): "Portfolio count: 8 published managed homes as of 2026-10-23"; `src/_data/properties-fallback.json` lists eight homes; the `## Properties` list in `src/llms.txt` already names all eight. Sawyer, 2026-11-18, in a Claude Code session chat: "We have 8 homes under Managment...."
- anti-claims: no portfolio size that differs from the catalog; no count in a template that does not derive it from the properties list

## Boundary proof — written before the copy edit

What must not break: every other line of `src/llms.txt`, including the generated `## Properties` block that `scripts/regenerate-property-surfaces.js` owns, and the existing rule that templates and guides never hardcode the portfolio size (`scripts/enforcement/home-count-derived.test.js`).

The check comes from the catalog, not from the new text: the new test in `home-count-derived.test.js` reads the count from `src/_data/properties-fallback.json`. It finds every phrase in `src/llms.txt` that the shared portfolio-size patterns (`scripts/enforcement/home-count-word.js`) recognise, fails if there are none, and fails if any of them names a count other than the catalog's. It was observed failing on the old line (`src/llms.txt says "manages seven homes"; the catalog has 8 homes`) and passing after the edit. Probes on a copy also failed a second stale phrase added after the correct one, a wrong count with another number later in the phrase, and a file with no count; the digit form "8" passed.

The wrong case it must catch: a later catalog change (a ninth home, or a home leaving) that leaves `llms.txt` stating the old count. The old template scan missed this file because it reads only `.njk`, `.html`, `.md` and `.js`. Known limit: a count written in a form the shared patterns do not recognise (for example "a portfolio of seven homes") is not checked; the test then fails only if no recognised phrase remains.

## Source Files Changed

- Source files changed in this batch:
  - src/llms.txt
  - scripts/enforcement/home-count-derived.test.js and this brief

## Scope and evaluation

Small factual correction: the content gate's focused route applies. No OpenSEO research or Compound Writing pass, because one number changes and no sentence is rewritten.

Keep-or-revert (standing SEO rule, `AGENTS.md`): the baseline is the live `/llms.txt` line read on 2026-11-18T21:18Z, which says "manages seven homes". The verdict is a live readback on the first daily publish after the merge: the live line says "manages eight homes". This is an accuracy repair, so a problem leads to revising wording, never to restoring the old count.
