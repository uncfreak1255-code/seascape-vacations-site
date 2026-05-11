# GEO Scorecard Rerun

Date: 2026-05-11
Baseline compared: `docs/reports/2026-03-30-geo-aeo-analysis.md` and `docs/reports/2026-03-15-geo-priority-audit.md`
Scope: owner-money pages, comparison winners, `robots.txt`, `llms.txt`, GSC inspection, and May 4-10 joined search/funnel read.

## Score

| Surface | March score | May 11 live score | May 11 branch score | Read |
| --- | ---: | ---: | ---: | --- |
| Overall GEO readiness | 73 | 76 | 79 | Technical access remains strong; owner benchmark discoverability improves only after this branch ships. |
| Google AI / AI Mode readiness | 78 | 79 | 81 | Strong comparison pages and fresh crawls, but the best-time guide still has variant demand in GSC. |
| ChatGPT web-search readiness | 71 | 75 | 78 | `robots.txt` and `llms.txt` are live; branch adds the owner benchmark to the machine-readable map. |
| Perplexity readiness | 69 | 73 | 76 | Passage quality improved, but off-site entity/citation density is still the ceiling. |

Scores are heuristic from observable site/search signals, not direct AI citation logs.

## Checks Rerun

- Live `robots.txt`: `200`; still explicitly allows `GPTBot`, `OAI-SearchBot`, `ChatGPT-User`, `ClaudeBot`, `PerplexityBot`, and `Google-Extended`.
- Live `llms.txt`: `200`; still includes property-management and comparison guide sections, but live output does not yet include the owner benchmark link.
- Branch `llms.txt`: now includes `Owner Fee + Revenue Leak Benchmark` under Property Management.
- GSC URL Inspection:
  - `/property-management/vacation-rental-management-fees-florida/`: `Submitted and indexed`; last crawl `2026-05-06`; Google canonical matches user canonical.
  - `/property-management/vacation-rental-licensing-florida/`: `Submitted and indexed`; last crawl `2026-02-24`; Google canonical matches user canonical.
  - `/property-management/vrbo-management-services-florida/`: `Submitted and indexed`; last crawl `2026-02-24`; Google canonical matches user canonical.
  - `/guides/best-time-visit-anna-maria-island/`: `Submitted and indexed`; last crawl `2026-05-07`; Google canonical matches user canonical.
  - `/guides/best-time-to-visit-anna-maria-island/`: `Page with redirect`; Google canonical is `/guides/best-time-visit-anna-maria-island/`.
  - `/guides/best-time-visit-anna-maria-island/index.html`: `URL is unknown to Google`.
  - `/guides/bradenton-vs-sarasota/`: `Submitted and indexed`; last crawl `2026-05-10`.
  - `/guides/anna-maria-island-vs-siesta-key/`: `Submitted and indexed`; last crawl `2026-05-09`.
- May 4-10 joined report: owner-money cluster had `340` impressions, `1` click, `0.29%` CTR, average position `5.66`; best-time guide still had `3` GSC variants.
- Web-search snapshot:
  - Query `Anna Maria Island vs Siesta Key which is better vacation` surfaced Seascape, but as the `.html` variant. That confirms the canonical variant leak still has search-surface residue.
  - Query `Florida vacation rental management fees owner net revenue` surfaced Seascape alongside fee-focused competitors such as Florida First Class Villas, Rental Network Software, Weekender Management, Titan Beach Rentals, and FL Vacation Rentals.

## Read

The March diagnosis still holds, but the weak point has moved. Technical GEO access is no longer the issue. The active problem is owner-market citability plus canonical identity.

The owner fee benchmark is the strongest conquest asset because it gives AI and search systems something competitors mostly do not have: a local owner-economics proof object tied to management fees, OTA fee drag, direct payment cost, and owner net revenue. This branch promotes it in the owner template and `llms.txt`, which should raise the owner-money GEO score once deployed and crawled.

The canonical leak is not theoretical. Search still exposed the AMI vs Siesta `.html` variant, and GSC still reports the best-time guide as `3` variants. The new redirect coverage closes the missing `index.html` aliases and documents the best-time winner family so the leak has an enforcement gate.

## Next Gate

After deploy, re-inspect the changed owner and guide URLs. Do not call CTR movement until:

- the fee, licensing, and VRBO owner pages have a last crawl date after this deploy;
- the best-time variants drop from GSC reporting;
- the owner benchmark appears in live `/llms.txt`; and
- owner-money impressions remain high enough to judge, ideally `>= 1000` combined in the read window.
