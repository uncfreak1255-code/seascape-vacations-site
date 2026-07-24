# Design Loop Audit — Why Seascape Pages Drift, and How to Make Them Consistent by Default

*Date: 2026-07-21. Method: a multi-agent audit team (page audit, workflow audit,
full-corpus scan, enforcement-gap analysis, external research) with an
adversarial verification pass over the load-bearing numbers, then synthesis.
Numbers below are the verified counts.*

## The one-sentence finding

Seascape has an excellent design **system** (`DESIGN.md`), a real design
**process** (specialist → critic → design-review), and machine gates for
content, SEO, JSON-LD, and links — but **zero machine gate enforces the visual
law**, and **53 of 54 guides re-implement the whole page shell inline instead of
inheriting the shared system**, so drift is the structural default, not an
accident.

## The smoking gun

`/guides/anna-maria-island-vs-siesta-key/` is one of the strongest nonbrand
organic assets in the repo — and it shipped violating five `DESIGN.md` rules at
once: off-brand Airbnb blue `#2c5f7c`, cool gray `#f8f9fa`, a flat teal-gradient
hero with no photography, Google Fonts loaded in-page, and no shared nav/footer.
It passed `npm run build`, `npm test`, `npm run verify:release`, and
`npm run lint:content` while off-brand, because nothing checks color, fonts, or
imagery. This PR recreates that page onto the Field Report standard (real
split-photo hero of both islands, self-hosted fonts, shared nav/footer,
tokenized colors, responsive comparison tables) and adds the missing gate.

## The corpus evidence (why consistency can't hold today)

Across **55 guide source files**, only **1** (`shelling-guide-florida.html`) is
built the modern way — it declares `layout: layouts/guide-field-journal.njk` and
inherits the shared CSS, self-hosted fonts, header, and a real hero. Every other
guide is a standalone `<!doctype>` document that re-implements the shell inline:

| Check | Guides failing |
|---|---|
| Ship an inline `<style>` block | 53 / 54 |
| Hardcode raw hex color values | 53 / 54 |
| Re-declare the entire token set inline (`:root{--brand:…}`) | 46 / 54 |
| Contain off-brand blue / purple / gray literals | ~51 / 55 |
| Load Google Fonts in-page | ~50 / 55 |
| No real hero photograph (flat gradient / type only) | ~25 / 54 |
| Use the shared guide layout | **1 / 54** |
| Use the shared site header | **1 / 54** |

Because 46 guides carry their **own inline copy** of the palette, editing
`DESIGN.md` or `src/css/base.css` reaches exactly one page. There is no shared
lever to pull. That is the root of every drift symptom.

## Five root causes

1. **No single source of truth sits in the render path.** 53/54 guides own their
   own `<style>`, token copy, header, hero, and font loading. A `DESIGN.md` or
   `base.css` edit propagates to one page.
2. **Fixes are hand-applied per page, so corrections never compound.** A page can
   be "correct today" and silently re-drift tomorrow because it still owns its
   own CSS — this exact page is the pinned visual baseline.
3. **Zero machine gates enforce `DESIGN.md`.** `verify:release` has no design
   step; `npm test` has no token/hex/font check. The only "brand" check
   (`responsive-smoke.test.js`) passes if the HTML merely *contains* the string
   `--brand` or `#5F8A8B` — a false-positive net that green-lights off-brand
   pages.
4. **Taste is honor-system and receipt-less.** The specialist → critic loop
   exists only as prose skills; no critic verdict is persisted or gated, while
   owner-proof freshness *is* gated in `verify:release`. "The critic approved
   this" is an unlogged chat claim.
5. **Neither consistency nor creativity is designed for.** With no fixed recipe,
   every page is a from-scratch improvisation (unbounded drift); a naive
   "everything must match" gate would instead yield a dozen identical comparison
   pages (monotony). Nothing mandates a per-page creative moment while locking
   everything else.

## Highest-leverage moves

1. **Make the shared layout the only way to build a guide.** Collapses 53 private
   shells into one lever; tokens, fonts, header, hero, footer become inherited.
   The single highest-leverage change.
2. **One deterministic design-lint gate** wired into `npm test` and
   `verify:release`, with a shrinking baseline + migrate-on-touch ratchet. Makes
   off-brand a build failure. *(Shipped in this PR — see below.)*
3. **Generate `/css/tokens.css` from `DESIGN.md`'s YAML** at build; `base.css`
   consumes it; a contract test guards the match. Kills the "N drifting
   primaries" class and makes inline `:root` copies redundant and lintable.
4. **A "head-to-head" comparison recipe** on the shared layout that turns
   comparison content into front-matter data (diptych cover + verdict band +
   difference-meters + stay band) instead of hand-built tables. The ~12 vs-pages
   inherit the system by construction.
5. **Persist a critic / design-review receipt** (route + content hash + score)
   and gate its freshness in `verify:release`, mirroring the existing owner-proof
   freshness gate. Turns taste into a machine fact.
6. **A recipe contract that locks the skeleton but mandates exactly ONE creative
   slot per page** — consistent primitives everywhere, one required decisive
   device (a sand-color swatch, a parking-difficulty meter, a cost-delta bar, a
   drive-time map). The structural rule that prevents *both* drift and
   twelve-identical-pages monotony.
7. **A designated golden-route set** as the conformance bar, and rebuild the
   drift-locked visual baselines from on-standard pages so the machinery teaches
   the right bar. Split the conformance gate (must match `DESIGN.md`) from the
   regression gate (must not change pixels).

## Prioritized actions

| Impact | Effort | Type | Action |
|---|---|---|---|
| High | M | enforcement | **`design-lint` gate** (off-brand hex vs palette allowlist, Google-Fonts, emoji) with a shrinking baseline + migrate-on-touch. *Shipped in this PR.* |
| High | M | componentization | Generate `/css/tokens.css` from `DESIGN.md`; contract-test the match. |
| High | M | componentization | Build a `guide-comparison` recipe on the shared layout; migrate this page onto it first. |
| High | S | exemplar | Designate a protected golden-route set; rebuild visual baselines on-standard; split conformance vs regression gates. |
| High | M | taste | Persist a scored critic receipt per changed route; gate its freshness in `verify:release`. |
| Medium | S | enforcement | Replace the `responsive-smoke.test.js` false-positive "consistent theme" check with the design-lint palette/font checks. |
| Medium | S | process | Add the mandated single "creative slot" to the recipe contract; enforce softly via the critic's "one memorable interaction" criterion. |
| Medium | L | componentization | Migrate the remaining ~52 legacy guides onto the recipe in batches behind the shrinking baseline; add a hidden `/_gallery/` route that snapshots every component so a token change surfaces one diff, not 54. |

## Design Loop v2 — runnable by a solo owner + agent

- **Step 0 — Source of truth (one-time / on token change):** `npm run build:tokens`
  emits `/css/tokens.css` from `DESIGN.md`; a contract test guards it. Nobody
  hand-types hex again.
- **Step 1 — Pick the recipe, never a blank page.** Every guide declares
  `layout: layouts/guide-field-journal.njk` (or the comparison recipe). Content
  is front matter + prose. There is no standalone `<!doctype>` path. *Consistency
  is inherited, not re-typed.*
- **Step 2 — Brief the ONE creative slot before pixels.** Run
  `seascape-design-specialist`, which must invoke `seascape-design-critic` first.
  All creative energy goes into the single mandated decisive device. The critic
  returns a scored 1–5 verdict; Reject / Needs-another-pass means do not build.
- **Step 3 — Implement on the recipe** using only system primitives (`.btn`
  modifiers, `ui-icon.njk`, `journal-*` blocks). No inline hex, no per-page
  `<style>`. Real Gulf Coast photography in the cover.
- **Step 4 — Fast local gate (seconds):**
  `npm run lint:content && npm run lint:design && npm run build`.
- **Step 5 — Visual + taste proof:** `npm run test:visual` against on-standard
  golden baselines; for subjective changes, desktop+mobile screenshots and the
  `design-review` skill, which writes a critic receipt.
- **Step 6 — Release gate:** `npm run verify:release` runs the full steps
  *including* `lint:design` and a design-receipt freshness check; merge blocks on
  a stale critic verdict or dirty design-lint, exactly like owner-proof today.
- **Step 7 — Ship.** The golden set stays protected; the design-lint baseline can
  only shrink, so the corpus can only move toward the recipe and can never
  accrete new bespoke CSS.

**Net property:** consistency becomes *structural* (one layout, generated tokens,
a gate that blocks off-brand and forces migrate-on-touch) while creativity is
*mandated and bounded* (a fixed recipe with exactly one required, critic-scored
creative slot per page). A page cannot ship off-brand, and cannot ship as a
boring clone either.

## What this PR ships

- **The page recreation** — `/guides/anna-maria-island-vs-siesta-key/` rebuilt to
  the Field Report standard, preserving every JSON-LD block, meta tag, tracking
  event, and the readback-gate markers verbatim.
- **The `design-lint` gate** — `scripts/design/design-lint.js` +
  `design-lint-baseline.json` + `scripts/enforcement/design-lint.test.js`, plus
  `npm run lint:design`. It derives its allowlist from the sanctioned CSS, so
  approved colors never false-positive; it grandfathers the ~53 legacy guides in
  a baseline that can only shrink; and the recreated page passes it **on merit**,
  not by exemption. This is action #1 made real: any *new* off-brand guide now
  fails `npm test`.

## What is proposed next (not in this PR)

Items 2–8 above are a program of work, not a single change, and several touch the
whole release pipeline or all 54 pages. They are sequenced so each is independently
shippable behind the shrinking baseline: tokens generation → comparison recipe →
migrate this page onto it → golden routes + rebuilt baselines → critic receipts →
batch-migrate the remaining legacy guides.
