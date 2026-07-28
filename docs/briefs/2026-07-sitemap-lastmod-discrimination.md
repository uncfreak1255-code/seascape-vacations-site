# Brief: Sitemap Lastmod Discrimination

## Content Gate Inputs

- persona: search crawler and search-quality reviewer reading Seascape's sitemap, structured data, and visible updated labels.
- primary keyword: Seascape sitemap lastmod correctness
- secondary keywords: vacation rental sitemap lastmod, structured data dateModified, owner page dateModified
- audience pattern: not a public article reader; this is technical SEO hygiene for existing stay and owner money-page templates.
- proof source: current repo source for `src/sitemap.njk`, `src/stays/stays.njk`, `src/property-management/property-management.njk`, and the branch test `scripts/enforcement/sitemap-lastmod-discrimination.test.js`.
- required internal links: none; this branch changes date-source discrimination, not body-copy linking.
- CTA target: none.
- anti-claims: no ranking, indexation, crawl-frequency, booking, lead, or AI-visibility lift claim.

## Gate 0 Search And Attack Receipt

| Field | Required answer |
| --- | --- |
| Target query family | Technical SEO freshness and sitemap/dateModified correctness for existing stay and owner money pages. |
| Searcher intent | support |
| Current Seascape URL | Existing generated sitemap plus existing `/stays/*` and `/property-management/*` routes. |
| SERP observed date | 2026-07-27 |
| SERP stale after | 2026-08-03 |
| Current proof | PR #489 release gate failed on 2026-07-27 because the branch changed `src/sitemap.njk`, `src/stays/stays.njk`, and `src/property-management/property-management.njk` without an active brief; source diff shows the branch adds per-page lastmod/dateModified discrimination and a focused sitemap discrimination test. |
| Top visible competitors | Not competitor-led; this is internal technical SEO hygiene. Named checks are current repo source, generated sitemap behavior, and structured-data dateModified behavior. |
| Competitor angle | N/A because no public competitor page or SERP copy is being copied; the attack is to stop shared template timestamps from flattening per-page freshness signals. |
| Visual/format gap | N/A because there is no visible layout or page-format change. |
| Seascape gap | Shared template-level date reads can make generated stay and owner routes look updated together instead of reflecting each page's real source/data freshness. |
| Search fit | Keep the existing URLs and sitemap. The correct fix is technical date-source discrimination on current templates, not new pages, redirects, or copy expansion. |
| Local/GBP proof | Not applicable: sitemap/dateModified hygiene does not touch local-pack, NAP, GBP category, or map-pack claims. |
| AEO/readback note | Not applicable to answer-engine copy; JSON-LD `dateModified` and sitemap `lastmod` should remain machine-readable and route-specific. |
| Recommendation | Make `sitemap.xml`, stay-page JSON-LD, and owner-page JSON-LD resolve last-modified dates per generated page route, then prove with the focused discrimination test plus release gate. |
| Attack status | completed |
| Query variants inspected | `site sitemap lastmod`, `structured data dateModified`, `vacation rental sitemap freshness`, and the repo's own generated stay/owner route patterns. |
| SERP source | No live SERP used; this branch is based on repo/source and release-gate evidence observed 2026-07-27. |
| Competitor URLs inspected | No competitor URL was needed because this is internal sitemap/schema correctness. Inspected Seascape URLs were `https://seascape-vacations.com/sitemap.xml`, `https://seascape-vacations.com/stays/anna-maria-island-vacation-rentals/`, and `https://seascape-vacations.com/property-management/vacation-rental-management-bradenton/`, plus the source templates that generate those routes. |
| Content gap and Seascape answer | The gap is not reader copy; Seascape's answer is to give crawlers route-specific lastmod/dateModified values instead of template-level flattening. |
| Design/format strategy | No visual change. |
| Seascape proof available | Branch source diff, focused discrimination test, `npm run verify:release -- --range ...`, and rendered sitemap/schema output after build. |
| Tools/plugins used | GitHub Actions failure log, local repo source read, branch diff, and local release/test commands. |
| Decision and reason | improve existing technical SEO plumbing because sitemap and structured-data freshness are source-owned surfaces with cross-page crawl impact; do not claim search impact until later crawler/search data proves it. |

## Experiment And Readback Contract

- hypothesis: route-specific lastmod/dateModified values reduce crawler ambiguity without changing public copy or creating new indexable surfaces.
- primary event: release-gate success and focused sitemap/dateModified discrimination test success.
- guardrail event: generated sitemap stays valid, JSON-LD stays valid, owner/stay routes still build, and no public copy changes are introduced.
- entry criteria: PR #489 failing Release Safety because no active brief covered the search-facing sitemap/dateModified source edit.
- readback window: next sitemap/build verification after merge; search impact, if any, requires later Search Console crawl/index readback and is not claimed by this PR.
- decision rule: keep only if release gate and focused route/date tests pass.

## Done When

- this active technical SEO brief is present
- focused sitemap/dateModified discrimination test passes
- `npm run verify:release` passes for the PR range
- no ranking, crawl, indexation, lead, or booking impact is claimed
