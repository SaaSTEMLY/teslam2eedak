const emailAr = {
  // Brand
  brandName: "SaaSTARTER",

  // Order Confirmation
  orderConfirmed: "تم تأكيد الطلب",
  thankYouForPurchase: "شكراً لك على الشراء",
  thankYouForPurchaseWithName: "شكراً لك على الشراء، {name}!",
  orderNumber: "رقم الطلب",
  date: "التاريخ",
  orderItems: "عناصر الطلب",
  quantity: "الكمية: {quantity}",
  discount: "الخصم ({code})",
  total: "المجموع",
  shippingAddressLabel: "عنوان الشحن",
  viewYourOrders: "عرض طلباتك",
  orderQuestionsPrompt:
    'إذا كانت لديك أي أسئلة حول طلبك،<br/>لا تتردد في <a href="{contactUrl}" style="color: #d4722a; text-decoration: underline;">التواصل مع فريق الدعم</a>.',

  // Email Preheaders
  orderConfirmationPreheader: "تم تأكيد طلبك #{orderId}. شكراً لك على الشراء!",

  // Generic branded email
  didNotRequest: "إذا لم تطلب هذا، يمكنك تجاهل هذا البريد الإلكتروني بأمان.",
  allRightsReserved: "© {year} SaaSTARTER. جميع الحقوق محفوظة.",

  // Order Confirmation Text (plain text)
  orderConfirmedText: "تم تأكيد الطلب",
  itemsText: "العناصر:",
  discountText: "الخصم ({code}): -{amount}",
  totalText: "المجموع: {amount}",
  viewOrdersText: "عرض طلباتك: {url}",
  contactUsText: "إذا كانت لديك أي أسئلة، تواصل معنا على {url}",

  // Order Status Update
  orderStatusUpdated: "تحديث حالة الطلب",
  orderStatusSubheading: "تم تحديث طلبك #{orderId}.",
  orderStatusPreheader: "تم تغيير حالة طلبك #{orderId} إلى {status}.",
  orderStatusBody:
    "تم تحديث حالة طلبك <strong>#{orderId}</strong> إلى <strong>{status}</strong>.",
  orderStatusProcessing: "قيد المعالجة",
  orderStatusShipped: "تم الشحن",
  orderStatusDelivered: "تم التوصيل",
  orderStatusCancelled: "ملغى",
  orderStatusCompleted: "مكتمل",
  orderStatusRefunded: "مسترد",
  viewOrder: "عرض طلبك",
};

export default emailAr;
