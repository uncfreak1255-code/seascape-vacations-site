# Brief: Property Page Metadata Distribution Alignment

## Content Gate Inputs

- persona: guests comparing Seascape homes before opening availability or a Google vacation-rental card
- primary keyword: vacation rentals near Anna Maria Island
- secondary keywords: Bradenton vacation rental with pool, Sarasota vacation rental with pool, direct booking vacation rental Bradenton
- audience pattern: travelers validating that Seascape has the right home type, location fit, and direct-book option before they click deeper
- proof source: current property inventory, live distribution audit findings, and existing property-page source
- required internal links: /properties/, /guides/where-to-stay-near-anna-maria-island/
- CTA target: /properties/
- anti-claims: do not imply any home is on Anna Maria Island, do not invent new amenities, do not change visible body copy, and do not rewrite layout or schema blocks

## Why This Batch

- The live distribution audit found that several property-page descriptions are truncated or malformed in the `<head>` even though the body copy and schema are usable.
- These pages feed direct search snippets and reinforce the same traveler-intent phrases we just normalized in Hostaway.
- This batch stays metadata-only on the five live property pages plus one brief for content-gate compliance.

## Cluster In Scope

- canonical URLs:
  - `/properties/the-oasis/`
  - `/properties/dockside-dreams/`
  - `/properties/river-house/`
  - `/properties/sarasota-luxe/`
  - `/properties/bradenton-pool-home/`
- money destination: `/properties/`
- active lane: metadata-only property intent cleanup

## Source And Proof Constraints

- property truth needed: existing bedrooms, baths, sleep counts, location framing, and amenity truth already present in source
- owner proof asset needed: none
- claims that are off-limits: new savings percentages, beachfront claims, on-island claims, or anything that changes visible feature truth

## Page Builder Tasks

- source files likely to change:
  - `src/properties/the-oasis/index.njk`
  - `src/properties/dockside-dreams/index.njk`
  - `src/properties/river-house/index.njk`
  - `src/properties/sarasota-luxe/index.njk`
  - `src/properties/bradenton-pool-home/index.njk`
- redirect or schema work: none
- internal-link or CTA work: preserve existing property-page routing and booking CTA behavior exactly as-is

## Release Gate Checklist

- routes to smoke test:
  - `/properties/the-oasis/`
  - `/properties/dockside-dreams/`
  - `/properties/river-house/`
  - `/properties/sarasota-luxe/`
  - `/properties/bradenton-pool-home/`
- commands to run: `npm run lint:content`, `node --test scripts/enforcement/metadata-integrity.test.js`, `npm run build:prod`
- regression risks to watch: malformed head markup, accidental copy drift outside metadata, or property-truth mismatch in the first rendered snippet lines

## Done When

- the diff stays in property-page head metadata only
- truncated or malformed meta descriptions are gone on all five touched pages
- the metadata checks and production build pass
