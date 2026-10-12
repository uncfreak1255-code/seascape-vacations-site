# Oasis and River House pet-policy correction

- lifecycle: active
- task scope: Sawyer's October 12 all-surface correction for The Oasis 189511 and River House/Riverview 135880; source publication only, no unrelated production batch release.
- persona: Guests checking whether their dog can stay.
- primary keyword: pet-friendly vacation rentals Bradenton.
- secondary keywords: The Oasis pet policy, River House pet policy.
- audience pattern: Confirm the selected home's policy before booking.
- proof source: Sawyer's October 9 policy in merged Hub #828, current Hub property records and guest guidance, and October 12 source readback.
- required internal links: /properties/, /properties/dockside-dreams/, /properties/the-oasis/, /properties/river-house/
- CTA target: Existing exact-listing booking destinations.
- anti-claims: No ordinary-pet approval at either affected home; no blanket denial of service or assistance animals; no new fees, reservation changes, other-home policy changes or booking-lift claims.

## Source and copy scope

Canonical fallback pets and amenity tags; cached-provider pet tags for only the two exact identities; shared property inquiry copy for those IDs; pet-friendly Bradenton stay matching, FAQ, highlights and intro; large-group stay sentence. FAQ JSON-LD and AI discovery inherit canonical facts. Regenerate property surfaces and update existing live-smoke assertions. Keep CSS, route, capacity, fees, pricing and booking destinations intact.

Draft the copy: state that pets are not permitted and preserve the existing service-animal welcome without a pet fee. Remove internal wording: no approval provenance or software names in guest copy. Check voice and specificity: use the actual home names and direct restriction; independent Voice Editor verdict recorded before publication.

## Gate 0 — bounded truth correction

| Field | Answer |
| --- | --- |
| Target query family | Bradenton pet-friendly vacation rentals with a private pool |
| Searcher intent | Find a home that actually permits the guest's dog |
| Current Seascape URL | /stays/pet-friendly-vacation-rentals-bradenton/ |
| SERP observed date | 2026-10-12 |
| SERP stale after | 2026-10-19 |
| Current proof | October 9 Hub #828 policy and October 12 current-source mismatch |
| Top visible competitors | Anchor Down pet-friendly rentals; HomeToGo Bradenton pets-allowed collection; BringFido Bradenton rentals |
| Competitor angle | Explicit pet eligibility, fenced yards and fees |
| Visual/format gap | Existing FAQ and matched-home cards answer the decision; no redesign needed |
| Seascape gap | The Oasis is still recommended for dogs despite the approved no-pets policy |
| Search fit | Retain the existing collection and link Dockside Dreams, the remaining Bradenton dog-with-approval option; keep its exact booking destination |
| Local/GBP proof | Not applicable: no business-location or local-service claim changes |
| AEO/readback note | Visible FAQs and FAQ schema must agree; no citation-lift claim |
| Recommendation | Correct current inventory eligibility without expanding the cluster |
| Attack status | completed |
| Query variants inspected | Bradenton pet friendly vacation rentals private pool |
| SERP source | Live web search October 12, 2026 |
| Competitor URLs inspected | https://www.anchordownvacationrentals.com/pet-friendly-rentals/ |
| Content gap and Seascape answer | Remove The Oasis from dog-eligible inventory and state the two homes' no-pets restriction |
| Design/format strategy | Keep existing FAQ, property layout and stay cards; no CSS changes |
| Seascape proof available | Sawyer's exact-ID correction in Hub #828 and current Hub guest/property canon |
| Tools/plugins used | Source readback, web search, Aside provider audit, focused cached-policy regression |
| Decision and reason | Proceed with the authorized truth correction because current copy permits pets at two homes that do not |

SERP query: `Bradenton pet friendly vacation rentals private pool`, October 12. Sources: https://www.anchordownvacationrentals.com/pet-friendly-rentals/ ; https://www.hometogo.com/f/bradenton/pets-allowed/ ; https://www.bringfido.com/lodging/rentals/city/bradenton_fl_us/ . These results informed answer format only; they do not establish Seascape property facts.

## Release boundary

Hostaway and channel content readbacks are separate from website source proof. The five already queued Site commits are not approved for publication by this correction. Do not dispatch Publish Production, advance production, change workflow settings or treat the source merge as live proof.

## Approved publication and durable source integration

Sawyer approved the four verified pet-policy screenshot updates and pet-only publication on October 12 at 14:19:47 UTC. The live-based candidate `7df3e829627e6b0aca8f4bbba047a55ff751102b` was published as Netlify deploy `6accf03ee11f1cff8d4ad780`; visible policy, inquiry, catalog, collection, schema and AI surfaces passed production checks, with service and assistance-animal exceptions retained. Workflow `38262478192` generated exactly the four desktop/mobile Oasis and River House reference screenshots.

The coordinator is authorized to finish existing Site PR #716 so the scheduled publisher cannot revert the pet correction. Reconcile current main without rewriting history and import only those four unchanged workflow-generated PNGs. Unrelated inherited Coastal/home/catalog baselines remain with their existing source owners; do not accept or regenerate them under the pet approval. Merge only after required checks and independent exact-head review pass. This source integration does not authorize dispatching Publish Production or releasing the queued backlog. Sarasota's site capacity of 12 and Hostaway capacity of 8 are intentional and outside this correction.
