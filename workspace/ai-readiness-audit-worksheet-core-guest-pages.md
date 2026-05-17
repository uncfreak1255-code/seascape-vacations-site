# AI Readiness Audit Worksheet - Core Guest Money Pages

Use this worksheet for queue item 1 only.

Global gate before and after the audit:
- [x] `npm run verify:jsonld`
- [x] `npm run verify:links`
- [x] `npm run lint:content`
- [x] `npm run test`

Mark each criterion `Pass` or `Fail` for every page.
Only mark `Overall Pass` when every page-level criterion passes.

| Page | Primary query / job | Index / meta / schema pass | Clear trip-fit or booking-value statement above the fold pass | Concrete next action pass | Truthful location framing pass | Overall Pass | Overall Fail | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/` | Brand intro plus direct route into guest browsing | [x] Pass [ ] Fail | [x] Pass [ ] Fail | [x] Pass [ ] Fail | [x] Pass [ ] Fail | [x] Pass | [ ] Fail | Pass - homepage still reads like a brand/front-door surface. The gap from phase 2 is off-page AI/entity visibility, not reader copy. |
| `/properties/` | Browse catalog and narrow into the right collection or home | [x] Pass [ ] Fail | [x] Pass [ ] Fail | [x] Pass [ ] Fail | [x] Pass [ ] Fail | [x] Pass | [ ] Fail | Pass on this branch - the tightened hero and route cards now state the near-AMI tradeoff early and route users into the right stay collection. |
| `/stays/book-direct-anna-maria-island/` | Save vs OTA and move into direct-booking inventory | [x] Pass [ ] Fail | [x] Pass [ ] Fail | [x] Pass [ ] Fail | [ ] Pass [x] Fail | [ ] Pass | [x] Fail | Fail - the value story is clear, but the page still sounds too on-island for inventory that is actually near AMI. |
| `/stays/anna-maria-island-vacation-rentals/` | Find near-AMI inventory with clear value and fit | [x] Pass [ ] Fail | [x] Pass [ ] Fail | [x] Pass [ ] Fail | [ ] Pass [x] Fail | [ ] Pass | [x] Fail | Fail - the page explains the tradeoff, but the AMI-first framing still overshoots what the homes literally are. |
| `/stays/bradenton-vacation-rentals-near-beaches/` | Find Bradenton homes that keep beach access easy | [x] Pass [ ] Fail | [x] Pass [ ] Fail | [x] Pass [ ] Fail | [x] Pass [ ] Fail | [x] Pass | [ ] Fail | Pass - this page already says the honest value-base story that phase 2 rewarded. |
| `/stays/sarasota-vacation-rentals-with-pool/` | Find Sarasota pool inventory with a clear next booking path | [x] Pass [ ] Fail | [ ] Pass [x] Fail | [x] Pass [ ] Fail | [x] Pass [ ] Fail | [ ] Pass | [x] Fail | Fail - the page is truthful and routable, but the first-screen answer is too generic for the neighborhood-led SERP and AI framing. |

## Criterion Rules

### Index / Meta / Schema Pass
- Page ships valid canonical, indexability, description, and matching structured data.
- Page does not introduce unsupported FAQ or stale price / review trust claims.
- Source of truth is the current validator and enforcement suite, not eyeballing alone.

### Clear Trip-Fit Or Booking-Value Statement Above The Fold Pass
- User can understand the page's answer in the first screen without scrolling through generic inventory copy.
- Stay pages explain why this booking path or trip fit is useful in plain guest language.
- Catalog and homepage surfaces should not behave like generic directories.

### Concrete Next Action Pass
- Page gives the visitor a direct next move such as checking dates, viewing a property, or choosing a tighter stay collection.
- CTA path is specific, not a dead-end "browse more" escape.
- Booking or stay-routing action should align with the page's intent.

### Truthful Location Framing Pass
- AMI-adjacent pages clearly state when homes are near the island rather than on-island or on-beach.
- No invented inventory promises, included amenities, or geographic shortcuts.
- Claims about proximity, beaches, and booking value should match visible copy and structured data.

## Fast Notes Template

Use short notes like:
- `Pass - above-the-fold answer is clear`
- `Fail - CTA drops user into generic browsing`
- `Fail - near-island tradeoff not stated early enough`
- `Fail - schema says more than visible copy proves`
