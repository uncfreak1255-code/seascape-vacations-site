# Stale Analytics Receipt

Use this when a site lane depends on a current analytics-owned read and that
receipt is stale, missing, or blocked by freshness.

## Immediate Actions

1. Stop site expansion or proof claims that depend on newer measurement truth.
2. Get the fresh receipt from `seascape-analytics` instead of guessing from an
   old site note or chat summary.
3. If the receipt is a next-batch decision, sync this repo's status surface
   with:

```bash
node scripts/enforcement/sync-next-batch-from-analytics-receipt.js --receipt <path>
```

4. If the current receipt still says `blocked by freshness` or
   `fresh but below threshold`, hold the site lane instead of widening it.
5. Only reopen the site branch when the receipt explicitly clears or recommends
   the work.

## Source Of Truth

- machine-readable receipt path in `seascape-analytics`
- receipt run date
- `docs/status/next-batch.md` after sync

## Proof Gate

- the receipt path and date are captured in the branch or closeout note
- the relevant status or brief now points to the current receipt
- the lane decision matches the receipt status instead of wishful thinking

## Do Not

- move analytics logic into this repo
- paraphrase old readback as current proof
- claim AI citation, booking lift, or owner-demand lift without analytics-owned
  evidence
