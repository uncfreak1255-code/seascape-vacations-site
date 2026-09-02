---
name: property-truth-regeneration
description: Regenerate Seascape property templates and llms.txt from canonical fallback data. Use after Hostaway or fallback changes or drift in amenities, bedrooms, bathrooms, docks, pools, or guest counts.
---

# Property Truth Regeneration

Use this when property facts change.

## Authority

- Canonical editable authority: `src/_data/properties-fallback.json`
- Derived surfaces: `src/properties/<slug>/index.njk` and `src/llms.txt`
- Regeneration command: `npm run property:truth:regen`
- Drift check: `npm run property:truth:check`

## Workflow

1. Read `docs/status/current-state.md` and `docs/status/open-risks.md` for current drift warnings.
2. Edit the fallback data unless the task is explicitly about the regeneration script itself.
3. Regenerate the derived surfaces:

```bash
npm run property:truth:regen
```

4. Verify that no drift remains:

```bash
npm run property:truth:check
```

5. If the branch touches public site output or adjacent truth surfaces, run:

```bash
npm run verify:release
```

## Rules

- Do not hand-edit the fallback file, per-property templates, and `src/llms.txt` in parallel.
- Keep amenity facts grounded in structured data, not marketing prose.
- If counts disagree because of split API fields such as full and half baths, inspect the regeneration path instead of patching templates by hand.
- Treat a failing truth check as a source-of-truth problem first, not a copy problem.

## Output

State:
- which file was treated as authority
- which derived surfaces changed
- which verification command passed or failed
