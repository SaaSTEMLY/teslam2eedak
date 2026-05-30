const emailEn = {
  // Brand
  brandName: "SaaSTARTER",

  // Order Confirmation
  orderConfirmed: "Order Confirmed",
  thankYouForPurchase: "Thank you for your purchase",
  thankYouForPurchaseWithName: "Thank you for your purchase, {name}!",
  orderNumber: "Order Number",
  date: "Date",
  orderItems: "Order Items",
  quantity: "Qty: {quantity}",
  discount: "Discount ({code})",
  total: "Total",
  shippingAddressLabel: "Shipping Address",
  viewYourOrders: "View Your Orders",
  orderQuestionsPrompt:
    'If you have any questions about your order,<br/>feel free to <a href="{contactUrl}" style="color: #d4722a; text-decoration: underline;">contact our support team</a>.',

  // Email Preheaders
  orderConfirmationPreheader:
    "Your order #{orderId} has been confirmed. Thank you for your purchase!",

  // Generic branded email
  didNotRequest:
    "If you didn't request this, you can safely ignore this email.",
  allRightsReserved: "© {year} SaaSTARTER. All rights reserved.",

  // Order Confirmation Text (plain text)
  orderConfirmedText: "ORDER CONFIRMED",
  itemsText: "Items:",
  discountText: "Discount ({code}): -{amount}",
  totalText: "Total: {amount}",
  viewOrdersText: "View your orders: {url}",
  contactUsText: "If you have any questions, contact us at {url}",

  // Order Status Update
  orderStatusUpdated: "Order Status Updated",
  orderStatusSubheading: "Your order #{orderId} has been updated.",
  orderStatusPreheader: "Your order #{orderId} status has changed to {status}.",
  orderStatusBody:
    "The status of your order <strong>#{orderId}</strong> has been updated to <strong>{status}</strong>.",
  orderStatusProcessing: "Processing",
  orderStatusShipped: "Shipped",
  orderStatusDelivered: "Delivered",
  orderStatusCancelled: "Cancelled",
  orderStatusCompleted: "Completed",
  orderStatusRefunded: "Refunded",
  viewOrder: "View Your Order",
};

export default emailEn;
