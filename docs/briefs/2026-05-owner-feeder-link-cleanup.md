# Brief: owner feeder link cleanup

## Content Gate Inputs

- persona: Florida vacation-rental owners comparing tax, channel cost, management cost, and operator fit before they switch managers or keep self-managing.
- primary keyword: florida vacation rental management fees
- secondary keywords: florida vacation rental taxes, sarasota vacation rental management, florida vrbo management
- audience pattern: existing owner-support pages with adjacent intent should point readers into the owner-money pages when the sentence fits the decision already being discussed.
- proof source: current `docs/status/next-batch.md`, `docs/portfolio/owner-acquisition.md`, and source inspection of `src/_data/seoPages.json`.
- required internal links: /property-management/vacation-rental-management-fees-florida/, /property-management/vrbo-management-services-florida/
- CTA target: keep each page's existing owner CTA; this batch does not change CTA copy, tracking, schema, titles, or meta.
- anti-claims: no new fee-savings claims, no legal or tax advice claims, no flat-fee positioning, no GSC performance interpretation beyond the current freshness gate, and no owner CTR rewrite.

## Why This Batch

Current `docs/status/next-batch.md` still says owner money work is `blocked by freshness`, so this is not a new owner rewrite batch. The useful part of the old owner-link-audit branch is narrower: two contextual links from existing adjacent owner pages into already-live owner-money pages.

This batch should only add:

- one contextual link from `/property-management/vacation-rental-taxes-florida/` to `/property-management/vacation-rental-management-fees-florida/`
- one contextual link from `/property-management/vacation-rental-management-sarasota/` to `/property-management/vrbo-management-services-florida/`

Do not reopen title/meta work, new owner-page volume, proof rewrites, or broad owner CTR copy changes.

## Source And Proof Constraints

- The owner acquisition portfolio already classifies the fees and VRBO pages as owner money pages.
- The next-batch gate still blocks owner rewrite work until freshness and impression thresholds clear.
- The new sentences should read like natural owner-economics routing, not SEO anchor insertion.
- No new Seascape proof asset is needed.

## Release Gate Checklist

- routes to smoke test: `/property-management/vacation-rental-taxes-florida/`, `/property-management/vacation-rental-management-fees-florida/`, `/property-management/vacation-rental-management-sarasota/`, `/property-management/vrbo-management-services-florida/`
- commands to run: `npm run lint:content`, `node --test scripts/enforcement/content-voice.test.js scripts/enforcement/owner-acquisition.test.js`, `npm run build`, `npm run verify:links`
- regression risks to watch: broken rendered anchors, awkward link sentences, or accidental drift into broader owner copy work.

## Done When

- both required links render on their feeder pages
- content lint and owner-acquisition tests pass
- the site builds and link verification passes
- the diff stays limited to one active brief and the two source-copy link insertions
