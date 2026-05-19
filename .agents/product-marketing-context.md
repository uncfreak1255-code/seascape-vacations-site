# Product Marketing Context — Seascape Vacations

## Product

- Seascape Vacations is a local Gulf Coast vacation-rental operator and property-management company.
- The live site has two real audiences: guests booking stays and owners evaluating management.
- This repo exists to improve the site's performance on those two jobs, not to hold company-wide memory.

## Core Offer

### Guests

- Direct-book vacation homes in the Bradenton, Anna Maria Island, and Sarasota corridor.
- The pitch is not "generic Florida vacation." It is lower-friction Gulf Coast stays with a local operator behind them.
- Real advantages: direct-book savings, local support, better trip-fit guidance, and a smaller portfolio that can be run carefully.

### Owners

- Property-management messaging is switcher-first.
- The owner problem is usually not "no demand." It is weak owner economics hidden by busy calendars: OTA drag, soft pricing, and sloppy execution.
- Owner pages should speak to margin protection, channel mix, and local follow-through, not generic hospitality fluff.

## Geographic Focus

- Bradenton
- Anna Maria Island corridor
- Sarasota
- Siesta Key area when it supports a real decision path

## Truth Boundaries

- Property facts come from `src/_data/properties.js` and the fallback seed, not from memory.
- Owner proof comes from `src/_data/ownerProofAssets.json` and approved source copy, not from stale global trust claims.
- Do not reuse sitewide review-count claims unless they are explicitly approved in current source and proof assets.
- Do not invent amenities, waterfront status, or equipment.

## Voice

- Sound like a sharp local operator, not a tourism board and not a content mill.
- Be direct, useful, and specific.
- Explain tradeoffs instead of hiding them.
- Use real route, price, timing, and trip-shape context when it helps a reader decide.

Read `docs/style/voice.md`, `docs/style/approved-examples.md`, and `docs/style/banned-patterns.md` before writing or editing customer-facing copy.

## Repo Boundaries

- This file is about product and audience context only.
- Workflow rules live in `AGENTS.md`, `CLAUDE.md`, and `docs/process/`.
- Execution state lives in `docs/status/`.
- Batch-specific instructions live in `docs/briefs/`.
