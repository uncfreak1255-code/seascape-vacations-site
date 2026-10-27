# 2026-10-25 — skill audit, plugin evals and design-skill repair

Receipt summary lives in `docs/process/skill-policy.md` → Agent-surface-audit receipts.

Added `npm run audit:skills` (`scripts/enforcement/audit-skills.js`), a
read-only report giving each repo skill a KEEP / WATCH / CHANGE / RETIRE?
verdict. It works from Claude and Codex usage, reachability, last change,
description health and dead file pointers. A missing usage source reads
UNAVAILABLE and never yields RETIRE?.

Added a `claude plugin eval` suite under `plugins/seascape-seo-os/evals/`. Its
six cases cover critic verdict, specialist concept, design-review QA, OpenSEO
loop, owner-form CRO and property schema, and results stay local and
git-ignored. On the first run, four cases passed and two failed:
- `seascape-design-specialist` held back its implementation brief and proof
  plan when it could not read repo docs.
- `design-review` never named `npm run test:visual`, the rule that baselines
  change only for intended changes, or fixing failures before human review.

Both skills now state that contract themselves instead of depending only on
linked docs. On rerun the specialist passed 3/3 judge votes and design-review
passed 2/3. The suite cost about $1.05 in total. These are single-run results
in a sandbox that cannot read this repo, so they test the skill text, not
repo-grounded output.

Five cases now ship fixed sample inputs under `<case>/fixtures/`, which a
`case.yaml` scaffold copies into the sandbox's working folder; critic-verdict
needs none because its prompt carries the whole input. The scaffold runs only
with `--scaffold`, so run the suite through `npm run eval:skills`, which
passes it. Without that flag
the agent finds no inputs and invents its own, which makes scores drift
between runs. The property-schema sample includes a rating with no review
count, to check that the agent does not invent an `aggregateRating`.

First fixture run (single run per case, about $1.10 in total, 2026-10-25). Every
answer quoted the sample data, so the agents read the inputs.
- `property-schema` passed 3/3 judge votes, and `specialist-concept` 2/3.
- `owner-form-cro` scored 1/3 with the default Haiku judge and 3/3 with
  `--judge-model sonnet`. Grading noise was part of the drift, so pass
  `--judge-model sonnet` when comparing runs.
- `openseo-loop` failed under both judges. With data in hand, the agent skipped
  `openseo-review` and offered live OpenSEO lookups without a cost check.
  That is a real skill-trigger gap to fix next.
  Fixed 2026-10-26: the rubric was right and the description was the fault.
  It named "rank-tracking regressions" and "OpenSEO audits" but not the way
  people actually describe the problem, a page dropping in Google with a
  Search Console export in hand. The description now leads with that case and
  says the skill reads Search Console evidence first and checks cost before
  paid lookups. The body did not change. Rerun with `--scaffold --case
  openseo-loop --judge-model sonnet`: the with-skill arm scored 3/3 runs, all
  judge votes PASS, and loaded the skill each time. Each answer said a paid
  OpenSEO lookup needs a quoted cost and approval first. The without-skill arm
  scored 1/3 (delta +0.67). The run cost $0.80.
- `design-review-qa` failed under both judges. The answer covered rendered
  checks, design rules, screenshots and baselines but never said to fix
  failures before human review. The skill or the rubric wording needs a
  follow-up.

Follow-up on `design-review-qa` (2026-10-26). The skill already said to fix
in-scope failures before human review. The failing answer opened with "fix
those before you do any QA", so the rubric was too literal: it wanted the exact
phrase. The rubric bullet now accepts any wording that puts fixes before review,
but a bare "needs a passing check" still fails. Rerun with `--scaffold
--judge-model sonnet`: 3/3 runs passed with the plugin and 3/3 in the
no-plugin baseline, for $0.65. With fixture inputs this case no longer tells
the skill apart from the base model (Δ 0.00). It now checks that answers stay
correct, not that the skill helps.

Retired the Claude-only `animate`, `break-ui` and `review-animations` skills.
The audit showed no recorded use, and `emil-design-eng` and `design-review`
cover the same ground.

The monthly `routine-harness-radar` scheduled task now appends this audit to
its memo. It stays read-only and disabled until Sawyer enables it.
