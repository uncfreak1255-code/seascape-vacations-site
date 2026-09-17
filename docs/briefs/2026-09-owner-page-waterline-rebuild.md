# Brief: Owner Page Waterline Rebuild

Status: in implementation (2026-09-17). Sawyer answered the open inputs with
facts on 2026-09-17 and left the calls to the agent; the decisions are recorded
at the bottom. `seascape-hub/context/owner-offer.md` is the offer source.

## Content Gate Inputs

- persona: Bradenton or Sarasota pool-home owner comparing managers, or a self-manager losing time, who wants to know what Seascape would actually do for the home and whom they would be talking to.
- primary keyword: vacation rental property management
- secondary keywords: Bradenton vacation rental management, Sarasota vacation rental management, Anna Maria Island vacation rental management, switch vacation rental property manager
- audience pattern: the reader wants to see a real operator and real homes, understand the service and the fee basis, and get one clear next step; they do not want fee vocabulary.
- proof source: `seascape-hub/context/owner-offer.md` (sections 2, 3, 4, 7); `src/_data/properties-fallback.json` for the homes and photographs; `src/about-us/index.njk` for the team; `docs/runbooks/owner-lead-confirmation-email.md` for what happens after the form.
- offer claim: `seascape-hub/context/owner-offer.md` section 6 (the one sentence), landed through section 4 rows 1 to 4.
- required internal links: /properties/, /about-us/, /research/owner-fee-revenue-leak-benchmark-2026/, /property-management/vacation-rental-management-fees-florida/, /property-management/switch-vacation-rental-management-company/, /property-management/maximize-vacation-rental-income-florida/
- CTA target: #owner-cta
- anti-claims: no revenue or occupancy figure, no direct-booking savings, no response-time or review-count number, no universal fee or minimum, no guarantee, no passive income, no hands-off management, no "Reply guaranteed", no AI as a lead claim, no comparison of platform commission and card processing as all-in equivalents.

## Why This Batch

- The live owner page leads with Airbnb and Stripe fee definitions because the May 2026 field-report brief started from keywords and a proof pack; when the proof was retired on 2026-05-26 only the fee scaffolding remained. Three of the four numbers above the fold belong to other companies.
- The hub's Owner Acquisition Operating Truth (2026-07-15) says the pitch leads with bookings, money coming in, reviews, guest care and proactive owner communication, and that attentiveness is the small-company advantage. The page never used it.
- External read of eleven owner pages (see `.design-sync/research/external/owner-page-research.md` in the design-sync worktree; summary in `docs/plans/2026-09-16-claude-design-program.md`): none lead with third-party fee tables; the local winners lead with a named founder and phone, real homes, a plain service scope, a worked net example where the operator will publish one, and "what switching looks like".
- Waits: the 26 city landers built from `property-management.njk`; the fee guide and other owner child pages; any fee number (Patrick's lane).

## Experiment And Readback Contract

- hypothesis: an owner page that states the offer, the team and the homes produces the first owner form submits; the fee-vocabulary page has produced zero.
- primary event: owner_form_submit (Netlify form `owner-revenue-teardown`)
- guardrail event: owner_primary_cta_click does not fall below its current 30-day count
- entry criteria: `context/owner-offer.md` approved; the three open inputs answered; design direction approved by Sawyer
- readback window: 30 days from deploy
- decision rule: keep if owner_form_submit > 0 with at least one non-bot submission; otherwise return to this brief, not to the fee page

## Page Structure And Draft Copy

Design contract: `docs/mockups/2026-09-16-property-management-waterline.html` with the
council fixes recorded in `docs/plans/2026-09-16-claude-design-program.md`
(shared shell, real four-step Netlify form, market grid cut back, no page
counters, no "GPS lock" chips, Terms link and file input to 44px, submit above
the 800px fold, guide photos restored, textarea placeholder shortened).

1. **Hero with the form beside it.** Eyebrow: "Property management · Bradenton & Sarasota". Headline: "Six homes. One local team. Your call gets answered." Lede: "Seascape manages a small collection of pool homes in Bradenton and Sarasota. We list, price, host and clean each one, pay you monthly, and tell you what your home earned and what needs attention before you have to ask." Primary CTA: "Request your 48-hour revenue review". Beside it the phone number as a real link. The review form sits to the right on desktop and directly under the lede on mobile, as in the mock, using the real four-step form.
2. **What we do for your home.** Five rows from `owner-offer.md` section 2: listing on Airbnb, Vrbo and our own booking site; pricing set per home and reviewed with you; guest screening and messaging by a local person; cleaning and maintenance coordinated, with photos and a note when a deep clean or repair is needed; monthly statement and payout, county taxes remitted. The statement row stays generic until Sawyer answers open input 1.
3. **Why a six-home operator.** Three short blocks, one per claimable row in section 4: "You reach the people who run your home" (Sawyer and Patrick, with the phone number again); "One of six, not one of six hundred"; "We tell you before you ask" (revenue, payout, reviews, deep-cleaning and maintenance notes). Then one paragraph on pricing: "We do not have one fee for every home. After we look at your listing and statement we quote a share of net rent that fits what the home can earn, and we put the basis, the included services and any separate charges in writing." Link: management-fee reality page.
4. **The homes we manage.** The six real homes with their approved photographs from `properties-fallback.json`, name and town only, linking to /properties/. No occupancy or revenue figures.
5. **What comes back in 48 hours.** Keep the live page's concrete description: send the listing link or address and a sentence on what feels off; a real Seascape person reads it; back comes a one-page review of what deserves a second look and what we would check next, usually within 48 hours. Drop the "Reply guaranteed" stamp and the "48hr / 4 / 2" trio.
6. **What switching looks like.** Three steps: the review; a property-specific agreement in writing; listing and calendar transfer with no dark nights. Ships only if Sawyer confirms the transfer specifics (open input 3); otherwise the section is cut, not softened.
7. **Owner guides and specific situations.** Keep the existing guide cards with their photographs and the situations index; move the fee-definition content to its guide page and link it once from section 3.
8. **Selected FAQ.** Keep the three live questions.
9. **Owner quote.** Only if open input 2 is supplied, placed after section 3 with the owner's name and home.

Removed from the live page: the Vol. III / Issue 04 masthead and every page counter; the Fee Comparison section and the Owner Economics "3 not equal 1" section (both live on in the fee guide); the seven-market "portfolio map" with GPS chips; the "Reply guaranteed" stamp.

## Cluster In Scope

- canonical winner URL(s): /property-management/
- feeder pages: /research/owner-fee-revenue-leak-benchmark-2026/, the owner guide child pages, /about-us/
- aliases or retired URLs: none
- money destination: #owner-cta on /property-management/
- active lane: owner acquisition

## Source And Proof Constraints

- property truth needed: the six homes, names, towns and approved photographs from `properties-fallback.json`
- owner proof asset needed: none; no retired proof returns
- claims that are off-limits: see anti-claims and `owner-offer.md` section 7
- Seascape-specific proof or local experience this page can add beyond generic competitor coverage: the named team, the six real homes, the property-specific fee basis, the concrete review deliverable

## Page Builder Tasks

- source files likely to change: `src/property-management/index.njk`, shared partials for the shell, `src/css/guest.css` (owner sections), `tests/visual/design-floors.spec.js` (widen scope to this route), `tests/visual/owner-form-steps.spec.js`
- redirect or schema work: none; keep the existing JSON-LD and canonical
- internal-link or CTA work: the required links above; the owner CTA keeps `data-track-event="owner_primary_cta_click"`
- money CTA and downstream tracking event to verify: owner_form_submit through the Netlify form and the confirmation email runbook

## Voice Editor Checklist

- tone risks: sliding back into fee vocabulary; "full service" flattening; detached "the owner" phrasing
- generic or mechanical patterns to kill: stamps, badges, chips, magazine counters, any "guaranteed"

## Decisions recorded 2026-09-17

Sawyer's facts (chat, 2026-09-17): monthly statements are needed only for the
externally owned homes (Blue House, Bradenton Pool Home, and the signed MJNS7
home), Hostaway already exports owner statements, Blue House and the MJNS7 home
have had no guest stay yet, and the MJNS7 home is not listed. He did not want to
make the five calls himself, so the agent made them:

1. **Monthly statement.** Copy stays generic: a monthly statement of what the
   home earned and what was spent, with the payout; no cadence day, no format.
2. **Owner quote.** None yet. No permission is recorded in `people/`, and the
   only externally owned home with guest history is Bradenton Pool Home. The
   section is cut, not faked. Reopen when Manny or Grettel agree to be quoted.
3. **Home count.** Six, the homes listed on this site and in Hostaway, Blue
   House included. The signed MJNS7 home is not listed and is not counted.
   **Switching section.** Cut. The transfer specifics were not confirmed, and the
   brief says cut, not soften.
4. **Fee range.** Not public. Pricing stays "a share of net rent, quoted after
   the review, in writing" (Patrick's lane).
5. **The sentence.** Kept as written in `owner-offer.md` section 6.

Direction: the Claude Design mock with the council fixes, treated as approved;
Sawyer's pick point is the rendered PR preview, per his "show me, do not ask me
to describe it" rule.
