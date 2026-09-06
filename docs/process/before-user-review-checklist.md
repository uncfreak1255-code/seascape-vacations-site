# Before User Review Checklist

Use this before asking a human to review any route, UI, copy, or design work.

The point of this checklist is simple: the user is not the first QA pass.

## 1. Build identity check

- [ ] I rebuilt the current branch locally.
- [ ] I am reviewing the current branch output, not stale `_site` output from another task.
- [ ] I know which local URL or preview URL the user should review.

## 2. Fresh-route check

For each route I plan to show the user:

- [ ] I opened it in a fresh browser context or new tab after rebuild.
- [ ] The route shows the expected heading and main content above the fold.
- [ ] The route is not showing a stale or obviously broken state.

Minimum expectation for UI review:

- [ ] homepage
- [ ] changed index/listing page
- [ ] one representative detail page

## 3. Console and network check

- [ ] No blocking JavaScript error is present on the reviewed route.
- [ ] No critical image, CSS, or script 404 is present on the reviewed route.
- [ ] Known non-blocking issues, if any, are written down before asking for review.

## 4. Visual sanity check

- [ ] Primary cards, titles, and CTA buttons render.
- [ ] Key images load.
- [ ] The reviewed route does not rely on placeholder, empty, or broken components.
- [ ] If I changed layout, CSS, spacing, typography, imagery, component structure, or visual hierarchy, I captured fresh desktop and mobile screenshots before asking for review.
- [ ] If I changed layout, CSS, spacing, typography, imagery, iconography, motion, CTA treatment, or visual hierarchy, I ran the repo `design-review` workflow on the affected route family before asking for review.
- [ ] If the visual diff or screenshot proof looked wrong, I used `docs/runbooks/failed-visual-gate.md` before asking the user to review it.
- [ ] If I am calling the change `AI-search-ready` or `citation-ready`, I can point to the visible answer-first block or source module and the machine-readable surface separately.
- [ ] For long pages, I captured enough screenshots to cover each changed visual section when one full-page capture is not trustworthy.
- [ ] I reviewed the screenshots myself and called out any capture artifact before asking the user to look.
- [ ] If the PR is headed to merge, I included the desktop/mobile visual proof set in the PR thread before requesting merge approval.
- [ ] The user is being asked for design feedback, not bug discovery.

## 5. Copy sanity check

- [ ] I ran visible reader copy through **Draft the copy**, then **Remove internal wording**, then **Check voice and specificity**.
- [ ] The page intro leads with the visitor's problem, decision, or tradeoff.
- [ ] Methodology, source limits, and "planning estimate, not a quote" language live in a proof/source section below the intro.
- [ ] Visible guest/owner copy does not use gray internal phrasing like `keeps X separate`, `planning math`, `marketplace-fee exposure`, `source-bounded`, `accepted formulas`, `proof boundaries`, `proven cost`, `likely cost`, or `missing information`.
- [ ] Visible guest/owner copy does not lean on instruction-template framing like `Use this when`, `Use this if`, `Read this if`, `Open this page if`, or other helper-note phrasing that sounds like a session draft.
- [ ] Any proof-heavy paragraph still sounds like Seascape: direct, specific, locally grounded, and useful.

## 6. Handoff standard

When asking for review, state:

- what changed
- which exact URLs to review
- which desktop and mobile screenshots back the review
- whether any AI-search proof in this review is visible, machine-readable, or still analytics-only
- what is still known-bad, if anything

Do not ask for review if the honest status is "probably works."
