const checkoutEn = {
  // Page
  pageTitle: "Checkout",
  pageDescription: "Complete your purchase securely",

  // Authentication prompt
  welcomeBack: "Welcome back, {name}!",
  loggedInMessage: "You're logged in and ready to checkout.",
  checkoutAsGuest: "Checkout as Guest",
  alreadyHaveAccount: "Already have an account?",
  createAccountBenefits:
    "Create an account to track orders and checkout faster next time.",
  loginButton: "Log In",
  signupButton: "Sign Up",
  orContinueAsGuest: "or continue as guest",

  // Empty cart
  cartEmpty: "Your cart is empty",
  emptyCartMessage: "Add some products before checking out.",
  browseProducts: "Browse Products",

  // Back button
  backToBilling: "Back to billing details",

  // Contact Information
  contactInformation: "Contact Information",
  emailAddress: "Email address",
  emailPlaceholder: "you@example.com",
  usingAccountEmail: "Using your account email",

  // Shipping Address
  shippingAddress: "Shipping Address",
  firstName: "First name",
  firstNamePlaceholder: "John",
  lastName: "Last name",
  lastNamePlaceholder: "Doe",
  address: "Address",
  addressPlaceholder: "123 Main Street",
  addressLine2: "Apartment, suite, etc.",
  optional: "(optional)",
  addressLine2Placeholder: "Apt 4B",
  city: "City",
  cityPlaceholder: "New York",
  stateProvince: "State / Province",
  statePlaceholder: "NY",
  postalCode: "Postal code",
  postalCodePlaceholder: "10001",
  country: "Country",
  saveAddressForFutureOrders: "Save this address for future orders",

  // Form buttons
  processing: "Processing...",
  continueToPayment: "Continue to Payment",

  // Order Summary
  orderSummary: "Order Summary",
  quantity: "Qty: {quantity}",
  discountCode: "Discount code",
  discountCodePlaceholder: "Discount code",
  discountPercentageLabel: "{percentage}% off",
  discountFlatLabel: "{amount} off",
  removeDiscount: "Remove discount",
  apply: "Apply",
  subtotal: "Subtotal",
  total: "Total",

  // Payment Details
  paymentDetails: "Payment Details",
  default: "Default",
  expiresShort: "Expires {expiry}",
  editCard: "Edit card",
  removeCard: "Remove card",
  addNewCard: "Add a new card",
  enterCardManually: "Enter card details manually",
  savePaymentMethod: "Save payment method for future purchases",
  savePaymentMethodDescription:
    "Securely store this card to make future checkouts faster",

  // Billing Address
  billingAddress: "Billing Address",
  copyFromShipping: "Copy from shipping",

  // Payment button
  processingPayment: "Processing payment...",
  pay: "Pay {amount}",
  securedByStripe: "Secured by Stripe. Your payment info is encrypted.",

  // Edit Card Dialog
  editCardTitle: "Edit Card",
  editCardDescription: "Update the nickname and billing address for this card.",
  cardEndingIn: "{brand} ending in {last4}",
  cardNickname: "Card nickname",
  cardNicknamePlaceholder: 'e.g. "Personal Visa", "Work Card"',
  cancel: "Cancel",
  saving: "Saving...",
  updateCard: "Update Card",

  // Delete Card Dialog
  removeCardTitle: "Remove Card",
  removeCardDescription:
    'Are you sure you want to remove "{card}"? This action cannot be undone.',
  removeCardDescriptionNoAlias:
    "Are you sure you want to remove {brand} ••{last4}? This action cannot be undone.",
  removing: "Removing...",
  removeCardButton: "Remove Card",

  // Checkout Success
  confirmingOrder: "Confirming your order...",
  pleaseWait: "Please wait while we finalize your purchase.",
  somethingWentWrong: "Something went wrong",
  errorConfirmingOrder: "An error occurred while confirming your order.",
  tryAgain: "Try Again",
  contactSupport: "Contact Support",
  thankYouForPurchase: "Thank you for your purchase!",
  orderConfirmed: "Your order has been confirmed and is being processed.",
  orderId: "Order ID:",
  whatHappensNext: "What happens next?",
  confirmationEmailMessage:
    "You'll receive a confirmation email shortly with your order details. If you have any questions, feel free to contact our support team.",
  viewYourOrders: "View Your Orders",
  continueShopping: "Continue Shopping",

  // Errors
  errorInitiatingPayment: "Failed to initiate payment. Please try again.",
  errorVerifyingAmount: "Unable to verify payment amount. Please try again.",
  errorPaymentFailed: "Payment failed. Please try again.",
  errorUnexpected: "An unexpected error occurred. Please try again.",
  errorSessionExpired:
    "Your previous checkout session expired. Please try again.",
  errorInvalidDiscount: "Invalid discount code",
  errorValidatingDiscount: "Failed to validate code. Please try again.",

  // Toast messages
  toastCardUpdated: "Card updated",
  toastCardUpdateFailed: "Failed to update card",
  toastCardRemoved: "Payment method removed",
  toastCardRemoveFailed: "Failed to remove card",
} as const;

export default checkoutEn;
