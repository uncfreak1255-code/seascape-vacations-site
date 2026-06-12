# Codex Page-Writing Playbook

This is the compact working packet for Codex when drafting or rewriting Seascape page copy.

Use this with:

- `docs/process/content-quality-gate.md`
- `docs/style/voice.md`
- `docs/style/banned-patterns.md`
- `docs/style/approved-examples.md`
- one active brief in `docs/briefs/`

If this file conflicts with those source docs, the source docs win.

## Current Audit Snapshot

This playbook exists because the live site and the repo rules are still out of
sync in a few important places.

Strengths to preserve:

- winner guides already open with real trip decisions instead of generic beach
  fluff
- stay money pages already use trip-shape logic and clearer tradeoffs than most
  OTA-style collection pages
- owner pages are at their best when they lead with economics instead of a
  generic service list
- the repo already has the right anti-slop and proof-boundary rules on paper

Current drift to remove:

- the homepage owner block still sounds generic and brochure-like instead of
  switcher-first and economics-first
- the owner path still mixes `Revenue Teardown`, `revenue leak`, and older
  benchmark language even though the newer brief direction is `Revenue Review`
- proof and methodology still show up too high on some owner and guide pages
- guest winners and stay money pages sometimes keep too many CTA exits instead
  of one clear next decision plus one direct-book path
- copy source-of-truth surfaces still disagree, so agents can inherit stale CTA
  language from portfolio docs, data files, partials, or older briefs

## What Good Looks Like

On Seascape pages, the first screen should do four jobs fast:

1. answer the reader's decision
2. name the tradeoff
3. point to one primary next move
4. keep proof visible but out of the way until after the hook lands

If a page cannot do those four things, the draft is not ready.

## Before You Write

- Name the page type: homepage, stay page, guest guide, research page, or owner page.
- Name the reader's decision in one sentence.
- Name the one main CTA.
- Name the proof source you are allowed to use.
- Name the anti-claims before drafting.
- If public `src/` copy will change and there is no active brief, stop before writing.

Keep these copy layers separate:

- `reader copy` = what a guest or owner sees first
- `proof copy` = source notes, method notes, captions, FAQ notes, proof boxes
- `agent copy` = internal instructions, review notes, workflow labels

`agent copy` never ships in visible page copy.

## Seascape Voice Rules

Seascape should sound like a sharp local operator who knows the Gulf Coast corridor and is willing to tell the reader what matters, what does not, and what tradeoff they are making.

Use this voice:

- direct, not gushy
- specific, not decorative
- local, not tourism-board generic
- practical, not vague
- honest about tradeoffs
- commercially useful

Write like this:

- Answer the real question in the first paragraph.
- Lead with the decision, problem, or tradeoff.
- Use route, timing, price, beach access, parking, fee, revenue, review, turnover, or maintenance specifics.
- Name what the reader gains and what they give up.
- Make the page useful even if the reader only reads the first screen.

Do not write like this:

- generic destination fluff
- AI-marketing filler
- internal workflow language
- fake certainty without proof
- brochure copy that could fit any Florida site

## Page-Family Formulas

### Homepage / Brand Validation

Use when the reader is checking whether Seascape is real, local, and worth trusting.

Headline formulas:

- `Seascape Vacations` + where we operate + why booking direct matters
- local operator promise + corridor

Intro formulas:

- `Seascape Vacations helps [guest type] stay near [place] without paying island pricing when [tradeoff] fits better.`
- `If you are checking whether Seascape Vacations is the local team behind these homes, start with where we operate, how we book, and what kind of trips fit best here.`

CTA direction:

- send guests to `/properties/`
- keep a second path to `/guides/`
- keep owner language as a smaller switcher path, not a generic property
  management billboard

### Owner Hub / Property-Management Hub

Use when the reader is a skeptical owner deciding whether the current manager,
fee story, or payout logic deserves a closer look.

Headline formulas:

- `Before you renew, what does your [home type or market] actually keep?`
- `If the calendar looks busy but the payout feels thin, start here.`
- `[Market] owner economics before you compare managers`

Intro formulas:

- `If the payout, fee story, or owner updates do not add up, start with the
  benchmark and a revenue review instead of another generic management pitch.`
- `This page is for owners who suspect the current setup is busy but
  underperforming. Start with what reaches your owner statement, not a service
  list.`

CTA direction:

- one primary CTA only: `Request Your Revenue Review`
- one proof-secondary path only: the owner benchmark
- supporting line can reduce friction, but it should stay plain and short

### Owner Money Pages

Use when the reader is already inside one owner problem such as fees,
licensing, channel costs, or local execution.

Headline formulas:

- `[Owner problem] in [market]`
- `Why your [fee, payout, booking mix, licensing risk] deserves a second look`
- `[Topic] before you renew with the same manager`

Intro formulas:

- `If this part of the owner math feels off, here is the part that usually
  deserves a second look first.`
- `Most owners compare the headline claim. The real question is what this does
  to payout, guest quality, or premium-week protection.`

CTA direction:

- one primary CTA only: `Request Your Revenue Review`
- supporting proof can cite the benchmark, but the CTA should not compete with
  extra owner offers

### Owner Benchmark / Owner Research Pages

Use when the page exists to frame the owner economics before a property-level
review, not to bury the reader in proof language.

Headline formulas:

- `Your management fee is not the whole owner question`
- `Compare the owner math before you compare manager promises`
- `What actually changes what you keep`

Intro formulas:

- `Most owners start with the fee. The bigger decision is what happens to the
  money after channel costs, pricing decisions, and local execution show up.`
- `Use this benchmark to frame the owner question first, then request a review
  if you need the property-specific read.`

CTA direction:

- primary CTA: `Request Your Revenue Review`
- secondary CTA: `See the benchmark math`
- archive or proof-heavy pages should not pretend to be the main conversion
  surface if they are not

### Stay Money Pages

Use when the reader is close to choosing a home or a filtered set of homes.

Headline formulas:

- `Vacation rentals near [place] for [trip shape]`
- `[Home type] near [place] with [real differentiator]`
- `[Number]-bedroom [home type] for [trip shape] near [beach or district]`

Intro formulas:

- `If the trip is [destination] first, these homes work when you want [upside]
  and can trade [downside] for [upside].`
- `This stay path works best when [trip fit] matters more than [common
  alternative].`
- `Choose this page when [decision], not because it claims to be everything for
  everyone.`

CTA direction:

- primary CTA near the first screen: `Check Direct Dates` or `See Matching Homes`
- secondary CTA later: compare the near-island or nearby-area alternative
- do not stack three or four equal-weight booking CTAs before the tradeoff is
  clear

### Winner Guides And Comparison Pages

Use when the reader is deciding where to stay, what area fits, or what a trip will cost.

Headline formulas:

- `[Place A] vs [Place B] for [trip type]`
- `What it really costs to stay near [place]`
- `Where to stay near [place] if you want [outcome]`

Intro formulas:

- `[Place A] usually makes more sense when you want [upside], while [Place B] fits better when [different upside] matters more.`
- `Compare [options] before you book so you can trade [price, distance, parking, nightlife, family fit] on purpose.`
- `Start with the decision, then show the sources below.`
- `Give the direct answer first. Put source language and review notes below the
  answer block, not inside the hook.`

CTA direction:

- one destination CTA tied to the page winner
- one direct-book or stay CTA tied to the matching collection
- supporting cross-links can stay lower on the page, but they should not crowd
  the first commercial handoff

### Research Pages And Calculators

Use when the page carries proof-heavy copy, estimates, or structured comparisons.

Headline formulas:

- `Compare [trip or owner cost] before you decide`
- `[Question] with source notes and current limits`

Intro formulas:

- `Use this to compare [options] before you book, then read the source notes below to see what the estimate can and cannot claim.`
- `Start with the answer the reader needs. Put the methodology below the hook.`

CTA direction:

- move to the matching stay collection
- move to the matching guide
- move to the owner benchmark or review CTA if the reader is an owner

## CTA Rules By Page Type

- Homepage:
  one guest-primary CTA, one guide-secondary CTA, one smaller owner-switcher
  path only if it says something specific
- Owner hub:
  one primary CTA near the top, one proof-secondary link, no generic `Free
  Property Evaluation`
- Owner money pages:
  one primary owner CTA only, repeated later if needed
- Stay pages:
  one booking or rate CTA near the top, one comparison CTA later
- Winner guides:
  one research-to-destination CTA after the direct answer, one direct-book or
  stay CTA lower on the page
- Research pages:
  one answer-first CTA after the first useful section, not before the decision
  logic

Good CTA patterns:

- `See Bradenton homes near AMI`
- `Compare all available stays`
- `Check direct booking options`
- `Estimate your trip cost`
- `Request Your Revenue Review`
- `See the owner benchmark`
- `See Matching Homes`
- `Check Direct Dates`

Weak CTA patterns:

- `Learn more`
- `Submit`
- `Contact us`
- `Free Property Evaluation`
- `Request Your Revenue Teardown`
- giant trust-me CTA blocks before useful content

## Proof Placement Rules

- The first paragraph answers the reader's question.
- Proof belongs below the hook unless the proof itself is the answer.
- Put methodology, quote limits, and estimate limits in a labeled source note or proof box.
- Every stat should have a named source path or approved proof asset behind it.
- Reuse one approved proof asset across related pages instead of inventing new trust props on each page.
- Use tables when the reader is comparing places, prices, fees, or tradeoffs.
- Do not use tables for scenic filler or unsupported claims.
- If a sentence would fall apart without the surrounding page, it is too vague for search, AI answers, or snippets.
- On owner pages, proof chips can support the hero, but full methodology should
  not crowd the first answer.
- On winner guides, the direct answer block should come before rate-check or
  benchmark notes.
- On stay money pages, the tradeoff block should come before the FAQ wall.
- On archive or proof-heavy routes, be explicit about whether the page is still
  an active conversion surface or only supporting proof.

## Banned Phrasing Quick Kill List

Delete or rewrite these on sight:

- `curated`
- `nestled`
- `elevate`
- `boasts`
- `myriad`
- `seamless`
- `unparalleled`
- `when it comes to`
- `at the end of the day`
- `this matters because`
- `Use this when`
- `Read this if`
- `Open this page if`
- `planning math`
- `marketplace-fee exposure`
- `source-bounded`
- `accepted formulas`
- `proof boundaries`
- `proven cost`
- `likely cost`
- `missing information`
- `Revenue Teardown`
- `revenue leak`
- `OTA drag`
- `The 13.4% question`
- `full-service property management`
- `enjoy exceptional returns`
- owner pages that say `full service` in five different ways without explaining the money leak

## System Guardrails To Prevent Drift

- Treat visible CTA language as a system surface, not just page copy. If owner
  CTA language changes, update the active brief, portfolio map, data source,
  partial, and visible route copy together.
- Keep one current owner term across the active path. Right now that should be
  `Revenue Review`, not a mix of `review`, `teardown`, `leak`, and `evaluation`.
- Do not let proof-heavy owner research pages become the main writing template
  for homepage or owner-hub copy.
- For winner guides and stay money pages, enforce this shape:
  direct answer block -> tradeoff block -> proof note -> one destination CTA ->
  one direct-book CTA.
- Review rendered pages, not source alone. A clean source file can still ship
  crowded CTAs, proof too high, or stale owner language.
- Use the tracked event map when choosing copy fixes:
  `owner_primary_cta_click`, `owner_form_submits`, `guide_book_direct_click`,
  `stay_view_property_click`.
- If an existing money page still has weak click yield, fix the argument or CTA
  before proposing more page volume.

## Codex Drafting Sequence

1. Read the active brief and the relevant source file.
2. Read `voice.md`, `banned-patterns.md`, and `approved-examples.md`.
3. Write one sentence for the reader's decision.
4. Write one sentence for the page promise.
5. Write the main CTA before the body copy.
6. Draft the opening paragraph so it can stand alone.
7. Build 3 to 5 sections that each push one argument forward.
8. Add proof notes, tables, FAQs, and internal links after the reader-facing answer is clear.
9. Remove anything that sounds like a prompt, worksheet, or generic destination article.
10. Run the visible-copy lane: `copywriting` -> `enterprise-ui-writing` -> `humanizer`.
11. For owner work, check that no stale `teardown` or `evaluation` language
    survived in data files, partials, or portfolio maps.
12. For guide and stay pages, count CTA exits on the first screen and cut any
    extra path that competes with the main decision.

## Codex Self-Check

Before you call a draft done, ask:

- Does the first paragraph answer the real decision fast?
- Could this sentence describe any beach town in America?
- Did I name a real tradeoff?
- Did I use specifics instead of adjectives?
- Is the main CTA obvious and page-appropriate?
- Did I separate reader copy from proof copy?
- Did I use any banned phrasing or helper-note framing?
- Did I make a claim I cannot trace?
- On owner pages, did I lead with economics instead of a service brochure?
- Did I keep the right Seascape family shape for this page:
  owner hub, owner money, owner benchmark, winner guide, stay money, or
  homepage validation?
- Did I accidentally pull proof notes into the first answer block?
- Did I leave behind stale CTA language in a shared data or partial surface?

If public `src/` copy changed, the Release Gate is still:

- `npm run lint:content`
- any route-specific checks that matter
- rendered route review before merge

## Current Priority Fix Order

1. Normalize the live owner path first: `/property-management/`, the owner
   benchmark page, shared owner partials, and shared owner data should all move
   to `Revenue Review` language.
2. Rewrite the homepage owner block so it speaks to skeptical switchers instead
   of sounding like generic property management brochure copy.
3. Keep winner guides on one clear commercial path: direct answer, one winner
   destination, one direct-book handoff, and proof lower on the page.
4. Tighten stay money pages so the first screen sells the trip fit and tradeoff
   without repeated explanation or meta copy.
5. Align the source-of-truth copy surfaces: brief, portfolio docs, `seoPages`
   entries, shared owner partials, and visible routes.

## Copy-Paste Prompt For Codex

```text
Write Seascape page copy for this page type: [page type].

Reader:
[who they are]

Reader decision:
[one sentence]

Primary CTA:
[one CTA]

Proof source allowed:
[approved asset, source note, or source file]

Anti-claims:
[what cannot be claimed]

Internal links required:
[links]

Rules:
- Sound like a sharp local Gulf Coast operator.
- Answer the reader's decision in the first paragraph.
- Name tradeoffs honestly.
- Use specifics: route, timing, price, beach access, parking, fees, revenue, reviews, turnover, maintenance.
- Keep methodology and proof limits below the hook in a labeled note.
- Use the correct Seascape page family shape for this page:
  homepage validation, owner hub, owner money page, owner benchmark, winner
  guide, stay money page, or research tool.
- If this is a winner guide or stay money page, use:
  direct answer block -> tradeoff block -> proof note -> one destination CTA ->
  one direct-book CTA.
- If this is owner copy, use `Revenue Review` language and avoid older
  teardown-era wording unless it is an intentionally quoted or archived proof
  label.
- Do not use tourism-board fluff, AI filler, or internal workflow language.
- Do not use banned phrases like "curated," "nestled," "elevate," "Use this when," or "planning math."
- Make the main CTA plain and page-appropriate.

Return:
1. H1
2. opening paragraph
3. section outline with 1 to 2 sentences per section
4. CTA lines
5. proof/source note copy if needed
6. lines that still feel weak or risky
```
