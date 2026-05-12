# Open Risks

- owner pages are ranking without enough CTR, so visibility still is not reliably becoming owner leads
- the five tracked money pages still have measurement lag risk because crawl freshness has been slower than implementation
- AMI stay winners are stronger than the rest of the stay cluster, but they still have not earned automatic expansion into Holmes Beach or broader stay volume
- proof claims can drift across `src/_data/ownerProofAssets.json`, owner-page copy, and supporting docs if one changes without the others
- amenity, bedroom, and bathroom claims can drift across `src/_data/properties-fallback.json`, per-property templates at `src/properties/<slug>/index.njk`, and `src/llms.txt` — pick one authority and regenerate the others on every property edit instead of hand-editing all three
- Hostaway numeric fields with "half" counterparts are split across two API fields — `bathrooms` + `guestBathrooms` (half baths) for the total. Reconciliation scripts must read both and sum, not treat either as canonical. Same pattern likely exists for any other "half" or "partial" count in the Hostaway API
- guide-family gains can regress if redirects, schema URLs, feeder links, and sitemap output slip out of sync
- the new SEO OS docs can become another stale layer if briefs and portfolio files are not updated when source truth changes
