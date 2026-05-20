# Brief: Guest Question Surface Routing

## Content Gate Inputs

- persona: family-trip planners and group organizers comparing where to stay near Anna Maria Island before they pick a home
- primary keyword: where to stay near Anna Maria Island
- secondary keywords: Bradenton vs Sarasota vacation rental, large group vacation rental near Anna Maria Island, pool heat vs hot tub vacation rental
- audience pattern: guests trying to decide beach-first vs IMG-first vs downtown-first while narrowing to the right Seascape home
- proof source: Hub guest-message topic routing map, existing guide routes, current property inventory, and live page copy in this branch
- required internal links: /guides/things-to-do-bradenton-fl/, /guides/best-waterfront-restaurants-with-boat-dock/
- CTA target: /properties/
- anti-claims: do not imply on-island inventory, do not promise exact drive times, do not publish internal ops troubleshooting, and do not turn guest questions into standalone thin FAQ pages

## Why This Batch

- Guest-message review showed repeated pre-booking questions around trip fit, area fit, and pool-heat confusion.
- The right move is to sharpen existing high-intent guides and property pages rather than open a new article lane.
- Ops-only questions stay out of public copy and route into private help surfaces instead.

## Cluster In Scope

- canonical winner URLs: `/guides/where-to-stay-near-anna-maria-island/`, `/guides/bradenton-vs-sarasota/`
- feeder pages: existing large-group stay collections and the updated property pages for Dockside Dreams, The Oasis, and Sarasota Luxe
- money destination: `/properties/`
- active lane: direct-book stay intent

## Source And Proof Constraints

- property truth needed: current sleep counts, amenity truth, and pool-heat versus spa setup for the touched homes
- owner proof asset needed: none
- claims that are off-limits: any hard promise about traffic-proof timing, any hidden house-operating instructions, and any statement that a spa means full-pool heat is included

## Page Builder Tasks

- source files likely to change: `src/guides/where-to-stay-near-anna-maria-island/index.html`, `src/guides/bradenton-vs-sarasota.html`, `src/_data/seoPages.json`, and the relevant property pages
- redirect or schema work: preserve existing guide routes and update only in-place FAQ/copy surfaces
- internal-link or CTA work: keep guide-to-guide discovery tight and preserve booking/property browse handoff

## Release Gate Checklist

- routes to smoke test: `/guides/where-to-stay-near-anna-maria-island/`, `/guides/bradenton-vs-sarasota/`, `/properties/dockside-dreams/`, `/properties/the-oasis/`, `/properties/sarasota-luxe/`
- commands to run: `npm run lint:content`, `npm run build`, `npm run verify:jsonld`
- regression risks to watch: route copy drift into generic SEO phrasing, accidental amenity overclaiming, or broken FAQ markup on property pages

## Done When

- the two guide pages answer the trip-fit and proximity questions more directly without new route sprawl
- the touched property pages clarify pool heat versus spa or hot tub behavior in visible copy and FAQ output
- content gate, build, and JSON-LD verification all pass on the branch
