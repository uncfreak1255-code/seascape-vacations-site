# Phase 1 Stability Architecture Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace all render‑time PMS fetches with a Netlify Blobs cache while keeping the current visual design and a hybrid Hostaway booking experience.

**Architecture:** Hostaway webhooks and a scheduled sync write normalized property data to Netlify Blobs with idempotency and atomic swaps. Public pages read from the cache only. Booking availability stays in a Hostaway widget + direct booking link.

**Tech Stack:** Eleventy, Netlify Functions, Netlify Blobs, Node.js

---

## Chunk 1: Cache Schema + Access Layer

### Task 1: Add Netlify Blobs dependency

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`

- [ ] **Step 1: Add dependency**

Add `@netlify/blobs` to dependencies.

- [ ] **Step 2: Install**

Run: `npm install`
Expected: package-lock updated

- [ ] **Step 3: Commit**

```
git add package.json package-lock.json
git commit -m "chore: add netlify blobs dependency"
```

---

### Task 2: Define cache schema + loader

**Files:**
- Create: `src/_data/properties.js`
- Modify: `src/_data/properties.json` (rename to fallback seed if needed)

- [ ] **Step 1: Create loader**

Implement `src/_data/properties.js`:
```js
const fs = require("fs");
const path = require("path");
const { getStore } = require("@netlify/blobs");

const FALLBACK_PATH = path.join(__dirname, "properties.json");
const CACHE_KEY = "properties_cache_v1.json";
const STORE_NAME = "seascape-cache";

module.exports = async function () {
  try {
    if (process.env.NETLIFY_BLOBS_CONTEXT || global.netlifyBlobsContext) {
      const store = getStore(STORE_NAME);
      const cached = await store.get(CACHE_KEY, { type: "json" });
      if (cached && Array.isArray(cached.properties)) {
        return cached.properties.filter(p => p.status !== "inactive");
      }
    }
  } catch (err) {
    // fallback to local seed
  }

  if (fs.existsSync(FALLBACK_PATH)) {
    return JSON.parse(fs.readFileSync(FALLBACK_PATH, "utf8"));
  }

  return [];
};
```

- [ ] **Step 2: Keep fallback**

Keep `src/_data/properties.json` as local fallback seed. If renaming, update loader accordingly.

- [ ] **Step 3: Commit**

```
git add src/_data/properties.js src/_data/properties.json
git commit -m "feat: load properties from netlify blobs with local fallback"
```

---

## Chunk 2: Sync Pipeline (Webhook + Backstop)

### Task 3: Normalization module

**Files:**
- Create: `scripts/cache/normalize-hostaway.js`

- [ ] **Step 1: Create normalizer**

```js
const HOSTAWAY_PREFIX = "https://hostaway-platform.s3.us-west-2.amazonaws.com/";
const CDN_PREFIX = "https://bookingenginecdn.hostaway.com/";
const PLACEHOLDER_IMAGE = "/images/seascape-og-default.jpg";

function normalizeImage(url) {
  if (!url) return null;
  if (url.startsWith(CDN_PREFIX)) return url;
  if (url.startsWith(HOSTAWAY_PREFIX)) {
    return `${CDN_PREFIX}${url.slice(HOSTAWAY_PREFIX.length)}?width=1600&quality=80&format=webp&v=2`;
  }
  return url;
}

function normalizeListing(listing) {
  const images = (listing.listingImages || [])
    .map(img => normalizeImage(img.url))
    .filter(Boolean);
  const hero = images[0] || PLACEHOLDER_IMAGE;
  const gallery = images.length ? images.slice(0, 10) : [hero];

  return {
    id: String(listing.id),
    slug: listing.name?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
    name: listing.name || "Seascape Vacation Rental",
    city: listing.city || "Bradenton",
    destination: (listing.city || "bradenton").toLowerCase().replace(/\s+/g, "-"),
    bedrooms: listing.bedroomsNumber ?? listing.bedrooms ?? 0,
    bathrooms: listing.bathroomsNumber ?? listing.bathrooms ?? 0,
    guests: listing.personCapacity ?? listing.guests ?? 0,
    rating: listing.reviewAverageRating ?? null,
    price: { amount: listing.listingPrice || 0, currency: "USD", unit: "night" },
    description: listing.description || "",
    highlights: [],
    amenities: [],
    specs: "",
    bookingUrl: listing.listingUrl || "",
    heroImage: hero,
    gallery,
    status: listing.status || "active",
    updatedAt: listing.updatedAt || new Date().toISOString()
  };
}

module.exports = { normalizeListing };
```

- [ ] **Step 2: Commit**

```
git add scripts/cache/normalize-hostaway.js
git commit -m "feat: add hostaway listing normalizer"
```

---

### Task 4: Webhook function

**Files:**
- Create: `netlify/functions/hostaway-webhook.js`

- [ ] **Step 1: Implement webhook handler**

```js
const { getStore } = require("@netlify/blobs");
const { normalizeListing } = require("../../scripts/cache/normalize-hostaway");
const https = require("https");

const SECRET = process.env.HOSTAWAY_WEBHOOK_SECRET;
const CLIENT_ID = process.env.HOSTAWAY_ID;
const CLIENT_SECRET = process.env.HOSTAWAY_SECRET;
const CACHE_KEY = "properties_cache_v1.json";
const EVENT_KEY = "hostaway_webhook_events_v1.json";
const STORE_NAME = "seascape-cache";

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };
  if (SECRET && event.headers["x-webhook-secret"] !== SECRET && event.queryStringParameters?.secret !== SECRET) {
    return { statusCode: 401, body: "Unauthorized" };
  }

  const payload = JSON.parse(event.body || "{}");
  const store = getStore(STORE_NAME);
  const eventId = payload.eventId || payload.id;
  if (eventId) {
    const seen = (await store.get(EVENT_KEY, { type: "json" })) || [];
    if (seen.includes(eventId)) return { statusCode: 200, body: "duplicate" };
    seen.push(eventId);
    await store.set(EVENT_KEY, seen.slice(-200));
  }
  const listingId = payload.listingId || payload.id;

  if (!listingId) return { statusCode: 400, body: "Missing listingId" };

  const token = await getAccessToken();
  const listing = await fetchListing(listingId, token);
  const normalized = normalizeListing(listing);

  const cache = (await store.get(CACHE_KEY, { type: "json" })) || { properties: [] };
  const next = cache.properties.filter(p => p.id !== normalized.id);
  next.push(normalized);

  await store.set(CACHE_KEY, {
    ...cache,
    properties: next,
    syncStatus: "success",
    lastSuccessfulSync: new Date().toISOString()
  });

  return { statusCode: 200, body: "ok" };
};

function fetchListing(id, token) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "api.hostaway.com",
      path: `/v1/listings/${id}`,
      method: "GET",
      headers: { Authorization: `Bearer ${token}` }
    };
    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const json = JSON.parse(data);
          resolve(json.result || json);
        } catch (err) {
          reject(err);
        }
      });
    });
    req.on("error", reject);
    req.end();
  });
}

function getAccessToken() {
  return new Promise((resolve, reject) => {
    const body = new URLSearchParams({
      grant_type: "client_credentials",
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      scope: "general"
    }).toString();
    const options = {
      hostname: "api.hostaway.com",
      path: "/v1/accessTokens",
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": body.length
      }
    };
    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const json = JSON.parse(data);
          if (json.access_token) resolve(json.access_token);
          else reject(new Error(`Failed token: ${data}`));
        } catch (err) {
          reject(err);
        }
      });
    });
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}
```

- [ ] **Step 2: Commit**

```
git add netlify/functions/hostaway-webhook.js
git commit -m "feat: add hostaway webhook cache updater"
```

---

### Task 5: Scheduled backstop sync

**Files:**
- Create: `netlify/functions/hostaway-sync.js`
- Modify: `netlify.toml`

- [ ] **Step 1: Implement sync**

```js
const { getStore } = require("@netlify/blobs");
const { normalizeListing } = require("../../scripts/cache/normalize-hostaway");
const https = require("https");

exports.handler = async () => {
  const token = await getAccessToken();
  const listings = await fetchListings(token);
  const properties = listings.map(normalizeListing);

  const store = getStore("seascape-cache");
  await store.set("properties_cache_v1.json", {
    properties,
    syncStatus: "success",
    lastSuccessfulSync: new Date().toISOString()
  });

  return { statusCode: 200, body: "sync complete" };
};

function fetchListings(token) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "api.hostaway.com",
      path: "/v1/listings?limit=200",
      method: "GET",
      headers: { Authorization: `Bearer ${token}` }
    };
    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const json = JSON.parse(data);
          resolve(json.result || []);
        } catch (err) {
          reject(err);
        }
      });
    });
    req.on("error", reject);
    req.end();
  });
}

function getAccessToken() {
  return new Promise((resolve, reject) => {
    const body = new URLSearchParams({
      grant_type: "client_credentials",
      client_id: process.env.HOSTAWAY_ID,
      client_secret: process.env.HOSTAWAY_SECRET,
      scope: "general"
    }).toString();
    const options = {
      hostname: "api.hostaway.com",
      path: "/v1/accessTokens",
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": body.length
      }
    };
    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const json = JSON.parse(data);
          if (json.access_token) resolve(json.access_token);
          else reject(new Error(`Failed token: ${data}`));
        } catch (err) {
          reject(err);
        }
      });
    });
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}
```

- [ ] **Step 2: Atomic swap**

Write to a temp key and swap into `properties_cache_v1.json` only after validation.

- [ ] **Step 3: Schedule**

Add to `netlify.toml`:
```
[functions."hostaway-sync"]
  schedule = "0 */6 * * *"
```

- [ ] **Step 4: Commit**

```
git add netlify/functions/hostaway-sync.js netlify.toml
git commit -m "feat: add scheduled hostaway cache backstop"
```

---

## Chunk 3: Public Rendering + Gates

### Task 6: Remove runtime fetch in homepage

**Files:**
- Modify: `src/index.njk`

- [ ] **Step 1: Replace runtime fetch**

Remove `fetch('/.netlify/functions/get-properties')` and render property grid from the `properties` dataset at build time.

- [ ] **Step 2: Commit**

```
git add src/index.njk
git commit -m "fix: render properties from cache instead of runtime fetch"
```

---

### Task 7: Delete legacy function

**Files:**
- Delete: `netlify/functions/get-properties.js`

- [ ] **Step 1: Delete**

```
git rm netlify/functions/get-properties.js
git commit -m "chore: remove legacy get-properties function"
```

---

### Task 8: Add build gates

**Files:**
- Modify: `scripts/enforcement/lib.js`
- Modify: `scripts/enforcement/verify-release.js`
- Modify: `scripts/recovery/assert-build-output.js`

- [ ] **Step 1: Add forbidden pattern list**

Add forbidden strings:
```
/.netlify/functions/get-properties
api.hostaway.com
hostaway-platform.s3.us-west-2.amazonaws.com
images.unsplash.com
```
Allow `bookingenginecdn.hostaway.com` only on property detail output.

- [ ] **Step 2: Commit**

```
git add scripts/enforcement/lib.js scripts/enforcement/verify-release.js scripts/recovery/assert-build-output.js
git commit -m "test: enforce no runtime PMS fetches in public output"
```

---

## Chunk 4: Verification

### Task 9: Run tests

- [ ] **Step 1:** `npm test`
- [ ] **Step 2:** `npm run build`
- [ ] **Step 3:** `npm run verify:recovery:p0`
- [ ] **Step 4:** `npm run verify:recovery:remediation`
- [ ] **Step 5:** `npm run verify:release -- --range origin/main...HEAD`

---

**Plan complete and saved to** `docs/superpowers/plans/2026-03-16-stability-architecture-phase-1.md`. Ready to execute.
- [ ] **Step 2: Atomic swap**

Write to a temp key (e.g. `properties_cache_v1.tmp.json`) and then replace `properties_cache_v1.json` only after validation.
