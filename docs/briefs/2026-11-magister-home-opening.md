# Homepage rental-offer clarity

- lifecycle: completed
- task scope: Clarify the existing homepage opening and title, preserving the existing phone layout. Magister item 27237de4-52a6-4c35-bdc8-de2be30e0bba. Sawyer approved publication of PR #994 on November 17, 2026.
- completion or successor: PR #994 merged as 55b3c74f2a7007c578a987ed5333f591883b5af6; published and verified November 17, 2026 at 21:05 Eastern. Production revision 9f8e369ac327cd1db91840d4ea035e71b97efae9 contains the merge.
- source files likely to change: `src/index.njk`, `scripts/recovery/assert-live-smoke.js`, `scripts/enforcement/ai-discovery-schema.test.js`; existing title assertion follows the requested title.

## Content Gate Inputs

- persona: A group organizer choosing a Gulf Coast vacation home.
- primary keyword: Bradenton and Sarasota private-pool vacation homes; existing homepage intent.
- secondary keywords: Bradenton vacation rentals, Sarasota vacation rentals.
- audience pattern: Guests need to recognize the rental offer and actual home locations before comparing homes.
- proof source: Current Site main 2f3afe2d; `src/_data/properties-fallback.json`, `src/_data/properties.js`, `src/index.njk`; Magister's saved homepage-opening draft revision edad127c-f370-4cd3-b21f-1703a85ab9b1, retrieved November 17, 2026 Eastern time.
- required internal links: /properties/, /properties/dockside-dreams/, /properties/the-oasis/, /properties/sarasota-luxe/
- CTA target: Existing home detail links and `/properties/`; dates and guest controls remain unchanged.
- anti-claims: No island inventory, universal waterfront/hot-tub/heated-pool claims, conventional-pool promise for every home, prices, availability, travel times, ranking or booking-lift claim.

## Why This Task

The current Magister task identifies an unclear homepage opening. Its hosted agent saved a draft but could not check out the large production repository. This local continuation resolves that limitation. Desktop currently names the offer only in a small eyebrow; the phone layout hides the hero and begins with filters and a home count. The draft makes the desktop paragraph explicit and puts the same offer immediately above phone home cards, using the existing status text treatment. Keep the current expressive H1 and layout: the saved draft's much longer H1 would require a separate typography/layout decision.

Revenue lever: suitable direct-book home discovery. Proof surface: rendered opening, preserved home/date links and synthetic guest journeys. Owning repo: Site. What waits: other Magister page tasks; no new guide, design overhaul or experiment activation.

## Gate 0 Search And Attack Receipt

| Field | Evidence and decision |
| --- | --- |
| Target query family | Bradenton Sarasota private-pool vacation homes. |
| Searcher intent | Compare whole homes, locations and amenities before choosing dates. |
| Current Seascape URL | https://seascape-vacations.com/ |
| SERP observed date | 2026-11-17 |
| SERP stale after | 2026-11-24 |
| Current proof | November 17 source/readback at 2f3afe2d and matching desktop/phone base screenshots. Magister finding channel.geo.finding.0 is a copy hypothesis, not measured causation. |
| Top visible competitors | Seabreeze Signature Stays, Florida Rentals and Vrbo appeared in the bounded web query; no Google rank or ordered SERP position is inferred. |
| Competitor angle | Seabreeze's live homepage directly identifies Bradenton vacation homes and private pools, then links to homes and dates. |
| Visual/format gap | No new format needed. Reuse Seascape's existing desktop intro and phone status paragraph. |
| Seascape gap | Phone hero is hidden; phone opening lacks a plain statement of the rental offer and both cities. |
| Search fit | Homepage verifies the Seascape brand and actual locations, then passes guests to existing properties; specific pool collections remain canonical for their narrower intent. |
| Local/GBP proof | Property data identifies Bradenton and Sarasota. No GBP edit or map visibility claim. |
| AEO/readback note | Visible rental-offer clarification only; no claim of new AI mentions, citations or recommendations. |
| Recommendation | Prepare title and opening copy, preserve H1 composition, links, metadata description, schema, property facts and booking behavior; hold publication for Sawyer. |
| Attack status | completed |
| Query variants inspected | Bradenton Sarasota private pool vacation homes. |
| SERP source | Web search on November 17, 2026; bounded discovery, not a Google rank measurement. |
| Competitor URLs inspected | https://www.seabreezesignaturestays.com/ read November 17. |
| Content gap and Seascape answer | State private-pool vacation homes in Bradenton and Sarasota where guests can actually see it on desktop and phone. |
| Design/format strategy | Existing Waterline components, fonts, images and controls; copy-only revision with wrapping checked at phone widths. |
| Seascape proof available | Canonical property cities and existing private-pool home pages. The offer describes the collection, not an assertion that all homes have identical pool types. |
| Tools/plugins used | Magister plan/brand/draft reads; local OpenSEO list_projects, get_project_context, list_reports and get_report; free web query and competitor read; Compound Writing line edit with context and AI-residue checks. |
| Decision and reason | Draft one existing-page clarity improvement; no new paid checks, broad audit or SEO expansion. |

## Boundary Proof Before Implementation

Must preserve every existing anchor and tracking attribute, date/guest controls, property identity and photos, schema, description, H1, CSS and scripts. Expected offer and locations come from the task and canonical inventory, independently of the proposed copy. Check the built title, desktop paragraph and visible phone offer; use the old build as the wrong case. Check filters still update the home count without deleting the offer. Baselines stay unchanged until Sawyer approves.

## Editorial And Evidence Notes

Draft the copy: use the saved title; state the rental offer in one desktop sentence and one phone line. Remove internal wording: no process, claims of lift or methodology in reader text. Check voice and specificity: keep the current H1, local-team warmth and the two actual cities. Compound Writing cw-line-edit and cw-ai-check apply the Site voice and source limits, removing the saved draft's redundant Gulf Coast sentence rather than adding unverified hospitality claims. Independent Voice Editor approval is required before handoff.

Local OpenSEO report 06315225-b08e-46b5-8f4d-7d493b88d84a, updated November 15 and retrieved November 17, supports improving existing rental pages rather than adding duplicate pages. It does not establish this homepage's current rank or lift. No paid research or new collection ran.

## Release Gate And Review

Run brief/content checks and full release verification, synthetic desktop/phone guest journeys, and direct phone filter/count checks. Capture base/candidate Playwright screenshots at matching desktop/phone viewports with identical fixture data and page state; embed both pairs directly in the PR and inspect their rendered images. Keep the PR draft while preparing proof. No source merge or publication before Sawyer reviews this draft.

## Not In Scope

The pre-existing mobile-home baseline mismatch, screenshot-baseline regeneration, other pages, hero restyling, live settings, pricing, sends, paid checks and new schedules.

## Release Dependency Readback — November 17, 2026

Sawyer requested clearing the separate owner-fee evidence blocker and finishing release checks. PR #989 merged as 1ccb3e082d168f88d9cf4fadd16f7d2a4a19a2d5 and issue #990 closed. That verified main revision was integrated, and the owner-proof freshness check passed. Homepage source, styles and both homepage screenshot baselines were unchanged by that integration. Publication approval was pending at that checkpoint and was subsequently granted. The explicit source-file heading above lets the content gate identify this brief when the merge temporarily includes upstream briefs.

## Publication Proof — November 17, 2026

Sawyer: “Yes, publish the homepage update in PR #994 through the normal review and release workflow, then verify it on the live site.” All three required checks and current-head review passed at 17eb63764f0f52eadc492776bfce6f885ad8616c; original Voice and Spec reviews cover the unchanged material copy. The four desktop/phone before-and-after images remain embedded in PR #994.

Publish Production run 44220476326 succeeded. Netlify production deploy 6afd07a37e3e3c5b3bb19690 is ready and is the site's published deploy, at 2026-11-18T02:05:34.338Z (November 17, 21:05 Eastern). Its revision 9f8e369ac327cd1db91840d4ea035e71b97efae9 contains the PR #994 merge. The consolidated release also contains separately merged #985 and #995; the latter defers extra photos until a strip is touched or scrolled. Neither removes the approved homepage wording.

`verify:merge-live` exited 0. All four post-deploy commands exited 0: `verify:recovery:live`, `verify:direct-booking-events`, `verify:owner-funnel-routes` (8 routes), and `verify:recovery:entity-live` (19 routes). Direct production browser checks at 1440px, 393px and 375px read back the exact title and visible offer, with no horizontal overflow or JavaScript errors. Phone search pill, rounded filters, serif home names and clipped desktop hero remain; filters update 8 → 1 → 8 homes without deleting the offer, photo-strip extras load on interaction, the dates sheet opens/closes, and the home link reaches Dockside Dreams. Analytics requests were blocked during QA.

Record November 17 as the shipped date in the existing page ledger. Exclude launch day from any later outcome comparison; commercial impact is unmeasured. No new paid research, schedule or tracking setting was added.
