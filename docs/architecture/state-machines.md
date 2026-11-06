# Application state machines

Base: `fbe2ed5fb6cf6e2bb9d70fe6889c0b1d4139b4a0`, fresh origin/main on
2026-11-06. Owner/sole merger: Codex `codex/state-machines`.
Scope: browser and Netlify app; excludes build/SEO/deploy jobs and provider
internals. Explicit=named state; implicit=DOM/storage/flags/promises. Tables group equivalent events; omitted events leave state unchanged or stay native.
Source/synthetic proof is not production incidence. Handoff isn't reservation.

## Acceptance and worklog

Outcome: inventory, issues, regressions and release/review. Preserve copy,
design, schedules, privacy and capacity. Tests use fake providers and Node 24.14.0.

**Boundary contract, written before implementation:** one queued attempt has one
sender; durable tagging success is terminal; cleanup errors are not provider
failures; ambiguous interrupted attempts never resend automatically; missing CAS
support stops before sending. Preserve three attempts, ten records/batch, existing
15-minute schedule and response contracts. Derived from request/existing behavior.

Red proof: R1–R3 observed 2 calls vs 1; A1 stale open=true vs false; A2 old
checkout href; M1 stale is-open. Green: 1,395 unit tests; release gate; 16 focused
browser checks. Full browser: 618 pass/38 skip; 6 build-interference failures
passed on clean rerun. GitHub PR records final review/publication.

## Confirmed findings, prioritized by impact

| ID | Impact | Reachable base trace / evidence | Group and repair |
| --- | --- | --- | --- |
| R1 | P1 duplicate API effects | Concurrent queued reads both POST;2 calls observed | [#880](https://github.com/uncfreak1255-code/seascape-vacations-site/issues/880): CAS before POST |
| R2 | P1 replay after success | POST+archive succeed; delete throws; catch requeues;2 calls | #880: terminal before cleanup; separate catch |
| R3 | P1 ambiguous replay | Provider accepts, response lost; next worker repeats;2 calls | #880: manual attention for transport/body ambiguity |
| A1 | P2 stale availability | Older open load overwrites newer reserved cache; third request returns open | [#881](https://github.com/uncfreak1255-code/seascape-vacations-site/issues/881): cache generation |
| A2 | P2 old-date handoff | Date input precedes change; old checkout href persists | #881: invalidate input; explicit-submit recovery |
| M1 | P3 inconsistent menu | Open frames run after Escape; hidden plus is-open | [#882](https://github.com/uncfreak1255-code/seascape-vacations-site/issues/882): invalidate frames |

All six repaired with regressions. Source proof only; no live claim.

## 1. Trip memory and handoff — implicit

Source: `src/assets/js/conversion-tracking.js`: readTripParams, rememberTrip,
restoreRememberedTrip, buildBookingEngineHandoffUrl; `guest.js` syncTrip.
States: raw absent/invalid/partial, normalized flexible/dated, remembered,
decorated, outbound. Invariants: normalized dates are a nonpast ordered pair;
positive safe-integer guests; listing URL owns property identity; explicit URL beats storage;
no contact details in tracking. Campaign codes do not prove redemption.

| From | Event/guard | To/action |
| --- | --- | --- |
| absent URL trip | valid unexpired localStorage trip | normalize and restore |
| raw input | invalid date/unknown slug | discard invalid fields |
| editing | valid commit | remember; sync links/URL |
| listing link | explicit dates | preserve dates, guests, property and allowed lineage |
| tracked link | ordinary same-tab click | callback/timeout navigates once (`callOnce`) |
| tracked link | modifier/new-tab/hash | native navigation |
| any | storage unavailable | page works; memory degrades |

Proof: trip-continuity, booking-handoff, tracking-privacy-ids tests. Trip memory is shared per origin; no cross-tab locking.

## 2. Property booking — explicit

Source: `src/assets/js/guest.js`: bookingState, syncTrip, requestStayCheck,
showStay, renderBooking. States: none/invalid/oversized/pending/open/needs-guests/
booked/restricted/failed, plus cached result and request generation.
Invariants: checkout needs checked open dates and fitting specified group;
only current request updates controls; heading/panel/mobile agree; response
completion never navigates.

| From | Event/guard | To/action |
| --- | --- | --- |
| any | group over home capacity | oversized; no checkout |
| any | incomplete/reversed/past dates | invalid |
| any | both dates cleared | none |
| settled/pending | date input differs from committed trip | invalid; revoke outbound actions and generation (A2) |
| valid dated | change/submit | pending or cached same-date result |
| pending | latest complete bookable response | open with group, else needs-guests |
| pending | booked nights | booked; link catalog with trip |
| pending | stay/arrival/departure restriction | restricted; keep editing |
| pending | HTTP/network/missing calendar | failed; listing fallback, no open claim |
| pending | obsolete response | ignore |
| needs-guests | fitting group | reuse same-date answer; open |
| open/failed | unchanged explicit submit | checkout/listing handoff |
| invalid | submit after reverting input | recompute state |
| booked/restricted/none | explicit submit | catalog/arrival focus/arrival focus |

Proof: state-transitions/home-booking-button browser and TesterArmy recovery.
Limits: same-date cache has no TTL; property bfcache freshness unproven.
`visual-test=1` simulates open dates. Snapshot is not a hold.

## 3. Catalog, comparison and sharing — implicit

Source: `src/assets/js/catalog.js`: trip vs form values, activeFilter, selected,
openHomes, availabilityRequest, dialog. States: capacity/checking/open/empty/
failed/draft; selection 0–3; dialog closed/open; share idle/copying/copied/fallback.
Invariants: checked dates AND guests must match displayed fields for checkout;
unknown calendars never mean booked; selected slugs unique/known; share allowlist.

| From | Event/guard | To/action |
| --- | --- | --- |
| any | submit/filter/reset/clear/persisted pageshow | invalidate generation; capacity filter; check if dated |
| checking | current complete response | hide unavailable; prune selection; close dialog if <2 |
| checking | obsolete response | ignore |
| checking | failure/incomplete | capacity fallback; keep candidates visible |
| open | draft differs | listing links, no checkout |
| open | group changes, dates unchanged | submit/recompute immediately |
| 0–2 selected | add known home | +1, sync URL/table/tray |
| 3 selected | add fourth | refuse; explain |
| selected | toggle selected/clear | remove/zero |
| >=2 selected | open or share hash | open dialog |
| dialog open | close | closed; remove hash |
| selection | clipboard success/failure | copied/manual text |

Proof: catalog-card-checkout browser, properties-catalog-layout unit. Last-search
summary can coexist with draft fields; checkout guards identity.

## 4. Availability service/cache — implicit

Source: `netlify/functions/booking-availability.js`,
`scripts/booking/stay-availability.js`. Cache empty/loading(n)/fresh(v)/expired;
stay invalid/unknown/booked/closed-arrival/closed-departure/minimum-stay/bookable.
Invariants: coverage checked before booked; completed newer snapshot never
replaced by older load; departure isn't occupied; no price/reservation produced.

| From | Event/guard | To/action |
| --- | --- | --- |
| request | non-GET/invalid pair/>60 nights |405/400; no load |
| fresh | same NY date, age <3 min | reuse |
| empty/expired | valid request | load eight calendars concurrently |
| loading(n) | complete | serve response; cache only newer generation (A1) |
| loading | error/empty/missing coverage |503 unknown; future request retries |
| complete stay | occupied night unavailable | booked |
| open nights | arrival/departure/length violation | matching restriction |
| open stay | restrictions satisfied | bookable snapshot |

Proof: stay-availability.test.js, including two deferred loads and third cached
read. Cache is per instance; provider loads are not globally serialized.

## 5. Guest capture browser — flags/outcomes

Source: conversion-tracking.js submitInlineEmailForm/parser; guest.js exit popup.
States: ready/in-flight/pending/success/failure; popup eligible/suppressed/open/
closed. Invariants: one request per form; retry reuses submission ID; queued202
is not tagged success; failure stays visible and retryable.

| From | Event/guard | To/action |
| --- | --- | --- |
| ready/failure | valid submit | assign/reuse ID, in-flight, POST |
| in-flight | duplicate submit | prevent; no second request |
| in-flight | tagged response | success; hide input; reset form; subscribed suppression |
| in-flight | retry_queued response | pending; hide input, no success claim |
| in-flight | malformed/failure | visible failure; clear lock |
| eligible | desktop exit, no recent/subscribed marker | record shown time, open once |
| eligible | recent/subscribed/storage denied | suppressed |
| open | close/backdrop/Escape | closed |

Proof: home-exit-signup/guest-email-capture-receipts unit suites; TesterArmy signup
recovery. No pending polling; tabs/forms are independent, not global deduplication.

## 6. Guest capture server/retry — explicit

Source: netlify/functions/guest-email-capture.js and guest-email-capture-retry.js.
States: absent/rejected/visible_failure/guest_capture_tag_applied/retry_queued/
retry_running (internal)/manual_attention_required. Identity: hash(subscriber hash
+ submission ID). Records contain hashes/tags, no raw names/email. Invariants:
strong-read ETag claim precedes POST; subsequent writes match claim ETag;
storage failure never turns success/ambiguity into queued. Terminal queue state
is authoritative until archive/delete completes.

| From | Event/guard | To/action |
| --- | --- | --- |
| incoming | method/malformed/bot rejection |405/400/422; no marketing call |
| absent | member upsert fails | visible_failure502 |
| accepted member | tags succeed | tagged200; metrics best effort |
| accepted member | tags fail, queue persists | queued202, attempts 1 |
| accepted member | queue write fails/conflicts | failure503; no overwrite |
| queued/running | duplicate HTTP capture | pending202; no provider replay |
| tagged/manual | duplicate, canonical or archive |200/503; no provider replay |
| queued | valid config, attempts<=3, CAS wins | running; consume attempt before POST |
| queued | CAS loses | skip; no call |
| queued | missing CAS/read/write failure | worker failure; no call |
| running | lease age 0–120s | skip |
| running | stale/invalid lease | manual, retry_delivery_unknown |
| running | provider success | CAS tagged; archive/delete |
| running | HTTP failure below/at cap | CAS queued/manual |
| running | transport/body ambiguity | CAS manual, retry_delivery_unknown |
| terminal | archive/delete fails | retain terminal; next run retries cleanup only |
| active | outcome write fails | worker fails; persisted claim blocks replay |
| queued | invalid config/exhausted attempts | manual; no call |

Proof: guest-retry-state.test.js covers overlap, cleanup, lease, missing CAS,
duplicates and lost response; receipt suite covers cap/recovery. Legacy records need no migration. HTTP errors retain existing retry policy. Initial successful capture doesn't create a retry archive:
global initial-request/event deduplication is not established. Initial capture
read errors remain a separate risk, not proven repaired.

## 7. Owner wizard/first touch — explicit/implicit

Source: src/property-management/index.njk inline wizard, owner-first-touch.js,
conversion-tracking.js. States: steps 0–3 × submitting; concerns/authority;
first-touch absent/stored/storage-unavailable. Invariants: final submission
requires all required fields plus listing/address OR concern; navigation alone
isn't inquiry creation; source fields are sanitized, no raw referrer URL.

| From | Event/guard | To/action |
| --- | --- | --- |
| step i | Next/forward dot, current fields valid | selected step; rebuild confirmation at 3 |
| step i | Back/earlier dot | prior step |
| any | concern/note edit | sync hidden/confirmation; clear alternative-context error |
| any | invalid submit | reveal invalid panel; report validity |
| any | valid submit | submitting; delayed native POST |
| submitting | repeat submit | prevent |
| away | browser returns/reloads | restored/reinitialized form; E2E tests recovery |
| no first-touch | first page | store sanitized touch, even empty |
| stored touch | later page | reuse |
| blocked storage | page load | use current page touch |

Proof: owner-first-touch/intake, owner-form-steps, TesterArmy owner recovery.
Empty first-touch is preserved.

## 8. Owner intake/delivery/rate reservation — explicit

Sources: netlify/functions/submission-created.js, owner-lead-form-webhook.js,
_netlify-jws.js, _owner-lead-{contacts,delivery,confirmation,mail,abuse}.js.
Delivery states pending/sending/sent/failed/unknown; monotonic ownerSent and
internalSent flags; remainingAttempt and lease. Contact capture is prerequisite.
Rate bucket tracks submission IDs plus email/global hourly reservations.
Invariants: public event URL doesn't send; signed webhook required; contact
persists before mail; accepted legs not repeated; ambiguity freezes; independent
metrics failure doesn't discard captured inquiry.

| From | Event/guard | To/action |
| --- | --- | --- |
| public event URL | HTTP call |404; no send |
| webhook | invalid/unconfigured signature | reject |
| accepted payload | invalid/unsupported form | reject/ignore |
| accepted | contact persistence failure | notify; withhold confirmation |
| captured | both legs known sent | repair delivery state, no send |
| captured | rate denied/unreadable | no send |
| captured | CAS claim wins | sending; missing legs only |
| sending | duplicate before 120s | in-flight; no parallel sender |
| sending | stale, no durable progress | unknown |
| stale first claim | durable partial progress | one flagged remaining-leg attempt |
| stale remaining attempt | missing leg uncertain | unknown; no replay |
| sending | both accepted/persisted | sent |
| sending | owner accepted/internal failure | retain owner flag; safe missing-leg retry |
| sending | ambiguous transport | unknown |
| safe transient failure | webhook retry | claim missing work;503 requests retry |
| rate reserved | same submission retry | reuse reservation |
| rate bucket | concurrent new request | CAS/retry; exhausted failure denies |

Proof: owner-lead-delivery-races/confirmation/contacts/receipts and
owner-inquiry-boundary tests. Owner code unchanged.

## 9. Metrics/auth/relabel — implicit

Sources: netlify/functions/_guest-email-capture-metrics.js,
_guest-capture-rejection-metrics.js, _owner-lead-metrics.js, *-metrics.js and
*-proof-label.js. States: absent/valid/unreadable aggregate; unseen/seen/labeled
receipt; unauthenticated/authenticated/invalid/served/updated request.
Invariants: no contact PII in projections; protected reads/relabels require token;
relabels target named receipt IDs. Counts are best-effort, not delivery truth.

| From | Event/guard | To/action |
| --- | --- | --- |
| absent | receipt | sanitized aggregate |
| aggregate | new/duplicate ID | increment/merge metadata |
| aggregate | overlapping read-modify-write | last writer wins; loss possible |
| request | unauthorized read/relabel | reject |
| authenticated | valid relabel IDs | rewrite matching labels |
| write | storage error | record failure; delivery stays independent |

These nontransactional metrics permit lost counts; no exactly-once claim.

## 10. Analytics/guide carry — implicit

Sources: homepage.js, conversion-tracking.js, analytics-ga4.njk.
States: suppressed/deferred/loading/queued/dispatched; navigation waiting/done;
guide carry absent/staged/consumed/discarded. Invariants: PII scrubbed; QA disabled;
callback once; guide carry one tab slot, consumed once within 60s at matching home.

| From | Event/guard | To/action |
| --- | --- | --- |
| deferred | interaction/load timeout | load once; queue events |
| loading | resolves | drain queue |
| any | QA suppression | no collection; discard carry |
| guide click | same-tab property, storage works | stage sanitized event with guide identity |
| guide click | new-tab/external/no storage | direct best-effort event |
| staged | matching destination, age 0–60s | consume then dispatch |
| staged | stale/wrong/malformed | discard |
| navigation waiting | callback OR timeout | done; later callback ignored |

Proof: guide-card-handoff/analytics-traffic and guide-card-tracking browser.
Dispatch is not collection proof.

## 11. Presentation machines — explicit/implicit

Paths are under src/assets/js unless stated otherwise.

| Machine/source | States/invariant | Transition table |
| --- | --- | --- |
| Menu, guest-menu.js | closed/opening/open/closing; aria/hidden/classes agree | click opens/closes; Escape closes; reopen cancels timer; only current generation finishes open (M1) |
| Press, guest-menu.js | idle/pressed; at most one target | primary down selects; up/cancel/outside move/blur clears |
| Scenes, home-scenes.js | selected/loading(request)/shown; one scene, latest wins | arrows wrap; decode commits current generation; failure uses photo fallback; keyboard immediate |
| Photos, guest.js/property-gallery.js | unhydrated/loading/loaded/unavailable; never another home's photo | view hydrates neighbors; load reveals; error replaces once; scroll/arrows update count |
| Gallery dialog, guest.js | closed/open; native modal semantics | open hydrates/showModal; close/Escape closes |
| Reviews, property-reviews.js | active/target/dragging; index clamped | arrow/button targets; scroll updates active; scrollend reconciles; release snaps; resize preserves active |
| Film, stay-story.js | orientation × idle/loading/playing/buffering/ended/error; one play per version | click plays/retries; resize invalidates/reset; stale promise ignored; waiting/playing update; ended offers replay |
| Plans, rainy-day.js | one selected plan and visible panel | click synchronously updates pressed values and panels |
| Contents, guide-contents.js | none/current; at most one aria-current | intersection sets matching anchor |
| Sticky CTAs, guest/rainy-day/owner/area-guide-mobile-cta-guard.njk | hidden/visible | intersection/scroll/resize recomputes; no booking effect |
| Offer, save50-offer.njk/guide-conversion-kit.njk | cold/warm; idle/copying/copied/manual | campaign reveals; clipboard success/failure copies/selects; reset after 2100ms |
| Legacy site-header-script.njk/homepage.js/email-popup.njk | collapsed/expanded; popup not-ready/eligible/open/dismissed/suppressed | resize collapses; delay/exit shows if target exists; dismiss records cooldown |

Proof: control-motion/guest-path-motion unit; state-transitions/waterline-scenes/
open-house-journey/design-floors and media browser suites. Legacy consumers retained.

## Verification and limits

- Handler proof: `node --test scripts/enforcement/guest-retry-state.test.js scripts/enforcement/guest-email-capture-receipts.test.js scripts/enforcement/stay-availability.test.js`.
- Browser proof: `npx playwright test tests/visual/state-transitions.spec.js tests/visual/home-booking-button.spec.js`; desktop and phone, intercepted external effects.
- Journey proof: TesterArmy property recovery and phone navigation.
- Release: `npm run verify:release -- --range origin/main`; final-SHA independent review and GitHub checks.
- Deployment is separate: `npm run verify:merge-live -- <squash-sha>` checks production ancestry; Netlify deployed revision and live smoke still required.

No exhaustive or live-delivery claim. Update tables with state/guard changes.
Tests: scripts/enforcement (unit), tests/visual (browser), tests/e2e (journeys).
