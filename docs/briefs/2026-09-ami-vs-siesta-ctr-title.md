# Brief: AMI vs Siesta Key CTR title and meta rescue

## Content Gate Inputs

- persona: Gulf Coast trip planner already seeing the Seascape AMI vs Siesta Key result on page one who needs a clearer beach-and-crowd snippet before clicking
- primary keyword: Anna Maria Island vs Siesta Key
- secondary keywords: Siesta Key vs Anna Maria Island, Anna Maria Island or Siesta Key, AMI vs Siesta Key
- audience pattern: organic reader comparing the two Gulf beaches who already sees this URL but often skips it because the snippet still leads with stay-base framing instead of beach, crowds, and where to stay
- proof source: `docs/status/next-batch.md` joined read for 2026-09-05 to 2026-09-11 (`guide_winners` 23 clicks / 3,202 impressions / 0.72% CTR / position 5.25). Query-level GSC from `rank-tracker-latest.md` for 2026-05-05 to 2026-06-01: `siesta key vs anna maria island` 607/1.0%/5.8; `anna maria island vs siesta key` 566/1.4%/5.9. Live WebSearch SERP observed 2026-09-21. OpenSEO AIO citations plus those GSC impressions; Jev next-fix Choice picked this page after weather/best-time/SRQ CTR titles shipped in PR #606.
- offer claim: n/a (guest lane)
- required internal links: /stays/anna-maria-island-vacation-rentals/, /stays/siesta-key-area-vacation-rentals/
- CTA target: unchanged. Title and meta description only; keep every existing on-page CTA and event contract.
- anti-claims: no ranking or CTR lift claim, no new URL, no H1 change, no body rewrite, no weather/best-time/SRQ/restaurant/owner/PM page, no twin/alternate guide, no invented amenity or stay-base claim

## Required Internal Link Map

- src/guides/anna-maria-island-vs-siesta-key.html: /stays/anna-maria-island-vacation-rentals/, /stays/siesta-key-area-vacation-rentals/

These are links the page already carries. This batch does not add or remove internal links.

## Why This Batch

- what changed in the data: OpenSEO AIO citations plus GSC impressions keep this winner visible, while the current `Where to Stay` snippet still understates the beach-and-crowd tradeoff the page already answers. Jev next-fix Choice picked this URL after PR #606 shipped weather, best-time, and SRQ titles.
- why this cluster wins now: the existing URL already ranks on the comparison queries and already holds the beach, crowd, parking, and stay answer. This is snippet framing, not a new batch.
- what should explicitly wait: owner, stay, and new-guide expansion remain below the next-batch threshold. Do not touch weather, best-time, SRQ, restaurants, owner/PM pages, or body copy.

## Experiment And Readback Contract

- hypothesis: a title and meta that name beach, crowds, and where to stay — the comparison the page already publishes — will raise CTR on impressions this URL already has.
- primary event: GSC CTR for `/guides/anna-maria-island-vs-siesta-key/`
- guardrail event: average position for the same URL; revert the snippet if position drops by 1.0 or more after a complete comparable window
- entry criteria: `docs/status/next-batch.md` is `fresh but below threshold` on 2026-09-13, so expansion is closed and this stays a bounded snippet rescue on an existing winner
- readback window: first full 28-day GSC window after deploy, compared with 2026-05-05 to 2026-06-01
- decision rule: keep the snippet when CTR rises without average position degrading by 1.0 or more; revert title and meta if CTR falls or position drops

## Gate 0 Search And Attack Receipt

| Field | Required answer |
| --- | --- |
| Target query family | Anna Maria Island vs Siesta Key, Siesta Key vs Anna Maria Island, Anna Maria Island or Siesta Key |
| Searcher intent | guide/research |
| Current Seascape URL | `/guides/anna-maria-island-vs-siesta-key/` |
| SERP observed date | 2026-09-21 |
| SERP stale after | 2026-09-28 |
| Current proof | Joined `guide_winners` read 2026-09-05 to 2026-09-11: 23/3,202/0.72%/5.25. Query-level GSC 2026-05-05 to 2026-06-01 in `rank-tracker-latest.md`: `siesta key vs anna maria island` 607/1.0%/5.8; `anna maria island vs siesta key` 566/1.4%/5.9. Live WebSearch on 2026-09-21 returned this URL with the current `Where to Stay` title. |
| Top visible competitors | luxurytraveldiarie.com, belleontheboardwalk.com, mousinaround.com, vacationflorida.tv. Seascape's own family comparison also appeared on the same query family. |
| Competitor angle | Which-beach-to-visit titles, family and lifestyle comparisons, and three-island (AMI / Siesta / Longboat) roundups. Visible titles lead with beach fit, not stay-base inventory. |
| Visual/format gap | None. No layout change. The page already has a direct answer, comparison table, crowd/parking sections, and stay CTAs. |
| Seascape gap | The live snippet still titles `Where to Stay` while competitors name beach, crowd, and fit. The page already covers those tradeoffs; the snippet does not. |
| Search fit | Existing winner URL already ranks for the query family and already converts to AMI and Siesta stay CTAs. Title and meta only. |
| Local/GBP proof | Not a GBP or local-pack action. The 2026-09-21 WebSearch results showed organic comparison guides, not a map pack. |
| AEO/readback note | Not a separate AI-answer rewrite. OpenSEO AIO citations plus GSC impressions are the reason this URL is next; the title and meta only restate beach, crowd, and stay answers already on the page. |
| Recommendation | improve title, matching meta description, and mirrored Open Graph / Twitter tags on the existing guide URL; do not change the H1, body copy, or Article headline |
| Attack status | completed |
| Query variants inspected | Anna Maria Island vs Siesta Key; Siesta Key vs Anna Maria Island |
| SERP source | Cursor WebSearch live Google-shaped results observed 2026-09-21 |
| Competitor URLs inspected | https://luxurytraveldiarie.com/siesta-key-vs-anna-maria/, https://belleontheboardwalk.com/anna-maria-island-vs-siesta-key/, https://mousinaround.com/siesta-key-vs-anna-maria-island/, https://vacationflorida.tv/anna-maria-island-vs-siesta-key/ |
| Content gap and Seascape answer | No new content needed. The page already says AMI fits quieter beach days and easier logistics, Siesta fits famous sand and busier days, and then routes to stay collections. |
| Design/format strategy | Unchanged. Metadata only. |
| Seascape proof available | Current source page plus the dated GSC windows named above. Every rewritten claim is already on the page. |
| Tools/plugins used | Repo source inspection, `docs/status/next-batch.md`, `rank-tracker-latest.md`, PR #606 as the prior CTR title ship, and Cursor WebSearch on 2026-09-21 |
| Decision and reason | Ship title and meta only on this already-ranking winner. `docs/status/next-batch.md` is fresh but below threshold, so this is a bounded snippet rescue after weather/best-time/SRQ, not expansion. |

## Source Files Changed In This Batch

  - src/guides/anna-maria-island-vs-siesta-key.html

## Not In Scope

- new URLs or twin/alternate guides
- H1, body, image, or Article schema headline edits
- weather, best-time, SRQ, restaurant, owner, or property-management pages
- impact claims before the post-deploy GSC window closes
