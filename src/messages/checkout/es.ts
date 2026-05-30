const checkoutEs = {
  // Page
  pageTitle: "Pagar",
  pageDescription: "Complete su compra de forma segura",
  // Authentication prompt
  welcomeBack: "¡Bienvenido de nuevo, {name}!",
  loggedInMessage: "Ha iniciado sesión y está listo para pagar.",
  checkoutAsGuest: "Pagar como Invitado",
  alreadyHaveAccount: "¿Ya tiene una cuenta?",
  createAccountBenefits:
    "Cree una cuenta para rastrear pedidos y pagar más rápido la próxima vez.",
  loginButton: "Iniciar Sesión",
  signupButton: "Registrarse",
  orContinueAsGuest: "o continuar como invitado",
  // Empty cart
  cartEmpty: "Tu carrito está vacío",
  emptyCartMessage: "Agrega algunos productos antes de pagar.",
  browseProducts: "Explorar Productos",

  // Back button
  backToBilling: "Volver a detalles de facturación",

  // Contact Information
  contactInformation: "Información de Contacto",
  emailAddress: "Dirección de correo electrónico",
  emailPlaceholder: "tu@ejemplo.com",
  usingAccountEmail: "Usando el correo electrónico de tu cuenta",

  // Shipping Address
  shippingAddress: "Dirección de Envío",
  firstName: "Nombre",
  firstNamePlaceholder: "Juan",
  lastName: "Apellido",
  lastNamePlaceholder: "Pérez",
  address: "Dirección",
  addressPlaceholder: "Calle Principal 123",
  addressLine2: "Apartamento, suite, etc.",
  optional: "(opcional)",
  addressLine2Placeholder: "Apto 4B",
  city: "Ciudad",
  cityPlaceholder: "Madrid",
  stateProvince: "Estado / Provincia",
  statePlaceholder: "Madrid",
  postalCode: "Código postal",
  postalCodePlaceholder: "28001",
  country: "País",
  saveAddressForFutureOrders: "Guardar esta dirección para pedidos futuros",

  // Form buttons
  processing: "Procesando...",
  continueToPayment: "Continuar al Pago",

  // Order Summary
  orderSummary: "Resumen del Pedido",
  quantity: "Cant: {quantity}",
  discountCode: "Código de descuento",
  discountCodePlaceholder: "Código de descuento",
  discountPercentageLabel: "{percentage}% de descuento",
  discountFlatLabel: "{amount} de descuento",
  removeDiscount: "Eliminar descuento",
  apply: "Aplicar",
  subtotal: "Subtotal",
  total: "Total",

  // Payment Details
  paymentDetails: "Detalles de Pago",
  default: "Predeterminada",
  expiresShort: "Vence el {expiry}",
  editCard: "Editar tarjeta",
  removeCard: "Eliminar tarjeta",
  addNewCard: "Agregar una nueva tarjeta",
  enterCardManually: "Ingresar detalles de tarjeta manualmente",
  savePaymentMethod: "Guardar método de pago para futuras compras",
  savePaymentMethodDescription:
    "Almacena esta tarjeta de forma segura para hacer pagos más rápidos en el futuro",

  // Billing Address
  billingAddress: "Dirección de Facturación",
  copyFromShipping: "Copiar del envío",

  // Payment button
  processingPayment: "Procesando pago...",
  pay: "Pagar {amount}",
  securedByStripe:
    "Protegido por Stripe. Tu información de pago está encriptada.",

  // Edit Card Dialog
  editCardTitle: "Editar Tarjeta",
  editCardDescription:
    "Actualiza el apodo y la dirección de facturación de esta tarjeta.",
  cardEndingIn: "{brand} terminada en {last4}",
  cardNickname: "Apodo de la tarjeta",
  cardNicknamePlaceholder: 'ej. "Visa Personal", "Tarjeta de Trabajo"',
  cancel: "Cancelar",
  saving: "Guardando...",
  updateCard: "Actualizar Tarjeta",

  // Delete Card Dialog
  removeCardTitle: "Eliminar Tarjeta",
  removeCardDescription:
    '¿Estás seguro de que quieres eliminar "{card}"? Esta acción no se puede deshacer.',
  removeCardDescriptionNoAlias:
    "¿Estás seguro de que quieres eliminar {brand} ••{last4}? Esta acción no se puede deshacer.",
  removing: "Eliminando...",
  removeCardButton: "Eliminar Tarjeta",

  // Checkout Success
  confirmingOrder: "Confirmando tu pedido...",
  pleaseWait: "Por favor espera mientras finalizamos tu compra.",
  somethingWentWrong: "Algo salió mal",
  errorConfirmingOrder: "Ocurrió un error al confirmar tu pedido.",
  tryAgain: "Intentar de Nuevo",
  contactSupport: "Contactar Soporte",
  thankYouForPurchase: "¡Gracias por tu compra!",
  orderConfirmed: "Tu pedido ha sido confirmado y está siendo procesado.",
  orderId: "ID de Pedido:",
  whatHappensNext: "¿Qué sucede después?",
  confirmationEmailMessage:
    "Recibirás un correo de confirmación en breve con los detalles de tu pedido. Si tienes alguna pregunta, no dudes en contactar a nuestro equipo de soporte.",
  viewYourOrders: "Ver tus Pedidos",
  continueShopping: "Continuar Comprando",

  // Errors
  errorInitiatingPayment:
    "No se pudo iniciar el pago. Por favor, inténtalo de nuevo.",
  errorVerifyingAmount:
    "No se pudo verificar el monto del pago. Por favor, inténtalo de nuevo.",
  errorPaymentFailed: "El pago falló. Por favor, inténtalo de nuevo.",
  errorUnexpected:
    "Ocurrió un error inesperado. Por favor, inténtalo de nuevo.",
  errorSessionExpired:
    "Tu sesión de pago anterior ha expirado. Por favor, inténtalo de nuevo.",
  errorInvalidDiscount: "Código de descuento no válido",
  errorValidatingDiscount:
    "No se pudo validar el código. Por favor, inténtalo de nuevo.",

  // Toast messages
  toastCardUpdated: "Tarjeta actualizada",
  toastCardUpdateFailed: "No se pudo actualizar la tarjeta",
  toastCardRemoved: "Método de pago eliminado",
  toastCardRemoveFailed: "No se pudo eliminar la tarjeta",
} as const;

export default checkoutEs;
