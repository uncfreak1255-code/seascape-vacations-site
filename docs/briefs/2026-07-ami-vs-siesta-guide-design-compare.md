# Brief: AMI vs Siesta Key Design Compare Branch

## Content Gate Inputs

- persona: Gulf Coast travelers choosing between quiet Anna Maria Island days, Siesta Key's quartz sand and livelier evenings, larger Bradenton homes near AMI, and Sarasota Luxe for a private-pool stay in downtown Sarasota.
- primary keyword: Anna Maria Island vs Siesta Key where to stay.
- secondary keywords: Anna Maria Island or Siesta Key, AMI vs Siesta Key vacation rentals, Bradenton homes near AMI beaches, Sarasota home near Siesta Key.
- audience pattern: beach-comparison reader who wants a quick recommendation, can picture how the whole day will feel, and can move naturally from destination advice into a relevant home.
- proof source: 2026-07-21 source inspection, current county source checks for Siesta Beach and the AMI trolley, rendered desktop and mobile screenshot proof, route readback gate, and current property data for Sarasota Luxe.
- required internal links: /stays/anna-maria-island-vacation-rentals/, /stays/bradenton-vacation-rentals-near-beaches/, /stays/siesta-key-area-vacation-rentals/, /stays/anna-maria-island-beachfront-rentals/, /properties/sarasota-luxe/
- CTA target: move readers from the guide into the matching area collection or Sarasota Luxe photos and availability without breaking the existing tracked shortcut contract on the route.
- anti-claims: no ranking, booking, conversion, or AI-citation lift claim before live deploy and fresh reread.

## Why This Branch Exists

- Sawyer asked for a true alternate design so he can compare it against the current PR preview instead of debating layout theory in the abstract.
- The current route is functional, but the compare branch needs a more memorable first screen, clearer vacation choices, and a compelling Sarasota Luxe path that can lead a reader toward dates and booking.
- This branch is compare-only. It is not permission to replace the current version until rendered proof exists and Sawyer picks the winner.

## Experiment And Readback Contract

- hypothesis: a full editorial redesign with clearer vacation choices and an attractive Sarasota Luxe invitation will make the guide easier to scan and easier for Sawyer to compare against the current PR version without weakening the route's tracked transfer contract.
- primary event: rendered desktop and mobile compare proof plus preserved tracked area and property links on the route.
- guardrail event: title, canonical, schema, required internal links, and the existing AMI-vs-Siesta tracked shortcut labels remain intact.
- entry criteria: the current PR version is usable but visually flat, and the Sarasota path must make Sarasota Luxe feel desirable rather than treating it as a property-information footnote.
- readback window: local build and screenshot proof on 2026-07-21, then deploy-preview inspection before any decision to replace the current PR version.
- decision rule: keep the redesign only if it builds cleanly, passes route verification, and Sawyer prefers the compare preview; otherwise keep the current PR version.

## Gate 0 Search And Attack Receipt

| Field | Required answer |
| --- | --- |
| Target query family | `Anna Maria Island vs Siesta Key where to stay` and nearby beach-comparison variants where the real question is how the vacation will feel and which home supports it. |
| Searcher intent | Compare AMI and Siesta, then choose a relevant Seascape area or Sarasota Luxe. |
| Current Seascape URL | `https://seascape-vacations.com/guides/anna-maria-island-vs-siesta-key/`. |
| SERP observed date | 2026-07-20 |
| SERP stale after | 2026-07-27 |
| Current proof | On 2026-07-21, source inspection showed the route could support a stronger visual thesis and clearer traveler choices while keeping the existing tracked transfer contract and Sarasota Luxe path. |
| Top visible competitors | Anna Maria Island Beach Rentals' AMI-vs-Siesta guide, Passage Key Dolphin Tours' destination comparison, and TB Relo's island lifestyle comparison. |
| Competitor angle | Beach atmosphere, family fit, lifestyle, and general destination comparison. They are weaker at connecting that advice to a specific home a reader can inspect. |
| Visual/format gap | The current Seascape route answers the question but does not give Sawyer a strong design contrast or a memorable first screen built around the actual vacation. |
| Seascape gap | The page needs a clearer visual split between AMI and Siesta, stronger traveler language, and an explicit Sarasota Luxe invitation inside the comparison. |
| Search fit | The existing URL already fits the query. This branch tests a better presentation on the same route instead of opening a duplicate page. |
| Local/GBP proof | Not applicable because this branch changes no NAP, GBP, or local-pack claim. |
| AEO/readback note | This redesign may improve extractability and routing clarity, but it makes no citation or ranking claim without post-deploy proof. |
| Recommendation | Ship the compare branch to a separate preview, preserve the route's tracked shortcut labels and readback markers, and choose the winning design from rendered proof. |
| Attack status | completed |
| Query variants inspected | `Anna Maria Island vs Siesta Key where to stay`; `Anna Maria Island or Siesta Key`; `Siesta Key area vacation rentals`. |
| SERP source | Current web search observed 2026-07-20 and source reread on 2026-07-21. |
| Competitor URLs inspected | `https://annamariaislandbeachrentals.com/blog/anna-maria-island-vs-siesta-key`; `https://www.passagekeydolphintours.com/blog/anna-maria-island-vs-siesta-key`; `https://tbrelo.com/blog/siesta-key-vs-anna-maria/`. |
| Content gap and Seascape answer | The route already answers the beach question. The branch improves the design contrast and connects the advice to area collections and Sarasota Luxe without changing the URL's job. |
| Design/format strategy | Use a split-screen editorial compare, keep the tracked shortcuts, turn the top-right Sarasota Luxe card into a desire-led invitation with a date-check CTA, and keep the direct answer in the first screen. |
| Seascape proof available | Current route source, county beach/trolley sources, rendered screenshots, existing route readback gate, and property truth for Sarasota Luxe. |
| Tools/plugins used | Local source inspection, repo style gate, rendered screenshot proof, and route verification scripts. |
| Decision and reason | Build a second preview so Sawyer can compare current versus alternate design on the same route with proof instead of guesswork. |

## Cluster In Scope

- canonical winner URL: `/guides/anna-maria-island-vs-siesta-key/`
- feeder pages: none changed
- money destination: AMI stays, Bradenton near AMI stays, Siesta area stays, AMI beachfront, and Sarasota Luxe
- active lane: design compare branch for an existing winner guide

## Source And Proof Constraints

- property truth needed: Sarasota Luxe details must trace to current property data and the existing property page.
- owner proof asset needed: none.
- claims that are off-limits: any promise that the redesign improved performance before live deploy and reread.
- Seascape-specific proof: the route must keep its tracked shortcut contract and required internal links while giving Sarasota Luxe a clear, useful, booking-oriented invitation.

## Reader-Language And Claim Gate

### Failure That Triggered The Repair

- The pre-rewrite guide repeated internal phrases including `trip shape`, `stay base`, `booking path`, and `named Sarasota-side option` while `npm run lint:content` still passed.
- The same phrasing appeared in static HTML, the JavaScript recommendation selector, and the `guideConversionKit` configuration.
- The correction strengthens the existing content gate and Voice Editor. It does not add a generic marketing skill or a sixth role.

### Traveler Language To Preserve

- Anna Maria Island: slow mornings, young families, low-rise streets, trolley rides, and quiet evenings.
- Siesta Key: quartz sand, a large public beach, more restaurants, and livelier nights.
- Bradenton: more room, private-pool time, group meals, and repeated AMI beach days.
- Sarasota Luxe: four bedrooms, room for 12, a private heated pool, hot tub, outdoor kitchen, downtown Sarasota, and proximity to St. Armands.
- Every CTA should name what opens next: area homes, property photos, dates, availability, or a practical follow-up guide.

### Guest-Language Inputs

- Sarasota Luxe guest feedback consistently values room for a group of 12, a well-stocked house, pool time, an easy location, and family equipment.
- The rewrite uses those desire patterns without copying review sentences or turning individual feedback into a universal promise.
- The home should feel like part of the vacation: swimming, cooking, and spending time together after the beach.

### Claim-To-Source Inventory

| Claim | Source | Decision |
| --- | --- | --- |
| Sarasota Luxe has 4 bedrooms, 3 bathrooms, and sleeps 12 | `src/_data/properties-fallback.json` | Keep |
| Sarasota Luxe has a private heated pool, hot tub, outdoor kitchen, fenced yard, and downtown location near St. Armands | `src/_data/properties-fallback.json` | Keep |
| Sarasota Luxe is 3 miles from Lido and 6 miles from Siesta Beach | Not present in canonical fallback property data | Remove from this guide |
| Siesta Beach is known for quartz sand and has about 950 free parking spaces | Current Sarasota County source linked in the guide | Keep with source note |
| The free AMI trolley runs between City Pier and Coquina Beach | Current Manatee County Route 5 source linked in the guide | Keep with source note |
| Early-2026 rate comparisons predict a current guest's final price | Historical planning context only | Do not claim; tell readers to compare current complete prices |
| A fixed AMI-to-Siesta drive time applies to every trip | Traffic and bridge conditions vary | Remove the fixed time and mileage; describe it as a planned outing |

### Required Voice Verdict

- copywriting pass: complete — argument now begins with the vacation the guest wants and connects Sarasota Luxe to a concrete desire.
- enterprise-ui-writing pass: complete — removed process, routing, proof, and experiment language from reader-facing copy.
- humanizer pass: complete — replaced abstract labels with mornings, children, parking, restaurants, pools, cooking, and evenings.
- Voice Editor verdict: `Approved` after static, JavaScript, component, and rendered-page verification.

### Voice Editor Verdict

#### Status

- Verdict: `Approved`
- Confidence: high

#### Reader Test

- What the traveler is deciding: quiet, family-centered Anna Maria Island days versus Siesta's quartz sand, broader dining, and livelier evenings; Bradenton and Sarasota appear only when the home changes that choice.
- What feels specific and desirable: trolley rides, early nights, restaurant choice, group meals, private pools, Sarasota Luxe's hot tub and outdoor kitchen, and a direct path to photos and dates.
- What still sounds internal, generic, or over-written: none found in the final static or generated copy. Tracking labels retain the historic `Stay-base` strings because they are invisible measurement contracts, not reader copy.

#### Static And Generated Copy

- Static page copy: approved.
- JavaScript-generated copy: approved across all four preference states.
- Component-generated conversion copy: approved.

#### Required Rewrites

1. None.

#### Proof And Claim Risks

- Early-2026 rate checks remain historical context, not a current quote; the source note says so.
- Fixed Sarasota Luxe beach-mileage claims and a fixed AMI-to-Siesta drive-time promise were removed because the canonical property data and traffic conditions did not support presenting them as dependable planning facts.

### Advisory Content-Quality Rubric

| Dimension | Read | Evidence |
| --- | --- | --- |
| Information gain vs. the SERP | strong | Local operator judgment is paired with real Seascape area collections and Sarasota Luxe instead of stopping at a generic destination summary. |
| Answer-first extractability | strong | The direct AMI-versus-Siesta answer is the first body paragraph. |
| Scannable structure for AEO | strong | Quick-answer table, four preference states, short comparison cards, and aligned visible/schema FAQs. |
| Named-source statistical density | strong | Sarasota County, Manatee County, the 950-space fact, trolley endpoints, and canonical Sarasota Luxe facts are named or traced. |
| E-E-A-T signals | strong | Named reviewer, role, review date, and visible source block. |
| Freshness | strong | `dateModified` and visible review date are 2026-07-22; changing prices are labeled as context. |
| Entity + destination clarity | strong | Seascape Vacations, AMI, Bradenton, Sarasota, Siesta Key, area collections, and Sarasota Luxe are explicit. |
| Voice + proof boundary intact | strong | Reader advice leads; sources and rate limits remain below the hook. |

- Highest-leverage fixes applied: replaced internal planning shorthand everywhere, turned Sarasota Luxe into a desire-led date-check path, and removed unsupported distance promises.
- Biggest remaining citation risk: historical rate context cannot support a current price claim, so the page makes none and directs readers to current complete prices.

## Page Builder Tasks

- source files changed in this branch:
  - `src/guides/anna-maria-island-vs-siesta-key.html`
- redirect or schema work: keep existing canonical and schema family intact.
- internal-link or CTA work: preserve tracked shortcut labels, keep verdict links readable, and give Sarasota Luxe an explicit `See photos & check dates` action.
- regression proof: lint, build, links, JSON-LD, route readback verification, and desktop/mobile screenshot proof.

## Release Gate Checklist

- [x] `npm run lint:content` — 24/24 passed after the full static, JavaScript, and component-copy rewrite.
- [x] `npm run build:prod` — passed.
- [x] `npm run verify:links` — 162 pages checked, all links valid.
- [x] `npm run verify:jsonld` — 162 pages and 692 JSON-LD blocks checked.
- [x] `npm run verify:ami-vs-siesta-readback` — source markers and pending readback receipt passed.
- [x] Desktop and mobile guide proof — fresh 1440x1000 and 390x844 captures show no horizontal overflow; the Sarasota Luxe CTA lands on visible availability with `sv_guide_click_id` attribution.
- [x] Focused guide visual baseline — desktop and mobile passed 2/2 after the intentional target-baseline update.
- [x] Guide capability scenario `S04` — 1/1 passed after aligning the built-route and live-smoke markers with the July 22 rewrite.
- [ ] Full 42-route visual suite — 39/42 passed. The target mobile capture varied by 23 px between runs, and the unrelated fishing page alternated between Poppins and fallback font metrics on both breakpoints. The common cause is timing-sensitive `font-display: optional`; no unrelated baseline was changed to hide it.
- [ ] Full capability suite — the first run was 6/8 before the `S04` marker fix. The guide scenario now passes independently; unrelated scenario `S07` still expects an AI-discovery phrase that is already absent on `origin/main` and was not changed in this PR.

## Done When

- the compare branch builds cleanly, keeps the route proof markers, shows Sarasota Luxe on the Sarasota-side path, and produces a separate preview Sawyer can compare with the current PR preview.

## Not In Scope

- merging the redesign by default
- claiming conversion or SEO improvement without live proof
- opening a new route, new batch, or unrelated guide rewrite

## Compare Branch Note

- 2026-07-21: opened draft PR #464 so Sawyer can review this redesign as a compare branch rather than overwrite the current PR 462 preview.
- 2026-07-22: PR #464 is still stacked on open PR #462 at `42e09e8573eb565c51df6a8f6231673099b90aa2`. Do not merge #464 first; either #462 must land and #464 must be resynchronized, or the stack must be deliberately rewritten after Sawyer chooses a design.
