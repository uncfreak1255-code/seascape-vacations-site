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

Retired the Claude-only `animate`, `break-ui` and `review-animations` skills.
The audit showed no recorded use, and `emil-design-eng` and `design-review`
cover the same ground.

The monthly `routine-harness-radar` scheduled task now appends this audit to
its memo. It stays read-only and disabled until Sawyer enables it.
