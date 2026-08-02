# Brief: Noindex Consistency And Asset Integrity Guards

## Content Gate Inputs

- persona: not a reader-facing batch. The only visible-copy effect is the removal of related-stay cards and one directory line that pointed at pages excluded from the index.
- primary keyword: none - this batch adds enforcement and removes internal references; it publishes no new copy and targets no query.
- secondary keywords: none
- audience pattern: internal crawl-budget and link-equity hygiene, not a search-intent change.
- proof source: live GSC inspection receipts 2026-07-27 (`seascape-analytics/tmp/verify-2026-07-27-*.md`), the 2026-07-27 test-gap register, and adversarial review of the design-lint and lastmod guards on 2026-07-28.
- required internal links: /stays/anna-maria-island-vacation-rentals/, /stays/bradenton-vacation-rentals-near-beaches/
- CTA target: none added, moved, or removed. No tracked event contract changes.
- anti-claims: no ranking, indexing, traffic, or revenue claim; no property-fact change; no new page; no owner fee/revenue/proof claim; no title or meta rewrite.

## Required Internal Link Map

- src/_data/seoPages.json: /stays/anna-maria-island-vacation-rentals/, /stays/bradenton-vacation-rentals-near-beaches/

## Authorized Source Files

- src/_data/seoPages.json
- src/llms.txt
- scripts/enforcement/noindex-consistency.test.js
- scripts/enforcement/asset-integrity.test.js
- scripts/design/design-lint.js

## What Changed And Why

Three surfaces were pointing internal signals at pages that `seoGovernance.staysNoindexSlugs`
excludes from the index. Every such reference spends crawl budget and link equity on a
destination that cannot rank. The same failure already shipped once and was hand-fixed on
2026-07-24 when redirects were found 301-ing into noindexed pages.

- 15 `relatedStaySlugs` references removed from 15 indexable stay entries. Every affected
  page keeps at least four related stays, so no page loses its related-stay module.
- 1 directory line removed from `src/llms.txt`, which exists to point AI crawlers at
  canonical content and was listing a noindexed page. The line sits outside the
  `## Properties` block that `npm run property:truth:regen` rewrites, so it is
  hand-maintained and safe to edit directly.

Guide BODY links to noindexed stays are reader copy and are deliberately NOT changed here.
They are pinned in `KNOWN_GUIDE_NOINDEX_LINKS` so they are visible rather than silently
tolerated, and they need their own content batch with the voice order.

## Experiment And Readback Contract

- hypothesis: none. This is hygiene and enforcement, not an experiment. No lift is claimed.
- primary event: none.
- guardrail event: route integrity, canonical integrity, JSON-LD validity, and the existing
  related-stays rendering on all 15 affected pages.
- entry criteria: 15 noindexed `relatedStaySlugs` references and 1 noindexed `llms.txt`
  link measured on `origin/main` at 25fbc905.
- readback window: none required. Success is structural and asserted by the new tests.
- decision rule: keep. Revert only if a related-stays module renders empty or a route breaks.

## Gate 0 Search Block

| Field | Required answer |
| --- | --- |
| Target query family | None. No page's target query changes. |
| Searcher intent | Unchanged on every affected page. |
| Current Seascape URL | 15 stay collection routes plus `src/llms.txt`; all keep their existing URLs. |
| SERP observed date | Not applicable - no SERP-facing change. |
| SERP stale after | Not applicable. |
| Current proof | Live GSC 2026-07-27 confirms the noindexed set is excluded; internal references to them are pure equity leak. |
| Top visible competitors | Not applicable to an internal-linking hygiene change. |
| Competitor angle | Not applicable. |
| Visual/format gap | None. Related-stay modules keep rendering; only the count of cards changes on 15 pages. |
| Seascape gap | Internal signals contradicted the indexing policy, and nothing compared the two. |
| Search fit | Existing URLs are correct. Nothing is created, retired, or re-pointed. |
| Local/GBP proof | Not a local-pack route. |
| AEO/readback note | `llms.txt` is an AI-crawler surface; removing a noindexed entry makes it consistent with what Google is told. |
| Recommended action | Remove the contradicting references and add machine checks so the class cannot return. |

## Enforcement Added

- `noindex-consistency.test.js` - relatedStaySlugs, `llms.txt`, `_redirects` targets, rehomeTo
  redirect parity, and guide links (pinned, shrink-only). Falsified in four directions.
- `asset-integrity.test.js` - tracked images must contain valid image data for their type.
  Written because a 40-byte corrupt `anna-maria-island-og.jpg` reached main on 2026-07-28 and
  rode through three merges before #495 restored it; no existing gate inspects binary content.
  Verified against the real corrupt blob.
- `design-lint.js` hardening from adversarial review - coverage floor, palette-widening
  integrity check, alpha/4-digit hex detection, default-presentation emoji ranges, and
  unquoted style attributes. Each verified in both directions.
