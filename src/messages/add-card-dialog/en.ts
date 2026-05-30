export default {
  // Dialog header
  dialogTitle: "Add New Card",
  dialogDescription: "Add your card details and billing address.",

  // Loading & errors
  loadingForm: "Loading form...",
  errorInitializeForm: "Failed to initialize card form",
  errorSaveCard: "Failed to save card. Please try again.",
  successCardAdded: "Card added successfully",

  // Card form
  cardNickname: "Card nickname",
  optional: "(optional)",
  cardNicknamePlaceholder: 'e.g. "Personal Visa", "Work Card"',

  // Billing address
  billingAddress: "Billing Address",
  copyFromShipping: "Copy from shipping",

  // Form fields
  firstName: "First name",
  firstNamePlaceholder: "John",
  lastName: "Last name",
  lastNamePlaceholder: "Doe",
  address: "Address",
  addressPlaceholder: "123 Main Street",
  apartmentSuite: "Apartment, suite, etc.",
  apartmentPlaceholder: "Apt 4B",
  city: "City",
  cityPlaceholder: "New York",
  stateProvince: "State / Province",
  statePlaceholder: "NY",
  postalCode: "Postal code",
  postalCodePlaceholder: "10001",
  country: "Country",

  // Actions
  cancel: "Cancel",
  saveCard: "Save Card",
  saving: "Saving...",
} as const;
