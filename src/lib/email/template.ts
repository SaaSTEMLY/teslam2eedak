import { getMessages, t } from "@/lib/i18n";

const baseUrl =
  process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000";

interface BrandedEmailOptions {
  /** Icon displayed in the header banner (HTML entity or emoji) */
  icon: string;
  /** Heading text in the banner */
  heading: string;
  /** Subheading text below the heading */
  subheading?: string;
  /** Main body HTML (placed inside the card) */
  body: string;
  /** CTA button label */
  ctaLabel?: string;
  /** CTA button URL */
  ctaUrl?: string;
  /** Preheader text (shown in email preview, hidden in body) */
  preheader?: string;
}

export async function brandedEmailHtml(
  options: BrandedEmailOptions,
): Promise<string> {
  const messages = await getMessages("email");
  const { icon, heading, subheading, body, ctaLabel, ctaUrl, preheader } =
    options;

  const ctaHtml =
    ctaLabel && ctaUrl
      ? `<table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top: 28px;">
          <tr>
            <td align="center">
              <a href="${ctaUrl}" style="display: inline-block; padding: 14px 32px; background: #7a8f4f; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; border-radius: 12px; letter-spacing: 0.3px;">${ctaLabel}</a>
            </td>
          </tr>
        </table>
        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top: 16px;">
          <tr>
            <td align="center">
              <p style="margin: 0; font-size: 12px; color: #8a8a8a; line-height: 1.6; word-break: break-all;">${ctaUrl}</p>
            </td>
          </tr>
        </table>`
      : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${heading} - ${t(messages, "brandName")}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f2ead0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  ${preheader ? `<div style="display: none; max-height: 0; overflow: hidden;">${preheader}</div>` : ""}

  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f2ead0;">
    <tr>
      <td align="center" style="padding: 40px 16px;">
        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 560px;">

          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom: 32px;">
              <a href="${baseUrl}" style="text-decoration: none;">
                <span style="font-family: 'Outfit', 'Helvetica Neue', Arial, sans-serif; font-size: 24px; font-weight: 700; color: #1a1a1a; letter-spacing: -0.5px;">${t(messages, "brandName")}</span>
              </a>
            </td>
          </tr>

          <!-- Main Card -->
          <tr>
            <td style="background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04);">

              <!-- Header Banner -->
              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="background: linear-gradient(135deg, #7a8f4f 0%, #9bab66 100%); padding: 36px 32px; text-align: center;">
                    <div style="width: 56px; height: 56px; margin: 0 auto 16px; background: rgba(255,255,255,0.2); border-radius: 50%; line-height: 56px; font-size: 24px;">${icon}</div>
                    <h1 style="margin: 0; font-family: 'Outfit', 'Helvetica Neue', Arial, sans-serif; font-size: 24px; font-weight: 700; color: #ffffff; line-height: 1.3;">${heading}</h1>
                    ${subheading ? `<p style="margin: 8px 0 0; font-size: 15px; color: rgba(255,255,255,0.9);">${subheading}</p>` : ""}
                  </td>
                </tr>
              </table>

              <!-- Body -->
              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="padding: 32px;">
                    ${body}
                    ${ctaHtml}
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 32px 16px; text-align: center;">
              <p style="margin: 0; font-size: 13px; color: #8a8a8a; line-height: 1.6;">
                ${t(messages, "didNotRequest")}
              </p>
              <p style="margin: 16px 0 0; font-size: 12px; color: #b0b0b0;">
                ${t(messages, "allRightsReserved", { year: String(new Date().getFullYear()) })}
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
