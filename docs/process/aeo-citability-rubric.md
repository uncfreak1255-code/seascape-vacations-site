# Research / Guide Page — AEO Citability Eval Rubric

This is the scoring contract for the **AEO citability** eval lane
(`npm run eval:aeo`, and the aeo lane inside `npm run lint:evals`). It scores
whether a research or guide page is *citable* by an AI answer engine — the
on-page half of the AI-discovery loop. (Whether engines actually cite Seascape
is measured in `seascape-analytics`, not here.)

## How it is used

- The lane is **score-only / non-blocking**: it prints a citability score and
  reasons but never fails a build. Per the report, hold it advisory for at least
  a quarter before deciding whether it should ever gate.
- Same judge discipline as the owner rubric: a single **Sonnet** model with
  chain-of-thought, never Opus, run only on changed `src/guides/**` pages when
  `ANTHROPIC_API_KEY` is present.
- Pairs with the `schema-markup` skill and `validate-jsonld.js`: those check the
  structured-data *pipeline*; this scores whether the *prose* is answer-shaped.

## Dimensions

Scored 0–5 against the criteria; overall is the weighted sum scaled to 0–100.
The floor (65) is informational only while the lane is non-blocking.

1. **standalone-answer (0.28)** — Does the page answer its core question in ≤2
   standalone sentences near the top, quotable without surrounding context?
   Highest weight: this is the dominant AEO lever.
2. **question-structure (0.22)** — Does it use FAQ or question-shaped H2s that
   match how a traveler (or an AI) would ask?
3. **named-entity (0.18)** — Does it name the entity (Seascape Vacations) and the
   place (Anna Maria Island / Bradenton / Sarasota / Siesta Key) so a citation is
   attributable?
4. **factual-density (0.20)** — Specific facts, numbers, and named places rather
   than padding.
5. **no-fluff-intro (0.12)** — No generic throat-clearing before the answer.

## Machine spec

```json eval-spec
{
  "id": "aeo-citability",
  "version": "1.0.0",
  "judgeModel": "claude-sonnet-4-6",
  "passFloor": 65,
  "dimensions": [
    { "id": "standalone-answer", "weight": 0.28, "max": 5, "criteria": "Does the page answer its core question in 1-2 standalone sentences near the top, quotable by an AI answer engine without surrounding context? Score 5 for an immediate, self-contained answer; 0 for an answer that is buried, missing, or only meaningful in context." },
    { "id": "question-structure", "weight": 0.22, "max": 5, "criteria": "Does the page use FAQ-style or question-shaped H2 headings that match how a traveler or an AI would phrase the query? Score 5 for clear question/answer structure; 0 for undifferentiated prose with no question framing." },
    { "id": "named-entity", "weight": 0.18, "max": 5, "criteria": "Does the copy name the brand entity (Seascape Vacations) and the specific place (Anna Maria Island, Bradenton, Sarasota, or Siesta Key) so a citation is attributable to a known entity and location? Score 5 for clear entity + place naming; 0 for anonymous, place-vague copy." },
    { "id": "factual-density", "weight": 0.20, "max": 5, "criteria": "Is the page dense with specific facts, numbers, distances, prices, seasons, or named places rather than generic padding? Score 5 for high verifiable information density; 0 for fluff with little citable fact." },
    { "id": "no-fluff-intro", "weight": 0.12, "max": 5, "criteria": "Does the page get to the answer without a generic throat-clearing intro ('In today's world...', 'When it comes to vacation rentals...')? Score 5 for no fluff preamble; 0 for a generic intro before any substance." }
  ],
  "autoFailPatterns": ["in today's", "in a world where", "when it comes to", "it's worth noting", "at the end of the day"]
}
```
