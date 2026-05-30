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
  en: "Ship your SaaS in days, not months. SaaStarter is a production-grade Next.js starter kit with four tiers designed to match every stage of your project — from polished marketing pages to a full-stack e-commerce platform with Stripe payments, authentication, and a complete admin dashboard.",
  ar: "أطلق مشروع SaaS الخاص بك في أيام وليس أشهر. SaaStarter هو قالب Next.js احترافي جاهز للإنتاج بأربعة مستويات مصممة لتناسب كل مرحلة من مشروعك — من صفحات تسويقية مصقولة إلى منصة تجارة إلكترونية متكاملة مع مدفوعات Stripe والمصادقة ولوحة إدارة شاملة.",
  es: "Lanza tu SaaS en días, no en meses. SaaStarter es un kit de inicio Next.js de nivel producción con cuatro niveles diseñados para cada etapa de tu proyecto — desde páginas de marketing pulidas hasta una plataforma e-commerce completa con pagos Stripe, autenticación y un panel de administración completo.",
};

const techStackLine: Record<Locale, string> = {
  en: "Built with: TypeScript · Next.js · React · Tailwind v4 · ShadCN · Zod · GraphQL · REST API · SQLite · Stripe · Better-Auth · Lenis",
  ar: "مبني بـ: TypeScript · Next.js · React · Tailwind v4 · ShadCN · Zod · GraphQL · REST API · SQLite · Stripe · Better-Auth · Lenis",
  es: "Construido con: TypeScript · Next.js · React · Tailwind v4 · ShadCN · Zod · GraphQL · REST API · SQLite · Stripe · Better-Auth · Lenis",
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
  name: "SaaStarter",
  slug: "saastarter",
  category: "software" as const,
  featured: true,
  description: {
    en: "Production-grade Next.js SaaS starter kit. Four tiers from marketing pages to full-stack e-commerce. TypeScript-first. Ship in days, not months.",
    ar: "قالب SaaS احترافي مبني على Next.js. أربعة مستويات من صفحات التسويق إلى تجارة إلكترونية متكاملة. TypeScript أولاً. أطلق في أيام وليس أشهر.",
    es: "Kit de inicio SaaS de nivel producción con Next.js. Cuatro niveles desde páginas de marketing hasta e-commerce completo. TypeScript-first. Lanza en días, no en meses.",
  },
  longDescription: {
    en: buildLongDescription("en"),
    ar: buildLongDescription("ar"),
    es: buildLongDescription("es"),
  },
  images: [
    {
      url: "https://images.pexels.com/photos/5474295/pexels-photo-5474295.jpeg?auto=compress&cs=tinysrgb&w=1920",
      alt: {
        en: "Close-up of hands coding on a laptop, showcasing software development in action",
        ar: "لقطة مقربة لأيدٍ تكتب كوداً على حاسوب محمول، تُظهر تطوير البرمجيات أثناء العمل",
        es: "Primer plano de manos programando en una laptop, mostrando el desarrollo de software en acción",
      },
    },
    {
      url: "https://images.pexels.com/photos/270373/pexels-photo-270373.jpeg?auto=compress&cs=tinysrgb&w=1920",
      alt: {
        en: "Close-up of colorful code on a laptop screen, showcasing programming concepts",
        ar: "لقطة مقربة لكود ملون على شاشة حاسوب محمول، تعرض مفاهيم البرمجة",
        es: "Primer plano de código colorido en una pantalla de laptop, mostrando conceptos de programación",
      },
    },
    {
      url: "https://images.pexels.com/photos/4164418/pexels-photo-4164418.jpeg?auto=compress&cs=tinysrgb&w=1920",
      alt: {
        en: "Close-up of HTML and JavaScript code on a computer screen in Visual Studio Code",
        ar: "لقطة مقربة لكود HTML و JavaScript على شاشة حاسوب في Visual Studio Code",
        es: "Primer plano de código HTML y JavaScript en una pantalla de computadora en Visual Studio Code",
      },
    },
    {
      url: "https://images.pexels.com/photos/34212896/pexels-photo-34212896.jpeg?auto=compress&cs=tinysrgb&w=1920",
      alt: {
        en: "A vibrant workspace showing computer monitors with code, keyboard, and tech accessories",
        ar: "مساحة عمل نابضة بالحياة تعرض شاشات حاسوب بالكود ولوحة مفاتيح وملحقات تقنية",
        es: "Un espacio de trabajo vibrante mostrando monitores con código, teclado y accesorios tecnológicos",
      },
    },
    {
      url: "https://images.pexels.com/photos/574069/pexels-photo-574069.jpeg?auto=compress&cs=tinysrgb&w=1920",
      alt: {
        en: "Close-up of a person coding on a laptop, showcasing web development and programming",
        ar: "لقطة مقربة لشخص يكتب كوداً على حاسوب محمول، تُظهر تطوير الويب والبرمجة",
        es: "Primer plano de una persona programando en una laptop, mostrando desarrollo web y programación",
      },
    },
  ],
  variantType: { label: "Tier", name: "tier" },
  variants: [
    {
      en: "Frontend LITE",
      ar: "الواجهة الأمامية LITE",
      es: "Frontend LITE",
      optionLabel: "Frontend LITE",
      optionValue: "frontend-lite",
      price: 2900,
    },
    {
      en: "Frontend PRO",
      ar: "الواجهة الأمامية PRO",
      es: "Frontend PRO",
      optionLabel: "Frontend PRO",
      optionValue: "frontend-pro",
      price: 9900,
    },
    {
      en: "Frontend + Backend LITE",
      ar: "واجهة + خلفية LITE",
      es: "Frontend + Backend LITE",
      optionLabel: "Frontend + Backend LITE",
      optionValue: "frontend-backend-lite",
      price: 19900,
    },
    {
      en: "Frontend + Backend PRO",
      ar: "واجهة + خلفية PRO",
      es: "Frontend + Backend PRO",
      optionLabel: "Frontend + Backend PRO",
      optionValue: "frontend-backend-pro",
      price: 29900,
    },
  ],
};

export default product;
