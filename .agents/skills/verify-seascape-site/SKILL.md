---
name: verify-seascape-site
description: Verify Seascape Vacations guest booking, guide handoff, email capture, or owner inquiry journeys against the local website with browser fixtures.
---

# Verify Seascape Site

Run from the Site task worktree. Record `git rev-parse HEAD` and
`git status --short`. Use the Node version in `.nvmrc` and the setup
in `.github/workflows/e2e-flows.yml` if dependencies or Chromium are missing.

Run `npm run test:e2e` and save output and exit status outside the checkout.
The repository runner builds the site, starts an ephemeral loopback server,
and runs the journeys on desktop and mobile Chromium.

| Journey | Existing proof |
| --- | --- |
| Guest search, availability, booking handoff, and property events | `tests/e2e/site-flows.e2e.ts` checks how dates, party size, availability and property identity reach a fixture checkout. |
| Owner inquiry and guest email capture | The same suite exercises validation, interception, and retry against fake responses. |
| Guide and collection handoff | `tests/e2e/guide-handoff.e2e.ts` and the guide detour case in `site-flows.e2e.ts` check onward navigation and preservation of trip details. |

Keep the existing network interception enabled. Use synthetic inputs and
the local runner for checkout and form submission journeys. Keep screenshots,
traces and server logs from the run when investigating a failure.

Report the revision, tested journey, both browser targets, exit status and
receipt location. If the journey is missing, report the coverage gap.
These journeys prove local behavior with intercepted external services.
Production deploy, live attribution and delivery each have their own proof
in the repository's release procedures.
