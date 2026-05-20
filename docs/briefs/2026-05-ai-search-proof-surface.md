# Brief: AI Search Proof Surface

## Content Gate Inputs

- persona: guests and owners arriving from AI/search answers who need a clean path into booking, capture, or owner inquiry
- primary keyword: book direct Bradenton Sarasota vacation rental
- secondary keywords: AI search vacation rental, Bradenton private pool rental, Sarasota vacation rental management
- audience pattern: AI-referred visitors and search visitors who need factual inventory, booking handoff, or owner proof before converting
- proof source: existing `llms.txt`, current property/stay/owner money routes, existing conversion events, and the analytics AI/search referral read
- required internal links: /properties/, /property-management/
- CTA target: direct-booking handoff, guest email capture, or owner form submit
- anti-claims: do not claim AI visibility proves revenue, do not claim direct bookings without reviewed attributed reservation rows, do not describe Bradenton homes as on Anna Maria Island inventory

## Why This Batch

- Google AI Mode and AI referral surfaces make raw SEO traffic less reliable as the success metric.
- The site already has buyer and owner conversion events; this batch makes the AI-readable contract and event source context explicit so analytics can measure capture, booking-engine handoff, and owner leads.
- This is not a broad content expansion batch. It is a proof surface and measurement handoff batch.

## Cluster In Scope

- canonical URL: `/ai-discovery.json`
- supporting inventory: `/llms.txt`
- money destinations: `/properties/`, `/stays/book-direct-anna-maria-island/`, `/property-management/`
- active lane: machine-readable discovery plus conversion-proof attribution context

## Source And Proof Constraints

- property truth needed: existing property data and current live stay/property routes
- owner proof asset needed: existing owner benchmark route only
- claims that are off-limits: AI citation success, booking revenue, owner demand, or on-island inventory claims not already supported by source truth

## Page Builder Tasks

- add a machine-readable AI discovery/proof contract at `/ai-discovery.json`
- link the contract from the homepage and `llms.txt`
- add AI/search source context to existing conversion events without changing visible page layout
- preserve existing direct-booking and owner CTA behavior

## Release Gate Checklist

- routes to smoke test: `/`, `/ai-discovery.json`, `/llms.txt`
- commands to run: `node --test scripts/enforcement/ai-discovery-schema.test.js scripts/enforcement/booking-handoff.test.js`, `npm run build`, parse `_site/ai-discovery.json`, `npm run verify:jsonld`, `npm run verify:links`
- regression risks to watch: invalid JSON, unsupported robots directives, duplicated canonical URLs in `llms.txt`, or funnel events that lose existing payload fields

## Done When

- `/ai-discovery.json` renders as valid JSON
- conversion events include source context fields for AI/search measurement
- analytics can separately count AI/search guest capture, booking-engine handoff, and owner-lead events without claiming revenue
