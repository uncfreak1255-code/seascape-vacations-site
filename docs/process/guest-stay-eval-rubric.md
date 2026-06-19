# Guest / Stay Page — Reader-Copy Quality Eval Rubric

This is the scoring contract for the **guest/stay** eval lane
(`npm run eval:guest`, and the guest lane inside `npm run lint:evals`). It scores
whether guest-facing stay copy (the `vacationer` entries in
`src/_data/seoPages.json` and pages under `src/stays/`) actually earns rankings
and AI citations instead of only avoiding banned phrases.

It is the positive complement the negative content gate
(`npm run lint:content`) can never be: `lint:content` blocks slop, but a
derivative, destination-admiration intro with zero banned words passes it clean.
This lane judges the prose against what wins under the information-gain era and
answer-engine extraction. See `docs/process/content-quality-gate.md` and
`.agents/skills/content-quality-rubric/SKILL.md` for the rationale.

## How it is used

- The lane is **blocking**. Two dimensions carry per-dimension hard floors
  (`autoFailBelow`): a **buried answer** (`standalone-answer` below floor) or
  **zero information gain** (`information-gain` below floor) fails the page
  outright, regardless of the weighted overall. This is the explicit
  requirement: a page cannot pass by propping the average with easy dimensions
  while burying the answer or restating competitor content.
- Same judge discipline as the owner and aeo lanes: a single **Sonnet** model
  with chain-of-thought, never Opus, run only on changed targets when
  `ANTHROPIC_API_KEY` is present. Without a key the lane validates the rubric +
  golden fixtures and skips judging (CI enforces with `--require`).
- Cost control on the shared `seoPages.json` file uses an `onlySlugs` allowlist
  (same pattern as the owner lane); expand it as stay pages are rewritten.

## Dimensions

Scored 0-5 against the criteria; overall is the weighted sum scaled to 0-100.
`passFloor` is 70. `standalone-answer` and `information-gain` also carry a hard
floor at 2 (a score of 0 or 1 fails the page on its own).

1. **standalone-answer (0.22, hard floor 2)** — Does the copy answer the guest's
   real decision in <=2 standalone sentences near the top, quotable by an AI
   answer engine without surrounding context? 0 for an answer that is buried,
   missing, or only meaningful in context.
2. **information-gain (0.22, hard floor 2)** — Does the page add proprietary,
   first-hand Gulf Coast specifics (named drive times, local routes, rate or
   capacity facts, operating judgment) that competitors have not already
   published? 0 for a derivative restatement of generic destination facts.
3. **decision-first (0.18)** — Does the first paragraph lead with the guest's
   decision or tradeoff (near-island value, beach-first, group fit, direct-book
   math) rather than admiring the destination?
4. **factual-density (0.16)** — Specific distances, prices, capacities, seasons,
   and named places rather than adjective padding.
5. **named-entity (0.12)** — Names the brand entity (Seascape Vacations) and the
   specific place (Anna Maria Island / Bradenton / Sarasota / Siesta Key) so a
   citation is attributable.
6. **no-fluff-intro (0.10)** — Gets to substance without a generic tourism-board
   or throat-clearing opener.

## Machine spec

```json eval-spec
{
  "id": "guest-stay-quality",
  "version": "1.0.0",
  "judgeModel": "claude-sonnet-4-6",
  "passFloor": 70,
  "dimensions": [
    { "id": "standalone-answer", "weight": 0.22, "max": 5, "autoFailBelow": 2, "criteria": "Does the copy answer the guest's real decision in 1-2 standalone sentences near the top, quotable by an AI answer engine without surrounding context? Score 5 for an immediate, self-contained answer; 0 for an answer that is buried, missing, or only meaningful in context." },
    { "id": "information-gain", "weight": 0.22, "max": 5, "autoFailBelow": 2, "criteria": "Does the page add proprietary, first-hand Gulf Coast specifics (named drive times, local routes, rate or capacity facts, operating judgment) beyond what competitors already publish? Score 5 for clear first-hand information gain; 0 for a derivative restatement of generic destination facts a guest could find anywhere." },
    { "id": "decision-first", "weight": 0.18, "max": 5, "criteria": "Does the first paragraph lead with the guest's decision or tradeoff (near-island value, beach-first, group fit, direct-book math) rather than admiring the destination? Score 5 for a decision-first lead; 0 for a generic destination-admiration opener." },
    { "id": "factual-density", "weight": 0.16, "max": 5, "criteria": "Is the copy dense with specific distances, prices, capacities, seasons, and named places rather than adjective padding? Score 5 for high verifiable density; 0 for vague adjectives." },
    { "id": "named-entity", "weight": 0.12, "max": 5, "criteria": "Does the copy name the brand entity (Seascape Vacations) and the specific place (Anna Maria Island, Bradenton, Sarasota, or Siesta Key) so a citation is attributable? Score 5 for clear entity + place naming; 0 for anonymous, place-vague copy." },
    { "id": "no-fluff-intro", "weight": 0.10, "max": 5, "criteria": "Does the page get to substance without a generic tourism-board or throat-clearing opener ('one of Florida's most sought-after destinations', 'the best of both worlds')? Score 5 for no fluff preamble; 0 for a generic intro before any substance." }
  ],
  "autoFailPatterns": ["in today's", "in a world where", "when it comes to", "it's worth noting", "at the end of the day", "best of both worlds", "something for everyone"]
}
```
