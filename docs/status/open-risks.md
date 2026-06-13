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
- historical queue drift can accidentally reopen `/stays/summer-vacation-rentals-florida-gulf-coast/` as a July refresh target even though the current repo decision is to keep it served/noindex and out of the near-term queue. `seoGovernance.staysNoindexSlugs` suppresses it, `docs/portfolio/pseo-inventory-triage.md` keeps it in the support/noindex lane, and `docs/portfolio/stay-money-pages.md` does not assign it a winner or money-page role. Only reopen rebuild work if a separate GSC + SERP proof pack and a defined money destination justify earning indexable status

## Repo-audit V1 (2026-06-12)

- owner support GA4 numbers before the Task 3 tracking-gate deploy are instrumentation artifacts because `/research/owner-fee-revenue-leak-benchmark-2026/` shipped tracked owner CTAs without the shared tracking runtime; the first post-fix weekly receipt should be read as sensor repair, not owner demand.
- Holmes Beach canonical decision still blocks V2 redirect and sitemap cleanup: either retire the slug from `seoPages.json` or remove the redirect, but do not leave both live.
- Live-smoke alert drill (2026-06-12) resolved detection but not the channel: a deliberate failure run went red and GitHub notified, but GitHub-native notifications are not operator-friendly. V2 must add a plain-language alert surface whose message states what failed, what it means for guests, and the next step — target shape: "Seascape website check failed. The public site may have a broken page or missing tracking. No guest messages were sent. Next step: ask Codex to inspect the failed Live Smoke run." Do not wire Hermes/Telegram without explicit approval.
- Meta-pixel and privacy wording still block the disclosure follow-up: confirm the intended pixel scope before changing the legal copy.
- Stylesheet budget still blocks the homepage performance-budget gate: the current homepage CSS is already over the error-level budget, so decide whether to slim it or raise the threshold before extending the gate.
- Legacy root residue still blocks the cleanup tranche: decide whether the old root `index.html`, `stays/`, `property-management/`, `area-guide-*.html`, `dashboard/`, and `emails/` surfaces should be archived then removed or kept quarantined.
- V2 sequencing lives in `docs/plans/2026-06-12-repo-audit.md`.

## Indexing + Indexability (2026-06-06 forensic)

See `docs/reports/indexing-and-indexability-forensic-2026-06-06.md` for the full read. The triage signal, income-guide lock, and summer-page decision are captured in the bullets above and in `next-batch.md`; the points below are the non-duplicated specifics.

- the real ranking casualty is `/guides/bradenton-vs-sarasota/` dropping #1 -> #5 to Zachos/midflorida. That is a freshness/competitive loss on the existing winner, not a deindexing event. Defend the existing page; do not build a second comparison page.
- noindex/sitemap collisions are a real failure class: a page can carry an inline `<meta name="robots" content="noindex">` while still being listed in `sitemap.xml`, because the two facts are produced by different layers. This silently demoted the AMI income guide until #247 cleaned it up by hand. Now guarded by `scripts/enforcement/sitemap-indexability-contract.test.js` (rendered-build truth). Keep it green.
- owner_money pages are low-impression (~75 combined), not only low-CTR. The bottleneck is visibility/ranking, not just snippet framing, so holding `owner-ctr-rewrite-round-2` until impressions clear the bar is defensible.
- voice/content banned-pattern enforcement is context-scoped on purpose: phrases like `fee stack` read well in guest guide copy even though they are banned as owner-economics jargon. Do not globalize owner-jargon lint rules; a blunt global rule would flag effective guest copy.
