# AMI AI/entity rescue Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the existing AMI rental-company guide easier for answer engines to identify as a Seascape source and route owner-intent readers to the correct management page, without opening a new content cluster.

**Architecture:** Keep the guide URL, schema, and shared conversion kit. Add one source-grounded entity sentence to the standalone answer, one contextual owner link, and one more specific sticky CTA label. Keep the existing event name and destination unchanged. Record the bounded experiment in one active brief and use the refreshed analytics receipt plus two later comparable windows for readback.

**Tech Stack:** Eleventy/Nunjucks source, JSON-LD already present in the guide, repository content lint, Eleventy build, link/schema verification, and the `guide_book_direct_click` GA4 event.

---

## File Map

- Create: `docs/briefs/2026-09-03-ai-entity-rescue-ami-companies.md` — active receipt-bound brief and Gate 0 block.
- Modify: `src/guides/best-vacation-rental-companies-ami.html` — answer, proof link, owner handoff, and sticky CTA label only.
- Test: existing `scripts/enforcement/guide-conversion.test.js` — run unchanged; its sticky event assertions protect the CTA contract.

## Task 1: Record the bounded brief

- [x] Confirm the fresh receipt at `/private/tmp/weekly-ai-visibility-reruns-2026-09-03/weekly-ai-visibility-receipt.md` and the normalized OpenSEO input at `/private/tmp/openseo-direct-ai-observations-2026-09-03-canonical.json`.
- [x] Complete all required content-gate bullets, the AI experiment fields, and a filled Gate 0 Rescue Block in the active brief.
- [x] Keep the brief explicit that the dedicated GSC generative-AI report is unavailable, Claude was unavailable in the rerun, and no ranking, lead, booking, or revenue lift is claimed.

## Task 2: Make the smallest source change

- [x] In the first `Direct answer` paragraph, name Seascape as a locally managed Bradenton/Sarasota operator with homes near Anna Maria Island and link the stay collection for exact location and checkout details.
- [x] In the guide introduction, add one short contextual link to `/property-management/vacation-rental-management-anna-maria-island/` for readers who own a property; do not turn the guest comparison into an owner ranking.
- [x] Link the Seascape row in the comparison table to `/stays/anna-maria-island-vacation-rentals/` so the proof and conversion destination are adjacent and crawlable.
- [x] Change only the sticky CTA's visible label to `Browse Direct AMI Homes`; preserve `/stays/book-direct-anna-maria-island/`, `guide_book_direct_click`, `best-vacation-rental-companies-ami`, and the existing tracking label.
- [x] Do not change title, meta description, JSON-LD, `dateModified`, competitor rows, fees, rankings, GBP, or new routes.

## Task 3: Verify the source and build

- [x] Run `npm run lint:content`.
- [x] Run `npm run build`.
- [x] Run `npm run verify:jsonld` and `npm run verify:links`.
- [x] Run `node --test scripts/enforcement/guide-conversion.test.js scripts/enforcement/guide-funnel-lineage.test.js scripts/enforcement/direct-booking-event-smoke.test.js` when all three files exist.
- [x] Run `npm run git:preflight` and `git diff --check`.
- [x] Review the exact diff and confirm only the brief, plan, and guide source changed.

## Task 4: Close out and schedule readback

- [ ] Commit the bounded source change on `codex/ai-visibility-booking-pilot` with the repository guardrail wrapper; do not push, merge, deploy, or claim runtime publication without a separate remote readback.
- [ ] Preserve the refreshed receipt paths and the commit SHA in the final handoff.
- [ ] Re-run the same three OpenSEO prompts and the GSC guide-winner inspection after two complete comparable post-release windows (expected windows ending 2026-09-10 and 2026-09-17, subject to final GSC data).
- [ ] Keep the batch if Seascape is named or cited more directly and `guide_book_direct_click`/guardrails do not regress; hold if the signal stays flat; revert only if a guardrail fails.
