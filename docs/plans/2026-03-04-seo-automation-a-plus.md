# SEO Automation A+ Upgrade — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Upgrade Seascape Vacations' SEO automation system from B+ to A+ across all 5 dimensions — website traffic, direct booking conversions, SEO strategy, GEO/AI optimization, and competitive dominance — by creating 6 new scheduled tasks, upgrading 4 existing tasks, adding cross-task coordination, and building verification infrastructure.

**Architecture:** Each new/upgraded task is a Cowork scheduled task (SKILL.md file in `~/Documents/Claude/Scheduled/{taskId}/`). Tasks communicate via a shared state log (`task-log-YYYY-MM.md`) in the workspace. Every task that deploys uses the standardized git-push-then-Netlify-MCP workflow. All tasks reference CLAUDE.md for site context and use Desktop Commander for file operations.

**Tech Stack:** Cowork scheduled tasks (Markdown SKILL.md files), Netlify MCP deploy, Ahrefs MCP (Keywords Explorer + SERP Overview only — FREE plan), web search for rank checking/competitor analysis/AI citation tracking, Desktop Commander for file I/O, Gmail MCP for outreach drafts, Python for data processing, git for version control.
**Workspace:** `/Users/sawbeck/Projects/seascape-vacations-site/`
**Deploy folder:** `DEPLOY THIS FOLDER TO NETLIFY/` (inside workspace)
**Netlify site ID:** `380fdf4b-91dd-4c6d-a31c-252c07aade81`
**Scheduled tasks dir:** `/Users/sawbeck/Documents/Claude/Scheduled/`

---

## TIER 1 — Highest Impact (Do This Week)

---

### Task 1: Create "Conversion Optimization Patrol" Scheduled Task

**Why:** All traffic work is wasted without conversions. No existing task audits CTAs, booking widgets, phone numbers, trust signals, or mobile booking UX. This is the single biggest gap — upgrading from C to A on conversions.

**Files:**
- Create: `/Users/sawbeck/Documents/Claude/Scheduled/conversion-optimization-patrol/SKILL.md`

**Step 1: Create the scheduled task via Cowork MCP**

Use `create_scheduled_task` with:
```
taskId: "conversion-optimization-patrol"
description: "Every other Monday 9am — Audits booking CTAs, phone visibility, trust signals, mobile UX, and 'Book Direct & Save' messaging across all pages. Fixes what it can, flags design changes for owner."
cronExpression: "0 9 1,15 * *"  (1st and 15th of month, 9am local)
prompt: <see full prompt below>
```

**Full prompt for the task:**

```markdown
You are the conversion rate optimization (CRO) specialist for seascape-vacations.com. Twice a month, you audit every page for elements that turn visitors into direct bookings — then fix what you can.

## YOU HAVE DESKTOP COMMANDER
Use `read_file`, `write_file`, `edit_block`, `list_directory`, `start_search`, `start_process` for ALL file operations.

## DESIGN PRESERVATION RULE (MANDATORY)
You may ONLY touch:
- Text content inside `<p>`, `<h2>`, `<h3>`, `<li>`, `<td>`, `<span>`, `<a>` tags
- `<meta>` tag content attributes
- `<script type="application/ld+json">` schema blocks
- Adding new `<p>` or `<div>` elements with inline styles that match existing patterns
- Adding `<a>` links with existing CSS classes

You must NEVER modify:
- Any `<style>` block or CSS file
- `<header>`, `<nav>`, `<footer>` structure
- Class names, IDs, or HTML layout structure
- Images, JavaScript files (except JSON-LD)
- `_redirects`, `_headers`, `netlify.toml`

## Context
- Read CLAUDE.md in workspace for site context
- Workspace folder name contains `!!` — use Python `os` module or `set +H` in bash
- Deploy folder: `DEPLOY THIS FOLDER TO NETLIFY/` inside workspace
- Netlify site ID: 380fdf4b-91dd-4c6d-a31c-252c07aade81
- Business: 5 luxury vacation rental properties — The Oasis, Dockside Dreams, River House, Bradenton Pool Home, Sarasota Luxe
- Booking: Direct bookings via Hostaway widget. Every booking stolen from Airbnb/Vrbo saves 15-20% in platform fees
- 80% of bookings come from MOBILE — mobile UX is critical
## PHASE 1: AUDIT — Conversion Element Check

For EVERY page in stays/, guides/, and property-management/:

### 1. CTA Presence & Quality
- Does the page have at least ONE clear booking CTA above the first scroll?
- Does every stays/ page link to a specific property booking page?
- Are CTAs using action language? ("Book Direct & Save 15%" not "Learn More")
- Count pages with NO CTA or only generic "Contact Us" CTAs
→ Report: "X/Y pages have strong CTAs. Z pages missing or weak."

### 2. Phone Number Visibility
- Is the phone number visible on the page (not just in nav/footer)?
- On mobile viewport, is the phone number tap-to-call?
- Check: does any page have the phone number buried below 3+ scrolls?
→ Report: "X pages have prominent phone. Y pages phone only in footer."

### 3. "Book Direct & Save" Value Proposition
- Does each stays/ page explain WHY to book direct vs Airbnb/Vrbo?
- Look for: "Save X%", "no service fees", "direct owner communication", "best price guarantee"
- Count pages missing the direct booking value prop
→ Report: "X/Y stays pages communicate book-direct advantage."

### 4. Trust Signals
- Does each stays/ page have: guest review excerpts, star ratings, property photo count, "Professionally managed" badge text?
- Does each property-management/ page have: owner testimonial excerpts, revenue data, years in business?
- Check for VacationRental schema with aggregateRating
→ Report: "X pages have strong trust signals. Y pages weak/missing."

### 5. Urgency & Seasonal Signals
- Check current month. Are there seasonal urgency messages?
  - Jan-Feb: "Spring break dates filling fast — book now for best selection"
  - May-Jun: "Summer 2026 availability limited — secure your week"
  - Sep-Oct: "Snowbird season approaching — long-stay discounts available"
  - Nov-Dec: "Holiday getaway? Book direct for the best New Year's rates"
- Are pricing signals current? ("From $X/night" with current year)
→ Report: "X pages have seasonal urgency. Y pages have stale/no urgency."

### 6. Mobile Booking Flow
- Pick 10 random stays/ pages. Check if the booking CTA link/button appears within first 400px of page height (mobile viewport)
- Is there a sticky booking bar or floating CTA on scroll?
- Does the page have excessive content before the first CTA?
→ Report: "X/10 pages have mobile-optimized CTA placement."
## PHASE 2: FIX — Improve Conversion Elements

### Add/Strengthen CTAs
For pages missing CTAs or with weak ones:
- Add a CTA paragraph before the FAQ section: `<p style="margin-top:1.5rem;font-size:1.1rem;"><strong>Ready to book?</strong> <a href="/properties/">Browse our [location] vacation rentals</a> — book direct and save up to 15% vs. Airbnb.</p>`
- Vary CTA language across pages (never same text twice)
- For stays/ pages: link to most relevant property page
- For guides/: link to relevant stays/ category page

### Add "Book Direct & Save" Messaging
For stays/ pages missing the value prop, add a short paragraph:
- "Why book direct with Seascape? No Airbnb service fees (save 12-18%), direct communication with our local team, flexible check-in times, and our best-rate guarantee."
- Vary the wording per page — rotate between emphasizing savings, communication, flexibility, and local expertise

### Add Seasonal Urgency
Based on current month, add/update urgency messaging on the 10 highest-traffic stays/ pages:
- Insert near the top CTA area
- Keep factual and specific (not pushy)
- Update the date reference to current month/year

### Add Trust Signal Snippets
For stays/ pages missing trust signals:
- Add a one-line trust element: "⭐ 4.8 average guest rating · Professionally managed · 5 Gulf Coast properties"
- Ensure VacationRental schema includes aggregateRating if available

### Fix Mobile CTA Placement
For pages where the first CTA is buried:
- Add a brief CTA link in the first 2 paragraphs: contextual anchor link to properties page
## PHASE 3: DEPLOY

⚠️ **Netlify MCP deploy caches based on the remote git commit hash.** Push to GitHub FIRST, THEN deploy.

1. Stage and commit:
```bash
set +H
export REPO="$(python3 -c "import os; [print(os.path.join(r,d)) for r,ds,_ in os.walk('/Users/sawbeck/Projects') for d in ds if 'seascape-vacations-site' in d]" | head -1)"
git -C "$REPO" config user.email "seo@seascape-vacations.com"
git -C "$REPO" config user.name "Seascape SEO Agent"
git -C "$REPO" add -A
git -C "$REPO" commit -m "CRO patrol [date]: [summary]"
```

2. Push to GitHub FIRST:
```bash
git -C "$REPO" remote set-url origin "https://x-access-token:$GITHUB_TOKEN@github.com/uncfreak1255-code/seascape-vacations-site.git"
git -C "$REPO" push origin main --force
```

3. Deploy via Netlify MCP: `netlify-deploy-services-updater` → `deploy-site` → siteId `380fdf4b-91dd-4c6d-a31c-252c07aade81`

4. Verify: curl 3 pages, confirm changes are live.

## PHASE 4: LOG

Append to `task-log-YYYY-MM.md` in workspace:
```
### CRO Patrol — [date]
- CTAs fixed: X pages
- Book-direct messaging added: X pages
- Seasonal urgency updated: X pages
- Trust signals added: X pages
- Mobile CTA fixes: X pages
```

## OUTPUT FORMAT
📋 **Conversion Optimization Patrol — [date]**

**Audit:**
- CTAs: X/Y pages strong | Z weak/missing
- Phone visibility: X prominent | Y footer-only
- Book-direct messaging: X/Y stays pages
- Trust signals: X strong | Y weak
- Seasonal urgency: X current | Y stale/missing
- Mobile CTA placement: X/10 optimized

**Fixed:**
- [each fix, one line]

**Deployed:** ✅ Live

**Needs owner attention:** [only if design changes needed]
```

**Step 2: Verify task was created**

Run: `list_scheduled_tasks` and confirm `conversion-optimization-patrol` appears with correct cron and enabled=true.

**Step 3: Commit checkpoint**

```
Plan checkpoint: Task 1 complete — conversion-optimization-patrol created
```