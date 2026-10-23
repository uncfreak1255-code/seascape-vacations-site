# Bradenton guide sticky-button measurement repair

- lifecycle: active
- task scope: record the existing sticky catalog CTA through the existing guide funnel, with its existing navigation, copy and layout.
- authority: Sawyer requested the first saved-data-only SEO improvement loop on October 20, 2026. This session owns the isolated Site repair and source closeout.
- source files changed in this batch: `src/guides/things-to-do-bradenton-fl.html`, `tests/e2e/guide-handoff.e2e.ts`.

## Selection from saved evidence

CURRENT EVIDENCE: local OpenSEO project Seascape Vacations,
`7c97b83b-1950-41f1-a797-f7c7a79390e4`, US English mobile, depth 40,
completed run `f7274a81-f43b-40f0-b154-f08fe5f6dca8`, October 15, 2026:
`attractions in bradenton florida` points to this existing guide at position 8;
`attractions bradenton fl` points to it at position 19. Cached search volume
6,600 is a provider estimate, has no metric observation date in this response,
and is not visits or two independent audiences. Desktop rows are excluded
because the active tracker is mobile. Saved rank data is triage, not current
SERP competition or a reason to rewrite the page.

The complete Analytics receipt for October 10–16, emitted October 18, remains
`fresh but below threshold` and `hold-and-reread`. It does not establish this
guide's conversion baseline. It does not authorize growth expansion. The
deterministic source defect is independent: this sticky anchor has no tracking
attributes, so the existing click handler exits before recording a guide event
or attaching the guide-click identity to the catalog navigation.

## Outcome contract

- hypothesis: measuring the existing sticky-button click restores an observable guide-to-catalog handoff; traffic or booking improvement is unknown.
- primary event: existing `guide_book_direct_click`, with this guide slug and `placement=sticky_book_bar`.
- guardrail event: no `booking_engine_handoff` at this internal catalog step; preserve source/campaign and catalog destination.
- entry criteria: reproduce missing click event and guide identity on the actual built route in an offline browser.
- readback window: technical browser proof now; production proof after the existing consolidated publish. Commercial evaluation requires compatible complete post-release data owned by Analytics.
- decision rule: technical keep after deployed click behavior passes; business outcome remains insufficient evidence until Analytics has adequate comparable coverage. Do not label the new observable clicks as growth against an uninstrumented baseline.

Revenue lever: existing guide visitors progressing toward direct-book homes.
Proof surface: synthetic desktop/mobile browser click, recorded event and
matching guide-click identity on the destination URL. Owner: Site source and
release; Analytics retains metrics and outcome interpretation. What stops:
new-page expansion, title experiments and unrelated guide rewrites.

## Scope and rejected alternatives

This is an instrumentation repair, not public-copy, metadata, search-intent,
indexability, design or routing work. No new SERP capture is made or claimed.
The existing ranking page is protected. Source/public-copy extraction must be
identical before and after the edit. Do not manufacture a Gate 0 competitor
receipt for an attribute-only repair.

Bradenton vs Sarasota is position 2 in the saved mobile run; protect it instead
of following the older desktop position-5 rescue note. Best Time to Visit AMI
has only 19 noncanonical impressions out of 1,518 in the saved Analytics window;
its canonical/redirect source already exists, and Analytics PR 246 addresses
classification. The five-guide stay-here measurement work is already owned
under Analytics issue 248. Owner-page ranking changes require competition and
qualified-demand evidence absent from this saved-only run. Do not duplicate
those lanes or infer a content rewrite from them.

## Release and evaluation

Run the browser regression red/green, required Site release checks and an
independent exact-head review. Preserve the existing daily consolidated
production release. Until published and verified, report merged/queued rather
than live. Roll back with a source revert through the same release lane.
No paid calls, collection runs, tracking identifiers, data fields, schedules,
provider changes, credentials or early deployment are introduced.
