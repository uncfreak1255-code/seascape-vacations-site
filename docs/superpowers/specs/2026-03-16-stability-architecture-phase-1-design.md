# Phase 1 Stability Architecture Design

**Goal:** Eliminate render-time PMS instability while preserving the current visual design and booking flow.

**Scope:** Public browsing surfaces, property cards, property detail content, and cache sync pipeline. No CRO or booking UI polish in this phase.

**Non-Goals:** Redesign, copy rewrite, or new features unrelated to stability.

---

## A. Cache Data Model (Netlify Blobs)

**Store:** Netlify Blobs index key `properties_cache_v1.json`

**Size strategy:** cache index stores summary + gallery for each property. If payload grows beyond safe blob size, shard into per‑property blobs and keep this index as the source list.

**Per‑property schema (required unless noted):**
- `id` (string)
- `slug` (string)
- `name` (string)
- `city` (string)
- `destination` (string)
- `bedrooms` (number)
- `bathrooms` (number)
- `guests` (number)
- `rating` (number | null)
- `price` (object) { `amount` (number), `currency` (string, default "USD"), `unit` (string, default "night") }
- `description` (string)
- `highlights` (string[])
- `amenities` (string[])
- `specs` (string)
- `bookingUrl` (string)
- `heroImage` (string)
- `gallery` (string[10] max)
- `status` (string: "active" | "inactive")
- `updatedAt` (ISO string, source timestamp if available, else sync timestamp)

**Normalization rules:**
- Convert Hostaway image URLs to `bookingenginecdn.hostaway.com` form.
- Deterministic order: `heroImage` first, then unique gallery images in provided order.
- If fewer than 10 images, keep what exists; do not duplicate. If zero, use a local placeholder and flag in logs.
- `heroImage` is included in `gallery[0]`.

---

## B. Sync Pipeline (Webhook + Backstop)

**Webhook trigger:**
- Receive Hostaway webhook.
- Verify signature (reject if missing/invalid).
- Idempotency: store last N event IDs and ignore duplicates.
- Fetch latest listing details from Hostaway API.
- Normalize into cache format.
- Write via atomic swap (write temp key, validate, then update index pointer).

**Backstop refresh:**
- Scheduled full sync every 6 hours.
- Rebuild entire cache from Hostaway API into Netlify Blobs using the same atomic swap path.

**Write rules:**
- Only write to Netlify Blobs.
- Never write to `src/` or `_site/`.
- Concurrency: use `syncStatus` in the index (running/success/failed) with `lastSuccessfulSync` and checksum.

---

## C. Public Rendering Rules

**Public pages must read from cache only:**
- Homepage cards
- Guides and owner pages
- Property cards and stay listing grids

**Allowed dynamic surfaces:**
- Property detail booking widget for live availability/pricing only.
- Direct booking link to Hostaway booking engine as fallback.
- All other property detail content must come from cache fields defined above.

**Prohibited:**
- Render-time calls to Hostaway or Netlify functions on public pages.
- Raw Hostaway S3 URLs in public output.

**Build gates:**
- Fail builds if public output includes `/.netlify/functions/get-properties`, `api.hostaway.com`, or `hostaway-platform.s3.us-west-2.amazonaws.com`.
- Allow `bookingenginecdn.hostaway.com` only in property detail pages and listing images.
- Static grep on built HTML + lint for render‑time `fetch` in public templates.

---

## Schedule and Risk Controls

**Backstop cadence:** every 6 hours.

**Kill switch:** config flag `SYNC_CADENCE` with values `6h` or `nightly`. If sync error rate > 5% for 24h or rate limits hit, set to `nightly`.

---

## Success Criteria

- Public pages never depend on PMS API at render time.
- Property cards and stay pages are stable under network and API failures.
- Booking availability remains live through Hostaway widget + booking page.
