# Owner Lead Confirmation Email

## What this does

When someone completes the public `owner-revenue-teardown` form with a usable
email, `netlify/functions/submission-created.js` sends:

1. One confirmation ack **from** `info@seascape-vacations.com` **to** the owner
2. One internal notify **to** `info@seascape-vacations.com` so the lead
   cannot go silent

This is not a drip, not guest Mailchimp, and not founder-gated sales outreach.

## Abuse controls

- Both owner forms (`src/property-management/index.njk` and
  `src/_includes/partials/owner-evaluation-form.njk`) use Netlify managed
  reCAPTCHA (`data-netlify-recaptcha="true"` + widget div). Enable the site
  captcha provider in the Netlify Forms UI if it is not already on.
- The function rejects direct HTTP invocation (`event_only` / 404). Netlify
  verifies the platform event signature before invoking `submission-created`.
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
| `MS_GRAPH_TENANT_ID` | Entra tenant id |
| `MS_GRAPH_CLIENT_ID` | App registration client id |
| `MS_GRAPH_CLIENT_SECRET` | App registration client secret |

Microsoft admin proof required:

- Application permission `Mail.Send`
- Permission scoped so the app can send as `info@seascape-vacations.com`
- Sibling role mailboxes out of scope
- No additive unscoped tenant-wide `Mail.Send`

Aliases accepted: `AZURE_TENANT_ID`, `AZURE_CLIENT_ID`, `AZURE_CLIENT_SECRET`.

Without those three credentials, the function logs
`owner_lead_confirmation_not_sent` with `missing_env:...` and does **not**
pretend the email was delivered. Contact capture and metrics still run.

## Sawyer / info@ notify paths

1. **Graph internal email** (preferred once Graph env is set): automatic
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

## Proof

```bash
node --test scripts/enforcement/owner-lead-contacts.test.js scripts/enforcement/owner-lead-confirmation.test.js scripts/enforcement/owner-acquisition.test.js
```
