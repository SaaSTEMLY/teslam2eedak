const accountEs = {
  // Navigation
  navSettings: "Cuenta",
  navSecurity: "Seguridad",
  navBilling: "Facturación",
  navOrders: "Pedidos",
  navWishlist: "Lista de Deseos",
  navDeveloper: "Desarrollador",
  // Page Header
  pageTitle: "Configuración",
  pageDescription:
    "Administra tu cuenta, seguridad y preferencias de facturación",
  // Loading States
  redirecting: "Redirigiendo...",
  loading: "Cargando...",
  // Aria Labels
  ariaNavigation: "Navegación de configuración de cuenta",

  // Shipping Address
  shippingAddressTitle: "Dirección de Envío",
  shippingAddressDescription:
    "Dirección predeterminada para el envío en nuevos pedidos",
  firstName: "Nombre",
  lastName: "Apellido",
  address: "Dirección",
  addressLine2: "Apartamento, suite, etc.",
  optional: "(opcional)",
  city: "Ciudad",
  stateProvince: "Estado / Provincia",
  postalCode: "Código postal",
  country: "País",
  addressPrefilledNote: "Esta dirección se completará automáticamente al pagar",
  saveAddress: "Guardar Dirección",
  saving: "Guardando...",
  saved: "Guardado",
  shippingAddressUpdated: "Dirección de envío actualizada",
  failedToUpdateAddress: "Error al actualizar la dirección de envío",

  // Placeholders
  firstNamePlaceholder: "Juan",
  lastNamePlaceholder: "Pérez",
  addressPlaceholder: "Calle Principal 123",
  addressLine2Placeholder: "Apto 4B",
  cityPlaceholder: "Madrid",
  statePlaceholder: "MD",
  postalCodePlaceholder: "28001",

  // Payment Methods
  paymentMethodsTitle: "Métodos de Pago",
  paymentMethodsDescription:
    "Administra tus tarjetas guardadas para pagos más rápidos",
  addCard: "Agregar Tarjeta",
  cardNickname: "Apodo de tarjeta",
  cardNicknamePlaceholder: "Visa Personal",
  paymentSecurityNote:
    "Tu información de pago está cifrada y procesada de forma segura a través de Stripe. Nunca almacenamos los detalles completos de tu tarjeta en nuestros servidores.",
  noCardsTitle: "Sin métodos de pago",
  noCardsDescription: "Agrega una tarjeta para pagos más rápidos",
  getStarted: "Comenzar",
  defaultCard: "Predeterminada",
  setAsDefault: "Establecer como predeterminada",
  editCard: "Editar Tarjeta",
  editCardDescription:
    "Actualiza el sobrenombre y la dirección de facturación de esta tarjeta.",
  billingAddress: "Dirección de Facturación",
  removeCard: "Eliminar Tarjeta",
  updateCard: "Actualizar Tarjeta",
  cardUpdated: "Tarjeta actualizada",
  removing: "Eliminando...",
  paymentMethodRemoved: "Método de pago eliminado",
  failedToRemoveCard: "Error al eliminar la tarjeta",
  defaultPaymentMethodUpdated: "Método de pago predeterminado actualizado",
  failedToSetDefault: "Error al establecer como predeterminada",
  failedToUpdateCard: "Error al actualizar la tarjeta",
  failedToLoadPaymentMethods: "Error al cargar métodos de pago",
  endingIn: "terminada en",
  expires: "Vence",
  expired: "Vencida",
  confirmRemoveTitle: "¿Eliminar método de pago?",
  confirmRemoveDescription: "¿Estás seguro de que deseas eliminar",
  confirmRemoveWarning: "? Esta acción no se puede deshacer.",
  cancel: "Cancelar",
  remove: "Eliminar",

  // Orders
  ordersTitle: "Historial de Pedidos",
  ordersDescription: "Ver y rastrear tus compras anteriores",
  ordersPlaced: "{count} pedido{s}",
  ordersPlacedOne: "1 pedido realizado",
  ordersPlacedTwo: "2 pedidos realizados",
  ordersPastPurchases: "Tus compras anteriores aparecerán aquí",
  noOrdersTitle: "Aún no hay pedidos",
  noOrdersDescription: "Tus compras anteriores aparecerán aquí",
  noOrdersDescriptionLong:
    "Una vez que realices una compra, tu historial de pedidos aparecerá aquí con todos los detalles.",
  shop: "Comprar",
  browseProducts: "Explorar Productos",
  startShopping: "Comenzar a Comprar",
  orderDetails: "Detalles del Pedido",
  orderNumber: "Pedido",
  orderId: "ID del Pedido",
  placedOn: "realizado el",
  paymentMethod: "Método de Pago",
  status: "Estado",
  date: "Fecha",
  currency: "Moneda",
  items: "artículos",
  item: "artículo",
  qty: "Cant:",
  quantity: "Cantidad",
  price: "Precio",
  subtotal: "Subtotal",
  shipping: "Envío",
  total: "Total",
  close: "Cerrar",
  viewDetails: "Ver detalles",
  failedToFetch: "Error al cargar",
  pageOfTotal: "Página {page} de {total}",
  previous: "Anterior",
  next: "Siguiente",

  // Order Status
  statusPending: "Pendiente",
  statusProcessing: "Procesando",
  statusShipped: "Enviado",
  statusDelivered: "Entregado",
  statusCompleted: "Completado",
  statusCancelled: "Cancelado",
  statusRefunded: "Reembolsado",

  // Order Timeline
  orderTimeline: "Línea de Tiempo",

  // Product
  product: "Producto",
  variant: "Variante",
} as const;

export default accountEs;
