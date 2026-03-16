# Seascape Vacations Full Site Audit

Date: 2026-03-15
Site: https://seascape-vacations.com
Project type: Eleventy + hand-authored static HTML + separate deploy artifact tree

## Scope

This audit used both live-site evidence and repo/build evidence.

Live checks:
- Homepage: `/`
- Stay page: `/stays/anna-maria-island-vacation-rentals/`
- Property management page: `/property-management/vacation-rental-management-sarasota/`
- Guide page: `/guides/anna-maria-island-area-guide/`
- Technical files: `/sitemap.xml`, `/robots.txt`

Repo/build checks:
- `index.html`
- `src/stays/stays.njk`
- `src/property-management/property-management.njk`
- `src/robots.txt`
- `_site/` generated output
- `DEPLOY THIS FOLDER TO NETLIFY/` deploy artifact tree

## Scorecard

| Category | Score | Evidence |
|---|---:|---|
| Performance | 6/10 | Inner-page mobile performance is weak even though the homepage shell scores well. |
| SEO | 7/10 | Meta coverage is mostly good, but technical hygiene is inconsistent and some structured data is broken. |
| UI/UX + Accessibility | 6/10 | Visual direction is consistent, but runtime breakage, bad breadcrumbs, redirect loops, and contrast issues hurt trust. |
| Image SEO + Delivery | 4/10 | The site is leaving obvious image savings on the table and most generated pages skip responsive image fundamentals. |
| Architecture | 3/10 | There is no single source of truth; repo, build output, live HTML, and deploy artifacts are drifting apart. |

## Lighthouse Snapshot

| Page | Perf | A11y | Best Practices | SEO | Notes |
|---|---:|---:|---:|---:|---|
| Home mobile | 99 | 93 | 73 | 100 | Looks good on paper, but live console/runtime errors still exist. |
| Home desktop | 96 | 93 | 77 | 100 | Same story: shell is fast, implementation is brittle. |
| Stay mobile | 66 | 95 | 77 | 100 | LCP 6.9s, large image waste. |
| Property management mobile | 67 | 95 | 77 | 100 | LCP 5.6s, render blocking still visible. |
| Guide mobile | 85 | 94 | 100 | 92 | LCP 4.4s, invalid `robots.txt`, no main landmark. |

## Findings

### P0. Live homepage deployment is shipping broken JavaScript

What is happening:
- The live homepage HTML contains syntactically invalid inline JS.
- Playwright console shows `Unexpected token 'var'` and `Unexpected token ')'`.
- The same page also logs a real image 404.

Proof:
- Live HTML contains `n="script",var fbLoaded=false`
- Live HTML contains `fetch(mcUrl,{method:"POST",mode:"no-cors"}).catch(e=>),`
- Playwright console logged:
  - `Unexpected token 'var'`
  - `Unexpected token ')'`
  - `Failed to load resource: 404` for a CTA image

Why this matters:
- Broken JS on the homepage means you cannot trust the current production behavior, even when Lighthouse gives the shell a high score.
- This is why some homepage stats stay at `0` and why the dynamic homepage content feels brittle.

What to do:
1. Stop deploying the current post-processed homepage version.
2. Diff local `index.html` against the live HTML response and remove the transform step that is corrupting scripts.
3. Add a deployment gate that runs `node --check` against extracted inline scripts from the final built HTML.

### P0. `/property-management/` is in a redirect loop

What is happening:
- `curl -I -L https://seascape-vacations.com/property-management/` hits the redirect limit.

Why this matters:
- This URL is a logical money-page hub and is linked from guides and footers.
- A redirect loop is both a crawl trap and a dead end for users.

What to do:
1. Ship a real `/property-management/` landing page.
2. If you do not want a landing page, 301 it once to a canonical page. Do not chain or loop.
3. Re-check every footer and guide link pointing to `/property-management/`.

### P0. Inner page templates are too slow on mobile because image delivery is weak

What is happening:
- The real money pages are much slower than the homepage.
- Mobile LCP:
  - Stay page: `6.9s`
  - Property management page: `5.6s`
  - Guide page: `4.4s`

Proof:
- Stay page Lighthouse flagged `2,062 KiB` image-delivery savings.
- Property management page Lighthouse flagged `61 KiB` image-delivery savings plus render-blocking requests.
- Guide page Lighthouse flagged `1,247 KiB` image-delivery savings.

Root cause:
- `src/stays/stays.njk` and `src/property-management/property-management.njk` output full-size remote images with no `srcset`.
- Generated output shows `391` real images and all `391` are missing responsive `srcset`.
- The same `391` real images are also missing explicit `width` and `height`.

What to do:
1. Build a single image helper for all template types.
2. For property images, use Hostaway/booking CDN width parameters and modern formats.
3. Add `width`/`height` to every real content image.
4. Use `srcset` and `sizes` on every photo used in cards or content.
5. Preload only the actual LCP image, not guessed variants.

### P1. You do not have one source of truth

What is happening:
- There are at least four competing site versions:
  - repo root HTML
  - Eleventy source under `src/`
  - generated `_site/`
  - `DEPLOY THIS FOLDER TO NETLIFY/`

Proof:
- Local `index.html` is `277,266` bytes and has `7` script tags.
- Live homepage HTML is `193,455` bytes and has `12` script tags.
- Local source scripts pass syntax check.
- Live homepage scripts do not.
- The homepage ships `17` hidden pseudo-pages inside a single HTML file.

Why this matters:
- Fixes in one place are not guaranteed to reach production.
- Metadata, schema, UX, and performance work will keep drifting.

What to do:
1. Pick one deploy source.
2. Delete or archive the other output trees.
3. Make production deploy from a repeatable build, not a hand-curated folder.
4. Add one smoke test that fetches live HTML and compares key markers to the build output.

### P1. Structured data is malformed on live pages

What is happening:
- A live stay page emits FAQ JSON-LD with raw HTML inside the `text` value.
- Example: `Manatee Public Beach in <a href="/guides/holmes-beach-area-guide/">Holmes Beach</a>...`

Why this matters:
- That makes the JSON-LD invalid.
- You lose FAQ rich result eligibility and you train crawlers to distrust the page markup.

Proof:
- Playwright console warning:
  - `[Meta Pixel] - Unable to parse JSON-LD tag. Malformed JSON found...`

What to do:
1. Strip all HTML from FAQ answer text before serializing JSON-LD.
2. Keep FAQ schema text plain text only.
3. Add schema validation to the build.

### P1. Guide-page metadata is inconsistent with the live URL

What is happening:
- The guide page canonical is `/guides/anna-maria-island-area-guide/`
- But `og:url`, `schema.url`, and breadcrumb schema items still point to `/area-guide-ami`

Why this matters:
- You are giving search engines and social parsers mixed signals about the canonical page identity.

What to do:
1. Make canonical, `og:url`, schema `url`, and breadcrumb item URLs all identical.
2. Fix the guide templates once, then regenerate the whole guide set.

### P1. `robots.txt` is invalid

What is happening:
- Lighthouse flags the live file because it contains:
  - `LLMs-txt: https://seascape-vacations.com/llms.txt`

Why this matters:
- `robots.txt` only supports known directives.
- Unsupported directives are not future-proof and currently trip validation.

What to do:
1. Remove `LLMs-txt:` from `robots.txt`.
2. Serve `llms.txt` as its own file and link to it elsewhere if you want.

### P1. There are still broken assets and broken internal links in production

Homepage:
- Missing CTA background image:
  - `https://seascape-vacations.com/wp-content/uploads/...jpg` returns `404`
- Missing preloaded asset:
  - `hero-mobile.webp` is preloaded but not present
- Missing favicon:
  - `/favicon.ico` returns `404`

Guide page:
- One internal link literally points to:
  - `/stays/anna-maria-island-homes-with-pool/"`
- That URL returns `404`
- The breadcrumb “Home” link resolves to the current guide page because it uses `index.html` relative to the guide directory.

Why this matters:
- Broken images hit trust.
- Broken links waste internal authority and create user dead ends.

What to do:
1. Replace every stale `wp-content/uploads` reference.
2. Either ship `hero-mobile.webp` or stop preloading it.
3. Add a real favicon.
4. Run link validation on the final built HTML before deploy.

### P1. Image SEO implementation is still template-level weak

Repo/build evidence:
- `_site/` contains `391` real content images.
- `391/391` are missing `width` and `height`.
- `391/391` are missing responsive `srcset`.

Live evidence:
- Stay page property images have no explicit dimensions.
- Guide page content image has no explicit dimensions.
- Guide/property cards rely heavily on CSS background images, which are worse for image SEO than real content images.

What to do:
1. Stop using CSS background images for content-bearing photos where image search or context matters.
2. Use semantic `<img>` or `<picture>` with alt text, dimensions, and responsive sources.
3. Move logos and hero assets to a consistent image pipeline too.

### P2. The homepage uses JS-driven faux routing instead of real links

What is happening:
- `index.html` contains `55` `showPage(...)` click handlers.
- Breakdown:
  - `28` on `<span>`
  - `14` on `<div>`
  - `13` on `<button>`

Why this matters:
- This is weaker for semantics, accessibility, open-in-new-tab behavior, analytics clarity, and long-term SEO.
- It also explains why the homepage HTML is so large and fragile.

What to do:
1. Convert navigation and content discovery to real anchor links and real pages.
2. Keep JS for enhancement, not for basic routing.

### P2. Accessibility is close, but not clean

Representative issues:
- Guide pages have no `<main>` landmark.
- Multiple breadcrumb and tag colors fail contrast.
- Homepage and guide pages both show contrast failures.

What to do:
1. Add a single `<main>` landmark to all guide/article templates.
2. Darken `--brand` usage on light cream backgrounds.
3. Re-run accessibility checks after token changes.

### P2. The homepage is shipping too much hidden DOM

What is happening:
- The live homepage still contains `17` hidden “pages” inside one document:
  - `home`, `properties`, `property-detail`, `experiences`, `homeowners`, `blog`, `blog-1` through `blog-10`, `contact`

Why this matters:
- You are paying the DOM, CSS, and maintenance cost for routes the user did not ask for.
- It also makes bugs harder to isolate and increases the chance of deploy-time corruption.

What to do:
1. Break those pseudo-pages into actual URLs.
2. Keep the homepage focused on homepage content only.

## Image Audit Summary

Build output image inventory:

| Metric | Count |
|---|---:|
| Total images in `_site` | 18 files |
| Total image bytes in `_site` | 7.77 MB |
| Largest single image | `hero.jpg` at 4.35 MB |
| Real `<img>` tags across generated pages | 391 |
| Real images missing dimensions | 391 |
| Real images missing `srcset` | 391 |

Biggest obvious file risks in `_site`:
- `hero.jpg` — 4.35 MB
- `hero-optimized.jpg` — 558 KB
- `images/ami-colorful-cottages.jpg` — 274 KB
- `images/ami-hero.jpg` — 229 KB
- `images/siesta-key-intro.jpg` — 219 KB

Live guide-page image waste examples:
- `ami-colorful-cottages.jpg`: about `192 KB` recoverable
- `ami-hero.webp`: about `93 KB` recoverable
- Each Hostaway property image in guide cards: `228 KB` to `294 KB` recoverable

## Quick Wins

Do these first:

1. Remove `LLMs-txt:` from `robots.txt`.
2. Fix the `/property-management/` redirect loop.
3. Replace the broken homepage `wp-content/uploads` CTA image.
4. Ship the actual `hero-mobile.webp` file or remove that preload.
5. Fix the guide link with the trailing quote.
6. Add a real favicon.
7. Strip HTML from FAQ JSON-LD answers.
8. Add `width` and `height` to every logo and card image immediately, even before full `srcset` work.

## Recommended Fix Order

### Phase 1: Stop the bleeding

1. Fix deployment pipeline corruption on the homepage.
2. Fix `/property-management/` redirect loop.
3. Remove broken assets and broken internal links.
4. Make `robots.txt` valid again.

### Phase 2: Recover mobile performance

1. Replace raw full-size property images with responsive image URLs.
2. Add dimensions and `srcset` everywhere.
3. Remove incorrect image preloads.
4. Re-test the stay and property-management templates on mobile until LCP is under `2.5s`.

### Phase 3: Clean up technical SEO

1. Align canonical, `og:url`, schema URL, and breadcrumbs on all guide pages.
2. Validate FAQ JSON-LD and breadcrumb schema.
3. Replace content-card background images with semantic image markup where appropriate.

### Phase 4: Fix architecture

1. Pick one build path and delete the others from the deploy flow.
2. Break the homepage pseudo-pages into real routes.
3. Add CI checks for:
   - broken links
   - Lighthouse baseline on representative pages
   - schema validation
   - JS syntax on final built HTML

## Kill Switch

If these two conditions are still true after the first round of fixes, stop patching and rewrite the delivery pipeline:

1. Production HTML still differs materially from the local build output.
2. Inner-page mobile LCP is still above `2.5s` after responsive image fixes.

If those stay broken, you do not have an optimization problem anymore. You have a build-system trust problem.
