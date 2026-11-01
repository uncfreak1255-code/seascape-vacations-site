# Bradenton vs Sarasota: direct-home booking preview

- lifecycle: active
- approved scope: Sawyer November1 authorizes a local before/after direct-booking improvement preview only; publication and paid checks held
- persona: guest choosing Bradenton or Sarasota for a Gulf Coast vacation
- primary keyword: Bradenton vs Sarasota
- secondary keywords: Bradenton vacation homes, Sarasota vacation homes
- audience pattern: preserve the standalone city answer and connect it to two factual mainland homes
- proof source: current source28b3f9c7, properties-fallback.json and property pages, frozen before.html, Analytics rehearsal quality/search and Nov1 historical aggregate read
- required internal links: /properties/bradenton-pool-home/#booking, /properties/sarasota-luxe/#booking
- CTA target: each named home's existing booking panel, not a new checkout or lead form
- anti-claims: no promised availability, nightly rate, savings, included pool heat, beachfront/on-island location, invented travel times or booking lift; no emoji
- hypothesis: showing one real home in each city after the comparison reduces the extra collection-selection step before checking dates
- primary event: guide_property_check_dates_click, bradenton-vs-sarasota, exact property slug, placement city_comparison_early
- guardrail event: guide_book_direct_click continuity and booking_engine_handoff; preserved guide/campaign/trip lineage
- entry criteria: user-authorized reversible existing-page preview, no new live experiment; existing expansion HOLD remains
- readback window: freeze at actual future publication if approved, exclude launch day, existing weekly cadence and four complete comparable weeks with processing lag
- decision rule: technical keep only after actual desktop/phone guest-path proof and preservation; commercial insufficient evidence until adequate attributed outcomes; no pilot reset
- Source files changed in this batch:
  - `src/guides/bradenton-vs-sarasota.html`
  - `src/css/comparison-home-bridge.css`

## Why this candidate

CURRENT EVIDENCE: historical Oct4–31 observed180guide sessions,0recorded exact-property primary events,1stay event and3book-direct events. These are aggregate activity, not a unique-session conversion rate or failed-conversion proof. Current source has early/bottom collection links but no actual property links; the lower heading promises two homes yet offers two collections. The direct-home branch is observable without claiming commercial lift. Highest area guide240sessions remains a less specific destination task; held best-time/Siesta topics excluded. Stay templates are under active separate Waterline work; homepage/catalog just changed in846, so avoid overlapping them. One guide only.

Revenue lever: direct bookings. Proof surface: exact guide-to-property-to-booking behavior and Analytics matched page/event/placement read. Owning repo: Site; Analytics owns outcomes. What waits: extra guide volume, owner-only/AI tasks, global/stay-template redesign.

## Gate 0 — current URL, bounded conversion preview

| Field | Evidence |
| --- | --- |
| Target query family | Bradenton vs Sarasota vacation and where to stay |
| Searcher intent | Choose a city for a vacation, then a suitable rental |
| Current Seascape URL | /guides/bradenton-vs-sarasota/ |
| SERP observed date | 2026-11-01 |
| SERP stale after | 2026-11-08 |
| Current proof | Nov1 existing Analytics rehearsal: quality human-review, no query failures; expansion HOLD; current source lacks specific property actions |
| Top visible competitors | headtosarasota.com/guides/sarasota-vs-bradenton/, brightfloridahomes.com/guides/sarasota-vs-bradenton/, dwellingwell.com/blog/sarasota-vs-bradenton/ |
| Competitor angle | Search-result observations: local comparison and relocation/real-estate emphasis, not proof of ranking or current property claims |
| Visual/format gap | Existing comparison table and Waterline frame are useful; guest must still browse a collection to reach a home |
| Seascape gap | No specific-home action in a guide explicitly asking the reader to compare two homes |
| Search fit | Keep current winner URL, intent, full copy and metadata; no title/meta rewrite, new route, alias or volume expansion |
| Local/GBP proof | Canonical mainland home locations; no GBP or Maps change |
| AEO/readback note | Preserve all answer/table/FAQ/schema; no AI recommendation claim or new collection |
| Recommendation | Add one restrained exact-home comparison after the early decision aside, using existing property data and tracking |
| Attack status | completed: free Nov1 search and source/measurement inspection, no paid checks |

## Independent acceptance and preservation before implementation

Frozen before HTML and held source/built hashes in booking-bridge-preview/baseline.json are the independent baseline. All original reader words/order, title/canonical/robots/keywords/OG/Twitter, three article JSON-LD objects plus two shared objects, table values, original href/tracking tuples, conversion-kit position and booking destinations remain. Added module excluded for preservation comparison; no blind reset from output. No shared templates/styles edited. Separate route-scoped CSS only.

Original has no link to either exact property booking panel: observe that test fail on the before version. After must expose each truthful property and correct existing booking panel in one click; preserve valid remembered/query dates, guest count, campaign and guide lineage to the existing booking route. No form submit or reservation. Browser QA developer marker on first URL, service workers/analytics blocked, synthetic telemetry intercepted. Test360/375/393/768/1024/1440, keyboard/focus/reduced motion, no overflow/errors/missing critical assets, existing single shell and GA4 configuration. Build frozen during browser proof. Native release/design/voice checks precede human review; no baselines refreshed without approval.

## Design and copy contract

Keep approved Waterline comparison frame and all article copy. Add an open ruled two-home ledger with factual room/capacity and mainland tradeoff, real selected photos only if the design critic accepts them, clear named Check dates actions and existing SVGs. No full redesign, card grid, availability badge, price from fallback, new framework or dependency. Existing source homes are Bradenton Pool Home (3bedrooms,3.5bathrooms,up to10) and Sarasota Luxe (4bedrooms,3bathrooms,up to12 direct; individual page retains its extra group-size qualifications). Existing optional pool-heat policy stays on property/checkout; no included-heat assertion. This is a review draft; awaiting publication approval.

## Local preview readback — November1

Independent Voice Editor: Approved. Rendered design critic: Approved with edge, no design-floor blocker. Six widths360–1440 pass new-module layout/image/tap checks; module axe has zero violations. Desktop and phone each complete both exact-home paths, including trip and guide lineage into correct existing checkout links without submitting a form. Keyboard focus3px, reduced motion0s, no-JS home paths work. All17metadata fields,5renderedJSONLD objects,41originalmainlinks/tracking, originalreaderwords/order/table and allfourheldsource+builthashes match the frozen before. No shared source change. A nonblocking Chromium cross-document transition-cancellation warning appeared during one successful navigation; no shared transition code changed, no missing critical assets, all four journeys complete.

Native changed-guide run:11passed,1desktop-mobile-onlycheckskipped,2expectedapproved-baseline differences (desktop/phone) caused by the added module. Baselines remain frozen for Sawyer's review; this is not release-ready or publication approval. Broader visual sweep was bounded and stopped while unrelated story tests ran; retain its partial log, do not claim the full590-test suite passed. Local checkpoint/pre-commit proof must pass; no push, PR, merge, deploy, schedule, paid check or booking. The existing growth checkpoint resumes this same pending-approval package rather than duplicating it.
