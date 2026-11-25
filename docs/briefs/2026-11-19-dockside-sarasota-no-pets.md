# Dockside Dreams and Sarasota Luxe pet-policy correction

- lifecycle: active
- task scope: Sawyer's November 19 all-surface correction for Dockside Dreams 206016 and Sarasota Luxe 135881: ordinary pets are no longer permitted for future reservations. After this, no Seascape home permits ordinary pets. Source change only, no production publish.
- persona: Guests checking whether their dog can stay.
- primary keyword: pet-friendly vacation rentals Bradenton.
- secondary keywords: Dockside Dreams pet policy, Sarasota Luxe pet policy.
- audience pattern: Confirm the selected home's policy before booking.
- proof source: Sawyer's November 19 policy in Hub draft PR uncfreak1255-code/seascape-hub#1096 (the same route as merged Hub #828 for the October Oasis and River House correction), the live Hostaway listing descriptions for both homes, which already say "No pets", and current Site source readback.
- required internal links: /properties/, /guides/
- CTA target: Existing exact-listing booking destinations.
- anti-claims: No ordinary-pet approval at any Seascape home; no blanket denial of service or assistance animals; no new fees, reservation changes, capacity changes or booking-lift claims; no claim that the Hub policy is merged until #1096 is.

## Source and copy scope

Canonical fallback pets text and amenity tags for the two homes; cached-provider pet tags for only those two exact identities; shared property inquiry copy for those IDs; pet-friendly Bradenton stay page (title, description, h1, intro, FAQs, highlights, geo intro; no matching homes); other stay-page sentences that call either home pet-friendly (waterfront, dock, large-group, Sarasota arts, luxury Sarasota, family AMI); the pet guide and Bradenton guide FAQs that pointed dog owners to Seascape homes. FAQ JSON-LD and AI discovery inherit canonical facts. Regenerate property surfaces and extend the existing live-smoke assertions to both homes. Keep CSS, routes, capacity, fees, pricing and booking destinations intact. The pet-friendly Bradenton stay page keeps its URL and its existing noindex.

Draft the copy: state that pets are not permitted and preserve the existing service-animal welcome without a pet fee. Remove internal wording: no approval provenance or software names in guest copy. Check voice and specificity: use the actual home names and direct restriction; independent Voice Editor verdict recorded before publication.

## Gate 0 — bounded truth correction

| Field | Answer |
| --- | --- |
| Target query family | Bradenton pet-friendly vacation rentals with a private pool |
| Searcher intent | Find a home that actually permits the guest's dog |
| Current Seascape URL | /stays/pet-friendly-vacation-rentals-bradenton/ |
| SERP observed date | 2026-10-12 |
| SERP stale after | 2026-10-19 |
| Current proof | November 19 Hub #1096 policy and November 19 current-source mismatch |
| Top visible competitors | Anchor Down pet-friendly rentals; HomeToGo Bradenton pets-allowed collection; BringFido Bradenton rentals |
| Competitor angle | Explicit pet eligibility, fenced yards and fees |
| Visual/format gap | Existing FAQ and property layout answer the decision; no redesign needed |
| Seascape gap | Dockside Dreams and Sarasota Luxe are still described as dog-eligible despite the approved no-pets policy |
| Search fit | Keep the existing noindexed collection URL and state the policy directly; do not retire, redirect or change indexation here |
| Local/GBP proof | Not applicable: no business-location or local-service claim changes |
| AEO/readback note | Visible FAQs and FAQ schema must agree; no citation-lift claim |
| Recommendation | Correct current inventory eligibility without expanding the cluster |
| Attack status | completed |
| Query variants inspected | Bradenton pet friendly vacation rentals private pool |
| SERP source | Live web search October 12, 2026 |
| Competitor URLs inspected | https://www.anchordownvacationrentals.com/pet-friendly-rentals/ |
| Content gap and Seascape answer | Remove both homes from dog-eligible inventory and state that no Seascape home permits ordinary pets |
| Design/format strategy | Keep existing FAQ, property layout and stay cards; no CSS changes |
| Seascape proof available | Sawyer's exact-ID correction in Hub #1096 and live Hostaway descriptions |
| Tools/plugins used | Source readback, focused cached-policy regression, property-surface regeneration |
| Decision and reason | Proceed with the authorized truth correction because current copy permits dogs at two homes that no longer allow them |

The SERP evidence is the October 12 observation from the Oasis and River House brief, reused and now stale; this correction was not re-observed because it removes claims rather than adding search-facing content. The competitor URLs above informed answer format only in October; they do not establish Seascape property facts.

## Release boundary

Hostaway and channel content readbacks are separate from website source proof. Do not dispatch Publish Production, advance production, change workflow settings or treat a source merge as live proof; the daily publisher ships it. Visual baselines for the four affected property pages (desktop and mobile Dockside Dreams and Sarasota Luxe) are generated by the repository's visual workflow, not by this change.

## Follow-up (2026-11-24): catalog "Ask us" prompt

The live-site check after publication found that the /properties/ catalog prompt "Boat size, a dog coming along, or who sleeps where" still invited dog questions, though no Seascape home permits ordinary pets. Sawyer approved a fix ("Fix 1 first"). That single sentence in `src/properties/index.njk` now reads "Boat size, trailer parking, or who sleeps where." Trailer and vehicle fit is already a real pre-booking question on the Dockside Dreams page. No other copy, route, CTA or style changes.
