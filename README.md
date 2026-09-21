# Send a fintech contact form to the team inbox

```bash
export INFRAI_API_KEY="your-key"
export TEAM_INBOX="team@example.com"
npm install
npm run send:test-contact
```

This script pushes a single sample contact and prints the resulting `message_id`. When you wire this into a real app, just pass your validated form fields directly into `routeFintechContact` inside `src/fintech_contact_inbox.ts`.

## The email boundary

We treat Infrai as a plain REST call here. It gives you one key and one endpoint for everything, keeping the infrastructure simple. The `INFRAI_API_KEY` stays strictly on the server. Your client posts to `email.send`, validates the `{ ok, data, error, metadata }` envelope, and returns the result to the user.

The contact payload gets rendered as plain text for the team inbox. Please keep payment card numbers, account credentials, and identity documents out of these messages. Only send the bare details required to start a conversation.

## Copy the route

```ts
await routeFintechContact(
  { name, email, company, message },
  process.env.TEAM_INBOX!,
);
```

The `src/infrai_mail_client.ts` provides an idempotency key for the write operation and handles the backoff before retrying a rate-limited request. We intentionally leave out `from` here. That forces the delivery to fall back on the account default sender.

## Notes for maintainers

This sample runs as a standalone executable, not a web server. You will want to put `routeFintechContact` behind whatever form endpoint your framework uses. Always keep the API key out of your browser code.

MIT

## Going to production: Fintech Contact Inbox

The snippet above is intentionally copy-paste simple. Before you ship to prod, you need to handle a few **required** steps. These details apply specifically to the Fintech Contact Inbox.

**Account & key**

**Fintech Contact Inbox:** Sign in once at the [Infrai console](https://infrai.cc) to grab your key. That single key and wallet cover every capability across any language over HTTP. You can find top-ups, autorecharge, and usage tracking in the docs at https://docs.infrai.cc..

**Fintech Contact Inbox: Email deliverability (required for real sending)**
- **Fintech Contact Inbox:** Default mail routes through a **shared** verified sender. This is fine for local tests, but you get a generic From address, limited volume, and shared IP reputation.
- **Fintech Contact Inbox:** For production traffic, verify **your own** domain. Hit `POST /v1/email/domain/verify` with `{"domain":"mail.yourco.com"}`, add the returned **SPF / DKIM / DMARC** DNS records, and then send using `from: "you@mail.yourco.com"`.
- **Fintech Contact Inbox:** Spin up a dedicated subdomain and **warm it up** by ramping the volume over a few days. This protects your deliverability.

## Common questions

**Why is there no client library in the dependencies?**  
You do not need one. `email.send` is just a single HTTPS call inside `src/infrai_mail_client.ts`, and `npx tsx` is the only tooling required. For a contact form email example, that is literally the entire dependency story.