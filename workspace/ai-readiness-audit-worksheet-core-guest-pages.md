# AI Readiness Audit Worksheet - Core Guest Money Pages

Use this worksheet for queue item 1 only.

Global gate before and after the audit:
- [ ] `npm run verify:jsonld`
- [ ] `npm run verify:links`
- [ ] `npm run lint:content`
- [ ] `npm run test`

Mark each criterion `Pass` or `Fail` for every page.
Only mark `Overall Pass` when every page-level criterion passes.

| Page | Primary query / job | Index / meta / schema pass | Clear trip-fit or booking-value statement above the fold pass | Concrete next action pass | Truthful location framing pass | Overall Pass | Overall Fail | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/` | Brand intro plus direct route into guest browsing | [ ] Pass [ ] Fail | [ ] Pass [ ] Fail | [ ] Pass [ ] Fail | [ ] Pass [ ] Fail | [ ] Pass | [ ] Fail | |
| `/properties/` | Browse catalog and narrow into the right collection or home | [ ] Pass [ ] Fail | [ ] Pass [ ] Fail | [ ] Pass [ ] Fail | [ ] Pass [ ] Fail | [ ] Pass | [ ] Fail | |
| `/stays/book-direct-anna-maria-island/` | Save vs OTA and move into direct-booking inventory | [ ] Pass [ ] Fail | [ ] Pass [ ] Fail | [ ] Pass [ ] Fail | [ ] Pass [ ] Fail | [ ] Pass | [ ] Fail | |
| `/stays/anna-maria-island-vacation-rentals/` | Find near-AMI inventory with clear value and fit | [ ] Pass [ ] Fail | [ ] Pass [ ] Fail | [ ] Pass [ ] Fail | [ ] Pass [ ] Fail | [ ] Pass | [ ] Fail | |
| `/stays/bradenton-vacation-rentals-near-beaches/` | Find Bradenton homes that keep beach access easy | [ ] Pass [ ] Fail | [ ] Pass [ ] Fail | [ ] Pass [ ] Fail | [ ] Pass [ ] Fail | [ ] Pass | [ ] Fail | |
| `/stays/sarasota-vacation-rentals-with-pool/` | Find Sarasota pool inventory with a clear next booking path | [ ] Pass [ ] Fail | [ ] Pass [ ] Fail | [ ] Pass [ ] Fail | [ ] Pass [ ] Fail | [ ] Pass | [ ] Fail | |

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
