# Site Scripts

## `pull-property-truth.js`

Pulls Hostaway listing data into `src/_data/properties-fallback.json`, which is the canonical local property-data authority for bedrooms, bathrooms, guest capacity, and structured amenity facts.

Safe path:

```bash
HOSTAWAY_API_TOKEN=... node scripts/pull-property-truth.js --dry-run
HOSTAWAY_API_TOKEN=... node scripts/pull-property-truth.js
```

Rollback:

```bash
node scripts/pull-property-truth.js --restore-last-good
```

The script snapshots the raw Hostaway response, prints a dry-run diff before output writes, writes JSON via temp-file rename, saves a last-good copy before overwrite, retries 429/5xx API responses with backoff, and sums Hostaway `bathrooms + guestBathrooms`. When it writes fallback data, it also regenerates the derived property facts in `src/llms.txt` and `src/properties/<slug>/index.njk`. It only uses structured amenity arrays; Hostaway description text is not mined for confident marketing amenities. Hostaway `listingPrice` is preserved as an operational fallback only, not normal nightly truth without calendar context.

## `regenerate-property-surfaces.js`

Regenerates derived property fact surfaces from `src/_data/properties-fallback.json` without calling Hostaway:

```bash
npm run property:truth:regen
npm run property:truth:check
```

Use `property:truth:regen` after hand-editing the fallback file. Use `property:truth:check` in verification; it exits non-zero if `src/llms.txt` or any per-property template has drifted from the fallback authority.
