# Rainy-day guide legacy-handoff measurement repair

- lifecycle: active
- authority: Sawyer requested a saved-local-OpenSEO-only improvement loop on October 20, 2026, carrying the highest-impact supported improvement through the owning repo workflow.
- mutation owner and sole merger: Codex session 01a15a96-b2d5-7110-af54-18c4f9b7b22b.
- source paths: `src/guides/rainy-day-activities-bradenton-sarasota.html`, `tests/e2e/guide-handoff.e2e.ts`.
- baseline revision and rollback source: `86686bf13364e4af46e3f8ddc1ace8c317add27a`.

## Selection from saved evidence

Local OpenSEO project `7c97b83b-1950-41f1-a797-f7c7a79390e4`,
Seascape Vacations / seascape-vacations.com, US English mobile, depth 40:
completed run `f7274a81-f43b-40f0-b154-f08fe5f6dca8`, October 15, 2026.
The saved rows place this guide at 9 for `sarasota indoor activities` and 10
for `indoor activities in sarasota fl`. Prior mobile positions are missing;
these rows establish visibility, not a trend, visitors or commercial value.
Observation/retrieval: October 20. Reassess ranking selection after October 22
under the existing tracker cadence; no new check or live SERP lookup is made.

The October 10–16 Analytics receipt in `docs/status/next-batch.md` still holds
growth below threshold. The Bradenton sticky repair (Site #757) is already merged
as `2d1d914b` and now appears on production; its served tracking script matches
production source byte-for-byte. Live-smoke/schema checks are recorded separately.
This does not establish GA4 receipt or commercial lift, and is not another reason
to edit the same guide.

The rainy-day main and sticky CTAs have no data-track-event attributes.
Analytics acceptance issue #247 explicitly documented these missing historical
legacy guardrails. Issue #248 remains the owner of five-guide placement-separated
reporting. This repair supports the existing experiment; it creates no new pilot
action, baseline window, event taxonomy, collector, dimension or scheduler.

Highest supported choice: restore the missing legacy handoffs on an already
ranked guide. Bradenton's repair already landed; the saved #2 Bradenton-vs-Sarasota
winner remains protected; owner/growth rewrites need evidence outside this run.
Other source leads are deferred, not promoted into a sitewide tracking audit.

## Outcome contract

- revenue lever: observe existing guide visitors progressing to relevant direct-book stay collections.
- hypothesis: both existing rainy-day CTAs emit exactly one existing guide_book_direct_click and preserve the same guide-click identity and organic campaign at the destination.
- primary event: guide_book_direct_click, guide_slug=rainy-day-activities-bradenton-sarasota; placements bottom_cta and sticky_book_bar.
- guardrails: no booking_engine_handoff at this internal step; no guide_stay_here placement, destination, public copy, style, metadata, schema or indexability change.
- entry criterion: actual offline desktop/mobile click tests fail on the baseline; requests outside localhost are aborted.
- acceptance: identical tests pass after the attribute repair, with matching event/destination identity and source/medium; required Site release checks and independent exact-head review pass.
- rollback condition: duplicated/missing events, wrong lineage or altered destination; revert this repair through the owning source/release route.

## Historical coverage and evaluation

Historical rainy-day legacy click coverage is unavailable, not zero. New forward
instrumentation cannot reconstruct it or prove no cannibalization. Analytics owns
receipt/queryability and the placement-separated readback in
https://github.com/uncfreak1255-code/seascape-analytics/issues/248.

Preserve the existing experiment in
`2026-10-19-top-guides-stay-here-box.md`: baseline October 5–18, exclude partial
October 19, post-window October 20–November 2 if the confirmed GA4 timezone is
America/New_York. Record this tracking repair's actual release date as a coverage
change within that window; do not restart the experiment. Existing October 23
review can record technical status; commercial verdict remains insufficient
evidence until compatible coverage is available. Preserve concurrent changes.

Technical keep requires deployed behavior; source-only proof supports source
acceptance. Business keep, bookings and revenue remain unproven. Normal daily
consolidated production publishing remains the delivery lane; no early dispatch.

## Scope and proof

This is an attribute-only measurement repair, not a public-copy/search-intent
rescue. Source after removing only the added tracking attributes must equal the
baseline byte-for-byte. Gate 0 competitors are not invented for this repair.
Run the real browser regression red/green plus full verify:release; keep its
synthetic boundary. No paid research, GA4 collection traffic, credential changes,
new jobs, sends or Hostaway mutations are authorized by this source action.
