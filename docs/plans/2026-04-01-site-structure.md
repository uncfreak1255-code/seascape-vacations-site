# Seascape Site Structure

Date: 2026-04-01
Principle: One domain, two funnels, one guide wedge

## Structural Rule

Do not split guests and owners onto separate domains right now.

Keep one domain, but stop letting pages blur audience intent.

## Recommended Architecture

```text
/
├── Home (guest-first brand and booking orientation)
├── /stays/
│   ├── /anna-maria-island-vacation-rentals/
│   ├── /anna-maria-island-beachfront-rentals/
│   ├── /holmes-beach-vacation-rentals/        [later, if justified]
│   ├── /bradenton-beach-vacation-rentals/     [later, if justified]
│   └── property detail pages
├── /guides/
│   ├── comparison guides
│   ├── destination guides
│   ├── airport / logistics guides
│   ├── owner-education / market-report guides
│   └── proof assets
├── /property-management/
│   ├── hub
│   ├── florida fee / licensing / platform pages
│   ├── local owner-market pages
│   └── owner proof asset(s)
├── /authors/                                  [only if maintained]
├── /contact/
└── core utility pages
```

## Funnel Design

## Guest funnel

Flow:

comparison guide -> destination/fit guide -> stay category page -> property page -> booking path

Primary examples:

- `/guides/bradenton-vs-sarasota/` -> `/stays/anna-maria-island-vacation-rentals/`
- `/guides/anna-maria-island-vs-siesta-key/` -> `/stays/anna-maria-island-vacation-rentals/`
- guest proof asset -> AMI / Holmes / Bradenton Beach stay pages

## Owner funnel

Flow:

owner-intent guide or market-report page -> owner proof asset -> fees/licensing/VRBO page -> owner CTA

Primary examples:

- market-report guide -> fees page
- owner education page -> licensing page
- owner education page -> VRBO page

## Page-Type Rules

### Homepage

- guest-first
- explain the vacation-rental offer clearly
- include a secondary owner path, but do not let owner messaging dominate the root story

### Guides

- win research demand
- answer questions directly
- always hand off to a relevant money page
- no isolated guide pages with no commercial destination

### Stay pages

- act as category landers, not thin inventory wrappers
- explain fit, tradeoffs, inventory match, and booking logic
- use honest positioning, especially on AMI beachfront phrasing

### Owner pages

- act as evidence pages first
- clear CTA second
- use cited assumptions and reusable proof

## Internal Linking Rules

1. Every winning guide feeds a money page.
2. Every money page receives at least one contextual link from a relevant guide.
3. Canonical URLs only. No legacy alias links in live source.
4. Proof assets link outward to the pages they strengthen.

## Discoverability Surfaces

These must agree:

- `src/_redirects`
- `src/sitemap.njk`
- `src/llms.txt`
- in-body links
- nav/footer links where relevant
- canonical tags

If they disagree, the architecture is lying to Google and AI systems.

## Content Pillars

### Pillar 1: Comparisons

Purpose:
- win research demand
- establish expertise
- feed stay and owner pages

### Pillar 2: Stay categories

Purpose:
- win commercial booking demand
- move from research to selection

### Pillar 3: Owner acquisition

Purpose:
- win service-intent demand
- convert existing rankings into owner leads

### Pillar 4: Proof assets

Purpose:
- give Seascape something worth citing
- strengthen both guest and owner funnels

## Quality Gates

- no new page without a named funnel role
- no new page without a canonical winner
- no new guide without a money-page destination
- no owner rewrite without proof
- no stay rewrite without real category depth

## Expansion Rules

Allowed only after:

- canonical convergence improves
- owner CTR improves
- AMI stay pages move

Then expand in this order:

1. Holmes Beach
2. Bradenton Beach
3. one additional comparison page with a clear commercial handoff
