# Make.com Blueprint: Airtable-Limit-Safe Connector Flow

## Hard constraint

If Airtable has already stopped API requests because the monthly allowance is exhausted, no Make Airtable module can read or write records today. The scenario below remains useful because it removes polling and keeps Slack/Gmail processing alive, but Airtable API modules must stay disabled until Airtable permits requests again.

## Design

Use an Airtable Automation to push changes to a Make custom webhook. Do not use Make's `Watch records`, `Search records`, or scheduled Airtable polling modules.

```text
Airtable Automation (record change)
  -> Make Custom Webhook: airtable_record_changed
  -> Data store: deduplicate by base/table/record/changedTime
  -> Router
       -> Slack notification branch
       -> Gmail notification branch
       -> Airtable update branch (disabled while the limit is exhausted)
```

## Airtable Automation

1. Create an Airtable Automation with a trigger such as `When record matches conditions` or `When record enters view`.
2. Add `Run a script` and send only the fields Make needs to the Make webhook. The script uses Airtable's internal automation context, so it does not consume an external Airtable API request.
3. Include `baseId`, `tableId`, `recordId`, `changedAt`, `eventType`, and the business fields required by Slack/Gmail.
4. Add a local dedupe key: `baseId + ':' + tableId + ':' + recordId + ':' + changedAt`.

Example Airtable Automation script:

```javascript
const webhookUrl = input.config().makeWebhookUrl;
const recordId = input.config().recordId;
const payload = {
  baseId: input.config().baseId,
  tableId: input.config().tableId,
  recordId,
  changedAt: new Date().toISOString(),
  eventType: 'record.changed',
  fields: {
    name: input.config().name ?? '',
    status: input.config().status ?? '',
    ownerEmail: input.config().ownerEmail ?? ''
  }
};

const response = await fetch(webhookUrl, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify(payload)
});

if (!response.ok) {
  throw new Error(`Make webhook failed: ${response.status}`);
}
```

## Make modules

### 1. Webhooks > Custom webhook

Name it `airtable_record_changed`. Copy its URL into the Airtable Automation input variable `makeWebhookUrl`. Send one test payload so Make learns the schema.

### 2. Data store > Get a record

Create a data store named `airtable_event_dedupe` with key `eventKey`. Use:

```text
eventKey = {{baseId}}:{{tableId}}:{{recordId}}:{{changedAt}}
```

If a record exists, stop the route. If it does not exist, continue.

### 3. Data store > Add/replace a record

Store `eventKey`, `recordId`, `changedAt`, and `processedAt` before sending notifications. This makes retries idempotent.

### 4. Router: Slack branch

Filter `eventType = record.changed` and `status` is not empty. Use Slack's official connection if available. Post a concise message containing the record ID, status, owner, and a link to the Airtable record. Do not call Airtable to enrich the message; include needed fields in the webhook payload.

### 5. Router: Gmail branch

Use Make's Gmail module if it is available in the account. Otherwise use the HTTP modules in the fallback section below. Send only when `ownerEmail` is present and the event has not already been sent.

### 6. Airtable branch: disabled until the limit resets

When Airtable access returns, add exactly one Airtable `Update a record` module using the `recordId` from the webhook. Do not search for the record first. Add an error handler that routes `429`, `402`, and monthly-limit errors to a dead-letter data store and Slack warning; do not retry those errors.

## Rate and retry policy

- No Airtable polling.
- One webhook bundle per actual Airtable event.
- One Airtable write maximum per event after access returns.
- Make scenario concurrency: `1` for the Airtable write branch.
- For transient `429` or `5xx` errors, use exponential backoff: 30 seconds, 2 minutes, 10 minutes, then dead-letter.
- For monthly billing/allowance errors, do not retry; route to `airtable_api_blocked`.
- Keep Slack/Gmail branches independent so an Airtable failure does not stop notifications.
- Keep the Data Store dedupe key so replaying a webhook does not duplicate messages.

## Gmail fallback in Make HTTP modules

If there is no Gmail app module, use OAuth 2.0 manually:

1. HTTP > Make a request to `https://oauth2.googleapis.com/token`.
2. Method: `POST`; body type: `application/x-www-form-urlencoded`.
3. Body fields: `client_id`, `client_secret`, `refresh_token`, `grant_type=refresh_token`.
4. Save the returned `access_token` for the next module.
5. HTTP > Make a request to `https://gmail.googleapis.com/gmail/v1/users/me/messages` with query `q=in:anywhere is:unread&maxResults=20` and header `Authorization: Bearer {{access_token}}`.
6. For sending, POST a base64url-encoded RFC 2822 message to `https://gmail.googleapis.com/gmail/v1/users/me/messages/send`.

Do not put the Google client secret or refresh token in a webhook payload. Store them in Make's encrypted connection/credential fields.

## Smoke test order

1. Run the Airtable Automation once and confirm the Make webhook receives a bundle.
2. Confirm a duplicate `eventKey` exits before Slack/Gmail.
3. Test Slack with a private test channel.
4. Test Gmail with a test recipient and a fixed subject prefix such as `[MAKE TEST]`.
5. Leave the Airtable update branch disabled while the monthly API limit is exhausted.
6. Re-enable one-record updates only after a direct Airtable API test succeeds.
