# Brief: Preserve booking trips with the current design

- persona: Guest returning to home selection after researching a stay
- primary keyword: Seascape vacation rentals
- secondary keywords: Bradenton vacation rentals, Sarasota vacation rentals
- audience pattern: Existing guest traffic carrying dates and group size to booking
- proof source: PR 552 trip-continuity tests and published release at 2ccbfce8 on September 8, 2026
- required internal links: /properties/, /guides/

## Scope and proof

This is the functionality-only release requested by Sawyer in PR #552. Preserve
valid dates and group size through existing guest links, including a return to
the homepage. Keep the current design, copy, property facts, and search metadata.
The homepage edit only declares the existing tracking script before the search
script so the shared trip validator is available during initialization.

- source files likely to change: `src/index.njk`, `src/assets/js/hero-v2.js`, `src/assets/js/conversion-tracking.js`, `src/properties/index.njk`
- revenue lever: remove lost trip selections before direct-booking handoff; no booking-lift claim
- proof surface: `tests/visual/trip-continuity.spec.js`, release checks, and live booking-link readback
- owning repo: `seascape-vacations-site`
- what stops: no redesign or additional search-page work is included in this release
- CTA target: existing catalog, property, and direct booking links
- anti-claims: URL continuity does not prove availability, price, a reservation, or increased conversion

## Gate 0 Search And Attack Receipt

This block satisfies the existing homepage-file release gate. The task is a
reproduced behavior repair, not a search expansion or competitive positioning
change. Public checks below are context only; the browser regression is the
acceptance proof.

| Field | Required answer |
| --- | --- |
| Target query family | Branded Seascape vacation-rental and direct-booking navigation |
| Searcher intent | Find a home and carry selected dates and group size into booking. |
| Current Seascape URL | https://seascape-vacations.com/ and https://seascape-vacations.com/properties/ |
| SERP observed date | 2026-09-08 |
| SERP stale after | 2026-09-15 |
| Current proof | On 2026-09-08, desktop and mobile regressions reproduced homepage date loss; the corrected source passed both and retained a non-default group of six. |
| Top visible competitors | The branded query returned Seascape routes; no competitor ranking claim is made. SeaBreeze was separately inspected as local context. |
| Competitor angle | SeaBreeze exposes availability and rental browsing. No competitor feature is adopted. |
| Visual/format gap | No layout or style gap is in scope. |
| Seascape gap | The URL preserved a trip but homepage search state initialized to empty dates and eight guests. |
| Search fit | Keep the existing landing-page intent and metadata while repairing its existing booking flow. |
| Local/GBP proof | Not applicable because this repair changes no business profile or local facts. |
| AEO/readback note | No search or AI-discovery improvement is claimed; verify runtime behavior instead. |
| Recommendation | Restore validated trip values before homepage search initialization and retain current design. |
| Attack status | none found after named checks |
| Query variants inspected | Seascape Vacations Bradenton vacation rental direct booking |
| SERP source | Public web search for the named query, observed 2026-09-08; returned the homepage and catalog. |
| Competitor URLs inspected | Source check: homepage search and shared validator. SERP check: the named branded query. Competitor-page check: https://www.seabreezevacation.com/ on 2026-09-08; no competitive change is needed to resolve the source defect. |
| Content gap and Seascape answer | No copy gap; make existing selected trip values survive navigation and resubmission. |
| Design/format strategy | Preserve existing components, styles, photography, and visible copy. |
| Seascape proof available | Red/green desktop and mobile regression, validated checkout parameters, and unchanged appearance checks. |
| Tools/plugins used | Repository source, Playwright, Node tests, GitHub CI, public source reader. |
| Decision and reason | Complete the approved behavior repair; defer competitive and design work because neither is needed to fix lost trip state. |

## Release gate

- `npm run verify:release` against the final committed PR range
- `npm run test:visual`, including homepage return with six guests
- current-head independent review and GitHub checks
- Netlify published commit readback, live recovery/schema smoke, and desktop/mobile booking-link checks

The embedded Hostaway calendar is unchanged. Direct booking-page links preserve
the selected trip; calendar selection and actual availability remain Hostaway's
responsibility. Do not submit reservations, inquiries, payments, or guest messages
as part of verification.
