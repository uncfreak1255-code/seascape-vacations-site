# Brief: Family guide editorial packing illustration

## Content Gate Inputs

- persona: parents preparing for a family beach trip near Anna Maria Island
- primary keyword: family vacation Anna Maria Island
- secondary keywords: Anna Maria Island beach packing, family beach checklist
- audience pattern: parents who want a short reminder before leaving for the beach
- proof source: Sawyer approved the rendered illustration comparison and explicitly requested deployment on 2026-09-09; existing guide source and public HTML inspected on 2026-09-09; built-in image generation output visually reviewed at desktop and mobile widths
- required internal links: /properties/, /stays/family-vacation-rentals-anna-maria-island/
- CTA target: preserve the current property and family-stay links; this change introduces no new CTA or tracking
- anti-claims: no generated property or named destination imagery, no assertion that pictured gear is supplied, no safety guarantee, no new local business fact, no SEO or conversion lift claim

## Authority and scope

This is Sawyer's explicitly approved existing-page design change, not a new SEO expansion batch. The Aug. 11 read in `docs/status/next-batch.md` is not fresh September performance proof. The task does not upgrade that status or use it to claim page demand or lift.

Revenue lever: help guide readers complete a small packing task. Proof surface: approved comparison plus deployed desktop/mobile rendering. Owning repo: seascape-vacations-site. What stops: no bulk illustration rollout, new guide volume, or unrelated page redesign in this release.

## Gate 0 Search And Attack Receipt

| Field | Required answer |
| --- | --- |
| Target query family | family vacation Anna Maria Island; Anna Maria Island family beach packing |
| Searcher intent | guide/research: family beach-trip preparation |
| Current Seascape URL | https://seascape-vacations.com/guides/family-vacation-anna-maria-island/ |
| SERP observed date | 2026-09-09 |
| SERP stale after | 2026-09-16 |
| Current proof | 2026-09-09 current source and live guide inspection plus Sawyer's approved rendered preview. Final page-filtered analytics are not ready; no ranking or booking impact claim. |
| Top visible competitors | AMI Locals; Anna Maria Vacations; Crabby Joe's, surfaced in the named search read; no fixed local rank position is asserted. |
| Competitor angle | General family packing lists, bring/leave-behind advice, and gear-rental promotion. |
| Visual/format gap | Competitors use long lists and photos. Use one short illustrated checklist within the existing article instead of another packing article. |
| Seascape gap | The current family guide has no compact first-morning packing reminder. |
| Search fit | Existing family guide can answer a small planning question while retaining its family-stay links. This release tests the approved visual direction, not a claim to win a new keyword. |
| Local/GBP proof | Not applicable: no local business listing, NAP, category, or map-pack change. |
| AEO/readback note | Not applicable: no AI visibility claim or special markup; the checklist remains ordinary readable HTML. |
| Recommendation | improve: deploy the approved illustrated insert and contain the existing mobile table overflow observed during preview. |
| Attack status | completed |
| Query variants inspected | Anna Maria Island family vacation guide packing beach |
| SERP source | Web search on 2026-09-09; page-specific query above. |
| Competitor URLs inspected | https://www.amilocals.com/news-and-blog/what-to-pack-for-your-vacation-to-anna-maria-island/ ; https://www.annamaria.com/packing-list-anna-maria-island-vacation/ ; https://crabbyjoescartrentals.com/what-to-pack-and-what-to-skip-for-a-beach-day-on-anna-maria-island/ |
| Content gap and Seascape answer | Short four-item beach-morning checklist paired with clearly identified artwork; no competitor text copied. |
| Design/format strategy | Retain current page layout and real hero; use the approved cream/teal/gold still life beside the list on desktop and above it on mobile. |
| Seascape proof available | Approved 2026-09-09 visual preview, actual current page, and isolated source diff. |
| Tools/plugins used | Built-in image generation for the approved asset; read-only web source tool; local design specialist/critic guidance; Playwright for rendered proof. |
| Decision and reason | Ship only the approved design increment; defer wider SEO selection until current analytics and local fact checks. |

## Source files changed

  - `src/guides/family-vacation-anna-maria-island.html`
  - `images/family-beach-packing-illustration.webp`
  - `DESIGN.md`
  - `tests/visual/family-guide-illustration.spec.js`

## Design and voice

Approved concept: a warm gouache beach-bag still life supports a useful checklist, without replacing real photography. Desktop uses two columns; mobile stacks the image above the copy. A scoped horizontal-scroll wrapper contains the pre-existing activity table overflow shown in the preview. No new JavaScript is needed.

Visible-copy lane: **Draft the copy** from the approved preview; **Remove internal wording** by keeping the production classes and caption free of preview labels; **Check voice and specificity** against the existing voice sources. Voice Editor verdict: Approved for the new heading, short introduction, four packing items, alt text and caption. Existing article text and its March update date remain outside the factual-refresh claim.

Asset: built-in image tool, generated 2026-09-09. The tool did not expose an exact model ID. WebP is 1536 x 1024, 179670 bytes. Caption identifies editorial illustration. Pictured items are packing suggestions, not a statement of included rental amenities.

## Release proof

Run content lint, canonical build/unit/release checks, guide recovery checks, and the focused desktop/mobile illustration test. Verify the image loads, the complete checklist remains readable, the hero and booking links remain, and the document has no horizontal overflow. Retain desktop/mobile screenshots in the Playwright report. After merge, confirm Netlify's deployed commit and run the live smoke/entity checks and a live readback of this route and image.
