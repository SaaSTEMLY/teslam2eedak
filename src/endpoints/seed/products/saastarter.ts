import {
  cellNode,
  paragraphNode,
  rowNode,
  textNode,
  type Dir,
} from "../lexical";

// ─── Types ──────────────────────────────────────────────

type Locale = "en" | "ar" | "es";

const dirFor: Record<Locale, Dir> = { en: "ltr", ar: "rtl", es: "ltr" };

// ─── Feature Table Data ─────────────────────────────────
//
// Tier hierarchy (each tier includes everything below it):
//   F LITE  → Core pages & performance
//   F PRO   → + Theming, dark mode, i18n & RTL
//   F+B LITE → + Admin panels, media management
//   F+B PRO  → + Full e-commerce & multi-provider auth

const T = true;
const F = false;

const featuresI18n: Record<Locale, string[]> = {
  en: [
    // ── Core ──
    "Optimized for Speed",
    "SEO Ready",
    "PWA Ready",
    "AI Ready",
    // ── Essential Pages ──
    "Landing Page",
    "About Page",
    "Terms of Service Page",
    "Privacy Policy Page",
    "License Page",
    // ── Content Pages ──
    "FAQ Page",
    "Contact Page",
    "Blog Pages",
    // ── Theming & i18n ──
    "Multiple Color Schemes",
    "Dark Mode",
    "Multi-Language & RTL Support",
    // ── Admin & Backend ──
    "FAQ Admin Panel",
    "Contact Admin Panel",
    "Blog Admin Panel",
    "Media Management & Storage Adapters",
    // ── E-commerce & Auth ──
    "E-commerce (Products, Cart, Checkout, Stripe, Orders)",
    "Auth (Email Verification, Google Login, Passkey)",
  ],
  ar: [
    "مُحسَّن للسرعة",
    "جاهز لمحركات البحث",
    "جاهز كتطبيق PWA",
    "جاهز للذكاء الاصطناعي",
    "صفحة الهبوط",
    "صفحة من نحن",
    "صفحة شروط الخدمة",
    "صفحة سياسة الخصوصية",
    "صفحة الترخيص",
    "صفحة الأسئلة الشائعة",
    "صفحة التواصل",
    "صفحات المدونة",
    "أنظمة ألوان متعددة",
    "الوضع الداكن",
    "تعدد اللغات ودعم RTL",
    "لوحة إدارة الأسئلة الشائعة",
    "لوحة إدارة التواصل",
    "لوحة إدارة المدونة",
    "إدارة الوسائط ومحولات التخزين",
    "التجارة الإلكترونية (منتجات، سلة، دفع، Stripe، طلبات)",
    "المصادقة (بريد إلكتروني، Google، مفتاح المرور)",
  ],
  es: [
    "Optimizado para Velocidad",
    "Listo para SEO",
    "Listo para PWA",
    "Listo para IA",
    "Página de Inicio",
    "Página Acerca de",
    "Página de Términos de Servicio",
    "Página de Política de Privacidad",
    "Página de Licencia",
    "Página de Preguntas Frecuentes",
    "Página de Contacto",
    "Páginas del Blog",
    "Esquemas de Colores Múltiples",
    "Modo Oscuro",
    "Multi-Idioma y Soporte RTL",
    "Panel Admin de FAQ",
    "Panel Admin de Contacto",
    "Panel Admin del Blog",
    "Gestión de Medios y Adaptadores de Almacenamiento",
    "E-commerce (Productos, Carrito, Checkout, Stripe, Pedidos)",
    "Auth (Verificación Email, Google Login, Passkey)",
  ],
};

// 21 features × 4 tiers
const featureMatrix: Record<string, boolean[]> = {
  "F LITE": [
    T,
    T,
    T,
    T, // Core
    T,
    T,
    T,
    T,
    T, // Essential Pages
    T,
    T,
    T, // Content Pages
    F,
    F,
    F, // Theming & i18n
    F,
    F,
    F,
    F, // Admin & Backend
    F,
    F, // E-commerce & Auth
  ],
  "F PRO": [
    T,
    T,
    T,
    T,
    T,
    T,
    T,
    T,
    T,
    T,
    T,
    T,
    T,
    T,
    T, // Theming & i18n unlocked
    F,
    F,
    F,
    F,
    F,
    F,
  ],
  "F+B LITE": [
    T,
    T,
    T,
    T,
    T,
    T,
    T,
    T,
    T,
    T,
    T,
    T,
    T,
    T,
    T,
    T,
    T,
    T,
    T, // Admin & Backend unlocked
    F,
    F,
  ],
  "F+B PRO": [
    T,
    T,
    T,
    T,
    T,
    T,
    T,
    T,
    T,
    T,
    T,
    T,
    T,
    T,
    T,
    T,
    T,
    T,
    T,
    T,
    T, // Everything unlocked
  ],
};

const check = (has: boolean) => (has ? "\u2713" : "\u2014");
const colWidth = 100;

const productIntro: Record<Locale, string> = {
  en: "Our top seller, four ways. The Salted Karamel is the drink that put us on the map — Maldon salt over a double shot, house karamel syrup, served hot, iced, blended, or as a frappe. Sized M for the morning rush or L for the long study session.",
  ar: "الأكثر مبيعًا عندنا، بأربع طرق. السالتد كراميل هو المشروب اللي خلانا معروفين — ملح مالدون فوق دبل شوت، سيرب كراميل بيتنا، يقدّم ساخن، مثلج، مخلوط، أو فرابيه. حجم M للصبح المتسارع أو L لجلسة المذاكرة الطويلة.",
  es: "Nuestro éxito de ventas, de cuatro formas. El Salted Karamel es la bebida que nos puso en el mapa — sal Maldon sobre un doble shot, sirope de karamel de la casa, servido caliente, frío, batido o frappe. Talla M para la prisa de la mañana o L para la sesión larga.",
};

const techStackLine: Record<Locale, string> = {
  en: "Bean: 100% Arabica · Origin: Ethiopia + Brazil blend · Roast: medium-dark, house-roasted Tuesdays · Allergens: contains milk (swap-able) · Vegan with oat milk",
  ar: "الفول: عربيكا ١٠٠٪ · المنشأ: مزيج إثيوبيا + البرازيل · التحميص: متوسط غامق، محمص عندنا كل تلات · الحساسية: يحتوي على حليب (قابل للتبديل) · نباتي مع حليب الشوفان",
  es: "Grano: 100% Arabica · Origen: mezcla Etiopía + Brasil · Tueste: medio-oscuro, tostado los martes · Alérgenos: contiene leche (intercambiable) · Vegano con leche de avena",
};

function buildLongDescription(locale: Locale) {
  const dir = dirFor[locale];
  const features = featuresI18n[locale];

  const headerRow = rowNode([
    cellNode(
      locale === "ar"
        ? "الميزة"
        : locale === "es"
          ? "Característica"
          : "Feature",
      true,
      0,
      colWidth,
      dir,
    ),
    ...Object.keys(featureMatrix).map((label) =>
      cellNode(label, true, 0, colWidth, dir),
    ),
  ]);

  const dataRows = features.map((feature, i) =>
    rowNode([
      cellNode(feature, true, 0, colWidth, dir),
      ...Object.values(featureMatrix).map((flags) =>
        cellNode(check(flags[i] ?? false), false, 0, colWidth, dir),
      ),
    ]),
  );

  return {
    root: {
      children: [
        paragraphNode([textNode(productIntro[locale])], 0, "", dir),
        paragraphNode([textNode(techStackLine[locale])], 0, "", dir),
        {
          children: [headerRow, ...dataRows],
          direction: "ltr" as const,
          format: "" as const,
          indent: 0,
          type: "table" as const,
          version: 1,
          colWidths: Array(5).fill(colWidth),
        },
      ],
      direction: dir,
      format: "" as const,
      indent: 0,
      type: "root" as const,
      version: 1,
    },
  };
}

// ─── Product Definition ─────────────────────────────────

const product = {
  name: "Salted Karamel",
  slug: "salted-karamel",
  category: "software" as const,
  featured: true,
  description: {
    en: "Our top seller. Double shot, house karamel syrup, finished with Maldon sea salt. Hot, iced, blended, or frappe — M or L. Choose your milk.",
    ar: "الأكثر مبيعًا. دبل شوت، سيرب كراميل بيتنا، ولمسة ملح مالدون. ساخن، مثلج، مخلوط، أو فرابيه — M أو L. اختار حليبك.",
    es: "Nuestro top. Doble shot, sirope de karamel de la casa, terminado con sal Maldon. Caliente, frío, batido o frappe — M o L. Elige tu leche.",
  },
  longDescription: {
    en: buildLongDescription("en"),
    ar: buildLongDescription("ar"),
    es: buildLongDescription("es"),
  },
  images: [
    {
      url: "https://images.pexels.com/photos/2074122/pexels-photo-2074122.jpeg?auto=compress&cs=tinysrgb&w=1920",
      alt: {
        en: "Top-down view of a latte with crema and a sprinkle of salt — Koffee Kulture's signature Salted Karamel",
        ar: "لقطة من فوق للسالتد كراميل بكريمته ورشة الملح المميزة لكوفي كلتشر",
        es: "Vista superior de un latte con crema y un toque de sal — el Salted Karamel insignia de Koffee Kulture",
      },
    },
    {
      url: "https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=1920",
      alt: {
        en: "Barista pouring milk to create latte art in a ceramic cup",
        ar: "باريستا يصبّ الحليب يصنع لاتيه آرت في كوب سيراميك",
        es: "Barista vertiendo leche creando latte art en una taza de cerámica",
      },
    },
    {
      url: "https://images.pexels.com/photos/2074130/pexels-photo-2074130.jpeg?auto=compress&cs=tinysrgb&w=1920",
      alt: {
        en: "Iced coffee in a tall glass with ice cubes, perfect for Cairo summers",
        ar: "قهوة مثلجة في كوب طويل بمكعبات الثلج، مناسبة لحرّ كايرو",
        es: "Café helado en un vaso alto con hielo, perfecto para los veranos de El Cairo",
      },
    },
    {
      url: "https://images.pexels.com/photos/1556881/pexels-photo-1556881.jpeg?auto=compress&cs=tinysrgb&w=1920",
      alt: {
        en: "Espresso shot pouring into a small cup with crema forming on top",
        ar: "شوت إسبريسو ينسكب في كوب صغير وتتكوّن الكريما فوقه",
        es: "Shot de espresso vertiéndose en una taza pequeña con crema en la superficie",
      },
    },
    {
      url: "https://images.pexels.com/photos/541218/pexels-photo-541218.jpeg?auto=compress&cs=tinysrgb&w=1920",
      alt: {
        en: "Cappuccino with intricate latte art on a wooden table, ready to drink",
        ar: "كابتشينو بلاتيه آرت معقّد على ترابيزة خشب جاهز للشرب",
        es: "Cappuccino con latte art elaborado en una mesa de madera, listo para beber",
      },
    },
  ],
  variantType: { label: "Style", name: "style" },
  variants: [
    {
      en: "Hot — M",
      ar: "ساخن — M",
      es: "Caliente — M",
      optionLabel: "Hot — M",
      optionValue: "hot-m",
      price: 11000,
    },
    {
      en: "Hot — L",
      ar: "ساخن — L",
      es: "Caliente — L",
      optionLabel: "Hot — L",
      optionValue: "hot-l",
      price: 13500,
    },
    {
      en: "Iced — L",
      ar: "مثلج — L",
      es: "Helado — L",
      optionLabel: "Iced — L",
      optionValue: "iced-l",
      price: 13500,
    },
    {
      en: "Frappe — L",
      ar: "فرابيه — L",
      es: "Frappe — L",
      optionLabel: "Frappe — L",
      optionValue: "frappe-l",
      price: 14500,
    },
  ],
};

export default product;
