# Brief: AMI vs Siesta Key winner rescue (2026-10-20)

Status: **research** until actual SERP competitors and inspected URLs are captured and every Gate 0 field, including the nine attack fields below, is complete. A SERP read alone does not complete Gate 0. Lane: `docs/process/ranking-regression-rescue.md` (trigger: ≥30% click decline on a winner URL). Portfolio member: `docs/portfolio/winner-guides.md`; table order is not a performance ranking.

- persona: first-time Gulf Coast visitor choosing between two beach areas for a family or group week
- primary keyword: anna maria island vs siesta key
- secondary keywords: anna maria island or siesta key; siesta key vs anna maria island for families; where to stay anna maria island siesta key
- audience pattern: comparison researcher, top-of-funnel, 2–6 months before travel
- proof source: GSC domain property; supplied OpenSEO rank tracker dated 2026-10-15 (desktop ranks: "anna maria island vs siesta key" #11, "anna maria island or siesta key" #10) (unverified — needs receipt); Hub distances (`seascape-properties.md`)
- required internal links: Bradenton private-pool homes (Dockside Dreams, The Oasis) for the AMI side; Sarasota Luxe for the Siesta side; `/guides/bradenton-vs-sarasota/`
- CTA target: preserve the primary `guide_book_direct_click`; current stay cards mostly use `guide_stay_click` to `/stays/`, with one card leading to Sarasota Luxe. Any destination change is proposed, not current behavior.
- anti-claims: never place a Seascape home on AMI or Siesta Key; the homes are a mainland Bradenton or downtown Sarasota base; no licence or revenue claims; pool heat is never included (optional $40/night, whole stay before arrival, all remaining nights after arrival; approved long-stay flat rates remain valid)
- hypothesis: preserve and evaluate the existing direct answer, verdict and comparison structure; make only Gate 0-supported refinements to recover clicks toward the prior 28-day level. Canonical/redirect repair is conditional on newer conflicting evidence
- primary event: `guide_book_direct_click`
- guardrail event: `guide_stay_click`
- entry criteria: Gate 0 filled; require newer conflicting evidence before proposing a redirect repair because current source owns the canonical/301 and the October 2 live check returned 301
- readback window: first 7 complete days after deploy, then an additional 28-day experiment readback
- decision rule: read clicks, `guide_book_direct_click` and `guide_stay_click` after the first 7 complete days; at 28 days, keep if clicks recover versus the four unchanged winner-guide controls and the primary CTA and stay-click events do not fall

Use the same four unchanged winner-guide controls named in `2026-10-property-pages-rescue.md`; exclude this AMI-versus-Siesta guide from the control group.

## Gate 0 Rescue Block

| Field | Answer |
| --- | --- |
| Target query family | "anna maria island vs/or siesta key" comparison queries |
| Searcher intent | Comparison |
| Current Seascape URL | `/guides/anna-maria-island-vs-siesta-key/` (plus no-slash variant) |
| SERP observed date | 2026-10-15 |
| SERP stale after | 2026-10-22 |
| Attack status | TBD |
| Query variants inspected | TBD |
| SERP source | TBD |
| Competitor URLs inspected | TBD |
| Content gap and Seascape answer | TBD |
| Design/format strategy | TBD |
| Seascape proof available | TBD |
| Tools/plugins used | TBD |
| Decision and reason | TBD |
| Current proof | GSC domain property, all variants: clicks 51 → 29, impressions 6,712 → 5,002 (2026-08-21–09-17 vs 2026-09-18–10-15). The 2026-09-24–30 operator report historically flagged `canonical_variant_leak` and lacked its final requested GSC day. |
| Top visible competitors | **(unverified — needs receipt)** Capture three actual organic SERP competitors and their inspected URLs. |
| Competitor angle | **(unverified — needs receipt)** |
| Visual/format gap | **(unverified — needs receipt).** Evaluate the existing comparison structure before proposing a side-by-side table or subtopic changes; an idea is not evidence of a competitor gap. |
| Seascape gap | Preserve and evaluate the existing direct answer, verdict, and comparison structure. Existing decorative hero images use `alt=""` inside `aria-hidden="true"`; this is not an alt-text defect. A currently broken slash/no-slash redirect is **(unverified — needs receipt)**. |
| Search fit | Winner-portfolio member; feeds stay clicks to Bradenton and Sarasota homes |
| Local/GBP proof | N/A (comparison guide) |
| AEO/readback note | `npm run eval:aeo` invokes a paid provider; do not run it without separate authorization. |
| Recommended action | Preserve and evaluate the existing direct answer, verdict, comparison structure, CTA handoffs and decorative hero alt treatment; add subtopic H2s or revise the stay box only if Gate 0 evidence supports the change. Repair canonical/redirect behavior only with newer evidence that conflicts with existing source ownership and the October 2 recorded 301. |

## Draft copy rules
- Stay box wording: "Seascape's homes are a mainland base: Dockside Dreams is 2.9 mi (about 10 min) from Bradenton Beach on the AMI side, and Sarasota Luxe is about 10 min (3 mi) from Siesta Key and Lido Key." Hub distances only.
