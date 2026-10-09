# Owner Intelligence intake connection

The existing private Google Sheet remains the pipeline. This operator-invoked
Site adapter connects the Site-owned intake to that Sheet; Ops can invoke this
same command from its designated writer seat after separate installation and
activation. There is no second CRM, new dependency, public contact endpoint,
webhook side effect, sender or schedule. Window Deals should read this private
Sheet, never a GitHub copy or anonymous attribution metrics.

## Evidence and boundaries

CURRENT EVIDENCE, October 8, 2026: the business Drive connector reads the existing
tracker and its `Owner pipeline` tab has only the 16 original headers in the
inspected range. Folder metadata places it under the business shared drive.
The connector returns `access_not_verified`, with no effective permissions;
this does not prove privacy. The environment has no production Netlify or
Google API credentials. Production inquiry counts, deployed capture behavior,
effective access, and live imports remain UNPROVEN.

CURRENT POLICY: [private-store decision](https://github.com/uncfreak1255-code/seascape-hub/blob/main/decisions/2026-09-29-owner-intelligence-private-store.md)
requires Sawyer's effective-access and retention acceptance, owner-direct
permission and Patrick's method acceptance. The chosen policy is not inferred
from this runbook. Source permission scope is an inbound review request;
ownership, property fit, marketing consent and exact delivery approval remain
separate. New rows always enter `Intake incomplete`, with no invented complete
intake time, assessment, approval or delivery.

TEMPORARY PROOF BLOCK: source implementation and synthetic proof can be reviewed
before those real-record conditions are accepted. A source merge deploys the
additional capture fields under the normal Site release boundary; it does not
install, authorize or run the private sync command.

## Production source and recovery

`node scripts/owner-intelligence/sync.js --inspect-source` verifies the Netlify
site's custom domain and published production deploy, then reads the existing
site-wide `seascape-owner-lead-contacts` store at
`owner_lead_contacts_v1.json` with strong consistency. A missing blob is reported
as missing, not as a verified zero-inquiry result. Malformed blobs and read
failures block the command.

It also pages through authenticated Netlify Forms submissions for the exact
`owner-revenue-teardown` form. This recovers records beyond the contact blob's
500-entry cap and restores legacy authority/timestamp evidence from the original
submission. Repeated or incomplete pagination blocks reconciliation. A Forms
record may still be synthetic, spam or otherwise unqualified; authenticated
storage alone proves none of those judgements.

The adapter also strongly reads `owner_lead_metrics_v1.json` from the existing
`seascape-owner-leads` store and joins retained proof labels by submission ID.
This covers labels applied after submission through `owner-lead-proof-label`,
without writing private contacts into metrics. Missing, unreadable or malformed
receipt data blocks reconciliation. Labels present on either private capture,
original Forms data or retained metrics receipts always hold the candidate.
The existing metrics store retains only 200 receipts; a missing historical
receipt does not prove that an old inquiry was never a test. Historical intake
still requires genuine-inquiry and owner-direct permission evidence. Labels
added after preview change the source hash and block apply until a new preview.

`buildOwnerLeadContact` now preserves raw `submitter_authority`, `proof_label`
and source-ID/time provenance in future private captures. These fields do not
enter anonymous metrics. A fallback-generated time or fallback number is not
verified source evidence. A self-attestation does not verify ownership.

## Access and privacy acceptance

Use the existing authorized operator account; credentials stay in its environment
and never in a command argument, Sheet, tracked file or PR. Do not ask someone to
paste a token into chat. No permission change or credential creation is part of
this implementation.

| Environment setting | Purpose |
| --- | --- |
| `OWNER_LEAD_CONTACT_BLOBS_SITE_ID` | Verified production Netlify project ID |
| `OWNER_LEAD_CONTACT_BLOBS_TOKEN` | Existing authorized Netlify read credential for Site, Forms and Blobs |
| `OWNER_LEAD_BLOBS_TOKEN` | Optional existing separate credential for the same site's metrics store; defaults to the contact-store credential |
| `OWNER_INTELLIGENCE_GOOGLE_ACCESS_TOKEN` | Existing Google bearer credential able to read Drive metadata/membership and read/write this Sheet |
| `OWNER_INTELLIGENCE_WRITER_ID` | Accepted single operator host/seat identity; never run a second writer |
| `SEASCAPE_RUNTIME_HOME` | Existing Ops runtime home; staging must be outside every Git checkout |

The Google credential needs the existing authorized Sheets write and Drive
membership read scopes. Connector access does not expose a reusable bearer
token to this command; connected Google Drive access alone does not activate it.

Run `node scripts/owner-intelligence/sync.js --inspect-access`. This reads
membership for the tracker, its parent folder and business shared drive;
conservatively includes parent memberships; checks the exact location; and
rejects anyone, domain, group or unresolved membership. Sawyer reviews the
private `access-review.json`, including effective shared-drive managers, before
accepting its access hash. September 29's four-account list is historical,
not a substitute for this fresh inspection. Managers cannot be excluded by a
limited-access folder; changing access is a separate decision.

Private staging is under the existing runtime home's
`state/staging/owner-intelligence/`. Its directory is mode 0700; saved JSON is
0600 and cannot be placed inside a Git checkout. Inspection/preview files may
contain contacts and are subject to the same accepted retention review policy.
Never attach them to GitHub or copy them into Hub canon. Logs return counts and
generic error codes only, with no provider response bodies.

After actual acceptance, create `approved-policy.json` there with these fields
(the example is deliberately incomplete and cannot authorize a real import):

```json
{
  "trackerId": "1Zs4I4ZqBbberw4fZnJPirnS44pHxvDfiLi7v89qev9s",
  "accessHash": "COPY_FROM_FRESH_PRIVATE_ACCESS_REVIEW",
  "approvedBy": "Sawyer",
  "approvedAt": "ACTUAL_ACCEPTANCE_TIME_WITH_OFFSET",
  "expiresAt": "TIME_WITH_OFFSET_WITHIN_24_HOURS_OF_ACCEPTANCE",
  "approvalEvidence": "PRIVATE_REFERENCE_TO_ACTUAL_SAWYER_ACCEPTANCE",
  "retentionReviewDays": 90,
  "automaticDeletion": false,
  "singleWriterId": "ACCEPTED_OPERATOR_SEAT",
  "methodAcceptedBy": "Patrick",
  "methodAcceptanceEvidence": "PRIVATE_REFERENCE_TO_ACTUAL_METHOD_ACCEPTANCE",
  "permissionScope": "inbound_review_only"
}
```

The 90-day inactive/declined review proposal requires actual acceptance. Nothing
deletes automatically. An imported old inquiry's review date is based on its
original activity date and can already be overdue. Later verified interaction
can update last activity and retention review under the accepted policy; this
command never refreshes existing operator fields or handles signed-owner records.
If another retention policy is chosen, revise and review the bounded mapping
before activating it. Method acceptance is retained as a first-real-record gate
because the existing tracker instructions require it; an imported inquiry is
still not an assessment or a qualified lead.

## Review, synthetic proof, then import

Run the synthetic proof first:

```bash
node --test scripts/enforcement/owner-intelligence-sync.test.js scripts/enforcement/owner-lead-contacts.test.js
```

These records live only in the in-memory fake provider or disposable private test
directory. Tests exercise actual planning, provider calls, literal cell writes,
access/source changes, failed reads, a lost write response and replay deduplication.
They do not populate the business Sheet or invoke a sender.

After privacy acceptance, `--preview` compares the authenticated source with
the private tracker and saves a private plan. Unreviewed candidates are held.
For each genuinely reviewed inquiry, record its exact source submission ID in
`inquiry-reviews.json` with `genuineInquiry: true`,
`ownerDirectPermissionConfirmed: true`, `reviewedBy`, `reviewedAt` with an offset,
and a private `evidence` reference. Never create these decisions just to pass a
gate. Missing authority or legacy provenance requires direct original evidence;
no generic marketing permission can substitute. Proof-labeled submissions are
always held. Suspected repeat contact/property identities require review and are
not automatically merged or imported as another prospect.

Run `--preview` again after review. Within one hour, `--apply` rechecks privacy,
membership, source and tracker before making one fixed-range batch write, then
verifies the complete readback. It extends the original headers with ten intake
fields only at this authorized write. Every value is a literal string, so
submitted spreadsheet formulas cannot execute. No existing row, formatting,
operator stage, approval or delivery state is overwritten.

Run the command from only the accepted writer host. A local exclusive lock stops
overlapping runs on that host, but Sheets has no row-level compare-and-swap here.
All tracker users must avoid edits during the short apply/readback window; an
unexpected concurrent change blocks success. Do not activate a recurring or
multi-host writer without a separately reviewed concurrency and activation path.
A locked file after an interrupted process requires operator investigation; do
not erase a lock belonging to a live writer.

On a write timeout or ambiguous response, do not blindly retry. Re-run preview:
the Sheet's durable record IDs reveal any rows already written. Existing IDs
become no-ops. This avoids a checkpoint that could lose an inquiry after a crash.

## Mapping for the future Deals tab

| Sheet field | Contract |
| --- | --- |
| Record ID / Source submission ID | `netlify-owner:<submissionId>` / unchanged original ID; stable replay key |
| Source timestamp | Original timestamp including offset; never replaced by import time |
| Ownership confirmation | Raw form self-attestation described as unverified |
| Permission source / date / scope | Exact inbound request, source time and private review evidence; review only |
| Owner / Contact / Property / Primary question | Private source fields; no public read model |
| Stage / Next action / Action owner | Intake incomplete / verify and complete intake / Sawyer pending |
| Assessment / Exact approval / Delivery | Blank / blank / pending; no send authority |
| Last activity / Retention review | Original activity and its 90-day review date; no automatic deletion |
| Ingested at / Source page / Source market | Import time separate from source time; private provenance |
| Verification / Duplicate review / Retention status | Human-reviewed inquiry, ownership/fit unverified; exact-match duplicate screen; review only |

Repeated submission IDs never append again. Exact contact/property matches with
different IDs are held. Different properties from one owner can remain separate
opportunities. Fuzzy identities and old manually entered rows need review; this
does not claim universal identity resolution. Postal-letter batches retain their
separate Sawyer-approved rules and are not fabricated by this form adapter.

## Remaining activation proof

1. Review and land the source under normal Site gates; keep its Netlify release
   and private command installation separate.
2. Use the authorized production operator environment for the two inspect modes.
   Verify production counts, original submissions, current effective access and
   the deployed capture fields; do not infer those from GitHub main.
3. Obtain actual access/90-day retention acceptance and Patrick method proof;
   designate one writer and preserve owner-direct permission evidence.
4. Preview genuine inquiries, apply the reviewed batch and verify tracker readback.
   Only then claim a live connection/import. Ongoing scheduling and Deals-tab
   writes remain separate activation work; no outreach is authorized here.

API references: [Netlify Blobs](https://docs.netlify.com/build/data-and-storage/netlify-blobs/),
[Netlify API](https://docs.netlify.com/api-and-cli-guides/api-guides/get-started-with-api/),
[Sheets batch updates](https://developers.google.com/workspace/sheets/api/reference/rest/v4/spreadsheets/batchUpdate).
