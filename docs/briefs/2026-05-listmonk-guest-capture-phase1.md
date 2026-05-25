# Brief: Listmonk Guest Capture Phase 1

## Content Gate Inputs

- persona: guest planners comparing Seascape stay options before they are ready to search dates
- primary keyword: direct booking vacation rentals Anna Maria Island
- secondary keywords: vacation rentals near Anna Maria Island, Bradenton vs Sarasota vacation rental, where to stay near Anna Maria Island
- audience pattern: visitors who want a curated stay shortlist or trip-fit guidance before they commit to a booking search
- proof source: current guide and properties routes, the approved phase 1 capture plan, existing Seascape inventory truth, and rendered route review in this branch
- required internal links: /, /guides/
- CTA target: /properties/
- anti-claims: do not imply on-island inventory, do not promise a live booking discount that is not already published, do not claim listmonk itself as a guest-facing benefit, and do not disturb the homepage popup Mailchimp keeper flow

## Why This Batch

- Seascape needed one bounded non-popup capture lane that can be routed into listmonk without breaking the live Mailchimp popup flow.
- The right first move is to upgrade existing high-intent guide and catalog surfaces instead of spreading capture forms across the whole site.
- This phase stays intentionally narrow: collect segmented opt-ins, preserve direct-booking routing, and keep a safe Mailchimp fallback until runtime wiring is proven.

## Search Operator Read

- source reads used: existing guide conversion surfaces, current `/properties/` route, and the direct-booking guest capture phase 1 handoff
- URLs inspected: `/guides/booking-direct-vacation-rentals/`, `/guides/where-to-stay-near-anna-maria-island/`, `/guides/bradenton-vs-sarasota/`, `/guides/anna-maria-island-vs-siesta-key/`, `/properties/`
- main evidence: these routes already carry direct-booking or trip-fit intent and can support segmented email capture without opening thin new pages
- competitor pages inspected for demand patterns, not copied topics: none required for this implementation pass
- question-tool language worth preserving in customer wording: trip-fit, area fit, and shortlist language only where it sounds natural
- GSC/GA4 evidence that supports building, rewriting, holding, or killing this cluster: hold measurement claims to capture proof only until production submissions are verified

## Cluster In Scope

- canonical winner URL(s): `/guides/booking-direct-vacation-rentals/`, `/guides/where-to-stay-near-anna-maria-island/`, `/guides/bradenton-vs-sarasota/`, `/guides/anna-maria-island-vs-siesta-key/`, `/properties/`
- feeder pages: shared guide conversion partials and the properties catalog trip-type module
- aliases or retired URLs: none
- money destination: `/properties/`
- active lane: direct-book stay intent

## Source And Proof Constraints

- property truth needed: only the current Seascape inventory and trip-type positioning already supported on `/properties/`
- owner proof asset needed: none
- claims that are off-limits: any promise that an email signup proves booking intent, any unpublished savings claim, and any claim that the new capture lane is live in production until runtime proof exists
- Seascape-specific proof or local experience this page can add beyond generic competitor coverage: specific near-AMI positioning plus guide-to-catalog routing based on the real Seascape portfolio

## Page Builder Tasks

- source files likely to change: `src/_includes/partials/guide-conversion-kit.njk`, `src/_includes/partials/guide-intent-optin.njk`, `src/assets/js/conversion-tracking.js`, `src/guides/booking-direct-vacation-rentals.html`, `src/guides/where-to-stay-near-anna-maria-island/index.html`, `src/guides/bradenton-vs-sarasota.html`, `src/guides/anna-maria-island-vs-siesta-key.html`, `src/properties/index.njk`
- redirect or schema work: none beyond preserving existing route metadata and tracking behavior
- internal-link or CTA work: keep every new form routed toward `/properties/` and preserve existing direct-booking guide links
- money CTA and downstream tracking event to verify: guide and properties capture submits should preserve direct-booking attribution and end with a clear route into `/properties/`

## Voice Editor Checklist

- tone risks: sounding like a generic newsletter pitch instead of a Seascape stay-fit helper
- generic or mechanical patterns to kill: broad "sign up for updates" phrasing that does not explain the travel value
- proof or specificity checks: keep trip-fit and direct-booking language grounded in current routes, not invented perks
- customer wording kept where it sounds natural; SEO-tool phrasing removed where it sounds manufactured: preserve plain "direct booking list" and trip-planning wording only where it reads like guest help

## Release Gate Checklist

- routes to smoke test: `/guides/booking-direct-vacation-rentals/`, `/guides/where-to-stay-near-anna-maria-island/`, `/guides/bradenton-vs-sarasota/`, `/guides/anna-maria-island-vs-siesta-key/`, `/properties/`
- commands to run: `npm run lint:content`, `node --test scripts/enforcement/guide-conversion.test.js`, `node --test scripts/enforcement/properties-catalog-layout.test.js`, `node --test scripts/enforcement/guest-email-capture-receipts.test.js`, `npm run verify:release`
- regression risks to watch: broken guide CTA routing, duplicate capture events, popup keeper drift, or guest-facing copy that overstates the live runtime state

## Done When

- the named guide routes and `/properties/` expose the new segmented capture surfaces without disturbing the approved layout
- non-popup capture can route to listmonk when runtime config exists and falls back safely when it does not
- the branch carries one active brief, passes the content gate, and ships only after fresh production capture proof exists

## Post-Reread Outcome

- reread window used: pending production proof
- crawl freshness result: not part of this phase
- actual impressions, CTR, position, and downstream event counts: not yet proven
- decision taken: hold measurement claims until production capture proof is collected
- next branch slug or explicit wait state: `codex/listmonk-guest-capture-proof` only if live proof exposes a follow-up fix

## Not In Scope

- homepage popup changes
- Mailchimp journey replacement beyond the safe fallback already implemented
- new standalone guide pages or list-building content clusters outside the named routes
- any claim that email capture alone proves direct-booking revenue
