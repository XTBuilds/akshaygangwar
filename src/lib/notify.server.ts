const GATEWAY = "https://connector-gateway.lovable.dev/google_mail/gmail/v1";
const OWNER = "akshaygangwar16@gmail.com";

const b64 = (s: string) =>
  btoa(Array.from(new TextEncoder().encode(s), (b) => String.fromCharCode(b)).join(""));
const header = (v: string) => (/^[\x00-\x7F]*$/.test(v) ? v : `=?UTF-8?B?${b64(v)}?=`);

function raw(to: string, subject: string, body: string, replyTo?: string): string {
  const lines = [
    `To: ${to}`,
    `Subject: ${header(subject)}`,
    ...(replyTo ? [`Reply-To: ${replyTo}`] : []),
    "MIME-Version: 1.0",
    'Content-Type: text/plain; charset="UTF-8"',
    "",
    body,
  ];
  return b64(lines.join("\r\n")).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/**
 * Sends a notification to the site owner's inbox through the connected Gmail account.
 * Never throws — a mail failure must not break the visitor's submission.
 */
export async function notifyOwner(
  subject: string,
  fields: Record<string, string | undefined>,
  replyTo?: string,
): Promise<{ sent: boolean; reason?: string }> {
  const lovableKey = process.env["LOVABLE_API_KEY"];
  const gmailKey = process.env["GOOGLE_MAIL_API_KEY"];
  if (!lovableKey || !gmailKey) return { sent: false, reason: "email not configured" };

  const body = Object.entries(fields)
    .filter(([, v]) => v && v.trim())
    .map(([k, v]) => `${k.toUpperCase()}: ${v}`)
    .join("\n\n");

  try {
    const res = await fetch(`${GATEWAY}/users/me/messages/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${lovableKey}`,
        "X-Connection-Api-Key": gmailKey,
      },
      body: JSON.stringify({ raw: raw(OWNER, subject, body, replyTo) }),
    });
    if (!res.ok) {
      const text = await res.text();
      console.error(`gmail send failed [${res.status}]: ${text}`);
      return { sent: false, reason: `${res.status}` };
    }
    return { sent: true };
  } catch (e) {
    console.error("gmail send error", e);
    return { sent: false, reason: e instanceof Error ? e.message : "unknown" };
  }
}
