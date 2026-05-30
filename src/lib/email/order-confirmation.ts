import { getMessages, t } from "@/lib/i18n";
import { getLocale, type SupportedLocale } from "@/lib/locale";
import { sendEmail } from "./resend";

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  imageUrl?: string | null;
}

interface OrderConfirmationData {
  orderId: number | string;
  customerEmail: string;
  customerName?: string;
  items: OrderItem[];
  totalAmount: number;
  currency?: string;
  shippingAddress?: {
    firstName?: string | null;
    lastName?: string | null;
    addressLine1?: string | null;
    addressLine2?: string | null;
    city?: string | null;
    state?: string | null;
    postalCode?: string | null;
    country?: string | null;
  } | null;
  orderDate: string;
  discountCode?: string | null;
  discountAmount?: number | null;
}

function formatCurrency(
  amount: number,
  locale: SupportedLocale,
  currency = "USD",
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(amount / 100);
}

function formatDate(dateString: string, locale: SupportedLocale): string {
  return new Intl.DateTimeFormat(locale, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(dateString));
}

async function buildOrderConfirmationHtml(
  data: OrderConfirmationData,
): Promise<string> {
  const locale = await getLocale();
  const messages = await getMessages("email");
  const baseUrl =
    process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000";

  const itemsHtml = data.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 16px 0; border-bottom: 1px solid #f0ece8;">
          <table cellpadding="0" cellspacing="0" border="0" width="100%">
            <tr>
              <td width="56" valign="top">
                ${
                  item.imageUrl
                    ? `<img src="${item.imageUrl}" alt="${item.name}" width="48" height="48" style="border-radius: 8px; object-fit: cover; display: block;" />`
                    : `<div style="width: 48px; height: 48px; border-radius: 8px; background: #f5f1ed; display: flex; align-items: center; justify-content: center;">
                        <span style="color: #b8a99a; font-size: 20px;">&#9744;</span>
                      </div>`
                }
              </td>
              <td style="padding-left: 12px;" valign="top">
                <p style="margin: 0; font-size: 14px; font-weight: 600; color: #1a1a1a;">${item.name}</p>
                <p style="margin: 4px 0 0; font-size: 13px; color: #6b6b6b;">${t(messages, "quantity", { quantity: String(item.quantity) })}</p>
              </td>
              <td align="right" valign="top" style="white-space: nowrap;">
                <p style="margin: 0; font-size: 14px; font-weight: 600; color: #1a1a1a;">${formatCurrency(item.price * item.quantity * 100, locale, data.currency)}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>`,
    )
    .join("");

  const addressHtml = data.shippingAddress?.addressLine1
    ? `
      <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top: 24px;">
        <tr>
          <td style="padding: 20px; background: #faf8f6; border-radius: 12px;">
            <p style="margin: 0 0 8px; font-size: 13px; font-weight: 700; color: #1a1a1a; text-transform: uppercase; letter-spacing: 0.5px;">${t(messages, "shippingAddressLabel")}</p>
            <p style="margin: 0; font-size: 14px; color: #4a4a4a; line-height: 1.6;">
              ${[data.shippingAddress.firstName, data.shippingAddress.lastName].filter(Boolean).join(" ")}<br/>
              ${data.shippingAddress.addressLine1}
              ${data.shippingAddress.addressLine2 ? `<br/>${data.shippingAddress.addressLine2}` : ""}
              <br/>${[data.shippingAddress.city, data.shippingAddress.state, data.shippingAddress.postalCode].filter(Boolean).join(", ")}
              ${data.shippingAddress.country ? `<br/>${data.shippingAddress.country}` : ""}
            </p>
          </td>
        </tr>
      </table>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${t(messages, "orderConfirmed")} - ${t(messages, "brandName")}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f3f0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <!-- Preheader text -->
  <div style="display: none; max-height: 0; overflow: hidden;">
    ${t(messages, "orderConfirmationPreheader", { orderId: String(data.orderId) })}
  </div>

  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f5f3f0;">
    <tr>
      <td align="center" style="padding: 40px 16px;">
        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 560px;">

          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom: 32px;">
              <a href="${baseUrl}" style="text-decoration: none;">
                <span style="font-family: Georgia, 'Times New Roman', serif; font-size: 24px; font-weight: 700; color: #1a1a1a; letter-spacing: -0.5px;">${t(messages, "brandName")}</span>
              </a>
            </td>
          </tr>

          <!-- Main Card -->
          <tr>
            <td style="background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04);">

              <!-- Header Banner -->
              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="background: linear-gradient(135deg, #d4722a 0%, #e8944d 100%); padding: 36px 32px; text-align: center;">
                    <div style="width: 56px; height: 56px; margin: 0 auto 16px; background: rgba(255,255,255,0.2); border-radius: 50%; line-height: 56px; font-size: 24px;">&#10003;</div>
                    <h1 style="margin: 0; font-family: Georgia, 'Times New Roman', serif; font-size: 24px; font-weight: 700; color: #ffffff; line-height: 1.3;">${t(messages, "orderConfirmed")}</h1>
                    <p style="margin: 8px 0 0; font-size: 15px; color: rgba(255,255,255,0.9);">${data.customerName ? t(messages, "thankYouForPurchaseWithName", { name: data.customerName }) : t(messages, "thankYouForPurchase")}</p>
                  </td>
                </tr>
              </table>

              <!-- Body -->
              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="padding: 32px;">

                    <!-- Order Info Row -->
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 24px;">
                      <tr>
                        <td style="padding: 16px; background: #faf8f6; border-radius: 12px;">
                          <table cellpadding="0" cellspacing="0" border="0" width="100%">
                            <tr>
                              <td>
                                <p style="margin: 0; font-size: 12px; font-weight: 700; color: #8a8a8a; text-transform: uppercase; letter-spacing: 0.5px;">${t(messages, "orderNumber")}</p>
                                <p style="margin: 4px 0 0; font-size: 16px; font-weight: 700; color: #1a1a1a; font-family: 'Courier New', monospace;">#${data.orderId}</p>
                              </td>
                              <td align="right">
                                <p style="margin: 0; font-size: 12px; font-weight: 700; color: #8a8a8a; text-transform: uppercase; letter-spacing: 0.5px;">${t(messages, "date")}</p>
                                <p style="margin: 4px 0 0; font-size: 14px; color: #1a1a1a;">${formatDate(data.orderDate, locale)}</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <!-- Items Header -->
                    <p style="margin: 0 0 12px; font-size: 13px; font-weight: 700; color: #1a1a1a; text-transform: uppercase; letter-spacing: 0.5px;">${t(messages, "orderItems")}</p>

                    <!-- Items List -->
                    <table cellpadding="0" cellspacing="0" border="0" width="100%">
                      ${itemsHtml}
                    </table>

                    ${
                      data.discountCode && data.discountAmount
                        ? `<!-- Discount -->
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top: 16px;">
                      <tr>
                        <td style="padding: 12px 16px; background: #f0fdf4; border-radius: 8px;">
                          <table cellpadding="0" cellspacing="0" border="0" width="100%">
                            <tr>
                              <td>
                                <p style="margin: 0; font-size: 14px; color: #16a34a;">&#127991; ${t(messages, "discount", { code: data.discountCode })}</p>
                              </td>
                              <td align="right">
                                <p style="margin: 0; font-size: 14px; font-weight: 600; color: #16a34a;">-${formatCurrency(data.discountAmount, locale, data.currency)}</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>`
                        : ""
                    }

                    <!-- Total -->
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top: 20px;">
                      <tr>
                        <td style="padding: 16px 0; border-top: 2px solid #1a1a1a;">
                          <table cellpadding="0" cellspacing="0" border="0" width="100%">
                            <tr>
                              <td>
                                <p style="margin: 0; font-size: 16px; font-weight: 700; color: #1a1a1a;">${t(messages, "total")}</p>
                              </td>
                              <td align="right">
                                <p style="margin: 0; font-size: 20px; font-weight: 700; color: #d4722a;">${formatCurrency(data.totalAmount, locale, data.currency)}</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    ${addressHtml}

                    <!-- CTA Button -->
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top: 32px;">
                      <tr>
                        <td align="center">
                          <a href="${baseUrl}/account/orders" style="display: inline-block; padding: 14px 32px; background: #d4722a; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; border-radius: 12px; letter-spacing: 0.3px;">${t(messages, "viewYourOrders")}</a>
                        </td>
                      </tr>
                    </table>

                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 32px 16px; text-align: center;">
              <p style="margin: 0; font-size: 13px; color: #8a8a8a; line-height: 1.6;">
                ${t(messages, "orderQuestionsPrompt", { contactUrl: `${baseUrl}/contact` })}
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

async function buildOrderConfirmationText(
  data: OrderConfirmationData,
): Promise<string> {
  const locale = await getLocale();
  const messages = await getMessages("email");

  const itemsList = data.items
    .map(
      (item) =>
        `  - ${item.name} x${item.quantity} — ${formatCurrency(item.price * item.quantity * 100, locale, data.currency)}`,
    )
    .join("\n");

  const discountLine =
    data.discountCode && data.discountAmount
      ? `\n${t(messages, "discountText", { code: data.discountCode, amount: formatCurrency(data.discountAmount, locale, data.currency) })}`
      : "";

  return `${t(messages, "orderConfirmedText")}

${data.customerName ? t(messages, "thankYouForPurchaseWithName", { name: data.customerName }) : t(messages, "thankYouForPurchase")}

${t(messages, "orderNumber")} #${data.orderId}
${t(messages, "date")}: ${formatDate(data.orderDate, locale)}

${t(messages, "itemsText")}
${itemsList}
${discountLine}
${t(messages, "totalText", { amount: formatCurrency(data.totalAmount, locale, data.currency) })}

${t(messages, "viewOrdersText", { url: `${process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000"}/account/orders` })}

${t(messages, "contactUsText", { url: `${process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000"}/contact` })}

— ${t(messages, "brandName")}`;
}

export async function sendOrderConfirmationEmail(
  data: OrderConfirmationData,
): Promise<void> {
  const messages = await getMessages("email");
  const html = await buildOrderConfirmationHtml(data);
  const text = await buildOrderConfirmationText(data);

  await sendEmail({
    to: data.customerEmail,
    subject: `${t(messages, "orderConfirmed")} — #${data.orderId}`,
    html,
    text,
  });
}
