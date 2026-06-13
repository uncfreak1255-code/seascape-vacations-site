# Brief: Guide → Owner Referral (Card 1 of the demand OS V1)

> Authorized by `docs/plans/2026-06-13-demand-os-handoff.md` (Card 1). This is a
> conversion surface on an existing winner, not new page volume or expansion —
> it is allowed alongside a `fresh but below threshold` hold, like the repo-audit
> V1 conversion/infrastructure work. One active brief, one branch.

## Content Gate Inputs

- persona: a home-owning reader who landed on the Bradenton vs Sarasota vacation guide and happens to own (or is considering owning) a Gulf Coast rental property
- primary keyword: none new — this is a conversion module on an existing ranked page, not a keyword play
- secondary keywords: n/a (no new indexable target; the module is on-page CRO)
- audience pattern: most readers are guests; a small fraction own Gulf Coast property and silently bounce because the page offers them nothing
- proof source: `seascape-hub/projects/owner-acquisition-machine.md` Approved Quantified Proof only (observed 13.4% Airbnb host-fee drag, 2.9% direct payment cost, 10–15% fee range); the public benchmark page `/research/owner-fee-revenue-leak-benchmark-2026/`
- required internal link: `/research/owner-fee-revenue-leak-benchmark-2026/` (the public benchmark → teardown form)
- CTA target: the benchmark page for owner-economics intent (NOT the guest direct-booking CTAs already on the page)
- anti-claims: no claim the funnel already produces owner leads; no blanket 15% quote; no review-count/Superhost theater; no claim Seascape manages the reader's market unless true; nothing that blurs the guest direct-booking offer

## Why This Batch

- what changed: the demand-OS handoff (2026-06-13) makes the guest→owner referral the LEAD owner-demand path because it is the only founder-proof, list-free, impression-independent surface — and the #1 bottleneck (owner acquisition) is structurally unreachable by the on-page loop (owner_money = 42 impr, gate needs ≥1000, falling).
- why this cluster wins now: `guide_winners` is the only cluster with real traction (5,886 impr / 230 GA4 sessions/wk, verified `next-batch.md` 2026-06-12), and `/guides/bradenton-vs-sarasota/` is its strongest member — yet it carries ZERO owner CTA (verified: `guide-conversion-kit.njk` is guest-only).
- what should explicitly wait: cold outbound (Lane B) until the homeowner-list milestone clears; any second-guide rollout until this module proves an owner can be discovered here.

## Experiment And Readback Contract

- hypothesis: a quiet owner-economics referral on the top guide winner routes a home-owning reader to the benchmark → teardown form and produces the first impression-independent owner signal, with zero ongoing founder effort.
- primary event: `guide_owner_referral_click` (navigation) on the guide page → then the EXISTING `owner_primary_cta_click` / `owner_form_submit` at `/research/...benchmark.../` (owner_money cluster) as the real owner signal.
- guardrail event: no owner event may originate-and-convert on the guide page; the owner conversion is measured only at the benchmark form (owner_money cluster).
- entry criteria: this brief active; the module copy passes the content gate + voice chain; benchmark page fact-clean (one-line owner-truth-prep check).
- readback window: the first weekly analytics receipt after deploy that can read `guide_owner_referral_click` counts separately from any owner_money conversion.
- decision rule: if the referral fires but never reaches the benchmark form, rewrite the module copy once; if it produces a real unlabeled owner reply, log it via `owner-reply-intake`; do not expand to other guides until one owner is discovered here.

## Search Operator Read

- source reads used: `docs/status/next-batch.md` (2026-06-12 cluster table), `docs/plans/2026-06-13-demand-os-handoff.md`, `seascape-analytics/db/init/01_schema.sql` (cluster mapping), `src/assets/js/conversion-tracking.js` (event handling).
- main evidence: clustering is by PAGE PATH (`01_schema.sql:315-327`), so a `guide_owner_referral_click` on `/guides/bradenton-vs-sarasota/` is attributed to `guide_winners`, never `owner_money` — it cannot perturb the owner gate (`recommend_next_branch:722-728` sums only owner_money rows). The new event is not in any existing conversion SUM, so it is inert in current aggregations until deliberately read.
- GA4 evidence: guide_winners 230 sessions/wk; owner_money 0 sessions — the guide is where home-owning humans actually are.

## Cluster In Scope

- canonical winner URL: `/guides/bradenton-vs-sarasota/` (source `src/guides/bradenton-vs-sarasota.html`)
- feeder pages: none touched
- aliases or retired URLs: none touched
- money destination: `/research/owner-fee-revenue-leak-benchmark-2026/` → teardown form (existing owner_money funnel)
- active lane: owner acquisition (via guest-surface referral) — Lane A of the demand OS

## Source And Proof Constraints

- property truth needed: none beyond what the benchmark page already carries; no per-property claims in the module.
- owner proof asset needed: Approved Quantified Proof in `owner-acquisition-machine.md` only; do not invent fee/revenue figures.
- claims off-limits: see anti-claims above; honor `owner-proof-integrity`.
- Seascape-specific proof the module can add: the honest framing that the management fee is rarely the whole leak (fee stack + OTA drag) — already approved positioning.

## Page Builder Tasks

- source file to change: `src/guides/bradenton-vs-sarasota.html` ONLY (a quiet owner-referral block placed AFTER the guest `guideConversionKit(...)` call so it never blurs the guest offer).
- event taxonomy (LOCKED): the referral link carries `data-track-event="guide_owner_referral_click"` + `data-guide-slug="bradenton-vs-sarasota"` + a `data-track-label`. It is a NAVIGATION event only. It must NOT use any `owner_*` event name and must NOT use `data-form-*`. No analytics change required for V1 (the event is inert in existing views; clustering is page-based).
- redirect/schema work: none.
- internal-link/CTA work: one link to `/research/owner-fee-revenue-leak-benchmark-2026/`.
- money CTA + downstream tracking to verify: the benchmark page's existing `owner_primary_cta_click` / `owner_form_submit` wiring is the real owner conversion — confirm it is intact (Card 3's V1 prerequisite is already shipped: research-page GA4 tracking, repo-audit V1 Task 3).

## Voice Editor Checklist

- tone risks: sounding like a sales pitch dropped into a vacation guide; owner jargon ("fee stack") that reads as manufactured in guest context — keep it plain, quiet, and clearly addressed to "if you own a home here."
- generic/mechanical patterns to kill: setup-reveal structure, throat-clearing, AI rhythm; run `enterprise-ui-writing` then `humanizer` on the module copy.
- proof/specificity checks: every number traces to Approved Quantified Proof; no invented results.
- customer wording: keep the owner-economics framing in plain English (owner net, not "fee optimization").

## Release Gate Checklist

- routes to smoke test: `/guides/bradenton-vs-sarasota/` (status 200 + existing body assertions — verified the module touches neither Hostaway S3 URLs nor `images/` paths, so no `assert-live-smoke.js` TEXT update is required).
- commands to run: `npm run lint:content && npm run build && npm test && npm run verify:release`; `npm run test:visual` and commit a FRESH desktop + mobile baseline for this route (the page gains a visible block — a baseline change is EXPECTED here; review the rendered diff before committing).
- regression risks to watch: the new event must not appear under `owner_money` or inflate guide conversion (verify in the built page that the only owner-named events still live at `/property-management/*` and `/research/*`); the guest conversion kit must be unchanged.

## Done When

- `src/guides/bradenton-vs-sarasota.html` carries a quiet owner-referral block linking to the benchmark, copy passed the voice chain + content gate, `guide_owner_referral_click` fires as a navigation event in the built page, all gates green, a fresh reviewed visual baseline is committed, and the PR is opened for review (stop before merge).

## Post-Reread Outcome

- reread window used:
- crawl freshness result:
- actual `guide_owner_referral_click` count + any downstream benchmark owner event:
- decision taken: hold, rewrite once, or (only after one owner discovered) consider a second guide
- next branch slug or explicit wait state:

## Not In Scope

- any second guide or rollout beyond `/guides/bradenton-vs-sarasota/`
- any change to the guest conversion kit, SAVE50, or direct-booking CTAs
- any analytics-repo change (the event is inert by design in V1)
- any new owner page, new keyword target, or page volume
- cold outbound (Lane B) — gated on the homeowner-list milestone (Card 3)
