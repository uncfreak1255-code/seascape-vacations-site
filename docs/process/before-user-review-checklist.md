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
- [ ] The user is being asked for design feedback, not bug discovery.

## 5. Copy sanity check

- [ ] The page intro leads with the visitor's problem, decision, or tradeoff.
- [ ] Methodology, source limits, and "planning estimate, not a quote" language live in a proof/source section below the intro.
- [ ] Visible guest/owner copy does not use gray internal phrasing like `keeps X separate`, `planning math`, `marketplace-fee exposure`, `source-bounded`, `accepted formulas`, or `proof boundaries`.
- [ ] Any proof-heavy paragraph still sounds like Seascape: direct, specific, locally grounded, and useful.

## 6. Handoff standard

When asking for review, state:

- what changed
- which exact URLs to review
- what is still known-bad, if anything

Do not ask for review if the honest status is "probably works."
