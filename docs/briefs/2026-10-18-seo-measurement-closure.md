# Friday pilot action: explicit campaign medium precedence

## Decision and owner

The October 18 joined Analytics receipt covers October 10–16 and returns
`HOLD_AND_REREAD`, with no rescue candidate. It supersedes the October 12
canonical read, preserving the October 16 review as dated provenance. Hold
growth expansion and retain existing guides. A deterministic measurement repair
can proceed independently of that growth threshold.

The existing OpenSEO coordinator is the sole mutation owner and merger for
`codex/seo-closed-loop-20261018`. The completed Site and Analytics audit lanes
are preserved. The current coordinator accepts the action; no competing owner
or scheduler is created. Follow `docs/process/batch-workflow.md` for closure.

## Hypothesis and baseline

At base `4a8880358588f5adccfe8859d87f1a2b3822e7c7`, a Google referrer with
`utm_source=google&utm_medium=cpc` yields `source_context=organic_search`.
The same function runs on funnel events. Explicit campaign media should take
precedence over referrer-only organic inference. Preserve the existing
`direct_or_unknown` classification and raw UTM fields for these campaigns;
this repair introduces no new channel taxonomy or downstream schema.

Primary technical outcome: the campaign fixture no longer becomes organic.
Guardrails: untagged Google and explicit organic remain organic; existing AI
context, campaign fields, privacy filtering and booking handoff remain intact.
The regression executes the actual tracking runtime offline and failed before
the fix. Required Site build/release checks and independent exact-head review
govern source closeout. No visible page, event name or tracking permission changes.

## Business outcome and coverage

Reliable separation of campaign and organic funnel activity is a prerequisite
for evaluating guest handoffs and owner acquisition. The fixture proves the
classification error, not active paid traffic, GA4 default channel corruption,
historical contamination, bookings or revenue. Private qualified-owner,
reply/assessment/signed outcomes and reviewed reservation attribution have not
been reconciled by this read; their coverage is unknown, not zero.

## Release, rollback and evaluation

Source merge is pending the normal consolidated release. Verify the deployed
script's classification offline using the same fixtures before calling it live;
avoid synthetic traffic in production Analytics. Rollback is a source revert
of this action through the same review/release lane, not a manual deploy.

Next evaluation: the existing October 23 Friday review. Require seven complete
post-release days with compatible filters, source grain and coverage before a
commercial comparison; otherwise record `insufficient evidence` and the next
existing Friday. A deterministic classification pass supports technical keep
only, not commercial lift. Close with `keep`, `revise`, `revert` or `insufficient
evidence`, preserving deployment and measurement limits in the private handoff.
