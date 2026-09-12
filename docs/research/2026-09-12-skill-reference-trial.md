# CRO reference improvements and performance guidance trial

## Decision

Sawyer requested a performance-guidance trial, selected form checks in `page-cro`,
and removal of irrelevant SaaS experiment examples on 2026-09-12.

Keep the sixteen active skills. Add the form reference and replace the broad
experiment catalog with guest/owner decision examples. Do not promote the
performance candidate: the bounded comparison showed no decision advantage over
the existing instructions. This is not evidence that performance guidance can
never help; it is insufficient evidence for another active reference now.

## Performance comparison

Base: `ac8a56e23c6ced7ca05eb04d034f46b624e0387f`. Two separate Luna sessions at
medium effort received the same three synthetic cases and permitted repo reads.
One used current guidance; the other also read the candidate reproduced below.
Neither could edit, use the network, install tools, or change runtime. Correct
conclusions and next actions determined the verdict; verbosity and speed did not.

Permitted source: `package.json`, `lighthouserc.js`,
`scripts/perf/pagespeed-insights-status.js`, the `page-cro` and `design-review`
roots, and `docs/process/agent-evidence-routing.md`.

| Case | Input | Required decision | Existing | Candidate |
|---|---|---|---|---|
| Lab/field distinction | PSI available; LCP 4200ms, CLS .15, TBT 180ms; URL CrUX absent, origin flag true; repo budget passes | Reject good route-level CWV/field-INP claim; obtain valid route field evidence | Correct | Correct |
| Cause isolation | Image discovered 100ms, downloaded 350ms; hero hidden until widget callback 3100ms; LCP 3150ms; widget CPU task 450–3000ms | Inspect visibility/startup dependency; preserve booking behavior; reject preloading every photo and adding RUM for this diagnosis | Correct | Correct |
| Invalid comparison | Before: three cold mobile loads 3.2/3.4/3.6s; after: one warm desktop load 1.8s; deployed five minutes ago; origin CrUX unchanged | Reject improvement claim; rerun equivalent mobile/cold conditions and distinguish future field evidence | Correct | Correct |

Both responses distinguished local budgets from field proof, located the render
delay, rejected unnecessary tool expansion, and required equivalent follow-up
measurements. The candidate explicitly requested median and range; the baseline
requested at least three equivalent runs but did not name that reporting detail.
That is a useful presentation difference, not a changed correctness decision.

Limitations: one response per arm, three synthetic cases, one model, no blind
statistical grading, no live trace or performance repair. This does not measure
Astra performance, real visitor impact, or general task reliability. No reduction
in cost or improvement in performance is claimed. No new performance skill,
monitor, dependency, telemetry, or production change resulted.

## Form and experiment changes

`page-cro` now points form-friction tasks to checks for field purpose, accessible
entry, failed/pending/accepted states, retries, retained values, and existing
submission contracts. Tests use synthetic local fixtures after confirming the
handler cannot send to a live recipient. Claims need source support; personal
field values stay out of telemetry.

A separate read-only scenario asked the changed skill to handle a form that loses
values after a 500 response, plus requests for fewer fields, an unsupported
privacy promise, an unsupported completion-time claim, and email values in
analytics. It selected the bounded failed-state repair and local proof, required
receiving-workflow evidence before removing fields, rejected unsupported claims,
and kept personal data out of events. It found no authority regression or SaaS
misrouting. This tests guidance application; no real form was changed or tested.

The optional experiment reference now uses property selection, availability,
guide-to-stay paths, booking handoff, owner proof, and inquiry completion. It
retains source/measurement requirements, the design lane, internal-link proof,
and existing experiment activation rules. Generic trials, demos, software
pricing tiers, SaaS reviews, and broad sitewide experiment catalogs were removed.

## Sources

- [Web Quality Skills measurement reference](https://github.com/addyosmani/web-quality-skills/blob/afa8da942115f2961fdbfa80807ea0b232ff6c00/skills/performance/references/MEASUREMENT.md),
  Addy Osmani, MIT, inspected 2026-09-12. Also read the performance and Core Web
  Vitals roots at the same revision. Only diagnostic concepts informed the trial;
  no donor scripts, runtime, frameworks, or default budgets were adopted.
- [Corey Haines form reference](https://github.com/coreyhaines31/marketingskills/blob/main/skills/cro/references/form.md),
  MIT, inspected 2026-09-12, blob `470aeb11108c4a6ed34758b471889090034ae73d`.
  Local prose adapts selected concepts; numerical lift estimates, generic privacy
  promises, enrichment, and prescribed layouts are excluded.

## Performance candidate used only in the trial

The following is retained to make the comparison reviewable. It is not an active
skill or a new required workflow.

```markdown
# Seascape performance diagnosis

Use for a slow load or interaction, an unexpected layout shift, or conflicting
performance measurements. Diagnose the affected route before choosing a fix.

Read current scripts in package.json, the Lighthouse configuration, and the
existing performance helpers. Use the repo's evidence-routing rules and installed
tools. Keep existing budgets; they are regression limits, not field thresholds.

## Evidence

Record URL, route versus origin scope, device, observation window, tool version,
network/CPU settings, cache and consent state with each result. Prefer route-level
field evidence when available. Origin-level data is context for the route;
missing field data is unavailable, not a pass. A PageSpeed helper's availability
flags do not contain metric percentiles: inspect its returned values before
making a field claim. Source alone supports a hypothesis, not a measured failure.

A browser trace or injected observer describes one session. A Lighthouse load is
a lab navigation; its TBT is not field INP. Field measurements aggregate actual
visits and cannot validate a deployment made minutes ago. Compare like-for-like
lab runs; use at least three equivalent loads and report median and range when
making a headline before/after claim. An unmatched warm-cache run cannot prove
improvement over a cold-cache baseline.

## Diagnosis

Use the trace to isolate the failing metric. For LCP, separate server time,
resource discovery, download, and render delay. Add preload only when delayed
discovery is demonstrated; compressing an already-fast resource may miss the
cause. For INP, reproduce the specific interaction and distinguish waiting for
the main thread, handler work, and presentation delay. For CLS, identify the
trigger and affected element rather than assuming the shifted element caused it.

Change the smallest implicated source or asset. Preserve booking actions,
form completion, consent, and approved property imagery. New telemetry,
credentials, deployment, cache-policy changes, or third-party integrations keep
their existing ownership and authorization; a performance audit does not enable
them. Use equivalent lab verification plus affected interaction/visual proof.
Report measured results, causal evidence, remaining hypotheses, and any pending
field verification separately. If tools are unavailable, give the exact missing
measurement without inventing results or installing a new stack.

Adapted concepts from Addy Osmani's MIT Web Quality Skills measurement reference,
revision afa8da942115f2961fdbfa80807ea0b232ff6c00, inspected 2026-09-12:
https://github.com/addyosmani/web-quality-skills/blob/afa8da942115f2961fdbfa80807ea0b232ff6c00/skills/performance/references/MEASUREMENT.md
```
