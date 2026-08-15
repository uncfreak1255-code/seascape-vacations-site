# Owner Lead Confirmation Email

## What this does

When someone completes the public `owner-revenue-teardown` form with a usable
email, the signed Forms webhook path sends:

1. One confirmation ack **from** `info@seascape-vacations.com` **to** the owner
2. One internal notify **to** `info@seascape-vacations.com` so the lead
   cannot go silent

This is not a drip, not guest Mailchimp, and not founder-gated sales outreach.

## Authenticated delivery (required)

Netlify Forms can reach this code two ways. Only one is customer-verifiable:

| Path | How it arrives | Auth |
|---|---|---|
| Event function `submission-created` | Netlify auto-invoke after form verify | Netlify verifies its own platform JWS **before** invoke. That key is **not** exposed to site env. External HTTP to this URL returns **403** (function never runs). |
| Forms HTTP notification → `owner-lead-form-webhook` | Outgoing webhook POST | Customer JWS secret. **This is the verified path for Graph/contact side effects.** |

In-function HTTP auth always verifies the Netlify JWS with
`OWNER_LEAD_FORM_WEBHOOK_SECRET` (HS256, `iss: netlify`, `sha256` of raw body).
Missing secret, missing signature, invalid signature, or body-hash mismatch
fails closed (`404 event_only`). Spoofing `x-netlify-event` alone is not enough.

### CoS turn-on (before the next live send test)

Production does **not** ship with a usable webhook secret in this repo. CoS must:

1. Generate a long random secret (do not commit it).
2. Set Netlify env `OWNER_LEAD_FORM_WEBHOOK_SECRET` to that value (Functions scope).
3. Netlify UI → Project configuration → Notifications → Form submission
   notifications → **HTTP POST** to:
   `https://seascape-vacations.com/.netlify/functions/owner-lead-form-webhook`
   for form `owner-revenue-teardown` (or all forms), with the **same** JWS secret.
4. Redeploy / clear function cache after env change.
5. Keep the existing email notification to `info@` as the human backstop.

Do **not** point the signed HTTP notification at `submission-created` — that
event-named URL rejects external HTTP with 403.

## Abuse controls

- Both owner forms (`src/property-management/index.njk` and
  `src/_includes/partials/owner-evaluation-form.njk`) use Netlify managed
  reCAPTCHA (`data-netlify-recaptcha="true"` + widget div). Enable the site
  captcha provider in the Netlify Forms UI if it is not already on.
- HTTP side effects require a verified Netlify JWS (`OWNER_LEAD_FORM_WEBHOOK_SECRET`).
- Before Graph send, a Blobs-backed rate limit caps confirmation attempts per
  recipient email and globally per UTC hour (defaults: 3 / 40). Override with
  `OWNER_LEAD_MAIL_RATE_LIMIT_PER_EMAIL_HOUR` and
  `OWNER_LEAD_MAIL_RATE_LIMIT_GLOBAL_HOUR`. Same submission id retries do not
  re-burn the quota.

## Delivery durability and retries

- Confirmation mail runs only after contact capture succeeds.
- Delivery flags live in per-submission Blobs keys
  (`owner_lead_confirmation_delivery/<id>.json`), not in the contacts list
  blob, so overlapping submits cannot wipe leads or successful-send state.
- Contact-list writes use etag conditional retry.
- Transient Graph failures (429/5xx/token/network) and “Graph accepted but
  delivery-state write failed” return **503** so Netlify redelivers the event.
  Already-sent owner/internal legs are skipped on retry.
- Missing Graph env is **not** retryable (logs `missing_env:…`, returns 200).

## Delivery blocker (must be green before production send)

Set these Netlify site env vars, then redeploy (or clear function cache):

| Env var | Purpose |
|---|---|
| `OWNER_LEAD_FORM_WEBHOOK_SECRET` | Shared JWS secret for Forms HTTP notification → `owner-lead-form-webhook` |
| `MS_GRAPH_TENANT_ID` | Entra tenant id |
| `MS_GRAPH_CLIENT_ID` | App registration client id |
| `MS_GRAPH_CLIENT_SECRET` | App registration client secret |

Microsoft admin proof required:

- Application permission `Mail.Send`
- Permission scoped so the app can send as `info@seascape-vacations.com`
- Sibling role mailboxes out of scope
- No additive unscoped tenant-wide `Mail.Send`

Aliases accepted: `AZURE_TENANT_ID`, `AZURE_CLIENT_ID`, `AZURE_CLIENT_SECRET`.

Without the three Graph credentials, the function logs
`owner_lead_confirmation_not_sent` with `missing_env:...` and does **not**
pretend the email was delivered. Contact capture and metrics still run when the
webhook auth passes.

Without `OWNER_LEAD_FORM_WEBHOOK_SECRET` + the Forms HTTP notification, HTTP
invokes fail closed and Graph confirmation will not run.

## Sawyer / info@ notify paths

1. **Graph internal email** (preferred once Graph env + signed webhook are set)
2. **Netlify form notification** (existing backstop): Netlify UI → Project
   configuration → Notifications → Form submission notifications → email
   `info@seascape-vacations.com` for form `owner-revenue-teardown` (sender is
   `formresponses@netlify.com`; ops `owner-reachout-intake` parses these)
3. **Optional chat webhook** (one step): set `OWNER_LEAD_NOTIFY_WEBHOOK_URL` in
   Netlify env to a Discord/Slack incoming webhook URL

## What does not send

- Partial fills with no usable email
- Guest `email_capture` / Mailchimp SAVE50
- Non-`owner-revenue-teardown` forms
- Webhook redeliveries after both delivery flags are true
- Rate-limited abuse attempts (contact still stored for human follow-up)
- Owner-direct sales packets (still founder-gated / HOLD)
- Unsigned / forged / secret-missing HTTP hits (`event_only`)

## Proof

```bash
node --test scripts/enforcement/owner-lead-contacts.test.js scripts/enforcement/owner-lead-confirmation.test.js scripts/enforcement/owner-acquisition.test.js
```
