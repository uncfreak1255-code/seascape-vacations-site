# Owner hero Option A polish

- lifecycle: selected
- approved scope: Sawyer approved a polished Option A owner hero on 2026-11-06 and selected it from the deploy preview the same day ("I like this one"). Merging publishes it, so the merge itself still needs his explicit go-ahead.
- persona: Bradenton or Sarasota pool-home owner who wants to know what their home earned and what needs attention
- primary keyword: property management Bradenton Sarasota
- secondary keywords: vacation rental management Sarasota, revenue review
- audience pattern: owner who wants one field and one action before reading anything
- proof source: seascape-hub/context/owner-offer.md section 4 and 7; src/_data/properties-fallback.json (The Oasis photograph and name)
- offer claim: context/owner-offer.md sections 4 and 7: free 48-hour one-page revenue review
- required internal links: /about-us/, /property-management/
- CTA target: #owner-cta on /property-management/
- anti-claims: no income, savings, occupancy or response-time claim; no new proof claim; the photograph is of a home Seascape manages and is captioned with its real name
- hypothesis: a photographic opening with one labelled field and one button lowers the effort of the first owner action
- primary event: owner_form_start
- guardrail event: owner_primary_cta_click now fires from the hero "Get my review" button with the same attributes the hero link had (data-page-slug property-management). The only consumer found, seascape-analytics collectors/ga4_funnel_events.py, counts it by event name with no placement grain, so the count stays comparable.
- entry criteria: Sawyer picks this direction from the deploy preview
- readback window: none until selected and published
- decision rule: merge only on Sawyer's explicit go-ahead after he has seen the preview
- Source files changed in this batch:
  - `src/property-management/index.njk`
  - `src/_includes/partials/owner-hero-photo.njk`
  - `src/css/owner.css`

## Gate 0 Search And Attack Receipt

This batch edits visible hero copy on a search-facing page (the lede loses one sentence and the "Request your 48-hour revenue review" link text becomes a "Get my review" button), so the gate applies; the repo defines no exemption for presentation changes. No title, meta, schema, redirect or sitemap edit is made. Evidence below was gathered on 2026-11-06 with WebSearch and WebFetch; no DataForSEO, GSC or GA4 pull was run.

| Field | Required answer |
| --- | --- |
| Target query family | property management Bradenton Sarasota; vacation rental property management Bradenton |
| Searcher intent | owner-management |
| Current Seascape URL | /property-management/ |
| SERP observed date | 2026-11-06 |
| SERP stale after | 2026-11-13 |
| Current proof | No GSC or GA4 receipt was pulled for this batch; final analytics are not ready and no ranking or conversion claim is made. Hero tracking on the page is unchanged in event name (owner_primary_cta_click) |
| Top visible competitors | iTrip Sarasota-Bradenton (itrip.net), Skyrun Bradenton (skyrun.com), Awning and RedAwning city pages, with Airbtics and FindRentals directories also visible |
| Competitor angle | local trust and franchise brand (iTrip, 4.7 stars from 2122 reviews on its page), a complimentary rental analysis form (Skyrun), national platform pages with fee starting points (Awning) |
| Visual/format gap | iTrip uses a Sarasota sunset photo and a phone number with no form; Skyrun uses a river photo and a multi-field estimate form (address, name, email, phone, beds, baths). Seascape answers with a photo of a home it manages and one labelled field with one button |
| Seascape gap | Competitors lead with a generic place photo or a long form; Seascape's first action was a link that scrolled to a four-question form. One field on first view is the gap this closes. No ranking gap is claimed |
| Search fit | /property-management/ stays the owner money destination for this query family; this batch changes presentation only and keeps the existing headline, H1 and offer |
| Local/GBP proof | N/A for this batch: no business-profile, category or NAP change is made; the page keeps its existing phone and address markup |
| AEO/readback note | N/A for this batch: no AI-answer readback was run and no AEO claim is made |
| Recommendation | improve: ship the presentation change Sawyer selected; make no title, meta, schema or claim change |
| Attack status | completed |
| Query variants inspected | "vacation rental property management Bradenton"; "property management Bradenton Sarasota vacation rental owners revenue review" |
| SERP source | WebSearch results observed 2026-11-06 |
| Competitor URLs inspected | https://itrip.net/property-management/sarasota-bradenton ; https://skyrun.com/bradenton/management (both fetched 2026-11-06) |
| Content gap and Seascape answer | Competitor heroes promise a free analysis or give a phone number; Seascape keeps its one-sentence offer (free one-page revenue review) and adds no income, savings or response-time claim |
| Design/format strategy | Match the photographic hero competitors use, using a real managed home with its real name in the caption; answer the long-form gap with one field and one button |
| Seascape proof available | The Oasis photograph and name from src/_data/properties-fallback.json; offer from seascape-hub/context/owner-offer.md sections 4 and 7 |
| Tools/plugins used | WebSearch, WebFetch |
| Decision and reason | Proceed with the option Sawyer selected: presentation change only, no new search-facing claim, no ranking claim |

## Copy and review contract

Hero copy is shortened to a label, the existing headline, one sentence taken from the existing lede, and one field. The visible label under the field repeats the existing field name "Listing link or street address". The owner statement upload moves to step 2 and the "Skip, I would rather describe it" button is removed. The hero button now reads "Get my review" and keeps the owner_primary_cta_click event. Endpoints and the other form fields are unchanged. Not in scope: any other page, DESIGN.md changes, or publication.

- Visual baselines: only `property-management` (desktop and mobile) regenerated through update-visual-baselines.yml run 42294289104; all other routes passed unchanged in CI.
