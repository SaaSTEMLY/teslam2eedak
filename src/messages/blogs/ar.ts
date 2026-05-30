const messages = {
  // Blogs listing page
  metaTitle: "المدونة",
  metaDescription:
    "رؤى ودروس وتحديثات من فريق SaaSTARTER. تعلم كيفية بناء تطبيقات SaaS الحديثة.",
  pageTitle: "المدونة.",
  pageSubtitle: "دروس وتحديثات وأفكار حول بناء SaaS.",
  noPostsTitle: "لا توجد منشورات بعد",
  noPostsDescription: "تحقق مرة أخرى قريبًا للحصول على محتوى جديد.",

  // Blog post page
  postNotFoundTitle: "المنشور غير موجود | SaaSTARTER",
  backToBlog: "جميع المنشورات",
  morePosts: "المزيد من المنشورات",
  getInTouch: "تواصل معنا",

  // Filter/sort
  searchPlaceholder: "ابحث في المنشورات...",
  allCategories: "الكل",
  sortNewest: "الأحدث",
  sortOldest: "الأقدم",
  sortTitleAsc: "العنوان أ-ي",
  clearFilters: "مسح الفلاتر",
  noResults: "لم يتم العثور على نتائج",
  noResultsDescription: "جرب مصطلح بحث أو فئة مختلفة.",
  backToHome: "العودة للرئيسية",

  // Category labels
  categoryEngineering: "هندسة",
  categoryProduct: "منتج",
  categoryCompany: "شركة",
  categoryTutorial: "شرح",
  categoryAnnouncement: "إعلان",
} as const;

export default messages;
export type BlogsMessages = typeof messages;
