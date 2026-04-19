# Seascape Content Calendar Refresh

Date: 2026-04-18
Window: 12 weeks
Operating rule: this is a branch-and-read calendar, not a publishing quota

## Hard Read

The calendar should follow the measured gates, not your impatience.

Right now the sequence is:

- finish guide convergence
- queue owner CTR work behind the gate
- repair stay-page quality
- only then consider expansion

Anything else is activity theater.

## Calendar Principles

- fix ranking pages before creating more ranking targets
- use guides as feeders, not vanity wins
- tie every new page to a named money-page destination
- hold stay expansion until AMI winners prove they can push users deeper
- do not let entity work outrun commercial-page quality

## Week-by-Week Plan

## Weeks 1-2: Convergence and verification cleanup

### Week 1

- finish `winner-guide-consolidation`
- verify canonical winners across:
  - `src/_redirects`
  - `src/sitemap.njk`
  - `src/llms.txt`
  - in-body guide links
- harden guide CTA and body-link handoffs into:
  - `/stays/anna-maria-island-vacation-rentals/`
  - `/property-management/vacation-rental-management-fees-florida/`
  - `/property-management/vacation-rental-licensing-florida/` where relevant

### Week 2

- fix the stale live-smoke owner-content assertion
- add owner priority routes to `llms.txt`
- rerun the targeted operator read after recrawl time

## Weeks 3-4: Owner CTR gate and snippet/CRO prep

### Week 3

- only open `owner-ctr-rewrite-round-2` if the 7-day gate in `docs/status/next-batch.md` clears
- if the gate does not clear, do not invent owner-page work; wait and reread
- draft page-level CTR hypotheses for:
  - fees
  - licensing
  - VRBO

### Week 4

- if the owner gate is open, rewrite titles and descriptions only on pages whose page-level read proves a snippet problem
- strengthen above-the-fold proof, assumptions, and CTA framing on the fees and licensing pages
- keep VRBO as a support and conversion page unless the query cluster justifies more

## Weeks 5-6: Shared proof and owner-page hardening

### Week 5

- publish or refresh the owner proof asset so fees and licensing can cite the same benchmark logic
- make sure proof language is reusable and does not drift across pages

### Week 6

- extend internal links from owner-education guides and related owner pages into the proof asset and owner money pages
- add visible reviewed-by and updated-date treatment to the top owner pages

## Weeks 7-8: Stay-money repair

### Week 7

- improve `/stays/anna-maria-island-vacation-rentals/` performance and image handling
- tighten commercial copy around fit, tradeoffs, and why a user should go deeper

### Week 8

- rebuild `/stays/anna-maria-island-beachfront-rentals/` around honest fit instead of implied inventory breadth
- improve CTA handoff to property pages
- use operator and event data to confirm whether the problem is page quality or deeper offer mismatch

## Weeks 9-10: E-E-A-T and AI readiness cleanup

### Week 9

- add visible reviewer/date treatment to:
  - top comparison guides
  - fees
  - licensing
  - VRBO
  - the two priority AMI stay pages

### Week 10

- review `sameAs`, author, and entity surfaces
- only expand them if they are real and maintainable
- keep `llms.txt` aligned with the current money-page priorities

## Weeks 11-12: Controlled expansion only if the readbacks move

### Allowed if gates clear

- one next stay page, with Holmes Beach first
- one additional comparison page only if it clearly feeds a money page

### Not allowed

- random new guide volume
- broad owner page families
- broad stay-page sprawl
- AI or entity projects that do not help a current money page

## Priority Order

1. winner-guide convergence
2. stale-smoke fix
3. owner CTR rewrite, gated
4. owner proof asset and owner-page hardening
5. AMI stay-page performance and CRO
6. reviewer/date coverage on top pages
7. controlled expansion only after proof of movement

## KPI Checkpoints

Review every 2 weeks:

- overall CTR
- owner money CTR and clicks
- stay-money impressions, clicks, and `stay_view_property_clicks`
- priority guide-family variant leakage
- AMI stay-page LCP
- coverage of owner and guest priority routes in `llms.txt`

If those do not move, expansion stays frozen.
