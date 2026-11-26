# Brief: Bradenton owner page refresh (2026-11-26)

- lifecycle: active
- task scope: refresh reader copy on `/property-management/vacation-rental-management-bradenton/` (one `seoPages.owner` entry). No new URL, no title or H1 change, no layout, CSS, template, form, tracking or redirect change unless the shared owner lander already renders named-home photos. This PR activates the brief only; it changes no live page content.
- completion or successor: this PR makes the brief the one active slot. Page copy ships in a later PR. `docs/briefs/2026-11-owner-service-area-truth.md` is parked, not deleted.

## Gate exception

`docs/status/next-batch.md` on `main`, read 2026-11-26 (run date **2026-11-09**): reread `fresh but below threshold`, recommendation `hold-and-reread`. Owner-money is structurally sub-gate. The page is not a confirmed regression, so rescue does not apply.

Sawyer Beckett, chat 2026-11-26 9:04 AM ET: "Open the Bradenton owner page refresh as a draft PR." He approved swapping this brief into the one active-brief slot. Exception reasons:

1. Explicit owner approval at that date and time.
2. Owner pages are the one page type allowed in the 90-day focus.
3. 2 impressions in 28 days (GSC Oct 27–Nov 23, position 8.0) and last Google crawl 2026-09-24.

Founder exception, not a gate open. Reread stays held. No GBP edits. Paid research about $1.06 expected, $1.67 worst case, inside the $10 Sawyer approved 2026-11-26 at 8:27 AM ET.

## Content Gate Inputs

- persona: an owner of a pool home in Bradenton (mainland, west Bradenton, near IMG or the river), often out of state, comparing two or three local managers after a weak season or a bad statement
- primary keyword: vacation rental management bradenton
- secondary keywords: airbnb management bradenton; short term rental management bradenton; bradenton vacation rental property management; property management bradenton fl (210/mo, mostly long-term intent: answer it in one line, do not chase it)
- audience pattern: an owner opens two or three local manager pages and checks whether the manager actually runs homes like theirs nearby, how a quote is built, and what the monthly statement shows
- proof source: hub `context/owner-offer.md` §§1–4, 6–7 and hub `context/seascape-properties.md` (eight homes: seven in Bradenton, Sarasota Luxe in Sarasota), read 2026-11-24; Site `src/_data/properties-fallback.json` (The Oasis 5BR/3BA sleeps 16 with pool; Dockside Dreams 4BR/3BA sleeps 12, waterfront, private dock), read 2026-11-26; GSC Oct 27–Nov 23 (2 impressions, position 8.0) and URL Inspection last crawl 2026-09-24; SERP and AI Mode for the primary query, read 2026-11-26
- offer claim: `seascape-hub/context/owner-offer.md` section 6: "A small local team that gives my home direct attention, tells me what it earned and what needs fixing before I ask, and answers the phone."
- required internal links: /property-management/vacation-rental-management-fees-florida/, /property-management/vacation-rental-licensing-florida/, /property-management/switch-vacation-rental-management-company/, /properties/the-oasis/, /properties/dockside-dreams/, /property-management/
- CTA target: the existing owner evaluation form / 48-hour revenue review on the page; labels, fields and tracking unchanged
- anti-claims: no management-fee percentage, range or minimum; no monthly software amount; no revenue, occupancy, savings, response-time or review-count figure; no guarantee, passive income or hands-off claim; no software or vendor name; no managed home placed on Anna Maria Island or Longboat Key; never name the business partner, say "we"
- hypothesis: replacing abstract copy with named local homes and direct answers will keep the thin impression base and can start owner-form clicks; no ranking forecast
- primary event: `owner_primary_cta_click` on `/property-management/vacation-rental-management-bradenton/`
- guardrail event: owner evaluation form submits on that route; Search Console impressions and average position for the primary term family
- entry criteria: Sawyer's 2026-11-26 9:04 AM ET approval; this brief active; `[NEEDS PROOF]` items still flagged until sourced; voice pass approved; `npm run verify:release` green on the copy PR
- readback window: 28 days after production publish, verdict Monday in `docs/status/page-ledger.json`
- decision rule: revert the intro and FAQ only if the page loses 30% or more impressions while the site does not; keep named-home and mainland-vs-island truth even then

## Why This Batch

- What changed: nothing in the portfolio. Bradenton is where most of our homes are. Google already treats Seascape as relevant to the primary term (avg #3.2 at 15 of 25 points near the GBP pin), but the page is weak: last crawled 2026-09-24, 2 impressions in 28 days, abstract copy, no named homes beyond a caption, no FAQ for AI fan-out questions.
- Why this page: Bradenton owner money destination in `docs/portfolio/owner-acquisition.md`. The AMI owner page is "Crawled – currently not indexed" and we manage no island homes, so AMI is the wrong page to push first.
- What should wait: GBP pin move (Sawyer's call; we make no GBP edits); AMI owner-page push; any fee number; owner testimonials (hub: reopen only when Manny or Grettel agree in writing); title/meta tests (`serp-ctr-title-rewrite` only); in-link donors until `npm run seo:links:plan` on the copy PR.

GBP pin is in east Sarasota (27.296,-82.489). Owner searches in Bradenton and on AMI are lost on distance (0 of 25 grid points in both; 15 of 25 near the pin). Moving it to 6103 Riverview Blvd, Bradenton, if that meets Google's service-area rules, is Sawyer's call and can trigger re-verification.

## Opening receipt (first two sentences of the copy PR)

> Seascape manages vacation homes in Bradenton, including The Oasis, a 5-bedroom pool home that sleeps 16, and Dockside Dreams, a 4-bedroom waterfront home with a private dock. If you own a Bradenton pool home, we'll read your listing or statement and send back a one-page review within 48 hours.

Sources: hub `context/owner-offer.md` §1 (Dockside Dreams 4BR/3BA waterfront for 12 with pool, spa, private dock; The Oasis 5BR/3BA for 16 with pool, two hot tubs) and §7 (48-hour review); Site `properties-fallback.json` read 2026-11-26. "Within 48 hours" is the approved review name; do not add a response-time promise beyond it.

Angle: we run homes like yours a few miles away, we tell you how a quote is built instead of selling a number, and we say plainly what we don't do (no island homes yet). Each follow-up question gets two or three sentences.

## Gap table (primary query, read 2026-11-26)

SERP (Bradenton, desktop): local pack GCVR Bradenton, GCVR, Coastal Breeze Getaways; organic strmarket.com, yellowpages.com, comparent.com, hackneypropertymanagement.com, yelp.com. AI Mode ("who should I hire to manage my vacation rental in Bradenton FL"): Gulf Coast VR, Prime Vacations, Anchor Down, Cheerful Rentals, Portfolio Vacations.

| Covered by all | Covered by none |
| --- | --- |
| Generic service list (listing, pricing, cleaning, maintenance, guest messaging) | Named managed homes in Bradenton with real specs |
| "Free rental analysis" style CTA | How a management quote is actually built, without a sales number |
| Areas-served list | Mainland vs island honesty (which manager actually has homes where) |
| Fee mention (one local competitor publishes a number; we do not) | What the monthly owner statement contains; who keeps reviews/listings, markups, guest-paid cleaning, contract terms |

## Follow-up questions (each gets a 2–3 sentence answer)

| # | Question | Answer basis | Source / status |
| --- | --- | --- | --- |
| 1 | What does a Bradenton vacation rental manager do for my home? | Lists on Airbnb, Vrbo and our direct site; sets and reviews nightly rates per home with you; screens guests and handles messaging with a real local person; coordinates cleaning and maintenance and tells you before you ask; collects payments, pays monthly, remits county and other taxes. | hub owner-offer §2 — verified |
| 2 | How much does vacation rental management cost in Bradenton? | Explain the basis, not a number: a share of net rent (not gross), set owner by owner after we see the home, and the signed agreement controls. What moves a quote: the home's size and guest count, pool/spa care, waterfront and dock upkeep, how much it can earn, how much turnover work it creates, its condition, and its booking-channel mix. Link the fee guide. | hub owner-offer §3 (basis only; no %, no range, no monthly amount until Villa Tessa signs) — verified basis; quote-driver list [NEEDS PROOF: Sawyer confirms these are the drivers he uses] |
| 3 | Do you manage homes on Anna Maria Island? | Not yet. Our homes are in Bradenton and Sarasota; Anna Maria beaches are a short drive. | service-area brief + hub — verified |
| 4 | Do I need a license, and what are the City of Bradenton / Manatee County rules? | State: Florida DBPR vacation rental license (link our licensing page). Local: [NEEDS PROOF: current City of Bradenton vacation-rental registration/ordinance and Manatee County tourist tax facts, from cityofbradenton.com and the county tax collector, dated]. We remit county and other taxes for managed homes. | hub §2 (tax remittance) verified; local rules unverified |
| 5 | How will I know what my home earned? | A monthly statement of what the home earned, what was spent and your payout, with the payout once stay payouts land. | hub §2 — verified (no delivery-day guarantee) |
| 6 | Who answers when something breaks? | You reach the people who run your home, not a call center; we answer the phone. | hub §4 and §6 — verified (no response-time number) |
| 7 | Are cleaning fees taken out of my revenue? Do you mark up maintenance? | Cleaning fees are paid by the guest, not subtracted from owner revenue. Maintenance markup: [NEEDS PROOF: Sawyer's policy]. | hub property reference "Cleaning fees are GUEST-PAID" — verified; markup unverified |
| 8 | Can I switch managers mid-season without losing bookings? | Link the switch guide; say we plan around live reservations. Transfer specifics: [NEEDS PROOF] (hub cut "what switching looks like" because specifics were unconfirmed). | hub dated history item 3 — partly unverified |

Optional ninth if space: "Who keeps the Airbnb/Vrbo listing and reviews if I leave?" — [NEEDS PROOF: Sawyer's answer].

## Answer-first outline (Keep / Modified / New)

- **H1** "Bradenton Vacation Rental Management" — Keep (titles/H1 unchanged; title/meta ideas go to `serp-ctr-title-rewrite` only).
- **Intro (first 40 words)** — Modified: opening receipt replaces "If your Bradenton home has the right size, pool, and group appeal…".
- **H2 What we do for a Bradenton home** — New (answer #1). Name The Oasis and Dockside Dreams with links to `/properties/the-oasis/` and `/properties/dockside-dreams/`. Use existing nearby-home photo treatment if it already renders; do not add a new card layout.
- **H2 How a management quote is built** — New (answer #2). No number.
- **H2 Where our homes are** — New (answer #3), one paragraph, mainland vs island.
- **H2 "Why Bradenton owners start looking elsewhere"** — Keep, trimmed to the three existing sub-points.
- **H2 How we review a Bradenton home** — Modified: keep the three-step review but align step 1 with the 48-hour one-page review (what looks right, what deserves a second look, what we'd check next). Drop "90-day takeover plan" wording unless Sawyer confirms it [NEEDS PROOF].
- **H2 Bradenton owner questions** — New FAQ, answers #4–#8, FAQPage markup parity with visible text (`2026-11-guide-faq-markup-parity` pattern).
- **CTA** — Keep the existing owner evaluation form. Anchor: "Send us your listing or last statement and we'll send back a one-page review within 48 hours."

Word count: 1,300–1,700 (current page ~1,550).

## Gate 0 Search And Attack Receipt

| Field | Answer |
| --- | --- |
| Target query family | vacation rental management bradenton; airbnb management bradenton; short term rental management bradenton; bradenton vacation rental property management |
| Searcher intent | owner-management: a Bradenton pool-home owner choosing a local manager |
| Current Seascape URL | `/property-management/vacation-rental-management-bradenton/` |
| SERP observed date | 2026-11-26 |
| SERP stale after | 2026-12-03 |
| Current proof | GSC Oct 27–Nov 23, read 2026-11-26: 2 impressions, 0 clicks, average position 8.0; URL Inspection last crawl 2026-09-24. Owner-money cluster remains structurally sub-gate versus the 1,000-impression bar in `docs/status/next-batch.md` (2026-11-09 read). |
| Top visible competitors | Local pack: GCVR Bradenton, GCVR, Coastal Breeze Getaways. Organic: strmarket.com, yellowpages.com, comparent.com, hackneypropertymanagement.com, yelp.com. AI Mode: Gulf Coast VR, Prime Vacations, Anchor Down, Cheerful Rentals, Portfolio Vacations. |
| Competitor angle | Generic service lists, areas-served lists, "free rental analysis" CTAs, and (for one local competitor) a published fee number. None lead with named Bradenton homes they actually manage. |
| Visual/format gap | Directories and listicles; no named-home specs, quote-basis explainer, or mainland-vs-island honesty. Answer those in prose on the existing lander, not with a fee table. |
| Seascape gap | Indexed but stale (last crawl 2026-09-24), 2 impressions in 28 days, abstract copy, no named homes beyond a caption, no FAQ for the fan-out questions. |
| Search fit | Existing Bradenton owner money page in `docs/portfolio/owner-acquisition.md`. Improve in place; conversion stays on the existing owner evaluation form. Not a new URL and not an expansion branch. |
| Local/GBP proof | Hidden pin in east Sarasota (27.296,-82.489); 0 of 25 grid points in Bradenton and on AMI, 15 of 25 near the pin. No GBP field is changed in this batch. |
| AEO/readback note | Three brand-named answer-ready blocks below; FAQ answers #4–#8 must match FAQPage markup. Off-site: one 5x5/2 km grid at the pin and in west Bradenton plus two owner AI prompts, 4–6 weeks after publish. `npm run eval:aeo` was not run. |
| Attack status | completed |
| Query variants inspected | "vacation rental management bradenton" (Bradenton, desktop SERP); AI Mode "who should I hire to manage my vacation rental in Bradenton FL"; supporting terms in Content Gate Inputs |
| SERP source | Live SERP and AI Mode read 2026-11-26 for the primary query from Bradenton desktop, recorded in the SEO & AEO Desk candidate brief the same day |
| Competitor URLs inspected | https://strmarket.com, https://www.yellowpages.com, https://www.comparent.com, https://hackneypropertymanagement.com, https://www.yelp.com (organic SERP domains, 2026-11-26); local-pack names GCVR Bradenton, GCVR, Coastal Breeze Getaways; AI Mode names Gulf Coast VR, Prime Vacations, Anchor Down, Cheerful Rentals, Portfolio Vacations. Competitor page bodies were not fetched beyond that SERP/AI list. |
| Content gap and Seascape answer | Competitors cover generic services and CTAs. Seascape answer: name The Oasis and Dockside Dreams with real specs, explain how a quote is built without a sales number, say we do not manage island homes yet, and answer statement, phone, cleaning, and switch questions. |
| Design/format strategy | Text in existing owner-lander fields only. No new layout, CSS or template unless the shared lander already renders named-home photos. Titles and H1 stay. |
| Seascape proof available | Hub property list and owner-offer sections 1–7; Site specs for The Oasis and Dockside Dreams. Unverified items stay behind `[NEEDS PROOF]`. |
| Tools/plugins used | Search Console / URL Inspection (free) and the 2026-11-26 SERP plus AI Mode read. Paid lookups about $1.06 expected, $1.67 worst case, inside the $10 Sawyer approved 2026-11-26 at 8:27 AM ET. No Hostaway call. |
| Decision and reason | Activate this existing-page refresh as the one active brief under Sawyer's 2026-11-26 approval. Copy is a later PR. Reversible: park this brief and restore the service-area slot. |
| Recommendation | Keep this brief active; implement the copy in a follow-on PR from this contract; request indexing after that merge. |

## Cluster, source, and copy-PR tasks

- canonical winner: `/property-management/vacation-rental-management-bradenton/`; alias `/property-management/img-academy-vacation-rental-management/` unchanged
- feeders to confirm on the copy PR after `npm run seo:links:plan`: `/guides/bradenton-area-guide/`, `/stays/bradenton-vacation-rentals/` footer owner line, `/property-management/` owner hub card
- money destination: existing owner evaluation form; event `owner_primary_cta_click`
- active lane: owner acquisition
- source files likely to change: `src/_data/seoPages.json` (`vacation-rental-management-bradenton` only); `docs/status/page-ledger.json` on the copy PR
- property truth: re-read hub `context/seascape-properties.md` and Site `properties-fallback.json` the day the copy PR is cut (owner-offer is stale after 2026-12-17)
- Compound Writing (`cw-draft`, `cw-line-edit`) is not used on this PR: there is no reader copy

Off-site after publish: one 5x5/2 km grid for the primary term at the pin and in west Bradenton (~$0.06) and two owner AI prompts (~$0.50), 4–6 weeks after publish.

## Proof needed, and from whom

Keep every `[NEEDS PROOF]` marker until the named person supplies the fact. Do not invent a substitute.

- Sawyer: quote-driver list (#2); maintenance markup (#7); switching specifics (#8); listing/review ownership (optional #9); whether "90-day takeover plan" stays
- Hub/Ops: Bradenton home list and The Oasis / Dockside Dreams specs on the copy-PR day
- Research: dated City of Bradenton and Manatee County rule facts (#4)
- Owner quote: none permitted yet

## Answer-ready block (single paragraphs that name the brand)

1. Seascape Vacations is a local vacation rental manager in Bradenton and Sarasota, Florida. It manages pool homes such as The Oasis and Dockside Dreams in Bradenton and lists them on Airbnb, Vrbo and its own direct-booking site.
2. Seascape Vacations quotes management owner by owner after it sees the home. The fee is a share of net rent, not gross, and the quote depends on the home's size, upkeep, earning potential and booking mix.
3. Seascape Vacations does not manage homes on Anna Maria Island yet; its managed homes are on the mainland in Bradenton and in Sarasota, a short drive from the island beaches.

## Voice, release, and done

- Voice risks: brochure "we handle everything"; selling a fee number; island-operator voice; "full-service", "maximize", "booming market"
- Copy PR checks: named homes match property truth; every `[NEEDS PROOF]` still visible; no partner name; no fee percentage, range or minimum; FAQPage matches visible FAQ; title/H1 and form/tracking unchanged
- Commands: `npm run check:brief -- docs/briefs/2026-11-bradenton-owner-page-refresh.md --gate0`; copy PR also runs `npm run lint:content` and `npm run verify:release`
- AEO (advisory, rubric not executed): answer in first 40 words; 5 of 7 sections question-led; 3 brand-named blocks; 2 named homes; 6 unverified items flagged
- This PR is done when the brief holds the active slot, the service-area brief is parked, and checks are green. No live page copy.
- Not in scope: live copy, title/meta, GBP edits, fee numbers, new URLs, AMI/LBK rewrites, guest pages, partner name, testimonials, layout redesign, Hostaway writes
