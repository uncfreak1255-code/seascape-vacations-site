# Seascape Vacations — Enterprise A+ Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Elevate every dimension of seascape-vacations.com to A+ enterprise quality — on-page SEO, technical SEO, design consistency, content quality, site structure, and blog/local-guide experience.

**Architecture:** Static HTML site on Netlify (no build step). Two main pages — `index.html` (188 KB homepage SPA) and `properties/index.html` (218 KB). 48 standalone guide pages, 89 stay pages, 31 property-management pages, 5 property detail pages. All changes are direct HTML/CSS/JS edits to the deploy folder. Deploy via Netlify API.

**Tech Stack:** HTML5, CSS3 (inline + CSS variables), vanilla JS, Netlify CDN, Google Fonts (Poppins + Playfair Display), Facebook Pixel, GA4 via GTM, JSON-LD structured data.

---

## Safe Rollback Reference

| Tag | Commit | Description |
|-----|--------|-------------|
| `pre-enterprise-audit` | `4cddb79` | **PRIMARY ROLLBACK** — clean state before any A+ changes |
| `pre-emoji-cleanup` | `7331f5e` | Before emoji→SVG conversion |
| `pre-redesign-backup` | `b56c2ee` | Original site before all sessions |

**Rollback command:** `git checkout pre-enterprise-audit -- "DEPLOY THIS FOLDER TO NETLIFY/"` then redeploy.

---

## Current Scores & Targets

| Dimension | Current | Target | Key Gaps |
|-----------|---------|--------|----------|
| On-Page SEO | B+ | A+ | Properties missing meta desc, 3 empty H2s, no Article schema on guides |
| Technical SEO | B | A+ | 3 duplicate Google Font loads, 35/36 images missing width/height, 4 console.logs, no `<main>` tag |
| Design Consistency | C+ | A+ | 674 inline styles, 16 off-brand colors, 11 border-radius values, 3+ font family variants |
| Content Quality | C | A+ | 4 thin blog articles (<150 words), inaccurate read-times, only 1/10 blogs has CTA |
| Site Structure | A- | A+ | Blog articles are SPA divs (not indexable), Local Guide cards are dead ends |
| Blog/Local Guide | D+ | A+ | Duplicate photos, overlapping topics, no internal linking, no related content |
| Accessibility | D | A+ | 0 aria-labels, 0 role attributes, no skip-nav, no focus management |
| Performance | B- | A+ | Duplicate font loads, 35 images without dimensions, console.logs in prod |

---

## Phase 1: Critical SEO & Structure Fixes (Tasks 1–8)
*Priority: Highest — these directly affect Google indexing and user navigation*

### Task 1: Wire Blog Cards to Standalone Guide Pages

**Files:**
- Modify: `DEPLOY THIS FOLDER TO NETLIFY/index.html`

**Context:** Blog cards currently call `showPage("blog-N")` which loads hidden SPA divs. Google cannot index SPA content. We already have 48 standalone guide pages in `/guides/` that cover the same topics. We need to redirect blog cards to these real pages.

**Step 1: Create the blog-to-guide mapping**

Map each blog card to its matching standalone guide:

```
blog-1 "Ultimate Guide to Anna Maria Island Beaches" → /guides/anna-maria-island-beaches.html
blog-2 "Why Booking Direct Saves You Hundreds" → /guides/booking-direct-vacation-rentals.html
blog-3 "15 Best Restaurants Near Anna Maria Island" → /guides/best-restaurants-anna-maria-island.html
blog-4 "Planning the Perfect Family Vacation" → /guides/family-vacation-anna-maria-island.html
blog-5 "Best Time to Visit: Month-by-Month Guide" → /guides/best-time-visit-anna-maria-island.html
blog-6 "Where to See Dolphins and Manatees" → /guides/dolphins-manatees-bradenton.html
blog-7 "Ultimate Shelling Guide" → /guides/shelling-guide-florida.html
blog-8 "Complete Fishing Guide" → /guides/fishing-guide-anna-maria-sarasota.html
blog-9 "Siesta Key Beach" → /guides/siesta-key-beach-guide.html
blog-10 "How Much Can You Make Renting" → /guides/vacation-rental-income-anna-maria.html
```

**Step 2: Replace each `showPage("blog-N")` in blog card onclick with `window.location.href="/guides/..."` **

For each blog card, find:
```javascript
onclick="showPage('blog-1')"
```
Replace with:
```javascript
onclick="window.location.href='/guides/anna-maria-island-beaches.html'"
```

Repeat for all 10 blog cards using the mapping above.

**Step 3: Remove the hidden SPA `<div id="blog-N">` sections**

Search for and remove all `<div id="blog-1">` through `<div id="blog-10">` hidden content blocks. These are large HTML chunks (each 500+ words of content) that are never indexed by Google. Removing them also reduces the homepage from 188 KB.

**Step 4: Verify no JS references remain to removed blog divs**

Search for any remaining `showPage("blog-` references and remove or redirect them.

**Step 5: Test locally**

```bash
python3 -m http.server 8080 -d "DEPLOY THIS FOLDER TO NETLIFY/"
```
Click each blog card → should navigate to the standalone guide page.

**Step 6: Commit**

```bash
git add "DEPLOY THIS FOLDER TO NETLIFY/index.html"
git commit -m "feat(seo): wire blog cards to standalone guide pages instead of SPA divs"
```

---

### Task 2: Wire Local Guide / Experience Cards to Guide Pages

**Files:**
- Modify: `DEPLOY THIS FOLDER TO NETLIFY/index.html`

**Context:** The 6 experience cards in the Local Area Guide section have NO onclick and NO links — they are complete dead ends. Each card topic maps to an existing guide page.

**Step 1: Create the experience-to-guide mapping**

```
Beaches → /guides/anna-maria-island-beaches.html
Wildlife (Dolphins & Manatees) → /guides/dolphins-manatees-bradenton.html
Shopping & Dining → /guides/best-restaurants-anna-maria-island.html
Water Sports → /guides/things-to-do-bradenton-fl.html
Fishing → /guides/fishing-guide-anna-maria-sarasota.html
Culture & Arts → /guides/things-to-do-bradenton-fl.html
```

**Step 2: Add onclick or wrap each experience card in an `<a>` tag**

For each card div, add:
```html
onclick="window.location.href='/guides/anna-maria-island-beaches.html'" style="cursor:pointer"
```

Or better — wrap the card content in a semantic `<a>` tag for accessibility and SEO:
```html
<a href="/guides/anna-maria-island-beaches.html" class="exp-card" style="text-decoration:none;color:inherit">
  <!-- existing card content -->
</a>
```

**Step 3: Add hover effect CSS for clickable cards**

Add to the `<style>` block:
```css
.exp-card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,0.12); }
.exp-card { transition: transform 0.2s, box-shadow 0.2s; }
```

**Step 4: Test that all 6 cards navigate correctly**

**Step 5: Commit**

```bash
git add "DEPLOY THIS FOLDER TO NETLIFY/index.html"
git commit -m "feat(ux): wire local guide cards to standalone guide pages"
```

---

### Task 3: Fix Empty H2 Tags

**Files:**
- Modify: `DEPLOY THIS FOLDER TO NETLIFY/index.html`

**Context:** 3 empty `<h2>` tags exist. Empty headings confuse screen readers and waste heading hierarchy for SEO.

**Step 1: Find all empty H2s**

```bash
grep -n '<h2[^>]*>\s*</h2>' "DEPLOY THIS FOLDER TO NETLIFY/index.html"
```

**Step 2: For each empty H2, either:**
- Add meaningful content if the section needs a heading
- Remove the tag entirely if it's decorative

**Step 3: Verify H2 count reduced by 3**

```bash
grep -c '<h2' "DEPLOY THIS FOLDER TO NETLIFY/index.html"
# Should be 62 (was 65)
```

**Step 4: Commit**

```bash
git add "DEPLOY THIS FOLDER TO NETLIFY/index.html"
git commit -m "fix(seo): remove 3 empty H2 tags"
```

---

### Task 4: Add Meta Description to Properties Page

**Files:**
- Modify: `DEPLOY THIS FOLDER TO NETLIFY/properties/index.html`

**Context:** Properties page is MISSING a meta description (critical for Google SERP snippets).

**Step 1: Add meta description after `<title>` tag**

```html
<meta name="description" content="Browse 5 handpicked waterfront vacation rentals in Bradenton, Anna Maria Island & Sarasota. Book direct with Seascape Vacations for the best rates — no booking fees.">
```

Target: 155 characters, includes primary keywords, includes CTA.

**Step 2: Verify tag is present**

```bash
grep 'meta name="description"' "DEPLOY THIS FOLDER TO NETLIFY/properties/index.html"
```

**Step 3: Commit**

```bash
git add "DEPLOY THIS FOLDER TO NETLIFY/properties/index.html"
git commit -m "fix(seo): add meta description to properties page"
```

---

### Task 5: Replace Duplicate Unsplash Photos

**Files:**
- Modify: `DEPLOY THIS FOLDER TO NETLIFY/index.html`

**Context:** 10 Unsplash photo IDs are reused across the page. The worst offenders:
- `photo-1507525428034` (beach): used 6 times
- `photo-1600596542815` (beach house): used 6 times
- `photo-1414235077428`: used 3 times
- `photo-1544552866` (underwater): used 3 times

**Step 1: For each duplicate, find a unique replacement from Unsplash**

Replace duplicate instances (keep the first occurrence, replace subsequent ones) with unique, relevant Unsplash URLs. Choose photos that match the card's specific topic.

Replacement strategy:
- Keep one instance of each photo for its most relevant card
- Replace all other instances with new, unique Unsplash images
- Ensure each new image matches the topic (beach → beach, fishing → fishing, etc.)

**Step 2: Update alt text to match new images**

Each replaced image should have accurate, descriptive alt text matching the new photo content.

**Step 3: Verify no photo ID appears more than once**

```bash
grep -oP 'photo-[a-f0-9]+' "DEPLOY THIS FOLDER TO NETLIFY/index.html" | sort | uniq -c | sort -rn | head -10
# All counts should be 1
```

**Step 4: Commit**

```bash
git add "DEPLOY THIS FOLDER TO NETLIFY/index.html"
git commit -m "fix(content): replace duplicate Unsplash photos with unique images"
```

---

### Task 6: Add Booking CTAs to Blog Grid

**Files:**
- Modify: `DEPLOY THIS FOLDER TO NETLIFY/index.html`

**Context:** Only 1 of 10 blog articles has a booking CTA. The blog grid needs a CTA bar below it to capture intent.

**Step 1: Add CTA section after blog grid**

Insert after the blog cards container:
```html
<div style="text-align:center;padding:40px 20px;background:var(--cream);border-radius:var(--radius);margin-top:32px">
  <h3 style="font-family:'Playfair Display',serif;color:var(--brand-dark);font-size:1.6rem;margin-bottom:12px">Ready to Experience the Gulf Coast?</h3>
  <p style="color:#555;margin-bottom:20px;font-size:1.05rem">Browse our handpicked waterfront rentals and book direct for the best rates.</p>
  <a href="/properties/" style="display:inline-block;padding:14px 36px;background:var(--gold);color:#fff;text-decoration:none;border-radius:50px;font-weight:600;font-size:1.05rem;transition:transform 0.2s">View Our Properties</a>
</div>
```

**Step 2: Verify CTA renders properly and link works**

**Step 3: Commit**

```bash
git add "DEPLOY THIS FOLDER TO NETLIFY/index.html"
git commit -m "feat(conversion): add booking CTA below blog grid"
```

---

### Task 7: Fix Read-Time Claims on Blog Cards

**Files:**
- Modify: `DEPLOY THIS FOLDER TO NETLIFY/index.html`

**Context:** Blog cards claim "12 min read" or similar for articles with only 96–149 words. Since we're now linking to standalone guide pages (Task 1), the read times should reflect the actual guide page content, not the old SPA snippets.

**Step 1: Check word counts of target guide pages**

```bash
for f in anna-maria-island-beaches.html booking-direct-vacation-rentals.html best-restaurants-anna-maria-island.html family-vacation-anna-maria-island.html best-time-visit-anna-maria-island.html dolphins-manatees-bradenton.html shelling-guide-florida.html fishing-guide-anna-maria-sarasota.html siesta-key-beach-guide.html vacation-rental-income-anna-maria.html; do
  words=$(sed 's/<[^>]*>//g' "DEPLOY THIS FOLDER TO NETLIFY/guides/$f" | wc -w)
  mins=$((words / 200))
  echo "$f: $words words → ${mins} min read"
done
```

**Step 2: Update each blog card's read-time badge to match actual guide page word count**

Use formula: `ceil(word_count / 200)` for minutes.

**Step 3: Commit**

```bash
git add "DEPLOY THIS FOLDER TO NETLIFY/index.html"
git commit -m "fix(content): update blog card read-time badges to match actual guide page lengths"
```

---

### Task 8: Add Article JSON-LD Schema to Guide Pages

**Files:**
- Modify: All 48 files in `DEPLOY THIS FOLDER TO NETLIFY/guides/`

**Context:** Guide pages have JSON-LD but may lack `Article` schema type. Adding `Article` schema enables rich results in Google (author, date, headline, image).

**Step 1: Audit existing schemas on guide pages**

```bash
for f in DEPLOY\ THIS\ FOLDER\ TO\ NETLIFY/guides/*.html; do
  types=$(grep -oP '"@type"\s*:\s*"([^"]+)"' "$f" | head -5)
  echo "$(basename $f): $types"
done
```

**Step 2: For each guide page missing `Article` schema, add:**

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "[PAGE TITLE]",
  "description": "[META DESCRIPTION]",
  "author": {
    "@type": "Organization",
    "name": "Seascape Vacations"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Seascape Vacations",
    "url": "https://seascape-vacations.com"
  },
  "datePublished": "2026-03-03",
  "dateModified": "2026-03-07",
  "mainEntityOfPage": "[CANONICAL URL]"
}
</script>
```

**Step 3: Validate with Google's Rich Results Test (manual check)**

**Step 4: Commit**

```bash
git add "DEPLOY THIS FOLDER TO NETLIFY/guides/"
git commit -m "feat(seo): add Article JSON-LD schema to all guide pages"
```

---

## Phase 2: Design Consistency & Accessibility (Tasks 9–15)
*Priority: High — visual polish and WCAG compliance*

### Task 9: Consolidate Off-Brand Colors into CSS Variables

**Files:**
- Modify: `DEPLOY THIS FOLDER TO NETLIFY/index.html`
- Modify: `DEPLOY THIS FOLDER TO NETLIFY/properties/index.html`

**Context:** 16 off-brand hex colors used across 140+ inline styles. Need to consolidate into the existing CSS variable system.

**Step 1: Define new CSS variables for legitimate neutral tones**

Add to the `:root` CSS block:
```css
--gray-100: #F9F9F9;  /* replaces #F9F9F9, #F5F5F5, #FAF7F2 */
--gray-200: #EEEEEE;  /* replaces #EEE, #E8E8E8 */
--gray-300: #CCCCCC;  /* replaces #CCC, #DDD */
--gray-text: #555555;  /* secondary text */
--brand-darker: #1A3A3C;  /* replaces #1A3A3C */
--gold-dark: #B8943A;  /* replaces #B8943A, #B8963A */
--error: #E74C3C;  /* replaces #E74C3C, #FF4757 */
--success: #2ECC71;  /* replaces #2ECC71 */
```

**Step 2: Find-and-replace each off-brand hex with its CSS variable**

```
#F9F9F9 → var(--gray-100)     (18 occurrences)
#EEE    → var(--gray-200)     (30 occurrences)
#E8E8E8 → var(--gray-200)     (4 occurrences)
#CCC    → var(--gray-300)     (8 occurrences)
#FF4757 → var(--error)        (2 occurrences)
etc.
```

**Step 3: Verify visual appearance hasn't changed (screenshot comparison)**

**Step 4: Commit**

```bash
git add "DEPLOY THIS FOLDER TO NETLIFY/index.html" "DEPLOY THIS FOLDER TO NETLIFY/properties/index.html"
git commit -m "refactor(design): consolidate off-brand colors into CSS variables"
```

---

### Task 10: Standardize Border-Radius Values

**Files:**
- Modify: `DEPLOY THIS FOLDER TO NETLIFY/index.html`
- Modify: `DEPLOY THIS FOLDER TO NETLIFY/properties/index.html`

**Context:** 11 different border-radius values (4px through 50px plus 50%). Standardize to 4 values.

**Step 1: Define radius scale in CSS variables**

```css
--radius-sm: 8px;    /* replaces 4px, 8px */
--radius-md: 12px;   /* replaces 10px, 12px */
--radius-lg: 16px;   /* replaces 16px, 20px, 24px */
--radius-xl: 50px;   /* replaces 30px, 50px — pills/buttons */
/* Keep 50% for circles */
```

**Step 2: Replace all inline border-radius values with CSS variables**

```
border-radius:4px  → border-radius:var(--radius-sm)
border-radius:8px  → border-radius:var(--radius-sm)
border-radius:10px → border-radius:var(--radius-md)
border-radius:12px → border-radius:var(--radius-md)
border-radius:16px → border-radius:var(--radius-lg)
border-radius:20px → border-radius:var(--radius-lg)
border-radius:24px → border-radius:var(--radius-lg)
border-radius:30px → border-radius:var(--radius-xl)
border-radius:50px → border-radius:var(--radius-xl)
```

**Step 3: Commit**

```bash
git add "DEPLOY THIS FOLDER TO NETLIFY/index.html" "DEPLOY THIS FOLDER TO NETLIFY/properties/index.html"
git commit -m "refactor(design): standardize border-radius to 4-value scale"
```

---

### Task 11: Remove Duplicate Google Font Loads

**Files:**
- Modify: `DEPLOY THIS FOLDER TO NETLIFY/index.html`

**Context:** Google Fonts CSS is loaded 3 times (same URL). This causes 2 redundant network requests on every page load.

**Step 1: Keep only the first `<link>` to Google Fonts**

Keep the preloaded one:
```html
<link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap">
```

Remove the other 2 duplicate `<link>` tags.

**Step 2: Verify fonts still render correctly**

**Step 3: Commit**

```bash
git add "DEPLOY THIS FOLDER TO NETLIFY/index.html"
git commit -m "perf: remove 2 duplicate Google Font stylesheet loads"
```

---

### Task 12: Add Width/Height to All Images (CLS Fix)

**Files:**
- Modify: `DEPLOY THIS FOLDER TO NETLIFY/index.html`
- Modify: `DEPLOY THIS FOLDER TO NETLIFY/properties/index.html`

**Context:** 35/36 images are missing width and height attributes. This causes Cumulative Layout Shift (CLS) — a Core Web Vital that Google uses for ranking.

**Step 1: For each `<img>` tag, add width and height attributes**

Standard sizes based on usage:
- Hero images: `width="1200" height="600"`
- Card images: `width="400" height="300"`
- Gallery images: `width="600" height="400"`
- Thumbnails: `width="80" height="80"`

Add `style="width:100%;height:auto"` alongside to maintain responsiveness.

**Step 2: Verify no layout shift occurs on page load**

**Step 3: Commit**

```bash
git add "DEPLOY THIS FOLDER TO NETLIFY/index.html" "DEPLOY THIS FOLDER TO NETLIFY/properties/index.html"
git commit -m "perf(cls): add width/height attributes to all images"
```

---

### Task 13: Add Accessibility Attributes

**Files:**
- Modify: `DEPLOY THIS FOLDER TO NETLIFY/index.html`
- Modify: `DEPLOY THIS FOLDER TO NETLIFY/properties/index.html`

**Context:** 0 aria-labels, 0 role attributes, 0 tabindex, no skip navigation link. WCAG 2.1 AA compliance requires these.

**Step 1: Add skip navigation link**

At the very top of `<body>`:
```html
<a href="#main-content" class="skip-link" style="position:absolute;top:-100%;left:50%;transform:translateX(-50%);background:var(--brand);color:#fff;padding:12px 24px;z-index:10000;border-radius:0 0 8px 8px;transition:top 0.2s">Skip to main content</a>
```

Add CSS:
```css
.skip-link:focus { top: 0; }
```

**Step 2: Add `<main id="main-content">` wrapper**

Wrap the primary content area in a `<main>` tag.

**Step 3: Add aria-labels to interactive elements**

```html
<!-- Navigation -->
<nav aria-label="Main navigation">

<!-- Search/filter -->
<input aria-label="Search properties">

<!-- Social links -->
<a href="..." aria-label="Visit our Facebook page">
<a href="..." aria-label="Visit our Instagram page">

<!-- Image carousels -->
<button aria-label="Previous image">
<button aria-label="Next image">

<!-- Close buttons -->
<button aria-label="Close dialog">
```

**Step 4: Add role attributes to landmark sections**

```html
<header role="banner">
<nav role="navigation">
<main role="main">
<footer role="contentinfo">
<section role="region" aria-label="Featured Properties">
```

**Step 5: Add theme-color meta tag**

```html
<meta name="theme-color" content="#5F8A8B">
```

**Step 6: Remove console.log calls from production**

Search and remove all 4 `console.log` statements.

**Step 7: Commit**

```bash
git add "DEPLOY THIS FOLDER TO NETLIFY/index.html" "DEPLOY THIS FOLDER TO NETLIFY/properties/index.html"
git commit -m "feat(a11y): add WCAG 2.1 AA accessibility attributes, skip-nav, landmarks"
```

---

### Task 14: Consolidate Font Family Declarations

**Files:**
- Modify: `DEPLOY THIS FOLDER TO NETLIFY/index.html`

**Context:** 13 different font-family declarations when there should be 2. Variants like `'Playfair Display',serif` vs `'Playfair Display',Georgia,serif` and `Poppins,-apple-system,sans-serif` vs `Poppins,sans-serif`.

**Step 1: Define canonical font stacks in CSS variables**

```css
--font-heading: 'Playfair Display', serif;
--font-body: 'Poppins', sans-serif;
```

**Step 2: Replace all font-family inline declarations with variables**

```
font-family:'Playfair Display',serif          → font-family:var(--font-heading)
font-family:'Playfair Display',Georgia,serif  → font-family:var(--font-heading)
font-family:Poppins,sans-serif                → font-family:var(--font-body)
font-family:Poppins,-apple-system,sans-serif  → font-family:var(--font-body)
font-family:'Poppins',sans-serif              → font-family:var(--font-body)
font-family:Inter,sans-serif                  → font-family:var(--font-body)
font-family:inherit                           → (remove, let cascade work)
```

**Step 3: Verify fonts render identically**

**Step 4: Commit**

```bash
git add "DEPLOY THIS FOLDER TO NETLIFY/index.html"
git commit -m "refactor(design): consolidate font-family declarations into CSS variables"
```

---

### Task 15: Add Lazy Loading to Remaining Images

**Files:**
- Modify: `DEPLOY THIS FOLDER TO NETLIFY/index.html`
- Modify: `DEPLOY THIS FOLDER TO NETLIFY/properties/index.html`

**Context:** Only 13/36 homepage images and 14/36 properties images are lazy loaded. Above-the-fold images (hero, first property card) should NOT be lazy loaded. All others should.

**Step 1: Add `loading="lazy"` to all below-fold images**

Do NOT add to:
- Hero image (already has `fetchpriority="high"`)
- First visible property card image

Add to all others:
```html
<img loading="lazy" ...>
```

**Step 2: Commit**

```bash
git add "DEPLOY THIS FOLDER TO NETLIFY/index.html" "DEPLOY THIS FOLDER TO NETLIFY/properties/index.html"
git commit -m "perf: lazy-load all below-fold images"
```

---

## Phase 3: Content Quality & Internal Linking (Tasks 16–20)
*Priority: Medium — improves engagement, dwell time, and topical authority*

### Task 16: Add Internal Linking Between Guide Pages

**Files:**
- Modify: All 48 guide pages in `DEPLOY THIS FOLDER TO NETLIFY/guides/`

**Context:** Guide pages have internal links (sample had 15) but need a "Related Guides" section at the bottom for better topical clustering.

**Step 1: Define related content clusters**

```
BEACHES: anna-maria-island-beaches, siesta-key-beach-guide, bradenton-beach, holmes-beach
ACTIVITIES: things-to-do-bradenton-fl, dolphins-manatees-bradenton, fishing-guide, shelling-guide
PLANNING: best-time-visit, family-vacation, how-to-get-to, do-you-need-a-car, vacation-cost
DINING: best-restaurants, best-waterfront-restaurants
COMPARISON: anna-maria-vs-siesta-key, anna-maria-vs-longboat-key, anna-maria-vs-clearwater, bradenton-vs-sarasota
```

**Step 2: Add "Related Guides" section before footer on each guide page**

```html
<section style="max-width:800px;margin:40px auto;padding:32px;background:var(--cream);border-radius:var(--radius-lg)">
  <h2 style="font-family:var(--font-heading);color:var(--brand-dark);margin-bottom:16px">Related Guides</h2>
  <ul style="list-style:none;padding:0;display:grid;grid-template-columns:1fr 1fr;gap:12px">
    <li><a href="/guides/[related-1].html" style="color:var(--brand);text-decoration:none;font-weight:500">[Related Title 1]</a></li>
    <li><a href="/guides/[related-2].html" style="color:var(--brand);text-decoration:none;font-weight:500">[Related Title 2]</a></li>
    <li><a href="/guides/[related-3].html" style="color:var(--brand);text-decoration:none;font-weight:500">[Related Title 3]</a></li>
    <li><a href="/guides/[related-4].html" style="color:var(--brand);text-decoration:none;font-weight:500">[Related Title 4]</a></li>
  </ul>
</section>
```

**Step 3: Automate with a script**

Write a Python script that reads each guide, determines its cluster, and injects the related links section.

**Step 4: Commit**

```bash
git add "DEPLOY THIS FOLDER TO NETLIFY/guides/"
git commit -m "feat(seo): add related guides internal linking to all guide pages"
```

---

### Task 17: Add Booking CTAs to All Guide Pages

**Files:**
- Modify: All 48 guide pages in `DEPLOY THIS FOLDER TO NETLIFY/guides/`

**Context:** Guide pages drive organic traffic but need conversion opportunities.

**Step 1: Add CTA section after the main content, before Related Guides**

```html
<div style="text-align:center;padding:40px 24px;background:linear-gradient(135deg,var(--brand),var(--brand-dark));border-radius:var(--radius-lg);margin:40px auto;max-width:800px">
  <h3 style="font-family:var(--font-heading);color:#fff;font-size:1.5rem;margin-bottom:12px">Plan Your Gulf Coast Getaway</h3>
  <p style="color:rgba(255,255,255,0.9);margin-bottom:20px">Browse our waterfront vacation rentals and book direct for the best rates.</p>
  <a href="/properties/" style="display:inline-block;padding:14px 36px;background:var(--gold);color:#fff;text-decoration:none;border-radius:50px;font-weight:600">View Properties</a>
</div>
```

**Step 2: Automate insertion with a script**

**Step 3: Commit**

```bash
git add "DEPLOY THIS FOLDER TO NETLIFY/guides/"
git commit -m "feat(conversion): add booking CTA to all guide pages"
```

---

### Task 18: Expand Thin Blog Content (Guide Pages)

**Files:**
- Modify: Guide pages that correspond to the 4 thinnest blog articles

**Context:** The original SPA blog articles were thin (96–149 words). Now that blog cards point to standalone guide pages, verify those guide pages have substantial content (600+ words).

**Step 1: Check word counts of the 4 guide pages that replaced thin articles**

```bash
for f in family-vacation-anna-maria-island.html best-time-visit-anna-maria-island.html dolphins-manatees-bradenton.html; do
  words=$(sed 's/<[^>]*>//g' "DEPLOY THIS FOLDER TO NETLIFY/guides/$f" | wc -w)
  echo "$f: $words words"
done
```

**Step 2: If any guide page is under 600 words, expand it**

Add sections covering:
- Practical tips and recommendations
- Seasonal considerations
- Links to specific properties
- FAQ section (which also enables FAQ schema)

**Step 3: Commit**

```bash
git add "DEPLOY THIS FOLDER TO NETLIFY/guides/"
git commit -m "feat(content): expand thin guide pages to 600+ words"
```

---

### Task 19: Add FAQ Schema to Guide Pages

**Files:**
- Modify: Guide pages in `DEPLOY THIS FOLDER TO NETLIFY/guides/`

**Context:** FAQ schema enables rich FAQ dropdowns in Google search results, dramatically increasing SERP real estate.

**Step 1: For each guide page that has a FAQ section, add FAQPage schema**

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "[Question text]",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "[Answer text]"
      }
    }
  ]
}
</script>
```

**Step 2: Extract Q&A pairs from existing FAQ sections in guide pages**

**Step 3: Commit**

```bash
git add "DEPLOY THIS FOLDER TO NETLIFY/guides/"
git commit -m "feat(seo): add FAQ schema to guide pages with FAQ sections"
```

---

### Task 20: Self-Host Critical Images on Netlify CDN

**Files:**
- Create: `DEPLOY THIS FOLDER TO NETLIFY/images/` directory with downloaded images
- Modify: `DEPLOY THIS FOLDER TO NETLIFY/index.html`
- Modify: `DEPLOY THIS FOLDER TO NETLIFY/properties/index.html`

**Context:** All images load from Unsplash CDN (external origin). Self-hosting on Netlify CDN eliminates third-party dependency, enables proper caching headers, and improves LCP times.

**Step 1: Download hero images and most-visible card images**

Priority: Hero images (mobile + desktop), first 5 property card images, experience card images.

**Step 2: Save to `/images/` with descriptive filenames**

```
images/hero-desktop.webp
images/hero-mobile.webp
images/property-river-house.webp
images/property-sarasota-luxe.webp
etc.
```

**Step 3: Update `<img>` src attributes to use local paths**

**Step 4: Verify images load from Netlify CDN (check Network tab)**

**Step 5: Commit**

```bash
git add "DEPLOY THIS FOLDER TO NETLIFY/images/" "DEPLOY THIS FOLDER TO NETLIFY/index.html" "DEPLOY THIS FOLDER TO NETLIFY/properties/index.html"
git commit -m "perf: self-host critical images on Netlify CDN"
```

---

## Phase 4: Deploy & Verify (Tasks 21–23)

### Task 21: Create Pre-Deploy Rollback Tag

**Step 1: Tag the current state**

```bash
git tag -a pre-a-plus-deploy -m "Safe state before A+ enterprise changes deploy"
```

---

### Task 22: Deploy to Netlify

**Step 1: Deploy using Netlify API**

```bash
cd "DEPLOY THIS FOLDER TO NETLIFY"
zip -r ../deploy.zip . -x "*.git*"
curl -s -H "Authorization: Bearer $NETLIFY_PAT" \
  -H "Content-Type: application/zip" \
  --data-binary @../deploy.zip \
  "https://api.netlify.com/api/v1/sites/$SITE_ID/deploys" | jq '.state, .deploy_url'
```

**Step 2: Verify deploy succeeded**

---

### Task 23: Post-Deploy Verification

**Step 1: Verify all blog cards navigate to guide pages**

**Step 2: Verify all experience cards navigate to guide pages**

**Step 3: Verify no broken images**

**Step 4: Verify meta descriptions present on all pages**

**Step 5: Check Google Rich Results Test for homepage structured data**

**Step 6: Run Lighthouse audit (manual — aim for 90+ on all metrics)**

**Step 7: Commit verification results**

```bash
git commit --allow-empty -m "verify: post-deploy A+ enterprise audit passed"
```

---

## Summary: Task Dependency Graph

```
Phase 1 (SEO/Structure) — can run in parallel:
  Task 1 (blog cards → guides)
  Task 2 (experience cards → guides)
  Task 3 (empty H2s)
  Task 4 (properties meta desc)
  Task 5 (duplicate photos)
  Task 6 (blog CTA)
  Task 7 (read-time badges) — depends on Task 1
  Task 8 (Article schema on guides)

Phase 2 (Design/A11y) — can run in parallel:
  Task 9 (color consolidation)
  Task 10 (border-radius)
  Task 11 (duplicate font loads)
  Task 12 (image dimensions)
  Task 13 (accessibility)
  Task 14 (font consolidation)
  Task 15 (lazy loading)

Phase 3 (Content/Linking) — after Phase 1:
  Task 16 (related guides linking) — after Task 1+2
  Task 17 (guide CTAs) — after Task 1+2
  Task 18 (expand thin content)
  Task 19 (FAQ schema)
  Task 20 (self-host images) — after Task 5

Phase 4 (Deploy) — after all above:
  Task 21 (rollback tag)
  Task 22 (deploy)
  Task 23 (verification)
```

## Infrastructure Reference

| Key | Value |
|-----|-------|
| GitHub PAT | `(stored in session env — do not commit)` |
| Netlify PAT | `(stored in session env — do not commit)` |
| Site ID | `380fdf4b-91dd-4c6d-a31c-252c07aade81` |
| Netlify project | `cozy-licorice-e83928` |
| Repo path | `/sessions/confident-adoring-johnson/repo` |
| Deploy dir | `DEPLOY THIS FOLDER TO NETLIFY/` |
| Git email | `seo@seascape-vacations.com` |
| Git name | `Seascape SEO Agent` |
| Primary rollback | `pre-enterprise-audit` (4cddb79) |
