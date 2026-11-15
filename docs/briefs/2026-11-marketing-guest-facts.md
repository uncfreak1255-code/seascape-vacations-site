# Brief: Guest facts and AMI guide handoff repair

- lifecycle: active
- task scope: user-authorized source-backed corrections to pool/group policy and mainland location claims in the existing near-AMI stay collection; native tracked links on existing AMI area-guide property cards. Preserve layout, titles and approved pool-heat terms. Correct inherited false on-island metadata and remove unsupported schema-only pet/walk questions without a title or ranking experiment; put mainland/drive guidance in the existing featured-home subtitle. No new growth batch.
- completion or successor: source patch under review on codex/marketing-guest-facts-20261114; publication belongs to the parent coordinator.

## Content Gate Inputs

- persona: families and small groups comparing a mainland Bradenton home for Anna Maria Island beach days
- primary keyword: vacation rentals near Anna Maria Island
- secondary keywords: Anna Maria Island homes with pool; Anna Maria Island area guide
- audience pattern: compare actual location, capacity and rules before opening a home's dates
- proof source: site base 75892900; Seascape Hub origin/main e1f3aa2e context/seascape-properties.md, inspected 2026-11-14, shared no-parties/events rule line 269, guest limits including visitors, Bradenton addresses and Sarasota Luxe address at 119 South Shade Avenue, Sarasota; approved PR #949 pool-heat terms unchanged
- required internal links: /properties/dockside-dreams/#check-availability, /properties/the-oasis/#check-availability, /properties/river-house/#check-availability, /stays/vacation-rentals-near-anna-maria-island/
- CTA target: /properties/dockside-dreams/#check-availability; /properties/the-oasis/#check-availability; /properties/river-house/#check-availability; /stays/vacation-rentals-near-anna-maria-island/
- anti-claims: no parties/events invitation; no all-homes 10–15-minute promise; no Sarasota home represented as Bradenton near-AMI inventory; no new inclusions, prices, on-island address, availability, title/ranking experiment or booking/conversion lift claim

## Why This Repair

The pool FAQ invited larger events despite the shared house rule. The near-AMI collection included Sarasota Luxe beneath a blanket short-drive claim. AMI area property cards depended on JavaScript and omitted existing guide click lineage. These are source/behavior defects, not a new page or visual opportunity. The airport guide already has its conversion kit and tracking; leave it unchanged rather than repeat an existing feature or add unneeded UI. Rainy day and the held weather, best-time, AMI-vs-Siesta and shelling guides remain untouched.

## Experiment And Readback Contract

- hypothesis: correcting false policy/location claims and using native links removes demonstrated decision and navigation defects; this is a repair, not a ranking test
- primary event: existing guide_property_check_dates_click, with guide_slug, property_slug, placement and sv_guide_click_id
- guardrail event: existing guide_book_direct_click on desktop and mobile sticky collection links; no duplicate primary click
- entry criteria: verified source contradiction and JS-only card implementation at base 75892900
- readback window: source/build and isolated browser regression now; any later demand read uses the existing frozen 22-prompt cohort and complete deployed analytics windows
- decision rule: retain if facts match canon, links work without JavaScript and one click delivers one event with lineage; do not infer bookings or lift from synthetic checks

## Gate 0 Search And Attack Receipt

| Field | Required answer |
| --- | --- |
| Target query family | Anna Maria private pool rentals; Bradenton private pool vacation rentals; Sarasota airport Anna Maria Island |
| Searcher intent | Compare pool homes by location/capacity and plan airport arrival; no intent change in this repair. |
| Current Seascape URL | /stays/anna-maria-island-homes-with-pool/; /stays/vacation-rentals-near-anna-maria-island/; /guides/anna-maria-island-area-guide/; airport route inspected but unchanged. |
| SERP observed date | 2026-11-14 |
| SERP stale after | 2026-11-21 |
| Current proof | Parent coordinator's 2026-11-14 free search receipt; source base 75892900 and Hub e1f3aa2e. GSC Oct 15–Nov 11: AMI area guide 0 clicks/1432 impressions; airport 22/3080. Not a rank receipt or causal evidence. |
| Top visible competitors | AnnaMaria.com pool rentals; Beach Boutique Rentals; Florida Dreams airport transportation; Rome2Rio SRQ to Anna Maria Island. |
| Competitor angle | Pool listing location, bedrooms, capacity, amenities and property links; airport mode/route comparisons. |
| Visual/format gap | Existing page already supplies cards and planning content. Preserve appearance; restore native navigation rather than redesign. |
| Seascape gap | Misleading mainland selection and event guidance; AMI cards missing native date targets and established tracking attributes. |
| Search fit | Repair the existing URLs and send visitors to each actual property's dates section; no new page, title or ranking experiment. |
| Local/GBP proof | Not applicable: no Maps/profile claims or edits; location corrections use authoritative property addresses. |
| AEO/readback note | Preserve the existing frozen 22-prompt readback cohort; no new measurement system or lift claim. |
| Recommendation | Repair facts and native tracked handoffs only. |
| Attack status | completed |
| Query variants inspected | Anna Maria private pool rentals; Bradenton private pool vacation rentals; Sarasota airport Anna Maria Island; SRQ airport Anna Maria transportation; Sarasota airport Anna Maria guide; Anna Maria Island airport transfer. |
| SERP source | Parent coordinator's free live web search, 2026-11-14; no paid checks. |
| Competitor URLs inspected | https://www.annamaria.com/anna-maria-rentals/pool-rentals/ (search excerpt only; fetch challenged); https://www.beachboutiquerentals.com/private-pool-rentals/ (fetched); https://www.florida-dreams.com/transportation-from-the-airport-to-the-island/ (search excerpt); https://www.rome2rio.com/s/Sarasota-Bradenton-Airport-SRQ/Anna-Maria-Island (search excerpt). |
| Content gap and Seascape answer | State no events and home-specific limits; show only Bradenton homes in this near-AMI collection; make actual home/date links usable natively. |
| Design/format strategy | Keep existing grid, type, card dimensions, photo treatment and sticky CTA appearance. Add native anchor display/text-decoration reset and keyboard focus outline only. |
| Seascape proof available | Authoritative property addresses and shared guest rules; existing conversion tracking and guide-card event contract. |
| Tools/plugins used | Free web search/fetch by coordinator; repository source, Node tests, Eleventy build and isolated Playwright. |
| Decision and reason | Bounded repair: verified contradictions and missing navigation behavior are sufficient; no expansion or design experiment. |

## Page Builder Tasks

- source files likely to change: `src/_data/seoPages.json`; `src/guides/anna-maria-island-area-guide/index.html`
- supporting tests: `scripts/enforcement/marketing-guest-facts.test.js`; `scripts/enforcement/ui-runtime.test.js`; `scripts/enforcement/stay-facts-derived.test.js`; `scripts/evals/lane-copy.test.js`; `tests/visual/guide-card-tracking.spec.js`
- redirect or schema work: none separately authored; stay FAQ data continues to render visible answers and schema from the same source
- internal-link or CTA work: three native home anchors with dates hash and area_guide_property_card placement; both tracked sticky collection links
- money CTA and downstream tracking event to verify: guide_property_check_dates_click once, with matching guide click ID at destination; no-JavaScript native navigation for all three cards

## Voice Editor Checklist

- Draft the copy: completed, 2026-11-14. Answer the party and locality questions directly; do not change heat terms.
- Remove internal wording: completed, 2026-11-14. No process labels or measurement claims in reader copy.
- Check voice and specificity: completed, 2026-11-14. Plain limits and home-specific route guidance replace unqualified promises. Independent targeted reviewer owns final Approved verdict.

## Verification And Boundaries

- Focused source/runtime tests cover policy, collection membership, native dates anchors, lineage and one-event delivery.
- Required build, content and design/behavior checks remain gates. Native-module security failures are blockers, not permission to replace dependencies or remove quarantine.
- No commit, push, merge, baseline refresh, dependency changes, new pages, global UI changes, paid research, schedules or measurement pipelines in this implementation lane.

## Coordinator Verification Receipt

- 2026-11-14: independent source/voice review Approved; follow-up review Approved exact-wording test updates without relaxing occupancy/token coverage.
- Sawyer explicitly approved restoration of four lockfile-checksum-verified Sharp/libvips/Oxc native binaries and removal of their quarantine attributes inside this worktree only. No dependency versions, lockfile or global security settings changed. All four restored files matched the verified archive bytes and loaded successfully.
- `npm run verify:release -- --range origin/main` passed after that repair, including all 1,400 unit tests, content/design gates, recovery checks, 164-page link validation and 690 JSON-LD blocks. The separate full visual suite passed: 684 passed, 94 expected device-specific skips, zero failures; no baseline refresh or threshold changes.
- Focused AMI native-link/lineage checks passed on desktop and mobile, including JavaScript-disabled navigation. Local desktop/mobile proof was inspected; this is not production proof.
- Coordinator may save the directed codex branch and open a review PR only after the complete gate. Merge and publication still require Sawyer's separate approval. No paid audit, new schedule, baseline refresh or marketing attribution claim is authorized by this receipt.
