# Brief: Homepage Guide Card Freshness

## Content Gate Inputs

- persona: Gulf Coast traveler arriving through the homepage and choosing which planning guide to open first.
- primary keyword: Seascape Vacations homepage
- secondary keywords: Bradenton vs Sarasota, Anna Maria Island vs Siesta Key, Bradenton Sarasota vacation rentals, Anna Maria Island vacation rentals
- audience pattern: homepage visitor who needs a trustworthy handoff into the two refreshed comparison guides before choosing a stay base.
- proof source: `docs/status/content-decay-patrol.md` generated 2026-06-20, `docs/briefs/2026-06-bradenton-vs-sarasota-regression-rescue.md`, `docs/briefs/2026-06-ami-vs-siesta-freshness-rescue.md`, current source pages `src/guides/bradenton-vs-sarasota.html` and `src/guides/anna-maria-island-vs-siesta-key.html`, and PR #395 checks after the June 20 comparison-guide rescue.
- required internal links: /guides/bradenton-vs-sarasota/, /guides/anna-maria-island-vs-siesta-key/, /guides/
- CTA target: keep the homepage guide cards pointing to the two refreshed comparison guides and the guide hub.
- anti-claims: no rank recovery claim, no AI citation claim, no new homepage positioning claim, no homepage redesign, no broad statement that all guides are current.

## Experiment And Readback Contract

- hypothesis: replacing stale homepage guide-card labels with labels that match the two refreshed guide pages should remove a stale trust signal without changing homepage intent or layout.
- primary event: homepage guide-card click into `/guides/bradenton-vs-sarasota/` or `/guides/anna-maria-island-vs-siesta-key/`
- guardrail event: homepage hero, featured property markup, guide links, and visual baseline stay intact.
- entry criteria: `docs/status/content-decay-patrol.md` generated 2026-06-20 flags `/` for dated proof labels, while the two linked guide pages were refreshed and verified in the same PR.
- readback window: first 7 complete days after deploy once analytics covers the homepage guide-card click window.
- decision rule: keep if homepage guide-card clicks and guide engagement do not drop; if flat, leave the label cleanup because it removes a stale claim; if worse, inspect homepage visual/CTA hierarchy before reverting labels.

## Gate 0 Search Block

| Field | Required answer |
| --- | --- |
| Target query family | Homepage handoff into `Bradenton vs Sarasota` and `Anna Maria Island vs Siesta Key` guide queries. |
| Searcher intent | Brand/homepage visitor using Seascape's guide cards to choose the next planning page. |
| Current Seascape URL | `/`. |
| SERP observed date | 2026-06-20 |
| SERP stale after | 2026-06-27 |
| Current proof | `docs/status/content-decay-patrol.md` generated 2026-06-20 flags `/` for stale `Updated March 2026` guide-card labels. The linked guide pages were refreshed on 2026-06-20 in `src/guides/bradenton-vs-sarasota.html` and `src/guides/anna-maria-island-vs-siesta-key.html`; PR #395 local and GitHub checks passed on 2026-06-20 after those rescues. |
| Top visible competitors | Not a new external SERP attack lane. The source change is limited to homepage internal guide-card freshness after the linked comparison-guide SERPs were handled in their own active briefs. |
| Competitor angle | No competitor-page angle is being copied or introduced. The homepage should simply stop showing stale March labels on links to June-reviewed comparison pages. |
| Seascape gap | The homepage still advertised two refreshed comparison guides with stale `Updated March 2026` labels, which undercuts the June 20 rescue work and leaves the content-decay patrol with a high-priority homepage finding. |
| Search fit | The homepage is the right source to fix because the stale labels live in `src/index.njk`; the conversion handoff remains the existing comparison guide URLs, not a new page. |
| Local/GBP proof | Not applicable because this edit is homepage guide-card freshness, not map-pack or local business profile work. |
| AEO/readback note | AEO impact is not proven. The cleanup keeps the homepage-to-guide path consistent with the refreshed guide pages while waiting for analytics readback. |
| Recommended action | Change only the two homepage guide-card meta labels from stale March language to `Reviewed June 2026`, regenerate the content-decay patrol, and verify homepage build, content lint, links, JSON-LD, release gate, and visual proof if the homepage baseline changes. |

## Release Gate Checklist

- source files likely to change:
  - `src/index.njk`
  - `docs/status/content-decay-patrol.md`
- routes to smoke test:
  - `/`
  - `/guides/bradenton-vs-sarasota/`
  - `/guides/anna-maria-island-vs-siesta-key/`
  - `/guides/`
- commands to run:
  - `npm run lint:content`
  - `npm run build`
  - `npm run verify:jsonld`
  - `npm run verify:links`
  - `npm run seo:decay -- --as-of 2026-06-20`
  - `npm run test:visual`
- regression risks to watch: homepage visual baseline drift, stale label residue, broken guide-card links, or inflated freshness language.

## Done When

- homepage guide cards match the June-reviewed status of their linked guide pages
- content-decay patrol no longer flags `/` as a high-priority stale-label finding
- verification commands pass or a blocker is named
