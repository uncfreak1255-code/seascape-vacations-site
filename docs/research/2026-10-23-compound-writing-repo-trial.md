# Compound Writing repo-scoped trial — 2026-10-23

## Decision

Retain Compound Writing 2.4.1 as a repo-scoped advisory challenger for the
Seascape Vacations site. Keep it disabled in user-level Codex configuration and
enable it only in this repository. Use it for bounded drafting or revision; it
does not replace OpenSEO research, active briefs, property and owner proof,
Seascape voice rules, content lint, or Voice Editor approval.

This is initial evidence from three excerpts, not proof of conversion, ranking,
reader preference, or reduced supervision.

## Package and activation proof

- Upstream: `EveryInc/compound-writing`
- Marketplace version: `2.4.1`
- Audited source commit: `8fd0ec88c00976cf0274cb76552dc7ad9405ca92`
- Installed cache: `~/.codex/plugins/cache/compound-writing/compound-writing/2.4.1`
- Global readback: installed `true`, enabled `false`
- Seascape project readback: installed `true`, enabled `true` when the project
  setting is applied
- Package surface: 33 skills, one local scaffold helper, no MCP server, no
  authentication connector, and no lifecycle hooks
- The scaffold helper creates missing writing-home files without overwriting
  existing files. It was not run because this repository already maintains its
  own voice, style, briefs, examples, and content workflow.

The package's 33 skill names, descriptions, and paths total 8,516 characters,
or roughly 2,129 tokens before host formatting. Codex progressively discloses
skill bodies, so the full skill instructions load only when selected. The
metadata still competes with the rest of the Seascape skill catalog inside this
repo, which is why the plugin stays disabled everywhere else and should be used
only for substantial copy work. The installed skills have broad activation
descriptions, so Codex may select them implicitly for a matching task inside
this repo; project scoping does not provide an explicit-invocation-only switch.
That routing behavior is accepted for this trial, while the existing Seascape
truth, voice, brief, and publication controls remain authoritative.

## Method

Source revision: `ac14feec7b177f0685d75f09d353fa013bb7cd1a`.

The trial used three current, real Seascape excerpts and their owning sources:

1. the `/property-management/` hero, with the active owner-opening brief;
2. The Coastal's property summary, with the active onboarding brief and
   `properties-fallback.json` facts; and
3. the rainy-day guide opening, with its active writing-rollout brief.

Because all three artifacts already had stable structure, Compound Writing's
Scribe router selected `cw-line-edit`. That pass composed the source-aware
`cw-ai-check`, loaded the repository's existing voice and banned-pattern files,
and preserved claims rather than creating a new writing-home scaffold.

The baseline and challenger were compared on source safety, directness,
decision usefulness, specificity, answer-first extractability, Seascape voice,
and avoidable model residue. Seascape's content-quality rubric remained the
judge. Full-page dimensions unavailable from an excerpt were not inferred.

No public source copy changed in this trial.

## Case 1 — owner landing-page hero

### Current source

> Know what your home earned and what needs attention.
>
> Seven homes. One local team. We handle listings, pricing, guest care and
> cleaning for your pool home. You receive monthly payouts and updates on what
> needs attention before you have to ask.

### Compound Writing challenger

> See what your home earned, what was spent and what needs attention.
>
> Seven homes. One local team. We handle listings, pricing, guest care and
> cleaning for your pool home. Each month, you receive a statement, your payout
> and a note about any cleaning or maintenance work that needs attention.

### Read

- Source safety: strong for both. The challenger stays inside the approved
  monthly statement, payout, cleaning, and maintenance scope.
- Answer-first usefulness: strong for both; the challenger makes statement
  detail and spending visibility explicit.
- Voice and proof boundary: strong for both. Neither promises earnings or
  savings.
- Decision: **slight challenger win**. The revision gives a switching owner one
  more concrete reason to request the review without changing the offer.

## Case 2 — The Coastal property description

### Current source

> Pool days, pickleball and a putting green in your own backyard.
>
> Three bedrooms and two bathrooms for up to ten guests in Bradenton. Spend the
> day by the private pool, play pickleball or practice your putting, then settle
> into the hot tub or air-conditioned game room.

### Compound Writing challenger

> Pool days, pickleball and a putting green in your own backyard.
>
> The Coastal sleeps up to 10 in three bedrooms: a king room, a queen room and
> a bunk room with five twin beds. Outside, your group gets a private pool, hot
> tub, pickleball court, basketball hoop and putting green. The air-conditioned
> game room gives you an indoor option when the weather turns.

### Read

- Source safety: strong. Capacity, bed layout, amenities, and game-room cooling
  all trace to the active brief and property truth.
- Decision usefulness: the challenger is strong; the current version is weak
  on sleeping fit because it makes a ten-person capacity hard to picture.
- Entity and destination clarity: the challenger is stronger because it names
  the home and makes the group-fit tradeoff concrete.
- Voice and proof boundary: strong. The challenger avoids invented proximity,
  rates, reviews, pool-heat terms, and experience claims.
- Decision: **clear challenger win**. This is the strongest evidence that the
  source-aware line-edit workflow adds value beyond banned-word cleanup.

## Case 3 — rainy-day guide introduction

### Current source

> For a quick summer storm, stay nearby for coffee, lunch, bowling or covered
> shopping. A 45-minute shower rarely needs a new itinerary. For several wet
> hours or a cold-front day, head toward Sarasota or UTC for Mote SEA, The
> Ringling, Sarasota Art Museum, theaters, restaurants or the Mall at UTC.

### Compound Writing challenger

> A 45-minute summer shower rarely calls for a new itinerary: stay nearby for
> coffee, lunch, bowling or covered shopping. For several wet hours or a
> cold-front day, drive toward Sarasota or UTC for Mote SEA, The Ringling,
> Sarasota Art Museum, a matinee or enclosed shopping at the Mall at UTC.

### Read

- Answer-first extractability: strong for both; the challenger puts the decision
  rule in the first clause.
- Information gain: unchanged. Both preserve the same useful local judgment.
- Voice: strong for both. The challenger is slightly tighter but does not add a
  new decision or fact.
- Decision: **tie / marginal challenger win**. The current source was already a
  successful bounded revision, so another line edit has little room to help.

## Result and operating boundary

| Case | Result | Useful Compound Writing behavior |
| --- | --- | --- |
| Owner hero | Slight challenger win | Made statement and spending visibility concrete |
| Property description | Clear challenger win | Turned an amenity list into sleeping and group-fit information |
| Guide introduction | Tie / marginal challenger win | Front-loaded the decision rule without inventing detail |

The plugin earned a narrow place as a copy challenger, especially for
property descriptions and stable prose that needs a source-aware line edit. It
did not demonstrate better keyword research, positioning, offer strategy,
conversion lift, or factual verification. Those remain with OpenSEO, the
active brief, Hub canon, Site property truth, Analytics, and the existing
publication gates. "Challenger" describes its advisory role, not an enforced
explicit-only invocation mode.

Keep conditions:

- repo-scoped activation only;
- use only for substantial copy work, accepting that matching skills may be
  selected implicitly inside this repo;
- no Compound Writing scaffold in this repository;
- no public copy applied from the trial without the normal active brief,
  content lint, independent Voice Editor review, and rendered proof; and
- disable the project setting if fresh sessions report skill-catalog omission,
  confusing routing, or measurable loss of the existing site-specific skills.

## Verification route

There is no portable CI test for a user's installed marketplace cache. The
direct check is a fresh trusted Codex session in this repository followed by a
plugin readback showing `compound-writing@compound-writing` version 2.4.1 as
enabled. A session outside this repository must show the same plugin installed
but disabled. This runtime readback is more meaningful than a static assertion
against `.codex/config.toml` alone.
