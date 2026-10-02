# Brief: Hands-on sentence says six houses

## Content Gate Inputs

- persona: guest or owner whose agent quotes the booking-trends report as current inventory
- primary keyword: none (truth correction, not a search play)
- secondary keywords: none
- audience pattern: an assistant repeats the first inventory sentence it finds
- proof source: live catalog at https://seascape-vacations.com/properties/ on 2026-10-02 says 6 homes; live https://seascape-vacations.com/research/gulf-coast-vacation-booking-trends-2026/ on 2026-10-02 still said "We manage these 5 houses hands-on"
- offer claim: n/a (guest-lane count correction)
- required internal links: /properties/, /guides/
- CTA target: unchanged
- anti-claims: do not change historical study denominators that correctly say five homes for June 2022 through March 2026; do not say every home is waterfront or has a dock
- hypothesis: the hands-on sentence is a present-tense count an agent will repeat even after the author bio says six
- primary event: property_booking_page_click
- guardrail event: email_capture_submit
- entry criteria: origin/main 442e331f still has the hands-on five-house sentence after PR 657
- readback window: after the corrected sentence is on the production site
- decision rule: keep the sentence if production says six current houses and the study window stays five

## Gate 0 Search Block

| Field | Answer |
| --- | --- |
| Target query family | Gulf Coast vacation booking trends Bradenton Sarasota |
| Searcher intent | research, not a new ranking play |
| Current Seascape URL | /research/gulf-coast-vacation-booking-trends-2026/ |
| SERP observed date | 2026-10-02 |
| SERP stale after | 2026-11-02 |
| Current proof | Live page read 2026-10-02 still says "We manage these 5 houses hands-on". Live catalog the same day says 6 homes. |
| Top visible competitors | AirDNA Sarasota overview and Altez Vacations March 2026 market update, from the 2026-10-02 public search sample |
| Competitor angle | market-wide listing counts, not a Seascape inventory count |
| Visual/format gap | None. This is one sentence inside the existing report. |
| Seascape gap | the report's hands-on sentence still states a current portfolio of five |
| Search fit | keep this research URL; correct the present-tense count; leave the study sample at five |
| Local/GBP proof | Not a Google Business Profile edit. The defect is one sentence on a research page. |
| AEO/readback note | An agent can still quote the hands-on sentence. Do not treat the author bio as the only inventory line. |
| Recommendation | change the hands-on sentence to six current houses and keep the June 2022 through March 2026 sample at five |
| Attack status | none found after named checks |
| Query variants inspected | gulf coast vacation booking trends 2026 Bradenton Sarasota |
| SERP source | public web search and live page read 2026-10-02 |
| Competitor URLs inspected | current source https://seascape-vacations.com/research/gulf-coast-vacation-booking-trends-2026/ read 2026-10-02; SERP public web search read 2026-10-02; competitor pages from that search: https://www.airdna.co/vacation-rental-data/app/us/florida/sarasota/overview and https://altezvacations.com/blog/march-2026-sarasota-vacation-rental-market-update/ |
| Content gap and Seascape answer | say six current houses, and say the numbers below are from the five-home study window |
| Design/format strategy | one paragraph edit; no new section |
| Seascape proof available | live catalog and live report read 2026-10-02 |
| Tools/plugins used | live page read, public web search, repository content gates |
| Decision and reason | ship the sentence now so an agent does not repeat five current houses |

## Source Files Changed In This Batch

- src/research/gulf-coast-vacation-booking-trends-2026.njk
- scripts/enforcement/property-truth-invariants.test.js
