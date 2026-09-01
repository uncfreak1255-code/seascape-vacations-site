# P0 factual-integrity and route correction

- persona: Gulf Coast vacation guest or prospective property-management owner seeking accurate booking and tax information
- primary keyword: Bradenton vs Sarasota vacation rentals
- secondary keywords: Sarasota vacation rental, Bradenton vacation rental, Florida vacation rental taxes
- audience pattern: needs a practical comparison or direct booking path and should not be asked to rely on unsupported savings, location, portfolio, or tax claims
- proof source: canonical property fallback data; current route inventory; professional tax review is not yet available
- required internal links: /guides/bradenton-vs-sarasota/, /properties/sarasota-luxe/, /property-management/, /#contact
- CTA target: `/properties/` or `/#contact`
- anti-claims: no tax advice; no fixed savings, portfolio, guest-count, return, or experience claims without an approved source; no statement that downtown Sarasota is walkable to St. Armands Circle
- hypothesis: removing unsupported claims preserves booking trust without adding new search surfaces
- primary event: `guide_book_direct_click`
- guardrail event: `guest_capture_form_submit`
- entry criteria: P0 source-truth conflict identified in existing canonical pages and routes
- readback window: 48 hours after production deployment
- decision rule: keep the corrected canonical routes if direct-book and contact behavior remain intact; only reconsider claims when approved proof exists
- source files likely to change:
  - `src/_redirects`
  - `src/_data/properties-fallback.json`
  - `src/_data/seoPages.json`
  - `src/guides/bradenton-vs-sarasota.html`
  - `src/guides/bradenton-vs-sarasota-beaches/index.html`
  - `src/guides/bradenton-vs-sarasota-retirement/index.html`
  - `src/guides/bradenton-vs-sarasota-restaurants/index.html`
  - `src/guides/anna-maria-island-vs-longboat-key.html`
  - `src/index.njk`
  - `src/stays/stays.njk`
  - `src/about-us/index.njk`
  - `src/llms.txt`
  - `src/ai/faq.json.njk`
  - `src/ai/summary.json.njk`
  - `src/ai-discovery.json.njk`
  - `src/research/owner-fee-revenue-leak-benchmark-2026.njk`
  - `src/property-management/index.njk`
  - `src/property-management/property-management.njk`

## Required Internal Link Map

- src/guides/anna-maria-island-vs-longboat-key.html: /properties/sarasota-luxe/, /stays/bradenton-waterfront-vacation-rentals/
- src/guides/bradenton-vs-sarasota.html: /stays/bradenton-vacation-rentals-near-beaches/, /stays/siesta-key-area-vacation-rentals/
- src/guides/bradenton-vs-sarasota-beaches/index.html: /guides/bradenton-vs-sarasota/, /property-management/
- src/guides/bradenton-vs-sarasota-restaurants/index.html: /guides/bradenton-vs-sarasota/, /property-management/
- src/guides/bradenton-vs-sarasota-retirement/index.html: /guides/bradenton-vs-sarasota/, /property-management/
- src/index.njk: /properties/, /property-management/
- src/stays/stays.njk: /guides/anna-maria-island-area-guide/, /property-management/
- src/research/owner-fee-revenue-leak-benchmark-2026.njk: /property-management/, /property-management/vacation-rental-management-fees-florida/
- src/property-management/index.njk: /property-management/vacation-rental-management-fees-florida/, /property-management/vacation-rental-insurance-florida/
- src/property-management/property-management.njk: /property-management/vacation-rental-management-fees-florida/, /property-management/vacation-rental-licensing-florida/

## Gate 0 Search Block — factual-integrity route correction

| Field | Answer |
| --- | --- |
| Target query family | Existing Bradenton/Sarasota vacation comparison and Seascape contact/tax-guide navigational queries |
| Searcher intent | comparison, support, or owner-management information; do not ask visitors to rely on unsupported tax or savings claims |
| Current Seascape URL | `/guides/bradenton-vs-sarasota/`, `/property-management/vacation-rental-taxes-florida/`, `/contact` |
| SERP observed date | 2026-08-31 |
| SERP stale after | 2026-09-30 |
| Current proof | Source inventory reviewed 2026-08-31; no final GSC/GA4 receipt or approved tax-review receipt is available |
| Top visible competitors | None recorded; this is a source-truth correction, not competitor-led expansion |
| Competitor angle | Not used; no competitor claim or comparison is being published |
| Visual/format gap | Not applicable; preserve existing canonical layouts and routing |
| Seascape gap | Unsupported or contradictory public claims and a missing canonical contact route |
| Search fit | Preserve the existing canonical comparison and contact destination while removing unsupported assertions |
| Local/GBP proof | N/A because this change does not alter local-profile or map-pack content; it preserves existing routes |
| AEO/readback note | Verify canonical routing and public wording after deployment; defer any IMG Academy page until Search Console query-to-page evidence exists |
| Recommendation | consolidate: quarantine the tax guide, remove unsupported numbers, correct location wording, and repair the contact route |
| Attack status | none found after named checks |
| Query variants inspected | Bradenton vs Sarasota vacation rentals; Sarasota vacation rental taxes; Seascape contact |
| SERP source | No live competitor SERP receipt was used; source: repository inventory and official-source review |
| Competitor URLs inspected | source: repository source inventory; SERP: no competitor SERP evidence; competitor-page: not applicable because no competitor claim is used |
| Content gap and Seascape answer | Remove unsupported claims and point visitors to live listings, final checkout totals, the contact section, or a qualified tax professional |
| Design/format strategy | Keep the existing comparison and owner hub; remove the retired duplicate route and tax-guide link rather than add pages |
| Seascape proof available | Canonical property fallback data, route inventory, and build/test receipts dated 2026-08-31; no tax advice proof |
| Tools/plugins used | Repository tests, content lint, release and redirect validators; official-source review |
| Decision and reason | Ship the narrow correction after release gates pass; no new page is justified without Search Console query-to-page evidence |
