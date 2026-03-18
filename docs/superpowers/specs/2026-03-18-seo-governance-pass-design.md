# SEO Governance Pass Design

## Goal

Run a narrow remediation pass that fixes URL governance leaks, reduces homepage intent dilution, and strengthens the two highest-visibility comparison guides without turning the work into a full site refactor.

## Scope

In scope:
- Replace homepage alias links that still point to legacy `area-guide-*.html` routes.
- Remove known stale `.html` internal links from changed guide pages where slash routes are the intended canonical targets.
- Reduce the homepage to one real `h1` and remove embedded page-hero/article-like sections that make the homepage behave like multiple documents.
- Remove stale year-specific guide artifacts on the homepage such as `Updated 2025`.
- Rewrite title/meta/opening blocks for the top comparison guides:
  - `/guides/bradenton-vs-sarasota/`
  - `/guides/anna-maria-island-vs-siesta-key/`
- Add named author treatment and evidence-forward blocks on those guides so they look closer to the research pages than generic SEO articles.
- Rebuild, verify, resubmit the sitemap, and inspect top money URLs in GSC to establish the post-fix canonical baseline.

Out of scope:
- Full guide-template consolidation.
- Broad schema redesign across all pages.
- Off-site GEO/entity building.
- Repo guardrail installation or workflow-infrastructure changes.

## Approach

### 1. URL governance lock-down

Add a small regression check that fails if:
- the homepage still emits `area-guide-*.html` links
- changed guide files still emit known stale `.html` links where slash routes exist

This keeps the fix from being a one-time cleanup that drifts back in later.

### 2. Homepage intent cleanup

Treat the homepage as a homepage, not a stack of embedded guide pages. The page will keep booking and discovery sections, but only one document-level `h1` and no stale pseudo-article sections that compete with the real guides.

### 3. Winner-page upgrades

For the two comparison guides already earning impressions:
- sharpen titles/meta for CTR
- tighten the first 100 words so the answer lands immediately
- add named author treatment
- add evidence blocks/tables/cited claims modeled on the research section

### 4. Verification and GSC baseline

Run:
- repo preflight
- targeted regression checks
- `npm run build`
- live inspection of changed routes
- sitemap resubmission
- GSC inspection on top URLs and known legacy/alias URLs

## Risks

- Google may keep legacy canonical choices temporarily even after internal-link and sitemap cleanup.
- Homepage content removal may reduce weak informational impressions before it improves qualified traffic.
- CTR changes may lag even if snippet quality improves because search intent may still be partially mismatched.

## Kill Switches

- If Google still prefers alias URLs by `2026-04-18`, another source is still emitting them or Google is consolidating against a stronger historical signal.
- If homepage impressions still skew toward broad informational queries with near-zero CTR after 28 days, remove more guide-like content from the homepage.
- If CTR on the two upgraded guides does not improve by roughly 25-30% at similar positions after 4 weeks, the targeting/message is wrong, not just the snippet.
- If AI referral or citation-like discovery does not improve within 60 days, stop polishing on-site GEO mechanics and invest in off-site entity signals instead.
