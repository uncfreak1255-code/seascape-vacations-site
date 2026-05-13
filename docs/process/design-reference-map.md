# Design Reference Map

Use this before changing layout, CSS, typography, imagery, or visual hierarchy.

Seascape's visual law still lives in [DESIGN.md](/Users/sawbeck/Projects/seascape-vacations-site/.worktrees/design-review-tooling/DESIGN.md). The Sawyer Hub references below are donor references for structure, hierarchy, and critique rules. Do not import donor token packs into this repo unchanged.

## Page Families

| Page family | Owning source | Product type to name | Primary reference family | Default donor references | Notes |
| --- | --- | --- | --- | --- | --- |
| `homepage` | `src/index.njk` | Vacation rental marketing homepage | `bold-brand-site` | `arc-bold-brand-site`, `equals-editorial-product` | Make the offer and place obvious immediately. Keep the next section visible. |
| `guide` | `src/guides/` | Local guide / destination guide | `editorial-product` | `equals-editorial-product`, `arc-bold-brand-site` | Let typography carry stance. Show proof or orientation early. |
| `stay-lander` | `src/stays/stays.njk` + `src/_data/seoPages.json` | Stay collection landing page | `bold-brand-site` | `arc-bold-brand-site`, `equals-editorial-product` | Keep the hero memorable, then transition quickly into matching homes and FAQ proof. |
| `property-detail` | `src/properties/` | Vacation rental property detail page | `premium-utility` | `mercury-premium-utility`, `arc-bold-brand-site` | Use premium utility discipline for spec, amenity, and booking modules. Keep brand identity above the fold. |
| `owner-page` | `src/property-management/` | Owner acquisition / proof page | `premium-utility` | `mercury-premium-utility`, `equals-editorial-product` | Proof, comparison, and CTA hierarchy matter more than decorative flourishes. |
| `research-page` | `src/research/` | Research or benchmark explainer | `editorial-product` | `equals-editorial-product`, `mercury-premium-utility` | Lead with the key claim, then use tidy utility sections for tables, methods, and caveats. |
| `internal-review` | generated HTML review surfaces | Internal review board | `precise-operator` | `linear-precise-operator`, `mercury-premium-utility` | Optimize for scanning, comparison, and quick decisions. |

## Commands

Pick 1-2 donor references before design work:

```bash
npm run review:pick-design-references -- --page-family guide
npm run review:pick-design-references -- --source-file src/properties/river-house/index.njk
```

Build a screenshot board after captures exist:

```bash
npm run review:build-screenshot-board -- --screenshots tmp/visual-review --output tmp/visual-review/index.html --git-base origin/main
```

## Hard Boundaries

- Start with this repo's `DESIGN.md`, not the donor repo.
- Use Sawyer Hub references to sharpen hierarchy, rhythm, and critique gates.
- Keep Seascape colors, typography, spacing, and component law unless the task explicitly changes the design system.
- Screenshot review is still required on desktop and mobile before asking for human review.
