# Brief: August 2026 guide redirect loop rescue

Technical route-recovery batch for a confirmed Netlify self-301 loop on missing
`/guides/{slug}/` URLs and a retired book-direct featured slug with no explicit
alias. Redirect plumbing only; no new pages, no copy rewrites, no owner-money URLs.

## Content Gate Inputs

- persona: a guest or crawler hitting a retired or mistyped `/guides/` URL.
- primary keyword: book-direct / why booking direct savings (retired slug equity only).
- secondary keywords: none for this plumbing batch.
- audience pattern: old featured-slug or non-existent guide path that must resolve cleanly.
- proof source: live curl on 2026-08-17 against production; current `src/_redirects` on main; live destination `/guides/booking-direct-vacation-rentals/` 200 and in sitemap.
- required internal links: none; homepage and `/guides/` already link the live book-direct URL.
- CTA target: preserve `/guides/booking-direct-vacation-rentals/` as the only destination for the retired slug.
- anti-claims: no ranking, traffic, or indexation recovery claim; no rewrite of the live book-direct page.

## Why This Batch

- what changed in the data: live 2026-08-17 showed `/guides/why-booking-direct-saves-you-hundreds/` and any fake `/guides/{slug}/` returning 301 Location to themselves; real pages and non-guide 404s behaved correctly.
- why this cluster wins now: one forced catch-all is poisoning every missing guide URL, and the retired featured slug has no explicit 301 to the live page.
- what should explicitly wait: any rewrite of `booking-direct-vacation-rentals`, new guide pages, or owner-money URL work.

## Experiment And Readback Contract

- hypothesis: an explicit retired-slug 301 above `/guides/:slug`, plus removal of the forced `/guides/:slug/index.html` catch-all, yields one clean hop for the old slug and a real 404 for missing guides, while slashless real guides still canonicalize once.
- primary event: old slug → single 301 → live 200; fake guide trailing-slash → 404; `bradenton-vs-sarasota` slashless → one 301 → 200.
- guardrail event: SEO structure test asserts rule order and rejects the forced index.html catch-all; `verify:redirects` stays green.
- entry criteria: live self-301 confirmed on 2026-08-17; retired slug absent from source; live destination 200.
- readback window: immediate post-deploy curl; no ranking claim.
- decision rule: keep the explicit alias and the non-forced slashless catch-all; do not restore `301!` on `/guides/:slug/index.html`.

## Gate 0 Search And Attack Receipt

| Field | Required answer |
| --- | --- |
| Target query family | Retired book-direct featured slug and missing `/guides/` path hygiene. |
| Searcher intent | Reach the live booking-direct guide, or get an honest 404 on a non-existent guide. |
| Current Seascape URL | Retired `/guides/why-booking-direct-saves-you-hundreds[/]`; live `/guides/booking-direct-vacation-rentals/`; catch-alls in `src/_redirects`. |
| SERP observed date | 2026-08-17 |
| SERP stale after | 2026-08-24 |
| Current proof | Live curl 2026-08-17: slashless real guide 301→200; retired and fake trailing-slash guides self-301; live booking-direct 200; properties/root fake paths real 404; source lacks the retired slug. |
| Top visible competitors | Not used; this is own-site redirect defect repair, not a SERP content attack. |
| Competitor angle | Route hygiene gap only; no competitor page structure copied. |
| Visual/format gap | Not applicable: no public page or layout change. |
| Seascape gap | Forced guide index.html catch-all self-looped missing URLs; retired featured slug had no explicit alias to the live guide. |
| Search fit | Direct 301 for known retired equity; honest 404 for unknown guide slugs; keep trailing-slash canonicalization for real guides. |
| Local/GBP proof | Not applicable: no local-pack or GBP surface is touched. |
| AEO/readback note | Not applicable: redirects carry no answer content; post-deploy curl establishes route truth. |
| Recommendation | Add two explicit 301s for the retired slug above `/guides/:slug`, remove the forced `/guides/:slug/index.html` catch-all, keep slashless→slashed for real guides. |
| Attack status | completed |
| Query variants inspected | `/guides/bradenton-vs-sarasota`, `/guides/why-booking-direct-saves-you-hundreds[/]`, `/guides/this-page-does-not-exist-xyz/`, `/guides/booking-direct-vacation-rentals/`, `/properties/not-a-home/`, random root 404. |
| SERP source | Own-site live curl audit observed 2026-08-17; not a competitor SERP ranking pass. |
| Competitor URLs inspected | Own production routes only: https://seascape-vacations.com/guides/booking-direct-vacation-rentals/ and the defect URLs named above; no competitor structure copied. |
| Content gap and Seascape answer | Gap is dead/looping routing, not missing reader copy; live booking-direct guide is the answer for the retired slug. |
| Design/format strategy | No public copy or layout change. |
| Seascape proof available | Live curl receipts 2026-08-17, current `src/_redirects`, source inventory showing retired slug gone and live guide present. |
| Tools/plugins used | Live curl, `src/_redirects` read, SEO structure test, redirect target validator. |
| Decision and reason | Ship bounded redirect repair; do not merge until Sawyer/CoS reviews; hold any ranking interpretation. |

## Cluster In Scope

- canonical winner URL(s): `/guides/booking-direct-vacation-rentals/`
- feeder pages: none changed
- aliases or retired URLs: `/guides/why-booking-direct-saves-you-hundreds` and trailing-slash form
- money destination: existing booking-direct guide only
- active lane: technical guide-route rescue

## Source And Proof Constraints

- property truth needed: none
- owner proof asset needed: none
- claims that are off-limits: ranking, traffic, conversion, or any rewrite of the live booking-direct page
- Seascape-specific proof or local experience this page can add beyond generic competitor coverage: exact route ownership and verified destination mapping

## Page Builder Tasks

- source files likely to change: `src/_redirects`, `scripts/enforcement/seo-structure.test.js`, and this brief
- redirect or schema work: explicit retired-slug 301s; remove forced guide index.html catch-all; keep slashless→trailing-slash catch-all
- internal-link or CTA work: none
- money CTA and downstream tracking event to verify: none changed

## Voice Editor Checklist

- tone risks: none; no reader copy
- generic or mechanical patterns to kill: none
- proof or specificity checks: redirect targets only
- customer wording kept where natural: N/A

## Release Gate Checklist

- routes to smoke test: retired slug both forms, fake `/guides/no-such-guide/`, `/guides/bradenton-vs-sarasota`, live `/guides/booking-direct-vacation-rentals/`
- commands to run: `node --test scripts/enforcement/seo-structure.test.js`, `npm run build`, `npm run verify:redirects`
- regression risks to watch: restoring `301!` on guide index.html; putting retired-slug rules below `/guides/:slug`; rewriting booking-direct copy

## Done When

- old book-direct slug is a single 301 to the live 200 page,
- a fake `/guides/no-such-guide/` is 404 after deploy,
- `/guides/bradenton-vs-sarasota` still 301s once to the slashed 200,
- PR open, not merged (Sawyer/CoS merges).

## Not In Scope

- merging or deploying,
- new guide pages or copy,
- rewriting `booking-direct-vacation-rentals`,
- owner-money URLs,
- broader SEO expansion.
