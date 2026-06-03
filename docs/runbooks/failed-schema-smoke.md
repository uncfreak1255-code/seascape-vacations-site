# Failed Schema Smoke

Use this when `verify:jsonld`, AI discovery schema checks, or entity-schema
smoke fails.

## Immediate Actions

1. Capture the failing route, schema type, and exact command output.
2. Re-run the local checks that match the failure from a clean worktree:

```bash
npm run verify:jsonld
npm run verify:links
node --test scripts/enforcement/ai-discovery-schema.test.js
```

3. Trace the failure back to source truth in `src/`, `src/_data/`, or
   `src/ai-discovery.json.njk`.
4. Fix source, not `_site`.
5. If the failure is already live, re-run:

```bash
npm run verify:recovery:entity-live
```

## Source Of Truth

- the failing local command output
- source templates and data files
- live entity smoke only after merge

## Proof Gate

- the failing local schema commands pass
- live entity smoke passes again if the issue had already shipped

## Do Not

- claim schema, ranking, or AI-citation lift from a broken proof surface
- patch generated output instead of source
