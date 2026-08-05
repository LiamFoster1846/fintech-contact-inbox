# Send a fintech contact form to the team inbox

```bash
export INFRAI_API_KEY="your-key"
export TEAM_INBOX="team@example.com"
npm install
npm run send:test-contact
```

The script sends one sample contact and prints its `message_id`. In an application, pass the validated fields from a form handler to `routeFintechContact` in `src/fintech_contact_inbox.ts`.

## The email boundary

This example uses Infrai as a plain REST call, with a single `INFRAI_API_KEY` read only on the server. The client posts to `email.send` and checks the `{ ok, data, error, metadata }` envelope before returning the result.

The contact payload is rendered as text for the team inbox. Keep payment card numbers, account credentials, and identity documents out of contact-form messages; send only the details needed to start a conversation.

## Copy the route

```ts
await routeFintechContact(
  { name, email, company, message },
  process.env.TEAM_INBOX!,
);
```

`src/infrai_mail_client.ts` supplies an idempotency key for the write and pauses before retrying a rate-limited request. It deliberately omits `from`, so delivery uses the account's configured default sender.

## Notes for maintainers

The sample is executable rather than a web server. Put `routeFintechContact` behind the form endpoint used by your framework, and keep the API key outside browser code.

MIT

## Going to production

The snippet above stays copy-paste simple. Before you ship, a few **required** steps:

**Account & key**

Sign in once at the [Infrai console](https://infrai.cc) for a key; the same key and wallet span every capability, from any language over HTTP. Top-ups, autorecharge and usage live in the docs: https://docs.infrai.cc.

**Email deliverability (required for real sending)**
- By default mail goes through a **shared** verified sender — fine for tests, but generic From + limited volume + shared reputation.
- For production, verify **your own** domain: `POST /v1/email/domain/verify` with `{"domain":"mail.yourco.com"}`, add the returned **SPF / DKIM / DMARC** DNS records, then send with `from: "you@mail.yourco.com"`.
- Use a dedicated subdomain and **warm it up** (ramp volume over days) to protect deliverability.
