# Page ledger rules

The machine-readable ledger is `docs/status/page-ledger.json`. This file holds
the field rules so that JSON can stay under the staged-file size gate.

Pages settling after a published SEO change. While an entry is inside its settle
window, `scripts/enforcement/page-settle-gate.js` fails a release range that
edits its sources unless a commit carries a `Settle-Override: <reason>` trailer.
Add an entry in the PR that ships a title, meta, heading or body change meant to
move rankings; the gate reads the JSON at the range base, so the shipping PR is
not blocked by its own entry. Remove an entry once its window has passed and the
readback is recorded.

Verdict tracking (Sawyer, 2026-11-20, agent-issues #80): each entry also carries
`kind`, `baseline`, `verdictDue` (rounded up to a Monday; the Monday verdict task
judges it), optional `finalVerdictDue`, and `verdict` (null until written: keep,
keep-no-lift, revert, or replaced). A revert needs evidence of harm, such as the
brief's position-loss limit or zero clicks above its impression floor; no lift
means keep-no-lift. One verdict per page: a later change on the same route
replaces the earlier entry's verdict. A harm verdict on a held guide or new page
goes to Sawyer as a proposal.

`shipped` and `live` are the America/New_York date of the first production
publish that contains the change; `shipped` is the settle-gate switch; leave it
null for shared source files and put the live date in `live`. Fact fixes are in
`liveChecks`, which the gate does not read.
