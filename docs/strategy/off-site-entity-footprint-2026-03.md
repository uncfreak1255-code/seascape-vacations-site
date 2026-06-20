# Seascape Vacations Off-Site Entity Footprint
Date: 2026-03-16
Status: Superseded as live operating guidance on June 20, 2026

> Current public entity truth lives in `src/_data/site.json`. Current off-site
> entity, citation, and GBP review work runs through the `seascape-analytics`
> off-site authority work order. Use this file as historical March context only.

## What This Is

This is the entity map for Seascape Vacations.

It exists because the GEO audit showed a real authority gap: the site has strong local expertise, but the public entity footprint is still thin. The problem is not that schema is missing. The problem is that there are not enough verified public profiles and mentions for AI systems to triangulate the brand confidently.

## Current Verified Public Entity Endpoints

These are the only organization-level profiles or identity endpoints confirmed from repo-owned source and observable context:

- Website: `https://seascape-vacations.com`
- Booking engine: `https://book.seascape-vacations.com`
- Facebook: `https://www.facebook.com/SeascapeVacations`
- Instagram: `https://www.instagram.com/seascapevacations`
- Google Business Profile: `https://www.google.com/search?kgmid=%2Fg%2F11y4vdnsfp&q=Seascape+Vacations`
- Bradenton Gulf Islands listing: `https://www.bradentongulfislands.com/listing/seascape-vacations/`

These are now centralized in [site.json](/Users/sawbeck/Projects/seascape-vacations-site/src/_data/site.json#L1) so the public `sameAs` footprint can be updated in one place instead of being copy-pasted across pages.

## What Is Not Verified Yet

No public organization-level URLs were found for:

- LinkedIn company page
- YouTube channel
- Anna Maria Island Chamber listing
- Manatee Chamber listing
- Visit Sarasota County listing
- BBB listing

Do not add any of these to schema until the public URLs exist and the current
off-site authority work order or another reviewed source proves the exact URL.

## Site-Side Work Executed

1. Centralized the real GA4 measurement ID in [site.json](/Users/sawbeck/Projects/seascape-vacations-site/src/_data/site.json#L1).
2. Centralized organization identity schema in [organization-schema.njk](/Users/sawbeck/Projects/seascape-vacations-site/src/_includes/partials/organization-schema.njk#L1).
3. Centralized shared GA4 markup in [analytics-ga4.njk](/Users/sawbeck/Projects/seascape-vacations-site/src/_includes/partials/analytics-ga4.njk#L1).
4. Wired those shared partials into [base.njk](/Users/sawbeck/Projects/seascape-vacations-site/src/_includes/layouts/base.njk#L1), [stays.njk](/Users/sawbeck/Projects/seascape-vacations-site/src/stays/stays.njk#L1), and [property-management.njk](/Users/sawbeck/Projects/seascape-vacations-site/src/property-management/property-management.njk#L1).

## Priority Creation Order

1. LinkedIn company page
2. YouTube channel
3. LinkedIn company page
4. YouTube channel
5. Chamber / CVB listing URLs once approved

Current note: Bradenton Gulf Islands is already centralized in `site.json`; do
not recreate that as a new task.

## Exact Standard For New Entity URLs

Every new profile should:

- use the exact business name `Seascape Vacations`
- point back to `https://seascape-vacations.com`
- repeat Bradenton, Anna Maria Island, Sarasota, and Siesta Key coverage
- use the same phone and email as [site.json](/Users/sawbeck/Projects/seascape-vacations-site/src/_data/site.json#L1)

## Update Rule

When a real new public profile goes live:

1. add its URL once in [site.json](/Users/sawbeck/Projects/seascape-vacations-site/src/_data/site.json#L1)
2. rebuild
3. verify the rendered schema reflects it

Do not hand-edit one page at a time.
