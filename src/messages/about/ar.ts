const messages = {
  // Metadata
  metaTitle: "من نحن",
  metaDescription:
    "تعرّف على الفريق والرؤية وراء SaaSTARTER — قالب Next.js الجاهز للإنتاج والمصمم للسرعة.",

  // Hero
  pageTitle: "صُنع للبنّائين.",
  pageSubtitle:
    "نؤمن بأن إطلاق منتجك يجب أن يستغرق أيامًا لا أشهرًا. SaaSTARTER يمنحك الأساس لتركّز على ما يهم — فكرتك.",

  // Mission
  missionTitle: "مهمتنا",
  missionDescription:
    "إزالة حاجز الأكواد المتكررة بين الفكرة الرائعة والمنتج الحي. نصنع قوالب جاهزة للإنتاج حتى يتمكن المؤسسون والمطورون من الإطلاق بشكل أسرع.",

  // Stats
  stat1Value: "+10 آلاف",
  stat1Label: "مطوّر",
  stat2Value: "99.9%",
  stat2Label: "وقت التشغيل",
  stat3Value: "+50",
  stat3Label: "دولة",
  stat4Value: "24/7",
  stat4Label: "الدعم",

  // Values
  valuesTitle: "ما نؤمن به",
  value1Title: "السرعة فوق الكمال",
  value1Description:
    "أطلق مبكرًا، وتعلّم بسرعة. قوالبنا مصممة لإيصالك إلى السوق في وقت قياسي دون التضحية بالجودة.",
  value2Title: "تجربة المطوّر",
  value2Description:
    "كود نظيف، أنواع قوية، وإعدادات افتراضية منطقية. نهتم بالتفاصيل حتى تتمكن من التركيز على البناء.",
  value3Title: "الانفتاح كإعداد افتراضي",
  value3Description:
    "تسعير شفاف، توثيق مفتوح، ونهج يضع المجتمع أولاً في كل قرار نتخذه.",
  value4Title: "عالمي من اليوم الأول",
  value4Description:
    "دعم مدمج للتعدد اللغوي واتجاه الكتابة من اليمين لليسار وتصميم متاح — لأن البرمجيات الرائعة لا حدود لها.",

  // Team
  teamTitle: "الأشخاص وراء المنتج",
  teamSubtitle: "فريق صغير ومركّز مهووس بتجربة المطوّر وجودة المنتج.",
  team1Name: "أليكس تشين",
  team1Role: "المؤسس والمهندس الرئيسي",
  team1Bio:
    "مطوّر متكامل بخبرة تزيد عن 10 سنوات في بناء منتجات SaaS. عمل سابقًا في Vercel وStripe.",
  team2Name: "سارة مارتينيز",
  team2Role: "التصميم والواجهة الأمامية",
  team2Bio:
    "مصممة UI/UX تؤمن بأن الواجهات الرائعة يجب أن تكون غير مرئية. تدافع عن إمكانية الوصول في كل مكان.",
  team3Name: "جوردان لي",
  team3Role: "الخلفية والبنية التحتية",
  team3Bio:
    "مهندس أنظمة يركّز على الأداء والموثوقية. يضمن أن كل شيء يعمل بسلاسة على نطاق واسع.",

  // CTA
  ctaTitle: "مستعد للإطلاق؟",
  ctaDescription:
    "ابدأ ببناء SaaS الخاص بك اليوم مع قالب يعمل فعلاً من أول لحظة.",
  ctaButton: "استكشف المنتجات",

  // Navigation
  backToHome: "العودة للرئيسية",
} as const;

export default messages;
export type AboutMessages = Record<keyof typeof messages, string>;
