/**
 * A representative slice of the KK menu. The full menu (50+ items) lands
 * in a follow-up sweep; this slice covers every section and every
 * modifier-group attachment so the customer flow can be exercised
 * end-to-end against seeded data.
 *
 * Prices in qirsh — values mirror the printed menu (e.g., Espresso 50 LE
 * → 5_000). Where the menu has M/L sizes, both are seeded.
 */

export interface MenuItemSeed {
  readonly name: { en: string; ar: string; es?: string };
  readonly slug: string;
  readonly description: { en: string; ar: string; es?: string };
  readonly menuSection: { en: string; ar: string };
  readonly basePriceQirsh: number;
  readonly category:
    | "software"
    | "templates"
    | "courses"
    | "services"
    | "other";
  readonly allergens?: ReadonlyArray<string>;
  readonly sizes?: ReadonlyArray<{
    readonly label: { en: string; ar: string };
    readonly value: string;
    readonly priceQirsh: number;
    readonly isDefault?: boolean;
  }>;
  readonly modifierGroupSlugs: ReadonlyArray<string>;
  readonly prepTimeMinutes: number;
}

export const menuItemSeeds: ReadonlyArray<MenuItemSeed> = [
  // ── Hot Klassiks ────────────────────────────────────────
  {
    name: { en: "Espresso", ar: "إسبريسو" },
    slug: "espresso",
    description: {
      en: "Short, sharp, Italian-style pull. House Arabica blend.",
      ar: "سحبة قصيرة قوية إيطالية الطابع. خلطة عربيكا بيتنا.",
    },
    menuSection: { en: "Hot Klassiks", ar: "كلاسيكس ساخن" },
    basePriceQirsh: 5_000,
    category: "other",
    modifierGroupSlugs: ["kk-extras"],
    prepTimeMinutes: 2,
  },
  {
    name: { en: "Flat White", ar: "فلات وايت" },
    slug: "flat-white",
    description: {
      en: "Velvet microfoam on a double ristretto base.",
      ar: "فوم حليب مخملي على قاعدة ريستريتو دبل.",
    },
    menuSection: { en: "Hot Klassiks", ar: "كلاسيكس ساخن" },
    basePriceQirsh: 7_000,
    category: "other",
    allergens: ["vegetarian"],
    modifierGroupSlugs: ["milk-choice", "kk-extras"],
    prepTimeMinutes: 3,
  },
  {
    name: { en: "Spanish Latte", ar: "سبانيش لاتيه" },
    slug: "spanish-latte",
    description: {
      en: "Sweetened condensed milk meets a double espresso shot.",
      ar: "حليب مكثف محلى يقابل دبل شوت إسبريسو.",
    },
    menuSection: { en: "Hot Klassiks", ar: "كلاسيكس ساخن" },
    basePriceQirsh: 10_000,
    category: "other",
    allergens: ["vegetarian", "contains-eggs"],
    modifierGroupSlugs: ["milk-choice", "kk-extras"],
    prepTimeMinutes: 3,
  },

  // ── Kold Klassiks (sizes M/L) ───────────────────────────
  {
    name: { en: "Iced Latte", ar: "آيس لاتيه" },
    slug: "iced-latte",
    description: {
      en: "Double shot poured over cold milk and ice.",
      ar: "دبل شوت يصب فوق حليب بارد وثلج.",
    },
    menuSection: { en: "Kold Klassiks", ar: "كلاسيكس بارد" },
    basePriceQirsh: 8_000,
    category: "other",
    allergens: ["vegetarian"],
    sizes: [
      {
        label: { en: "M", ar: "M" },
        value: "m",
        priceQirsh: 8_000,
        isDefault: true,
      },
      { label: { en: "L", ar: "L" }, value: "l", priceQirsh: 10_000 },
    ],
    modifierGroupSlugs: ["milk-choice", "kk-extras"],
    prepTimeMinutes: 3,
  },
  {
    name: { en: "Iced Salted Caramel", ar: "آيس سالتد كراميل" },
    slug: "iced-salted-caramel",
    description: {
      en: "Our top seller, iced. Caramel, espresso, sea salt.",
      ar: "الأكثر مبيعًا، مثلج. كراميل، إسبريسو، وملح بحر.",
    },
    menuSection: { en: "Kold Klassiks", ar: "كلاسيكس بارد" },
    basePriceQirsh: 10_000,
    category: "other",
    allergens: ["vegetarian"],
    sizes: [
      {
        label: { en: "M", ar: "M" },
        value: "m",
        priceQirsh: 10_000,
        isDefault: true,
      },
      { label: { en: "L", ar: "L" }, value: "l", priceQirsh: 11_500 },
    ],
    modifierGroupSlugs: ["milk-choice", "kk-extras"],
    prepTimeMinutes: 3,
  },

  // ── Non Koffee ──────────────────────────────────────────
  {
    name: { en: "Caramel Klassic", ar: "كراميل كلاسيك" },
    slug: "caramel-klassic",
    description: {
      en: "Caramel-syrup milkshake, no coffee. Served iced.",
      ar: "ميلكشيك بسيرب الكراميل، بدون قهوة. يقدم مثلج.",
    },
    menuSection: { en: "Non Koffee", ar: "بدون قهوة" },
    basePriceQirsh: 9_000,
    category: "other",
    allergens: ["vegetarian"],
    sizes: [
      {
        label: { en: "M", ar: "M" },
        value: "m",
        priceQirsh: 9_000,
        isDefault: true,
      },
      { label: { en: "L", ar: "L" }, value: "l", priceQirsh: 10_500 },
    ],
    modifierGroupSlugs: ["milk-choice"],
    prepTimeMinutes: 3,
  },

  // ── Bagels Kulture ──────────────────────────────────────
  {
    name: { en: "Salty Truffle Bagel", ar: "بيجل ترافل" },
    slug: "salty-truffle-bagel",
    description: {
      en: "Roast beef with mustard mayo, baby rocca, caramelised onions.",
      ar: "روست بيف مع مايونيز خردل، جرجير صغير، وبصل مكرمل.",
    },
    menuSection: { en: "Bagels Kulture", ar: "بيجلز كلتشر" },
    basePriceQirsh: 23_500,
    category: "other",
    allergens: ["contains-eggs"],
    modifierGroupSlugs: ["bagel-toast"],
    prepTimeMinutes: 8,
  },
  {
    name: { en: "Philly Steak-wich", ar: "فيلي ستيك-ويتش" },
    slug: "philly-steak-wich",
    description: {
      en: "Caramelised beef strips, mushrooms, cheddar in a baguette.",
      ar: "شرايح بيف مكرملة، مشروم، وشيدر في باجيت.",
    },
    menuSection: { en: "Sandwich Kulture", ar: "ساندويتش كلتشر" },
    basePriceQirsh: 27_500,
    category: "other",
    allergens: ["contains-eggs"],
    modifierGroupSlugs: [],
    prepTimeMinutes: 9,
  },

  // ── Salads ──────────────────────────────────────────────
  {
    name: { en: "Mood Boost Salad", ar: "سلطة موود بوست" },
    slug: "mood-boost-salad",
    description: {
      en: "Roast halloum, mixed greens, pomegranate, lemon dressing.",
      ar: "حلوم مشوي، خضار مشكلة، رمان، وصلصة ليمون.",
    },
    menuSection: { en: "Salads", ar: "سلطات" },
    basePriceQirsh: 18_000,
    category: "other",
    allergens: ["vegetarian", "gluten-free"],
    modifierGroupSlugs: [],
    prepTimeMinutes: 6,
  },
  {
    name: { en: "Quinoa Lover", ar: "كينوا لوفر" },
    slug: "quinoa-lover",
    description: {
      en: "Fresh veggies, avocado, beetroot hummus, lemon vinaigrette.",
      ar: "خضار طازج، أفوكادو، حمص بنجر، وصلصة ليمون.",
    },
    menuSection: { en: "Salads", ar: "سلطات" },
    basePriceQirsh: 18_000,
    category: "other",
    allergens: ["vegan", "gluten-free", "dairy-free"],
    modifierGroupSlugs: [],
    prepTimeMinutes: 6,
  },

  // ── Sweet Tooth ─────────────────────────────────────────
  {
    name: { en: "Kult Made Cookies", ar: "كوكيز بيتنا" },
    slug: "kult-made-cookies",
    description: {
      en: "Hand-baked chocolate chip cookies. Three flavours.",
      ar: "كوكيز شوكولاتة مخبوزة عندنا. ثلاث نكهات.",
    },
    menuSection: { en: "Sweet Tooth Kulture", ar: "حلويات كلتشر" },
    basePriceQirsh: 5_000,
    category: "other",
    allergens: ["vegetarian", "contains-eggs", "contains-nuts"],
    modifierGroupSlugs: [],
    prepTimeMinutes: 2,
  },
];
