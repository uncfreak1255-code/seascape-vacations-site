# Brief: owner money link gap cleanup

## Content Gate Inputs

- persona: Florida vacation-rental owners comparing fee drag, platform costs, and operator fit before they switch managers or keep self-managing.
- primary keyword: florida vacation rental management fees
- secondary keywords: florida vacation rental taxes, sarasota vacation rental management, florida vrbo management
- audience pattern: owner-support pages with adjacent intent should feed the owner-money pages without reopening a rewrite batch.
- proof source: 2026-05-22 owner-money On-Page pilot findings plus current repo source inspection of the feeder pages.
- required internal links: /property-management/vacation-rental-management-fees-florida/, /property-management/vrbo-management-services-florida/
- CTA target: keep the existing owner CTA path on each page; no CTA rewrite in this branch.
- anti-claims: no new fee-savings claims, no legal or tax advice claims, no flat-fee messaging, and no GSC performance interpretation beyond the current freshness gate.

## Why This Batch

- what changed in the data: the read-only owner-money pilot surfaced only two keeper actions worth shipping now, both narrow feeder-link gaps into existing owner-money pages.
- why this cluster wins now: this is signal cleanup on already-live owner pages, not a new owner rewrite batch.
- what should explicitly wait: owner CTR rewrites, page-CRO rewrites, new owner-page volume, and any broader SEO expansion until `docs/status/next-batch.md` opens the next batch.

## Search Operator Read

- source reads used: `docs/status/next-batch.md`, `docs/status/open-risks.md`, current source inspection of `src/_data/seoPages.json`, and the 2026-05-22 owner-money pilot memo.
- URLs inspected: `/property-management/vacation-rental-taxes-florida/`, `/property-management/vacation-rental-management-fees-florida/`, `/property-management/vacation-rental-management-sarasota/`, `/property-management/vrbo-management-services-florida/`
- main evidence: both feeder pages already speak to adjacent owner intent, but neither currently routes that traffic into the stronger money page for the same decision.
- competitor pages inspected for demand patterns, not copied topics: none; this branch is a source-truth link cleanup, not a topic expansion pass.
- question-tool language worth preserving in customer wording: none.
- GSC/GA4 evidence that supports building, rewriting, holding, or killing this cluster: `owner_money` remains `blocked by freshness` with combined impressions `146`, so this branch stays strictly surgical and does not reopen the rewrite lane.

## Cluster In Scope

- canonical winner URL(s): `/property-management/vacation-rental-management-fees-florida/`, `/property-management/vrbo-management-services-florida/`
- feeder pages: `/property-management/vacation-rental-taxes-florida/`, `/property-management/vacation-rental-management-sarasota/`
- aliases or retired URLs: none in scope
- money destination: the two canonical owner-money pages above
- active lane: owner acquisition

## Source And Proof Constraints

- property truth needed: none
- owner proof asset needed: none new; preserve the current page-specific proof surfaces
- claims that are off-limits: tax or licensing guarantees, exact fee savings, legal advice, and any new platform-performance claims
- Seascape-specific proof or local experience this page can add beyond generic competitor coverage: existing local owner-economics framing only; do not invent fresh proof for this branch

## Page Builder Tasks

- source files likely to change: `src/_data/seoPages.json`
- redirect or schema work: none
- internal-link or CTA work: add one contextual link from the Florida tax page to the fees page and one contextual link from the Sarasota management page to the VRBO page
- money CTA and downstream tracking event to verify: existing owner CTA only; no tracking changes

## Voice Editor Checklist

- tone risks: do not let the new links read like bolted-on SEO anchors
- generic or mechanical patterns to kill: no "learn more" filler and no abstract management jargon
- proof or specificity checks: keep the added sentences tied to the surrounding owner decision, not generic SEO parity
- customer wording kept where it sounds natural; SEO-tool phrasing removed where it sounds manufactured: yes

## Release Gate Checklist

- routes to smoke test: `/property-management/vacation-rental-taxes-florida/`, `/property-management/vacation-rental-management-fees-florida/`, `/property-management/vacation-rental-management-sarasota/`, `/property-management/vrbo-management-services-florida/`
- commands to run: `npm run lint:content`, `node --test scripts/enforcement/content-voice.test.js scripts/enforcement/owner-acquisition.test.js`, `npm run build`, `npm run verify:links`
- regression risks to watch: awkward sentence flow around the new links, broken rendered anchors, or scope creep into broader owner copy changes

## Done When

- both contextual feeder links exist in rendered output
- the copy still reads naturally in context
- local internal-link verification passes with no broken links
- the branch still reads as cleanup, not a fresh owner rewrite

## Post-Reread Outcome

- reread window used: pending post-deploy owner-money reread
- crawl freshness result: pending
- actual impressions, CTR, position, and downstream event counts: pending
- decision taken: wait
- next branch slug or explicit wait state: `owner-ctr-rewrite-round-2` only if `docs/status/next-batch.md` moves to `open next batch`

## Not In Scope

- another owner-page rewrite
- site-wide internal-link sweeps
- new owner support pages or entity-expansion work
- GSC performance interpretation beyond auth and capability checks in this repo
