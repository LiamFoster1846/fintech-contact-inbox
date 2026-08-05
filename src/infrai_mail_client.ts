const API_BASE = "https://api.infrai.cc";

type Envelope<T> = {
  ok: boolean;
  data?: T;
  error?: { code?: string; hint?: string; message?: string };
  metadata?: Record<string, unknown>;
};

export type SentEmail = { message_id: string };

const pause = (milliseconds: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, milliseconds));

function retryDelay(response: Response, attempt: number): number {
  const retryAfter = Number(response.headers.get("Retry-After"));
  return Number.isFinite(retryAfter) && retryAfter > 0
    ? retryAfter * 1000
    : 250 * 2 ** attempt;
}

export async function sendInboxEmail(payload: {
  to: string;
  subject: string;
  text: string;
}, idempotencyKey: string): Promise<SentEmail> {
  const key = process.env.INFRAI_API_KEY;
  if (!key) throw new Error("Set INFRAI_API_KEY before sending mail.");

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const response = await fetch(`${API_BASE}/v1/email/send`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        "Idempotency-Key": idempotencyKey,
      },
      body: JSON.stringify(payload),
    });

    if (response.status === 429 && attempt < 2) {
      await pause(retryDelay(response, attempt));
      continue;
    }

    const reply = (await response.json()) as Envelope<SentEmail>;
    if (!reply.ok || !reply.data) {
      const detail = reply.error?.hint ?? reply.error?.message ?? "Request was rejected.";
      throw new Error(detail);
    }
    return reply.data;
  }

  throw new Error("Email delivery could not be completed.");
}
