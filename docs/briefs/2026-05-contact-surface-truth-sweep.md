# Brief: Contact Surface Truth Sweep

Date: 2026-05-21
Status: ACTIVE

## Content Gate Inputs

- persona: guest or search visitor who uses Seascape support and guide surfaces to decide whether the brand is credible and reachable
- primary keyword: Seascape Vacations contact info
- secondary keywords: Seascape support phone, Seascape guest support email, Bradenton Sarasota vacation rental contact
- audience pattern: guest who lands on the homepage or a guide page and needs consistent support identity before browsing or booking
- proof source: `src/_data/site.json`, current homepage footer contact surface, homepage support modal source, and the touched guide JSON-LD blocks
- required internal links: /, /property-management/
- CTA target: /properties/
- anti-claims: do not invent a support alias, do not publish placeholder phone numbers, do not imply on-island inventory, and do not add emergency-contact promises beyond current guest instructions

## Why This Batch

- A rendered interaction audit already showed the homepage support modal drifting away from the real Seascape phone and email.
- Follow-up review found two guide JSON-LD blocks still carrying placeholder phone numbers even though visible site contact surfaces had been normalized.
- This is a truth sweep, not a copy expansion batch.
- June 3 GoDaddy sign-in alert follow-up: harden critical guest and owner contact exits so a mailbox issue does not leave high-intent routes depending only on `mailto:info@seascape-vacations.com`.

## Cluster In Scope

- canonical routes: `/`, `/guides/bradenton-insider-guide/`, `/guides/flights-to-anna-maria-island/`
- June 3 alert follow-up routes: `/properties/dockside-dreams/`, `/properties/bradenton-pool-home/`, `/properties/river-house/`, `/properties/sarasota-luxe/`, `/properties/the-oasis/`, `/research/owner-fee-revenue-leak-benchmark-2026/`
- supporting surfaces: homepage footer support modal triggers and guide structured-data contact fields
- money destination: `/properties/`
- active lane: guest support and guide trust consistency

## Source And Proof Constraints

- property truth needed: none beyond current public route inventory
- owner proof asset needed: none
- claims that are off-limits: any new support-hours promise, any new booking-policy language, and any separate support brand or alias not already used in live source

## Page Builder Tasks

- source files likely to change: `src/assets/js/homepage.js`, `src/guides/bradenton-insider-guide.html`, `src/guides/flights-to-anna-maria-island/index.html`
- June 3 alert follow-up source files: `src/properties/*/index.njk`, `src/research/owner-fee-revenue-leak-benchmark-2026.njk`
- redirect or schema work: limit schema changes to the exact stale phone fields
- internal-link or CTA work: preserve existing guide and booking handoff behavior exactly as-is

## Release Gate Checklist

- routes to smoke test: `/`, `/guides/bradenton-insider-guide/`, `/guides/flights-to-anna-maria-island/`
- June 3 alert follow-up routes to smoke test: the five live property detail pages and `/research/owner-fee-revenue-leak-benchmark-2026/`
- commands to run: `npm run lint:content`, `npm run build`, `npm run verify:jsonld`
- regression risks to watch: reintroducing stale support aliases, breaking homepage support modal triggers, or changing guide routing/copy outside the contact truth sweep

## Done When

- the homepage support modal matches the real Seascape guest phone and email
- the touched guide JSON-LD blocks use the same real phone number
- no stale guest-contact placeholders remain in the touched homepage and guide surfaces
- June 3 alert follow-up: touched property contact exits and the owner benchmark CTA expose a phone-backed path to `(941) 704-8545`.
