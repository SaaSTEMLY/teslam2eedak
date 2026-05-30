export default {
  // Dialog header
  dialogTitle: "Agregar Nueva Tarjeta",
  dialogDescription:
    "Agregue los detalles de su tarjeta y la dirección de facturación.",

  // Loading & errors
  loadingForm: "Cargando formulario...",
  errorInitializeForm: "Error al inicializar el formulario de tarjeta",
  errorSaveCard: "Error al guardar la tarjeta. Por favor, inténtelo de nuevo.",
  successCardAdded: "Tarjeta agregada con éxito",

  // Card form
  cardNickname: "Apodo de la tarjeta",
  optional: "(opcional)",
  cardNicknamePlaceholder: 'ej. "Visa Personal", "Tarjeta de Trabajo"',

  // Billing address
  billingAddress: "Dirección de Facturación",
  copyFromShipping: "Copiar del envío",

  // Form fields
  firstName: "Nombre",
  firstNamePlaceholder: "Juan",
  lastName: "Apellido",
  lastNamePlaceholder: "Pérez",
  address: "Dirección",
  addressPlaceholder: "Calle Principal 123",
  apartmentSuite: "Apartamento, suite, etc.",
  apartmentPlaceholder: "Apt 4B",
  city: "Ciudad",
  cityPlaceholder: "Madrid",
  stateProvince: "Estado / Provincia",
  statePlaceholder: "Madrid",
  postalCode: "Código postal",
  postalCodePlaceholder: "28001",
  country: "País",

  // Actions
  cancel: "Cancelar",
  saveCard: "Guardar Tarjeta",
  saving: "Guardando...",
} as const;
