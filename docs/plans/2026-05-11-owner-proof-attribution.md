# Owner Proof Attribution Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Wire every owner page that displays inline `proofStats` to the canonical `gulf-coast-owner-benchmark-2026` proof asset, plus apply the brand-review fix to the AMI page that flagged this audit, plus verify three edge stats that the benchmark asset does not directly back.

**Architecture:** Surgical JSON edits in `src/_data/seoPages.json`. No template, schema, or proof-asset changes. The template at `src/property-management/property-management.njk:255` already renders the "Benchmark Source" panel when `proofAsset` resolves — adding `proofAssetKey` to an owner-page entry is the only wiring needed.

**Tech Stack:** Eleventy (11ty) static site, JSON data files, njk templates. No runtime code.

**Scope rules:**
- **In scope:** 6 geo/decision owner pages that display proofStats with no proofAssetKey, plus 1 AMI copy fix
- **Out of scope:** 14 topic pages with empty proofStats (linking does nothing visually), 2 stat-less pages already linked (harmless)
- **Conditional in scope (Task 2):** if edge stats fail verification, fix or remove them in the same batch — do not ship broken claims

**Branch:** `codex/owner-proof-attribution` (already created in `.worktrees/owner-proof-attribution/`)

---

## Task 1: Verify the three edge stats against the benchmark page body

**Files:**
- Read: `src/research/owner-fee-revenue-leak-benchmark-2026.njk`
- Read: `src/guides/florida-gulf-coast-vacation-rental-market-report-2026.njk` (asset `sourceUrl`)

**Why:** The asset's `stats` array directly backs `$1.4M`, `$119,923`, `13.4%`, `2.9%`. But three claims appear on pages without being in the asset's stats:
- `3-4x market-median revenue per home` (Bradenton, Siesta Key, switch-vacation-rental-management-company)
- `5 active homes in the operating set` (switch-vacation-rental-management-company)
- `15-30 hrs weekly owner time` (self-manage-vs-property-management-florida)

If these claims appear in the benchmark page body or the linked market report, the attribution is honest. If they don't, we have two options inside this batch: (a) remove the stat, (b) rewrite the stat to use a number the asset does back.

**Step 1: Read both source documents**

```bash
grep -n "3-4x\|3 to 4x\|three to four times\|market median\|market-median" \
    src/research/owner-fee-revenue-leak-benchmark-2026.njk \
    src/guides/florida-gulf-coast-vacation-rental-market-report-2026.njk

grep -n "five active\|5 active\|operating set\|five Gulf" \
    src/research/owner-fee-revenue-leak-benchmark-2026.njk \
    src/guides/florida-gulf-coast-vacation-rental-market-report-2026.njk

grep -n "15-30\|15 to 30\|weekly\|hours per week\|hrs" \
    src/research/owner-fee-revenue-leak-benchmark-2026.njk \
    src/guides/florida-gulf-coast-vacation-rental-market-report-2026.njk
```

**Step 2: For each claim, decide one of three verdicts**

- **VERIFIED:** the claim appears with consistent framing in source — leave the stat as-is
- **NARROW:** source supports a narrower version — rewrite the stat detail to match
- **UNSUPPORTED:** source doesn't carry it — remove the stat entry from `proofStats`

**Step 3: Document verdicts before any edit**

Write a 6-line note in `docs/briefs/owner-proof-attribution.md`:

```markdown
## Edge-stat verification

- 3-4x market median: [VERIFIED|NARROWED to "Xx"|REMOVED] — source line: file:line
- 5 active homes: [VERIFIED|NARROWED|REMOVED] — source line: file:line
- 15-30 hrs weekly: [VERIFIED|NARROWED|REMOVED] — source line: file:line
```

**Step 4: Commit**

```bash
git add docs/briefs/owner-proof-attribution.md
git commit -m "docs: brief + edge-stat verification for owner-proof-attribution batch"
```

---

## Task 2: Apply Task 1 verdicts to the affected pages

**Files:**
- Modify: `src/_data/seoPages.json` (entries: `vacation-rental-management-bradenton`, `vacation-rental-management-siesta-key`, `switch-vacation-rental-management-company`, `self-manage-vs-property-management-florida`)

**Only execute the sub-steps that match Task 1 verdicts.** If all three are VERIFIED, skip to Task 3.

**Step 1: Apply each REMOVED verdict by deleting the matching `proofStats` entry**

Use the Edit tool with the exact stat block as `old_string` and the surrounding-comma-cleaned version as `new_string`. Each removal is its own Edit call to keep diffs reviewable.

**Step 2: Apply each NARROWED verdict by editing the stat's `detail` field**

Same Edit pattern. Keep the headline `value` and `label`; only the `detail` line changes to match the narrower source claim.

**Step 3: Validate JSON still parses**

```bash
python3 -c "import json; json.load(open('src/_data/seoPages.json')); print('OK')"
```
Expected: `OK`

**Step 4: Commit**

```bash
git add src/_data/seoPages.json
git commit -m "fix(proof): align edge stats to verified source claims"
```

---

## Task 3: Wire AMI to the benchmark + apply the brand-review copy fix

**Files:**
- Modify: `src/_data/seoPages.json` (entry: `vacation-rental-management-anna-maria-island`)

**Step 1: Add `proofAssetKey` field**

Use Edit. The `old_string` is the unique trailing line of the AMI entry's identity block before `benefits`:

```
"description": "Switcher-first Anna Maria Island vacation rental management for owners losing premium-week pricing, direct margin, or island execution control.",
      "intro":
```

Wait — that contains the intro start which appears in every entry. Better anchor: use the AMI-specific intro line as anchor.

```
"intro": "If your Anna Maria Island home stays busy but owner payouts still feel too soft, the leak is usually premium weeks discounted too early, OTA-heavy channel mix, or island operations that keep the calendar alive while margin quietly slips.",
      "benefits":
```

Insert `"proofAssetKey": "gulf-coast-owner-benchmark-2026",` after the `intro` comma, before `"benefits":`.

**Step 2: Apply the brand-review copy fix to AMI benefit #5**

Use Edit. `old_string`:
```
"Give owner reporting that explains rate integrity, channel drag, and execution misses",
```
`new_string`:
```
"Give owner reporting that shows whether your rates are holding, how much you are losing to Airbnb fees, and which local handoffs are dropping balls",
```

**Step 3: Validate JSON**

```bash
python3 -c "import json; json.load(open('src/_data/seoPages.json')); print('OK')"
```
Expected: `OK`

**Step 4: Commit**

```bash
git add src/_data/seoPages.json
git commit -m "feat(proof): link AMI owner page to benchmark + voice-fix benefit copy"
```

---

## Task 4: Wire Bradenton to the benchmark

**Files:**
- Modify: `src/_data/seoPages.json` (entry: `vacation-rental-management-bradenton`)

**Step 1: Insert `proofAssetKey`**

Use Edit with the Bradenton-specific intro line as anchor (find it first with grep), insert `"proofAssetKey": "gulf-coast-owner-benchmark-2026",` after `intro` and before `benefits`.

**Step 2: Validate JSON parse**

```bash
python3 -c "import json; json.load(open('src/_data/seoPages.json')); print('OK')"
```

**Step 3: Commit**

```bash
git add src/_data/seoPages.json
git commit -m "feat(proof): link Bradenton owner page to benchmark"
```

---

## Task 5: Wire Sarasota to the benchmark

**Files:**
- Modify: `src/_data/seoPages.json` (entry: `vacation-rental-management-sarasota`)

Same pattern as Task 4. Anchor on Sarasota-specific intro line, insert key, validate, commit.

Commit message: `feat(proof): link Sarasota owner page to benchmark`

---

## Task 6: Wire Siesta Key to the benchmark

**Files:**
- Modify: `src/_data/seoPages.json` (entry: `vacation-rental-management-siesta-key`)

Same pattern. Anchor on Siesta-specific intro line.

Commit message: `feat(proof): link Siesta Key owner page to benchmark`

---

## Task 7: Wire switch-vacation-rental-management-company to the benchmark

**Files:**
- Modify: `src/_data/seoPages.json` (entry: `switch-vacation-rental-management-company`)

Same pattern. Anchor on switch-management-specific intro line.

Commit message: `feat(proof): link switch-management owner page to benchmark`

---

## Task 8: Wire self-manage-vs-property-management-florida to the benchmark

**Files:**
- Modify: `src/_data/seoPages.json` (entry: `self-manage-vs-property-management-florida`)

Same pattern. Anchor on self-manage-specific intro line.

Commit message: `feat(proof): link self-manage decision page to benchmark`

---

## Task 9: Release Gate — build, smoke-test, schema check

**Files:** none modified — verification only.

**Step 1: Local build**

```bash
npm run build
```
Expected: build completes with no errors. Check the last 30 lines of output for any `[11ty] error` or `WARN`.

**Step 2: Confirm the Benchmark Source panel renders on each fixed page**

```bash
for slug in vacation-rental-management-anna-maria-island vacation-rental-management-bradenton vacation-rental-management-sarasota vacation-rental-management-siesta-key switch-vacation-rental-management-company self-manage-vs-property-management-florida; do
  echo "=== $slug ==="
  grep -c "Benchmark Source" "_site/property-management/$slug/index.html" || echo "MISSING"
done
```
Expected: each line prints `1` (one occurrence of "Benchmark Source" per page).

**Step 3: Confirm schema.org Article author is now `Sawyer Beckett` on linked pages**

```bash
for slug in vacation-rental-management-anna-maria-island vacation-rental-management-bradenton; do
  echo "=== $slug ==="
  grep -A 2 '"@type": "Person"' "_site/property-management/$slug/index.html" | head -5
done
```
Expected: `"name": "Sawyer Beckett"` appears in the JSON-LD block on linked pages. This is the GEO/freshness side-benefit — proof attribution also upgrades schema authorship.

**Step 4: Confirm no stat-block ever renders without a Benchmark Source panel on geo pages**

For each fixed page, the page should contain BOTH the stats grid AND the source panel. Spot-check by opening one in a browser if available.

**Step 5: Commit (no diff, but tag the milestone)**

```bash
git commit --allow-empty -m "verify: owner-proof-attribution release-gate pass"
```

---

## Task 10: Update status docs and ship

**Files:**
- Modify: `docs/status/current-state.md` — add a line under most-recent-changes
- Modify: `docs/status/next-batch.md` — if owner-attribution was listed as a gate, mark it cleared

**Step 1: Append the change to current-state.md**

```bash
# Find current change block and append
```

Add a one-line entry:
```
- 2026-05-11: All 6 geo + decision owner pages with proofStats now linked to gulf-coast-owner-benchmark-2026. AMI benefit copy fixed per voice rules. 14 topic pages remain stat-less (intentional skip).
```

**Step 2: Update open-risks.md if owner-proof-attribution was logged as a risk**

```bash
grep -n "proof attribution\|proofAssetKey\|owner proof" docs/status/open-risks.md
```
If a hit: mark resolved with date. If no hit: skip.

**Step 3: Commit and push**

```bash
git add docs/status/current-state.md docs/status/open-risks.md
git commit -m "docs(status): close owner-proof-attribution batch"
git push origin codex/owner-proof-attribution
```

**Step 4: Open PR**

Title: `feat(proof): wire 6 owner geo pages to gulf-coast-owner-benchmark-2026`

Body:
- What changed (6 page links + 1 AMI copy fix + N edge-stat fixes from Task 2)
- Why (closes proof-attribution gap flagged by /brand-review on AMI)
- Verification (build green, 6 pages show Benchmark Source panel, schema upgraded to Person author)
- Out of scope (14 topic pages without proofStats — explicit skip)

---

## Post-batch writeback to seascape-hub

After PR merges, append to `seascape-hub/log.md`:

```
2026-05-11 — decision: owner-proof-attribution batch complete. 6/27 owner pages now cite the canonical benchmark; 14 topic pages stat-less (intentional). Next gate: add proofStats + proofAssetKey to Longboat Key and condo-rental-FL when those pages get content investment.
```

And update `seascape-hub/context/` if positioning changed (it didn't — this is execution).

---

## DO NOT in this batch

- Do not edit topic pages (insurance, taxes, photography, etc.) — they have no proofStats and linking adds zero visible attribution
- Do not create new proof assets — one canonical asset is the design
- Do not invent stats to fill empty `proofStats` arrays — that inverts the whole point of this batch
- Do not unlock `docs/status/next-batch.md` entity-expansion gates — those have their own measurement criteria
- Do not edit `_site/` — generated output, edit source only
- Do not touch `main` directly — all commits land on `codex/owner-proof-attribution`
