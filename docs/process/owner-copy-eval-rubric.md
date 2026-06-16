# Owner Money-Page Copy — Eval Rubric

This is the scoring contract for the **owner-conversion** eval lane
(`npm run eval:owner`, and the owner lane inside `npm run lint:evals`). It turns
the Voice Editor's read of an owner money page into a number that can trend,
tied to bottleneck #1: owner acquisition.

## How it is used

- The lane is **blocking**: changed owner reader copy that scores below the
  floor (or trips an auto-fail pattern) fails the Release Gate.
- The judge is a **single Sonnet model with chain-of-thought** — never Opus
  (cost control is enforced in `scripts/evals/lib/anthropic-client.js`).
- It runs **only on changed owner pages** (`src/property-management/**`), only
  when `ANTHROPIC_API_KEY` is present; without a key the lane validates this
  rubric and the golden set, then skips the judge so CI stays green.
- It **augments, never replaces** the human Voice Editor pass and
  `npm run lint:content`. Calibrate against `scripts/evals/golden/owner/` and
  spot-check against `docs/style/approved-examples.md`.

## Dimensions

Each dimension is scored 0–5 against the criteria below; the overall is the
weighted sum, scaled to 0–100, with a pass floor of **70**.

1. **decision-answer (0.18)** — Does the first paragraph answer the owner's real
   decision ("should I switch managers?") in the first ~2 sentences, instead of
   a generic vacation/hospitality intro? Grounded in
   `docs/style/approved-examples.md` "switcher-first owner framing."
2. **owner-economics-specificity (0.22)** — Does it lead with concrete owner
   economics — fee stack, channel cost, revenue leak, net payout, local-operator
   proof — rather than a generic service list ("full-service management, 24/7
   support")? This is the highest-weighted dimension because the page wins on
   the math, not the brochure.
3. **proof-traceability (0.18)** — Are claims about fees, revenue lift, homes
   served, review counts, or local proof specific and traceable to approved
   proof assets, not vague superlatives? Mirrors `owner-proof-integrity`.
4. **cta-clarity (0.15)** — Does the CTA name the next decision (e.g. "request a
   revenue review") instead of a generic "contact us" / "learn more"?
5. **snippet-standalone (0.12)** — Are the key claims phrased so an AI answer
   engine could lift a 1–2 sentence standalone answer that attributes Seascape?
6. **voice-no-ai-texture (0.15)** — Does it read like a local operator, free of
   AI/marketing texture, banned generic phrasing, and internal-worksheet labels?

## Auto-fail patterns

Word-boundary matches of the patterns in the spec below fail the copy
regardless of score. They are the highest-signal banned generics from
`scripts/enforcement/content-voice.test.js` plus the "hospitality excellence"
brochure tell that `approved-examples.md` warns against.

## Machine spec

```json eval-spec
{
  "id": "owner-copy",
  "version": "1.0.0",
  "judgeModel": "claude-sonnet-4-6",
  "passFloor": 70,
  "dimensions": [
    { "id": "decision-answer", "weight": 0.18, "max": 5, "criteria": "Does the first paragraph answer the owner's decision question ('should I switch managers / is my current setup leaking money?') within the first 1-2 sentences? Score 5 for an immediate, specific decision frame; 0 for a generic vacation, hospitality, or company-intro opening that buries the owner question." },
    { "id": "owner-economics-specificity", "weight": 0.22, "max": 5, "criteria": "Does the copy lead with concrete owner economics (fee stack, channel/OTA cost, revenue leak, net payout, local-operator proof) rather than a generic service list ('full-service management', '24/7 support', 'hospitality excellence')? Score 5 for specific, owner-relevant numbers and mechanisms; 0 for an undifferentiated feature/service list." },
    { "id": "proof-traceability", "weight": 0.18, "max": 5, "criteria": "Are claims about fees, revenue lift, homes served, review counts, or local proof specific and plausibly traceable to a named proof asset, rather than vague superlatives ('best', 'leading', 'trusted')? Score 5 for concrete, attributable claims; 0 for unfalsifiable superlatives." },
    { "id": "cta-clarity", "weight": 0.15, "max": 5, "criteria": "Does the CTA name the next decision the owner should take (e.g. 'request a revenue review') instead of a generic 'contact us' or 'learn more'? Score 5 for a specific, low-friction next step; 0 for a generic or missing CTA." },
    { "id": "snippet-standalone", "weight": 0.12, "max": 5, "criteria": "Could an AI answer engine quote a 1-2 sentence standalone claim from this copy that attributes Seascape and stands on its own? Score 5 for self-contained, attributable statements; 0 for copy that only makes sense with surrounding page context." },
    { "id": "voice-no-ai-texture", "weight": 0.15, "max": 5, "criteria": "Does it read like a specific local Gulf Coast operator, free of AI/marketing texture, banned generic phrasing, and internal-process or worksheet labels ('we mark proven cost, likely cost, and missing information')? Score 5 for plain, specific operator voice; 0 for generic AI-marketing texture." }
  ],
  "autoFailPatterns": ["curated", "nestled", "elevate", "boasts", "myriad", "seamless", "unparalleled", "hospitality excellence", "game-changer", "when it comes to", "at the end of the day", "in today's", "this matters because"]
}
```
