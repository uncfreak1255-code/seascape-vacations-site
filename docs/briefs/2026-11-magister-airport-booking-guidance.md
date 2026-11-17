# Brief: Airport guide — mainland booking guidance

- lifecycle: active
- task scope: November 17, 2026 Sawyer request: "Do the next most useful task from the plan. Get the page update ready for me to review, and ask before publishing." Prepare the plan's airport-guide task locally. Clarify the early rental paragraph and add one catalog link; retain the existing three collection links and their tracking. No publication is authorized.
- completion or successor: local draft pending Sawyer review; source publication and live verification remain separate.

## Content Gate Inputs

- persona: a traveler flying into SRQ who has not chosen a vacation home
- primary keyword: SRQ airport to Anna Maria Island (unchanged)
- secondary keywords: Sarasota airport to Anna Maria Island; Bradenton and Sarasota vacation homes
- audience pattern: compare transport, confirm where the rental actually is, then choose a home
- proof source: Site origin/main 4c542004, November 17, 2026: the airport guide's guideKit already states that Seascape homes are on the mainland in Bradenton and Sarasota; properties-fallback.json and the live /properties/ catalog confirm the destinations. Live guide read November 17, 2026.
- required internal links: /properties/, /stays/anna-maria-island-vacation-rentals/, /stays/bradenton-vacation-rentals-near-beaches/, /stays/vacation-rentals-near-anna-maria-island/
- CTA target: existing /properties/ catalog; existing collection destinations retained
- anti-claims: no managed home placed on Anna Maria Island; no new travel time, distance, availability, price, amenity, savings or wildlife claim; no new booking route

## Why This Change

The early rental links use island-focused labels without identifying Seascape's mainland locations. The lower kit already explains the distinction. Bring it beside the earlier links and offer a clear catalog action before readers choose transport. This is a source-backed location/copy repair, not a ranking rescue, new layout or new live experiment.

Revenue lever: direct bookings. Proof surface: rendered local paragraph, current catalog locations, preserved destinations and tracking. Owning repo: seascape-vacations-site. What waits: new pages, metadata/ranking rescues, new paid research and publication.

## Scope And Invariants

Only src/guides/srq-airport-to-anna-maria-island.html reader copy beside the rental-car section changes. Preserve the title, metadata, H1, dates, weather/transport facts, JSON-LD, CSS, shared components, stay-box home and all existing hrefs/event attributes. Add the catalog link using the existing guide_book_direct_click contract.

Wrong case: island-focused labels with no adjacent mainland qualification, or a catalog CTA reaching a new/unverified route. Verify the location statement and exact existing destination in the built page. Confirm the front matter, JSON-LD and existing hrefs remain unchanged.

## Gate 0 — existing evidence, accuracy repair

Use the airport-only receipt in docs/briefs/2026-11-top-guides-home-box-and-check-strip.md (observed November 15, valid through December 15) as dated context. It reports result titles/URLs, not Google positions. This change adds no ranking or competitor claim and does not reopen that guide-box experiment. The current defect evidence is the November 17 source comparison between the early rental paragraph and the guideKit's mainland statement.


| Field | Required answer |
| --- | --- |
| Target query family | srq airport to anna maria island; sarasota airport to anna maria island |
| Searcher intent | Informational with a trip already planned: time, cost and the best way from the airport |
| Current Seascape URL | https://seascape-vacations.com/guides/srq-airport-to-anna-maria-island/ |
| SERP observed date | 2026-11-15 |
| SERP stale after | 2026-12-15 |
| Current proof | November 17, 2026 source and live catalog check: all eight records name Bradenton or Sarasota; the lower airport guideKit says mainland, but the early collection links lack that qualification. November 15 result-title evidence below is reused as dated context, not a new ranking read. |
| Top visible competitors | rome2rio.com (many route pages), girlonazebra.com, viatovia.com |
| Competitor angle | From result titles only: route-planner pages and "how to get to Anna Maria Island" travel posts |
| Visual/format gap | Not assessed: the search gives titles, not page layouts; no format claim is made |
| Seascape gap | Early rental links lack an adjacent mainland location statement and an explicit catalog action; the existing lower kit already supplies both locations. |
| Search fit | Title, description, H1, body answers and JSON-LD are unchanged |
| Local/GBP proof | Not applicable: no local-pack or Google Business change |
| AEO/readback note | JSON-LD is unchanged. Read the events in the readback contract after publish |
| Recommendation | Clarify the early rental paragraph and add the existing /properties/ destination, preserving all collection links and their event attributes. |
| Attack status | completed |
| Query variants inspected | SRQ airport to Anna Maria Island how to get there drive time cost |
| SERP source | Web search, observed 2026-11-15 (titles and URLs only) |
| Competitor URLs inspected | https://girlonazebra.com/how-to-get-to-anna-maria-island/; https://viatovia.com/blog/sarasota-bradenton-airport-to-anna-maria-island |
| Content gap and Seascape answer | Tell readers that Seascape homes are in Bradenton and Sarasota, not on Anna Maria Island, before they plan transport to the selected home. |
| Design/format strategy | Copy-only paragraphs in the existing rental-car section; no CSS, heading, component, schema or metadata change. |
| Seascape proof available | Current properties-fallback.json city values; live /properties/ catalog; existing guideKit location statement. |
| Tools/plugins used | Saved local OpenSEO context/reports; existing November 15 airport brief; current source and live catalog reads; local build and browser inspection. |
| Decision and reason | Prepare a local location-clarity and booking-guidance draft for Sawyer; do not publish or claim ranking/booking lift. |

## Editorial And Review

Draft the copy, remove internal wording, then check voice and specificity against docs/style/. One independent targeted reviewer covers factual scope, copy and release evidence. No new design treatment.

## Proof Before Human Review

- Build the current task branch and run content lint.
- Read the complete source diff; compare metadata and all existing hrefs/event attributes with the base.
- Inspect the changed section on desktop and phone, with no overflow, broken assets or blocking JavaScript errors.
- Verify all linked live destinations are reachable; use no checkout, form submit, live test traffic or paid lookup.
- Keep a clean local checkpoint, screenshots and a local preview for Sawyer.

## Done When

Local page update is ready for review with accurate mainland guidance, an explicit catalog action, retained existing destinations, passing available focused checks and rendered evidence. Publishing requires Sawyer's approval. The original marketing plan's live-page Done conditions remain pending until approved publication and live readback.

## Not In Scope

Other guides, new schema, title/meta rewrites, new tracking implementation, changing the November 15 home-box test, deployment, sends and spending.
