# SEO Audit Remediation — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Address all 15 audit findings from the March 2026 full SEO audit without breaking any of the 15 scheduled tasks.

**Architecture:** Direct file edits to static HTML in `DEPLOY THIS FOLDER TO NETLIFY/`, pSEO data updates in `src/_data/seoPages.json`, scheduled task cron/prompt updates via API, and Netlify deploy.

**Tech Stack:** Static HTML (minified), Eleventy (11ty) templates with Nunjucks, Netlify hosting, Claude scheduled tasks API.

---

## Revised Scope (After Research)

Items REMOVED (already exist):
- ~~Item 5: FAQ schema for is-ami-worth-visiting~~ → Already has FAQPage schema
- ~~Item 9: Best beaches guide~~ → `anna-maria-island-beaches.html` exists
- ~~Item 12: Restaurant guide~~ → `best-restaurants-anna-maria-island.html` exists
- ~~Item 14: Bradenton waterfront page~~ → `stays/bradenton-waterfront-vacation-rentals/` exists

Items ADDED based on research:
- Add internal links from existing guides TO stays/ pages (solves crawled-not-indexed)
- Add bot traffic flag to monthly-seo-summary task prompt (simpler than new task)

---

### Task 1: Fix "misss" typo in things-to-do-bradenton-fl.html
**Files:** Modify: `DEPLOY THIS FOLDER TO NETLIFY/guides/things-to-do-bradenton-fl.html:1`
**What:** Replace `misss` → `miss` in og:description AND twitter:description (both on line 1)
**Risk:** None — typo fix only

### Task 2: Rewrite weather page title + meta for CTR improvement
**Files:** Modify: `DEPLOY THIS FOLDER TO NETLIFY/guides/anna-maria-island-weather.html:1`
**What:** Current title "Anna Maria Island Weather by Month — Temps, Rain & Water" gets 0.4% CTR on 2,170 impressions. Rewrite to include year + temperature range for click appeal.

### Task 3: Stagger rank-performance-tracker to Wed 7am
**What:** Update cron from `0 8 * * 3` to `0 7 * * 3`. This ensures rank data is fresh BEFORE seo-content-creation runs at 8am.

### Task 4: Stagger geo-citation-audit to 10am
**What:** Update cron from `0 9 1,15 * *` to `0 10 1,15 * *`. Avoids collision with conversion-optimization-patrol at 9am.

### Task 5: Investigate zero-click "best beaches" SERP
**What:** Use Chrome to search "best beaches in florida for families" and examine the SERP to understand why position 1.0 generates 0 clicks.

### Task 6: Expand things-to-do-bradenton-fl content
**What:** Add more depth to push from position 19.9 into top 10. Add internal links to related stays pages.

### Task 7: Create AMI Vacation Rentals money page
**What:** Add new entry to seoPages.json for "anna-maria-island-vacation-rentals" targeting core commercial keyword.

### Task 8: Create AMI vs Clearwater comparison guide
**What:** New HTML guide in comparison format (proven top performer).

### Task 9: Create indexation-health-monitor scheduled task
**What:** New biweekly task that checks crawled-not-indexed trends.

### Task 10: Upgrade outreach-execution-reminder
**What:** Expand prompt to actively research and draft outreach, not just remind.

### Task 11: Add bot traffic monitoring to monthly-seo-summary
**What:** Add GA4 traffic-by-country check to existing monthly summary task prompt.

### Task 12: Improve pSEO stays pages (crawled-not-indexed fix)
**What:** Add internal links from top guide pages to relevant stays pages. Add geoIntro content to stays pages missing it.

### Task 13: Deploy + Verify
**What:** Git commit, push, Netlify deploy, verify live site, confirm all scheduled tasks still functional.
