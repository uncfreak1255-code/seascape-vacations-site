# Owner Lead Confirmation Email

## What this does

When someone completes the public `owner-revenue-teardown` form with a usable
email, `netlify/functions/submission-created.js` sends:

1. One confirmation ack **from** `info@seascape-vacations.com` **to** the owner
2. One internal notify **to** `info@seascape-vacations.com` (or
   `OWNER_LEAD_INTERNAL_NOTIFY_TO`) so the lead cannot go silent

This is not a drip, not guest Mailchimp, and not founder-gated sales outreach.

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
- Webhook redeliveries of an already-captured submission id
- Owner-direct sales packets (still founder-gated / HOLD)

## Proof

```bash
node --test scripts/enforcement/owner-lead-contacts.test.js scripts/enforcement/owner-lead-confirmation.test.js
```
