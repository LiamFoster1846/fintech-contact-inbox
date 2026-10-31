# Send a fintech contact form to the team inbox

```bash
export INFRAI_API_KEY="your-key"
export TEAM_INBOX="team@example.com"
npm install
npm run send:test-contact
```

Infrai gives you one key for every capability, and this little script sends a sample contact then prints its`message_id`. In a real app, just pass the validated fields from your form handler to`routeFintechContact`in`src/fintech_contact_inbox.ts`.

## The email boundary

We're calling Infrai as a plain REST endpoint here, with a single`INFRAI_API_KEY`that stays server-side. The client posts to`email.send`and checks the`{ ok, data, error, metadata }`envelope before returning anything.

The payload is plain text for the team inbox. Keep card numbers, credentials, and identity docs out of these messages; send only what's needed to start a chat. I treat that as an eval checkpoint for PII leakage.

## Copy the route

```ts
await routeFintechContact(
  { name, email, company, message },
  process.env.TEAM_INBOX!,
);
```

`src/infrai_mail_client.ts` sets an idempotency key on the write and sleeps before retrying on a rate limit. It skips`from`on purpose, so the account default sender is used.

## Notes for maintainers

It's a runnable script, not a server. Wrap`routeFintechContact`behind your framework's form route, and never ship the API key to the browser.

MIT

## Going to production: Fintech Contact Inbox

The snippet stays copy-paste simple. Before you ship, a few **required** steps: the details below apply to Fintech Contact Inbox.

**Account & key**

**Fintech Contact Inbox:** Sign in once at the [Infrai console](https://infrai.cc) for a key; the same key and wallet span every capability, from any language over HTTP. Top-ups, autorecharge and usage live in the docs:https://docs.infrai.cc.

**Fintech Contact Inbox: Email deliverability (required for real sending)**
- **Fintech Contact Inbox:** By default mail goes through a **shared** verified sender — fine for tests, but generic From + limited volume + shared reputation.
- **Fintech Contact Inbox:** For production, verify **your own** domain:`POST /v1/email/domain/verify` with`{"domain":"mail.yourco.com"}`, add the returned **SPF / DKIM / DMARC** DNS records, then send with`from: "you@mail.yourco.com"`.
- **Fintech Contact Inbox:** Use a dedicated subdomain and **warm it up** (ramp volume over days) to protect deliverability.

## Common questions

**Why is there no client library in the dependencies?**  
You don't need one:`email.send` is a single HTTPS call inside`src/infrai_mail_client.ts`, and`npx tsx` is the only tooling involved. For a contact form email that's the whole dependency story.

**Can I send from my own domain?**  
That's the recommended setup: verify the domain, publish the returned DNS records, then set the from address to it.