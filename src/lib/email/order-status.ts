import { brandedEmailHtml } from "./template";
import { getMessages, t } from "@/lib/i18n";
import { sendEmail } from "./resend";

const statusIcons: Record<string, string> = {
  processing: "&#9881;",
  shipped: "&#128666;",
  delivered: "&#9989;",
  completed: "&#9989;",
  cancelled: "&#10060;",
  refunded: "&#128260;",
};

export async function sendOrderStatusEmail({
  orderId,
  customerEmail,
  customerName,
  newStatus,
}: {
  orderId: number | string;
  customerEmail: string;
  customerName?: string | null;
  newStatus: string;
}) {
  const messages = await getMessages("email");

  const statusKey =
    `orderStatus${newStatus.charAt(0).toUpperCase()}${newStatus.slice(1)}` as keyof typeof messages;
  const statusLabel = messages[statusKey] || newStatus;

  const icon = statusIcons[newStatus] || "&#128230;";

  const baseUrl =
    process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000";

  const html = await brandedEmailHtml({
    icon,
    heading: t(messages, "orderStatusUpdated"),
    subheading: t(messages, "orderStatusSubheading", {
      orderId: String(orderId),
    }),
    preheader: t(messages, "orderStatusPreheader", {
      orderId: String(orderId),
      status: statusLabel,
    }),
    body: `<p style="margin: 0; font-size: 15px; color: #4a4a4a; line-height: 1.7;">
      ${customerName ? `Hi ${customerName}, ` : ""}${t(
        messages,
        "orderStatusBody",
        {
          orderId: String(orderId),
          status: statusLabel,
        },
      )}
    </p>`,
    ctaLabel: t(messages, "viewOrder"),
    ctaUrl: `${baseUrl}/account?tab=orders`,
  });

  await sendEmail({
    to: customerEmail,
    subject: `${t(messages, "orderStatusUpdated")} — #${orderId}`,
    html,
  });
}
