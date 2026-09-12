# Form checks

Use the affected form and its submission handler to find friction. Follow the
existing field contract and use local fixtures for submit/error tests.

## Fields and entry

For each requested field, identify who uses it and why it is needed at this
step. Recommend optional or later collection only when the receiving workflow
can handle it. Field count alone does not establish a conversion loss.

Check visible labels, required/optional wording, instructions, suitable input
types and autocomplete values, keyboard order, and mobile entry. Placeholders
can give examples but must not replace labels. Test validation after an entry
or submit attempt without interrupting ordinary typing.

## Completion states

Exercise the relevant states with synthetic inputs and a local stub or the
repo's existing test fixture. Confirm the actual handler cannot contact a live
recipient before submitting test data.

| State | Check |
|---|---|
| Invalid entry | Specific error identifies the field and correction; error is associated with the control and keyboard focus reaches the error or summary |
| Pending request | Progress is clear; repeated activation cannot cause duplicate submissions; keyboard and assistive-technology users can perceive the state |
| Rejected or failed request | Entered values remain; failure is announced; retry is possible without a false success message |
| Successful request | Confirmation follows an accepted response; next step matches the service actually provided |
| Multi-step form, if present | Back/forward navigation retains intended values and validation; focus follows the current step |

Use `accessibility` for focus and announcement proof, and the existing rendered
review lane for layout changes. Verify both the interface and the submission
contract when field requirements or error handling change.

## Copy and measurement

Response times, privacy promises, testimonials, and expected effort need source
support before they appear in reader copy. Use approved owner proof and the
content gate. A form improvement does not authorize enrichment services,
additional personal-data collection, or changes to follow-up automation.

Distinguish submit attempts from accepted submissions. Use existing events and
analytics-owned evidence to assess abandonment or completion by device; keep
personal field values out of telemetry. Without that evidence, describe the
change as a usability fix or a conversion hypothesis, not a measured lift.

Return the observed problem, affected field/state, smallest correction, and
proof. Avoid redesigning the full page when one field or error state is at fault.

## Donor

Selected concepts from [Corey Haines's form CRO reference](https://github.com/coreyhaines31/marketingskills/blob/main/skills/cro/references/form.md),
MIT, inspected 2026-09-12 (blob `470aeb11108c4a6ed34758b471889090034ae73d`).
Adapted for Seascape; generic lift estimates, privacy promises, enrichment,
and prescribed layouts are not adopted.
