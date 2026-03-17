# Homepage, Stay, And Property Icon/Link Cleanup Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace broken homepage proof stats, remove public-facing emoji UI from approved surfaces, and replace stale property-page related links with verified live routes only.

**Architecture:** Use a hybrid cleanup. Shared-template fixes happen once in the homepage and stay template, while the five hardcoded property pages get surgical edits using one local SVG icon pattern. Verification includes build-time checks plus fresh browser review on the affected routes.

**Tech Stack:** Eleventy, Nunjucks, static HTML, local SVG partials/includes, Node-based recovery assertions

---

## File Map

### Shared sources

- Modify: `/Users/sawbeck/Projects/seascape-vacations-site/.worktrees/stability-phase1/src/index.njk`
- Modify: `/Users/sawbeck/Projects/seascape-vacations-site/.worktrees/stability-phase1/src/stays/stays.njk`
- Create or modify shared icon include(s) under:
  - `/Users/sawbeck/Projects/seascape-vacations-site/.worktrees/stability-phase1/src/_includes/partials/`

### Property pages

- Modify: `/Users/sawbeck/Projects/seascape-vacations-site/.worktrees/stability-phase1/src/properties/bradenton-pool-home/index.html`
- Modify: `/Users/sawbeck/Projects/seascape-vacations-site/.worktrees/stability-phase1/src/properties/dockside-dreams/index.html`
- Modify: `/Users/sawbeck/Projects/seascape-vacations-site/.worktrees/stability-phase1/src/properties/river-house/index.html`
- Modify: `/Users/sawbeck/Projects/seascape-vacations-site/.worktrees/stability-phase1/src/properties/sarasota-luxe/index.html`
- Modify: `/Users/sawbeck/Projects/seascape-vacations-site/.worktrees/stability-phase1/src/properties/the-oasis/index.html`

### Verification

- Modify: `/Users/sawbeck/Projects/seascape-vacations-site/.worktrees/stability-phase1/scripts/recovery/assert-build-output.js`
- Modify if needed: `/Users/sawbeck/Projects/seascape-vacations-site/.worktrees/stability-phase1/scripts/enforcement/lib.js`
- Modify if needed: `/Users/sawbeck/Projects/seascape-vacations-site/.worktrees/stability-phase1/scripts/enforcement/lib.test.js`

---

## Chunk 1: Shared Homepage And Stay Cleanup

### Task 1: Add A Shared Local SVG Icon Pattern

**Files:**
- Create: `/Users/sawbeck/Projects/seascape-vacations-site/.worktrees/stability-phase1/src/_includes/partials/ui-icon.njk`
- Modify: `/Users/sawbeck/Projects/seascape-vacations-site/.worktrees/stability-phase1/src/index.njk`
- Modify: `/Users/sawbeck/Projects/seascape-vacations-site/.worktrees/stability-phase1/src/stays/stays.njk`

- [ ] **Step 1: Inventory the icon names needed on approved surfaces**

Check current uses in:
- homepage footer/contact items
- stay template author line and card badge
- property-page quick stats and amenity cards

Run:
```bash
rg -n "✍️|⭐|📞|✉|📍|🛏️|🚿|👥|🏖️|⚽|✈️|🏟️|🏊|♨️|⚓|🎱|📺|🍳|🎮|🔥|👶|📶|👗|⛳|🎲|🌴" src/index.njk src/stays src/properties
```

Expected:
- concrete list of icons to support

- [ ] **Step 2: Create a single icon partial with named inline SVGs**

Implement a partial that:
- accepts a `name`
- renders inline SVG only
- inherits color through CSS
- does not rely on any external icon library

Include icons for at least:
- phone
- email
- location
- author
- star
- beds
- baths
- guests
- beach/travel
- sports/IMG
- pool
- hot tub
- dock
- game room
- kitchen
- grill
- baby/family
- wifi
- laundry
- garden/outdoor

- [ ] **Step 3: Add minimal shared CSS hooks where needed**

Add or update styles so the icon partial can be reused cleanly:
- small inline metadata icon
- footer/contact icon
- stat/amenity icon chip

Do not redesign the page. Only make SVG icons visually replace emoji.

- [ ] **Step 4: Commit the shared icon foundation**

```bash
git add src/_includes/partials/ui-icon.njk src/index.njk src/stays/stays.njk
git commit -m "feat: add shared local svg icon set"
```

### Task 2: Replace Homepage Stat Strip And Contact Emoji

**Files:**
- Modify: `/Users/sawbeck/Projects/seascape-vacations-site/.worktrees/stability-phase1/src/index.njk`

- [ ] **Step 1: Replace the homepage stat values with the approved fixed metrics**

Replace the visible trust strip values with:
- `4.98` Airbnb Rating
- `650+` 5-Star Reviews
- `10-15%` Book Direct Savings
- `24/7` Local Support

Rules:
- values must be rendered directly in markup
- no animation logic should be required for the final displayed values
- labels must stay readable and credible

- [ ] **Step 2: Remove emoji contact markers from homepage and footer contact surfaces**

Replace:
- `📞`
- `✉`
- `📍`

with the shared SVG icon include.

- [ ] **Step 3: Remove other obvious public-facing emoji from the approved homepage surfaces only**

Scope includes:
- stat/contact surfaces
- any directly related homepage trust/contact UI touched by this pass

Do not expand into unrelated homepage UX changes.

- [ ] **Step 4: Verify homepage output manually in the built HTML**

Run:
```bash
npm run build
rg -n "4.98|650\\+|10-15%|24/7|📞|✉|📍" _site/index.html
```

Expected:
- approved values present
- emoji contact markers absent on the touched homepage/footer surfaces

- [ ] **Step 5: Commit the homepage cleanup**

```bash
git add src/index.njk
git commit -m "fix: replace homepage trust stats and emoji contacts"
```

### Task 3: Remove Stay Template Emoji Formatting

**Files:**
- Modify: `/Users/sawbeck/Projects/seascape-vacations-site/.worktrees/stability-phase1/src/stays/stays.njk`

- [ ] **Step 1: Replace the author-line emoji with the shared author icon**

Current problem:
- `✍️ By {{ site.author }}`

Target:
- same meaning, no emoji

- [ ] **Step 2: Remove the `⭐` text badge prefix from featured stay cards**

Current problem:
- badge text is built as `"⭐ " ~ property.rating`

Target:
- rating displays without emoji text
- where star treatment is desired, use shared SVG star icon(s)

- [ ] **Step 3: Keep rating treatment visually strong without reintroducing emoji**

Use:
- SVG star
- numeric rating

Do not use:
- unicode star emoji

- [ ] **Step 4: Commit the stay-template cleanup**

```bash
git add src/stays/stays.njk
git commit -m "fix: remove emoji formatting from stay template"
```

---

## Chunk 2: Property Page Icon And Link Cleanup

### Task 4: Replace Emoji Iconography On All Five Property Pages

**Files:**
- Modify: `/Users/sawbeck/Projects/seascape-vacations-site/.worktrees/stability-phase1/src/properties/bradenton-pool-home/index.html`
- Modify: `/Users/sawbeck/Projects/seascape-vacations-site/.worktrees/stability-phase1/src/properties/dockside-dreams/index.html`
- Modify: `/Users/sawbeck/Projects/seascape-vacations-site/.worktrees/stability-phase1/src/properties/river-house/index.html`
- Modify: `/Users/sawbeck/Projects/seascape-vacations-site/.worktrees/stability-phase1/src/properties/sarasota-luxe/index.html`
- Modify: `/Users/sawbeck/Projects/seascape-vacations-site/.worktrees/stability-phase1/src/properties/the-oasis/index.html`

- [ ] **Step 1: Replace quick-stat emoji icons on all five pages**

Replace examples like:
- `🛏️`
- `🚿`
- `👥`
- `🏖️`
- `🏟️`

with local SVG icons using the shared icon pattern.

- [ ] **Step 2: Replace amenity-card emoji icons on all five pages**

Replace examples like:
- `🏊`
- `♨️`
- `⚓`
- `🎱`
- `📺`
- `🍳`
- `🎮`
- `🔥`
- `👶`
- `📶`
- `👗`
- `⛳`
- `🎲`

Use SVG only.

- [ ] **Step 3: Replace room and location section emoji headings**

Replace examples like:
- `🛏️ Master Bedroom`
- `🌴 Backyard Oasis`
- `🏖️ Beaches`
- `⚽ Sports & Activities`
- `✈️ Travel`

Keep the text labels. Remove the emoji.

- [ ] **Step 4: Replace property footer contact emoji on all five pages**

Replace:
- `📞`
- `✉`
- `📍`

with the shared SVG icon treatment.

- [ ] **Step 5: Remove emoji from related-card titles**

Examples:
- `📍 Bradenton Area Guide`
- `🏖️ AMI Beach Guide`
- any similar prefixed title text

- [ ] **Step 6: Commit the icon cleanup on hardcoded property pages**

```bash
git add src/properties/bradenton-pool-home/index.html src/properties/dockside-dreams/index.html src/properties/river-house/index.html src/properties/sarasota-luxe/index.html src/properties/the-oasis/index.html
git commit -m "fix: replace emoji iconography on property pages"
```

### Task 5: Replace Stale Related Links With Verified Live Routes

**Files:**
- Modify the same five property pages under `/src/properties/*/index.html`

- [ ] **Step 1: Verify live candidate routes before editing**

Check current source/build for replacements:

```bash
find src/stays -path "*/index.html" | sort
find src/guides -path "*/index.html" | sort
rg -n "img-academy-vacation-rentals-bradenton|coquina-beach-vacation-rentals|vacation-rentals-with-heated-pool|\\.html\"" src/properties
```

Expected:
- confirmed list of invalid routes currently referenced
- confirmed list of live replacement guides/stays/properties

- [ ] **Step 2: Replace removed stay URLs with current live routes**

Examples to eliminate:
- `/stays/img-academy-vacation-rentals-bradenton/`
- `/stays/coquina-beach-vacation-rentals/`
- `/stays/vacation-rentals-with-heated-pool/`

Use only live routes from current source.

- [ ] **Step 3: Replace `.html` guide links with canonical clean URLs**

Example:
- `/guides/anna-maria-island-beaches.html`

Target:
- current clean guide URL if it exists

- [ ] **Step 4: Keep related-link sets useful, not random**

Replacement preference order:
1. sibling property pages
2. relevant live stay pages
3. relevant live guide pages

Do not pad with weak or broken links just to keep card counts high.

- [ ] **Step 5: Commit the related-link cleanup**

```bash
git add src/properties/bradenton-pool-home/index.html src/properties/dockside-dreams/index.html src/properties/river-house/index.html src/properties/sarasota-luxe/index.html src/properties/the-oasis/index.html
git commit -m "fix: replace stale property page related links"
```

---

## Chunk 3: Guardrails, Build, And Review

### Task 6: Add Recovery Checks For The New Approved Surface Rules

**Files:**
- Modify: `/Users/sawbeck/Projects/seascape-vacations-site/.worktrees/stability-phase1/scripts/recovery/assert-build-output.js`
- Modify if needed: `/Users/sawbeck/Projects/seascape-vacations-site/.worktrees/stability-phase1/scripts/enforcement/lib.js`
- Modify if needed: `/Users/sawbeck/Projects/seascape-vacations-site/.worktrees/stability-phase1/scripts/enforcement/lib.test.js`

- [ ] **Step 1: Add homepage assertions for the approved stat-strip values**

Check `_site/index.html` contains:
- `4.98`
- `650+`
- `10-15%`
- `24/7`

- [ ] **Step 2: Add assertions that touched surfaces no longer leak specific emoji markers**

At minimum:
- homepage footer contact emoji
- stay author emoji
- stay card `⭐` text prefix

- [ ] **Step 3: Add assertions that stale property related-link routes are absent from built output**

At minimum:
- `/stays/img-academy-vacation-rentals-bradenton/`
- `/stays/coquina-beach-vacation-rentals/`
- `/stays/vacation-rentals-with-heated-pool/`
- `.html` guide links from property related cards

- [ ] **Step 4: Update tests if helper functions change**

Run:
```bash
npm test
```

Expected:
- all enforcement tests pass

- [ ] **Step 5: Commit the recovery guardrails**

```bash
git add scripts/recovery/assert-build-output.js scripts/enforcement/lib.js scripts/enforcement/lib.test.js
git commit -m "test: guard against emoji regressions and stale related links"
```

### Task 7: Full Verification And Route Review

**Files:**
- No source edits unless a verification failure forces a targeted fix

- [ ] **Step 1: Run the full verification chain**

```bash
npm test
npm run build
npm run verify:recovery:p0
npm run verify:recovery:guides
npm run verify:recovery:remediation
```

Expected:
- all commands exit `0`

- [ ] **Step 2: Run local browser review on the affected routes**

Review:
- `/`
- `/properties/`
- `/stays/anna-maria-island-vacation-rentals/`
- at least two property pages previously showing emoji/stale related links

Verify:
- homepage stat strip shows approved values
- homepage/footer touched contact surfaces use SVG icons, not emoji
- stay template byline/cards no longer show emoji formatting
- property pages no longer show emoji icon systems
- related cards point only to live routes

- [ ] **Step 3: Stop for user review before PR**

Report:
- what changed
- what passed
- what still looks risky, if anything

Do not open PR to `main` before user review.

---

Plan complete and saved to `/Users/sawbeck/Projects/seascape-vacations-site/.worktrees/stability-phase1/docs/superpowers/plans/2026-03-17-homepage-property-icon-link-cleanup.md`. Ready to execute?
