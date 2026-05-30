/**
 * Reusable modifier groups for KK menu items.
 *
 * Prices are in qirsh. KK menu shows:
 *   - Extra shot 20 LE
 *   - Plant-based milks 35 LE
 *   - Extra syrup 20 LE
 *   - Extra sauce 20 LE
 */

export interface ModifierOptionSeed {
  readonly label: { en: string; ar: string; es?: string };
  readonly value: string;
  readonly priceDelta: number;
  readonly isDefault?: boolean;
  readonly allergens?: ReadonlyArray<string>;
  readonly sortOrder?: number;
}

export interface ModifierGroupSeed {
  readonly name: { en: string; ar: string; es?: string };
  readonly slug: string;
  readonly minSelectable: number;
  readonly maxSelectable: number;
  readonly options: ReadonlyArray<ModifierOptionSeed>;
}

export const modifierGroupSeeds: ReadonlyArray<ModifierGroupSeed> = [
  {
    name: { en: "Milk Choice", ar: "نوع الحليب" },
    slug: "milk-choice",
    minSelectable: 1,
    maxSelectable: 1,
    options: [
      {
        label: { en: "Whole milk", ar: "حليب كامل الدسم" },
        value: "whole",
        priceDelta: 0,
        isDefault: true,
        allergens: ["vegetarian"],
        sortOrder: 0,
      },
      {
        label: { en: "Oat milk", ar: "حليب الشوفان" },
        value: "oat",
        priceDelta: 3_500,
        allergens: ["vegan", "dairy-free"],
        sortOrder: 10,
      },
      {
        label: { en: "Almond milk", ar: "حليب اللوز" },
        value: "almond",
        priceDelta: 3_500,
        allergens: ["vegan", "dairy-free", "contains-nuts"],
        sortOrder: 20,
      },
      {
        label: { en: "Soy milk", ar: "حليب الصويا" },
        value: "soy",
        priceDelta: 3_500,
        allergens: ["vegan", "dairy-free", "contains-soy"],
        sortOrder: 30,
      },
    ],
  },
  {
    name: { en: "Extras", ar: "إضافات" },
    slug: "kk-extras",
    minSelectable: 0,
    maxSelectable: 4,
    options: [
      {
        label: { en: "Extra shot", ar: "شوت زيادة" },
        value: "extra-shot",
        priceDelta: 2_000,
        sortOrder: 0,
      },
      {
        label: { en: "Extra syrup", ar: "سيرب زيادة" },
        value: "extra-syrup",
        priceDelta: 2_000,
        sortOrder: 10,
      },
      {
        label: { en: "Extra sauce", ar: "صوص زيادة" },
        value: "extra-sauce",
        priceDelta: 2_000,
        sortOrder: 20,
      },
    ],
  },
  {
    name: { en: "Bagel Toast Level", ar: "درجة تحميص البيجل" },
    slug: "bagel-toast",
    minSelectable: 1,
    maxSelectable: 1,
    options: [
      {
        label: { en: "Light", ar: "خفيف" },
        value: "light",
        priceDelta: 0,
        sortOrder: 0,
      },
      {
        label: { en: "Medium", ar: "متوسط" },
        value: "medium",
        priceDelta: 0,
        isDefault: true,
        sortOrder: 10,
      },
      {
        label: { en: "Well done", ar: "محمص" },
        value: "well-done",
        priceDelta: 0,
        sortOrder: 20,
      },
    ],
  },
];
