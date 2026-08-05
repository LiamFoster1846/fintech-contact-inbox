import { routeFintechContact } from "../src/fintech_contact_inbox.ts";

const inbox = process.env.TEAM_INBOX;
if (!inbox) throw new Error("Set TEAM_INBOX to the address that receives contacts.");

const result = await routeFintechContact({
  name: "Morgan Lee",
  email: "morgan@example.com",
  company: "Clear Ledger",
  message: "We need a secure vendor review call next week.",
}, inbox);

console.log(`Contact delivered with message_id: ${result.message_id}`);
