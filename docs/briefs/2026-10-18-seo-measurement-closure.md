# Friday pilot action: explicit campaign medium precedence

## Content-gate context for the required pricing evidence refresh

This action also refreshes expired published-rate verification under
`2026-05-owner-fee-revenue-leak-benchmark.md`. The commercial rates and page
positioning stay unchanged. Both briefs retain the required search gate.

- persona: Gulf Coast owner comparing platform, processing and management charges
- primary keyword: Airbnb host fees vs card processing
- secondary keywords: Airbnb host service fee, Stripe domestic card processing
- audience pattern: owner reviewing which charge covers which service before requesting a property-specific quote
- proof source: Airbnb Help article 1857 and Stripe US pricing directly read October 18, 2026
- offer claim: seascape-hub/context/owner-offer.md section 3: management terms are property-specific after review, with no universal public rate.
- required internal links: /property-management/, /property-management/vacation-rental-management-fees-florida/, /property-management/maximize-vacation-rental-income-florida/
- CTA target: /property-management/?owner_source=owner-fee-revenue-leak-benchmark-2026#owner-cta
- anti-claims: no new rates, contract terms, private performance, automatic savings, paid-traffic incidence or commercial lift claims
- hypothesis: explicit campaign medium precedence repairs source classification while verified date labels retain trustworthy existing fee definitions
- primary event: owner_primary_cta_click
- guardrail event: owner_form_submit
- entry criteria: deterministic classifier failure and required pricing freshness expiry, not a growth threshold
- readback window: existing October 23 review; commercial comparisons require seven complete compatible post-release days
- decision rule: technical keep requires deployed regression proof; missing release or adequate outcome coverage yields insufficient evidence, not lift

## Gate 0 Search Block

| Field | Required answer |
| --- | --- |
| Target query family | Airbnb host service fees vs Stripe domestic card processing pricing. |
| Searcher intent | Owner comparison/research of distinct services and charges. |
| Current Seascape URL | `/research/owner-fee-revenue-leak-benchmark-2026/`. |
| SERP observed date | 2026-10-18 |
| SERP stale after | 2026-10-25 |
| Current proof | Analytics October 10–16 receipt: this benchmark route has 0 GSC clicks/impressions and 0 GA4 sessions in that window; owner outcomes outside this report remain unknown. Growth decision HOLD_AND_REREAD. Separately the current source fixture reproduces cpc becoming organic; published-price gate expired October 17. |
| Top visible competitors | Airbnb Help fee page, Airbnb Resource Center host-fee explanation, Stripe pricing; PayClaro's vacation-rental processor comparison also appears in the live search. These are observed pages, not a ranking guarantee. |
| Competitor angle | Platform fee definitions, payment-processing rates and processor comparison. |
| Visual/format gap | Airbnb uses explanatory sections and Stripe rate cards; PayClaro uses a processor table. Preserve Seascape's existing comparison table and service distinctions; no visual change is warranted. |
| Seascape gap | Verification labels expired despite matching primary-source amounts; no evidence supports a positioning rewrite. |
| Search fit | Keep the existing fee-comparison URL and quote CTA; preserve the management-fee service page's separate intent. |
| Local/GBP proof | N/A because this refresh verifies national platform/processor rates, not a local listing or service-area claim. |
| AEO/readback note | Existing fee table and Article metadata retained; a fresh check date is not AI visibility or revenue proof. |
| Recommended action | Keep; refresh source-check dates and their metadata from authoritative evidence, plus the independently proven classifier repair. |
| Attack status | completed |
| Query variants inspected | Airbnb host service fees vs Stripe domestic card processing pricing. |
| SERP source | Live web search October 18, followed by direct primary-source reads of Airbnb Help and Resource Center, Stripe US pricing and competitor-page read of PayClaro. |
| Competitor URLs inspected | https://www.airbnb.com/help/article/1857, https://www.airbnb.com/resources/hosting-homes/a/how-much-does-airbnb-charge-hosts-288, https://stripe.com/en-us/pricing, https://www.payclaro.com/industries/vacation-rentals |
| Content gap and Seascape answer | Retain sourced definitions of unlike services; correct verification freshness, not rates or commercial claims. |
| Design/format strategy | Preserve the existing table/cards and all layout; update proof date labels and schema date coherently. |
| Seascape proof available | Current source, October 10–16 joined Analytics receipt, offline classifier red/green fixture and matching official rate statements. |
| Tools/plugins used | Native Git/source and Node tests, read-only Analytics operator report and public web reads. No paid research. |
| Decision and reason | Keep the route and growth hold; repair demonstrated classification and required source-verification freshness without expanding the content program. |

Source files changed in this batch:

- `src/assets/js/conversion-tracking.js`

## Decision and owner

The October 18 joined Analytics receipt covers October 10–16 and returns
`HOLD_AND_REREAD`, with no rescue candidate. It supersedes the October 12
canonical read, preserving the October 16 review as dated provenance. Hold
growth expansion and retain existing guides. A deterministic measurement repair
can proceed independently of that growth threshold.

The existing OpenSEO coordinator is the sole mutation owner and merger for
`codex/seo-closed-loop-20261018`. The completed Site and Analytics audit lanes
are preserved. The current coordinator accepts the action; no competing owner
or scheduler is created. Follow `docs/process/batch-workflow.md` for closure.

## Hypothesis and baseline

At base `4a8880358588f5adccfe8859d87f1a2b3822e7c7`, a Google referrer with
`utm_source=google&utm_medium=cpc` yields `source_context=organic_search`.
The same function runs on funnel events. Explicit campaign media should take
precedence over referrer-only organic inference. Preserve the existing
`direct_or_unknown` classification and raw UTM fields for these campaigns;
this repair introduces no new channel taxonomy or downstream schema.

Primary technical outcome: the campaign fixture no longer becomes organic.
Guardrails: untagged Google and explicit organic remain organic; existing AI
context, campaign fields, privacy filtering and booking handoff remain intact.
The regression executes the actual tracking runtime offline and failed before
the fix. Required Site build/release checks and independent exact-head review
govern source closeout. No visible page, event name or tracking permission changes.

## Business outcome and coverage

Reliable separation of campaign and organic funnel activity is a prerequisite
for evaluating guest handoffs and owner acquisition. The fixture proves the
classification error, not active paid traffic, GA4 default channel corruption,
historical contamination, bookings or revenue. Private qualified-owner,
reply/assessment/signed outcomes and reviewed reservation attribution have not
been reconciled by this read; their coverage is unknown, not zero.

## Release, rollback and evaluation

Source merge is pending the normal consolidated release. Verify the deployed
script's classification offline using the same fixtures before calling it live;
avoid synthetic traffic in production Analytics. Rollback is a source revert
of this action through the same review/release lane, not a manual deploy.

Next evaluation: the existing October 23 Friday review. Require seven complete
post-release days with compatible filters, source grain and coverage before a
commercial comparison; otherwise record `insufficient evidence` and the next
existing Friday. A deterministic classification pass supports technical keep
only, not commercial lift. Close with `keep`, `revise`, `revert` or `insufficient
evidence`, preserving deployment and measurement limits in the private handoff.
