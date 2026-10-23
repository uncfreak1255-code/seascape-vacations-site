# Brief: Property-page regression rescue (2026-10-20)

Status: **research** until actual SERP competitors and inspected URLs are captured and every Gate 0 field, including the nine attack fields below, is complete. A live or free saved SERP read alone does not complete Gate 0; an exact paid DataForSEO run needs Sawyer's approval. Lane: `docs/process/ranking-regression-rescue.md`. Gate: `docs/process/content-quality-gate.md`.

- persona: group or family guest (8–16 people) planning a Gulf Coast week, comparing homes before booking direct
- primary keyword: bradenton vacation rentals with pool
- secondary keywords: vacation rentals bradenton fl; sarasota vacation rentals; vacation rental sleeps 16 bradenton; bradenton vacation rental with dock
- audience pattern: arrives from a guide or brand search, opens 2–3 home pages, checks sleeps, pool, and distance to the beach
- proof source: `seascape-hub/context/seascape-properties.md` (per-home sections, distances, Portfolio Amenity Billing Baseline); GSC domain property 2026-08-21–2026-10-15; GA4 `ga4_purchase_events`; supplied OpenSEO saved rank tracker dated 2026-10-15, only 5 of 30 money terms tracked (unverified — needs receipt)
- required internal links: each of the 7 homes linked from `/properties/` and from guides matching its town; current referring-page counts are **(unverified — needs receipt)**, requiring crawl/link output and counting method; proposed targets are Bradenton Pool Home ≥15, Pickleball Pool Home Retreat (Blue House) ≥10, The Coastal ≥10
- CTA target: property-page trip form followed by the Hostaway booking-page handoff; measure `property_check_availability_click` and `property_booking_page_click`
- anti-claims: no home on Anna Maria Island; pool heat never "included" (optional, $40/night at every home; whole stay before arrival, all remaining nights after arrival; approved long-stay flat rates remain valid); no dock/waterfront/canal except Dockside Dreams; River House is not waterfront; no licence badge; no revenue, occupancy, or savings-percentage claims; no pool-temperature promises
- hypothesis: unique ≤60-char titles naming home + town + sleeps, a 1-sentence brand-in-sentence lead, and more internal links recover property-page impressions and clicks versus the control guides
- primary event: GA4 purchase with landing on `/properties/` or a property detail route; the purchase completion URL is **(unverified — needs receipt)**
- guardrail event: `property_check_availability_click` and `property_booking_page_click` rates on property pages
- entry criteria: Gate 0 filled; §5 pool-heat copy on these pages matches canon
- readback window: first 7 complete days after deploy, then an additional 28-day experiment readback
- decision rule: read changed-group clicks, CTR, purchases and handoff events after the first 7 complete days; at 28 days, keep if clicks and CTR beat the four unchanged winner-guide controls and purchases do not fall; otherwise revert titles

Control URLs from `docs/portfolio/winner-guides.md` at the audited Site snapshot `41ecf4f`: `/guides/bradenton-vs-sarasota/`, `/guides/best-time-visit-anna-maria-island/`, `/guides/family-vacation-anna-maria-island/`, `/guides/shelling-guide-florida/`. Exclude `/guides/anna-maria-island-vs-siesta-key/` because the companion rescue changes it.

## Gate 0 Rescue Block

| Field | Answer |
| --- | --- |
| Target query family | Home-name and "bradenton / sarasota vacation rental with pool" queries landing on `/properties/*` |
| Searcher intent | Guest booking |
| Current Seascape URL | `/properties/` and the 7 home pages |
| SERP observed date | 2026-10-15 |
| SERP stale after | 2026-10-22 |
| Attack status | TBD |
| Query variants inspected | TBD |
| SERP source | TBD |
| Competitor URLs inspected | TBD |
| Content gap and Seascape answer | TBD |
| Design/format strategy | TBD |
| Seascape proof available | TBD |
| Tools/plugins used | TBD |
| Decision and reason | TBD |
| Current proof | GSC domain property: `/properties/*` clicks 14 → 7, impressions 675 → 370 (2026-08-21–09-17 vs 2026-09-18–10-15). The Oasis 197 → 41 impr; Sarasota Luxe 198 → 45; Dockside 119 → 75. Booking outcomes require private Analytics verification. Final analytics: `next-batch.md` read 2026-10-18 `fresh but below threshold`. |
| Top visible competitors | **(unverified — needs receipt):** capture three actual SERP competitors and inspected URLs; AI citations do not establish organic positions. |
| Competitor angle | **(unverified — needs receipt)** |
| Visual/format gap | **(unverified — needs receipt).** A per-home facts table (beds, baths, sleeps, pool, heat price, hot tub, dock yes/no, Hub distances) is a proposed format, not an established competitor gap. |
| Seascape gap | Source plus the title filter yields established homes at 75–81 characters, Blue House at 65, and Coastal at 48; actual SERP truncation is **(unverified — needs receipt)**. `/properties/` duplicates the title of `/stays/vacation-rentals-near-anna-maria-island/`; three newer/client pages have empty curated review arrays and require real reviews before Review markup. |
| Search fit | Property pages are where organic revenue lands; they are the conversion page for every sub-market |
| Local/GBP proof | Current GBP website-link and UTM configuration are **(unverified — needs receipt)**; check the primary category in the GBP audit. |
| AEO/readback note | No property or `/stays/` page is a top cited Seascape source in the 2026-10-12 AI run; Seascape cited in 0/5 "private pool in Bradenton" answers |
| Recommended action | Diagnose first: GSC query×page for The Oasis and Sarasota Luxe, URL Inspection on all 7, git log around 2026-09-15–20. Then: titles/meta, a lead sentence, a facts table, internal links, Review markup only from real reviews, a unique `/properties/` title/H1 |

## Draft copy rules
- Title pattern: `{Home} | {Town} Pool Home, Sleeps {N} | Seascape`, shortened per home to ≤60 characters. The unshortened pattern is 63 characters for Bradenton Pool Home and 72 for the current Blue House Site name, `Pickleball Pool Home Retreat (Blue House)`. Town comes from the hub: Bradenton or Sarasota.
- Lead: "Seascape Vacations' {Home} is a {beds}-bedroom private-pool home in {Town} that sleeps {N}, {hub distance} from {beach}." Pool heat line: "Pool heat is optional at $40 per night. Before arrival, add it for the whole stay; after arrival, add it for all remaining nights. Approved long-stay flat rates remain valid."
- Sleeps/beds/distances only from the Hub per-home section, preserving Sarasota Luxe's channel-dependent capacity. Pickleball Pool Home Retreat (Blue House) and The Coastal have no Hub distance line: measure, or omit.
