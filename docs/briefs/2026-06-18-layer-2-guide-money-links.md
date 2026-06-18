# Brief: Layer 2 Guide To Money Links

## Content Gate Inputs

- persona: Gulf Coast traveler using an area or comparison guide, plus the homeowner who reaches the same guide while checking whether Seascape understands the local rental market.
- primary keyword: Florida vacation rental management
- secondary keywords: vacation rental management fees Florida, Bradenton vacation rental management, Sarasota vacation rental management, Anna Maria Island vacation rentals, luxury Sarasota vacation rentals
- audience pattern: reader lands on a high-traffic guide, makes a location or travel decision, and needs a natural next step into a stay page or owner money page without leaving the guide context.
- proof source: `docs/status/current-state.md`, `docs/status/search-growth-map.md`, `docs/status/gate0-owner-competitor-read-2026-06-04.md`, `src/guides/anna-maria-island-area-guide/index.html`, `src/guides/bradenton-area-guide/index.html`, `src/guides/sarasota-area-guide/index.html`, `src/guides/srq-airport-to-anna-maria-island.html`, `src/guides/anna-maria-island-vs-siesta-key.html`, `src/guides/bradenton-vs-sarasota.html`, and live SERP checks on 2026-06-18.
- required internal links: /property-management/, /property-management/vacation-rental-management-fees-florida/
- CTA target: preserve existing guest booking CTAs and owner revenue-review CTAs; this pass only adds contextual in-body links where the guide already raises location, cost, ownership, or booking-fit decisions.
- anti-claims: no new revenue promise, no new inventory claim, no fake beach proximity, no owner lead claim, no new review-count claim, no claim that every guide reader is an owner, and no broad service-language paragraph that turns a travel guide into a property-management landing page.

## Why This Batch

- the related-card mesh now helps stay and owner pages pass authority to peers, but the area and comparison guides still mostly send readers to guest pages.
- owner acquisition remains the business bottleneck, so high-authority guide pages should give qualified owners a plain path into the owner money pages when the guide context already supports it.
- the change should stay small: add contextual links only, not a rewrite of the guide argument.

## Experiment And Readback Contract

- hypothesis: high-traffic guides can pass qualified readers into owner money pages and top stay pages without weakening the guide experience.
- primary event: owner revenue-review submission and `guide_owner_referral_click` where available.
- guardrail event: `guide_book_direct_click`, direct booking CTA integrity, valid internal links, and unchanged guide primary intent.
- entry criteria: every added link points to a live source-owned route and lands inside a sentence that already discusses place, cost, booking fit, or ownership.
- readback window: first 7 complete days after deploy once GA4 and Search Console cover the full window.
- decision rule: keep if the pages render cleanly and owner or stay destinations receive downstream engagement; if not, remove or move the lowest-fit links before adding more guide-to-owner paths.

## Gate 0 Search Block

| Field | Required answer |
| --- | --- |
| Target query family | Florida vacation rental management, vacation rental management fees Florida, Bradenton vacation rental management, Sarasota vacation rental management |
| Searcher intent | Owner compares fees, local management fit, and operator credibility before requesting a property review; some readers are guests who also need a stay collection. |
| Current Seascape URL | `/property-management/`, `/property-management/vacation-rental-management-fees-florida/`, `/property-management/vacation-rental-management-bradenton/`, `/property-management/vacation-rental-management-sarasota/`, `/stays/anna-maria-island-vacation-rentals/`, `/stays/luxury-vacation-rentals-sarasota/` |
| Current proof | Owner family average inbound count is still below guide average in the internal link analyzer; the six guide donors currently have thin or no owner-money in-body links. |
| Top visible competitors | Vacasa and FunStay Florida for fee explainer queries; PMI Southwest Florida, SkyRun Sarasota, iTrip Sarasota-Bradenton, Gulf Coast Vacation Rentals, Anchor Down, Sato Real Estate, and Anna Maria Island Chamber property-management listings for local management queries. |
| Competitor angle | Competitors emphasize fee ranges, hidden fees, local operators, cleaning, pricing, guest communication, and local market coverage. |
| Seascape gap | Seascape has owner pages for fees and local management, but high-traffic guides do not consistently point qualified readers into those pages from the relevant location and cost paragraphs. |
| Recommendation | Add a small set of contextual links from the AMI, Bradenton, Sarasota, SRQ, AMI-vs-Siesta, and Bradenton-vs-Sarasota guides into the owner money pages and top stay pages. Keep the guide intent intact. |

## Search Operator Read

- source reads used: live web SERP checks on 2026-06-18 plus repo source and the internal link analyzer.
- URLs inspected: Vacasa vacation-rental management fees, FunStay Florida Airbnb management fees, PMI Southwest Florida Sarasota vacation property management, SkyRun Sarasota management, iTrip Sarasota-Bradenton, Anna Maria Island Chamber property-management directory, Sato Real Estate, Anchor Down, and Gulf Coast Vacation Rentals.
- main evidence: fee competitors answer range and hidden-fee questions; local competitors sell owner confidence through market coverage, guest operations, cleaning, maintenance, and pricing.
- competitor pages inspected for demand patterns, not copied topics: yes.
- question-tool language worth preserving in customer wording: fee questions, manager switching, local market fit, and whether a home should be handled differently by location.
- GSC/GA4 evidence that supports building, rewriting, holding, or killing this cluster: owner acquisition remains the site bottleneck in `docs/status/current-state.md`; the pass is a small internal-link improvement, not a fresh page expansion.

## Cluster In Scope

- canonical winner URLs: existing owner money pages and top stay pages only.
- feeder pages: AMI area guide, Bradenton area guide, Sarasota area guide, SRQ airport guide, AMI vs Siesta guide, and Bradenton vs Sarasota guide.
- aliases or retired URLs: none.
- money destination: owner revenue-review funnel and existing stay collections.
- active lane: owner acquisition support plus direct-book stay intent.

## Source And Proof Constraints

- property truth needed: no new property facts should be introduced.
- owner proof asset needed: none; this pass should not add proof claims or revenue statistics.
- claims that are off-limits: new revenue outcomes, unsupported savings claims, new managed-property count claims, fake beachfront inventory, and any statement that Seascape manages every market the same way.
- Seascape-specific proof or local experience this page can add beyond generic competitor coverage: local guide context across Anna Maria Island, Bradenton, Sarasota, Siesta Key, and SRQ travel decisions.

## Page Builder Tasks

- source files likely to change: six guide files and this brief.
- redirect or schema work: none.
- internal-link or CTA work: add 10 to 15 in-body links, with `/property-management/` and `/property-management/vacation-rental-management-fees-florida/` present across changed guide pages for the content gate.
- money CTA and downstream tracking event to verify: preserve existing booking CTAs and owner CTAs; no form or tracking schema changes.

## Voice Editor Checklist

- tone risks: owner copy should not hijack guest guide pages or sound like a service pitch.
- generic or mechanical patterns to kill: "full service," "maximize," "seamless," "not just...but," and any role-card style sentence.
- proof or specificity checks: every link must be specific to the paragraph's location, cost, ownership, or booking decision.
- customer wording kept where it sounds natural; internal-link and SEO phrasing removed where it sounds manufactured.

## Release Gate Checklist

- routes to smoke test: `/guides/anna-maria-island-area-guide/`, `/guides/bradenton-area-guide/`, `/guides/sarasota-area-guide/`, `/guides/srq-airport-to-anna-maria-island/`, `/guides/anna-maria-island-vs-siesta-key/`, and `/guides/bradenton-vs-sarasota/`.
- commands to run: `npm run lint:content`, `npm run verify:links`, `npm run build`, and `npm run git:merge-check`.
- regression risks to watch: broken links, awkward owner copy inside guest pages, changed guide CTAs, and brief Gate 0 failure.

## Done When

- one isolated branch adds contextual links from the six guide donors.
- the active brief carries required content fields and Gate 0 search evidence.
- content, link, build, and merge gates pass.

## Post-Reread Outcome

- reread window used: pending after deploy.
- crawl freshness result: pending after deploy.
- actual impressions, CTR, position, and downstream event counts: pending.
- decision taken: pending.
- next branch slug or explicit wait state: hold more guide-to-owner linking until the first read shows whether the owner destinations receive qualified clicks.

## Not In Scope

- title or meta rewrites.
- bradenton-vs-sarasota content refresh.
- CWV image dimensions.
- CSP.
- new stay, guide, or owner pages.
- copied competitor sections or broad service copy.
