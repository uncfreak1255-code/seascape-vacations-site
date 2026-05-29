# Brief: SEO Hygiene Meta And Noindex Cleanup

## Content Gate Inputs

- persona: Gulf Coast guest or owner encountering Seascape through search results, social previews, or legacy indexed pages.
- primary keyword: Seascape Vacations
- secondary keywords: Bradenton vacation rentals, Sarasota vacation rentals, Florida vacation rental management
- audience pattern: visitor needs clean public metadata, truthful preview copy, and no stale noindexed pages submitted as search targets.
- proof source: `/Users/sawbeck/Projects/seascape-hub/workspace/seo-audit-2026-05-28.md`, `docs/status/next-batch.md`, and current rendered source.
- required internal links: /property-management/, /property-management/vacation-rental-management-fees-florida/
- CTA target: `/property-management/`
- anti-claims: new SEO batch approval, aggregateRating rollout, owner-linking batch, broad page rewrite, fresh owner demand proof, or production deployment claim.

## Why This Batch

- The audit found a few small hygiene defects that can be fixed without opening a new SEO expansion or CRO batch.
- Homepage social metadata still used a stale banned descriptor even though the on-page title had already moved to direct-book positioning.
- Two noindexed legacy proof pages were still eligible for sitemap inclusion because their frontmatter did not carry the same indexability state as their rendered robots tags.

What should explicitly wait:

- owner-page internal-linking changes until the freshness gate clears or is explicitly overridden
- aggregateRating schema until first-party review proof and freshness are designed
- stay-page or owner-page body rewrites that need the full visible-copy lane

## Cluster In Scope

- homepage social metadata
- public meta descriptions on the audited stay and owner surfaces
- noindex/sitemap consistency for retired or demoted proof pages
- hero ticker fallback copy that appears before client-side hydration

## Source And Proof Constraints

- Do not add review schema or review counts.
- Do not claim owner CTR work is open while `docs/status/next-batch.md` says `blocked by freshness`.
- Do not treat the SEO audit as source truth unless the finding reproduces in current source or rendered output.

## Release Gate Checklist

- `npm run build`
- `npm run lint:content`
- `npm test`
- verify the two noindexed pages are absent from `_site/sitemap.xml`
- verify homepage social meta no longer contains the stale banned descriptor

## Done When

- the hygiene patch is in a branch PR
- release-safety passes with exactly one active brief changed
- root `main` is clean

## Not In Scope

- C4 owner internal-linking
- C5 aggregateRating schema
- C2 stay-page rewrites
- W1-W3 owner metadata rewrites
- deployment or production shipment
