const emailEs = {
  // Brand
  brandName: "SaaSTARTER",

  // Order Confirmation
  orderConfirmed: "Pedido Confirmado",
  thankYouForPurchase: "Gracias por tu compra",
  thankYouForPurchaseWithName: "¡Gracias por tu compra, {name}!",
  orderNumber: "Número de Pedido",
  date: "Fecha",
  orderItems: "Artículos del Pedido",
  quantity: "Cant: {quantity}",
  discount: "Descuento ({code})",
  total: "Total",
  shippingAddressLabel: "Dirección de Envío",
  viewYourOrders: "Ver Tus Pedidos",
  orderQuestionsPrompt:
    'Si tienes alguna pregunta sobre tu pedido,<br/>no dudes en <a href="{contactUrl}" style="color: #d4722a; text-decoration: underline;">contactar a nuestro equipo de soporte</a>.',

  // Email Preheaders
  orderConfirmationPreheader:
    "Tu pedido #{orderId} ha sido confirmado. ¡Gracias por tu compra!",

  // Generic branded email
  didNotRequest:
    "Si no solicitaste esto, puedes ignorar este correo de forma segura.",
  allRightsReserved: "© {year} SaaSTARTER. Todos los derechos reservados.",

  // Order Confirmation Text (plain text)
  orderConfirmedText: "PEDIDO CONFIRMADO",
  itemsText: "Artículos:",
  discountText: "Descuento ({code}): -{amount}",
  totalText: "Total: {amount}",
  viewOrdersText: "Ver tus pedidos: {url}",
  contactUsText: "Si tienes alguna pregunta, contáctanos en {url}",

  // Order Status Update
  orderStatusUpdated: "Estado del Pedido Actualizado",
  orderStatusSubheading: "Tu pedido #{orderId} ha sido actualizado.",
  orderStatusPreheader: "El estado de tu pedido #{orderId} cambió a {status}.",
  orderStatusBody:
    "El estado de tu pedido <strong>#{orderId}</strong> se actualizó a <strong>{status}</strong>.",
  orderStatusProcessing: "Procesando",
  orderStatusShipped: "Enviado",
  orderStatusDelivered: "Entregado",
  orderStatusCancelled: "Cancelado",
  orderStatusCompleted: "Completado",
  orderStatusRefunded: "Reembolsado",
  viewOrder: "Ver Tu Pedido",
};

export default emailEs;
