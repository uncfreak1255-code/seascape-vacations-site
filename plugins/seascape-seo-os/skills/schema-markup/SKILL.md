---
name: schema-markup
description: Use when adding or reviewing page schema markup and JSON-LD, or diagnosing missing rich results.
metadata:
  version: 1.1.0
---

# Schema Markup

Implement accurate JSON-LD that represents the visible page and its verified
entities. Valid markup, rich-result eligibility, and actual search display are
separate outcomes.

## Constraints

- Use existing source data and template conventions. Do not invent reviews,
  ratings, amenities, prices, dates, or content to fill schema fields.
- Preserve entity identifiers and avoid conflicting duplicate markup. Use
  `@graph` when it helps relate multiple entities.
- Property facts belong to `src/_data/properties-fallback.json` and its
  regeneration path. Owner claims belong to `src/_data/ownerProofAssets.json`.
- Check current official Google requirements for the targeted rich result;
  examples are not an eligibility contract. Do not recommend HowTo rich results
  or FAQPage outside Google's eligibility policy.
- Measurement and AI-citation monitoring remain in `seascape-analytics`.
  External SEO packs remain donor-only under `docs/process/skill-policy.md`.

## Routing

For schema tied to AI discovery, GEO/AEO, crawlability, entity clarity,
`llms.txt`, `/ai-discovery.json`, or `/ai/*`, use
`.claude/agents/search-operator.md` and
`docs/process/seo-competitor-operating-loop.md` for the proof and attack lane.
This skill owns the resulting markup and templates.

Use [schema examples](references/schema-examples.md) only for the schema type
or integration pattern needed. Replace example values with verified facts;
check required fields and eligibility against current official documentation.

## Completion

For implementation, finish the source change, inspect built JSON-LD against
visible content, run `npm run verify:jsonld` on a fresh build and the required
release checks, and repair in-scope failures. Check relevant official validators
when assessing rich-result eligibility; explain warnings rather than promising
search display from a clean validator result.

Return the changed schema/source, validation evidence, and any missing factual
data or unverified search behavior. For review-only requests, return findings
and a concrete fix without changing source.
