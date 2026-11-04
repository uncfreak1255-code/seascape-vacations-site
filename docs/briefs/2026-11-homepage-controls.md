# Selected homepage clarity and controls

- lifecycle: active
- persona: The person arranging a shared Gulf Coast stay.
- primary keyword: Bradenton and Sarasota vacation rentals (existing homepage intent; no search expansion).
- secondary keywords: vacation homes with private pools (existing intent).
- audience pattern: Preview a real home, keep dates and guests, open its details.
- proof source: Sawyer's November 3 selected local candidate and chair-cleanup instruction; canonical properties-fallback.json; original Oasis Hostaway photography and reviewed cosmetic derivative.
- required internal links: /properties/, /guides/, /properties/the-oasis/
- CTA target: The pictured home's existing property route, with trip kept.
- anti-claims: No new amenities, prices, availability, booking-lift or true 4K claim. No deployment approval.

## Approved scope

Implement `docs/design/homepage-controls.md`, quoting Sawyer: “lets go with this one. ask matt and get ready for deployment.” His scope clarification names `oasis-clarity/candidate-preview.html?variant=after&concept=controls&capture=1`. Preserve prior requirement “can you remove the water spots on the lounge chair”. Source scope: src/index.njk, homepage-only scene script, existing guest loader, arrival.css, cosmetic hero derivatives and affected tests/smoke. Gallery photos, fonts, native form and all SEO fields remain unchanged.

## Copy pass

Draft the copy: `Prev`, `Next`, `Home N of 8`, accessible `Previous featured home` / `Next featured home`. Remove internal wording: no trial/concept/approval terms reach the page. Check voice and specificity: short functional labels describe manual browsing; the ordinal comes from the actual scene list. Existing property facts and prose are preserved. Independent Voice Editor approval remains part of review.

This is an approved UI implementation, not a search-driven page or metadata expansion. No SERP research or analytics lift is asserted.

## Gate 0 Search And Attack Receipt

A bounded free public check supplies the required homepage context; this is not a measured SEO batch or a reason to expand scope.

| Field | Answer |
| --- | --- |
| Target query family | Bradenton Sarasota vacation rentals private pool homes |
| Searcher intent | Compare a real pool home and proceed to its booking details. |
| Current Seascape URL | https://seascape-vacations.com/ |
| SERP observed date | 2026-11-03 |
| SERP stale after | 2026-11-10 |
| Current proof | November 3, 2026 source e9712da3 and selected local candidate; canonical property records and original Oasis photo. No traffic or conversion lift evidence. |
| Top visible competitors | Suncoast Vacation, Florida Rentals, Seabreeze Signature Stays appeared in the bounded public result set; this is not a ranked market-share read. |
| Competitor angle | Suncoast presents private pool homes with practical per-home capacity and location. |
| Visual/format gap | Selected local comparison improves factual text readability and removes the duplicate thumbnail selector. No competitor pixel superiority is inferred from extracted text. |
| Seascape gap | Sawyer found the duplicate strip confusing and preferred the larger postcard type. |
| Search fit | Preserve the existing homepage intent and metadata; the conversion remains the correct home's detail/booking path. |
| Local/GBP proof | Not applicable: no GBP, address, service area or local claim changes. |
| AEO/readback note | No AI visibility claim or machine-readable surface changes; analytics outcomes remain unmeasured. |
| Recommendation | Implement the approved UI candidate and hold publication. |
| Attack status | completed |
| Query variants inspected | Bradenton Sarasota vacation rentals private pool homes (one bounded query; no wider keyword batch). |
| SERP source | Free web search observed November 3, 2026; no paid OpenSEO call. |
| Competitor URLs inspected | https://www.suncoastvacation.com/homes/ |
| Content gap and Seascape answer | The work addresses the demonstrated duplicate-selector confusion, without adding search copy or unsupported amenities. |
| Design/format strategy | Fontjoy contrast/relationship principles applied to existing Instrument Serif and Poppins; selected B controls preserve the immersive hero and readable cards. Reference https://fontjoy.com/pairing/ inspected November 3. |
| Seascape proof available | Real per-home photos, named captions, canonical capacity and working trip links. |
| Tools/plugins used | Public web read, existing Site build and Playwright; no paid research. |
| Decision and reason | Proceed with the selected bounded UI; preserve search and booking contracts, and await deployment approval. |
