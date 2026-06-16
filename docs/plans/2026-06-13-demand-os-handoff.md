# Demand Operating System — Frozen V1 Handoff
*Frozen 2026-06-13. Source: 5-verifier discovery → 4-premise judge panel → synthesis → 4-lens adversarial review → 3 thirty-day pre-mortems (all REVISE) → finding-by-finding adjudication against repo source → canonical `repo-dev-setup` inventory pass. Planning only; this document is the approved plan, not yet an implemented system. Self-contained: an implementation agent needs nothing outside it plus the four repos.*

**What this fixes.** The SEO operating loop is a clean on-page state machine whose entire above-gate vocabulary (rewrite / consolidate / CRO) cannot touch the #1 bottleneck — owner acquisition — because the only owner lever is off-page / outbound demand generation, which lives fully specified in hub canon but has **never once been executed**. The reread contract held the loop in `hold-and-reread` for ~5 weeks while owner impressions actually *fell* (413 → 42), because its only sub-gate action is "wait" and its only above-gate action is an on-page rewrite gated on ≥1000 owner impressions (~24× the current run rate). This adds the two missing lanes the contract never had — a hold-escalation branch that routes the deadlock to outbound, and an outbound execution home with its own proof gates — while preserving the contract's anti-sprawl discipline, the ownership lanes, the proof-label invariant, the no-new-page-volume rule, and the ≤2 hr/week solo ceiling.

**Success metric for the whole system: owner leads opened + direct bookings. Impressions/CTR are diagnostics only.**

---

## 1. The decision (and the one correction the adversarial pass forced)

Cold outbound is **not** the spine. It has two failure dependencies that have killed it before: a homeowner target list that **does not exist in any repo**, and founder send-discipline that **died every prior time** (the "Pat" row: a real inbound form, 4 unanswered follow-ups, still "active qualification only"; the March 2026 trackers: every row "Not started"). Making outbound the spine repeats that death.

So the lead path is the **guest→owner referral module** on the one surface with real traction (`guide_winners`: 5,886 impr / 49 clicks / 230 GA4 sessions/wk, currently zero owner CTA). It needs **no list and no founder send** — it is the only founder-proof, impression-independent path to a first owner lead. Cold outbound becomes the **parallel volume engine**, built alongside, **list-gated**, and explicitly dependent on send-discipline (named as the headline unmitigated risk).

This is the synthesized winner ("OOOS" spine + grafts from the distribution and GEO designs) revised after a 4-lens adversarial review and three 30-day pre-mortems that unanimously returned **REVISE** for exactly this re-weighting.

---

## 2. The system — three firewalled lanes

| Lane | Job | Trigger | Founder-proof? | Demand-proof gate |
|---|---|---|---|---|
| **A · Guest→Owner Referral** (LEAD) | Quiet owner-economics module on the top guide winner → benchmark → teardown form | Always-on, on existing traffic | **Yes** | unlabeled owner form-submit at `/research/` benchmark → register |
| **B · Owner Outbound** (VOLUME, list-gated) | Homeowner benchmark→teardown outbound; runbook + send-log in `docs/status/owner-outbound.md` | Weekly, **after** the homeowner-list milestone clears | No (send-discipline = headline risk) | unlabeled real reply meeting the register Validation Standard |
| **C · On-page (unchanged) + hold-escalation** | Existing 5-branch loop; new escalation replaces the silent "wait" on the owner cluster, pointing the founder to Lane B | Weekly analytics receipt | n/a (routes) | stays in the 3-status enum; never `open next batch` |

**Honesty backbone (verified sound; keep intact):** UNLABELED = real / LABELED = test, one-way in code (`relabelOwnerLeadReceipts` only adds a label, never strips one); the single scoreboard is the hub `negative-proof-register.md` claim `CLM-OWNER-BENCHMARK-DEMAND-PROVEN`, which flips **only** on a completed real teardown; a quarter of green "SENT" activity with zero real replies reads as **failure**, honestly.

---

## 3. Adjudication ledger (finding-by-finding, repo-verified)

**Seed findings:**
- *"~42/wk owner impressions, −90%"* → **corrected**: peaked **413** (read 2026-05-08), now **42 and falling**, −89.8% from peak (`docs/status/next-batch.md`). Direction true; not a flat run-rate.
- *"reread held ~5.5 weeks continuously"* → **corrected**: status alternated `blocked by freshness`/`fresh but below threshold`; the *hold-and-reread recommendation* held ~5 weeks, broke to `open next batch` 2026-06-11, reverted 2026-06-12.
- *"guide_winners grew 4.4×"* → **confirmed** (4.36× impressions, 5.44× clicks; position 5.63 → 4.34).
- *"one semi-live distribution lane (AI-search)"* → **refuted / sharpened**: `docs/briefs/2026-06-ai-search-ahrefs-response.md` is a *planning* brief ("a planning and orchestration brief first"); its distribution phase has no execution home — same disease as outreach.
- *"canon outreach kit is reusable"* → **refuted and worse**: the hub "Outreach Kit" (`operator-outreach-sequence-2026-03-28.md`) is a **SWARM software-validation pitch to 5 competing property managers** ("internal AI workflow for guest-thread triage… 20-minute coffee"; rule: *"If they say owner acquisition is the real problem, log it and move on"*); the named target list (`operator-validation-targets-2026-03-26.md`, titled "Swarm Operator Validation Targets") is competing PMs. The homeowner *copy* exists in `owner-acquisition-machine.md`; the named homeowner *target list* exists nowhere.
- *"owner leads / direct bookings exist"* → **confirmed zero on both**; nuance: real guest email captures emerged 0 → 8 → 36 in May (demand-side signal real; revenue attribution is not).

**Synthesized-winner claims overturned (and the fix folded into the cards below):**
- *"escalation rides `concrete_next_move` with zero code change"* → **refuted** (verified `weekly_search_operator_report.py:1192-1203`: `build_concrete_next_move` is a hardcoded 3-arg function, no owner-state branch). Escalation is a real, **bounded analytics-lane edit** — owned, not hidden (Card 2).
- *"`owner_subgate_persistence` is one additive field"* → **refuted**: would be net-new cross-window state, and the sub-gate condition is effectively **permanent** → **drop the persistence counter**; key the escalation off the current-window owner sub-gate already computed at `recommend_next_branch:722-728`.
- *"`bradenton-vs-sarasota` is not smoke-asserted"* → **refuted** (`assert-live-smoke.js:12,148`). Card 1 must run `test:visual` + commit a fresh baseline and verify the route's existing smoke body-assertions still pass.
- *"`owner_form_submits == 0` is the anti-masquerade guard"* → **refuted**: the gate counter is proof-label-**blind** (`01_schema.sql:377`, GA4 event sum, no label filter); it only suppresses the on-page rewrite branch. The real demand guard is the hub register Validation Standard + `owner-reply-intake`'s behavioral refusal (a human gate). Re-credited in Card 4.
- *"stale-date header is a forcing function"* → **refuted**: it is a passive aid in a file the founder won't open under stress. **Founder send-discipline is the headline, unmitigated risk.** Lane A is the hedge; Card 3 adds a kill/decay rule.
- *"email reply logged by a hub session, in-lane"* → **partially refuted**: an Outlook thread is not an agent-reopenable receipt; transcribing it approaches the briefing's forbidden move → email demand-proof is **provisional** until repo-anchored (Card 4).
- *"The Oasis 6BR/waterfront entity drift"* (judge claim) → **refuted**: on-site facts are clean (`properties-fallback.json` = 5BR/3BA/sleeps 16; `llms.txt:29` correct; Oasis amenities correctly exclude "waterfront"). `owner-truth-prep` demoted from a blocking Week-1 skill to a one-line pre-flight checklist.
- *"first owner lead in ~21 days"* → **revised**: outbound is list-construction-bound (~3-4 weeks for the list alone). Honest 30-day expectation ≈ 0 real owner leads, with Lane A the only non-zero path.

**Claims that survived verification (do not touch):** the deadlock thesis; the contract byte-safety boundary (`sync-next-batch-from-analytics-receipt.js:144-153` rewrites only `## Latest Execution Read` → `## Likely Priorities`); the 3-status enum + never-`open next batch` invariant; the proof-label one-way property; relocating the execution home from hub to SITE `docs/status/`; keeping direct-book honestly blocked (attribution source `direct_booking_attributed_reservations` MISSING; hub already demoted direct-booking from the growth lane); cutting GEO/distribution to a single runbook rule.

---

## 4. Locked V1 scope — 4 task cards (demand-first ordering)

> Principle (anti-sprawl): ship the founder-proof demand surface first; never promise sends V1 cannot force. Each card = worktree + `codex/<task>` branch + PR; `npm run lint:content && npm test && npm run verify:release` green; diff audit before PR; `git revert` rollback. Stop for review before merge.

### Card 1 — Guest→Owner Referral module (SHIP FIRST; the only founder-proof demand surface)
**Owner lane:** SITE.
**Purpose:** manufacture owner discovery from the only surface with real traffic, with zero ongoing founder effort.
**Change:** add a quiet, content-gate-bounded owner-economics module to `/guides/bradenton-vs-sarasota/` (the single named top guide winner) that routes a home-owning reader to `/research/owner-fee-revenue-leak-benchmark-2026/` then the teardown form.
**Event taxonomy (define BEFORE building):** the module fires `guide_owner_referral_click` as a **navigation** event that must NOT register as `owner_money` cluster (would corrupt the on-page gate) and must NOT register as `guide_winners` conversion; it becomes an owner event only at the `/research/` benchmark form. A guest click can never read as an unlabeled owner demand-proof.
**Voice order (non-negotiable):** draft with `copywriting`, then `enterprise-ui-writing`, then `humanizer`; honor `owner-proof-integrity` (only Approved Quantified Proof claims), `content-quality-gate`, voice + banned-patterns.
**Acceptance:** `npm run lint:content` + `npm run build` + `npm test` green; `npm run test:visual` with a fresh desktop+mobile baseline committed in the same PR; the route's existing `assert-live-smoke.js` body assertions still pass (update them in the same PR only if asserted content moved); one active brief in `docs/briefs/`.
**Risk:** low-med (guest-page copy on a smoke-asserted route).

### Card 2 — Hold-escalation (stops the silent "wait")
**Owner lanes:** ANALYTICS (the receipt logic) + SITE (the hand-authored section). Cross-repo — name it.
**Purpose:** the founder reads only `next-batch.md`; today its `Concrete next move` line silently says "wait" on the structurally-deadlocked owner cluster.
**Change (analytics):** a bounded edit to `build_concrete_next_move` (`weekly_search_operator_report.py:1192-1203`) so that when the owner cluster is sub-gate *in the current window* (the value already computed at `recommend_next_branch:722-728`), the `Concrete next move` text becomes: *"owner cluster cannot clear by waiting — run this week's outbound batch (see ## Owner Outbound Escalation below). A test send is not a lead."* Keep `reread_status` pinned to `fresh but below threshold`; `next_branch` stays `hold-and-reread`; **never** `open next batch`. Unit-test that `reread_status` stays in the 3-value enum. **No persistence counter** (the condition is permanent; a dynamic counter would detect a constant).
**Change (site):** add a hand-authored `## Owner Outbound Escalation` section *after* `## Likely Priorities` (the generator never touches that region). It must NEVER start a line with `- Reread status:` or `- Concrete next move:`, and the escalation `concrete_next_move` must stay a single line (the whole-file `status-doc-contract.test.js:23-34` global regex asserts exactly one of each).
**Acceptance:** analytics unit test green; site-side `npm run verify:release` + `status-doc-contract.test.js` green; a sample synced `next-batch.md` shows the escalation line and still passes the contract test.
**Risk:** low.

### Card 3 — Outbound execution home + homeowner-list milestone (NO sends in V1)
**Owner lane:** SITE (runbook + send-log state); HUB owns the reframed homeowner copy + target-list canon + the registers.
**Purpose:** give outbound a real home and a real first work item — without promising sends the design cannot force.
**Change:** create `docs/status/owner-outbound.md` containing: the runbook (compose {one target} × {one reframed homeowner opener} × {one Approved Quantified Proof module} × {benchmark CTA}); an empty send-log; the **three proof gates** (GATE-1 SENT = measurement-only, never demand; GATE-2 REAL unlabeled reply → register row; GATE-3 TEARDOWN completed → flips `CLM-OWNER-BENCHMARK-DEMAND-PROVEN`); the **SENT-count-gated effect-rule** (two batches that *actually went out* and got zero replies → change list/offer — zero sends is a discipline problem, not a channel problem); and a **kill/decay rule** (after N stale weeks the loop self-declares dead on the runbook rather than persisting silently like March). A one-line `owner-truth-prep` pre-flight checklist item (verify any page the outbound links to is fact-clean) — not a skill.
**First work item inside the home — the homeowner-list milestone (decision: agent-research):** agents research owner-direct Airbnb/VRBO listings, FSBO / landlord signals, and local owner signals into a **named, contactable homeowner prospect list** (hub-owned). **Acceptance check: N named homeowner-reachable prospects with a contact path.** Estimated 3-4 weeks. The Lane B time-to-first-lead clock starts only after this gate clears. Evaluate the right research tool at this milestone (`/browse` + `scrape`, the repo's existing DataForSEO footprint, `last30days` for owner signals) — gated on producing the named list; no new MCP/pack without `agent-surface-audit`.
**Acceptance (Card 3 itself):** the runbook + gates + rules exist; the list milestone is defined with its acceptance check; no external sends occur in V1. Docs-only PR.
**Risk:** minimal.

### Card 4 — The two outbound skills + register discipline
**Owner lane:** SITE (`.claude/skills/` + `docs/process/skill-policy.md`).
**Purpose:** the drafting engine and the demand gatekeeper.
**Change:** (a) `owner-outbound-batch` — drafts homeowner openers from canon copy + one Approved Quantified Proof module each; produces a copy-paste batch + a short founder checklist; **never sends**. (b) `owner-reply-intake` — the demand gatekeeper: classifies REAL-unlabeled vs TEST, **refuses** a register row unless the full Validation Standard holds (unlabeled + named pain + reopenable evidence path + next action), writes **only** the hand-authored `## Register` region of `owner-demand-trust-outcome-register.md` (never the generated `owner-receipt-projection` block, which `ingest-verification-receipts.py` overwrites), and marks **email-origin** demand **provisional** until a repo-anchored receipt exists. Re-credit the demand guard in the runbook/skill docs: the real guard is the register Validation Standard + intake refusal, NOT the proof-label-blind `owner_form_submits` counter.
**Gate (per inventory + skill-policy):** run `agent-surface-audit` before these skills land; register them in `skill-policy.md`; no external SEO/AEO packs.
**Acceptance:** skills load; skill-policy updated; `owner-reply-intake` unit-tested with negative fixtures (a TEST/labeled receipt must be refused; an email-origin signal must be marked provisional).
**Risk:** low.

**Out of V1 (begins only after Card 3's list milestone clears):** the first real outbound send batch.

---

## 5. Toolchain & Skill-Fit governance (standing posture)

The operating system stays open-minded about whether better skills / tools / agents exist for each step — but adoption is **governed, never reflexive** (canonical `repo-dev-setup` inventory verdict: READY; "do not add new agents/workflows/skills before `agent-surface-audit`"; "no new control plane without a repeated trigger").

**Standing rule:** every card and the weekly cadence carries the question *"is there a better skill/tool/agent for this step?"* Any **adoption** must clear all of: (1) a repeated, site-specific trigger; (2) `agent-surface-audit` before changing any agent/skill/workflow/MCP surface; (3) the lean `skill-policy.md` bar (no external-pack installs without a smoke-tested win; AI-citation monitoring + GSC/GA4 proof belong in `seascape-analytics`, not here); (4) explicit Sawyer approval + a receipt for any global/skill change.

**Inventory-grounded toolchain-fit map (current):**

| Step | Best skill/tool | Status |
|---|---|---|
| Lane A referral copy + CRO | `copywriting`→`enterprise-ui-writing`→`humanizer`, `page-cro`, `owner-proof-integrity`, `serp-ctr-title-rewrite` | exists — sufficient |
| Lane A tracking / taxonomy | `analytics-tracking` lens + the V1 rendered-route tracking gate | exists |
| Lane A schema / AEO if needed | `seascape-seo` + `schema-markup` | exists |
| Lane B drafting / reply-gate | NEW `owner-outbound-batch`, `owner-reply-intake` | build local → must pass `agent-surface-audit` (Card 4) |
| Card 3 homeowner-list research | candidate: `/browse` + `scrape`; the repo's existing DataForSEO footprint; `last30days` | **open tool decision — evaluate at the milestone, gate on the named list** |
| Card 2 hold-escalation | analytics Python (owned by analytics) | exists |
| Cross-repo context (future agents) | GBrain MCP (already wired) — "what did we decide / where does this belong" | exists — name it for future agents |
| Review / ship / security | `review`, `ship`, `/cso` (sensitive), `superpowers:*` execution skills | exists |
| Governance of the above | `repo-dev-setup` inventory + `agent-surface-audit` + `skill-policy` | the standing gate |

**Hygiene flag (out of scope here):** the inventory reported 44 worktrees / 528 MB generated dirs — debt tied to the known broker phantom-worktree fragility; worth an `agent-clean` pass, not part of this work.

---

## 6. Safety rules

- Never commit to `main`; each card uses a worktree + `codex/<task>` branch + PR after green CI. Root checkout stays sync-only.
- **Card 2 touches the analytics repo** — name it as a cross-repo change; never hand-edit the generated block of `next-batch.md` (it is receipt-generated; hand edits are overwritten and can break the contract test).
- Honor the cross-repo contract locks (live `/.netlify/functions/*` paths, metrics `receipts[]` field names, `verify:*` script names) per `docs/plans/2026-06-12-v1-implementation-handoff.md` §5 — none may change.
- Proof-label invariant is law: no TEST/SENT receipt may flip the demand claim or satisfy the owner gate; real owner proof stays UNLABELED.
- No Hermes/Telegram wiring (standing decision). No live Hostaway changes. No mass page generation. One brief at a time. Property-truth + owner-proof-integrity gates apply to all visible copy.
- Any visible-copy change on a smoke-asserted route updates `assert-live-smoke.js` and the visual baseline in the same PR.
- Stop conditions: a visual baseline changes when a card predicts none; an owner event lands in the `owner_money` or `guide_winners` cluster; the Card-2 escalation line breaks `status-doc-contract.test.js`; `npm test` reveals failures unrelated to the diff. In each case: stop, report, do not improvise.

---

## 7. Deferred (explicit)

Outbound *sending* (post-list-milestone) · `owner-truth-prep` as a standing skill (→ a checklist line) · GEO/citation engine + monthly authority loop (→ the effect-not-volume idea survives as one runbook rule) · the distribution lane · direct-book attribution (blocked on `direct_booking_attributed_reservations`; hub demoted it) · any new collectors/dashboards/receipts · an ops-owned send heartbeat (would need the deferred V2 plain-language alert surface) · external SEO/AEO packs.

---

## 8. Pre-mortem verdict + kill tripwire

All three 30-day scenarios returned **REVISE**, not reject — the strategy and honesty machinery are sound; the revisions in §3-§4 are the fixes. Honest day-30 expectation: **~0 real owner leads**, with Lane A the only non-zero path, and the system *honestly* reporting zero (the negative-proof scoreboard prevents success-theater). The hardest test — "did this become another measurement layer?" — grades **C+ / partial pass**: better than V1's ~6%-net-new-demand, but the demand-to-overhead ratio is only acceptable *because* Lane A (a true demand surface needing no founder action) is promoted to lead. **Kill tripwire (built into Card 3):** if day 30 shows green activity and zero unlabeled real replies, the loop self-declares "channel not working — change list/offer or kill" on the runbook. Grade on owner leads + direct bookings only — never impressions.

---

## 9. First implementation prompt (Card 1)

> You are working in `/Users/sawbeck/Projects/seascape-vacations-site` (public repo; production seascape-vacations.com). Start a worktree on `codex/guide-owner-referral` (`agent-start guide-owner-referral`). Task: add a quiet owner-economics referral module to `/guides/bradenton-vs-sarasota/` that routes a home-owning reader to `/research/owner-fee-revenue-leak-benchmark-2026/` then the teardown form.
>
> FIRST write one brief in `docs/briefs/` and define the event taxonomy: the module fires a `guide_owner_referral_click` navigation event that must NOT register as `owner_money` cluster and must NOT register as `guide_winners` conversion; it becomes an owner event only at the benchmark form. Verify how `guide-conversion-kit.njk` and `conversion-tracking.js` wire events before adding one.
>
> Read `DESIGN.md`, `docs/process/content-quality-gate.md`, `docs/style/voice.md`, `docs/style/banned-patterns.md`, `docs/style/approved-examples.md`, and the `owner-proof-integrity` skill before writing copy. Draft with `copywriting`, then `enterprise-ui-writing`, then `humanizer`. Only Approved Quantified Proof claims; owner economics in plain English; do not blur the guest/owner proof boundary.
>
> Gate: `npm run lint:content && npm test && npm run verify:release` green; `npm run test:visual` with a fresh desktop+mobile baseline committed in this PR; confirm the route's existing `assert-live-smoke.js` body assertions still pass. Stop and report if a visual baseline changes unexpectedly, if any owner event lands in the `owner_money` or `guide_winners` cluster, or if `lint:content` flags owner-jargon that reads fine as guest copy. Stop for review before merge.
