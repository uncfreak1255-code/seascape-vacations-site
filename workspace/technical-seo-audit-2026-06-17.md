# Technical SEO Audit — Seascape Vacations
**Date:** 2026-06-17
**Repo:** seascape-vacations-site (11ty static → Netlify)
**Trigger:** Guide pages dropping rank; traffic not trending up
**Method:** Codebase audit (src + built `_site/`) + repo validators + live spot-checks. No GSC/Ahrefs MCP connected this session — SERP/index figures cited from the repo's own `rank-tracker-latest.md` (2026-06-03).

**Overall score: 82/100** — *The technical foundation is sound. The ranking/traffic problem is not a crawl or indexing bug. It is index-footprint shrink driven by thin, under-linked programmatic pages, plus content competition on your best guide.*

---

## Headline finding

Your crawl/index plumbing is clean: 165 pages build, **0 broken internal links, 0 canonical mismatches, 0 missing titles/descriptions, 395 redirects validated with no chains or loops, and 710 valid JSON-LD blocks.** The repo's own enforcement gates all pass.

So the instinct that "guides dropped → something is technically broken" is mostly wrong. The data says:

- **Index footprint is shrinking** — indexed pages fell 227 → 162 (-29%) in 4 weeks; "Crawled – currently not indexed" rose to 402 (+61). That is Google *choosing* not to index thin/duplicative pages, not a crawl block.
- **Impressions -31% but clicks +29% and CTR doubled** (0.4% → 0.8%). Traffic isn't falling — it's getting more efficient on a smaller indexed base. "Not growing" = impressions/index shrinking.
- **The guide you feel dropped is `/guides/bradenton-vs-sarasota/`** (#1 → #5). That's content competition (Zachos, midflorida overtook), not a technical defect.

The highest-leverage *technical* work is internal-link redistribution and pruning thin pages — not re-plumbing crawl/index.

---

## Crawlability — 90/100

- ✅ Live `robots.txt` confirmed (fetched 2026-06-17): allows all + explicit AI crawler allows, references `/sitemap.xml`. Matches `src/robots.txt`, so the deploy serves the correct file.
- ✅ `sitemap.njk` generates from `collections.all` + stays + owner pages, and correctly excludes `seoIndexable:false` and the 12 suppressed stays slugs.
- ✅ Sitemap math is correct: 165 built HTML − 16 intentional `noindex` = **149 sitemap URLs**. *(The June-3 rank tracker flagged a "sitemap vs _site mismatch" — that was a false alarm. The gap is exactly the noindex set.)*
- ⚠️ **Crawl-budget waste**: 402 "crawled – not indexed" URLs means Googlebot is spending budget on pages it then discards (thin PM/stays variants, legacy `.html`). Pruning + linking fixes this; see Indexation.
- 🟡 Repo hygiene: a stale duplicate `robots.txt` sits at repo root (not served — `eleventy.config.js` passthrough-copies `src/robots.txt`). Delete the root copy to prevent a future wrong-file edit.

## Indexation — 78/100  *(the real problem area)*

- ✅ Canonicals: 100% self-referencing across 165 pages, **0 mismatches**. `base.njk` emits `{{ site.url }}{{ page.url }}`; standalone guides hardcode correct self-canonicals.
- ✅ Robots meta: 16 `noindex` pages, **all intentional** (12 suppressed `stays` seasonal slugs per `seoGovernance.js`, plus internal test / owner-funnel / research pages, and the `vacation-rental-income-anna-maria` owner guide).
- ✅ Redirects: **395 rules, 0 chains, 0 loops**, 86 `.html`→slug mappings. `verify:redirects` passes.
- ✅ **srq duplicate RESOLVED & LIVE** (verified 2026-06-17): `/guides/srq-airport-to-anna-maria-island.html` now 301s to the canonical slug with `index, follow`. The fix landed 2026-06-03 (commit `b94d98a3`). The rank tracker's "5-minute fix, 4 weeks running" item is done — it just needs a Google recrawl.
- 🔴 **Index shrink, -65 pages/4wk.** Root cause is mechanical and visible in the link graph below: a large block of programmatic `/property-management/` and `/stays/` pages are thin and barely linked, so Google declines to index them. This is the single biggest unmanaged signal.
- 🟡 Committed `_site/_redirects` is one edit behind `src/_redirects` (a `holmes-beach-vacation-rentals` target). Harmless because Netlify runs `npm run build` on deploy, but don't hand-deploy the committed `_site`.

## Internal linking — *root cause of the index shrink*

Built an inbound-link graph over all 165 pages:

- **1 true orphan (0 inbound links):** `/property-management/condo-rental-management-florida/` — indexable but unreachable by crawl from other pages.
- **42 pages with only 1–2 inbound links**, overwhelmingly the programmatic clusters:
  - ~20 `/property-management/` owner pages (fees, insurance, photography, marketing, pricing, maintenance, taxes, etc.)
  - ~18 `/stays/` feature pages (sleeps-12/16, fire-pit, game-room, elevator, golf, canal-homes, etc.)
  - A few guides: `anna-maria-island-vs-clearwater-beach` (1), `spring-break-activities-bradenton-anna-maria-island` (1), `bradenton-vs-sarasota-retirement` (2), `bradenton-vs-tampa-vacation-rentals` (2), `flights-to-anna-maria-island` (2)

Pages with 1–2 internal links and templated content are exactly what Google parks in "crawled – not indexed." Redistributing links from your strong guides/area pages into these clusters is the highest-leverage technical lever you have right now.

## Performance — 72/100

- ✅ **0 render-blocking scripts** — `homepage.js`, `hero-v2.js` are deferred.
- ✅ Fonts: preconnect + preload + `display=swap` + print-media async swap. Non-blocking. *(Self-hosting Poppins/Playfair would remove one third-party connection — minor LCP win.)*
- ⚠️ **Images: only 54% have explicit width/height; only 58% are lazy-loaded** (400 `<img>` across the site). Missing dimensions → CLS risk; missing lazy on below-fold → wasted LCP bytes.
- ⚠️ **Perf budget is looser than Google's CWV "good":** `lighthouserc.js` asserts LCP ≤ 4500ms / CLS ≤ 0.2, but Google's thresholds are 2500ms / 0.1. Passing CI does not mean passing CWV. Recommend tightening the budget toward CWV and running PSI on money routes.
- ⛔ Live field CWV not measurable this session (needs PageSpeed Insights / CrUX).

## Mobile — 85/100

- ✅ Viewport meta present on every page (base layout + standalone guides).
- ✅ Booking handled via links to `book.seascape-vacations.com` (no heavy embedded Hostaway iframe in built pages → no mobile iframe jank).
- ⛔ Touch-target size, 16px body minimum, and horizontal-scroll checks need a rendered mobile viewport (PSI mobile / `test:visual` mobile baselines) — defer to those.

## Security — 70/100

- ✅ HTTPS (Netlify), and `netlify.toml` sets `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `X-XSS-Protection`.
- ✅ No `.env` or `.git` exposed in `_site/`.
- 🟡 **Missing security headers (all absent, confirmed):** `Strict-Transport-Security` (HSTS), `Content-Security-Policy`, `Referrer-Policy`, `Permissions-Policy`. Not a ranking factor, but HSTS + a baseline `Referrer-Policy: strict-origin-when-cross-origin` are easy wins in `netlify.toml`.

## Structured data — 95/100

- ✅ **710 JSON-LD blocks across 165 pages, all schema-valid** (`verify:jsonld` passes).
- ✅ Organization schema injected site-wide; an eleventy transform back-fills Organization/LocalBusiness on `/guides/index.html`.
- 🟢 Validate the rich-result types (VacationRental/LodgingBusiness, Breadcrumb, FAQ) in Google's Rich Results Test on 2–3 live URLs to confirm eligibility, but structure is sound.

## URL structure — 90/100

- ✅ Lowercase, hyphenated, no params, ≤3 levels.
- ✅ Area pages, owner cluster under `/property-management/`, guides under `/guides/`.
- 🟡 Guides are a mix of flat `*.html` and `dir/index.html` patterns in `src/` (both build fine and resolve to clean slugs; cosmetic inconsistency only).

---

## Priority fixes

1. **[Critical] Stop the index shrink — link the thin clusters.** Add 3–5 contextual internal links into each 1–2-link `/property-management/` and `/stays/` page from relevant high-authority guides/area pages, and fix the lone orphan `/property-management/condo-rental-management-florida/`. This directly attacks the +61 "crawled – not indexed." *(Owning work: internal-linking pass in this repo.)*
2. **[Critical] Decide: prune or strengthen the programmatic pages Google is dropping.** For thin PM/stays variants with no rankings after 12+ weeks, either consolidate (301 into a stronger parent) or materially differentiate. Do **not** add new page volume while the index is shrinking — `content-priorities-2026-07.md` already says "blocked by freshness."
3. **[High] Refresh `/guides/bradenton-vs-sarasota/`.** Pure content/competition (#1 → #5). Depth + freshness pass vs Zachos/midflorida. Fix the page; don't spawn a new one.
4. **[High] Tighten the CWV budget + dimension images.** Move `lighthouserc.js` toward LCP 2500 / CLS 0.1; add `width`/`height` to the ~46% of images missing them and `loading="lazy"` to below-fold images. Run PSI on money routes.
5. **[Medium] Add HSTS + Referrer-Policy** in `netlify.toml`.
6. **[Medium] Title/meta CTR rewrites** on the 4 high-impression/low-CTR head terms (anna maria island, bradenton fl, sarasota→AMI, bradenton florida): ~70 clicks/mo upside. *(On-page, not technical.)*
7. **[Low] Repo hygiene:** delete the stale root `robots.txt` and the root `area-guide-*.html` files (not served, but edit-trap clutter).

## What is NOT broken (don't spend time here)
Canonicals, redirect graph, broken links, sitemap logic, JSON-LD validity, render-blocking JS, the srq duplicate (fixed + live). These are clean — re-auditing them is wasted motion.

---
*Raw audit output. Per repo routing, durable findings promote to `seascape-hub/intelligence/` only after a fix lands and is verified.*
