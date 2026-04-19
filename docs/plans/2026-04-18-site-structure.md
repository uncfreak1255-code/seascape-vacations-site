# Seascape Site Structure Refresh

Date: 2026-04-18
Principle: one domain, two funnels, one guide wedge

## Hard Read

The architecture is not wrong. The discipline around the architecture is where things drift.

Seascape does not need a second domain or a new top-level section to fix this. It needs the current sections to behave more honestly.

## Structural Rule

Keep one domain.

Do not split guests and owners onto separate domains unless the existing funnel design becomes structurally impossible. There is no evidence of that yet.

## Recommended Architecture

```text
/
├── Home
├── /stays/
│   ├── /anna-maria-island-vacation-rentals/
│   ├── /anna-maria-island-beachfront-rentals/
│   ├── /holmes-beach-vacation-rentals/        [only after gate clears]
│   ├── /bradenton-beach-vacation-rentals/     [only after gate clears]
│   └── property detail pages
├── /guides/
│   ├── guest comparison guides
│   ├── destination and logistics guides
│   ├── owner education and market guides
│   └── proof assets that support money pages
├── /property-management/
│   ├── hub
│   ├── /vacation-rental-management-fees-florida/
│   ├── /vacation-rental-licensing-florida/
│   ├── /vrbo-management-services-florida/
│   └── future owner pages only when evidence supports them
├── /authors/                                  [only if maintained]
├── /contact/
└── core utility pages
```

## Funnel Design

### Guest funnel

Flow:

comparison guide -> fit or destination context -> stay category page -> property page -> booking path

Current priority examples:

- `/guides/bradenton-vs-sarasota/` -> `/stays/anna-maria-island-vacation-rentals/`
- `/guides/anna-maria-island-vs-siesta-key/` -> `/stays/anna-maria-island-vacation-rentals/`

### Owner funnel

Flow:

owner-intent guide -> owner proof asset -> fees or licensing or VRBO page -> owner CTA

Current priority examples:

- owner education guide -> `/property-management/vacation-rental-management-fees-florida/`
- owner education guide -> `/property-management/vacation-rental-licensing-florida/`
- owner education guide -> `/property-management/vrbo-management-services-florida/`

## Page-Type Rules

### Homepage

- stay guest-first
- keep the owner path visible but secondary
- do not turn the homepage into a mixed-intent compromise page

### Guides

- answer research questions directly
- exist to transfer authority and users into a money page
- no isolated guide ships without a named handoff

### Stay pages

- act like commercial category pages, not thin inventory wrappers
- explain fit, tradeoffs, and next-click logic clearly
- do not imply inventory breadth the site cannot honestly support

### Owner pages

- act like evidence pages first
- CTA second
- use proof, assumptions, and benchmarks instead of generic service lists

## Discoverability Surfaces

The architecture only counts if these surfaces agree:

- `src/_redirects`
- `src/sitemap.njk`
- `src/llms.txt`
- canonical tags
- internal links in priority guides and money pages
- nav and footer links where they are part of the user journey

If they disagree, the site is telling crawlers and AI systems two different stories.

## Internal Linking Rules

1. Every winning guide feeds a money page.
2. Every priority money page receives at least one contextual guide link.
3. Only canonical URLs should appear in live source.
4. Proof assets must link outward to the pages they strengthen.
5. Priority stay pages should receive links from the exact comparison guides already winning impressions.

## AI and E-E-A-T Layer

### Immediate requirement

- `llms.txt` should represent both funnels, not just guest-facing priorities

### Conditional requirement

- `/authors/` only exists if Seascape is ready to keep it maintained

### Ongoing requirement

- visible reviewer and updated-date treatment belongs on the pages that already matter, not on random long-tail pages first

## Quality Gates

- no new page without a funnel role
- no new page without a canonical winner
- no new guide without a named money-page destination
- no owner rewrite without reusable proof
- no stay expansion before the AMI winners prove they can convert better

## Expansion Order

Expansion stays frozen until:

- guide-family convergence improves
- owner CTR improves
- AMI stay pages move on performance and downstream behavior

Then expand in this order:

1. Holmes Beach
2. Bradenton Beach
3. one additional comparison page with a clear commercial handoff
