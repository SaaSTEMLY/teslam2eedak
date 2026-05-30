const checkoutAr = {
  // Page
  pageTitle: "الدفع",
  pageDescription: "أكمل عملية الشراء بشكل آمن",
  // Authentication prompt
  welcomeBack: "مرحباً بعودتك، {name}!",
  loggedInMessage: "لقد قمت بتسجيل الدخول وأنت جاهز للدفع.",
  checkoutAsGuest: "الدفع كضيف",
  alreadyHaveAccount: "هل لديك حساب بالفعل؟",
  createAccountBenefits:
    "قم بإنشاء حساب لتتبع الطلبات والدفع بشكل أسرع في المرة القادمة.",
  loginButton: "تسجيل الدخول",
  signupButton: "التسجيل",
  orContinueAsGuest: "أو المتابعة كضيف",
  // Empty cart
  cartEmpty: "سلة التسوق فارغة",
  emptyCartMessage: "أضف بعض المنتجات قبل الخروج.",
  browseProducts: "تصفح المنتجات",

  // Back button
  backToBilling: "العودة إلى تفاصيل الفوترة",

  // Contact Information
  contactInformation: "معلومات الاتصال",
  emailAddress: "عنوان البريد الإلكتروني",
  emailPlaceholder: "you@example.com",
  usingAccountEmail: "استخدام البريد الإلكتروني للحساب",

  // Shipping Address
  shippingAddress: "عنوان الشحن",
  firstName: "الاسم الأول",
  firstNamePlaceholder: "أحمد",
  lastName: "اسم العائلة",
  lastNamePlaceholder: "محمد",
  address: "العنوان",
  addressPlaceholder: "123 شارع الرئيسي",
  addressLine2: "الشقة أو الجناح وما إلى ذلك",
  optional: "(اختياري)",
  addressLine2Placeholder: "شقة 4ب",
  city: "المدينة",
  cityPlaceholder: "الرياض",
  stateProvince: "الولاية / المحافظة",
  statePlaceholder: "الرياض",
  postalCode: "الرمز البريدي",
  postalCodePlaceholder: "12345",
  country: "البلد",
  saveAddressForFutureOrders: "حفظ هذا العنوان للطلبات المستقبلية",

  // Form buttons
  processing: "جاري المعالجة...",
  continueToPayment: "متابعة إلى الدفع",

  // Order Summary
  orderSummary: "ملخص الطلب",
  quantity: "الكمية: {quantity}",
  discountCode: "رمز الخصم",
  discountCodePlaceholder: "رمز الخصم",
  discountPercentageLabel: "خصم {percentage}٪",
  discountFlatLabel: "خصم {amount}",
  removeDiscount: "إزالة الخصم",
  apply: "تطبيق",
  subtotal: "المجموع الفرعي",
  total: "الإجمالي",

  // Payment Details
  paymentDetails: "تفاصيل الدفع",
  default: "افتراضي",
  expiresShort: "تنتهي في {expiry}",
  editCard: "تعديل البطاقة",
  removeCard: "إزالة البطاقة",
  addNewCard: "إضافة بطاقة جديدة",
  enterCardManually: "إدخال تفاصيل البطاقة يدويًا",
  savePaymentMethod: "حفظ طريقة الدفع للمشتريات المستقبلية",
  savePaymentMethodDescription:
    "احفظ هذه البطاقة بشكل آمن لإجراء عمليات دفع أسرع في المستقبل",

  // Billing Address
  billingAddress: "عنوان الفوترة",
  copyFromShipping: "نسخ من عنوان الشحن",

  // Payment button
  processingPayment: "جاري معالجة الدفع...",
  pay: "ادفع {amount}",
  securedByStripe: "محمي بواسطة Stripe. معلومات الدفع الخاصة بك مشفرة.",

  // Edit Card Dialog
  editCardTitle: "تعديل البطاقة",
  editCardDescription: "تحديث الاسم المستعار وعنوان الفوترة لهذه البطاقة.",
  cardEndingIn: "{brand} تنتهي في {last4}",
  cardNickname: "اسم البطاقة المستعار",
  cardNicknamePlaceholder: 'مثل "Visa الشخصية", "بطاقة العمل"',
  cancel: "إلغاء",
  saving: "جاري الحفظ...",
  updateCard: "تحديث البطاقة",

  // Delete Card Dialog
  removeCardTitle: "إزالة البطاقة",
  removeCardDescription:
    'هل أنت متأكد من أنك تريد إزالة "{card}"؟ لا يمكن التراجع عن هذا الإجراء.',
  removeCardDescriptionNoAlias:
    "هل أنت متأكد من أنك تريد إزالة {brand} ••{last4}؟ لا يمكن التراجع عن هذا الإجراء.",
  removing: "جاري الإزالة...",
  removeCardButton: "إزالة البطاقة",

  // Checkout Success
  confirmingOrder: "جاري تأكيد طلبك...",
  pleaseWait: "يرجى الانتظار بينما نقوم بإتمام عملية الشراء.",
  somethingWentWrong: "حدث خطأ ما",
  errorConfirmingOrder: "حدث خطأ أثناء تأكيد طلبك.",
  tryAgain: "حاول مرة أخرى",
  contactSupport: "اتصل بالدعم",
  thankYouForPurchase: "شكرًا لك على شرائك!",
  orderConfirmed: "تم تأكيد طلبك وهو قيد المعالجة.",
  orderId: "رقم الطلب:",
  whatHappensNext: "ماذا يحدث بعد ذلك؟",
  confirmationEmailMessage:
    "ستتلقى رسالة تأكيد عبر البريد الإلكتروني قريبًا مع تفاصيل طلبك. إذا كان لديك أي أسئلة، فلا تتردد في الاتصال بفريق الدعم لدينا.",
  viewYourOrders: "عرض طلباتك",
  continueShopping: "متابعة التسوق",

  // Errors
  errorInitiatingPayment: "فشل بدء الدفع. يرجى المحاولة مرة أخرى.",
  errorVerifyingAmount: "تعذر التحقق من مبلغ الدفع. يرجى المحاولة مرة أخرى.",
  errorPaymentFailed: "فشل الدفع. يرجى المحاولة مرة أخرى.",
  errorUnexpected: "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.",
  errorSessionExpired:
    "انتهت صلاحية جلسة الخروج السابقة. يرجى المحاولة مرة أخرى.",
  errorInvalidDiscount: "رمز خصم غير صالح",
  errorValidatingDiscount: "فشل التحقق من صحة الرمز. يرجى المحاولة مرة أخرى.",

  // Toast messages
  toastCardUpdated: "تم تحديث البطاقة",
  toastCardUpdateFailed: "فشل تحديث البطاقة",
  toastCardRemoved: "تم إزالة طريقة الدفع",
  toastCardRemoveFailed: "فشل إزالة البطاقة",
} as const;

export default checkoutAr;
