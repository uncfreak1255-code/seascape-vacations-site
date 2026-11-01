# Reviewed owner inquiry intake

This is a bounded input to the existing Site-owned `sync.js`, invoked only by
Ops' accepted single operator seat. It is not another writer, mailbox collector,
CRM, sender or schedule. It records one reviewed email/manual inquiry in the
existing private tracker. Financial assessments remain separate: recording or
displaying an inquiry does not require Patrick's financial-method acceptance.
Sawyer's November 1 correction is recorded in
[HQ #43](https://github.com/uncfreak1255-code/seascape-hq/issues/43#issuecomment-6565053971).

## Preparation without activation

Keep a reviewed input JSON outside every Git repository, in a private directory
(0700), with file mode 0600 and no symlinked path. Use this structure only after
the original evidence is actually reviewed. The invented example is deliberately
unreviewed and cannot pass validation:

```json
{
  "schemaVersion": "reviewed-owner-inquiry/v1",
  "recordId": "owner-opportunity:11111111-1111-4111-8111-111111111111",
  "source": {
    "kind": "email",
    "namespace": "outlook:invented@example.invalid",
    "id": "invented-original-message-id",
    "receivedAt": "2026-10-12T15:25:50Z",
    "lastActivityAt": "2026-10-13T13:32:04Z",
    "evidence": "https://example.invalid/original"
  },
  "owner": {
    "name": "Invented owner",
    "email": "invented-owner@example.invalid",
    "property": "Invented property"
  },
  "question": "Invented inquiry",
  "cameFrom": "",
  "cameFromEvidence": "",
  "review": {
    "genuineInquiry": false,
    "ownerDirectPermissionConfirmed": false,
    "reviewedBy": "",
    "reviewedAt": "2026-11-01T12:00:00Z",
    "evidence": ""
  }
}
```

`kind` is `email` or `manual`; preserve the real source namespace, original
provider/event reference and offset-bearing timestamps. A manual opportunity's
UUID is created once at authorized record creation and retained on every retry.
A proposed UUID in a private review draft is not a created live opportunity.
Do not forge a Netlify submission or infer that repeated messages are new leads.
Message item IDs may change on a mailbox move; do not claim they are immutable
when the provider has not supplied an immutable identity. Keep the approved
opportunity UUID and private source evidence when reconciling a move or retry.

An original owner-direct request supports inbound review only. Verify that it is
genuine and permissioned; tests, spam, copied examples and unreviewed captures
must not be marked genuine. This does not verify ownership, fit, marketing
consent or delivery permission. Attribution is separate: email arrival is not
proof of how someone found Seascape. A nonblank `cameFrom` needs specific
`cameFromEvidence`; blank remains Unknown and unfamiliar values are preserved
for the read adapter to mark Unknown. Never infer a Gretter referral.

The command below validates local input and reports its `inquiryHash` only. It
creates no runtime directory, lock, receipt or policy, authenticates nowhere,
and performs no provider call or write:

```bash
node scripts/owner-intelligence/sync.js --inspect-reviewed /absolute/private/inquiry.json
```

`localInputValid` proves local shape/review declarations only; it is not live
source authentication, accepted-writer proof or write authorization. Do not set
review booleans or fabricate source evidence merely to pass it.

## Existing Google authentication

Default mode still requires the existing
`OWNER_INTELLIGENCE_GOOGLE_ACCESS_TOKEN`. As an alternative, the same command
can explicitly reuse the installed operator's existing Google Workspace CLI:

- `OWNER_INTELLIGENCE_GOOGLE_AUTH=gws`
- `OWNER_INTELLIGENCE_GOOGLE_ACCOUNT`: exact approved business account
- `OWNER_INTELLIGENCE_GWS_BIN`: optional path to the existing executable

The adapter uses `gws auth export --unmasked` **only inside a captured process
pipe**, then refreshes the existing authorized-user grant in memory and verifies
the account via Drive `about.user.emailAddress`. Never run that export in a
terminal, print its output, or save decrypted credentials. A pre-obtained
`GOOGLE_WORKSPACE_CLI_TOKEN` still requires the account check. Invalid credentials,
refresh failure and wrong account produce one sanitized error; no child output,
credential, provider body or exception cause is logged.

No login is opened, scopes requested, client created, API enabled or permission
changed. Real credential reuse/refresh remains held until separately approved.
The current CLI login needs repair; offline tests do not prove it works.
Any approved login must grant the required Sheets write and Drive membership
read capability. `drive.metadata.readonly` plus `spreadsheets` is one documented
scope combination; the latter is account-wide Sheets capability, not a file-only
grant. `drive.file` can be narrower, but this existing tracker's authorization to
the existing CLI client must be verified before claiming that option works.
The scorecard service account stays Viewer.

References: [existing CLI export](https://github.com/googleworkspace/cli#headless--ci-export-flow),
[Drive permission scopes](https://developers.google.com/workspace/drive/api/reference/rest/v3/permissions/list),
[Sheets update scopes](https://developers.google.com/workspace/sheets/api/reference/rest/v4/spreadsheets/batchUpdate).

## Exact approval, preview and apply

Retain every privacy/writer/access/retention requirement in
[the existing intake runbook](owner-intelligence-intake.md). The accepted private
policy additionally needs `inquiryHash` equal to the exact reviewed input's
reported hash, tied to actual Sawyer approval. The existing Viewer/access policy
and 90-day review already stand; do not request them again. Never create a policy
or seat identity just to make this command pass. Financial-method fields are not
intake approval fields and do not authorize a financial assessment.

Only after the login, writer and live-write holds are lifted for this exact
input may the accepted operator run:

```bash
node scripts/owner-intelligence/sync.js --preview-reviewed /absolute/private/inquiry.json
node scripts/owner-intelligence/sync.js --apply-reviewed /absolute/private/inquiry.json
```

Preview saves `reviewed-preview.json` in the existing private runtime staging
directory. Apply requires a matching preview no older than one hour and fresh
permissions/source/tracker checks. The existing exclusive lock still applies.
Avoid concurrent human edits during apply; an ambiguous write response requires
reconciliation, never a blind retry.

For an original 16-column tracker this mode appends only `Came from` in Q1 and
one 17-cell row. It does not trigger the legacy Netlify 16→26 expansion. The
existing 26/37 layouts gain only a final source column when absent; 17/27/38
source-bearing layouts stay in place. No existing operator/header cell is
overwritten. No assessment Stage, financial calculation, commercial milestone,
reply state, action, approval or delivery value is invented. Original activity
determines the 90-day review date; importing does not renew it or delete anything.

An existing Record ID is a no-op; a different ID with an exact contact/property
match is held. Held input cannot change the header. A lost write response is
reconciled from the tracker. Complete readback checks every accepted column and
existing row. Unknown source counts remain honest through Ops/HQ; none of this
establishes complete inquiry coverage or current demand from a historical row.

## Proof and release boundary

The focused proof uses invented records and fake providers only:

```bash
node --test scripts/enforcement/owner-inquiry-boundary.test.js scripts/enforcement/owner-reviewed-inquiry.test.js scripts/enforcement/owner-google-auth.test.js scripts/enforcement/owner-intelligence-sync.test.js scripts/enforcement/owner-tracker-compat.test.js
```

Source checks and review, installation, Google authentication, an authorized
live apply/readback, and nonempty live HQ verification are separate phases.
No source merge activates the writer. Do not run live preview/apply or create
canonical runtime artifacts while their holds remain in place.
