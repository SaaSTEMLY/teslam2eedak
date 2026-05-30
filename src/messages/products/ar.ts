const messages = {
  // Products listing page
  metaTitle: "المنتجات",
  metaDescription:
    "تصفح مجموعتنا من أدوات وقوالب وموارد SaaS المتميزة لتسريع عملك.",
  pageTitle: "المنتجات.",
  pageSubtitle: "أدوات وقوالب وموارد متميزة للإطلاق بشكل أسرع.",
  noProductsTitle: "لا توجد منتجات بعد",
  noProductsDescription: "تحقق مرة أخرى قريبًا للحصول على منتجات جديدة.",
  backToHome: "العودة إلى الرئيسية",

  // Product labels
  featured: "مميز",
  selectOptions: "اختر الخيارات",
  details: "التفاصيل",
  free: "مجاني",
  from: "من",

  // Product detail page
  productNotFoundTitle: "المنتج غير موجود | Koffee Kulture",
  backToProducts: "جميع المنتجات",
  detailsHeading: "التفاصيل",
  browseMore: "تصفح المزيد من المنتجات",
  needHelp: "هل تحتاج مساعدة في الاختيار؟",

  // Product category labels
  categoryTemplates: "قوالب",
  categoryTools: "أدوات",
  categoryServices: "خدمات",
  categoryResources: "موارد",
  categoryPlugins: "إضافات",
  categorySoftware: "برمجيات",
  categoryDigital: "رقمي",
  categoryPhysical: "مادي",

  // Product detail UI
  selectTier: "اختر المستوى",
  soldOut: "نفد المخزون",
  oneTime: "دفعة واحدة",
  inStock: "متوفر",
  outOfStock: "غير متوفر",
  quantity: "الكمية",
  decreaseQuantity: "تقليل الكمية",
  increaseQuantity: "زيادة الكمية",
  addedToCart: "أضيف إلى السلة!",
  addToCart: "أضف إلن السلة",
  added: "أضيف!",
  whatsIncluded: "ما المتضمن",
  lifetimeAccess: "وصول مدى الحياة لتحديثات المنتج",
  moneyBackGuarantee: "ضمان استرداد الأموال لمدة 14 يومًا",
  prioritySupport: "دعم ذو أولوية عبر البريد الإلكتروني",

  // Filters & Sorting
  searchPlaceholder: "ابحث عن المنتجات...",
  allCategories: "الكل",
  sortNewest: "الأحدث",
  sortPriceAsc: "السعر: من الأقل إلى الأعلى",
  sortPriceDesc: "السعر: من الأعلى إلى الأقل",
  sortNameAsc: "الاسم: أ إلى ي",
  noResults: "لا توجد منتجات تطابق البحث",
  noResultsDescription: "حاول تعديل البحث أو تصفية الفئات.",
  clearFilters: "مسح الفلاتر",

  // Categories (for filter tabs)
  categoryCourses: "دورات",
  categoryOther: "أخرى",
} as const;

export default messages;
export type ProductsMessages = typeof messages;
