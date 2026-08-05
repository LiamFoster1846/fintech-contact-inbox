import { sendInboxEmail, type SentEmail } from "./infrai_mail_client.ts";

export type FintechContact = {
  name: string;
  email: string;
  company: string;
  message: string;
};

const clean = (value: string) => value.replace(/[<>]/g, "").trim();

export function routeFintechContact(
  contact: FintechContact,
  inbox: string,
): Promise<SentEmail> {
  const name = clean(contact.name);
  const email = clean(contact.email);
  const company = clean(contact.company);
  const message = clean(contact.message);
  const requestId = crypto.randomUUID();

  return sendInboxEmail({
    to: inbox,
    subject: `Fintech contact: ${name || "New request"}`,
    text: [
      `Name: ${name}`,
      `Email: ${email}`,
      `Company: ${company}`,
      "",
      "Message:",
      message,
    ].join("\n"),
  }, requestId);
}
