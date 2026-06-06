# Open Risks

- owner pages are ranking without enough CTR, so visibility still is not reliably becoming owner leads
- `www.seascape-vacations.com` must keep redirecting owner funnel routes to canonical `seascape-vacations.com`; keep `npm run verify:owner-funnel-routes` as the live canary so owned-host drift fails before release
- the five tracked money pages still have measurement lag risk because crawl freshness has been slower than implementation
- operator truth can drift if `docs/status/current-state.md` repeats volatile reread windows or `data_date` details instead of deferring to `docs/status/next-batch.md`
- AMI stay winners are stronger than the rest of the stay cluster, but they still have not earned automatic expansion into Holmes Beach or broader stay volume
- proof claims can drift across `src/_data/ownerProofAssets.json`, owner-page copy, and supporting docs if one changes without the others
- amenity, bedroom, and bathroom claims can drift across `src/_data/properties-fallback.json`, per-property templates at `src/properties/<slug>/index.njk`, and `src/llms.txt` — pick one authority and regenerate the others on every property edit instead of hand-editing all three
- Hostaway numeric fields with "half" counterparts are split across two API fields — `bathrooms` + `guestBathrooms` (half baths) for the total. Reconciliation scripts must read both and sum, not treat either as canonical. Same pattern likely exists for any other "half" or "partial" count in the Hostaway API
- guide-family gains can regress if redirects, schema URLs, feeder links, and sitemap output slip out of sync
- the new SEO OS docs can become another stale layer if briefs and portfolio files are not updated when source truth changes
- the June 2026 indexed-page drop should be treated as a triage signal, not a penalty by default: clicks and CTR rose while the index shrank, so the risk is re-bloating pruned thin or duplicate URLs instead of exporting the dropped URL set and rescuing only pages with clicks, links, owner value, or a clear canonical mistake
- `src/guides/vacation-rental-income-anna-maria.html` must stay noindexed unless the enforcement decision changes; `scripts/enforcement/owner-proof-clean.test.js` locks it out of the owner-proof lane and routes owner-income intent to `/research/owner-fee-revenue-leak-benchmark-2026/`
- `/stays/summer-vacation-rentals-florida-gulf-coast/` is a decision conflict, not a silent page-build target: `seoGovernance.staysNoindexSlugs` suppresses it, while the June 3 rank tracker calls it a July refresh target, so decide whether to rebuild it into an indexable seasonal page or leave it suppressed before any refresh work starts
