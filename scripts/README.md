# Site Scripts

## `pull-property-truth.js`

Pulls Hostaway listing data into `src/_data/properties-fallback.json`.

Safe path:

```bash
HOSTAWAY_API_TOKEN=... node scripts/pull-property-truth.js --dry-run
HOSTAWAY_API_TOKEN=... node scripts/pull-property-truth.js
```

Rollback:

```bash
node scripts/pull-property-truth.js --restore-last-good
```

The script snapshots the raw Hostaway response, prints a dry-run diff before output writes, writes JSON via temp-file rename, saves a last-good copy before overwrite, retries 429/5xx API responses with backoff, and sums Hostaway `bathrooms + guestBathrooms`. It only uses structured amenity arrays; Hostaway description text is not mined for confident marketing amenities. Hostaway `listingPrice` is preserved as an operational fallback only, not normal nightly truth without calendar context.
