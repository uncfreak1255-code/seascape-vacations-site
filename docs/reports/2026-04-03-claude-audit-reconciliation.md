# Claude Audit Reconciliation

Date: 2026-04-03
Source reviewed: `/Users/sawbeck/Desktop/SEO-Audit-Seascape-Vacations-April-2026.md`

## Verdict

The audit is mixed.

- Several trust and source-hygiene findings are real.
- Several "critical" items are overstated.
- One claimed live template bug is already stale.
- The audit missed a worse live truth problem on a priority stay page.

This does **not** change the April strategy. It changes sequencing. The next workstream after GSC readback should be truth normalization, not broader entity work or more page production.

## Major claims

| Claim | Verdict | Evidence | Decision |
|---|---|---|---|
| Root `sitemap.xml` is stale and wrong | True in source, not live-critical | repo root `sitemap.xml` still contains `/destinations/*` and `/rentals/*`; live `https://seascape-vacations.com/sitemap.xml` is the Eleventy-generated file | Clean it up in the next source pass, but do not treat it as a live indexing crisis |
| `/stays/` returns 404 | True | live `https://seascape-vacations.com/stays/` returns 404 | Keep as an architecture candidate, not a same-day emergency |
| Generic meta descriptions are rendering live on stay pages | Stale / false now | live `anna-maria-island-vacation-rentals` and `anna-maria-island-beachfront-rentals` both return unique meta descriptions | No roadmap change |
| Review counts contradict each other | True and live | homepage still shows `500+`; homepage schema still uses `reviewCount: 500`; homepage stats still show `650+`; about page still says `650+`; property pages still say `420+` while individual property schema uses real counts like `10` and `17` | Promote to immediate trust-normalization work |
| Homepage price range is misleading | True and live | homepage `LocalBusiness` schema still uses `$400-$800/night`; multiple guide pages also reuse the same range | Expand the fix beyond homepage to the shared schema layer |
| Missing 404 page | True | no `404` page source found under `src/` | Keep as secondary cleanup, not top bottleneck |
| Uniform sitemap `lastmod` dates | True | live sitemap still emits `2026-03-16` across URLs | Valid cleanup, but lower priority than truth contradictions |
| Excluded guide directories indicate dead content | Partly true, already controlled | ignored directories still exist, but redirects point old paths to live canonicals and replacement pages are live | Leave as low-priority hygiene |
| Same property cards on every stay page | True | `src/stays/stays.njk` loops `properties` without page-level filtering | Keep as later CRO refinement, not immediate fix |

## Audit miss

The audit missed a worse issue than the meta-description claim.

The live page `https://seascape-vacations.com/stays/anna-maria-island-vacation-rentals/` still includes FAQ answers claiming:

- complimentary kayaks
- complimentary paddleboards
- complimentary fishing gear

Those claims are explicitly banned by the verified property truth in `CLAUDE.md`. This is a live trust problem on a priority commercial page and belongs in the next implementation batch.

## Plan impact

The roadmap should not be rewritten around the audit. It should be tightened in one place:

1. keep the April 3-7 GSC reread as the measurement gate
2. insert a truth-normalization pass before entity work
3. defer `/stays/` hub, 404 polish, and broader template cleanup until after the truth layer is fixed

## Decision

Do not start Phase 4 entity work next.

Start a trust-normalization branch next:

- reconcile review counts
- reconcile price-range schema
- remove banned stay FAQ claims
- delete the stale root `sitemap.xml`
- add enforcement so the contradictions do not come back
