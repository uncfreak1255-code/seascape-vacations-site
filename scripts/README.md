# Site Scripts

## Safe Hostaway projection path

Builds should consume the ops-owned safe projection instead of raw Hostaway
credentials:

```bash
SEASCAPE_SAFE_PROPERTY_PROJECTION_PATH=/path/to/properties-latest.json npm run build
```

When that path is set, the build validates that all public property cards have
fresh projected availability before Eleventy runs. Raw Hostaway auth, webhooks,
broker reads, and snapshots now belong in `seascape-ops`, not this site repo.

## `pull-property-truth.js`

Legacy normalization helper for `src/_data/properties-fallback.json`, which is
the canonical local property-data authority for bedrooms, bathrooms, guest
capacity, and structured amenity facts. It no longer fetches Hostaway directly
from this repo.

Rollback:

```bash
node scripts/pull-property-truth.js --restore-last-good
```

The helper still preserves the legacy normalizers and last-good rollback path
for tests and one-time migration diffing. New Hostaway pulls should be produced
as safe projections from `seascape-ops`.

## `regenerate-property-surfaces.js`

Regenerates derived property fact surfaces from `src/_data/properties-fallback.json` without calling Hostaway:

```bash
npm run property:truth:regen
npm run property:truth:check
```

Use `property:truth:regen` after hand-editing the fallback file. Use `property:truth:check` in verification; it exits non-zero if `src/llms.txt` or any per-property template has drifted from the fallback authority.
