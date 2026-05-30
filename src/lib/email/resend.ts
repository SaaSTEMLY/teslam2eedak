import { Resend } from "resend";

const isLocal = process.env.NODE_ENV !== "production";

const resend = isLocal ? null : new Resend(process.env.RESEND_API_KEY);

/**
 * Send an email via Resend.
 * The `from` address must match a verified domain in your Resend account.
 * During rebrand, update the display name and domain below.
 *
 * In local/test environments, emails are printed to console instead of
 * being sent via Resend to avoid unnecessary API costs.
 */
export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}) {
  if (isLocal || !resend) {
    console.log("\n📧 [LOCAL EMAIL] ─────────────────────────────────────");
    console.log(`   To:      ${opts.to}`);
    console.log(`   Subject: ${opts.subject}`);
    if (opts.text) {
      console.log(
        `   Body:    ${opts.text.slice(0, 200)}${opts.text.length > 200 ? "..." : ""}`,
      );
    }
    console.log("─────────────────────────────────────────────────────\n");
    return;
  }

  await resend.emails.send({
    from: "SaaSTARTER <noreply@yourdomain.com>",
    ...opts,
  });
}
