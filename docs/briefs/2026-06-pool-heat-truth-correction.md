# Brief: Pool-heat billing correction

- lifecycle: active
- scope approved: Sawyer requested the Relaxing Oasis included-heat website correction on 2026-11-27, following the 2026-11-25 decision recorded and verified in Hub #1141. The earlier shared nightly-rate and stay-cap correction was approved on 2026-11-13. Existing pages only; no change to payments, heater controls, or quoted exceptions.
- persona: Guest comparing pool homes and the complete cost before booking.
- primary keyword: vacation rentals with heated pool
- secondary keywords: Anna Maria Island pool heat fee, Bradenton heated pool rental, Sarasota pool home
- audience pattern: A guest checking heating charges before arrival or adding heat during a stay.
- proof source: Hub main `73bb60b135c0e947aa615b4353368f9d80a9446f`, verified against its remote on 2026-10-20; `decisions/2026-10-10-pool-heat-whole-stay-only.md`, `decisions/2026-10-11-pool-heat-mid-stay-remaining-nights.md`, `decisions/2026-10-13-pool-heat-every-managed-home.md`, and `context/seascape-properties.md` Portfolio Amenity Billing Baseline. Site base `41ecf4faeda5faccd4bfbee79434eac5e0254321`.
- required internal links: /properties/sarasota-luxe/, /properties/the-oasis/
- CTA target: Existing property and direct-booking links, unchanged.
- anti-claims: No free or included pool heat at paid-heat homes. The Coastal has no pool-heat charge (Sawyer, 2026-11-11); Relaxing Oasis includes heat for every guest (Sawyer, 2026-11-25, Hub #1141). No daily pricing, five-home billing restriction, selected heated nights, automatic activation, guaranteed temperature or heat-up time. Preserve approved long-stay flat rates. Hot-tub/spa terms remain distinct from pool billing.

## Current correction — 2026-11-27

Mutation owner: this Codex session. Prepare source and regression proof only;
no merge, website publication, Hostaway edits, sends, payment activity or heater
commands. Hub #1141 is complete; Pool Heat Kit #5 merged on November 25 ET.
Neither workstream is duplicated.

The [November 25 decision](https://github.com/uncfreak1255-code/seascape-hub/issues/1141)
replaces every Relaxing Oasis (607228) booking-cohort charge. It is a different
home from The Oasis (189511). Current property answer:

> Pool heat is included with every stay at Relaxing Oasis, at no extra charge.
> Water temperature depends on the weather and is not guaranteed.

Preserve the other seven property records byte for byte. The Coastal retains
automatic heat unless declined; do not transfer that operational claim to
Relaxing Oasis. Paid homes retain $40/night, the $280 cap, approved flat rates,
confirmed reservation inclusions, whole-stay/remaining-night rules and contact
requirements. The historical sections below describe their dated work, not
current authority to restore a charge at Relaxing Oasis.

Audit found the superseded fee/cohort paragraph in property data, the shared
property cost FAQ, the heated-pool stay page's explicit new-booking charge and
Coastal-only exception, plus generic stay, snowbird and LLM fee summaries that
omit Relaxing Oasis. The property FAQ, FAQPage and AI-discovery policy share
fallback data and need no separate template change for the heat answer.

Source Files Changed in this correction:

- `src/_data/properties-fallback.json`: Relaxing Oasis poolHeat only.
- `src/_includes/layouts/property.njk`: exclude Relaxing Oasis from the paid-heat optional-extra example, alongside The Coastal.
- `src/_data/seoPages.json`: replace the explicit new-booking charge and name Relaxing Oasis in shared no-charge exceptions; existing links and intent stay unchanged.
- `src/guides/snowbirds-guide-extended-stays-florida.html`: name both no-charge homes.
- `src/ai/summary.json.njk`: name both no-charge homes in the heated-pool answer.
- `src/llms.txt`: correct both heated-pool answer and collection fee summary; property inventory is regenerated from fallback without drift.
- `scripts/enforcement/property-pool-heat-invariants.test.js`: included policy, paid-home controls, shared copy and built FAQ/schema/AI parity.
- `scripts/recovery/assert-live-smoke.js`, `scripts/recovery/validate-included-pool-heat.js` and `scripts/enforcement/recovery-smoke.test.js`: add Relaxing Oasis and protect visible inclusion against stale charges and schema-only proof.
- `docs/plans/2026-11-content-priorities.md`: supersede the active cohort instruction.

Overlap checked November 27 against all 12 live open PRs, their complete file
lists and the 100 most recently updated PRs. No existing implementation of this
decision found. #1095 and #1099 share seoPages.json but edit other fields/pages;
#1034 shares llms.txt and live smoke for reviews work. Preserve those edits on
integration and repeat the read before any push or PR. Base: Site
`43c90e6fe17ef751140c64bb69a63350bbd3aab0`, fetched from origin/main.

Draft the copy: put the every-stay, no-extra-charge benefit first, followed by
the weather qualification. Remove internal wording: no decision dates, billing
cohorts, heater setpoints, sensor state or repair language in reader copy.
Check voice and specificity: retain the home name and direct booking benefit;
no temperature, heat-up-time, automatic-on or already-on promise.

Tools/plugins used: connected GitHub reads, current source, Git, property-truth
regeneration and Node checks. Research and Compound Writing skipped: this is
an exact approved policy correction, not search-intent selection or substantial
drafting; the dated Gate 0 below remains historical research, not a fresh SERP
or new justification. No search, citation or booking improvement is claimed.

## Required Internal Link Map

- src/guides/snowbirds-guide-extended-stays-florida.html: /stays/heated-pool-vacation-rentals-bradenton/, /stays/snowbird-rentals-florida-gulf-coast/

## Approved correction — November 13 (historical where superseded)

November 13 follow-up: state "$40 per night, capped at $280 per stay" in the
shared stay copy and paid property copy. The cap is supported by the Hub's
[pool-heat billing guide](https://github.com/uncfreak1255-code/seascape-hub/blob/main/context/pool-heat-billing-policy.md)
and October 28 billing decision, rechecked November 13. Keep The Coastal's
November 12 no-charge, automatic-unless-declined property answer unchanged.
Keep approved flat rates and existing reservation-specific inclusions.
The new scope supersedes the October draft-only instructions below.

Primary proof routes: `/stays/vacation-rentals-with-pool-and-hot-tub/` and
`/properties/dockside-dreams/`. The November 13 public read found the nightly
rate on both without its cap; this is a pricing accuracy repair, not an SEO
expansion.

### Historical October/early November correction

Pool heat is optional at $40 per night at every managed home except The Coastal,
whose owner no longer charges for it (Sawyer, 2026-11-11; Coastal's entry says there
is no charge and states no price or billing period, and promises no automatic heat,
guaranteed temperature or refund). A request before
arrival covers the whole stay; a request after arrival covers all remaining
nights. Approved long-stay flat rates still apply. No individual night picking.
The six other fallback entries must say this, and every "every managed home" mention must name the Coastal exception.
Every stay entry advertising pool heat or a heated pool gets the same billing
answer; remove contradictory fee copy in existing answers and paragraphs.
Preserve weather limitations and other property facts. No new routes, search
intent, metadata, layout, or operational collection changes.

This is the October correction, superseding the June branch's day-based brief.
The pre-existing remote branch is retained without force-pushing; today's main
supplies the implementation base. The June change is preserved in Git history.

## Source Files Changed

- `src/_data/seoPages.json`: pool-heat copy and billing FAQs, also feeding FAQPage schema.
- `src/_data/properties-fallback.json`: all seven `guestFacts.poolHeat` values; the existing layout and AI-discovery template consume them.
- `scripts/enforcement/property-pool-heat-invariants.test.js` (moved out of `property-truth-invariants.test.js` on 2026-11-11 to stay under the file-size limit): enforce rate, request timing, flat-rate exceptions and prohibited billing claims across every home and heat-related stay entry.
- `scripts/enforcement/property-dock-copy-invariants.test.js`: existing dock-copy tests moved unchanged so the oversized invariant file shrinks despite the added heat checks.

- `scripts/enforcement/p0-booking-evidence.test.js`: the retained price assertion now requires nightly billing, replacing its superseded daily rate.
- `scripts/enforcement/properties-data.test.js`: remove the obsolete Coastal $40 prohibition; retain all unsupported-temperature, equipment and occupancy exclusions. The new all-home invariant enforces Coastal pricing.

## Gate 0 — Existing-page factual correction

This free public read supplies the required search context; Hub decisions alone
set Seascape's price. The repair makes no ranking or conversion-lift claim.

| Field | Read |
| --- | --- |
| Target query family | Anna Maria Island vacation rentals pool heat fee; vacation rentals with heated pool. |
| Searcher intent | Guest booking: understand the optional heating charge and request timing. |
| Current Seascape URL | /stays/vacation-rentals-with-pool-and-hot-tub/ and existing heat-related stay entries. |
| SERP observed date | 2026-10-20 |
| SERP stale after | 2026-10-27 |
| Current proof | 2026-10-20 source inspection at Site 41ecf4fa: /day fees, five-home billing scope and unknown Coastal fee conflict with the three Hub decisions at 73bb60b1. Analytics impact is unmeasured. |
| Top visible competitors | Anna Maria Life, Florida Dreams and Beach House AMI appeared in the public query sample; this is not a controlled rank measurement. |
| Competitor angle | Their FAQ/terms pages explain heating conditions and billing; those policies do not set Seascape's terms. |
| Visual/format gap | None for this repair. Keep the existing FAQ and property-fact structure. |
| Seascape gap | Stay and property data omit or contradict the uniform nightly price and before/after-arrival billing rule. |
| Search fit | Keep existing pool-home routes and property CTAs; correct the fee answer before guests book. |
| Local/GBP proof | Not applicable: no business-profile, address or local-pack change. |
| AEO/readback note | FAQ text and JSON-LD share seoPages data; property copy and AI discovery share fallback facts. No paid AEO collection or lift claim. |
| Recommendation | improve: apply only the approved heat-billing correction and regression proof. |
| Attack status | completed |
| Query variants inspected | Anna Maria Island vacation rentals pool heat fee. |
| SERP source | Free public web search on 2026-10-20, followed by the three named competitor-page reads; no location control or paid tool. |
| Competitor URLs inspected | https://www.annamarialifevacationrentals.com/about-us/faq/ ; https://www.florida-dreams.com/terms-and-conditions/ ; https://www.beachhouseami.com/terms-and-conditions/ |
| Content gap and Seascape answer | State $40 per night at every managed home, whole stay before arrival, all remaining nights after arrival, with approved long-stay flat rates preserved. |
| Design/format strategy | Text and FAQ data only, using existing markup. |
| Seascape proof available | Three dated Hub decisions and the current Portfolio Amenity Billing Baseline at the verified Hub remote revision above. |
| Tools/plugins used | Git, repository files, free public web read, Node tests and offline release checks. No paid calls. |
| Decision and reason | Correct existing fee claims; do not open a growth experiment or expand inventory. |

## Copy and proof gate

- Draft the copy: lead with the optional nightly fee, then both request windows and the long-stay exception.
- Remove internal wording: no decision IDs, verification machinery or activation instructions in guest copy.
- Check voice and specificity: direct guest wording; no temperature guarantee or pressure against adding heat.
- Independent Voice Editor verdict: Approved on 2026-10-20 by the separate read-only reviewer; no introduced findings. Targeted property-truth and dock-copy tests: 21/21 pass.
- Prove the new invariant fails against unchanged source, then passes after the fix.
- Run `npm run verify:release -- --range origin/main`, including fresh build, full unit/content suite, property projections, redirects, recovery, links and JSON-LD. No `eval:aeo` or other paid evaluation.
- Check changed local route output and FAQ/schema parity. Stop at one draft PR.

## Observed verification — 2026-10-20

- New pool-heat invariant: failed on the unchanged Dockside fee copy, then passed on the corrected seven homes and 25 heat-related stay entries.
- `npm run verify:release -- --range origin/main`: passed; 1,193/1,193 tests, fresh build/content checks, design lint, 450 redirects, recovery checks, 163-page link scan and 686 JSON-LD blocks.
- Local static-server HTTP check: 25 stay routes and seven property routes returned 200 with the policy; all stay FAQPage answers match it; all seven AI-discovery property records contain it.
- Independent read-only review: Approved, no introduced findings; final matching FAQ addition and both superseded test expectations reviewed.
- No paid evaluation, production mutation or deployment. Publication target remains one draft PR.


## Focused policy review — 2026-10-22

The current task's mutation owner is this Codex review session, continuing the
existing draft branch. Fresh Site main `c11f34512c387bc5fe539fbece318a80c0c5c9b2`
was fetched and merged cleanly into the branch to preserve subsequent approved
source changes. This adds no unrelated PR diff against main.

Additional owning source: Hub
`decisions/2026-10-20-coastal-heat-included-exception.md` (blob
`60976116135003ca72c53ca919b25fb2fd8b95f1`) preserves free heat for Coastal
599394 stays promised inclusion in reservation messages. The public default
remains $40/night. Private reservation eligibility and the separate Coastal
billing hold are operational matters; this Site task does not read, infer,
remove or activate either one.

Decision: retain individual review for the first billable night on late-day
requests and mid-stay adds on an approved long-stay flat rate. No cutoff,
proration, new rate, tax treatment or new payment-before-activation rule is
created. These cases already require human review in Hub canon. A deterministic
billing or unattended collection feature would require a separate owner
decision before automating those cases; accurate website copy does not.

Copy correction: explicitly prohibit individual night picking; preserve already
confirmed reservation inclusions; require confirmation of nights, total,
payment instructions and start time; explain that a request alone does not
switch heat on. The Coastal property answer explicitly honors prior included
heat messages. Remove the long-stay FAQ implication that checkout necessarily
contains every optional pool-heat charge. These edits reach existing FAQ schema
and AI property records through the same two data sources.

Collection remains unchanged: the October 10 decision specifies a manual Airbnb
payment request and treats a direct-booking upsell as a separate activation.
This task does not verify payment processor configuration, transactions,
reservation eligibility, device state or actual heating performance.

### Public booking handoff evidence

Read-only HTTP response inspection of the seven existing booking listing URLs
on this review found the following. These are listing-response facts, not a
completed date-specific quote, checkout payment or guest transaction:

| Home / listing | $40/day wording found | $40/night wording found |
| --- | --- | --- |
| Dockside Dreams / 206016 | No | Yes |
| The Oasis / 189511 | No | Yes |
| Sarasota Luxe / 135881 | Yes | Yes |
| River House / 135880 | Yes | Yes |
| Bradenton Pool Home / 487798 | Yes | Yes |
| Blue House / 589288 | No | Yes |
| The Coastal / 599394 | Yes | Yes |

Each listing URL is `https://book.seascape-vacations.com/listings/` plus its ID.
At The Coastal, the description contains $40 per day and an 85°F setpoint,
while house rules say $40/night. Do not import the setpoint into Site copy:
Hub leaves Coastal heating performance unconfirmed. No statement is made that
the other listings fully implement whole-stay/remaining-night billing merely
because nightly wording was found.

The website booking panel's `src/assets/js/guest.js` converts listing links to
Hostaway `/checkout/` when availability is open; the Site does not collect this
add-on itself. Its existing property cost FAQ already calls for optional extras
to be confirmed. Preserve that handoff. The four conflicting listing descriptions
need a separate Hostaway copy correction under its existing owner before claiming
one consistent end-to-end guest policy. This draft changes no Hostaway setting.

### Current release verdict

Independent targeted review: **Approved** after shortening duplicate policy
blocks in three introductions/highlights. The full policy remains in each
FAQ and all seven property answers. Review checked source, policy, voice and
scope; no new billing decision was required.

Fresh proof on the revised source:

- `SEASCAPE_DISABLE_PUBLIC_AVAILABILITY=1 npm run verify:release -- --range origin/main`: passed, 1,195/1,195 tests, fresh build/content gate, design lint,
  recovery checks, 450 redirects, 163-page link scan, 686 JSON-LD blocks.
- Targeted property-truth and dock-copy suite: 21/21 passed.
- Local HTTP proof: 25 stay routes + seven property routes returned 200 with
  the revised policy; FAQ/JSON-LD answers match; all seven AI property records
  contain the revised property policy. Public availability fetching was disabled
  for deterministic offline checks; this is no proof of current dates or prices.
- The first pre-commit release attempt included staged upstream merge briefs
  and failed content-scope parsing on an upstream brief. Recording the clean
  main merge separately restored the intended PR diff; the final full gate
  above passed without altering those unrelated briefs or bypassing the gate.

**Site copy/source: ready for the existing publication review.** The October 20
head's proof was not reused as proof of these edits. **End-to-end consistency:
not complete** until the four hosted descriptions are corrected and read back.
This is not a request to invent a cutoff or override an agreement. Keep the
late-day and long-stay edge cases under individual confirmation.

No merge to main, production deployment, hosted listing mutation, payment
activation or heater activation was performed. Publication remains a separate
owner/release decision under PR #753's existing draft boundary.
