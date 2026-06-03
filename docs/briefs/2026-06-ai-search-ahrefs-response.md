# Brief: AI Search Ahrefs Response

## Content Gate Inputs

- persona: Seascape operators deciding what AI-search work belongs on the public site, in analytics, in hub strategy, and in distribution
- primary keyword: best Anna Maria Island rental companies
- secondary keywords: book direct Anna Maria Island rentals, Bradenton vs Sarasota vacation rentals, Sarasota vacation rental management, vacation rental management fees Florida, AI search vacation rentals
- audience pattern: guests and owners who ask AI/search systems for local rental-company recommendations, booking-direct guidance, Gulf Coast comparison advice, or owner-management economics
- proof source: Ahrefs AI-search studies shared by Tim Soulo, Google Search Central AI feature docs, live Seascape AI endpoints, current `docs/status/next-batch.md`, and one future `seascape-analytics` AI visibility receipt
- required internal links: `/guides/best-vacation-rental-companies-ami/`, `/guides/bradenton-vs-sarasota/`, `/guides/anna-maria-island-vs-siesta-key/`, `/stays/book-direct-anna-maria-island/`, `/property-management/`, `/research/owner-fee-revenue-leak-benchmark-2026/`
- CTA target: direct-booking stay pages for guest intent; revenue teardown / owner inquiry for owner intent; analytics receipt before any claim of AI citation lift
- anti-claims: do not claim schema causes AI citations, do not claim AI visibility proves bookings or owner demand, do not claim Seascape is on Anna Maria Island inventory unless the specific listing says so, and do not publish page volume from AI-search anxiety

## Trigger

Tim Soulo summarized recent Ahrefs AI-search findings: "best X" listicles are a major cited format, much of ChatGPT's citation set is not directly influenceable, some cited pages have no Google organic visibility, retrieved URLs and cited URLs differ, schema did not materially increase AI citations, YouTube mentions correlate strongly with AI brand visibility, AI Overviews reduce clicks on informational queries, AI Mode and AI Overviews often agree while citing different sources, and AI Overview source text changes frequently while the answer meaning stays stable.

This brief turns those findings into one bounded Seascape response. It is a planning and orchestration brief first. Public copy changes require a later build branch, current measurement proof, and the normal content gate.

## Current Repo Truth

- Live AI plumbing is already present and should not be treated as the missing lever:
  - `/ai-discovery.json`
  - `/.well-known/ai.txt`
  - `/ai/summary.json`
  - `/ai/service.json`
  - `/ai/faq.json`
  - `/llms.txt`
  - AI crawler allowances in `robots.txt`
- `docs/status/next-batch.md` currently blocks new owner, stay, guide, GEO, or SEO expansion from the latest joined operator read.
- The site already has a first-party listicle route at `/guides/best-vacation-rental-companies-ami/`.
- The strongest existing comparison-guide assets remain `/guides/bradenton-vs-sarasota/` and `/guides/anna-maria-island-vs-siesta-key/`.
- Schema remains useful for entity clarity, crawl eligibility, rich-result hygiene, and enforcement, but not as a standalone AI-citation growth tactic.

## Experiment And Readback Contract

- hypothesis: If an analytics-owned AI visibility receipt shows listicle, comparison, or proof-asset formats winning the target query family, then one bounded answer-first or proof-asset hardening batch should improve Seascape's citation readiness without implying any lift before the reread.
- primary event: analytics-owned AI visibility readback on the target query set, with cited URL and mentioned-brand movement read separately from downstream `booking_engine_handoff` and `owner_form_submit`.
- guardrail event: no public claim that schema, AI visibility, or cited placement already caused ranking, booking, or owner-demand lift, and no branch that drifts into broad AI-search page volume while `docs/status/next-batch.md` remains blocked.
- entry criteria: one machine-readable AI visibility receipt exists in `seascape-analytics`, the receipt recommends a bounded site or distribution action, and the chosen batch can name one target query family plus one target page family.
- readback window: the next weekly AI visibility receipt after the bounded batch ships plus the first post-crawl analytics reread that can separate cited URL, mentioned brand, referral click, and downstream conversion.
- decision rule: expand only if the reread shows cleaner cited-URL or mention movement on the target family without business-truth contradictions; otherwise rewrite the same asset once, hold, or kill the batch instead of opening new volume.

## Decision

Run a selective expansion, not a site-wide AI-search rebuild.

The site should support AI selection with clearer, fairer, better-sourced pages and machine-readable truth. The main new work is not more schema. The main new work is:

1. one analytics-owned AI visibility receipt,
2. one site-owned listicle/comparison hardening batch if the receipt supports it,
3. one distribution-owned brand/entity mention lane,
4. one review loop that separates retrieved, cited, mentioned, clicked, and converted.

## GStack CEO Review

Mode: selective expansion.

Keep the narrow site lane because owner acquisition and direct-book conversion remain the business bottlenecks. Expand only where the Ahrefs evidence changes the leverage:

- Add YouTube and third-party mention planning as distribution work, because Ahrefs found YouTube mentions and branded web mentions correlate more strongly with AI visibility than raw page count.
- Treat the existing "best AMI rental companies" page as the first possible site asset, because "best X" listicles are a major cited format.
- Reject broad AI file/schema sprawl, because Google says there are no extra AI-feature technical requirements and Ahrefs did not find meaningful schema-driven citation gains.
- Reject random guide volume while `docs/status/next-batch.md` remains freshness-blocked.

## GStack Engineering Review

Architecture split:

- `seascape-vacations-site` owns page source, canonical URLs, schema validity, internal links, AI endpoint truth, and deploy readiness.
- `seascape-analytics` owns AI visibility prompts, GSC/GA4 reads, citation/mention receipts, and attribution proof.
- `seascape-hub` owns durable strategy/canon only after reviewed evidence.
- distribution surfaces such as YouTube, local tourism profiles, partner/resource mentions, and creator outreach are off-site execution lanes; this repo may link to them only when live and verified.

State machine:

1. `receipt missing`: no public AI-search rewrite starts.
2. `receipt gathered`: classify query family, AI surface, cited URLs, mentioned brands, Seascape state, and competitor pattern.
3. `site candidate chosen`: exactly one of `answer-first rewrite`, `proof asset`, `distribution/entity`, or `local/GBP`.
4. `site batch built`: one brief, one branch, source edits only.
5. `release verified`: content lint, build, JSON-LD, links, route smoke, and screenshots if visible.
6. `reread`: analytics checks mention/citation/click/conversion movement after the crawl/AI observation window.

Failure controls:

- Do not infer a booking win from an AI citation.
- Do not infer an AI citation win from GSC clicks.
- Do not conflate retrieved URL, cited URL, brand mention, referral click, and conversion.
- Do not promote third-party outreach residue into site truth until the live surface exists.

## Attack Lane

### Phase 0: Baseline Proof

Owner: `seascape-vacations-site` read-only plus `seascape-analytics`.

Site proof already checked in this planning pass:

- live `/ai-discovery.json` parses as JSON
- live `robots.txt` allows AI crawlers
- live `/llms.txt` points to AI surfaces and key pages
- live `/guides/best-vacation-rental-companies-ami/` exists

Analytics receipt still needed before public copy changes:

- target query set:
  - best Anna Maria Island rental companies
  - best AMI vacation rental companies
  - book direct Anna Maria Island rentals
  - Bradenton vs Sarasota vacation rentals
  - Anna Maria Island vs Siesta Key rentals
  - Sarasota vacation rental management
  - vacation rental management fees Florida
- required fields:
  - AI surface checked
  - prompt/query
  - Seascape mentioned: yes/no
  - Seascape cited: yes/no
  - Seascape URL cited if present
  - competing brands mentioned
  - competing URLs cited
  - page format cited
  - whether cited page is influenceable, third-party, directory, UGC, homepage, app/store/profile, or owned content
  - recommended batch type

Gate to continue: one machine-readable receipt exists in `seascape-analytics` and recommends a bounded site or distribution action.

### Phase 1: First Site Candidate

Owner: `seascape-vacations-site`.

Likely first candidate: `/guides/best-vacation-rental-companies-ami/`.

Only proceed if the analytics receipt shows that AI systems or live SERPs favor listicle/comparison sources for AMI rental-company queries.

Build goals:

- make the methodology clearer and dated
- make competitor treatment fair enough to be credible
- add source links or source notes where claims depend on public evidence
- reduce self-ranking bias where it weakens trust
- strengthen the direct-booking next step without making the comparison feel like a disguised ad
- preserve Seascape's location boundary around Bradenton/near-AMI inventory

Not in scope:

- a new cluster of "best X" pages
- generic AI Overview copy
- FAQ/schema expansion for its own sake
- new visible claims about bookings, revenue, or AI citations

Release gate:

```bash
npm run git:preflight
npm run lint:content
npm run build
npm run verify:jsonld
npm run verify:links
```

Visible-change gate:

```bash
npm run proof:visual -- --routes /guides/best-vacation-rental-companies-ami/
```

If the visual proof tool does not support route args in the current repo state, run the repo's documented visual proof flow and capture desktop plus mobile screenshots for that route.

### Phase 2: Distribution And Entity Mentions

Owner: distribution lane, with strategy writeback only after proof.

Site-owned support assets:

- `/guides/best-vacation-rental-companies-ami/`
- `/guides/bradenton-vs-sarasota/`
- `/guides/anna-maria-island-vs-siesta-key/`
- `/research/owner-fee-revenue-leak-benchmark-2026/`
- `/ai-discovery.json`
- `/llms.txt`

Off-site candidate surfaces:

- YouTube video title, description, and transcript mentions for Seascape Vacations and the target page
- Bradenton Gulf Islands profile freshness
- local tourism/resource pages that already fit Seascape's guides
- travel creator/resource mentions for the two comparison guides
- owner/real-estate resource mentions for owner-management economics

Gate to treat distribution as live proof:

- live URL captured
- Seascape name visible or in transcript/description
- target page linked or brand mention recorded
- source date captured
- analytics receipt can reference it without relying on a chat summary

### Phase 3: Measurement Reread

Owner: `seascape-analytics`.

Reread separates:

- AI mention
- AI citation
- AI referral click
- GSC impression/click
- GA4 session
- guest capture
- booking-engine handoff
- owner CTA click
- owner form submit

Do not update `docs/status/next-batch.md` manually. Sync it only from the analytics next-batch decision receipt using the existing enforcement script.

## Proof Lane

Current verified proof from this planning pass:

- root `main` was clean and matched `origin/main` before worktree creation
- planning work happened in `.worktrees/ai-search-ahrefs-plan` on `codex/ai-search-ahrefs-plan`
- `npm run git:preflight` passed in the worktree
- `npm run lint:content` passed
- `npm run build` passed
- `npm run verify:jsonld` passed with 160 pages scanned and 697 JSON-LD blocks validated
- `npm run verify:links` passed with 160 pages crawled and all internal links valid
- `npm run verify:release` passed
- live `/ai-discovery.json` parsed
- live `robots.txt` showed AI crawler allowances
- live `/llms.txt` showed the AI endpoint and key-page inventory
- live `/guides/best-vacation-rental-companies-ami/` rendered with the expected comparison content

Proof still needed before shipping public changes:

- analytics AI visibility receipt
- content lint
- build
- JSON-LD validation
- internal-link validation
- screenshot proof if visible page copy/layout changes
- final diff review
- PR checks before merge
- live route proof after merge/deploy

## Review Checklist

CEO review:

- Does the plan chase the biggest leverage, or just the easiest site edit?
- Does it preserve owner acquisition and direct-book conversion as the business bottlenecks?
- Does it avoid broad page volume?
- Does it create a distribution lane for YouTube and third-party mentions?

Engineering review:

- Is every claim owned by the right repo or surface?
- Can each phase be verified with a command, receipt, live URL, or screenshot?
- Are retrieved, cited, mentioned, clicked, and converted kept separate?
- Is there a stop condition before public copy changes?

Content review:

- Is the listicle useful even if Seascape is removed from the table?
- Are competitor claims fair and sourceable?
- Does the first paragraph answer the decision fast?
- Are proof notes below the hook?

Release review:

- Did source edits avoid `_site/`?
- Did one active brief drive the batch?
- Did public copy run the visible-copy lane before merge?
- Did final verification include route-level proof?

## Done When

This orchestration batch is done when:

- this brief exists as the repo-owned plan,
- the branch has passed preflight, content lint, build, JSON-LD validation, and link validation,
- the diff is reviewed,
- the plan is committed on `codex/ai-search-ahrefs-plan`,
- and the next execution move is explicitly one of:
  - `wait for analytics AI visibility receipt`,
  - `open listicle hardening batch`,
  - `open distribution/entity batch`,
  - `hold because evidence does not justify site work`.

## Sources Checked

- Ahrefs: "Do Self-Promotional 'Best' Lists Boost ChatGPT Visibility?"
- Ahrefs: "67% of ChatGPT's Top 1,000 Citations Are Off-Limits to Marketers"
- Ahrefs: "We Tracked 1,885 Pages Adding Schema. AI Citations Barely Moved."
- Ahrefs: "Top Brand Visibility Factors in ChatGPT, AI Mode, and AI Overviews"
- Ahrefs: "ChatGPT May Scrape Google, but the Results Don't Match"
- Google Search Central: "AI features and your website"
